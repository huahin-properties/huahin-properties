// CHAT-LIVE-01 — tests for tools/chat-live/deploy-test.sh and make-config.js using a STUB `firebase` command.
// No credentials, no network, nothing is deployed: the stub only records what the script WOULD run.
"use strict";
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { makeConfig } = require("../../tools/chat-live/make-config");

const SOURCE = path.resolve(__dirname, "..", "..");
const ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "chat-deploy-fixture-"));
fs.cpSync(SOURCE, ROOT, { recursive: true, filter: (src) => ![".git", "node_modules", "build"].includes(path.basename(src)) });
const SCRIPT = path.join(ROOT, "tools", "chat-live", "deploy-test.sh");
const P = "huahin-chat-test-01";
const FUNCS = ["receptionTurn", "getPropertyDraft", "updatePropertyDraft", "createCaseFromConversation", "claudeComplete"];
const SDK = `const firebaseConfig = {\n  apiKey: "FAKE-WEB-KEY-NOT-REAL",\n  authDomain: "${P}.firebaseapp.com",\n  projectId: "${P}",\n  storageBucket: "${P}.firebasestorage.app",\n  messagingSenderId: "111111111111",\n  appId: "1:111111111111:web:abcdef0123456789"\n};`;

function stub(dir, { loggedOut = false, listProjects = P, sdkconfig = SDK, apps = "1:111111111111:web:abcdef0123456789", appsFail = false } = {}) {
  const f = path.join(dir, "firebase-stub.sh"), log = path.join(dir, "calls.log");
  fs.writeFileSync(f, `#!/usr/bin/env bash
echo "$PWD|$*" >> "${log}"
case "$1" in
  login) touch "${dir}/loggedin"; exit 0;;
  projects:list) ${loggedOut ? `[[ -f "${dir}/loggedin" ]] || exit 1;` : ""} echo '${JSON.stringify({result:[{projectId:listProjects}]})}'; exit 0;;
  apps:list) ${appsFail ? "exit 1;" : ""} echo '${JSON.stringify({result:[{appId:apps}]})}'; exit 0;;
  apps:sdkconfig) cat <<'CFG'
${sdkconfig}
CFG
    exit 0;;
  *) exit 0;;
esac
`, { mode: 0o755 });
  return { f, log };
}
const calls = (log) => (fs.existsSync(log) ? fs.readFileSync(log, "utf8").trim().split("\n").filter(Boolean) : []);
function run(args, env, opts) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "deploy-"));
  const s = stub(dir, opts || {});
  const npm = path.join(dir, "npm-stub.sh"); fs.writeFileSync(npm, `#!/usr/bin/env bash\necho "$PWD|npm $*" >> "${s.log}"\n`, { mode: 0o755 });
  const r = spawnSync("bash", [SCRIPT, ...args], { cwd: ROOT, encoding: "utf8", env: Object.assign({}, process.env, { NPM_CMD: npm, FIREBASE_CMD: s.f, CHAT_LIVE_CONFIRM: "DEPLOY-TEST", CHAT_LIVE_SET_SECRET: "n" }, env || {}) });
  return { r, log: calls(s.log), dir };
}
const deploys = (log) => log.filter((l) => /\|deploy /.test(l));
const clean = () => fs.rmSync(path.join(ROOT, "build"), { recursive: true, force: true });

