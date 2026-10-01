// CHAT-LIVE-01 — build-script tests. No credentials, no network, no emulator.
// Config values are obviously synthetic. Negative controls prove the build
// refuses (fail closed) instead of producing a page that could reach production.
"use strict";
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync, spawnSync } = require("child_process");
const { build, FILES } = require("../../tools/build-chat-live");

const ROOT = path.resolve(__dirname, "..", "..");
const SCRIPT = path.join(ROOT, "tools", "build-chat-live.js");
const OK = {
  projectId: "huahin-chat-test-fake1", apiKey: "FAKE-WEB-KEY-NOT-REAL", appId: "1:111111111111:web:fakefakefake",
  messagingSenderId: "111111111111", authDomain: "huahin-chat-test-fake1.firebaseapp.com",
  storageBucket: "huahin-chat-test-fake1.firebasestorage.app", region: "asia-southeast1",
  claudeCompleteUrl: "https://claudecomplete-fakefake-as.a.run.app",
};
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "chatlive-"));
function cli(cfg) {
  const d = tmp(); const cf = path.join(d, "c.json"); const out = path.join(d, "out");
  fs.writeFileSync(cf, JSON.stringify(cfg));
  const r = spawnSync("node", [SCRIPT, "--config", cf, "--out", out], { encoding: "utf8" });
  return { r, out, exists: fs.existsSync(out) };
}
function copyRoot(mut) {
  const d = tmp();
  for (const f of FILES) fs.copyFileSync(path.join(ROOT, f), path.join(d, f));
  if (mut) mut(d);
  return d;
}

