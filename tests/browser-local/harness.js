// BROWSER-LOCAL-01 harness — renders the BUILT listing TEST site in real Chromium with the real DC runtime (support.js) and the PINNED Firebase SDK (10.12.2),
// against LOCAL emulators (Firestore, Auth, Storage and the real Cloud Functions code). Synthetic data only. No production host, no real AI, no real Firebase project:
// every request that is not loopback is intercepted (CDN libraries are served from ./.browser-vendor, everything else is blocked and recorded).
// Evidence class: "LOCAL BROWSER + LOCAL EMULATORS" — it is NOT evidence from a real TEST project (Staff/agent Storage cross-service membership is a known emulator limit).
"use strict";
const fs = require("fs");
const http = require("http");
const path = require("path");
const zlib = require("zlib");
const { build } = require("../../tools/build-listing-test");

const ROOT = path.resolve(__dirname, "..", "..");
const VENDOR = process.env.BROWSER_LOCAL_VENDOR || path.join(ROOT, ".browser-vendor");
const SHOTS = process.env.BROWSER_LOCAL_SHOTS || path.join(ROOT, "docs", "listing-e2e", "browser-local");
const PROJECT = "huahin-listing-test-bl1";
const CFG = { projectId: PROJECT, apiKey: "LOCAL-FAKE-KEY-NOT-REAL", appId: "1:111111111111:web:localfakefake", messagingSenderId: "111111111111", authDomain: PROJECT + ".firebaseapp.com", storageBucket: PROJECT + ".appspot.com", region: "asia-southeast1" };
const PROD = /5f1b5|auth\.huahin\.properties|claudecomplete-3j4ldf4pja|(^|\.)huahin\.properties$|anthropic\.com/i;
const OWNER_UID = "n7TZKSBscPXE1kRU8WzYpsqJh2g2";

let chromium = null;
for (const m of ["playwright", "/opt/node22/lib/node_modules/playwright"]) { try { chromium = require(m).chromium; break; } catch (e) { /* next */ } }

const hostPort = (v, d) => { const m = /^(.*):(\d+)$/.exec(v || d); return { host: m[1], port: Number(m[2]) }; };
function emulators() {
  const fs_ = hostPort(process.env.FIRESTORE_EMULATOR_HOST), st = hostPort(process.env.FIREBASE_STORAGE_EMULATOR_HOST), au = hostPort(process.env.FIREBASE_AUTH_EMULATOR_HOST);
  for (const x of [fs_, st, au]) if (!/^(127\.0\.0\.1|localhost)$/.test(x.host)) throw new Error("browser-local refuses to run: emulator host is not loopback: " + x.host);
  return { auth: "http://" + au.host + ":" + au.port, fsHost: fs_.host, fsPort: fs_.port, stHost: st.host, stPort: st.port, fnHost: "127.0.0.1", fnPort: Number(process.env.BROWSER_LOCAL_FUNCTIONS_PORT || 5601) };
}

