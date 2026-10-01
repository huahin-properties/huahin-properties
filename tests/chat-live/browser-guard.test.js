// CHAT-LIVE-01 — real-Chromium test of the test-site guard. No credentials, no
// emulator, no real Firebase: every non-loopback request is intercepted and
// recorded (Firebase SDK / React / Babel are served from local copies; all
// else is aborted). Proves the guard stops BEFORE support.js/Firebase load and
// that the built page never contacts a production host. NOT a real-AI or
// real-Firestore test; the SDK copy is firebase@10.14.1 from node_modules,
// production pins 10.12.2 (limit recorded).
"use strict";
const assert = require("assert");
const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const { build } = require("../../tools/build-chat-live");

const ROOT = path.resolve(__dirname, "..", "..");
const VENDOR = process.env.CHAT_LIVE_VENDOR || "";
let chromium = null;
for (const m of ["playwright", "/opt/node22/lib/node_modules/playwright"]) { try { chromium = require(m).chromium; break; } catch (e) {} }
const OK = {
  projectId: "huahin-chat-test-fake1", apiKey: "FAKE-WEB-KEY-NOT-REAL", appId: "1:111111111111:web:fakefakefake",
  messagingSenderId: "111111111111", authDomain: "huahin-chat-test-fake1.firebaseapp.com",
  storageBucket: "huahin-chat-test-fake1.firebasestorage.app", region: "asia-southeast1",
  claudeCompleteUrl: "https://claudecomplete-fakefake-as.a.run.app",
};
const PROD = /5f1b5|auth\.huahin\.properties|claudecomplete-3j4ldf4pja|(^|\.)huahin\.properties$/;
const MIME = { ".html": "text/html", ".js": "application/javascript", ".png": "image/png", ".json": "application/json" };

function serve(dir) {
  return new Promise((resolve) => {
    const hits = [];
    const s = http.createServer((req, res) => {
      const u = decodeURIComponent(req.url.split("?")[0]); hits.push(u);
      const f = path.join(dir, u === "/" ? "index.html" : u);
      if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.statusCode = 404; return res.end("nf"); }
      res.setHeader("content-type", MIME[path.extname(f)] || "text/html"); res.end(fs.readFileSync(f));
    }).listen(0, "127.0.0.1", () => resolve({ s, port: s.address().port, hits }));
  });
}
function vendorFor(url) {
  const g = url.match(/gstatic\.com\/firebasejs\/[\d.]+\/(firebase-[a-z-]+-compat\.js)/);
  if (g) return path.join(ROOT, "node_modules", "firebase", g[1]);
  if (/unpkg\.com\/react@18/.test(url)) return path.join(VENDOR, "node_modules/react/umd/react.production.min.js");
  if (/unpkg\.com\/react-dom@18/.test(url)) return path.join(VENDOR, "node_modules/react-dom/umd/react-dom.production.min.js");
  if (/unpkg\.com\/@babel\/standalone/.test(url)) return path.join(VENDOR, "node_modules/@babel/standalone/babel.min.js");
  return null;
}
async function open(browser, dir, urlHost) {
  const { s, port, hits } = await serve(dir);
  const ctx = await browser.newContext();
  const external = []; // every non-loopback request attempted: {host, url, served}
  await ctx.route("**/*", (route) => {
    const u = new URL(route.request().url());
    if (u.hostname === "127.0.0.1" || (urlHost && u.hostname === urlHost)) return route.continue();
    const v = vendorFor(u.href);
    external.push({ host: u.hostname, url: u.href, served: !!(v && fs.existsSync(v)) });
    if (v && fs.existsSync(v)) return route.fulfill({ status: 200, contentType: "application/javascript", body: fs.readFileSync(v) });
    return route.abort();
  });
  const page = await ctx.newPage();
  return { page, ctx, s, port, hits, external };
}

