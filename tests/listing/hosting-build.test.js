// LISTING-E2E-01 — the TEST-only hosting build (tools/build-listing-test.js). No credentials, no network, no deploy.
"use strict";
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { spawnSync } = require("child_process");
const { build, closure, FORBIDDEN, MARKER, REQUIRED_FUNCTIONS, OPTIONAL_CHAT_FUNCTIONS, deployFunctionsCommand, EXCLUDED_NAV, ADMIN_TOOLS_NOT_IN_TEST } = require("../../tools/build-listing-test");

const ROOT = path.join(__dirname, "..", "..");
const CFG = { projectId: "huahin-listing-test-abc", apiKey: "SYNTHETIC-KEY", appId: "1:123:web:synthetic", messagingSenderId: "123", authDomain: "huahin-listing-test-abc.firebaseapp.com", storageBucket: "huahin-listing-test-abc.appspot.com", region: "asia-southeast1" };
const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(path.join(ROOT, f))).digest("hex");
let n = 0;
const out = () => path.join(ROOT, "build", "hosting-test-" + process.pid + "-" + (++n));
const refuses = (cfg, re, dir) => assert.throws(() => build(cfg, dir || out()), re);

describe("LISTING-E2E-01 TEST-only hosting build (no network, nothing deployed)", function () {
  this.timeout(60000);
  const made = [];
  after(() => { for (const d of made) fs.rmSync(d, { recursive: true, force: true }); });

  it("H1 builds the form, tracking, admin login, Staff, Approvals and public pages with every import they need, for the TEST project only", () => {
    const files = closure(ROOT);
    for (const must of ["Owner Submission.dc.html", "Track Submission.dc.html", "Admin Login.dc.html", "Listing Approvals.dc.html", "Staff Workspace.dc.html", "Property Details.dc.html", "Search Results.dc.html", "Lister Dashboard.dc.html", "index.html",
      "owner-form-flow.js", "photo-standard.js", "case-fields.js", "intake-workflow.js", "firebase-client.js", "data.js", "support.js", "ContactRail.dc.html", "PropertyCard.dc.html", "LanguageSwitcher.dc.html"]) assert.ok(files.includes(must), "closure lacks " + must);
    const before = Object.fromEntries(files.map((f) => [f, sha(f)]));
    const d = out(); made.push(d);
    const m = build(CFG, d);
    for (const f of files) assert.ok(fs.existsSync(path.join(d, f)), "missing in output: " + f);
    for (const f of ["listing-test-config.js", "listing-test-guard.js", "firebase.json", "MANIFEST.json", MARKER]) assert.ok(fs.existsSync(path.join(d, f)), f);
    assert.strictEqual(Object.keys(m).length, files.length + 3);
    for (const f of files) assert.strictEqual(sha(f), before[f], "the build edited a production source file: " + f);
    // every local file a built page or script refers to exists in the output (no 404 on a test site)
    for (const f of fs.readdirSync(d).filter((x) => /\.(html|js)$/.test(x))) {
      const t = fs.readFileSync(path.join(d, f), "utf8");
      for (const r of t.matchAll(/(?:from\s+|import\s*\(\s*|src=)["']\.\/([A-Za-z0-9_.\- %]+\.(?:js|png))["']/g)) assert.ok(fs.existsSync(path.join(d, decodeURIComponent(r[1]))), f + " refers to missing " + r[1]);
      for (const r of t.matchAll(/<dc-import\s+name="([^"]+)"/g)) assert.ok(fs.existsSync(path.join(d, r[1] + ".dc.html")), f + " imports missing " + r[1]);
    }
  });

  it("H2 no production project, host, contact channel or default credential is left in ANY output file; no page loads support.js before the guard; every page is noindex", () => {
    const d = out(); made.push(d); build(CFG, d);
    for (const f of fs.readdirSync(d)) {
      if (/\.(png|jpg|webp)$/.test(f) || f === "listing-test-guard.js") continue;
      const t = fs.readFileSync(path.join(d, f), "utf8");
      for (const re of FORBIDDEN) assert.ok(!re.test(t), f + " matches " + re);
      assert.ok(!/huahin-properties-5f1b5|5f1b5|claudecomplete-3j4ldf4pja/i.test(t), f);
      if (f.endsWith(".html")) {
        assert.ok(/name="robots" content="noindex,nofollow"/.test(t), f + " noindex");
        assert.ok(t.indexOf("listing-test-guard.js") < t.indexOf("firebase-app-compat") || t.indexOf("firebase-app-compat") === -1, f + ": guard first");
        assert.ok(!/<script src="\.\/support\.js">/.test(t), f + ": support.js loaded directly");
        assert.ok(t.includes('<template id="chat-live-app">') && t.includes("__chatLiveStart"), f + ": inert until the guard passes");
        assert.ok(!/<link rel="canonical"|<script type="application\/ld\+json">|<meta name="google-site-verification"/.test(t), f + ": static SEO tags removed (pages that add them at run time only point at the .invalid host and stay noindex)");
      }
    }
    const fc = fs.readFileSync(path.join(d, "firebase-client.js"), "utf8");
    assert.ok(fc.includes('"projectId": "huahin-listing-test-abc"') && fc.includes("asia-southeast1-huahin-listing-test-abc.cloudfunctions.net"));
    assert.ok(/DEFAULT_ADMIN_CREDENTIALS = \{ username: "SYNTHETIC", password: "SYNTHETIC-DISABLED"/.test(fc), "default admin credentials replaced");
    assert.ok(/DEFAULT_FB_FOOTER = `TEST SITE/.test(fc));
    const hosting = JSON.parse(fs.readFileSync(path.join(d, "firebase.json"), "utf8")).hosting;
    assert.strictEqual(hosting.public, "."); assert.ok(JSON.stringify(hosting.headers).includes("noindex"));
    assert.ok(!hosting.rewrites, "no rewrites to production functions");
    const cfg = fs.readFileSync(path.join(d, "listing-test-config.js"), "utf8"); assert.ok(cfg.includes("huahin-listing-test-abc.web.app"));
  });

  it("H3 every built script parses (a scrub or patch cannot leave a syntax error behind)", () => {
    const d = out(); made.push(d); build(CFG, d);
    for (const f of fs.readdirSync(d).filter((x) => x.endsWith(".js"))) {
      const tmp = path.join(os.tmpdir(), "h3-" + process.pid + "-" + f.replace(/[^a-z0-9.]/gi, "_") + ".mjs"); fs.copyFileSync(path.join(d, f), tmp);
      const r = spawnSync(process.execPath, ["--check", tmp], { encoding: "utf8" }); fs.rmSync(tmp, { force: true });
      assert.strictEqual(r.status, 0, f + ": " + r.stderr.slice(0, 200));
    }
    for (const f of fs.readdirSync(d).filter((x) => x.endsWith(".dc.html"))) {
      const t = fs.readFileSync(path.join(d, f), "utf8"); const m = t.match(/<script type="text\/x-dc" data-dc-script>([\s\S]*?)<\/script>/);
      if (!m) continue;
      const tmp = path.join(os.tmpdir(), "h3-" + process.pid + "-" + f.replace(/[^a-z0-9.]/gi, "_") + ".mjs"); fs.writeFileSync(tmp, "class DCLogic{}\n" + m[1]);
      const r = spawnSync(process.execPath, ["--check", tmp], { encoding: "utf8" }); fs.rmSync(tmp, { force: true });
      assert.strictEqual(r.status, 0, f + ": " + r.stderr.slice(0, 200));
    }
  });

  it("H4 refuses (and writes nothing) for a production project id, a wrong prefix, placeholders, mismatched domain/bucket/region and production values hidden in the config", () => {
    const bad = [[{ projectId: "huahin-properties-5f1b5" }, /production/], [{ projectId: "my-real-project" }, /huahin-listing-test-/], [{ projectId: "huahin-chat-testing-abc" }, /huahin-listing-test-/], [{ projectId: "huahin-chat-test-" }, /huahin-listing-test-/],
      [{ apiKey: "REPLACE_ME" }, /placeholder/], [{ appId: "" }, /missing/], [{ authDomain: "auth.huahin.properties" }, /production/], [{ authDomain: "other.firebaseapp.com" }, /authDomain/],
      [{ storageBucket: "other.appspot.com" }, /storageBucket/], [{ region: "us-central1" }, /region/], [{ messagingSenderId: "claudecomplete-3j4ldf4pja" }, /production/], [{ projectId: "huahin-listing-test-" + "x".repeat(20) }, /max 30/]];
    for (const [patch, re] of bad) { const d = out(); refuses(Object.assign({}, CFG, patch), re, d); assert.ok(!fs.existsSync(d), "wrote something for " + JSON.stringify(patch)); }
    assert.throws(() => build(null, out()), /not an object/);
  });

  it("H5 output-folder safety: only inside ./build, never the repo or a source folder, never a non-empty folder this build did not create", () => {
    refuses(CFG, /designated output area/, path.join(os.tmpdir(), "listing-x"));
    refuses(CFG, /root|designated|source/, ROOT);
    refuses(CFG, /designated output area/, path.join(ROOT, "tools", "x"));
    const d = out(); made.push(d); fs.mkdirSync(d, { recursive: true }); fs.writeFileSync(path.join(d, "keep-me.txt"), "x");
    refuses(CFG, /not empty and was not created by this build/, d);
    assert.ok(fs.existsSync(path.join(d, "keep-me.txt")), "an unrelated folder is never deleted");
  });

  it("H6 negative control: if a patch target disappears from the source, the build refuses instead of half-patching", () => {
    const tmp = fs.mkdtempSync(path.join(ROOT, "build", "src-copy-")); made.push(tmp);
    for (const f of closure(ROOT)) { fs.mkdirSync(path.dirname(path.join(tmp, f)), { recursive: true }); fs.copyFileSync(path.join(ROOT, f), path.join(tmp, f)); }
    fs.writeFileSync(path.join(tmp, "firebase-client.js"), fs.readFileSync(path.join(tmp, "firebase-client.js"), "utf8").replace("const DEFAULT_ADMIN_CREDENTIALS", "const RENAMED_CREDENTIALS"));
    assert.throws(() => build(CFG, path.join(tmp, "build", "o"), tmp, { outputBases: [path.join(tmp, "build")] }), /DEFAULT_ADMIN_CREDENTIALS not found/);
  });

  it("H7 deploy set: only NAMED functions (never all of them); every function the built pages call is in the set; the guide shows exactly that command; no new composite index is needed; the built hosting config is the TEST one, not the root production hosting", () => {
    const src = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
    const called = new Set();
    for (const f of closure(ROOT).filter((x) => /\.(js|html)$/.test(x))) for (const m of src(f).matchAll(/(?:callFn|httpsCallable)\(\s*["']([A-Za-z]+)["']/g)) called.add(m[1]);
    const known = new Set(REQUIRED_FUNCTIONS.concat(OPTIONAL_CHAT_FUNCTIONS, ["startConversation", "sendConversationTurn"])); // the last two belong to the old conversation widget (not used by the listing test)
    for (const n of called) assert.ok(known.has(n), "a built page calls a function that the deploy guide does not account for: " + n);
    for (const n of REQUIRED_FUNCTIONS) assert.ok(called.has(n) || n === "reconcileListingFiles", "required function never called by any page: " + n);
    const exportsNow = new Set(Array.from(src("functions/index.js").matchAll(/^exports\.([A-Za-z0-9_]+)/gm)).map((m) => m[1]));
    for (const n of REQUIRED_FUNCTIONS.concat(OPTIONAL_CHAT_FUNCTIONS)) assert.ok(exportsNow.has(n), "not exported: " + n);
    for (const bad of ["stripeWebhook", "createCheckoutSession", "lineAuthStart", "notifyNewLead", "notifyOwnerApproval", "agentProfileMeta", "shareCard"]) assert.ok(!REQUIRED_FUNCTIONS.includes(bad), bad);
    const cmd = deployFunctionsCommand("huahin-listing-test-abc");
    assert.ok(/^firebase deploy --only functions:[A-Za-z]+(,functions:[A-Za-z]+)* --project huahin-listing-test-abc$/.test(cmd) && !/--only functions\b(?!:)/.test(cmd));
    const guide = src("docs/listing-e2e/DEPLOY-TEST-PROJECT.md");
    assert.ok(guide.includes(cmd.replace("huahin-listing-test-abc", "<huahin-listing-test-…>")), "the guide must show exactly the generated command");
    assert.ok(!/firebase deploy --only functions( |$|`)/m.test(guide.replace(/ห้ามรัน `firebase deploy --only functions`[^\n]*/, "")), "the guide must not tell anyone to deploy all functions");
    // indexes: every query of the listing flow is single-field equality (no orderBy, no chained where)
    const lc = src("functions/listing-case.js");
    assert.ok(!/\.orderBy\(/.test(lc) && !/\.where\([^)]*\)\s*\.where\(/.test(lc), "a composite index would be needed");
    // hosting: the built folder carries its own TEST config; the root one (production rewrites) is never what gets deployed
    const d = out(); made.push(d); build(CFG, d);
    const built = JSON.parse(fs.readFileSync(path.join(d, "firebase.json"), "utf8")).hosting;
    const root = JSON.parse(src("firebase.json")).hosting;
    assert.ok(root.rewrites && root.rewrites.length, "sanity: the root hosting config has production rewrites");
    assert.deepStrictEqual([built.public, built.rewrites], [".", undefined]);
    assert.ok(!JSON.stringify(built).includes("agentProfileMeta") && !fs.readFileSync(path.join(d, "listing-test-config.js"), "utf8").includes("5f1b5"));
  });

  it("H8 navigation closure: every page / script a built file points at exists in the build, except the explicit, named lists (dead-by-design admin tool links; pages the build deliberately removes)", () => {
    const d = fs.mkdtempSync(path.join(ROOT, "build", "closure-")); made.push(d);
    build(CFG, path.join(d, "o"), ROOT, { outputBases: [path.join(ROOT, "build"), d] });
    const out = path.join(d, "o"); const have = new Set(fs.readdirSync(out)); const dangling = {};
    for (const f of fs.readdirSync(out).filter((x) => /\.(html|js)$/.test(x))) {
      const txt = fs.readFileSync(path.join(out, f), "utf8");
      for (const m of txt.matchAll(/["'`=(]\s*\.?\/?([A-Za-z][A-Za-z0-9 %_-]*\.dc\.html)/g)) { const n = decodeURIComponent(m[1]); if (!have.has(n) && !EXCLUDED_NAV.includes(n) && !ADMIN_TOOLS_NOT_IN_TEST.includes(n)) (dangling[n] = dangling[n] || []).push(f); }
      for (const m of txt.matchAll(/from\s+["']\.\/([A-Za-z0-9._-]+\.js)["']|import\(\s*["']\.\/([A-Za-z0-9._-]+\.js)["']\s*\)/g)) { const n = m[1] || m[2]; if (!have.has(n)) (dangling[n] = dangling[n] || []).push(f); }
    }
    assert.deepStrictEqual(dangling, {}, "links/imports that resolve nowhere in the build");
    // negative control: the check really sees a dangling link
    fs.writeFileSync(path.join(out, "zz.html"), '<a href="Nowhere Page.dc.html">x</a>');
    const again = /["'`=(]\s*\.?\/?([A-Za-z][A-Za-z0-9 %_-]*\.dc\.html)/.exec(fs.readFileSync(path.join(out, "zz.html"), "utf8")); assert.ok(again && !have.has(again[1]), "negative control");
  });

  it("H9 the TEST build never falls back to the bundled sample catalogue after a load failure; the production source keeps its fallback; data helpers wait (bounded) for the SDK part they need", () => {
    const d = out(); made.push(d); build(CFG, d);
    assert.ok(/const SAMPLE_FALLBACK_ON_ERROR = true;/.test(fs.readFileSync(path.join(ROOT, "data.js"), "utf8")), "production source unchanged");
    assert.ok(/const SAMPLE_FALLBACK_ON_ERROR = false;/.test(fs.readFileSync(path.join(d, "data.js"), "utf8")), "TEST build: no sample fallback");
    const fc = fs.readFileSync(path.join(ROOT, "firebase-client.js"), "utf8");
    for (const part of ["firestore", "app", "auth"]) assert.ok(fc.includes('await whenSdkPart("' + part + '")'), "waits for the " + part + " part");
    assert.ok(/sdk-timeout/.test(fc) && /budgetMs \|\| 8000/.test(fc), "bounded (8 s) with a distinct error code");
  });

  it("H10 the existing TEST project prefix huahin-chat-test-* is accepted (reuse needs no server change); the config and every built file belong to that project", () => {
    const cfg = Object.assign({}, CFG, { projectId: "huahin-chat-test-01", authDomain: "huahin-chat-test-01.firebaseapp.com", storageBucket: "huahin-chat-test-01.firebasestorage.app" });
    const d = out(); made.push(d); build(cfg, d);
    const fc = fs.readFileSync(path.join(d, "firebase-client.js"), "utf8");
    assert.ok(fc.includes("asia-southeast1-huahin-chat-test-01.cloudfunctions.net") && !fc.includes("5f1b5"));
    assert.ok(/TEST_PROJECT_RE = \/\^\(huahin-chat-test-\|huahin-listing-test-/.test(fs.readFileSync(path.join(ROOT, "functions", "listing-case.js"), "utf8")), "the Functions already accept this prefix");
    assert.ok(/huahin-\(chat\|listing\)-test-/.test(fs.readFileSync(path.join(ROOT, "functions", "chat-test-gate.js"), "utf8")) || /\(chat\|listing\)/.test(fs.readFileSync(path.join(ROOT, "functions", "chat-test-gate.js"), "utf8")), "the chat gate already enforces on this prefix");
  });
});
