// CHAT-FIX-02 — PD-16 guard on the ContactRail FALLBACK chat route (claudeComplete, chat mode).
// SYNTHETIC data, EMULATOR + LOOPBACK ONLY, ANTHROPIC STUBBED. Not a production PASS.
//
// Run:  npm run test:chat
//
// How: the CURRENT functions/index.js `claudeComplete` handler is mounted on a local express server
// bound to 127.0.0.1 and called with real HTTP requests (loopback). Its call to api.anthropic.com is
// answered by a scripted stub; every other outbound call is blocked; the environment is restored after.
//
// What it does NOT prove (reported as such):
//   * the stub says nothing about the real model;
//   * the "receptionTurn unusable -> fallback" sequence is only the SERVER-SIDE sequence this test
//     simulates; it does not prove that the ContactRail BROWSER code switches routes (that decision is
//     only read from source here; a real browser run is NOT-TESTED);
//   * the codes the existing ContactRail code accepts for falling back are reported as "allowed by the
//     existing code", not as safe; this change does not alter that policy.

const fs = require("fs");
const path = require("path");
const http = require("http");
const assert = require("assert");
const { PROJECT_ID, assertEmulatorOnly, record, printSummary } = require("../helpers/synthetic");
const { install, FAKE_KEY, snapshot, diffSnapshots } = require("./stub-anthropic");

assertEmulatorOnly();

