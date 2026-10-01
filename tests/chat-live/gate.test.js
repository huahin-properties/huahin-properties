// CHAT-LIVE-01 — access gate + AI-call cap (functions/chat-test-gate.js), 5 gated handlers.
// SYNTHETIC data, FIRESTORE + AUTH EMULATORS ONLY (project demo-sec-test-01), loopback only, ANTHROPIC STUBBED.
// No credentials. NOT a production PASS and not a test of the real model.
//
// The Firestore/Auth emulators stay on the demo-* project (assertEmulatorOnly is unchanged). The gate's own
// project-id decision is driven through dependency injection (sharedGate().__testOnly.setProjectIdProvider),
// so "production", "test project" and "unknown project" branches are all exercised without ever pointing a
// database or credentials at a real project.
//
// Run:  npm run test:chat-live-gate
"use strict";
const fs = require("fs");
const path = require("path");
const http = require("http");
const assert = require("assert");
const { initializeTestEnvironment } = require("@firebase/rules-unit-testing");
const { PROJECT_ID, assertEmulatorOnly, attempt } = require("../helpers/synthetic");
const { install, snapshot, diffSnapshots } = require("../chat/stub-anthropic");

assertEmulatorOnly();
const AUTH_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST;
if (!AUTH_HOST || !/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(AUTH_HOST)) throw new Error("gate tests refuse to run: FIREBASE_AUTH_EMULATOR_HOST missing or not loopback (" + AUTH_HOST + ")");

const ROOT = path.join(__dirname, "..", "..");
const FUNCTIONS_DIR = path.join(ROOT, "functions");
const RULES = fs.readFileSync(path.join(ROOT, "firestore.rules"), "utf8");
const GATE_SRC = path.join(FUNCTIONS_DIR, "chat-test-gate.js");
const TEST_PID = "huahin-chat-test-sim", PROD_PID = "huahin-properties-5f1b5";
const FALLBACK = "ขออภัยค่ะ ตอนนี้ยังเรียบเรียงคำตอบได้ไม่สมบูรณ์ รบกวนส่งข้อความล่าสุดอีกครั้งนะคะ";
const MALE = "ได้ครับ ขอทราบพื้นที่เพิ่มเติมได้ไหมครับ", FEM = "ได้ค่ะ ขอทราบพื้นที่เพิ่มเติมได้ไหมคะ";
const rx = (reply) => ({ reply, stage: "general", primaryIntent: "OTHER" }); // scripted tool-use output
const T = (s) => ({ __text: s });

let iso, snapBefore, admin, fns, gate, testEnv, server, base, loadError = null;
const db = () => admin.firestore();
const setPid = (pid) => gate.__testOnly.setProjectIdProvider(() => pid);

const callable = (name, uid, data) => fns[name].run({ auth: uid ? { uid, token: {} } : undefined, data: data || {}, rawRequest: {} });
const turn = (uid, text) => callable("receptionTurn", uid, { customerText: text || "สวัสดี", messages: [{ role: "user", content: text || "สวัสดี" }] });
async function code(p) { try { await p; return "OK"; } catch (e) { return e && e.code ? String(e.code).replace(/^functions\//, "") : "ERR:" + (e && e.message); } }

async function mkToken() { // real Auth-emulator anonymous sign-up -> { uid, idToken }
  const r = await fetch("http://" + AUTH_HOST + "/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-key", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ returnSecureToken: true }) });
  const j = await r.json(); assert.ok(j.idToken && j.localId, "auth emulator did not return a token");
  return { uid: j.localId, idToken: j.idToken };
}
async function post(body, token, extraHeaders) {
  const headers = Object.assign({ "content-type": "application/json" }, token ? { authorization: "Bearer " + token } : {}, extraHeaders || {});
  const res = await fetch(base, { method: "POST", headers, body: JSON.stringify(body) });
  let json = null; try { json = await res.json(); } catch (e) {}
  return { status: res.status, json };
}
const chat = (token, extra) => post(Object.assign({ system: "SYNTHETIC", messages: [{ role: "user", content: "ขายบ้านหัวหิน" }] }, extra || {}), token);
const allow = (uid) => db().doc("chatTestAllow/" + uid).set({ enabled: true });
const limits = (g, u) => db().doc("chatTestConfig/limits").set({ globalCap: g, perUidCap: u });
const used = async (p) => { const s = await db().doc(p).get(); return s.exists ? s.data().used : 0; };
async function dataDocs() { let n = 0; for (const c of ["conversations", "propertyDrafts", "properties", "chatTestQuota"]) n += (await db().collection(c).get()).size; return n; }

