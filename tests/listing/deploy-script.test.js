// LISTING-E2E-01 — tests for tools/listing-test/deploy-test.sh with a STUB `firebase` command. Nothing is deployed, no credentials, no network.
"use strict";
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const SOURCE = path.resolve(__dirname, "..", "..");
const ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "listing-deploy-fixture-"));
fs.cpSync(SOURCE, ROOT, { recursive: true, filter: (src) => ![".git", "node_modules", "build", ".browser-vendor"].includes(path.basename(src)) });
const SCRIPT = path.join(ROOT, "tools", "listing-test", "deploy-test.sh");
const P = "huahin-chat-test-01";
const FUNCS = ["submitListingCase", "previewListingCase", "publishListingCase", "unpublishListingCase", "syncListingCase", "addCasePhotos", "reconcileListingFiles", "listMyCases", "trackListingCase"];
const sdk = (p) => `const firebaseConfig = {\n  apiKey: "FAKE-WEB-KEY-NOT-REAL",\n  authDomain: "${p}.firebaseapp.com",\n  projectId: "${p}",\n  storageBucket: "${p}.firebasestorage.app",\n  messagingSenderId: "111111111111",\n  appId: "1:111111111111:web:abcdef0123456789"\n};`;

function stub(dir, o) {
  const f = path.join(dir, "firebase-stub.sh"), log = path.join(dir, "calls.log");
  fs.writeFileSync(f, `#!/usr/bin/env bash
echo "$PWD|$*" >> "${log}"
case "$1" in
  login) exit 0;;
  projects:list) echo '${JSON.stringify({ result: [{ projectId: o.visible || P }] })}'; exit 0;;
  apps:list) ${o.noApp ? "echo '{\"result\":[]}'" : "echo '{\"result\":[{\"appId\":\"1:111111111111:web:abcdef0123456789\"}]}'"}; exit 0;;
  apps:sdkconfig) cat <<'CFG'
${sdk(o.sdkProject || P)}
CFG
    exit 0;;
  *) exit 0;;
esac
`, { mode: 0o755 });
  return { f, log };
}
const calls = (log) => (fs.existsSync(log) ? fs.readFileSync(log, "utf8").trim().split("\n").filter(Boolean) : []);
function run(args, o, env) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ldeploy-")); const s = stub(dir, o || {});
  const npm = path.join(dir, "npm-stub.sh"); fs.writeFileSync(npm, `#!/usr/bin/env bash\necho "$PWD|npm $*" >> "${s.log}"\n`, { mode: 0o755 });
  const r = spawnSync("bash", [SCRIPT, ...args], { cwd: ROOT, encoding: "utf8", env: Object.assign({}, process.env, { NPM_CMD: npm, FIREBASE_CMD: s.f, LISTING_TEST_CONFIRM: "DEPLOY-TEST" }, env || {}) });
  return { r, log: calls(s.log) };
}
const deploys = (log) => log.filter((l) => /\|deploy /.test(l));
const clean = () => fs.rmSync(path.join(ROOT, "build"), { recursive: true, force: true });

describe("LISTING-E2E-01 deploy script (stub firebase; nothing is deployed)", function () {
  this.timeout(60000);
  before(clean); after(() => fs.rmSync(ROOT, { recursive: true, force: true }));

  it("L1 happy path on huahin-chat-test-01: 9 NAMED functions, firestore rules, storage, hosting from build/listing-test; --project on every call; no secret step; never production", () => {
    const { r, log } = run([]);
    assert.strictEqual(r.status, 0, r.stdout + r.stderr);
    const d = deploys(log); assert.strictEqual(d.length, 4, d.join("\n"));
    assert.ok(/build\/listing-functions\|deploy /.test(d[0]), "functions are deployed from the listing-only folder, never from functions/: " + d[0]);
    assert.ok(log.some((l) => /build\/listing-functions\|npm install/.test(l)) && !log.some((l) => /functions\|npm ci/.test(l)), "libraries installed inside the listing-only folder");
    const fn = /--only (\S+) --project/.exec(d[0]); assert.ok(fn, d[0]);
    assert.deepStrictEqual(fn[1].split(",").sort(), FUNCS.map((x) => "functions:" + x).sort());
    assert.ok(/--only firestore:rules (?:--json )?--project huahin-chat-test-01$/.test(d[1]), d[1]);
    assert.ok(/--only storage (?:--json )?--project huahin-chat-test-01$/.test(d[2]), d[2]);
    assert.ok(/build\/listing-test\|deploy --only hosting (?:--json )?--project huahin-chat-test-01$/.test(d[3]), "hosting from the build folder: " + d[3]);
    for (const l of log) { const cmd = l.split("|")[1]; if (/^(login|projects:list|npm )/.test(cmd)) continue; assert.ok(/(?:--json )?--project huahin-chat-test-01$/.test(cmd), "missing --project: " + l); }
    const all = log.join("\n");
    assert.ok(!all.includes("huahin-properties-5f1b5") && !/secrets/.test(all) && !/functions:(receptionTurn|claudeComplete|createCheckoutSession|stripeWebhook)/.test(all));
    assert.ok(!log.some((l) => /\|deploy( |$)/.test(l) && !/--only/.test(l)) && !log.some((l) => /--only functions( |$)/.test(l)), "no bare deploy, never --only functions");
    assert.ok(fs.existsSync(path.join(ROOT, "build", "listing-test", "Owner Submission.dc.html")) && fs.existsSync(path.join(ROOT, "build", "listing-test", "firebase.json")));
    assert.ok(!(r.stdout + r.stderr).includes("FAKE-WEB-KEY-NOT-REAL"), "the web key is not echoed");
  });

  it("L2 refuses production / non-test / odd ids before calling firebase", () => {
    for (const id of ["huahin-properties-5f1b5", "some-other", "huahin-chat-test-", "HUAHIN-CHAT-TEST-01", "huahin-chat-test-01;rm", "huahin-chat-test-" + "x".repeat(20)]) {
      const { r, log } = run([id]); assert.notStrictEqual(r.status, 0, id); assert.strictEqual(log.length, 0, "firebase was called for " + id);
    }
  });

  it("L3 stops without deploying: wrong confirmation, project not visible, no web app, sdkconfig of another project", () => {
    for (const [args, o, env] of [[[], {}, { LISTING_TEST_CONFIRM: "yes" }], [[], { visible: "other-project" }], [[], { noApp: true }], [[], { sdkProject: "huahin-chat-test-02" }]]) {
      clean(); const { r, log } = run(args, o, env); assert.notStrictEqual(r.status, 0); assert.strictEqual(deploys(log).length, 0, "deployed despite: " + JSON.stringify([o, env]));
    }
  });
});