describe("CHAT-LIVE-01 build script (no credentials)", function () {
  it("B1 the shipped example config (REPLACE_ME) is refused and writes nothing", () => {
    const d = tmp(); const out = path.join(d, "o");
    const r = spawnSync("node", [SCRIPT, "--config", path.join(ROOT, "tools/chat-live.config.example.json"), "--out", out], { encoding: "utf8" });
    assert.notStrictEqual(r.status, 0); assert.match(r.stderr, /BUILD REFUSED/); assert.ok(!fs.existsSync(out));
  });

  for (const k of ["projectId", "apiKey", "appId", "messagingSenderId", "authDomain", "storageBucket", "region", "claudeCompleteUrl"]) {
    it("B2 missing/empty " + k + " is refused, nothing written", () => {
      const a = cli({ ...OK, [k]: undefined }); const b = cli({ ...OK, [k]: "" });
      for (const x of [a, b]) { assert.notStrictEqual(x.r.status, 0); assert.ok(!x.exists); }
    });
  }

  it("B3 production values in any field are refused", () => {
    const cases = [
      { projectId: "huahin-properties-5f1b5" },
      { apiKey: "AIza-5f1b5-looks-like-prod" },
      { authDomain: "auth.huahin.properties" },
      { claudeCompleteUrl: "https://claudecomplete-3j4ldf4pja-as.a.run.app" },
      { storageBucket: "huahin-properties-5f1b5.firebasestorage.app" },
    ];
    for (const c of cases) { const x = cli({ ...OK, ...c }); assert.notStrictEqual(x.r.status, 0, JSON.stringify(c)); assert.ok(!x.exists); }
  });

  it("B4 naming/shape rules: no 'test' in id, mismatched authDomain/bucket, wrong region, non-https URL", () => {
    const cases = [{ projectId: "some-real-looking-id", authDomain: "some-real-looking-id.firebaseapp.com", storageBucket: "some-real-looking-id.firebasestorage.app" },
      { authDomain: "other-project.firebaseapp.com" }, { storageBucket: "other.firebasestorage.app" },
      { region: "us-central1" }, { claudeCompleteUrl: "http://claudecomplete-fakefake-as.a.run.app" }, { claudeCompleteUrl: "https://evil.example.com/x" }];
    for (const c of cases) { const x = cli({ ...OK, ...c }); assert.notStrictEqual(x.r.status, 0, JSON.stringify(c)); assert.ok(!x.exists); }
  });

  it("B5 valid synthetic config builds; output carries the test project everywhere and no production string", () => {
    const out = path.join(tmp(), "o"); const m = build(OK, out);
    assert.strictEqual(Object.keys(m).length, FILES.length + 3); // + config.js, guard.js, firebase.json
    const bad = [/5f1b5/i, /auth\.huahin\.properties/i, /claudecomplete-3j4ldf4pja/i, /https?:\/\/([a-z0-9-]+\.)*huahin\.properties/i,
      /line\.me\/(R\/)?ti\/p\//i, /lin\.ee\//i, /mailto:/i, /0851785480|0805820777|doothailand/i, /(^|[^_a-zA-Z])password:\s*"(?!SYNTHETIC)/];
    for (const f of fs.readdirSync(out)) {
      if (f.endsWith(".png") || f === "chat-live-guard.js") continue;
      const t = fs.readFileSync(path.join(out, f), "utf8");
      for (const re of bad) assert.ok(!re.test(t), f + " still matches " + re);
    }
    const fc = fs.readFileSync(path.join(out, "firebase-client.js"), "utf8");
    assert.ok(fc.includes('"projectId": "huahin-chat-test-fake1"'));
    assert.ok(fc.includes("asia-southeast1-huahin-chat-test-fake1.cloudfunctions.net"));
    const cr = fs.readFileSync(path.join(out, "ContactRail.dc.html"), "utf8");
    assert.ok(cr.includes("https://claudecomplete-fakefake-as.a.run.app"));
    assert.ok(cr.includes('"authorization": "Bearer " + __tok'), "fallback fetch must send the Firebase ID token in the test build");
    const ix = fs.readFileSync(path.join(out, "index.html"), "utf8");
    assert.ok(/name="robots" content="noindex,nofollow"/.test(ix));
    assert.ok(ix.indexOf("chat-live-guard.js") < ix.indexOf("firebase-app-compat"), "guard script is first");
    assert.ok(!/<script src="\.\/support\.js">/.test(ix), "support.js is not loaded directly: only the guard may load it");
    const bodyStart = ix.indexOf("<body>"), tpl = ix.indexOf('<template id="chat-live-app">'), tplEnd = ix.lastIndexOf("</template>");
    assert.ok(tpl > bodyStart && tpl - bodyStart < 10 && tplEnd > tpl, "whole body is inside the inert template");
    assert.ok(ix.indexOf("firebase-app-compat") > tpl && ix.indexOf("firebase-app-compat") < tplEnd, "SDK script tags are inside the inert template (not fetched before the guard passes)");
  });

  it("B6 production source files are byte-identical to the commit this work started from (build never edits them)", () => {
    build(OK, path.join(tmp(), "o"));
    for (const base of ["8c549c6", "HEAD"]) {
      const r = spawnSync("git", ["diff", "--quiet", base, "--", ...FILES], { cwd: ROOT });
      assert.strictEqual(r.status, 0, "production file differs from " + base);
    }
    const st = execFileSync("git", ["status", "--porcelain", "--", ...FILES], { cwd: ROOT, encoding: "utf8" });
    assert.strictEqual(st.trim(), "");
  });

  it("B7 negative control: if a patch target disappears from the source, the build refuses (no silent half-patch)", () => {
    const targets = [["ContactRail.dc.html", 'headers: { "content-type": "application/json" },'], ["index.html", 'const email = "doothailand@gmail.com";'],
      ["firebase-client.js", "const DEFAULT_ADMIN_CREDENTIALS"], ["index.html", '<script src="./support.js"></script>']];
    for (const [f, needle] of targets) {
      const d = copyRoot((dir) => { const p = path.join(dir, f); fs.writeFileSync(p, fs.readFileSync(p, "utf8").split(needle).join("/*gone*/")); });
      assert.throws(() => build(OK, path.join(tmp(), "o"), d), /not found|refused/, f + " :: " + needle);
    }
  });

  it("B8 negative control: a production URL / contact channel left in a shipped file makes the final scan refuse", () => {
    for (const planted of ["https://huahin.properties/x", "https://asia-southeast1-huahin-properties-5f1b5.cloudfunctions.net/x", "mailto:a@b.c", "https://lin.ee/abc"]) {
      const d = copyRoot((dir) => { fs.appendFileSync(path.join(dir, "data.js"), "\n// " + planted + "\n"); });
      const out = path.join(tmp(), "o");
      assert.throws(() => build(OK, out, d), /left in output/, planted);
      assert.ok(!fs.existsSync(out));
    }
  });
});
