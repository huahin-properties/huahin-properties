// CHAT-LIVE-01 — build-script tests. No credentials, no network, no emulator.
// Config values are obviously synthetic. Negative controls prove the build
// refuses (fail closed) instead of producing a page that could reach production.
"use strict";
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync, spawnSync } = require("child_process");
const { build: rawBuild, FILES, claudeCompleteUrlFor, MARKER } = require("../../tools/build-chat-live");
const TMPBASE = [os.tmpdir()];
const build = (cfg, out, root) => rawBuild(cfg, out, root, { outputBases: TMPBASE });

const ROOT = path.resolve(__dirname, "..", "..");
const SCRIPT = path.join(ROOT, "tools", "build-chat-live.js");
const OK = {
  projectId: "huahin-chat-test-fake1", apiKey: "FAKE-WEB-KEY-NOT-REAL", appId: "1:111111111111:web:fakefakefake",
  messagingSenderId: "111111111111", authDomain: "huahin-chat-test-fake1.firebaseapp.com",
  storageBucket: "huahin-chat-test-fake1.firebasestorage.app", region: "asia-southeast1",
  claudeCompleteUrl: "https://asia-southeast1-huahin-chat-test-fake1.cloudfunctions.net/claudeComplete",
};
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "chatlive-"));
const BUILD_DIR = path.join(ROOT, "build");
const cliOuts = [];
function cli(cfg, outOverride) {
  const d = tmp(); const cf = path.join(d, "c.json");
  const out = outOverride || path.join(BUILD_DIR, "t-" + path.basename(d)); if (!outOverride) cliOuts.push(out);
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
  after(() => { for (const o of cliOuts) fs.rmSync(o, { recursive: true, force: true }); try { fs.rmdirSync(BUILD_DIR); } catch (e) {} });
  it("B1 the shipped example config (REPLACE_ME) is refused and writes nothing", () => {
    const out = path.join(BUILD_DIR, "t-example-" + process.pid); cliOuts.push(out);
    const r = spawnSync("node", [SCRIPT, "--config", path.join(ROOT, "tools/chat-live.config.example.json"), "--out", out], { encoding: "utf8" });
    assert.notStrictEqual(r.status, 0); assert.match(r.stderr, /BUILD REFUSED/); assert.ok(!fs.existsSync(out));
  });

  for (const k of ["projectId", "apiKey", "appId", "messagingSenderId", "authDomain", "storageBucket", "region"]) {
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
      { claudeCompleteUrl: "https://asia-southeast1-huahin-properties-5f1b5.cloudfunctions.net/claudeComplete" },
      { storageBucket: "huahin-properties-5f1b5.firebasestorage.app" },
    ];
    for (const c of cases) { const x = cli({ ...OK, ...c }); assert.notStrictEqual(x.r.status, 0, JSON.stringify(c)); assert.ok(!x.exists); }
  });

  it("B4 naming/shape rules: no 'test' in id, mismatched authDomain/bucket, wrong region, non-https URL", () => {
    const OTHER = "https://asia-southeast1-another-project-test.cloudfunctions.net/claudeComplete";
    const cases = [{ projectId: "some-real-looking-id", authDomain: "some-real-looking-id.firebaseapp.com", storageBucket: "some-real-looking-id.firebasestorage.app" },
      { projectId: "my-test-project", authDomain: "my-test-project.firebaseapp.com", storageBucket: "my-test-project.firebasestorage.app", claudeCompleteUrl: undefined },
      { projectId: "huahin-chat-test-" + "x".repeat(20), authDomain: "huahin-chat-test-" + "x".repeat(20) + ".firebaseapp.com", storageBucket: "huahin-chat-test-" + "x".repeat(20) + ".firebasestorage.app", claudeCompleteUrl: undefined },
      { authDomain: "other-project.firebaseapp.com" }, { storageBucket: "other.firebasestorage.app" },
      { region: "us-central1" },
      { claudeCompleteUrl: "http://asia-southeast1-huahin-chat-test-fake1.cloudfunctions.net/claudeComplete" }, { claudeCompleteUrl: "https://evil.example.com/x" },
      { claudeCompleteUrl: OTHER }, // right domain shape, another project
      { claudeCompleteUrl: "https://claudecomplete-fakefake-as.a.run.app" }, // run.app: not accepted without separate evidence
      { claudeCompleteUrl: OK.claudeCompleteUrl + "/extra" }, { claudeCompleteUrl: OK.claudeCompleteUrl + "?x=1" }];
    for (const c of cases) { const x = cli({ ...OK, ...c }); assert.notStrictEqual(x.r.status, 0, JSON.stringify(c)); assert.ok(!x.exists); }
  });

  it("B5 valid synthetic config builds; output carries the test project everywhere and no production string", () => {
    const out = path.join(tmp(), "o"); const m = build(OK, out);
    assert.strictEqual(Object.keys(m).length, FILES.length + 3); // + config.js, guard.js, firebase.json
    assert.strictEqual(fs.existsSync(path.join(out, MARKER)), true);
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
    assert.ok(!/run\.app/.test(fc), "no run.app URL left in firebase-client.js");
    const cr = fs.readFileSync(path.join(out, "ContactRail.dc.html"), "utf8");
    assert.ok(cr.includes(claudeCompleteUrlFor("huahin-chat-test-fake1")));
    assert.strictEqual(claudeCompleteUrlFor("huahin-chat-test-fake1"), "https://asia-southeast1-huahin-chat-test-fake1.cloudfunctions.net/claudeComplete");
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
    // The original check compared with 8c549c6 (start of CHAT-LIVE-01). LISTING-E2E-01 intentionally changes some of
    // these files (data.js, firebase-client.js, case-fields.js) on its own branch, so the comparison is now with HEAD:
    // what matters is that the BUILD never modifies a production source file.
    for (const base of ["HEAD"]) {
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

  // ── output-folder safety (Work review of 8f51b5c, point 1) ─────────────────
  function sentinelTree() { // a sacrificial copy of "the repo" with sentinel files that must survive every refused build
    const base = tmp(); const repo = path.join(base, "repo"); fs.mkdirSync(path.join(repo, "src"), { recursive: true });
    for (const f of FILES) fs.copyFileSync(path.join(ROOT, f), path.join(repo, f));
    fs.writeFileSync(path.join(repo, "SENTINEL.txt"), "do not delete"); fs.writeFileSync(path.join(repo, "src", "keep.txt"), "keep");
    fs.mkdirSync(path.join(repo, "build"), { recursive: true });
    return { base, repo };
  }
  const snap = (dir) => { const o = {}; (function w(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) w(p); else o[path.relative(dir, p)] = fs.readFileSync(p).toString("base64"); } })(dir); return JSON.stringify(o); };
  const safe = (cfg, out, root, bases) => rawBuild(cfg, out, root, { outputBases: bases });

  it("B9 refuses dangerous output folders (root, repo root, source folder, parent of source, home, base itself) and leaves every existing file untouched", () => {
    const { base, repo } = sentinelTree(); const before = snap(base);
    const bases = [path.join(repo, "build")];
    for (const out of ["/", repo, path.join(repo, "src"), base, path.dirname(base), os.homedir(), path.join(repo, "build"), path.join(repo, "build", ".."), repo + "/./", ""]) {
      assert.throws(() => safe(OK, out, repo, bases), /BUILD|output|refus|strictly|root|empty|invalid|contain|designated/i, "must refuse: " + JSON.stringify(out));
    }
    assert.strictEqual(snap(base), before, "no file in the sacrificial repo changed");
  });

  it("B10 refuses a path outside the designated area, even a harmless-looking temp folder", () => {
    const { repo } = sentinelTree(); const other = tmp(); fs.writeFileSync(path.join(other, "mine.txt"), "mine");
    assert.throws(() => safe(OK, other, repo, [path.join(repo, "build")]), /designated|strictly/);
    assert.throws(() => safe(OK, path.join(other, "sub"), repo, [path.join(repo, "build")]), /designated|strictly/);
    assert.strictEqual(fs.readFileSync(path.join(other, "mine.txt"), "utf8"), "mine");
  });

  it("B11 refuses symlinks: a link inside build/ pointing at the repo or source folder, and a symlinked build/ itself", () => {
    const { base, repo } = sentinelTree(); const before = snap(base);
    fs.symlinkSync(repo, path.join(repo, "build", "link-to-repo"));
    fs.symlinkSync(path.join(repo, "src"), path.join(repo, "build", "link-to-src"));
    for (const out of [path.join(repo, "build", "link-to-repo"), path.join(repo, "build", "link-to-src"), path.join(repo, "build", "link-to-repo", "x")]) {
      assert.throws(() => safe(OK, out, repo, [path.join(repo, "build")]), /symlink|refus|contain|designated/i, out);
    }
    const repo2 = path.join(base, "repo2"); fs.mkdirSync(repo2); for (const f of FILES) fs.copyFileSync(path.join(ROOT, f), path.join(repo2, f));
    fs.symlinkSync(repo, path.join(repo2, "build")); // the whole output area is a symlink into another tree
    assert.throws(() => safe(OK, path.join(repo2, "build", "o"), repo2, [path.join(repo2, "build")]), /symlink/);
    assert.strictEqual(fs.readFileSync(path.join(repo, "SENTINEL.txt"), "utf8"), "do not delete");
    assert.strictEqual(fs.readFileSync(path.join(repo, "src", "keep.txt"), "utf8"), "keep");
    fs.rmSync(path.join(repo, "build", "link-to-repo")); fs.rmSync(path.join(repo, "build", "link-to-src"));
  });

  it("B12 an existing non-empty folder that this build did not create (no marker) is never deleted", () => {
    const { repo } = sentinelTree(); const mine = path.join(repo, "build", "my-notes"); fs.mkdirSync(mine); fs.writeFileSync(path.join(mine, "important.txt"), "irreplaceable");
    assert.throws(() => safe(OK, mine, repo, [path.join(repo, "build")]), /not empty|marker/);
    assert.strictEqual(fs.readFileSync(path.join(mine, "important.txt"), "utf8"), "irreplaceable");
    const file = path.join(repo, "build", "a-file"); fs.writeFileSync(file, "x");
    assert.throws(() => safe(OK, file, repo, [path.join(repo, "build")]), /not a directory/);
    assert.strictEqual(fs.readFileSync(file, "utf8"), "x");
  });

  it("B13 positive control: a fresh folder and a folder created by an earlier build can be (re)built; a stale file inside the old build is replaced", () => {
    const { repo } = sentinelTree(); const out = path.join(repo, "build", "chat-live");
    safe(OK, out, repo, [path.join(repo, "build")]); fs.writeFileSync(path.join(out, "stale.txt"), "old");
    safe(OK, out, repo, [path.join(repo, "build")]);
    assert.ok(fs.existsSync(path.join(out, MARKER)) && !fs.existsSync(path.join(out, "stale.txt")) && fs.existsSync(path.join(out, "index.html")));
    assert.strictEqual(fs.readFileSync(path.join(repo, "SENTINEL.txt"), "utf8"), "do not delete");
    const empty = path.join(repo, "build", "empty-ok"); fs.mkdirSync(empty); safe(OK, empty, repo, [path.join(repo, "build")]);
  });

  it("B14 CLI: --out outside <repo>/build is refused with exit 1 and nothing is written or deleted", () => {
    const keep = tmp(); fs.writeFileSync(path.join(keep, "mine.txt"), "mine");
    for (const out of [keep, path.join(keep, "sub"), ROOT, path.join(ROOT, "tools"), "/", path.dirname(ROOT)]) {
      const x = cli(OK, out); assert.notStrictEqual(x.r.status, 0, out); assert.match(x.r.stderr, /BUILD REFUSED/);
    }
    assert.strictEqual(fs.readFileSync(path.join(keep, "mine.txt"), "utf8"), "mine");
    assert.ok(fs.existsSync(path.join(ROOT, "tools", "build-chat-live.js")) && fs.existsSync(path.join(ROOT, "index.html")), "repo files intact");
    const r = spawnSync("git", ["status", "--porcelain", "--", ...FILES, "tools"], { cwd: ROOT, encoding: "utf8" }); assert.ok(!/^ ?D/m.test(r.stdout), "no tracked file deleted");
  });

  it("B15 the real CLI accepts <repo>/build/<name> and the result passes the same scan", () => {
    const x = cli(OK); assert.strictEqual(x.r.status, 0, x.r.stderr); assert.ok(fs.existsSync(path.join(x.out, MARKER)));
  });
});