const ROOT = path.join(__dirname, "..", "..");
const FUNCTIONS_DIR = path.join(ROOT, "functions");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const FALLBACK = "ขออภัยค่ะ ตอนนี้ยังเรียบเรียงคำตอบได้ไม่สมบูรณ์ รบกวนส่งข้อความล่าสุดอีกครั้งนะคะ";
const REASONS = ["retry_failed", "retry_still_male", "retry_unsafe"];
const MALE = "ได้ครับ ขอทราบพื้นที่เพิ่มเติมได้ไหมครับ";
const FEM = "ได้ค่ะ ขอทราบพื้นที่เพิ่มเติมได้ไหมคะ";
const hasMale = (s) => /ครับ|ผม/.test(String(s).replace(/"[^"\n]*"|“[^”\n]*”/g, " "));
const rec = (id, title, label, note) => record({ id, title, label, note });

let iso, snapBefore, admin, fns, server, base, loadError = null;

function needFns() {
  if (loadError) throw new Error("functions/index.js (or express) could not be loaded in-process: " + String(loadError.message).split("\n")[0] + " (run `npm ci` in functions/)");
}
const baseMessages = (text) => [{ role: "user", content: text || "ขายบ้านหัวหิน" }];
const SYSTEM = "SYNTHETIC SYSTEM PROMPT";

// Real HTTP request to the local server (loopback only).
async function post(body) {
  const res = await fetch(base, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  let json = null; try { json = await res.json(); } catch (e) { json = null; }
  return { status: res.status, json };
}
const chat = (extra, text) => post(Object.assign({ system: SYSTEM, messages: baseMessages(text) }, extra || {}));
const T = (s) => ({ __text: s });

describe("CHAT-FIX-02: PD-16 guard on the fallback chat route (claudeComplete) — loopback HTTP, stubbed model", function () {
  this.timeout(60000);

  before(async () => {
    snapBefore = snapshot();
    iso = install();
    const during = diffSnapshots(snapBefore, snapshot());
    assert.ok(during.length >= 5, "sanity: installing the stub must change the process: " + JSON.stringify(during));
    try {
      admin = require(require.resolve("firebase-admin", { paths: [FUNCTIONS_DIR] }));
      fns = require(path.join(FUNCTIONS_DIR, "index.js"));
      const express = require(require.resolve("express", { paths: [FUNCTIONS_DIR] }));
      const app = express();
      app.use(express.json({ limit: "1mb" }));
      app.all("/", fns.claudeComplete);
      server = http.createServer(app);
      await new Promise((r) => server.listen(0, "127.0.0.1", r));
      base = "http://127.0.0.1:" + server.address().port + "/";
    } catch (e) { loadError = e; }
  });
  beforeEach(async () => {
    iso.resetCalls();
    iso.setScript([]);
    if (!loadError) { // start every test from an empty emulator: any write by the code under test would show up
      await fetch("http://" + process.env.FIRESTORE_EMULATOR_HOST + "/emulator/v1/projects/" + PROJECT_ID + "/databases/(default)/documents", { method: "DELETE" });
    }
  });
  after(async () => {
    if (server) await new Promise((r) => server.close(r));
    const blockedAtEnd = iso.blocked.slice();
    iso.restore();
    const diffs = diffSnapshots(snapBefore, snapshot());
    const restored = iso.isRestored() && diffs.length === 0;
    rec("X8", "after the run fetch, http/https request+get and every touched env var equal their pre-install state", restored ? "CONTROL" : "CONTROL-FAILED", restored ? "identical to pre-install snapshot" : JSON.stringify(diffs));
    printSummary();
    assert.ok(restored, "isolation was not restored: " + JSON.stringify(diffs));
    assert.strictEqual(blockedAtEnd.length, 0, "outbound calls were attempted: " + JSON.stringify(blockedAtEnd));
  });

  async function emptyFirestore() {
    const db = admin.firestore();
    for (const c of ["conversations", "propertyDrafts", "properties"]) if (!(await db.collection(c).limit(1).get()).empty) return false;
    return true;
  }

  // ── G: guard:"pd16" in chat mode ─────────────────────────────────────────────────────────
  it("G1 male first reply + clean retry => clean reply, exactly { completion }, 2 stub calls", async () => {
    needFns();
    iso.setScript([T(MALE), T(FEM)]);
    const r = await chat({ guard: "pd16" });
    const ok = r.status === 200 && r.json.completion === FEM && JSON.stringify(Object.keys(r.json)) === '["completion"]' && iso.anthropicCalls.length === 2;
    rec("G1", "guard:'pd16': male reply rewritten by a clean retry; response shape stays { completion }", ok ? "CONTROL" : "CONTROL-FAILED", "status=" + r.status + " keys=" + Object.keys(r.json || {}) + " calls=" + iso.anthropicCalls.length);
    assert.ok(ok);
  });

  const fallbackCases = [
    ["G2", "retry STILL male", T(MALE), T("ผมขอทราบพื้นที่ครับ"), "retry_still_male"],
    ["G3a", "retry CHANGES THE PRICE", T("ราคา 5,000,000 บาทครับ"), T("ราคา 6,000,000 บาทค่ะ"), "retry_unsafe"],
    ["G3b", "retry DROPS the property code", T("รหัส HH-109 สนใจไหมครับ"), T("รหัส 109 สนใจไหมคะ"), "retry_unsafe"],
    ["G3c", "retry DROPS the [[CONTACT]] token", T("ติดต่อเราได้ครับ [[CONTACT]]"), T("ติดต่อเราได้ค่ะ"), "retry_unsafe"],
    ["G3d", "retry ADDS a [[CONTACT]] token", T("ขอข้อมูลเพิ่มครับ"), T("ขอข้อมูลเพิ่มค่ะ [[CONTACT]]"), "retry_unsafe"],
    ["G3e", "retry DROPS the [[LIST_PROPERTY]] token", T("ฝากขายได้ครับ [[LIST_PROPERTY]]"), T("ฝากขายได้ค่ะ"), "retry_unsafe"],
    ["G3f", "retry ADDS a [[LIST_PROPERTY]] token", T("ขอข้อมูลเพิ่มครับ"), T("ขอข้อมูลเพิ่มค่ะ [[LIST_PROPERTY]]"), "retry_unsafe"],
    ["G3g", "retry CHANGES a quoted span", T("ลูกค้าเขียนว่า \"สนใจ\" ครับ"), T("ลูกค้าเขียนว่า \"ไม่สนใจ\" ค่ะ"), "retry_unsafe"],
    ["G3h", "retry is EMPTY", T(MALE), T("   "), "retry_unsafe"],
    ["G4a", "retry call THROWS", T(MALE), { __throw: "simulated retry failure" }, "retry_failed"],
    ["G4b", "retry call answers HTTP 500", T(MALE), { __http: 500 }, "retry_failed"],
  ];
  fallbackCases.forEach(([id, title, first, retry, reason], i) => {
    it(id + " guard:'pd16': " + title + " => fixed fallback, <=2 calls, { completion } only, nothing stored", async () => {
      needFns();
      iso.setScript([first, retry]);
      const r = await chat({ guard: "pd16" }, "ข้อความลูกค้า-" + i);
      const bad = [];
      if (r.status !== 200) bad.push("status " + r.status);
      if (!r.json || r.json.completion !== FALLBACK) bad.push("completion is not the fixed fallback: " + (r.json && r.json.completion));
      if (JSON.stringify(Object.keys(r.json || {})) !== '["completion"]') bad.push("response has extra fields: " + Object.keys(r.json || {}));
      if (hasMale(r.json && r.json.completion) || /\[\[/.test((r.json && r.json.completion) || "")) bad.push("male voice or token in the fallback");
      if (iso.anthropicCalls.length !== 2) bad.push("stub calls=" + iso.anthropicCalls.length + " (first + exactly one retry)");
      if (!(await emptyFirestore())) bad.push("something was written to Firestore (conversation/draft/case)");
      rec(id, "guard:'pd16': " + title + " => fixed female fallback; { completion } only; max 2 calls; no Firestore write",
        bad.length ? "CONTROL-FAILED" : "CONTROL", bad.length ? "failed: " + bad.join("; ") : "reason=" + reason + " · 2 stub calls · nothing stored");
      assert.deepStrictEqual(bad, []);
    });
  });

  it("G5 first-call failure keeps the ORIGINAL error behaviour (no retry, no fallback) — compared with the same request without guard", async () => {
    needFns();
    const results = {};
    for (const [name, first] of [["throw", { __throw: "simulated first-call failure" }], ["http429", { __http: 429 }]]) {
      iso.resetCalls(); iso.setScript([first]);
      const withGuard = await chat({ guard: "pd16" });
      const callsG = iso.anthropicCalls.length;
      iso.resetCalls(); iso.setScript([first]);
      const without = await chat({});
      results[name] = { withGuard, without, callsG, callsN: iso.anthropicCalls.length };
    }
    const bad = [];
    for (const [name, x] of Object.entries(results)) {
      if (x.withGuard.status !== x.without.status || JSON.stringify(x.withGuard.json) !== JSON.stringify(x.without.json)) bad.push(name + ": guard changes the error answer");
      if (x.withGuard.json && x.withGuard.json.completion === FALLBACK) bad.push(name + ": error turned into the fallback");
      if (x.callsG !== 1 || x.callsN !== 1) bad.push(name + ": retry attempted after a first-call failure");
    }
    rec("G5", "first model call fails: same status/body as without guard, 1 call, never the fallback", bad.length ? "CONTROL-FAILED" : "CONTROL",
      bad.length ? bad.join("; ") : "throw → " + results.throw.withGuard.status + " · http429 → " + results.http429.withGuard.status + " (identical to unguarded)");
    assert.deepStrictEqual(bad, []);
  });

  it("G6 clean / quoted / retry-clean / other languages unchanged: 1 call, no fallback", async () => {
    needFns();
    const samples = [FEM, "ลูกค้าท่านหนึ่งเขียนว่า \"ผมสนใจครับ\" ค่ะ",
      "Sure, could you tell me the area?", "Конечно, укажите район?", "好的，请问位于哪个区域？", "Gern, in welchem Gebiet liegt es?", "Gjerne, hvilket område er det?", "Bien sûr, dans quel secteur ?", "Certo, in quale zona si trova?"];
    let same = 0;
    for (const t of samples) {
      iso.resetCalls(); iso.setScript([T(t)]);
      const r = await chat({ guard: "pd16" });
      if (r.json && r.json.completion === t && iso.anthropicCalls.length === 1) same++;
    }
    rec("G6", "guard:'pd16': clean Thai, quoted ครับ/ผม and the 7 other languages pass through unchanged (1 call each)", same === samples.length ? "CONTROL" : "CONTROL-FAILED", "unchanged " + same + "/" + samples.length);
    assert.strictEqual(same, samples.length);
  });

  it("G7 guard keeps the original request parameters: first call body identical with/without guard; retry = same model/max_tokens/system + 2 messages", async () => {
    needFns();
    iso.setScript([T(FEM)]);
    await chat({ max_tokens: 777 });
    const plain = iso.anthropicCalls[0].body;
    iso.resetCalls(); iso.setScript([T(MALE), T(FEM)]);
    await chat({ guard: "pd16", max_tokens: 777 });
    const [c1, c2] = iso.anthropicCalls.map((c) => c.body);
    const bad = [];
    if (JSON.stringify(c1) !== JSON.stringify(plain)) bad.push("first call body differs with guard");
    for (const k of ["model", "max_tokens", "system"]) if (c2[k] !== c1[k]) bad.push("retry " + k + " differs");
    if (c2.messages.length !== c1.messages.length + 2 || c2.messages[c2.messages.length - 2].role !== "assistant" || c2.messages[c2.messages.length - 1].role !== "user") bad.push("retry messages shape");
    rec("G7", "guard does not alter the first model request; retry only appends the assistant reply + rewrite note (max_tokens passes through, never used to decide the guard)", bad.length ? "CONTROL-FAILED" : "CONTROL", bad.length ? bad.join("; ") : "max_tokens=" + c1.max_tokens + " forwarded to both calls");
    assert.deepStrictEqual(bad, []);
  });

  it("G8 log lines hold only a fixed reason code (no customer text, model text, tokens, code, error detail, key)", async () => {
    needFns();
    const CUSTOMER = "ข้อความลูกค้า-SYN-LOG";
    const lines = [];
    const orig = { log: console.log, warn: console.warn, error: console.error, info: console.info };
    for (const k of Object.keys(orig)) console[k] = (...a) => { lines.push(a.map((v) => (typeof v === "string" ? v : JSON.stringify(v))).join(" ")); };
    try {
      for (const [first, retry] of [[T(MALE + " [[CONTACT]] HH-109"), T("ผมขอทราบครับ")], [T("ราคา 5,000,000 ครับ"), T("ราคา 6,000,000 ค่ะ")], [T(MALE), { __throw: "SECRET-ERROR-DETAIL-XYZ" }]]) {
        iso.setScript([first, retry]);
        await chat({ guard: "pd16" }, CUSTOMER);
      }
    } finally { Object.assign(console, orig); }
    const all = lines.join("\n");
    const reasons = lines.filter((l) => l.includes("\"event\":\"pd16_fallback\"")).map((l) => { try { return JSON.parse(l.slice(l.indexOf("{"))).reason; } catch (e) { return "UNPARSEABLE"; } });
    const bad = [];
    if (reasons.length !== 3 || reasons.some((x) => !REASONS.includes(x))) bad.push("reasons=" + JSON.stringify(reasons));
    for (const [label, needle] of [["customer text", CUSTOMER], ["first reply text", "ขอทราบพื้นที่เพิ่มเติม"], ["retry text", "ผมขอทราบครับ"], ["CONTACT token", "[[CONTACT]]"], ["property code", "HH-109"], ["error detail", "SECRET-ERROR-DETAIL-XYZ"], ["fallback text", "ขออภัยค่ะ"], ["api key", FAKE_KEY]]) if (all.includes(needle)) bad.push("log contains " + label);
    rec("G8", "pd16_fallback log = fixed reason code only", bad.length ? "CONTROL-FAILED" : "CONTROL", bad.length ? bad.join("; ") : "reasons=" + reasons.join(",") + " · " + lines.length + " log lines scanned");
    assert.deepStrictEqual(bad, []);
  });

  // ── U: everything WITHOUT the exact opt-in stays as before ────────────────────────────
  it("U1 no guard => male reply passes unchanged (translation-like request included), 1 call", async () => {
    needFns();
    iso.setScript([T(MALE)]);
    const r1 = await post({ system: "You are a translation engine, NOT an assistant. Translate the INPUT into Thai and output the translation ONLY.", messages: [{ role: "user", content: "ผมชื่อสมชายครับ" }], max_tokens: 4000 });
    iso.setScript([T(MALE)]);
    const r2 = await chat({});
    const ok = r1.json.completion === MALE && r2.json.completion === MALE && iso.anthropicCalls.length === 2;
    rec("U1", "no guard: male-voiced text (e.g. translating a customer's words) is returned unchanged; no retry", ok ? "CONTROL" : "CONTROL-FAILED", "calls=" + iso.anthropicCalls.length);
    assert.ok(ok);
  });
  it("U2 other guard values are ignored (strict match only)", async () => {
    needFns();
    const values = ["PD16", "pd16 ", " pd16", "pd-16", "", "true", true, 1, null, ["pd16"], { guard: "pd16" }];
    let unchanged = 0;
    for (const v of values) {
      iso.resetCalls(); iso.setScript([T(MALE)]);
      const r = await chat({ guard: v });
      if (r.json && r.json.completion === MALE && iso.anthropicCalls.length === 1) unchanged++;
    }
    rec("U2", "guard values other than the exact string 'pd16' are ignored (" + values.length + " variants)", unchanged === values.length ? "CONTROL" : "CONTROL-FAILED", "unchanged " + unchanged + "/" + values.length);
    assert.strictEqual(unchanged, values.length);
  });
  it("U3 the guard is NOT triggered by the prompt or by max_tokens", async () => {
    needFns();
    const femalePrompt = "WHEN WRITING THAI, your own voice is FEMALE. End statements with \"ค่ะ\"";
    let unchanged = 0, total = 0;
    for (const extra of [{ system: femalePrompt }, { max_tokens: 500 }, { max_tokens: 600 }, { max_tokens: 4000 }, { system: femalePrompt, max_tokens: 500 }]) {
      total++;
      iso.resetCalls(); iso.setScript([T(MALE)]);
      const r = await post(Object.assign({ messages: baseMessages() }, extra));
      if (r.json && r.json.completion === MALE && iso.anthropicCalls.length === 1) unchanged++;
    }
    rec("U3", "without guard, a ContactRail-style Thai-female prompt or max_tokens 500/600/4000 does NOT enable the guard", unchanged === total ? "CONTROL" : "CONTROL-FAILED", "unchanged " + unchanged + "/" + total);
    assert.strictEqual(unchanged, total);
  });
  it("U4 single-turn content/tool mode ignores guard:'pd16' (guard works in chat mode only)", async () => {
    needFns();
    iso.setScript([T(MALE)]);
    const r1 = await post({ content: [{ type: "text", text: "สรุปให้หน่อย" }], guard: "pd16" });
    const text1 = r1.json && r1.json.completion;
    iso.resetCalls();
    iso.setScript([{ ok: true }]);
    // tool mode: the stub answers with a tool_use block
    const r2 = await post({ content: [{ type: "text", text: "x" }], tool: { name: "t", input_schema: { type: "object", properties: {} } }, guard: "pd16" });
    const ok = text1 === MALE && iso.anthropicCalls.length === 1 && r2.json && r2.json.result && r2.json.result.ok === true;
    rec("U4", "single-turn content (and tool) mode: guard:'pd16' has no effect (male text returned unchanged, 1 call)", ok ? "CONTROL" : "CONTROL-FAILED", "content-mode completion unchanged=" + (text1 === MALE) + " · tool-mode result passed through=" + !!(r2.json && r2.json.result));
    assert.ok(ok);
  });
  it("U5 non-POST still answers 405 (unchanged)", async () => {
    needFns();
    const res = await fetch(base, { method: "GET" });
    rec("U5", "GET is still rejected with 405", res.status === 405 ? "CONTROL" : "CONTROL-FAILED", "status=" + res.status);
    assert.strictEqual(res.status, 405);
  });

  // ── R: receptionTurn unusable -> fallback route (SERVER-SIDE sequence only) ─────────────
  it("R1 receptionTurn without auth is refused BEFORE any model call and writes nothing; the same text then goes to the guarded fallback route (server-side sequence simulated by this test)", async () => {
    needFns();
    let code = "no error";
    try { await fns.receptionTurn.run({ auth: undefined, data: { customerText: "ขายบ้านหัวหิน", messages: baseMessages() }, rawRequest: {} }); } catch (e) { code = e && e.code; if (code !== "unauthenticated") throw e; }
    const callsAfterReception = iso.anthropicCalls.length;
    const emptyAfterReception = await emptyFirestore();
    iso.setScript([T(MALE), T("ผมขอทราบพื้นที่ครับ")]);
    const r = await chat({ guard: "pd16" }, "ขายบ้านหัวหิน");
    const ok = code === "unauthenticated" && callsAfterReception === 0 && emptyAfterReception && r.json.completion === FALLBACK && (await emptyFirestore());
    rec("R1", "receptionTurn(no auth) -> 'unauthenticated', 0 model calls, nothing written; then the fallback route is guarded (simulated server-side sequence — NOT a browser verification)", ok ? "CONTROL" : "CONTROL-FAILED", "code=" + code + " modelCallsBeforeFallback=" + callsAfterReception + " fallbackReply=" + (r.json.completion === FALLBACK ? "fixed fallback" : r.json.completion));
    assert.ok(ok);
  });
  it("R2 receptionTurn with invalid arguments is refused BEFORE any model call; then the guarded fallback route answers", async () => {
    needFns();
    let code = "no error";
    try { await fns.receptionTurn.run({ auth: { uid: "syn-r2-uid", token: {} }, data: { messages: baseMessages() }, rawRequest: {} }); } catch (e) { code = e && e.code; if (code !== "invalid-argument") throw e; }
    const calls = iso.anthropicCalls.length;
    iso.setScript([T(MALE), T(FEM)]);
    const r = await chat({ guard: "pd16" });
    const ok = code === "invalid-argument" && calls === 0 && r.json.completion === FEM && (await emptyFirestore());
    rec("R2", "receptionTurn(invalid-argument) -> 0 model calls, nothing written; then the guarded fallback route rewrites a male reply (simulated server-side sequence — NOT a browser verification)", ok ? "CONTROL" : "CONTROL-FAILED", "code=" + code);
    assert.ok(ok);
  });

  // ── S: SOURCE CHECKS (read from the files; no browser) ─────────────────────────────────
  it("S1 source: ContactRail sends guard:'pd16' only on the legacy fetch; the preview path and the other callers do not", () => {
    const rail = read("ContactRail.dc.html");
    const legacy = rail.slice(rail.indexOf("fetch(CLOUD_FN.claudeComplete"), rail.indexOf("fetch(CLOUD_FN.claudeComplete") + 700);
    const bad = [];
    if ((rail.match(/guard:\s*"pd16"/g) || []).length !== 1) bad.push("guard:'pd16' count in ContactRail != 1");
    if (!/JSON\.stringify\(\{ system, messages, guard: "pd16" \}\)/.test(legacy)) bad.push("legacy fetch body does not carry guard");
    const previewLine = (rail.match(/window\.claude\.complete\(\{[^}]*\}\)/g) || []).join(" ");
    if (/guard/.test(previewLine)) bad.push("preview path carries guard");
    for (const f of ["Home.dc.html", "AI Concierge.dc.html", "AI Quick Add.dc.html", "Agent Profile.dc.html", "firebase-client.js"]) if (/guard:\s*"pd16"|"pd16"/.test(read(f))) bad.push(f + " sends guard");
    rec("S1", "SOURCE CHECK: opt-in only on ContactRail's fallback fetch; Home, AI Concierge, AI Quick Add, Agent Profile and firebase-client tools do NOT send it", bad.length ? "CONTROL-FAILED" : "CONTROL", bad.length ? bad.join("; ") : "1 opt-in in ContactRail; 0 elsewhere (source read, not a browser run)");
    assert.deepStrictEqual(bad, []);
  });
  it("S2 source: the error codes the EXISTING ContactRail code lets fall back to this route (policy unchanged by this change)", () => {
    const rail = read("ContactRail.dc.html");
    const fn = rail.slice(rail.indexOf("_receptionFallbackSafe(e) {"), rail.indexOf("_receptionFallbackSafe(e) {") + 600);
    const codes = (fn.match(/code === "([a-z-]+)"/g) || []).map((x) => x.replace(/code === "|"/g, "")).sort();
    const expected = ["invalid-argument", "not-found", "permission-denied", "unauthenticated", "unavailable"];
    const noCode = /!\(e && e\.code\)/.test(fn);
    const ok = JSON.stringify(codes) === JSON.stringify(expected) && noCode;
    rec("S2", "SOURCE CHECK: codes the existing code allows to fall back = not-found, unavailable, unauthenticated, invalid-argument, permission-denied, or no code. Reported as 'allowed by the existing code' — NOT called safe; this change does not alter that policy", ok ? "CONTROL" : "CONTROL-FAILED", "codes=" + codes.join(",") + " noCode=" + noCode);
    assert.ok(ok);
  });
  it("S3 source: the fixed fallback text triggers none of the button patterns of the three customer pages", () => {
    const files = { "ContactRail.dc.html": ["[[CONTACT]]", "[[LIST_PROPERTY]]", "list your property", "ฝากขาย", "ฝากเช่า", "เผยแพร่ทรัพย์"], "AI Concierge.dc.html": ["contact us", "ติดต่อเรา"], "Home.dc.html": ["list your property", "ฝากขาย", "ฝากเช่า", "เผยแพร่ทรัพย์"] };
    const bad = [];
    for (const [f, phrases] of Object.entries(files)) {
      const src = read(f);
      for (const ph of phrases) {
        if (!src.toLowerCase().includes(ph.toLowerCase())) bad.push(f + ": trigger phrase '" + ph + "' no longer found in source (check is stale)");
        if (FALLBACK.toLowerCase().includes(ph.toLowerCase())) bad.push("fallback contains trigger '" + ph + "'");
      }
    }
    if (/\b[A-Z]{2,4}-\d{2,6}\b/.test(FALLBACK)) bad.push("fallback contains a property code");
    rec("S3", "SOURCE CHECK: fallback text has no contact/list-property trigger phrase, token or property code used by ContactRail, AI Concierge or Home (so no button comes from it)", bad.length ? "CONTROL-FAILED" : "CONTROL", bad.length ? bad.join("; ") : "no trigger found (source phrases read from the three pages)");
    assert.deepStrictEqual(bad, []);
  });
  it("S4 source: Home and AI Concierge are NOT covered by this change — Thai female voice there is NOT certified", () => {
    const home = read("Home.dc.html"), concierge = read("AI Concierge.dc.html");
    const homeHasRule = /WHEN WRITING THAI, your own voice is FEMALE/.test(home);
    const homeNote = /NO gender \/ pronoun \/ politeness replacement/.test(home);
    const conciergeHasRule = /WHEN WRITING THAI, your own voice is FEMALE/.test(concierge);
    rec("S4", "Home and AI Concierge call claudeComplete WITHOUT the guard: no server-side Thai female-voice protection; Home's prompt has no female-voice rule and a recorded owner decision (22 Sep) against gender/pronoun replacement; AI Concierge has the rule in its prompt only. Female voice for BOTH pages is NOT certified (out of scope here)",
      "GAP-CONFIRMED", "Home prompt has female rule=" + homeHasRule + ", records no-replacement decision=" + homeNote + " · AI Concierge prompt has female rule=" + conciergeHasRule + " · neither sends guard");
  });

  // ── pending (recorded, then skipped => mocha 'pending', never 'passing') ───────────────────
  function notTested(id, title, reason) {
    it(id + " " + title + " [NOT-TESTED]", function () { rec(id, title, "NOT-TESTED", reason); this.skip(); });
  }
  notTested("B1", "real browser: ContactRail actually switching to this route when receptionTurn is unusable, and showing the fallback bubble", "needs a real browser session on a test page; R1/R2 only simulate the server-side order and S2 only reads the code list from source");
  notTested("B2", "real Anthropic model on this route (how often Thai replies are male-voiced; quality of the fallback turn)", "stub only");
  notTested("B3", "combined deploy order: Function with guard support + page that sends the opt-in, together", "not deployed; the guard is effective only when BOTH the deployed Function supports it AND the deployed page sends it. A page merged before the Function is deployed changes nothing (the old Function ignores the field); a Function deployed without the page changes nothing (no caller opts in)");
  notTested("B4", "Thai female voice on Home and AI Concierge", "not covered by this change; not certified");
});