describe("CHAT-LIVE-01 test-site guard (real Chromium, all external hosts intercepted)", function () {
  this.timeout(120000);
  let browser, outOk;
  before(async function () {
    if (!chromium) { this.skip(); }
    if (!VENDOR || !fs.existsSync(path.join(VENDOR, "node_modules/react"))) { this.skip(); }
    outOk = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "chatlive-b-")), "o"); build(OK, outOk);
    browser = await chromium.launch({ args: ["--host-resolver-rules=MAP huahin-chat-test-fake1.web.app 127.0.0.1, MAP not-allowed.test 127.0.0.1"] });
  });
  after(async () => { if (browser) await browser.close(); });

  function variant(mutate) {
    const d = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "chatlive-v-")), "o");
    fs.cpSync(outOk, d, { recursive: true }); mutate(d); return d;
  }
  const setCfg = (d, fn) => { const p = path.join(d, "chat-live-config.js"); const c = JSON.parse(fs.readFileSync(p, "utf8").replace(/^window\.__CHAT_LIVE__ = /, "").replace(/;\s*$/, "")); fn(c); fs.writeFileSync(p, "window.__CHAT_LIVE__ = " + JSON.stringify(c) + ";"); };

  async function expectStopped(dir, label, urlHost) {
    const t = await open(browser, dir, urlHost);
    try {
      await t.page.goto("http://" + (urlHost || "127.0.0.1") + ":" + t.port + "/", { waitUntil: "load" });
      await t.page.waitForTimeout(1500);
      const r = await t.page.evaluate(() => ({ blocked: window.__CHAT_LIVE_BLOCKED__ || null, banner: !!document.querySelector("[data-chat-live-stop]"), fb: !!(window.firebase && window.firebase.apps && window.firebase.apps.length), support: !!window.__DC_RUNTIME__ }));
      assert.ok(r.blocked, label + ": guard must set the block reason"); assert.ok(r.banner, label + ": red stop banner shown"); assert.strictEqual(r.fb, false, label + ": Firebase must not start");
      assert.deepStrictEqual(t.external, [], label + ": NO external request at all (SDK/React/Babel never loaded)");
      assert.ok(!t.hits.includes("/support.js"), label + ": support.js never requested");
      return r.blocked;
    } finally { await t.ctx.close(); t.s.close(); }
  }

  it("P1 happy path: guard passes, Firebase starts on the TEST project, no request names a production host", async () => {
    const t = await open(browser, outOk);
    try {
      await t.page.goto("http://127.0.0.1:" + t.port + "/", { waitUntil: "load" });
      await t.page.waitForFunction(() => { try { return !!window.firebase.app().options.projectId; } catch (e) { return false; } }, null, { timeout: 40000 });
      const r = await t.page.evaluate(() => ({ pid: window.firebase.app().options.projectId, auth: window.firebase.app().options.authDomain, blocked: window.__CHAT_LIVE_BLOCKED__ || null, bar: (document.getElementById("chat-live-bar") || {}).textContent || "" }));
      assert.strictEqual(r.blocked, null); assert.strictEqual(r.pid, "huahin-chat-test-fake1"); assert.strictEqual(r.auth, "huahin-chat-test-fake1.firebaseapp.com");
      assert.match(r.bar, /TEST/);
      await t.page.waitForTimeout(3000);
      const prodHits = t.external.filter((e) => PROD.test(e.host) || PROD.test(e.url));
      assert.deepStrictEqual(prodHits, [], "no attempted request to a production host/URL");
      assert.ok(t.external.length > 0, "sanity: external attempts are being recorded");
      const sdk = t.external.filter((e) => /firebasejs/.test(e.url)).map((e) => e.url.split("/").pop());
      assert.deepStrictEqual(sdk, [...new Set(sdk)], "each Firebase SDK file is loaded once (a double load wipes the app)");
      assert.ok(t.hits.includes("/image-slot.js"), "helmet-managed local script still loads");
      console.log("      external hosts attempted:", [...new Set(t.external.map((e) => e.host + (e.served ? "(local copy)" : "(aborted)")))].join(", "));
    } finally { await t.ctx.close(); t.s.close(); }
  });

  it("P2a stop: config script empty", async () => { assert.strictEqual(await expectStopped(variant((d) => fs.writeFileSync(path.join(d, "chat-live-config.js"), "window.__CHAT_LIVE__ = {};")), "empty"), "missing:projectId"); });
  it("P2b stop: config script missing (404)", async () => { assert.strictEqual(await expectStopped(variant((d) => fs.rmSync(path.join(d, "chat-live-config.js"))), "no-config-file"), "no-config"); });
  it("P2c stop: one field missing (claudeCompleteUrl)", async () => { assert.strictEqual(await expectStopped(variant((d) => setCfg(d, (c) => { delete c.claudeCompleteUrl; })), "missing-field"), "missing:claudeCompleteUrl"); });
  it("P2d stop: production project id in config", async () => { assert.strictEqual(await expectStopped(variant((d) => setCfg(d, (c) => { c.projectId = "huahin-properties-5f1b5"; })), "prod-id"), "production-value-in-config"); });
  it("P2e stop: production claudeComplete URL in config", async () => { assert.strictEqual(await expectStopped(variant((d) => setCfg(d, (c) => { c.claudeCompleteUrl = "https://claudecomplete-3j4ldf4pja-as.a.run.app"; })), "prod-url"), "production-value-in-config"); });
  it("P2f stop: opened from a host that is not on the allow-list", async () => { assert.strictEqual(await expectStopped(outOk, "wrong-host", "not-allowed.test"), "host-not-allowed"); });

  it("P3 allowed hostname (<project>.web.app) passes the guard", async () => {
    const t = await open(browser, outOk, "huahin-chat-test-fake1.web.app");
    try {
      await t.page.goto("http://huahin-chat-test-fake1.web.app:" + t.port + "/", { waitUntil: "load" });
      await t.page.waitForTimeout(1500);
      assert.strictEqual(await t.page.evaluate(() => window.__CHAT_LIVE_BLOCKED__ || null), null);
    } finally { await t.ctx.close(); t.s.close(); }
  });

  it("P4 runtime filter: fetch/XHR to a production URL is refused in the page and never leaves the browser", async () => {
    const t = await open(browser, outOk);
    try {
      await t.page.goto("http://127.0.0.1:" + t.port + "/", { waitUntil: "load" });
      const before = t.external.length;
      const r = await t.page.evaluate(async () => {
        const out = {};
        try { await fetch("https://claudecomplete-3j4ldf4pja-as.a.run.app", { method: "POST" }); out.fetch = "sent"; } catch (e) { out.fetch = String(e.message); }
        try { const x = new XMLHttpRequest(); x.open("GET", "https://asia-southeast1-huahin-properties-5f1b5.cloudfunctions.net/x"); out.xhr = "sent"; } catch (e) { out.xhr = String(e.message); }
        return out;
      });
      assert.match(r.fetch, /blocked production URL/); assert.match(r.xhr, /blocked production URL/);
      assert.deepStrictEqual(t.external.slice(before).filter((e) => PROD.test(e.url)), []);
    } finally { await t.ctx.close(); t.s.close(); }
  });

  it("P5 NEGATIVE CONTROL: the unmodified production index.html (no guard) starts Firebase on the PRODUCTION project", async () => {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), "chatlive-n-"));
    for (const f of require("../../tools/build-chat-live").FILES) fs.copyFileSync(path.join(ROOT, f), path.join(d, f));
    const t = await open(browser, d);
    try {
      await t.page.goto("http://127.0.0.1:" + t.port + "/", { waitUntil: "load" });
      // The unguarded page can load the SDK twice and momentarily drop the app; record the first project id it ever shows.
      await t.page.waitForFunction(() => { try { window.__seenPid = window.__seenPid || window.firebase.app().options.projectId; } catch (e) {} return !!window.__seenPid; }, null, { timeout: 40000 });
      assert.strictEqual(await t.page.evaluate(() => window.__seenPid), "huahin-properties-5f1b5");
    } finally { await t.ctx.close(); t.s.close(); }
  });
});
