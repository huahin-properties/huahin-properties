// CHAT-TEST-01 — chat + draft path, SYNTHETIC data, EMULATOR ONLY, ANTHROPIC STUBBED.
//
// Run:  npm run test:chat
//
// WHAT THIS IS (read before quoting a result):
//   * It runs the CURRENT functions/index.js (receptionTurn, getPropertyDraft,
//     createCaseFromConversation) in-process against the Firestore emulator.
//   * The "model" is a scripted STUB. It checks server LOGIC and the PD-16 GUARD. It says nothing
//     about what the real model writes. No Anthropic call, no real key, no external service.
//   * "Same uid called again" = SERVER-SIDE CONTINUITY. It is NOT a browser-refresh test
//     (no browser, no localStorage, no IndexedDB, no Firebase Auth restore is exercised).
//   * CHAT-FIX-01: when the retry cannot be used, a FIXED female fallback replaces the reply. That checks
//     the guard's LOGIC only. Any male reply that still got out would be a GAP, never "persona passed".
//   * Not a production PASS. Labels: see tests/helpers/synthetic.js.

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const { initializeTestEnvironment } = require("@firebase/rules-unit-testing");
const { PROJECT_ID, assertEmulatorOnly, attempt, record, printSummary } = require("../helpers/synthetic");
const { install, FAKE_KEY, snapshot, diffSnapshots, TOUCHED_ENV } = require("./stub-anthropic");

assertEmulatorOnly();

const ROOT = path.join(__dirname, "..", "..");
const FUNCTIONS_DIR = path.join(ROOT, "functions");
const RULES = fs.readFileSync(path.join(ROOT, "firestore.rules"), "utf8");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");

const UID_A = "syn-chat-a-uid";
const UID_B = "syn-chat-b-uid";
const UID_STAFF = "syn-chat-staff-uid";
const CONTACT = "+00 000 000 0007";
const NAME = "Synthetic Seller";
const draftId = (uid) => "draft__" + uid;
const convId = (uid) => "reception__" + uid;

let iso, snapBefore, admin, fns, testEnv, loadError = null;
const results = {}; // small scratch for cross-test notes

// ── scripted "model" outputs (tool input of reception_reply) ────────────────
const casual = { reply: "สวัสดีค่ะ ยินดีต้อนรับค่ะ", stage: "general", primaryIntent: "OTHER" };
const sellAdvisory = {
  reply: "ขอบคุณที่แจ้งค่ะ ขอทราบราคาที่ต้องการเพิ่มเติมได้ไหมคะ", stage: "advisory", primaryIntent: "SELL",
  requirementsSummary: "เจ้าของบ้านต้องการขายบ้าน 3 ห้องนอน",
  propertyBasics: { kind: "บ้าน", area: "หัวหิน", scale: "3 ห้องนอน" },
  propertyFields: { bedrooms: 3, area: "หัวหิน" }, statedFields: ["bedrooms", "area"], mentionedFields: ["bedrooms", "area"],
};
// qualified, but the "model" labels the intent OTHER and returns EMPTY name/contact: server must not downgrade/erase.
const qualifiedOtherEmpty = {
  reply: "รับทราบค่ะ", stage: "qualified", primaryIntent: "OTHER", customerName: "", contact: "",
  propertyFields: { price: 5000000 }, statedFields: ["price"], mentionedFields: ["price"],
};
const withContact = {
  reply: "ขอบคุณค่ะ ได้ข้อมูลครบแล้วค่ะ", stage: "qualified", primaryIntent: "SELL",
  customerName: NAME, contact: CONTACT,
};

const turn = (uid, text) => fns.receptionTurn.run({ auth: uid ? { uid, token: {} } : undefined, data: { customerText: text, messages: [{ role: "user", content: text }] }, rawRequest: {} });
const getDraft = (uid) => fns.getPropertyDraft.run({ auth: uid ? { uid, token: {} } : undefined, data: {}, rawRequest: {} });
const createCase = (uid, data) => fns.createCaseFromConversation.run({ auth: uid ? { uid, token: {} } : undefined, data, rawRequest: {} });
const anon = () => testEnv.unauthenticatedContext().firestore();
const asUid = (uid) => testEnv.authenticatedContext(uid, {}).firestore();

async function buildQualifiedChat(uid, { contact = true } = {}) {
  iso.setScript([casual, sellAdvisory, qualifiedOtherEmpty, ...(contact ? [withContact] : [])]);
  await turn(uid, "สวัสดี");
  await turn(uid, "อยากขายบ้านที่หัวหิน 3 ห้องนอน");
  await turn(uid, "ราคาประมาณ 5 ล้าน");
  if (contact) await turn(uid, "ชื่อ Synthetic Seller เบอร์ " + CONTACT);
}

function needFns() {
  if (loadError) throw new Error("functions/index.js could not be loaded in-process: " + String(loadError.message).split("\n")[0] + " (run `npm ci` in functions/)");
}
const rec = (id, title, label, note) => record({ id, title, label, note });


// ── isolation self-test: install()/restore() put EVERYTHING back, including env vars that did not exist ──
describe("CHAT-TEST-01 isolation self-test (install/restore round trip)", function () {
  const probe = {
    ANTHROPIC_API_KEY: "ORIGINAL-SYNTHETIC-KEY",        // present before -> must come back with this value
    GCE_METADATA_HOST: "original-synthetic-host:1",     // present before -> must come back
    GOOGLE_APPLICATION_CREDENTIALS: "/synthetic/original.json", // present before -> must come back
    // METADATA_SERVER_DETECTION is deliberately ABSENT before -> must be absent again afterwards
  };
  const saved = {};
  before(() => {
    for (const k of TOUCHED_ENV) saved[k] = Object.prototype.hasOwnProperty.call(process.env, k) ? { v: process.env[k] } : null;
    for (const k of TOUCHED_ENV) delete process.env[k];
    for (const [k, v] of Object.entries(probe)) process.env[k] = v;
  });
  after(() => {
    for (const k of TOUCHED_ENV) { delete process.env[k]; if (saved[k]) process.env[k] = saved[k].v; }
  });
  it("restores fetch, http/https request+get and env (present value, changed value, and previously-absent variable)", () => {
    const before = snapshot();
    assert.strictEqual(before.env.METADATA_SERVER_DETECTION.present, false, "precondition: variable absent before");
    const stub = install();
    const during = snapshot();
    assert.notStrictEqual(during.fetch, before.fetch);
    assert.notStrictEqual(during.httpRequest, before.httpRequest);
    assert.notStrictEqual(during.httpsGet, before.httpsGet);
    assert.strictEqual(process.env.ANTHROPIC_API_KEY, FAKE_KEY);
    assert.strictEqual(during.env.METADATA_SERVER_DETECTION.present, true);
    assert.strictEqual(during.env.GOOGLE_APPLICATION_CREDENTIALS.present, false);
    stub.restore();
    assert.deepStrictEqual(diffSnapshots(before, snapshot()), []);
    assert.strictEqual(process.env.ANTHROPIC_API_KEY, probe.ANTHROPIC_API_KEY);
    assert.strictEqual(process.env.GCE_METADATA_HOST, probe.GCE_METADATA_HOST);
    assert.strictEqual(process.env.GOOGLE_APPLICATION_CREDENTIALS, probe.GOOGLE_APPLICATION_CREDENTIALS);
    assert.strictEqual(Object.prototype.hasOwnProperty.call(process.env, "METADATA_SERVER_DETECTION"), false, "a variable that did not exist before must not exist after");
    rec("C8e", "isolation self-test: install→restore returns fetch, http/https and env (incl. a variable that did not exist) to the pre-install state", "CONTROL", "round trip identical");
  });
});