// ── the static server for the BUILT site: the only edit is the local-emulator wiring in firebase-client.js (clearly local; the built file on disk is untouched) ──
const MIME = { ".html": "text/html; charset=utf-8", ".js": "application/javascript", ".png": "image/png", ".json": "application/json" };
function wireEmulators(src) {
  const pre = `const __localEmu = () => window.__LOCAL_EMU__;
// The compat SDK adds auth()/firestore()/storage() to the app lazily (each <script> loads on its own), so the emulator is attached the first time each
// service is REQUESTED — before anything uses it — never at init time.
function __localInit(cfg) {
  const a = window.firebase.initializeApp(cfg); const E = __localEmu();
  if (E) {
    const attach = { auth: (s) => s.useEmulator(E.auth), firestore: (s) => s.useEmulator(E.fsHost, E.fsPort), storage: (s) => s.useEmulator(E.stHost, E.stPort) };
    Object.keys(attach).forEach((k) => Object.defineProperty(a, k, { configurable: true, get() { const orig = Object.getPrototypeOf(a)[k]; if (typeof orig !== "function") return undefined; return function () { const s = orig.apply(a, arguments); if (!s.__emu) { attach[k](s); s.__emu = true; } return s; }; } }));
  }
  return a;
}
function __localFns(f) { const E = __localEmu(); if (E && !f.__emu) { f.useEmulator(E.fnHost, E.fnPort); f.__emu = true; } return f; }
`;
  let out = src.replace("if (window.firebase && !window.firebase.apps.length) window.firebase.initializeApp(firebaseConfig);", "if (window.firebase && !window.firebase.apps.length) __localInit(firebaseConfig);");
  out = out.replace(": window.firebase.initializeApp(firebaseConfig);", ": __localInit(firebaseConfig);");
  out = out.replace('return getApp().functions("asia-southeast1");', 'return __localFns(getApp().functions("asia-southeast1"));');
  if (out === src || !/__localInit\(firebaseConfig\)/.test(out) || !/__localFns\(/.test(out)) throw new Error("emulator wiring patch targets not found in the built firebase-client.js");
  return pre + out;
}
function startSite(outName) {
  const dir = path.join(ROOT, "build", outName || "browser-local-site");
  build(CFG, dir);
  return new Promise((resolve) => {
    const hits = [];
    const server = http.createServer((req, res) => {
      const u = decodeURIComponent(req.url.split("?")[0]); hits.push({ url: u, status: 0 });
      const f = path.join(dir, u === "/" ? "index.html" : u);
      if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { hits[hits.length - 1].status = 404; res.statusCode = 404; return res.end("not found"); }
      let body = fs.readFileSync(f);
      if (u === "/firebase-client.js") body = Buffer.from(wireEmulators(body.toString("utf8")));
      hits[hits.length - 1].status = 200;
      res.setHeader("content-type", MIME[path.extname(f)] || "text/html"); res.end(body);
    }).listen(0, "127.0.0.1", () => resolve({ dir, url: "http://127.0.0.1:" + server.address().port, hits, close: () => new Promise((r) => server.close(r)) }));
  });
}

// ── request policy ──────────────────────────────────────────────────────
function vendorFor(url) {
  const g = url.match(/gstatic\.com\/firebasejs\/([\d.]+)\/(firebase-[a-z-]+-compat\.js)/);
  if (g) return { file: path.join(VENDOR, "firebase", g[2]), note: "firebase " + g[1] };
  if (/unpkg\.com\/react@18/.test(url)) return { file: path.join(VENDOR, "react.production.min.js") };
  if (/unpkg\.com\/react-dom@18/.test(url)) return { file: path.join(VENDOR, "react-dom.production.min.js") };
  if (/unpkg\.com\/@babel\/standalone/.test(url)) return { file: path.join(VENDOR, "babel.min.js") };
  return null;
}
async function newContext(browser, site, opts) {
  const E = emulators();
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 1180, height: 860 } }, opts || {}));
  await ctx.addInitScript((e) => { window.__LOCAL_EMU__ = e; }, E);
  const log = { mapped: [], external: [], prodHits: [], vendor: [], fonts: [], local: [] };
  ctx.__log = log;
  await ctx.route("**/*", async (route) => {
    const url = route.request().url();
    let host = ""; try { host = new URL(url).hostname; } catch (e) { /* data:, blob: */ }
    if (/^(data|blob|about):/.test(url) || !host || host === "127.0.0.1" || host === "localhost") { log.local.push(url); return route.continue(); }
    // NO mapping for firebasestorage.googleapis.com any more: a page that requests a private photo from the Storage REST host directly is blocked here (it is a
    // cross-origin request that real browsers refuse without a bucket CORS policy — seen on the TEST project). Private photos must come through getCasePhoto.
    if (PROD.test(url) || PROD.test(host)) log.prodHits.push(url);
    const v = vendorFor(url);
    // fault injection for the first-load tests: ctx.__fault = { delayMs, failFirebase } applies to the Firebase SDK scripts only
    if (v && /firebase-/.test(v.file) && ctx.__fault) {
      if (ctx.__fault.failFirebase) { log.vendor.push({ url, note: "FAILED (injected)" }); return route.abort("failed"); }
      if (ctx.__fault.delayMs) await new Promise((r) => setTimeout(r, ctx.__fault.delayMs));
    }
    if (v && fs.existsSync(v.file)) { log.vendor.push({ url, note: v.note || "" }); return route.fulfill({ status: 200, contentType: "application/javascript", headers: { "access-control-allow-origin": "*" }, body: fs.readFileSync(v.file) }); }
    if (/fonts\.(googleapis|gstatic)\.com/.test(host)) { log.fonts.push(url); return route.fulfill({ status: 200, contentType: "text/css", body: "/* local test: fonts blocked */" }); }
    log.external.push(url); return route.abort("blockedbyclient");
  });
  return ctx;
}
// every page collects console errors, page errors, failed requests and HTTP >= 400 responses
function watch(page, name) {
  const L = { name, console: [], pageerrors: [], failed: [], bad: [], images: [], storage: [], photoCalls: [], navs: [] };
  page.on("framenavigated", (f) => { if (f === page.mainFrame()) L.navs.push(f.url()); });
  page.__logs = L;
  page.on("console", (m) => { if (["error", "warning"].includes(m.type())) L.console.push(m.type() + ": " + m.text().slice(0, 300)); });
  page.on("pageerror", (e) => L.pageerrors.push(String(e && e.message || e).slice(0, 300)));
  page.on("requestfailed", (r) => L.failed.push(r.method() + " " + r.url().slice(0, 160) + " :: " + (r.failure() && r.failure().errorText)));
  page.on("response", (r) => { const s = r.status(); if (/\/getCasePhoto$/.test(r.url().split("?")[0]) && r.request().method() === "POST") L.photoCalls.push({ status: s });
    if (/firebasestorage\.googleapis\.com\/v0\/b\//.test(r.url())) L.storage.push({ status: s, url: r.url(), kind: r.request().resourceType() }); const u = r.url(); if (s >= 400) L.bad.push(s + " " + r.request().method() + " " + u.slice(0, 160)); if (r.request().resourceType() === "image") L.images.push({ url: u.slice(0, 140), status: s }); });
  return L;
}

// ── synthetic images (valid PNGs, no dependencies) ──────────────────────────
const crcT = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(type, data) { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); }
function png(seed, w, h) {
  w = w || 320; h = h || 240;
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 3 + 1)] = 0; for (let x = 0; x < w; x++) { const o = y * (w * 3 + 1) + 1 + x * 3; raw[o] = (seed * 67 + x) % 256; raw[o + 1] = (seed * 131 + y) % 256; raw[o + 2] = (seed * 29 + ((x + y) >> 1)) % 256; } }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}
const files = (n, from) => Array.from({ length: n }, (_, i) => ({ name: "photo-" + (i + (from || 0)) + ".png", mimeType: "image/png", buffer: png(i + (from || 0) + 1) }));

async function launch() {
  if (!chromium) throw new Error("playwright not found (install it or set NODE_PATH)");
  return chromium.launch({ args: ["--no-sandbox"] });
}
async function shot(page, name) {
  fs.mkdirSync(SHOTS, { recursive: true });
  const f = path.join(SHOTS, name + ".png"); await page.screenshot({ path: f, fullPage: false }); return f;
}

module.exports = { ROOT, SHOTS, CFG, PROJECT, OWNER_UID, emulators, startSite, newContext, watch, launch, shot, png, files, wireEmulators, PROD };
