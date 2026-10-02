// LISTING-E2E-01 — the listing-only functions folder (tools/listing-test/build-functions.js). Proves WHY it exists (the real CLI discovery sees 8 secrets in functions/)
// and that the folder deploys without any. No network, nothing deployed.
"use strict";
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { build, NAMES, FILES } = require("../../tools/listing-test/build-functions");
const ROOT = path.resolve(__dirname, "..", "..");
const DISC = `const path=require("path");const dir=path.resolve(process.argv[1]);process.chdir(dir);process.env.GCLOUD_PROJECT="huahin-chat-test-01";
const {loadStack}=require(path.join(dir,"node_modules/firebase-functions/lib/runtime/loader.js"));
loadStack(dir).then(({endpoints,params})=>{console.log(JSON.stringify({n:Object.keys(endpoints).sort(),s:(params||[]).filter(p=>p.type==="secret").map(p=>p.name)}));process.exit(0)}).catch(e=>{console.error(e.message);process.exit(1)});`;
const discover = (dir) => { const r = spawnSync("node", ["-e", DISC, dir], { encoding: "utf8" }); assert.strictEqual(r.status, 0, r.stderr); return JSON.parse(r.stdout.trim().split("\n").pop()); };

describe("LISTING-E2E-01 listing-only functions folder", function () {
  this.timeout(120000);
  const made = [];
  after(() => made.forEach((d) => fs.rmSync(d, { recursive: true, force: true })));

  it("F1 cause: the full functions/ declares secrets the CLI would check in Secret Manager; the listing-only folder declares none and exports exactly the 9 named functions", () => {
    const full = discover(path.join(ROOT, "functions"));
    assert.ok(full.s.includes("ANTHROPIC_API_KEY") && full.s.length >= 6, "negative control: functions/ declares secrets: " + full.s);
    const out = path.join(ROOT, "build", "f-test-" + process.pid); made.push(out);
    build(ROOT, out);
    fs.symlinkSync(path.join(ROOT, "functions", "node_modules"), path.join(out, "node_modules"), "dir");
    const lo = discover(out);
    assert.deepStrictEqual(lo.s, [], "no secret param in the listing-only folder");
    assert.deepStrictEqual(lo.n, NAMES.slice().sort());
  });

  it("F2 content: only the listing modules, byte-identical to the sources; no chat gate, no Stripe/AI; its own firebase.json; deploy command names are the same 9", () => {
    const out = path.join(ROOT, "build", "f-test2-" + process.pid); made.push(out);
    const r = build(ROOT, out);
    assert.deepStrictEqual(r.files, ["case-fields.js", "firebase.json", "index.js", "listing-case.js", "package.json", "photo-standard.js", "submission-checklist.js"]);
    for (const f of FILES) assert.ok(fs.readFileSync(path.join(out, f)).equals(fs.readFileSync(path.join(ROOT, "functions", f))), f + " identical");
    const all = r.files.map((f) => fs.readFileSync(path.join(out, f), "utf8")).join("\n");
    assert.ok(!/defineSecret|stripe|ANTHROPIC|chat-test-gate|RESEND|LINE_/i.test(all.replace(/listing-case\.js[^]*/, "")), "no secret / Stripe / AI in the generated files");
    const cfg = JSON.parse(fs.readFileSync(path.join(out, "firebase.json"), "utf8")); assert.strictEqual(cfg.functions[0].codebase, "listing");
    assert.ok(!/huahin-properties-5f1b5|5f1b5/.test(all), "production id absent");
    const { REQUIRED_FUNCTIONS } = require("../../tools/build-listing-test"); assert.deepStrictEqual(REQUIRED_FUNCTIONS.slice().sort(), NAMES.slice().sort());
  });

  it("F3 fails closed: a changed index.js block or a new unknown require stops the build", () => {
    const tmp = fs.mkdtempSync(path.join(ROOT, "build", "f-src-")); made.push(tmp);
    fs.mkdirSync(path.join(tmp, "functions"), { recursive: true });
    for (const f of fs.readdirSync(path.join(ROOT, "functions")).filter((x) => /\.(js|json)$/.test(x))) fs.copyFileSync(path.join(ROOT, "functions", f), path.join(tmp, "functions", f));
    const idx = path.join(tmp, "functions", "index.js"); const src = fs.readFileSync(idx, "utf8");
    fs.writeFileSync(idx, src.replace("exports.listMyCases = onCall(", "exports.listMyCases = onCall(\n  { secrets: [ANTHROPIC_API_KEY] },"));
    assert.throws(() => build(tmp, path.join(tmp, "build", "o")), /secret or the chat gate/);
    fs.writeFileSync(idx, src.replace('const listingCase = require("./listing-case");', "const listingCase = require(\"./listing-case-x\");"));
    assert.throws(() => build(tmp, path.join(tmp, "build", "o")), /listing block not found|not found/);
  });
});