describe("CHAT-TEST-01: chat + draft path (synthetic, emulator, stubbed model)", function () {
  this.timeout(60000);

  before(async () => {
    snapBefore = snapshot();          // state BEFORE the stub is installed (fetch, http/https, every env var + presence)
    iso = install();                  // closes external services BEFORE anything else loads
    const during = diffSnapshots(snapBefore, snapshot());
    assert.ok(during.length >= 5, "sanity: installing the stub must change the process (checker would be vacuous otherwise): " + JSON.stringify(during));
    testEnv = await initializeTestEnvironment({ projectId: PROJECT_ID, firestore: { rules: RULES } });
    try {
      admin = require(require.resolve("firebase-admin", { paths: [FUNCTIONS_DIR] }));
      fns = require(path.join(FUNCTIONS_DIR, "index.js"));
      assert.ok(fns.receptionTurn && typeof fns.receptionTurn.run === "function");
    } catch (e) { loadError = e; }
  });
  beforeEach(async () => {
    await testEnv.clearFirestore();
    iso.resetCalls();
    iso.setScript([]);
    if (loadError) return;
    await testEnv.withSecurityRulesDisabled(async (ctx) => { await ctx.firestore().doc("adminUsers/" + UID_STAFF).set({ role: "staff" }); });
  });
  after(async () => {
    const blockedAtEnd = iso.blocked.slice();
    iso.restore();
    // Compare EVERYTHING install() touched against the state captured before it: fetch, http.request/get,
    // https.request/get and each environment variable (present/absent AND value).
    const diffs = diffSnapshots(snapBefore, snapshot());
    const restored = iso.isRestored() && diffs.length === 0;
    rec("C8c", "after the run fetch, http/https request+get and every touched env var equal their pre-install state", restored ? "CONTROL" : "CONTROL-FAILED", restored ? "identical to pre-install snapshot (" + TOUCHED_ENV.join(", ") + ")" : "differences: " + JSON.stringify(diffs));
    printSummary();
    await testEnv.cleanup();
    assert.ok(restored, "isolation was not restored: " + JSON.stringify(diffs));
    assert.strictEqual(blockedAtEnd.length, 0, "outbound calls were attempted: " + JSON.stringify(blockedAtEnd));
  });

  // ── C1 ────────────────────────────────────────────────────────────────
  it("C1 first casual turn writes nothing", async () => {
    needFns();
    iso.setScript([casual]);
    const r = await turn(UID_A, "สวัสดี");
    const conv = await admin.firestore().doc("conversations/" + convId(UID_A)).get();
    const draft = await admin.firestore().doc("propertyDrafts/" + draftId(UID_A)).get();
    const cases = await admin.firestore().collection("properties").get();
    const ok = r.persisted === false && !conv.exists && !draft.exists && cases.empty;
    rec("C1", "casual first turn: no conversation, no draft, no case", ok ? "CONTROL" : "CONTROL-FAILED", "persisted=" + r.persisted + " conv=" + conv.exists + " draft=" + draft.exists + " cases=" + cases.size);
    assert.ok(ok);
  });

  // ── C2 ────────────────────────────────────────────────────────────────
  it("C2 SELL turn creates conversation + draft with per-field provenance; client writes are denied", async () => {
    needFns();
    iso.setScript([casual, sellAdvisory]);
    await turn(UID_A, "สวัสดี");
    const r = await turn(UID_A, "อยากขายบ้านที่หัวหิน 3 ห้องนอน");
    const db = admin.firestore();
    const conv = (await db.doc("conversations/" + convId(UID_A)).get()).data();
    const draftSnap = await db.doc("propertyDrafts/" + draftId(UID_A)).get();
    const d = draftSnap.data() || {};
    const f = d.fields || {};
    const msgs = await db.collection("conversations/" + convId(UID_A) + "/messages").get();
    const okConv = conv && conv.primaryIntent === "SELL" && conv.conversationStage === "advisory" && conv.visitorId === UID_A && conv.propertyBasics && conv.propertyBasics.area === "หัวหิน";
    const okDraft = draftSnap.exists && d.ownerUid === UID_A && d.conversationId === convId(UID_A) &&
      f.bedrooms && f.bedrooms.value === 3 && typeof f.bedrooms.source === "string" && f.bedrooms.source && typeof f.bedrooms.updatedAt === "number" && f.area && f.area.value === "หัวหิน";
    rec("C2a", "SELL turn: conversation reception__<uid> with stage/intent/basics + messages", okConv && msgs.size >= 2 ? "CONTROL" : "CONTROL-FAILED", "stage=" + (conv && conv.conversationStage) + " intent=" + (conv && conv.primaryIntent) + " messages=" + msgs.size);
    rec("C2b", "SELL turn: draft draft__<uid> with ownerUid, conversationId, per-field source + updatedAt", okDraft ? "CONTROL" : "CONTROL-FAILED", "per-field source=" + (f.bedrooms && f.bedrooms.source) + " (stated by customer in the stub) · draft fields=" + Object.keys(f).join(",") + " applied=" + JSON.stringify(r.draftApplied));
    assert.ok(okConv && okDraft);

    // rules: who can read/write the draft + conversation (Firestore rules, client SDK)
    const own = await attempt(asUid(UID_A).doc("propertyDrafts/" + draftId(UID_A)).get());
    const staff = await attempt(asUid(UID_STAFF).doc("propertyDrafts/" + draftId(UID_A)).get());
    rec("C2c", "owner uid can read own draft", own.allowed ? "CONTROL" : "CONTROL-FAILED", own.allowed ? "allowed" : "denied with " + own.error.code);
    rec("C2d", "Staff (adminUsers) can read the draft", staff.allowed ? "CONTROL" : "CONTROL-FAILED", staff.allowed ? "allowed" : "denied with " + staff.error.code);
    for (const [id, title, op] of [
      ["C2e", "owner uid cannot SET its own draft from the client", () => asUid(UID_A).doc("propertyDrafts/" + draftId(UID_A)).set({ ownerUid: UID_A, fields: { price: { value: 1, source: "staff_edit" } } })],
      ["C2f", "owner uid cannot UPDATE its own draft from the client", () => asUid(UID_A).doc("propertyDrafts/" + draftId(UID_A)).update({ status: "submitted" })],
      ["C2g", "owner uid cannot DELETE its own draft from the client", () => asUid(UID_A).doc("propertyDrafts/" + draftId(UID_A)).delete()],
    ]) {
      const w = await attempt(op());
      rec(id, title, !w.allowed ? "CONTROL" : "GAP-CONFIRMED", !w.allowed ? "denied with " + w.error.code : "client write was ALLOWED");
    }
    assert.ok(own.allowed && staff.allowed);
  });

  // ── C3 ────────────────────────────────────────────────────────────────
  it("C3 same uid, later turns (server-side continuity, NOT a browser refresh)", async () => {
    needFns();
    iso.setScript([casual, sellAdvisory, qualifiedOtherEmpty]);
    await turn(UID_A, "สวัสดี");
    await turn(UID_A, "อยากขายบ้านที่หัวหิน 3 ห้องนอน");
    const before = (await admin.firestore().doc("propertyDrafts/" + draftId(UID_A)).get()).data().fields;
    await turn(UID_A, "ราคาประมาณ 5 ล้าน"); // model says OTHER + empty name/contact; adds price
    const conv = (await admin.firestore().doc("conversations/" + convId(UID_A)).get()).data();
    const afterDraft = (await admin.firestore().doc("propertyDrafts/" + draftId(UID_A)).get()).data().fields;
    const g = await getDraft(UID_A);
    const checks = {
      "stage advanced to qualified": conv.conversationStage === "qualified",
      "intent not downgraded (SELL kept)": conv.primaryIntent === "SELL",
      "empty name/contact did not erase (still empty, nothing invented)": conv.customerName === "" && conv.contact === "",
      "propertyBasics kept": conv.propertyBasics && conv.propertyBasics.area === "หัวหิน" && conv.propertyBasics.kind === "บ้าน",
      "earlier draft values kept": afterDraft.bedrooms.value === before.bedrooms.value && afterDraft.area.value === before.area.value,
      "new value added": afterDraft.price && afterDraft.price.value === 5000000,
      "getPropertyDraft returns the accumulated draft": g.exists === true && g.fields && g.fields.price && g.fields.bedrooms && g.fields.area,
    };
    const bad = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
    rec("C3", "same-uid continuity on the SERVER: accumulate, never erase, never downgrade (not a browser-refresh test)", bad.length ? "CONTROL-FAILED" : "CONTROL", bad.length ? "failed: " + bad.join("; ") : "all " + Object.keys(checks).length + " checks");
    assert.deepStrictEqual(bad, []);
  });

  it("C3b name/contact already stored, then the model returns EMPTY values => stored data stays (empty never overwrites)", async () => {
    needFns();
    const db = admin.firestore();
    // turn 3 = qualified + name + contact (stored). turn 4 = qualified again but the "model" returns empty name/contact/basics/fields.
    iso.setScript([casual, sellAdvisory, withContact,
      { reply: "รับทราบค่ะ", stage: "qualified", primaryIntent: "SELL", customerName: "", contact: "", requirementsSummary: "", propertyBasics: { kind: "", area: "", scale: "" }, propertyFields: {}, statedFields: [], mentionedFields: [] }]);
    await turn(UID_A, "สวัสดี");
    await turn(UID_A, "อยากขายบ้านที่หัวหิน 3 ห้องนอน");
    await turn(UID_A, "ชื่อ Synthetic Seller เบอร์ " + CONTACT);
    const stored = (await db.doc("conversations/" + convId(UID_A)).get()).data();
    assert.strictEqual(stored.customerName, NAME, "precondition: name was stored");
    assert.strictEqual(stored.contact, CONTACT, "precondition: contact was stored");
    const draftBefore = (await db.doc("propertyDrafts/" + draftId(UID_A)).get()).data().fields;
    await turn(UID_A, "ครับ/ค่ะ ขอบคุณ");
    const after = (await db.doc("conversations/" + convId(UID_A)).get()).data();
    const draftAfter = (await db.doc("propertyDrafts/" + draftId(UID_A)).get()).data().fields;
    const checks = {
      "customerName kept": after.customerName === NAME,
      "contact kept": after.contact === CONTACT,
      "requirementsSummary kept (not blanked)": after.requirementsSummary === stored.requirementsSummary && after.requirementsSummary !== "",
      "propertyBasics kept": JSON.stringify(after.propertyBasics) === JSON.stringify(stored.propertyBasics),
      "draft fields kept": JSON.stringify(Object.keys(draftAfter).sort()) === JSON.stringify(Object.keys(draftBefore).sort()) && draftAfter.bedrooms.value === 3 && draftAfter.area.value === "หัวหิน",
      "intent kept (SELL)": after.primaryIntent === "SELL",
    };
    const bad = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
    rec("C3b", "name+contact stored, then empty model values => stored data NOT overwritten (name, contact, summary, basics, draft)", bad.length ? "CONTROL-FAILED" : "CONTROL", bad.length ? "failed: " + bad.join("; ") : "before: name=" + stored.customerName + " contact=" + stored.contact + " · after the empty turn: unchanged");
    assert.deepStrictEqual(bad, []);
  });

  it("C3c stage never regresses: qualified then 'general' stays qualified; advisory then 'general' stays advisory", async () => {
    needFns();
    const db = admin.firestore();
    // qualified -> general
    iso.setScript([casual, sellAdvisory, qualifiedOtherEmpty, { reply: "ได้ค่ะ", stage: "general", primaryIntent: "OTHER" }]);
    await turn(UID_A, "สวัสดี");
    await turn(UID_A, "อยากขายบ้านที่หัวหิน 3 ห้องนอน");
    await turn(UID_A, "ราคาประมาณ 5 ล้าน");
    const q1 = (await db.doc("conversations/" + convId(UID_A)).get()).data();
    await turn(UID_A, "ถามเรื่องทั่วไปค่ะ");
    const q2 = (await db.doc("conversations/" + convId(UID_A)).get()).data();
    // advisory -> general (other uid)
    iso.setScript([casual, sellAdvisory, { reply: "ได้ค่ะ", stage: "general", primaryIntent: "OTHER" }]);
    await turn(UID_B, "สวัสดี");
    await turn(UID_B, "อยากขายบ้านที่หัวหิน 3 ห้องนอน");
    const a1 = (await db.doc("conversations/" + convId(UID_B)).get()).data();
    await turn(UID_B, "ถามเรื่องทั่วไปค่ะ");
    const a2 = (await db.doc("conversations/" + convId(UID_B)).get()).data();
    const checks = {
      "precondition: stage was qualified": q1.conversationStage === "qualified",
      "qualified -> general: stays qualified": q2.conversationStage === "qualified",
      "qualified -> general: intent SELL kept": q2.primaryIntent === "SELL",
      "precondition: stage was advisory": a1.conversationStage === "advisory",
      "advisory -> general: stays advisory": a2.conversationStage === "advisory",
    };
    const bad = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
    rec("C3c", "stage does not go backwards when the next model reply proposes 'general' (qualified stays qualified; advisory stays advisory)", bad.length ? "CONTROL-FAILED" : "CONTROL", bad.length ? "failed: " + bad.join("; ") : "qualified→general: " + q1.conversationStage + "→" + q2.conversationStage + " · advisory→general: " + a1.conversationStage + "→" + a2.conversationStage);
    assert.deepStrictEqual(bad, []);
  });

  // ── C4 ────────────────────────────────────────────────────────────────
  it("C4 another uid / no auth cannot reach the draft or conversation (Function AND rules)", async () => {
    needFns();
    await buildQualifiedChat(UID_A, { contact: false });
    const gB = await getDraft(UID_B);
    const okFn = gB.exists === false && (!gB.fields || Object.keys(gB.fields).length === 0);
    rec("C4a", "getPropertyDraft as ANOTHER uid returns no draft (exists:false, no fields)", okFn ? "CONTROL" : "GAP-CONFIRMED", "exists=" + gB.exists + " fields=" + Object.keys(gB.fields || {}).join(","));
    let unauth = "no error";
    try { await getDraft(null); } catch (e) { unauth = e && e.code; if (unauth !== "unauthenticated") throw e; }
    rec("C4b", "getPropertyDraft without auth is rejected with unauthenticated", unauth === "unauthenticated" ? "CONTROL" : "CONTROL-FAILED", "result=" + unauth);
    const cross = [
      ["C4c", "rules: another uid cannot read A's draft", () => asUid(UID_B).doc("propertyDrafts/" + draftId(UID_A)).get()],
      ["C4d", "rules: anonymous cannot read A's draft", () => anon().doc("propertyDrafts/" + draftId(UID_A)).get()],
      ["C4e", "rules: another uid cannot read A's conversation", () => asUid(UID_B).doc("conversations/" + convId(UID_A)).get()],
      ["C4f", "rules: another uid cannot read A's conversation messages", () => asUid(UID_B).collection("conversations/" + convId(UID_A) + "/messages").get()],
      ["C4g", "rules: another uid cannot list conversations", () => asUid(UID_B).collection("conversations").get()],
    ];
    for (const [id, title, op] of cross) {
      const r = await attempt(op());
      rec(id, title, r.allowed ? "GAP-CONFIRMED" : "CONTROL", r.allowed ? "ALLOWED (cross-uid read)" : "denied with " + r.error.code);
    }
    assert.ok(okFn);
  });

  // ── C5 ────────────────────────────────────────────────────────────────
  it("C5 case creation: consent, gate, dedupe, linkage, and what the draft does NOT carry into the case", async () => {
    needFns();
    // 5a: gate not met (no name/contact) -> no case even with confirmed:true
    await buildQualifiedChat(UID_A, { contact: false });
    const gate = await createCase(UID_A, { confirmed: true });
    const none = await admin.firestore().collection("properties").get();
    rec("C5a", "name/contact missing => no case (confirmed:true still refused)", gate.created === false && none.empty ? "CONTROL" : "CONTROL-FAILED", "reason=" + gate.reason + " cases=" + none.size);
    assert.ok(gate.created === false && none.empty);
    // 5b: complete the chat
    iso.setScript([withContact]);
    await turn(UID_A, "ชื่อ Synthetic Seller เบอร์ " + CONTACT);
    const unconfirmed = await createCase(UID_A, {});
    const noneYet = await admin.firestore().collection("properties").get();
    rec("C5b", "no user confirmation (confirmed !== true) => no case", unconfirmed.created === false && noneYet.empty ? "CONTROL" : "CONTROL-FAILED", "reason=" + unconfirmed.reason);
    const c1 = await createCase(UID_A, { confirmed: true });
    const c2 = await createCase(UID_A, { confirmed: true });
    const all = await admin.firestore().collection("properties").get();
    const dupOk = c1.created === true && c2.created === true && c2.alreadyExisted === true && c1.propertyId === c2.propertyId && c1.trackToken === c2.trackToken && all.size === 1;
    rec("C5c", "confirmed twice => ONE case, same id + same track link (dedupe by server-side conversation link)", dupOk ? "CONTROL" : "CONTROL-FAILED", "cases=" + all.size + " sameId=" + (c1.propertyId === c2.propertyId));
    // LISTING-E2E-01: a chat-created Case is split — public-safe fields on properties/{id}, the rest in caseInternal/{id}.
    const pubDoc = (await admin.firestore().doc("properties/" + c1.propertyId).get()).data();
    const intDoc = (await admin.firestore().doc("caseInternal/" + c1.propertyId).get()).data();
    const caseDoc = Object.assign({}, pubDoc, intDoc);
    assert.ok(pubDoc.internalSplit === true && !("trackToken" in pubDoc) && !("conversationId" in pubDoc) && !("contactName" in pubDoc) && !("ownerContact" in pubDoc), "the public document carries no contact / token / conversation link");
    const link = caseDoc.conversationId === convId(UID_A) && caseDoc.receptionVisitorId === UID_A && caseDoc.caseSource === "ai_assistant" && caseDoc.source === "owner_submission";
    const conv = (await admin.firestore().doc("conversations/" + convId(UID_A)).get()).data();
    rec("C5d", "case carries conversationId/receptionVisitorId; conversation links back (linkedCaseIds)", link && (conv.linkedCaseIds || [])[0] === c1.propertyId ? "CONTROL" : "CONTROL-FAILED", "caseSource=" + caseDoc.caseSource + " linked=" + JSON.stringify(conv.linkedCaseIds));
    assert.ok(dupOk && link);

    // 5e: which DRAFT fields are NOT in the case (named, not just "incomplete")
    const draft = (await admin.firestore().doc("propertyDrafts/" + draftId(UID_A)).get()).data();
    const fields = draft.fields || {};
    const missing = [], present = [];
    for (const k of Object.keys(fields)) {
      if (Object.prototype.hasOwnProperty.call(caseDoc, k) && JSON.stringify(caseDoc[k]) === JSON.stringify(fields[k].value)) present.push(k); else missing.push(k + "=" + JSON.stringify(fields[k].value));
    }
    const carried = ["aiPropertyKind", "aiPropertyArea", "aiPropertyScale", "description", "contactName", "ownerContact"].filter((k) => caseDoc[k]);
    rec("C5e", "draft -> case: draft fields NOT copied into the case (by same key and value)",
      missing.length ? "GAP-CONFIRMED" : "GAP-NOT-REPRODUCED",
      "draft fields not in case: [" + missing.join(", ") + "]; draft fields in case: [" + present.join(", ") + "]; case instead carries (from conversation, not draft): [" + carried.join(", ") + "]");
    const draftAfter = draft;
    // LISTING-E2E-01: the link now exists (draft.caseId <-> case.draftId in the internal record) — one draft, one case.
    const draftNow = (await admin.firestore().doc("propertyDrafts/" + draftId(UID_A)).get()).data();
    const linkedBack = draftNow.caseId === c1.propertyId && caseDoc.draftId === draftId(UID_A);
    rec("C5f", "draft <-> case link (draft.caseId / case.draftId) — fixed by LISTING-E2E-01", linkedBack ? "CONTROL" : "CONTROL-FAILED", "draft.status=" + draftNow.status + "; draft.caseId=" + draftNow.caseId + "; case.draftId=" + caseDoc.draftId);
    assert.ok(linkedBack);
    results.chatCaseId = c1.propertyId;
  });

  // ── C6 ────────────────────────────────────────────────────────────────
  it("C6 chat vs form: same person — one draft binding, one server submit path (LISTING-E2E-01)", async () => {
    needFns();
    await buildQualifiedChat(UID_A, { contact: true });
    const chat = await createCase(UID_A, { confirmed: true });
    // The form (Owner Submission.dc.html) creates a case straight from the browser (anonymous, rules isPublicOwnerSubmission).
    const formId = "own-SYN-FORM-1";
    const formDocData = {
      source: "owner_submission", caseSource: "owner_form", listingStatus: "pending",
      contactName: NAME, ownerContact: CONTACT, trackToken: "SYNTHETIC-FORM-TOKEN-0123456789", submittedAt: Date.now(),
    };
    const f = await attempt(anon().doc("properties/" + formId).set(formDocData));
    // LISTING-E2E-01: the browser can no longer create a Case directly; the form submits through submitListingCase (server).
    rec("C6a", "form-style anonymous direct create is now REFUSED by rules (closed by LISTING-E2E-01; the form uses submitListingCase)", !f.allowed ? "CONTROL" : "CONTROL-FAILED", f.allowed ? "allowed" : "denied with " + f.error.code);
    assert.ok(!f.allowed);
    // LISTING-E2E-01: the chat Case and the form share ONE draft (draft__<uid>): the form's server path (submitListingCase)
    // completes the Case the chat opened instead of opening a second one (tests/listing/e2e.test.js "E2E-CHAT").
    const draftLinked = (await admin.firestore().doc("propertyDrafts/" + draftId(UID_A)).get()).data();
    rec("C6b", "chat Case is bound to the visitor's draft (draft.caseId) so the form completes it instead of opening a second Case (fixed by LISTING-E2E-01; proof in tests/listing/e2e.test.js E2E-CHAT)",
      draftLinked.caseId === chat.propertyId ? "CONTROL" : "CONTROL-FAILED", "draft.caseId=" + draftLinked.caseId + " chatCase=" + chat.propertyId);
    assert.strictEqual(draftLinked.caseId, chat.propertyId);
    // No merge was attempted by this test or by the code under test.
    // source checks
    const osub = read("Owner Submission.dc.html");
    const rail = read("ContactRail.dc.html");
    const formReadsDraft = /submitListingCase/.test(osub); // the form submits through the server path, which binds the draft by uid
    const railPlainNav = /_navigate\(\s*"Owner Submission\.dc\.html"\s*\)/.test(rail) && !/Owner Submission\.dc\.html\?/.test(rail);
    rec("C6c", "source: Owner Submission form submits through submitListingCase (server binds the chat draft by uid) — fixed by LISTING-E2E-01", formReadsDraft ? "CONTROL" : "CONTROL-FAILED", "uses submitListingCase: " + formReadsDraft);
    assert.ok(formReadsDraft);
    rec("C6d", "source: chat 'List property' button opens the form with NO draft/conversation parameter", railPlainNav ? "GAP-CONFIRMED" : "GAP-NOT-REPRODUCED", "plain navigate: " + railPlainNav);
  });

  // ── C7 PD-16 guard (Thai) — CHAT-FIX-01: fixed female fallback ────────────────────────────────
  describe("C7 PD-16 Thai female-voice guard (stub = logic only, not real-model behaviour)", () => {
    const FALLBACK = "ขออภัยค่ะ ตอนนี้ยังเรียบเรียงคำตอบได้ไม่สมบูรณ์ รบกวนส่งข้อความล่าสุดอีกครั้งนะคะ";
    const rep = (reply, extra) => Object.assign({ reply, stage: "general", primaryIntent: "OTHER" }, extra || {});
    const MALE = "ได้ครับ ขอทราบพื้นที่เพิ่มเติมได้ไหมครับ";
    const FEM = "ได้ค่ะ ขอทราบพื้นที่เพิ่มเติมได้ไหมคะ";
    const hasMale = (s) => /ครับ|ผม/.test(String(s).replace(/"[^"\n]*"|“[^”\n]*”/g, " "));
    const REASONS = ["retry_failed", "retry_still_male", "retry_unsafe"];

    // First call = the "truth" the server must keep. Retry call = deliberately DIFFERENT classification:
    // if any retry classification leaked into storage, the data-path checks below would see it.
    const FIRST_CLASS = {
      stage: "qualified", primaryIntent: "SELL", customerName: NAME, contact: CONTACT, requirementsSummary: "FIRST-SUMMARY",
      propertyBasics: { kind: "บ้าน", area: "หัวหิน", scale: "3 ห้องนอน" },
      propertyFields: { bedrooms: 3, area: "หัวหิน", price: 5000000 }, statedFields: ["bedrooms", "area", "price"], mentionedFields: ["bedrooms", "area", "price"],
    };
    const RETRY_CLASS = {
      stage: "general", primaryIntent: "BUY", customerName: "RETRY-NAME", contact: "+99 999 999 9999", requirementsSummary: "RETRY-SUMMARY",
      propertyBasics: { kind: "RETRY-KIND", area: "RETRY-AREA", scale: "RETRY-SCALE" },
      propertyFields: { bedrooms: 9, price: 9000000 }, statedFields: ["bedrooms", "price"], mentionedFields: ["bedrooms", "price"],
    };

    async function fallbackScenario(uid, firstReply, retryEntry) {
      iso.resetCalls();
      iso.setScript([Object.assign({ reply: firstReply }, FIRST_CLASS), retryEntry]);
      const r = await turn(uid, "ขายบ้านหัวหิน");
      const db = admin.firestore();
      const conv = (await db.doc("conversations/" + convId(uid)).get()).data() || {};
      const draft = (await db.doc("propertyDrafts/" + draftId(uid)).get()).data() || {};
      const f = draft.fields || {};
      const cases = await db.collection("properties").get();
      const lastMsg = (await db.collection("conversations/" + convId(uid) + "/messages").where("role", "==", "ai").get()).docs.map((d) => d.data().text);
      return { r, conv, f, cases, lastMsg, calls: iso.anthropicCalls.length };
    }
    function problems(x, reason) {
      const bad = [];
      if (x.r.reply !== FALLBACK) bad.push("reply is not the fixed fallback: " + x.r.reply);
      if (hasMale(x.r.reply)) bad.push("fallback has a male voice");
      if (/\[\[/.test(x.r.reply)) bad.push("fallback carries a token");
      if (x.r.meta.pd16Fallback !== reason) bad.push("reason code " + x.r.meta.pd16Fallback + " != " + reason);
      if (x.calls !== 2) bad.push("stub calls=" + x.calls + " (expected exactly 2: first + one retry)");
      // data path = FIRST call only
      if (x.conv.customerName !== NAME) bad.push("customerName not from first call");
      if (x.conv.contact !== CONTACT) bad.push("contact not from first call");
      if (x.conv.conversationStage !== "qualified" || x.conv.primaryIntent !== "SELL") bad.push("stage/intent not from first call");
      if (x.conv.requirementsSummary !== "FIRST-SUMMARY") bad.push("requirementsSummary not from first call");
      if (!x.conv.propertyBasics || x.conv.propertyBasics.area !== "หัวหิน" || x.conv.propertyBasics.kind !== "บ้าน") bad.push("propertyBasics not from first call");
      if (!(x.f.bedrooms && x.f.bedrooms.value === 3 && x.f.price && x.f.price.value === 5000000 && x.f.area && x.f.area.value === "หัวหิน")) bad.push("draft not equal to first-call fields");
      if (x.f.bedrooms && x.f.bedrooms.value === 9) bad.push("draft overwritten by retry value");
      if (!x.cases.empty) bad.push("a case was created automatically (" + x.cases.size + ")");
      if (!x.lastMsg.includes(FALLBACK) || x.lastMsg.some((t) => hasMale(t))) bad.push("stored AI message is not the fallback only");
      return bad;
    }

    it("C7a male first reply + clean retry => clean reply returned (2 stub calls, no fallback)", async () => {
      needFns();
      iso.setScript([rep(MALE), rep(FEM)]);
      const r = await turn(UID_A, "ขายบ้าน");
      const ok = !hasMale(r.reply) && iso.anthropicCalls.length === 2 && r.reply === FEM && r.meta.pd16Fallback === undefined;
      rec("C7a", "guard rewrites a male Thai reply when the retry is clean (unchanged behaviour; no fallback used)", ok ? "CONTROL" : "CONTROL-FAILED", "calls=" + iso.anthropicCalls.length + " reply=" + r.reply);
      assert.ok(ok);
    });

    const cases = [
      ["C7b", "retry STILL male (ครับ/ผม)", "retry_still_male", MALE, Object.assign({ reply: "ผมขอทราบพื้นที่ครับ" }, RETRY_CLASS)],
      ["C7c1", "retry CHANGES THE PRICE (5,000,000 -> 6,000,000)", "retry_unsafe", "ราคา 5,000,000 บาทครับ", Object.assign({ reply: "ราคา 6,000,000 บาทค่ะ" }, RETRY_CLASS)],
      ["C7c2", "retry DROPS the property code (HH-109)", "retry_unsafe", "รหัส HH-109 สนใจไหมครับ", Object.assign({ reply: "รหัส 109 สนใจไหมคะ" }, RETRY_CLASS)],
      ["C7c3", "retry DROPS the [[CONTACT]] token", "retry_unsafe", "ติดต่อเราได้ครับ [[CONTACT]]", Object.assign({ reply: "ติดต่อเราได้ค่ะ" }, RETRY_CLASS)],
      ["C7c4", "retry ADDS a [[CONTACT]] token", "retry_unsafe", "ขอข้อมูลเพิ่มครับ", Object.assign({ reply: "ขอข้อมูลเพิ่มค่ะ [[CONTACT]]" }, RETRY_CLASS)],
      ["C7c5", "retry DROPS the [[LIST_PROPERTY]] token", "retry_unsafe", "ฝากขายได้ครับ [[LIST_PROPERTY]]", Object.assign({ reply: "ฝากขายได้ค่ะ" }, RETRY_CLASS)],
      ["C7c6", "retry ADDS a [[LIST_PROPERTY]] token", "retry_unsafe", "ขอข้อมูลเพิ่มครับ", Object.assign({ reply: "ขอข้อมูลเพิ่มค่ะ [[LIST_PROPERTY]]" }, RETRY_CLASS)],
      ["C7c7", "retry CHANGES a quoted span", "retry_unsafe", "ลูกค้าเขียนว่า \"สนใจ\" ครับ", Object.assign({ reply: "ลูกค้าเขียนว่า \"ไม่สนใจ\" ค่ะ" }, RETRY_CLASS)],
      ["C7c8", "retry is EMPTY", "retry_unsafe", MALE, Object.assign({ reply: "   " }, RETRY_CLASS)],
      ["C7d", "retry CALL FAILS", "retry_failed", MALE, { __throw: "simulated retry failure" }],
    ];
    cases.forEach(([id, title, reason, firstReply, retryEntry], i) => {
      it(id + " " + title + " => fixed female fallback, first-call data kept, no automatic case", async () => {
        needFns();
        const x = await fallbackScenario(UID_A + "-fb" + i, firstReply, retryEntry);
        const bad = problems(x, reason);
        rec(id, title + " => fixed female fallback; draft/contact/stage = FIRST call; retry classification never used; no case created",
          bad.length ? "CONTROL-FAILED" : "CONTROL",
          bad.length ? "failed: " + bad.join("; ") : "reason=" + reason + " · 2 stub calls · reply=fallback · first-call data intact · cases=0");
        assert.deepStrictEqual(bad, []);
      });
    });

    it("C7e male words inside quotation marks are allowed (1 stub call)", async () => {
      needFns();
      iso.setScript([rep("ลูกค้าท่านหนึ่งเขียนว่า \"ผมสนใจครับ\" ค่ะ")]);
      const r = await turn(UID_A, "ขายบ้าน");
      const ok = iso.anthropicCalls.length === 1 && r.meta.pd16Fallback === undefined;
      rec("C7e", "quoted ครับ/ผม does not trigger the guard (by design, unchanged)", ok ? "CONTROL" : "CONTROL-FAILED", "calls=" + iso.anthropicCalls.length);
      assert.ok(ok);
    });
    it("C7f clean Thai reply passes with a single stub call (unchanged)", async () => {
      needFns();
      iso.setScript([rep(FEM)]);
      const r = await turn(UID_A, "ขายบ้าน");
      const ok = iso.anthropicCalls.length === 1 && r.reply === FEM && r.meta.pd16Fallback === undefined;
      rec("C7f", "clean Thai reply: no retry, no fallback (unchanged)", ok ? "CONTROL" : "CONTROL-FAILED", "calls=" + iso.anthropicCalls.length);
      assert.ok(ok);
    });
    it("C7g other 7 languages: guard/fallback not applied (observation, NOT a vulnerability finding)", async () => {
      needFns();
      const samples = { en: "Sure, could you tell me the area?", ru: "Конечно, укажите район?", zh: "好的，请问位于哪个区域？", de: "Gern, in welchem Gebiet liegt es?", no: "Gjerne, hvilket område er det?", fr: "Bien sûr, dans quel secteur ?", it: "Certo, in quale zona si trova?" };
      let single = 0;
      for (const [lang, text] of Object.entries(samples)) {
        iso.resetCalls(); iso.setScript([rep(text)]);
        const r = await turn(UID_A + "-" + lang, "sell");
        if (iso.anthropicCalls.length === 1 && r.reply === text && r.meta.pd16Fallback === undefined) single++;
      }
      rec("C7g", "non-Thai replies pass through the server unchanged: 1 call, no fallback (no gender check exists for en/ru/zh/de/no/fr/it)", single === 7 ? "CONTROL" : "CONTROL-FAILED", "unchanged " + single + "/7 · not counted as a vulnerability: no requirement text for these languages was found");
      assert.strictEqual(single, 7);
    });

    it("C7j the fixed fallback text itself", () => {
      const bad = [];
      if (!/ค่ะ/.test(FALLBACK) || !/นะคะ/.test(FALLBACK)) bad.push("no female particles");
      if (hasMale(FALLBACK)) bad.push("male voice");
      if (/\d/.test(FALLBACK)) bad.push("contains a digit");
      if (/\[\[/.test(FALLBACK)) bad.push("contains a token");
      if (/\b[A-Z]{2,4}-\d{2,6}\b/.test(FALLBACK)) bad.push("contains a property code");
      if (/"|“|”|'|‘|’|「|」|«|»/.test(FALLBACK)) bad.push("contains a quotation mark");
      for (const w of ["บันทึก", "ส่งเรียบร้อย", "ส่งแล้ว", "ทีมงาน", "ทีมกำลัง", "กำลังดูแล", "กำลังประสาน", "ได้รับเรื่อง"]) if (FALLBACK.includes(w)) bad.push("claims: " + w);
      rec("C7j", "fallback text: female particles, no ครับ/ผม, no digits/codes/tokens/quotes, claims nothing (not submitted, not saved)", bad.length ? "CONTROL-FAILED" : "CONTROL", bad.length ? bad.join("; ") : FALLBACK);
      assert.deepStrictEqual(bad, []);
    });

    it("C7k log lines hold only a fixed reason code (no customer text, model text, tokens, error detail)", async () => {
      needFns();
      const CUSTOMER = "ข้อความลูกค้า-SYN-ABC";
      const lines = [];
      const orig = { log: console.log, warn: console.warn, error: console.error, info: console.info };
      for (const k of Object.keys(orig)) console[k] = (...a) => { lines.push(a.map((v) => (typeof v === "string" ? v : JSON.stringify(v))).join(" ")); };
      let seen = [];
      try {
        const sc = [["retry_still_male", MALE + " [[CONTACT]] HH-109", { reply: "ผมขอทราบครับ" }], ["retry_unsafe", "ราคา 5,000,000 ครับ", { reply: "ราคา 6,000,000 ค่ะ" }], ["retry_failed", MALE, { __throw: "SECRET-ERROR-DETAIL-XYZ" }]];
        for (let i = 0; i < sc.length; i++) {
          iso.setScript([Object.assign({ reply: sc[i][1] }, FIRST_CLASS), Object.assign(sc[i][2], {})]);
          await fns.receptionTurn.run({ auth: { uid: UID_A + "-log" + i, token: {} }, data: { customerText: CUSTOMER, messages: [{ role: "user", content: CUSTOMER }] }, rawRequest: {} });
        }
      } finally { Object.assign(console, orig); }
      const all = lines.join("\n");
      const fb = lines.filter((l) => l.includes("\"event\":\"pd16_fallback\""));
      const reasons = fb.map((l) => { try { return JSON.parse(l.slice(l.indexOf("{"))).reason; } catch (e) { return "UNPARSEABLE"; } });
      const bad = [];
      if (reasons.length !== 3 || reasons.some((x) => !REASONS.includes(x))) bad.push("reasons=" + JSON.stringify(reasons));
      for (const [label, needle] of [["customer text", CUSTOMER], ["first reply text", "ขอทราบพื้นที่เพิ่มเติม"], ["retry text", "ผมขอทราบครับ"], ["CONTACT token", "[[CONTACT]]"], ["property code", "HH-109"], ["error detail", "SECRET-ERROR-DETAIL-XYZ"], ["fallback text", "ขออภัยค่ะ"], ["api key", FAKE_KEY]]) {
        if (all.includes(needle)) bad.push("log contains " + label);
      }
      rec("C7k", "pd16_fallback log = fixed reason code only; no customer text, model text, token, property code, error detail, key", bad.length ? "CONTROL-FAILED" : "CONTROL", bad.length ? bad.join("; ") : "reasons=" + reasons.join(",") + " · " + lines.length + " log lines scanned");
      assert.deepStrictEqual(bad, []);
    });

    it("C7m first-call failure is unchanged (error propagates, no retry, no fallback)", async () => {
      needFns();
      iso.setScript([{ __throw: "simulated first-call failure" }]);
      let threw = false;
      try { await turn(UID_A + "-first-fail", "ขายบ้าน"); } catch (e) { threw = true; }
      const ok = threw && iso.anthropicCalls.length === 1;
      rec("C7m", "the FIRST model call failing still throws to the client (unchanged), 1 call, no retry", ok ? "CONTROL" : "CONTROL-FAILED", "threw=" + threw + " calls=" + iso.anthropicCalls.length);
      assert.ok(ok);
    });

    it("C7l KNOWN LIMIT of the existing detector (not fixed here): a Thai word containing ผม, e.g. ผมสีดำ", async () => {
      needFns();
      // (a) the female reply contains "ผมสีดำ"; the retry keeps the word -> detector says male again -> fallback replaces a GOOD reply
      iso.resetCalls();
      iso.setScript([rep("บ้านหลังนี้มีสวนและต้นไม้ผมสีดำเงาๆ ตามชื่อสวนค่ะ"), rep("บ้านหลังนี้มีสวนและต้นไม้ผมสีดำเงาๆ ตามชื่อสวนค่ะ")]);
      const a = await turn(UID_A + "-fp1", "ขายบ้าน");
      // (b) the retry rephrases without the word -> retry released
      iso.resetCalls();
      iso.setScript([rep("บ้านหลังนี้มีสวนและต้นไม้ผมสีดำเงาๆ ตามชื่อสวนค่ะ"), rep("บ้านหลังนี้มีสวนและต้นไม้ใบสีเข้มเงาๆ ตามชื่อสวนค่ะ")]);
      const b = await turn(UID_A + "-fp2", "ขายบ้าน");
      const aReplaced = a.reply === FALLBACK && a.meta.pd16Fallback === "retry_still_male";
      const bPassed = b.reply.includes("ใบสีเข้ม") && b.meta.pd16Fallback === undefined;
      rec("C7l", "KNOWN LIMIT, NOT FIXED: a female reply containing the word ผมสีดำ is counted as a male voice -> retry; if the retry keeps the word the good reply is replaced by the fallback",
        aReplaced ? "GAP-CONFIRMED" : "GAP-NOT-REPRODUCED", "(a) retry keeps the word: replaced by fallback=" + aReplaced + " · (b) retry rephrases: retry released=" + bPassed + " · detector unchanged in this change; NOT claimed as fixed");
    });
  });

  // ── NOT-TESTED (recorded, then skipped => mocha reports them as PENDING, never as passing) ─────────
  function notTested(id, title, reason) {
    it(id + " " + title + " [NOT-TESTED]", function () { rec(id, title, "NOT-TESTED", reason); this.skip(); });
  }
  notTested("C3-refresh", "browser refresh / localStorage / IndexedDB auth restore", "needs a real browser session; this file only calls the server again with the same uid");
  notTested("C7h", "female persona + real answer quality in the other 7 languages (en/ru/zh/de/no/fr/it)", "needs the real model; this stub cannot say anything about it. Absence of a gender guard there is NOT treated as a vulnerability");
  notTested("C7i", "real-model behaviour for Thai (how often it writes ครับ/ผม)", "needs the real model on a test environment");
  notTested("C9", "real Anthropic model, deployed Functions/rules, production", "out of scope: stub + emulator only; this run is not a production PASS");

  // ── C8 isolation ──────────────────────────────────────────────────────
  it("C8 isolation: only the stub + local emulator were used", async () => {
    needFns();
    iso.setScript([casual, sellAdvisory]);
    await turn(UID_A, "สวัสดี");
    await turn(UID_A, "ขายบ้านที่หัวหิน 3 ห้องนอน");
    const keysOk = iso.anthropicCalls.length === 2 && iso.anthropicCalls.every((c) => c.apiKey === FAKE_KEY);
    rec("C8a", "every stubbed model call carried only the SYNTHETIC key", keysOk ? "CONTROL" : "CONTROL-FAILED", "calls=" + iso.anthropicCalls.length);
    const noneBlocked = iso.blocked.length === 0;
    rec("C8b", "no outbound call to any non-loopback host was attempted", noneBlocked ? "CONTROL" : "CONTROL-FAILED", noneBlocked ? "0 blocked" : JSON.stringify(iso.blocked));
    rec("C8d", "emulator-only guard (project demo-*, loopback hosts)", "CONTROL", "assertEmulatorOnly() passed at load");
    assert.ok(keysOk && noneBlocked);
  });
});
