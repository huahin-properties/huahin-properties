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
//   * A guard that lets "ครับ/ผม" through is recorded as a GAP, never as "persona passed".
//   * Not a production PASS. Labels: see tests/helpers/synthetic.js.

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const { initializeTestEnvironment } = require("@firebase/rules-unit-testing");
const { PROJECT_ID, assertEmulatorOnly, attempt, record, printSummary } = require("../helpers/synthetic");
const { install, FAKE_KEY } = require("./stub-anthropic");

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

let iso, origFetch, admin, fns, testEnv, loadError = null;
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

describe("CHAT-TEST-01: chat + draft path (synthetic, emulator, stubbed model)", function () {
  this.timeout(60000);

  before(async () => {
    origFetch = global.fetch;
    iso = install(); // closes external services BEFORE anything else loads
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
    const restored = iso.isRestoredTo(origFetch);
    rec("C8c", "after the run global.fetch / http(s) / env are restored", restored ? "CONTROL" : "CONTROL-FAILED", restored ? "restored" : "NOT restored");
    printSummary();
    await testEnv.cleanup();
    assert.ok(restored, "isolation was not restored");
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
    const caseDoc = (await admin.firestore().doc("properties/" + c1.propertyId).get()).data();
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
    const noBackLink = draftAfter.caseId === undefined && caseDoc.draftId === undefined;
    rec("C5f", "draft <-> case link (draft.caseId / case.draftId)", noBackLink ? "GAP-CONFIRMED" : "GAP-NOT-REPRODUCED", "draft.status=" + draftAfter.status + "; draft.caseId=" + draftAfter.caseId + "; case.draftId=" + caseDoc.draftId);
    results.chatCaseId = c1.propertyId;
  });

  // ── C6 ────────────────────────────────────────────────────────────────
  it("C6 chat vs form: same person, two paths (policy: one draft + one submit path; NOT implemented, only recorded)", async () => {
    needFns();
    await buildQualifiedChat(UID_A, { contact: true });
    const chat = await createCase(UID_A, { confirmed: true });
    // The form (Owner Submission.dc.html) creates a case straight from the browser (anonymous, rules isPublicOwnerSubmission).
    const formId = "own-SYN-FORM-1";
    const f = await attempt(anon().doc("properties/" + formId).set({
      source: "owner_submission", caseSource: "owner_form", listingStatus: "pending",
      contactName: NAME, ownerContact: CONTACT, trackToken: "SYNTHETIC-FORM-TOKEN-0123456789", submittedAt: Date.now(),
    }));
    rec("C6a", "form-style anonymous create is accepted by rules (current intended path)", f.allowed ? "CONTROL" : "CONTROL-FAILED", f.allowed ? "allowed" : "denied with " + f.error.code);
    assert.ok(f.allowed);
    const same = await admin.firestore().collection("properties").where("ownerContact", "==", CONTACT).get();
    const ids = same.docs.map((d) => d.id);
    const formDoc = (await admin.firestore().doc("properties/" + formId).get()).data();
    const linked = formDoc.conversationId || formDoc.draftId || (formDoc.linkedCaseIds || []).length;
    rec("C6b", "same contact via chat and via form => TWO separate cases, no link between them (policy 'one draft/one path/no duplicate case' NOT implemented)",
      same.size === 2 && !linked ? "GAP-CONFIRMED" : "GAP-NOT-REPRODUCED", "cases=" + same.size + " ids=" + ids.join(",") + " chatCase=" + chat.propertyId + " formCase.conversationId=" + formDoc.conversationId);
    // No merge was attempted by this test or by the code under test.
    // source checks
    const osub = read("Owner Submission.dc.html");
    const rail = read("ContactRail.dc.html");
    const formReadsDraft = /propertyDraft|getPropertyDraft|receptionTurn|conversationId/.test(osub);
    const railPlainNav = /_navigate\(\s*"Owner Submission\.dc\.html"\s*\)/.test(rail) && !/Owner Submission\.dc\.html\?/.test(rail);
    rec("C6c", "source: Owner Submission form does not read the chat draft or conversation id", !formReadsDraft ? "GAP-CONFIRMED" : "GAP-NOT-REPRODUCED", "form references draft/conversation: " + formReadsDraft);
    rec("C6d", "source: chat 'List property' button opens the form with NO draft/conversation parameter", railPlainNav ? "GAP-CONFIRMED" : "GAP-NOT-REPRODUCED", "plain navigate: " + railPlainNav);
  });

  // ── C7 PD-16 guard (Thai) ─────────────────────────────────────────────
  describe("C7 PD-16 Thai female-voice guard (stub = logic only, not real-model behaviour)", () => {
    const rep = (reply, extra) => Object.assign({ reply, stage: "general", primaryIntent: "OTHER" }, extra || {});
    const MALE = "ได้ครับ ขอทราบพื้นที่เพิ่มเติมได้ไหมครับ";
    const FEM = "ได้ค่ะ ขอทราบพื้นที่เพิ่มเติมได้ไหมคะ";
    const hasMale = (s) => /ครับ|ผม/.test(String(s).replace(/"[^"\n]*"|“[^”\n]*”/g, " "));

    it("C7a male first reply + clean retry => clean reply returned (2 stub calls)", async () => {
      needFns();
      iso.setScript([rep(MALE), rep(FEM)]);
      const r = await turn(UID_A, "ขายบ้าน");
      const ok = !hasMale(r.reply) && iso.anthropicCalls.length === 2;
      rec("C7a", "guard rewrites a male Thai reply when the retry is clean", ok ? "CONTROL" : "CONTROL-FAILED", "calls=" + iso.anthropicCalls.length + " reply=" + r.reply);
      assert.ok(ok);
    });
    it("C7b male first reply + retry STILL male => male reply is released", async () => {
      needFns();
      iso.setScript([rep(MALE), rep("ผมขอทราบพื้นที่ครับ")]);
      const r = await turn(UID_A, "ขายบ้าน");
      rec("C7b", "retry still has ครับ/ผม => guard releases a male-voice reply (persona NOT passed)", hasMale(r.reply) ? "GAP-CONFIRMED" : "GAP-NOT-REPRODUCED", "calls=" + iso.anthropicCalls.length + " released=" + r.reply);
    });
    it("C7c clean retry that changes a number => rejected, original male reply released", async () => {
      needFns();
      iso.setScript([rep("ราคา 5,000,000 บาทครับ"), rep("ราคา 6,000,000 บาทค่ะ")]);
      const r = await turn(UID_A, "ขายบ้าน");
      rec("C7c", "retry rejected because a number changed => original male reply released (persona NOT passed)", hasMale(r.reply) ? "GAP-CONFIRMED" : "GAP-NOT-REPRODUCED", "released=" + r.reply);
    });
    it("C7d failed retry => original male reply released", async () => {
      needFns();
      iso.setScript([rep(MALE), { __throw: "simulated retry failure" }]);
      const r = await turn(UID_A, "ขายบ้าน");
      rec("C7d", "retry call fails => original male reply released (persona NOT passed)", hasMale(r.reply) ? "GAP-CONFIRMED" : "GAP-NOT-REPRODUCED", "released=" + r.reply);
    });
    it("C7e male words inside quotation marks are allowed (1 stub call)", async () => {
      needFns();
      iso.setScript([rep("ลูกค้าท่านหนึ่งเขียนว่า \"ผมสนใจครับ\" ค่ะ")]);
      const r = await turn(UID_A, "ขายบ้าน");
      const ok = iso.anthropicCalls.length === 1;
      rec("C7e", "quoted ครับ/ผม does not trigger the guard (by design)", ok ? "CONTROL" : "CONTROL-FAILED", "calls=" + iso.anthropicCalls.length);
      assert.ok(ok);
    });
    it("C7f clean Thai reply passes with a single stub call", async () => {
      needFns();
      iso.setScript([rep(FEM)]);
      const r = await turn(UID_A, "ขายบ้าน");
      const ok = iso.anthropicCalls.length === 1 && r.reply === FEM;
      rec("C7f", "clean Thai reply: no retry", ok ? "CONTROL" : "CONTROL-FAILED", "calls=" + iso.anthropicCalls.length);
      assert.ok(ok);
    });
    it("C7g other 7 languages: guard is not applied (observation, NOT a vulnerability finding)", async () => {
      needFns();
      const samples = { en: "Sure, could you tell me the area?", ru: "Конечно, укажите район?", zh: "好的，请问位于哪个区域？", de: "Gern, in welchem Gebiet liegt es?", no: "Gjerne, hvilket område er det?", fr: "Bien sûr, dans quel secteur ?", it: "Certo, in quale zona si trova?" };
      let single = 0;
      for (const [lang, text] of Object.entries(samples)) {
        iso.resetCalls(); iso.setScript([rep(text)]);
        const r = await turn(UID_A + "-" + lang, "sell");
        if (iso.anthropicCalls.length === 1 && r.reply === text) single++;
      }
      rec("C7g", "non-Thai replies pass through the server unchanged (no gender check exists for en/ru/zh/de/no/fr/it)", single === 7 ? "CONTROL" : "CONTROL-FAILED", "unchanged " + single + "/7 · not counted as a vulnerability: no requirement text for these languages was found");
      assert.strictEqual(single, 7);
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