describe("CHAT-LIVE-01 gate: allow-list, ID token, atomic AI-call cap (emulators + stub)", function () {
  this.timeout(120000);
  before(async () => {
    snapBefore = snapshot(); iso = install();
    testEnv = await initializeTestEnvironment({ projectId: PROJECT_ID, firestore: { rules: RULES } });
    try {
      admin = require(require.resolve("firebase-admin", { paths: [FUNCTIONS_DIR] }));
      fns = require(path.join(FUNCTIONS_DIR, "index.js"));
      gate = require(GATE_SRC).sharedGate();
      const express = require(require.resolve("express", { paths: [FUNCTIONS_DIR] }));
      const app = express(); app.use(express.json({ limit: "1mb" })); app.all("/", fns.claudeComplete);
      server = http.createServer(app); await new Promise((r) => server.listen(0, "127.0.0.1", r));
      base = "http://127.0.0.1:" + server.address().port + "/";
    } catch (e) { loadError = e; }
    if (loadError) throw loadError;
  });
  beforeEach(async () => { await testEnv.clearFirestore(); iso.resetCalls(); iso.setScript([]); setPid(TEST_PID); });
  after(async () => {
    if (server) await new Promise((r) => server.close(r));
    if (gate) gate.__testOnly.reset(); // put the ORIGINAL runtime provider back (not a stand-in that returns undefined)
    const blocked = iso.blocked.slice(); iso.restore();
    const diffs = diffSnapshots(snapBefore, snapshot());
    await testEnv.cleanup();
    const gm = require(GATE_SRC);
    assert.strictEqual(gate.__testOnly.isRuntimeProvider(), true, "the original runtime provider must be back");
    assert.strictEqual(gate.state(), gm.stateFor(gm.runtimeProjectId(process.env), process.env), "gate state must equal what the runtime itself yields, not a simulated state left behind");
    assert.strictEqual(gate.state(), "off", "under the local emulator + demo-* the runtime state is off");
    assert.strictEqual(diffs.length, 0, "isolation not restored: " + JSON.stringify(diffs));
    assert.strictEqual(blocked.length, 0, "outbound calls attempted: " + JSON.stringify(blocked));
  });

  // ── state decision ──────────────────────────────────────────────────────
  it("GT1 project-id -> state table: production/demo = off; huahin-chat-test-* = enforce; everything else (incl. look-alikes, null) = deny", () => {
    const { stateFor, runtimeProjectId } = require(GATE_SRC);
    const EMU = { FIRESTORE_EMULATOR_HOST: "127.0.0.1:8381", FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9199" };
    const off = [PROD_PID], on = [TEST_PID, "huahin-chat-test-a1", "huahin-chat-test-a-b-c"];
    const deny = [null, undefined, "", "other-project", PROD_PID + "x", "x" + PROD_PID, "HUAHIN-PROPERTIES-5F1B5", "huahin-chat-test-", "huahin-chat-test", "huahin-chat-test-UPPER", "huahin-chat-test--a", "huahin-chat-test-" + "x".repeat(20), "demo-", "demo_x", "my-test-project", 42, {}];
    off.forEach((p) => { assert.strictEqual(stateFor(p, {}), "off", "production, exact match, no emulator needed"); assert.strictEqual(stateFor(p, EMU), "off"); assert.strictEqual(stateFor(p, { FIRESTORE_EMULATOR_HOST: "firestore.googleapis.com:443" }), "off", "production id keeps the existing behaviour whatever the env says"); });
    on.forEach((p) => { assert.strictEqual(stateFor(p, {}), "enforce"); assert.strictEqual(stateFor(p, EMU), "enforce", "emulator variables never switch a test-project id off"); }); deny.forEach((p) => { assert.strictEqual(stateFor(p, {}), "deny", JSON.stringify(p)); assert.strictEqual(stateFor(p, EMU), "deny", "unknown id stays deny even with emulator evidence: " + JSON.stringify(p)); });
    assert.strictEqual(runtimeProjectId({ GCLOUD_PROJECT: TEST_PID }), TEST_PID);
    assert.strictEqual(runtimeProjectId({ GCLOUD_PROJECT: TEST_PID, GOOGLE_CLOUD_PROJECT: PROD_PID }), null, "disagreeing sources -> unknown");
    assert.strictEqual(runtimeProjectId({ FIREBASE_CONFIG: "{not json", GCLOUD_PROJECT: PROD_PID }), null, "unparseable config -> unknown, never production");
    assert.strictEqual(runtimeProjectId({ FIREBASE_CONFIG: JSON.stringify({ projectId: TEST_PID }), GCLOUD_PROJECT: TEST_PID }), TEST_PID);
    assert.strictEqual(runtimeProjectId({}), null);
    assert.strictEqual(stateFor(runtimeProjectId({})), "deny");
  });

  it("GT1b demo-* switches the gate off ONLY with runtime evidence of a local emulator; the name alone, or any external endpoint, is deny", () => {
    const { stateFor, emulatorEvidence } = require(GATE_SRC);
    const L = "127.0.0.1:8381";
    // evidence present -> off (existing suites keep running)
    for (const env of [{ FIRESTORE_EMULATOR_HOST: L }, { FIRESTORE_EMULATOR_HOST: "localhost:8080" }, { FIRESTORE_EMULATOR_HOST: "[::1]:8080" }, { FIRESTORE_EMULATOR_HOST: L, FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9199", FIREBASE_STORAGE_EMULATOR_HOST: "127.0.0.1:9299" }])
      assert.strictEqual(stateFor("demo-sec-test-01", env), "off", JSON.stringify(env));
    // no emulator flag, or an endpoint that is not loopback -> deny
    const bad = [{}, { GCLOUD_PROJECT: "demo-sec-test-01" }, { FIRESTORE_EMULATOR_HOST: "" }, { FIRESTORE_EMULATOR_HOST: "firestore.googleapis.com:443" }, { FIRESTORE_EMULATOR_HOST: "10.0.0.5:8080" },
      { FIRESTORE_EMULATOR_HOST: "127.0.0.1.evil.example:8080" }, { FIRESTORE_EMULATOR_HOST: "localhost.evil.example:8080" }, { FIRESTORE_EMULATOR_HOST: "evil.example/127.0.0.1" }, { FIRESTORE_EMULATOR_HOST: "0.0.0.0:8080" },
      { FIRESTORE_EMULATOR_HOST: L, FIREBASE_AUTH_EMULATOR_HOST: "identitytoolkit.googleapis.com" }, { FIRESTORE_EMULATOR_HOST: L, FIREBASE_STORAGE_EMULATOR_HOST: "storage.googleapis.com" },
      { FIRESTORE_EMULATOR_HOST: L, FIREBASE_DATABASE_EMULATOR_HOST: "db.example.com:9000" }, { FIRESTORE_EMULATOR_HOST: L, PUBSUB_EMULATOR_HOST: "pubsub.googleapis.com" }, { FIRESTORE_EMULATOR_HOST: L, FIREBASE_AUTH_EMULATOR_HOST: "" },
      { FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9199" } /* auth flag alone is not Firestore evidence */, { FIRESTORE_EMULATOR_HOST: 8381 }];
    for (const env of bad) { assert.strictEqual(stateFor("demo-sec-test-01", env), "deny", JSON.stringify(env)); assert.strictEqual(emulatorEvidence(env), false); }
    // the live process: really running under the local emulator -> off; remove the flag (synchronously, restored in finally) -> deny; external endpoint -> deny
    const saved = process.env.FIRESTORE_EMULATOR_HOST, savedAuth = process.env.FIREBASE_AUTH_EMULATOR_HOST;
    const g = require(GATE_SRC).createGate({ admin: {}, HttpsError: Error, getProjectId: () => "demo-sec-test-01" });
    try {
      assert.strictEqual(g.state(), "off", "sanity: this run is under the local emulator");
      delete process.env.FIRESTORE_EMULATOR_HOST; assert.strictEqual(g.state(), "deny", "demo-* without the emulator flag");
      process.env.FIRESTORE_EMULATOR_HOST = "firestore.googleapis.com:443"; assert.strictEqual(g.state(), "deny", "demo-* with an external endpoint");
      process.env.FIRESTORE_EMULATOR_HOST = saved; process.env.FIREBASE_AUTH_EMULATOR_HOST = "identitytoolkit.googleapis.com"; assert.strictEqual(g.state(), "deny", "external auth endpoint");
    } finally { process.env.FIRESTORE_EMULATOR_HOST = saved; if (savedAuth === undefined) delete process.env.FIREBASE_AUTH_EMULATOR_HOST; else process.env.FIREBASE_AUTH_EMULATOR_HOST = savedAuth; }
    assert.strictEqual(g.state(), "off", "environment restored");
  });

  it("GT1c demo-* without evidence refuses every gated handler (no model call, nothing written); the same ids with evidence behave as before", async () => {
    const u = await mkToken(); await allow(u.uid); await limits(100, 100); iso.setScript([rx(FEM), T(FEM)]);
    setPid("demo-sec-test-01"); const saved = process.env.FIRESTORE_EMULATOR_HOST;
    let codes, h;
    delete process.env.FIRESTORE_EMULATOR_HOST;
    try { codes = [await code(turn(u.uid)), await code(callable("getPropertyDraft", u.uid))]; h = await chat(u.idToken); } finally { process.env.FIRESTORE_EMULATOR_HOST = saved; }
    assert.deepStrictEqual(codes, ["permission-denied", "permission-denied"]); assert.strictEqual(h.status, 403);
    assert.strictEqual(iso.anthropicCalls.length, 0); assert.strictEqual(await dataDocs(), 0);
    assert.strictEqual(await code(turn("syn-demo-uid")), "OK", "with the emulator evidence back, demo-* is off and the unchanged behaviour returns");
  });

  it("GT2 the project id comes only from the runtime: nothing in the request (body, header, auth token claims) can change the state", async () => {
    setPid(TEST_PID); const u = await mkToken();
    const sneaky = { projectId: PROD_PID, project: PROD_PID, gateState: "off", "x-project-id": PROD_PID };
    iso.setScript([rx("ok")]);
    assert.strictEqual(await code(callable("receptionTurn", u.uid, Object.assign({ customerText: "hi", messages: [{ role: "user", content: "hi" }] }, sneaky))), "permission-denied");
    const r = await post(Object.assign({ system: "S", messages: [{ role: "user", content: "x" }] }, sneaky), u.idToken, { "x-project-id": PROD_PID, "x-forwarded-project": PROD_PID });
    assert.strictEqual(r.status, 403); assert.strictEqual(iso.anthropicCalls.length, 0);
    assert.strictEqual(await code(fns.getPropertyDraft.run({ auth: { uid: u.uid, token: { firebase: { project_id: PROD_PID }, aud: PROD_PID } }, data: sneaky, rawRequest: { headers: { "x-project-id": PROD_PID } } })), "permission-denied");
  });

  it("GT3 UNKNOWN project id => every gated handler refuses (never treated as production), AI = 0, nothing written", async () => {
    const u = await mkToken(); await allow(u.uid); await limits(100, 100);
    for (const pid of ["some-other-project", null, PROD_PID + "x"]) {
      setPid(pid); iso.resetCalls(); iso.setScript([rx("x"), T("x")]);
      const codes = [await code(turn(u.uid)), await code(callable("getPropertyDraft", u.uid)), await code(callable("updatePropertyDraft", u.uid, { fields: { area: "x" } })), await code(callable("createCaseFromConversation", u.uid, { confirmed: true }))];
      assert.deepStrictEqual(codes, ["permission-denied", "permission-denied", "permission-denied", "permission-denied"], String(pid));
      assert.strictEqual((await post({ system: "S", messages: [{ role: "user", content: "x" }] }, u.idToken)).status, 403);
      assert.strictEqual(iso.anthropicCalls.length, 0);
    }
    assert.strictEqual(await dataDocs(), 0, "nothing written");
  });

  // ── allow-list on all 5 handlers ────────────────────────────────────────
  it("GT4 enforce + UID NOT on the allow-list => all 5 handlers refuse BEFORE the model, nothing read-through/written; and a negative control proves the check is what stops it", async () => {
    const u = await mkToken(); await limits(100, 100); iso.setScript([rx(FEM), T(FEM), T(FEM)]);
    const c = [await code(turn(u.uid)), await code(callable("getPropertyDraft", u.uid)), await code(callable("updatePropertyDraft", u.uid, { fields: { area: "หัวหิน" } })), await code(callable("createCaseFromConversation", u.uid, { confirmed: true }))];
    assert.deepStrictEqual(c, Array(4).fill("permission-denied"));
    const h = await chat(u.idToken); assert.strictEqual(h.status, 403); assert.deepStrictEqual(h.json, { error: "forbidden" });
    const h2 = await post({ content: [{ type: "text", text: "x" }] }, u.idToken); assert.strictEqual(h2.status, 403);
    assert.strictEqual(iso.anthropicCalls.length, 0, "model never called"); assert.strictEqual(await dataDocs(), 0);
    // enabled:false / wrong field types are also refused
    for (const doc of [{ enabled: false }, { enabled: "true" }, { enabled: 1 }, {}]) { await db().doc("chatTestAllow/" + u.uid).set(doc); assert.strictEqual(await code(turn(u.uid)), "permission-denied", JSON.stringify(doc)); }
    assert.strictEqual(iso.anthropicCalls.length, 0);
    // NEGATIVE CONTROL: with the gate switched off (production state) the same uid reaches the model
    setPid(PROD_PID); iso.setScript([rx(FEM)]); await turn(u.uid); assert.ok(iso.anthropicCalls.length >= 1, "without the gate the unallowed uid reaches the model (so the refusals above are the gate's doing)");
  });

  it("GT5 allow-listed uid: all 5 handlers work, counted in the global and per-uid counters", async () => {
    const u = await mkToken(); await allow(u.uid); await limits(50, 50); iso.setScript([rx(FEM), T(FEM), T(FEM)]);
    assert.strictEqual(await code(turn(u.uid)), "OK");
    assert.strictEqual(await code(callable("getPropertyDraft", u.uid)), "OK");
    assert.strictEqual(await code(callable("updatePropertyDraft", u.uid, { fields: {} })), "OK");
    assert.notStrictEqual(await code(callable("createCaseFromConversation", u.uid, { confirmed: false })), "permission-denied");
    const h = await chat(u.idToken); assert.strictEqual(h.status, 200); assert.strictEqual(h.json.completion, FEM);
    const h2 = await post({ content: [{ type: "text", text: "x" }] }, u.idToken); assert.strictEqual(h2.status, 200);
    assert.strictEqual(iso.anthropicCalls.length, 3); assert.strictEqual(await used("chatTestQuota/global"), 3); assert.strictEqual(await used("chatTestQuota/uid__" + u.uid), 3);
  });

  it("GT6 HTTP claudeComplete: missing/garbled/expired/uid-less token => 401 before the body is read and before the model; wrong scheme too", async () => {
    const u = await mkToken(); await allow(u.uid); await limits(50, 50); iso.setScript([T(FEM), T(FEM), T(FEM), T(FEM)]);
    for (const t of [null, "", "garbage", "a.b.c", u.idToken + "tampered"]) { const r = await chat(t || undefined); assert.strictEqual(r.status, 401, String(t)); }
    const rBasic = await post({ system: "S", messages: [{ role: "user", content: "x" }] }, null, { authorization: "Basic " + u.idToken }); assert.strictEqual(rBasic.status, 401);
    const rTwo = await post({ system: "S", messages: [{ role: "user", content: "x" }] }, null, { authorization: "Bearer a b" }); assert.strictEqual(rTwo.status, 401);
    assert.strictEqual(iso.anthropicCalls.length, 0);
    // injected verifier: expired token / decoded without uid (DI: the real Auth emulator cannot mint an expired token)
    const authInst = admin.auth(), realVerify = authInst.verifyIdToken;
    try {
      authInst.verifyIdToken = async () => { const e = new Error("expired"); e.code = "auth/id-token-expired"; throw e; };
      assert.strictEqual((await chat("any")).status, 401);
      authInst.verifyIdToken = async () => ({});
      assert.strictEqual((await chat("any")).status, 401);
    } finally { authInst.verifyIdToken = realVerify; }
    assert.strictEqual(iso.anthropicCalls.length, 0);
    assert.strictEqual((await chat(u.idToken)).status, 200, "positive control: the real token of an allowed uid passes");
  });

  it("GT7 fallback cannot bypass: receptionTurn refusal is a code ContactRail lets fall back, and the fallback endpoint refuses the same uid (with its token, and with no token as the unchanged page would send)", async () => {
    const src = fs.readFileSync(path.join(ROOT, "ContactRail.dc.html"), "utf8");
    const fn = /_receptionFallbackSafe\(e\) \{([\s\S]*?)\n  \}/.exec(src); assert.ok(fn, "could not find _receptionFallbackSafe");
    assert.ok(/code === "permission-denied"/.test(fn[1]) && /code === "unauthenticated"/.test(fn[1]), "permission-denied/unauthenticated ARE codes the existing code lets fall back");
    assert.ok(!/resource-exhausted/.test(fn[1]) && !/failed-precondition/.test(fn[1]), "resource-exhausted / failed-precondition do NOT fall back (shown as an error)");
    const u = await mkToken(); await limits(100, 100); iso.setScript([rx(FEM), T(FEM)]);
    assert.strictEqual(await code(turn(u.uid)), "permission-denied");
    assert.strictEqual((await chat(u.idToken, { guard: "pd16" })).status, 403);
    assert.strictEqual((await chat(null, { guard: "pd16" })).status, 401);
    assert.strictEqual(iso.anthropicCalls.length, 0); assert.strictEqual(await dataDocs(), 0);
  });

  // ── clients cannot touch the gate's collections (REAL firestore.rules in this repo) ──
  it("GT8 client SDK can read/write none of chatTestAllow, chatTestQuota, chatTestConfig (signed-in anonymous, and unauthenticated)", async () => {
    const u = await mkToken();
    for (const ctx of [testEnv.authenticatedContext(u.uid, { firebase: { sign_in_provider: "anonymous" } }).firestore(), testEnv.unauthenticatedContext().firestore()]) {
      for (const p of ["chatTestAllow/" + u.uid, "chatTestQuota/global", "chatTestQuota/uid__" + u.uid, "chatTestConfig/limits"]) {
        assert.strictEqual((await attempt(ctx.doc(p).set({ enabled: true, used: 0, globalCap: 9999, perUidCap: 9999 }))).allowed, false, "write " + p);
        assert.strictEqual((await attempt(ctx.doc(p).update({ used: 0 }))).allowed, false, "update " + p);
        assert.strictEqual((await attempt(ctx.doc(p).delete())).allowed, false, "delete " + p);
        assert.strictEqual((await attempt(ctx.doc(p).get())).allowed, false, "read " + p);
      }
      assert.strictEqual((await attempt(ctx.collection("chatTestAllow").get())).allowed, false, "list allow-list");
    }
    // positive control: the Admin SDK (the Function / Console side) can
    await allow(u.uid); assert.strictEqual((await db().doc("chatTestAllow/" + u.uid).get()).exists, true);
  });

  // ── cap configuration validation ────────────────────────────────────────
  it("GT9 config must be positive integers within 1..10000: NaN, Infinity, negatives, 0, decimals, strings, booleans, null, missing, too large => refused before the model, counters untouched; boundary values accepted", async () => {
    const u = await mkToken(); await allow(u.uid);
    const bad = [[NaN, 5], [Infinity, 5], [-Infinity, 5], [-1, 5], [0, 5], [1.5, 5], ["5", 5], [true, 5], [null, 5], [10001, 5], [5, NaN], [5, Infinity], [5, -1], [5, 0], [5, 2.5], [5, "5"], [5, 10001]];
    for (const [g, p] of bad) {
      await db().doc("chatTestConfig/limits").set({ globalCap: g, perUidCap: p }); iso.resetCalls(); iso.setScript([rx(FEM), T(FEM)]);
      assert.strictEqual(await code(turn(u.uid)), "failed-precondition", JSON.stringify([String(g), String(p)]));
      assert.strictEqual((await chat(u.idToken)).status, 503);
      assert.strictEqual(iso.anthropicCalls.length, 0);
    }
    await db().doc("chatTestConfig/limits").set({ globalCap: 5 }); assert.strictEqual(await code(turn(u.uid)), "failed-precondition");
    await db().doc("chatTestConfig/limits").delete(); assert.strictEqual(await code(turn(u.uid)), "failed-precondition", "no config document => fail closed");
    assert.strictEqual(await used("chatTestQuota/global"), 0); assert.strictEqual(iso.anthropicCalls.length, 0);
    for (const [g, p] of [[1, 1], [10000, 10000]]) { await limits(g, p); await db().doc("chatTestQuota/global").delete().catch(() => {}); await db().doc("chatTestQuota/uid__" + u.uid).delete().catch(() => {}); iso.setScript([rx(FEM)]); assert.strictEqual(await code(turn(u.uid)), "OK", "boundary " + g); }
    // corrupt counters fail closed too
    await limits(5, 5); await db().doc("chatTestQuota/global").set({ used: "3" }); iso.setScript([rx(FEM)]); assert.strictEqual(await code(turn(u.uid)), "failed-precondition");
    await db().doc("chatTestQuota/global").set({ used: -1 }); assert.strictEqual(await code(turn(u.uid)), "failed-precondition");
  });

  // ── atomic reservation ──────────────────────────────────────────────────
  it("GT10 ATOMIC: 20 concurrent HTTP requests with global cap 5 => exactly 5 reach the model (5 x 200, 15 x 429); counter = 5", async () => {
    const u = await mkToken(); await allow(u.uid); await limits(5, 100); iso.setScript(Array.from({ length: 20 }, () => T(FEM)));
    const rs = await Promise.all(Array.from({ length: 20 }, () => chat(u.idToken)));
    const ok = rs.filter((r) => r.status === 200).length, lim = rs.filter((r) => r.status === 429).length;
    assert.strictEqual(ok, 5, JSON.stringify(rs.map((r) => r.status))); assert.strictEqual(lim, 15); assert.strictEqual(iso.anthropicCalls.length, 5);
    assert.strictEqual(await used("chatTestQuota/global"), 5);
  });

  it("GT11 ATOMIC across callables: 12 concurrent receptionTurn with global cap 4 => 4 answered, 8 resource-exhausted, model called exactly 4 times", async () => {
    const us = []; for (let i = 0; i < 12; i++) { const u = await mkToken(); await allow(u.uid); us.push(u); }
    await limits(4, 100); iso.setScript(Array.from({ length: 12 }, () => rx(FEM)));
    const cs = await Promise.all(us.map((u) => code(turn(u.uid))));
    assert.strictEqual(cs.filter((c) => c === "OK").length, 4, JSON.stringify(cs)); assert.strictEqual(cs.filter((c) => c === "resource-exhausted").length, 8);
    assert.strictEqual(iso.anthropicCalls.length, 4); assert.strictEqual(await used("chatTestQuota/global"), 4);
  });

  it("GT12 per-uid cap and global cap across two uids (callable + HTTP share the same counters)", async () => {
    const a = await mkToken(), b = await mkToken(); await allow(a.uid); await allow(b.uid); await limits(5, 3); iso.setScript(Array.from({ length: 12 }, () => rx(FEM)));
    const ca = []; for (let i = 0; i < 4; i++) ca.push(await code(turn(a.uid)));
    assert.deepStrictEqual(ca, ["OK", "OK", "OK", "resource-exhausted"]);
    iso.setScript(Array.from({ length: 12 }, () => T(FEM)));
    const sb = []; for (let i = 0; i < 3; i++) sb.push((await chat(b.idToken)).status);
    assert.deepStrictEqual(sb, [200, 200, 429], "global 5 = 3 (A) + 2 (B)");
    assert.strictEqual(iso.anthropicCalls.length, 5); assert.strictEqual(await used("chatTestQuota/global"), 5);
  });

  it("GT13 retries are counted: receptionTurn PD-16 retry needs its own slot (cap 1 -> fallback after 1 call; cap 2 -> clean rewrite after 2)", async () => {
    const u = await mkToken(); await allow(u.uid);
    await limits(1, 10); iso.setScript([rx(MALE), rx(FEM)]);
    const r1 = await turn(u.uid); assert.strictEqual(r1.reply, FALLBACK);
    assert.strictEqual(iso.anthropicCalls.length, 1, "retry refused: no second model call"); assert.strictEqual(await used("chatTestQuota/global"), 1);
    await testEnv.clearFirestore(); iso.resetCalls(); await allow(u.uid); await limits(2, 10); iso.setScript([rx(MALE), rx(FEM)]);
    const r2 = await turn(u.uid); assert.strictEqual(r2.reply, FEM); assert.strictEqual(iso.anthropicCalls.length, 2); assert.strictEqual(await used("chatTestQuota/global"), 2);
  });

  it("GT14 retries are counted on the fallback route too (claudeComplete guard:'pd16'): cap 1 -> fixed fallback after 1 call; cap 2 -> rewrite after 2; first-call refusal is 429 (not a fallback)", async () => {
    const u = await mkToken(); await allow(u.uid);
    await limits(1, 10); iso.setScript([T(MALE), T(FEM)]);
    const a = await chat(u.idToken, { guard: "pd16" }); assert.strictEqual(a.status, 200); assert.strictEqual(a.json.completion, FALLBACK); assert.strictEqual(iso.anthropicCalls.length, 1);
    const b = await chat(u.idToken, { guard: "pd16" }); assert.strictEqual(b.status, 429, "cap exhausted on the FIRST call: error, not a female fallback sentence"); assert.strictEqual(iso.anthropicCalls.length, 1);
    await testEnv.clearFirestore(); iso.resetCalls(); await allow(u.uid); await limits(2, 10); iso.setScript([T(MALE), T(FEM)]);
    const c = await chat(u.idToken, { guard: "pd16" }); assert.strictEqual(c.json.completion, FEM); assert.strictEqual(iso.anthropicCalls.length, 2); assert.strictEqual(await used("chatTestQuota/global"), 2);
  });

  it("GT15 receptionTurn first-call refusal when the cap is full: resource-exhausted, 0 model calls, no conversation/draft/case written", async () => {
    const u = await mkToken(); await allow(u.uid); await limits(1, 1); await db().doc("chatTestQuota/global").set({ used: 1 }); iso.setScript([rx(FEM)]);
    assert.strictEqual(await code(turn(u.uid)), "resource-exhausted"); assert.strictEqual(iso.anthropicCalls.length, 0);
    for (const c of ["conversations", "propertyDrafts", "properties"]) assert.strictEqual((await db().collection(c).get()).size, 0, c);
  });

  it("GT18 NEGATIVE CONTROL for GT10: a NON-atomic reservation (plain read-then-write, no transaction) lets more than the cap through, so GT10's exact-count assertion is able to fail", async () => {
    const u = await mkToken(); await allow(u.uid); await limits(5, 100); iso.setScript(Array.from({ length: 20 }, () => T(FEM)));
    const real = db(), orig = real.runTransaction;
    real.runTransaction = async (fn) => fn({ get: (ref) => ref.get(), set: (ref, data) => { ref.set(data); } }); // racy on purpose
    try {
      const rs = await Promise.all(Array.from({ length: 20 }, () => chat(u.idToken)));
      assert.ok(rs.filter((r) => r.status === 200).length > 5, "a racy reservation should over-admit; got " + rs.filter((r) => r.status === 200).length);
    } finally { real.runTransaction = orig; }
  });

  // ── production behaviour unchanged ──────────────────────────────────────
  it("GT16 production branch (DI): no allow-list/quota/config read or write at all, no Authorization header needed, behaviour as before", async () => {
    setPid(PROD_PID); const names = []; const f = db(); const orig = f.collection.bind(f);
    f.collection = (n) => { names.push(n); return orig(n); };
    const origDoc = f.doc.bind(f); f.doc = (p) => { names.push(String(p).split("/")[0]); return origDoc(p); };
    try {
      iso.setScript([rx(FEM), T(FEM), T(FEM)]);
      assert.strictEqual(await code(turn("syn-prod-uid")), "OK");
      assert.strictEqual(await code(callable("getPropertyDraft", "syn-prod-uid")), "OK");
      const h = await chat(null); assert.strictEqual(h.status, 200, "no Authorization header: unchanged production behaviour"); assert.strictEqual(h.json.completion, FEM);
      const h2 = await chat("garbage-token"); assert.strictEqual(h2.status, 200, "an Authorization header is simply ignored on production");
      assert.strictEqual(await code(callable("createCaseFromConversation", "syn-prod-uid", { confirmed: false })), "OK");
    } finally { f.collection = f.constructor.prototype.collection; f.doc = f.constructor.prototype.doc; }
    assert.ok(names.length > 0, "sanity: the spy sees Firestore access");
    assert.deepStrictEqual(names.filter((n) => /^chatTest/.test(n)), [], "no gate collection touched on the production branch");
    assert.strictEqual((await db().collection("chatTestQuota").get()).size + (await db().collection("chatTestAllow").get()).size, 0);
    // DI at the module level too: spy admin proves "off" never touches Firestore or Auth
    let touched = 0; const spyAdmin = { firestore() { touched++; throw new Error("touched"); }, auth() { touched++; throw new Error("touched"); } };
    for (const pid of [PROD_PID, "demo-spy"]) { // demo-spy is "off" here because this process runs under the local emulator (evidence present)
      const g = require(GATE_SRC).createGate({ admin: spyAdmin, HttpsError: Error, getProjectId: () => pid });
      assert.strictEqual(g.state(), "off"); assert.strictEqual(await g.enforceCallable({ auth: { uid: "u" } }), null);
      assert.strictEqual(await g.enforceHttp({ headers: {} }, { status() { throw new Error("must not answer"); } }), null);
      assert.strictEqual(g.reserveHook("u"), undefined); assert.strictEqual(await g.reserveHttp(null, {}), true);
    }
    assert.strictEqual(touched, 0);
  });

  it("GT19 the restore path itself: setProjectIdProvider rejects a non-function; reset() puts the ORIGINAL runtime provider back; a stand-in that returns undefined would be caught", () => {
    const gm = require(GATE_SRC);
    assert.throws(() => gate.__testOnly.setProjectIdProvider(undefined), /use reset/);
    setPid(TEST_PID); assert.strictEqual(gate.state(), "enforce"); assert.strictEqual(gate.__testOnly.isRuntimeProvider(), false);
    gate.__testOnly.reset(); assert.strictEqual(gate.__testOnly.isRuntimeProvider(), true); assert.strictEqual(gate.state(), gm.stateFor(gm.runtimeProjectId(process.env), process.env));
    // negative control: the old cleanup (provider returning undefined) leaves the gate in "deny" and isRuntimeProvider() false
    gate.__testOnly.setProjectIdProvider(() => undefined); assert.strictEqual(gate.state(), "deny"); assert.strictEqual(gate.__testOnly.isRuntimeProvider(), false);
    gate.__testOnly.reset(); assert.strictEqual(gate.__testOnly.isRuntimeProvider(), true);
  });

  it("GT17 production diff is additive only: every chatGate line in functions/index.js is a call guarded by the gate's own state; the existing tests (test:chat) are run separately unchanged", () => {
    const { execFileSync } = require("child_process");
    const d = execFileSync("git", ["diff", "--unified=0", "8c549c6", "--", "functions/index.js"], { cwd: ROOT, encoding: "utf8" });
    const removed = d.split("\n").filter((l) => /^-[^-]/.test(l)), added = d.split("\n").filter((l) => /^\+[^+]/.test(l));
    // The only removed lines are the 4 signatures/calls that gain an argument.
    assert.strictEqual(removed.length, 4, removed.join("\n"));
    assert.ok(removed.every((l) => /callClaudeReception\(|pd16GuardChatText\(/.test(l)), removed.join("\n"));
    assert.ok(added.every((l) => /chatGate|beforeCall|beforeRetry|CHAT-LIVE-01|emulator namespace|test project; false|callClaudeReception|pd16GuardChatText|gateUid/.test(l)), added.filter((l) => !/chatGate|beforeCall|beforeRetry|CHAT-LIVE-01|gateUid/.test(l)).join("\n"));
  });
});