describe("CHAT-LIVE-01 deploy script (stub firebase; nothing is deployed)", function () {
  this.timeout(60000);
  before(clean); after(() => fs.rmSync(ROOT, {recursive:true, force:true}));

  it("D1 happy path: rules+indexes, then exactly the 5 functions, then hosting from build/chat-live; --project on every call; never the production id", () => {
    const { r, log } = run([]);
    assert.strictEqual(r.status, 0, r.stdout + r.stderr);
    const ni = log.findIndex((l) => /functions\|npm ci --no-audit --no-fund$/.test(l)); assert.ok(ni >= 0, "npm ci runs inside functions/");
    assert.ok(ni < log.findIndex((l) => /\|deploy /.test(l)), "npm ci happens before the first deploy");
    const d = deploys(log); assert.strictEqual(d.length, 3, d.join("\n"));
    assert.ok(/--only firestore:rules,firestore:indexes (?:--json )?--project huahin-chat-test-01$/.test(d[0]), d[0]);
    const fn = /--only (\S+) --project/.exec(d[1]); assert.ok(fn, d[1]);
    assert.deepStrictEqual(fn[1].split(",").sort(), FUNCS.map((x) => "functions:" + x).sort());
    assert.ok(/build\/chat-live\|deploy --only hosting (?:--json )?--project huahin-chat-test-01$/.test(d[2]), "hosting is deployed from the build folder: " + d[2]);
    for (const l of log) { const cmd = l.split("|")[1]; if (/^(login|projects:list|npm )/.test(cmd)) continue; assert.ok(/(?:--json )?--project huahin-chat-test-01$/.test(cmd), "missing --project: " + l); }
    assert.ok(!log.join("\n").includes("huahin-properties-5f1b5"), "production id never appears");
    assert.ok(!log.some((l) => /\|deploy( |$)/.test(l) && !/--only/.test(l)), "no deploy without --only");
    assert.ok(!/functions:secrets:set/.test(log.join("\n")), "secret step skipped when answered n");
    assert.ok(fs.existsSync(path.join(ROOT, "build", "chat-live", "index.html")) && fs.existsSync(path.join(ROOT, "build", "chat-live", "firebase.json")));
    assert.ok(!(r.stdout + r.stderr).includes("FAKE-WEB-KEY-NOT-REAL"), "the web key is not echoed");
  });

  it("D2 refuses production, non-test and over-long project ids before calling firebase at all", () => {
    for (const id of ["huahin-properties-5f1b5", "some-other-project", "huahin-chat-test-", "HUAHIN-CHAT-TEST-01", "huahin-chat-test-" + "x".repeat(20), "huahin-chat-test-01;rm", "huahin-chat-test-01 x"]) {
      const { r, log } = run([id]); assert.notStrictEqual(r.status, 0, id); assert.strictEqual(log.length, 0, "firebase must not be called for " + id); assert.match(r.stderr, /STOP/);
    }
  });

  it("D3 wrong or empty confirmation: no deploy, no secret step", () => {
    for (const c of ["deploy-test", "yes", "DEPLOY-TEST "]) { const { r, log } = run([], { CHAT_LIVE_CONFIRM: c, CHAT_LIVE_SET_SECRET: "y" }); assert.notStrictEqual(r.status, 0, c); assert.strictEqual(deploys(log).length, 0); assert.ok(!/secrets:set/.test(log.join("\n"))); }
    const e = run([], { CHAT_LIVE_CONFIRM: "" }); // empty -> would prompt; no tty/stdin => read fails -> stop
    assert.notStrictEqual(e.r.status, 0); assert.strictEqual(deploys(e.log).length, 0);
  });

  it("D4 key step: only the CLI's own prompt command is run (no value ever passes through the script)", () => {
    const { r, log } = run([], { CHAT_LIVE_SET_SECRET: "y" }); assert.strictEqual(r.status, 0, r.stderr);
    const s = log.filter((l) => /secrets:set/.test(l)); assert.strictEqual(s.length, 1); assert.ok(/\|functions:secrets:set ANTHROPIC_API_KEY (?:--json )?--project huahin-chat-test-01$/.test(s[0]), s[0]);
    const src = fs.readFileSync(SCRIPT, "utf8"); assert.ok(!/sk-ant|--data-file|<<<|\|\s*fb functions:secrets/.test(src), "no key value is piped, read into a variable or passed as an argument");
    assert.ok(log.indexOf(s[0]) < log.findIndex((l) => /\|deploy /.test(l)), "key step comes before the first deploy");
  });

  it("D5 account cannot see the project => stop before anything is built or deployed", () => {
    const { r, log } = run([], {}, { listProjects: "some-other-project" }); assert.notStrictEqual(r.status, 0); assert.match(r.stderr, /cannot see project/); assert.strictEqual(deploys(log).length, 0);
  });

  it("D6 not logged in => the script runs login (in the terminal), then continues", () => {
    const { r, log } = run([], {}, { loggedOut: true }); assert.strictEqual(r.status, 0, r.stderr); assert.ok(log.some((l) => /\|login --no-localhost$/.test(l))); assert.strictEqual(deploys(log).length, 3);
  });

  it("D7 broken or foreign sdkconfig output => stop, nothing deployed", () => {
    for (const cfg of ["garbage", SDK.replace(/apiKey: "[^"]+",/, ""), SDK.split(P).join("another-project")]) {
      const { r, log } = run([], {}, { sdkconfig: cfg }); assert.notStrictEqual(r.status, 0, cfg.slice(0, 30)); assert.strictEqual(deploys(log).length, 0);
    }
  });

  it("D8 an existing 'build' folder content that is not ours is never deleted by the script's build step", () => {
    clean(); fs.mkdirSync(path.join(ROOT, "build", "mine"), { recursive: true }); fs.writeFileSync(path.join(ROOT, "build", "mine", "keep.txt"), "keep");
    const { r } = run([]); assert.strictEqual(r.status, 0, r.stderr); assert.strictEqual(fs.readFileSync(path.join(ROOT, "build", "mine", "keep.txt"), "utf8"), "keep");
  });

  it("D10 discovery failure stops without creating an app, secret or deploy", () => {
    const { r, log } = run([], {}, {appsFail:true});
    assert.notStrictEqual(r.status, 0);
    assert.ok(!log.some(x => /apps:create|secrets:set|\|deploy /.test(x)));
  });
  it("D11 project ID substring is not sufficient", () => {
    const {r,log} = run([], {}, {listProjects:P + "-other"});
    assert.notStrictEqual(r.status,0); assert.strictEqual(deploys(log).length,0);
  });
  it("D12 sdkconfig must contain the exact project ID", () => {
    const {r,log} = run([], {}, {sdkconfig:SDK.replace(/projectId: "[^"]+",/, "")});
    assert.notStrictEqual(r.status,0); assert.strictEqual(deploys(log).length,0);
  });
  it("D13 build symlink is refused without changing its target", () => {
    clean(); const target=fs.mkdtempSync(path.join(os.tmpdir(), "chat-sentinel-"));
    const sentinel=path.join(target,"chat-live.config.json"); fs.writeFileSync(sentinel,"UNCHANGED");
    fs.symlinkSync(target,path.join(ROOT,"build"),"dir");
    try { const {r,log}=run([]); assert.notStrictEqual(r.status,0); assert.strictEqual(deploys(log).length,0); assert.strictEqual(fs.readFileSync(sentinel,"utf8"),"UNCHANGED"); }
    finally {fs.unlinkSync(path.join(ROOT,"build"));fs.rmSync(target,{recursive:true,force:true});}
  });

  it("D9 make-config reads both the JS-object and JSON forms, derives the rest from the project id, and refuses a foreign or incomplete config", () => {
    const j = JSON.stringify({ apiKey: "FAKE", authDomain: "x", projectId: P, storageBucket: P + ".firebasestorage.app", messagingSenderId: "1", appId: "1:1:web:ab" });
    for (const t of [SDK, j]) { const c = makeConfig(P, t); assert.strictEqual(c.authDomain, P + ".firebaseapp.com"); assert.strictEqual(c.region, "asia-southeast1"); assert.ok(c.apiKey && c.appId && c.messagingSenderId); }
    assert.throws(() => makeConfig(P, SDK.split(P).join("other")), /different project/);
    assert.throws(() => makeConfig(P, 'projectId: "' + P + '", appId: "1:1:web:ab"'), /apiKey/);
  });
});
