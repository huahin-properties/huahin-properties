// SEC-TEST-01 (B) — Cloud Function characterization, SYNTHETIC data, EMULATOR ONLY.
//
// The Admin SDK BYPASSES Firestore rules, so rules tests alone cannot say what a
// Function writes. This file loads the CURRENT functions/index.js in-process
// (no deploy, no network, Admin SDK pointed at the Firestore emulator) and calls
// createCaseFromConversation through its callable .run(), then asks the rules
// whether what the Function wrote is publicly readable.
//
// It CHARACTERIZES today's behaviour. It does not test any fixed behaviour
// (those Functions do not exist yet — see F1..F3 in the rules file).
// Requires `npm ci` inside functions/ (not committed; node_modules is ignored).

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const { initializeTestEnvironment } = require("@firebase/rules-unit-testing");
const { PROJECT_ID, assertEmulatorOnly, record, printSummary } = require("../helpers/synthetic");

assertEmulatorOnly();

const FUNCTIONS_DIR = path.join(__dirname, "..", "..", "functions");
const RULES = fs.readFileSync(path.join(__dirname, "..", "..", "firestore.rules"), "utf8");

let fns, admin, testEnv;
const VISITOR = "syn-visitor-uid";
const OTHER = "syn-other-visitor-uid";
const CONV = "reception__" + VISITOR;

function qualifiedConversation() {
  return {
    visitorId: VISITOR, conversationStage: "qualified", primaryIntent: "SELL",
    customerName: "Synthetic Seller", contact: "+00 000 000 0007",
    propertyBasics: { kind: "house", area: "synthetic-area", scale: "3 bedrooms" },
    requirementsSummary: "synthetic requirement", customerLanguage: "en", qualifiedAt: 1,
  };
}
const callCreate = (uid, data) => fns.createCaseFromConversation.run({ auth: uid ? { uid, token: {} } : undefined, data, rawRequest: {} });
const record_ = (id, title, label, note) => record({ id, title, label, note });

describe("SEC-TEST-01 B: createCaseFromConversation characterization (synthetic, emulator)", function () {
  this.timeout(60000);
  let loadError = null;

  before(async () => {
    testEnv = await initializeTestEnvironment({ projectId: PROJECT_ID, firestore: { rules: RULES } });
    try {
      // functions/index.js resolves firebase-admin from functions/node_modules
      admin = require(require.resolve("firebase-admin", { paths: [FUNCTIONS_DIR] }));
      fns = require(path.join(FUNCTIONS_DIR, "index.js"));
      assert.ok(fns.createCaseFromConversation && typeof fns.createCaseFromConversation.run === "function", "callable .run not available");
    } catch (e) { loadError = e; }
  });
  beforeEach(async () => {
    await testEnv.clearFirestore();
    if (loadError) return;
    await admin.firestore().doc("conversations/" + CONV).set(qualifiedConversation());
  });
  after(async () => { printSummary(); await testEnv.cleanup(); });

  function needFns(id, title) {
    if (loadError) {
      record_(id, title, "NOT-TESTED", "functions/index.js could not be loaded in-process: " + String(loadError.message).split("\n")[0] + " (run `npm ci` in functions/)");
      return false;
    }
    return true;
  }

  it("B1 the Case the Function creates is anonymously readable with contact + trackToken", async () => {
    if (!needFns("B1", "chat Case readable by anonymous")) return;
    const res = await callCreate(VISITOR, { confirmed: true });
    assert.strictEqual(res.created, true, "Function did not create a case: " + JSON.stringify(res));
    const stored = (await admin.firestore().doc("properties/" + res.propertyId).get()).data();
    const present = ["contactName", "ownerContact", "trackToken", "conversationId", "receptionVisitorId"].filter((f) => stored[f]);
    const anonSnap = await testEnv.unauthenticatedContext().firestore().doc("properties/" + res.propertyId).get().then((s) => s, () => null);
    const exposed = anonSnap && anonSnap.exists ? present.filter((f) => anonSnap.data()[f]) : [];
    record_("B1", "chat-created Case: contact/trackToken stored on the properties doc and readable by anonymous",
      exposed.length ? "GAP-CONFIRMED" : "GAP-NOT-REPRODUCED",
      "stored fields: " + present.join(",") + "; anonymously readable: " + exposed.join(",") + "; listingStatus=" + stored.listingStatus + ", source=" + stored.source);
  });

  it("B2 internal provenance message is NOT customer-visible and carries no token", async () => {
    if (!needFns("B2", "provenance message internal")) return;
    const res = await callCreate(VISITOR, { confirmed: true });
    const msgs = await admin.firestore().collection("properties/" + res.propertyId + "/caseMessages").get();
    const bad = msgs.docs.filter((d) => d.data().visibility !== "internal" || d.data().caseToken);
    const ok = msgs.size >= 1 && bad.length === 0;
    record_("B2", "provenance caseMessage is internal and has no caseToken", ok ? "CONTROL" : "CONTROL-FAILED", "messages=" + msgs.size + ", non-internal/with-token=" + bad.length);
    assert.ok(ok);
  });

  it("B3 repeat call returns the SAME case + token (link by server-side uid evidence, no duplicate)", async () => {
    if (!needFns("B3", "repeat call no duplicate")) return;
    const a = await callCreate(VISITOR, { confirmed: true });
    const b = await callCreate(VISITOR, { confirmed: true });
    const cases = await admin.firestore().collection("properties").where("conversationId", "==", CONV).get();
    const ok = a.created && b.created && b.alreadyExisted === true && a.propertyId === b.propertyId && cases.size === 1;
    record_("B3", "repeat confirm => same case id, no duplicate", ok ? "CONTROL" : "CONTROL-FAILED", "cases for conversation=" + cases.size);
    assert.ok(ok);
  });

  it("B4 another visitor cannot obtain this case (id is derived from caller uid, not from the request)", async () => {
    if (!needFns("B4", "other visitor isolation")) return;
    await callCreate(VISITOR, { confirmed: true });
    const res = await callCreate(OTHER, { confirmed: true, propertyId: "x", conversationId: CONV });
    const ok = res.created === false;
    record_("B4", "other uid (with forged conversationId in payload) gets no case", ok ? "CONTROL" : "CONTROL-FAILED", "reason=" + res.reason);
    assert.ok(ok);
  });

  it("B5 unauthenticated call is rejected; unconfirmed call creates nothing", async () => {
    if (!needFns("B5", "auth + consent")) return;
    let rejected = false;
    try { await callCreate(null, { confirmed: true }); } catch (e) { rejected = /unauthenticated/i.test(String(e.code || e.message)); }
    const nc = await callCreate(VISITOR, {});
    const cases = await admin.firestore().collection("properties").get();
    const ok = rejected && nc.created === false && cases.size === 0;
    record_("B5", "no auth => rejected; confirmed!==true => no case", ok ? "CONTROL" : "CONTROL-FAILED", "rejected=" + rejected + ", reason=" + nc.reason + ", cases=" + cases.size);
    assert.ok(ok);
  });

  it("B6 incomplete conversation (no usable contact) creates nothing", async () => {
    if (!needFns("B6", "gate")) return;
    await admin.firestore().doc("conversations/" + CONV).set({ ...qualifiedConversation(), contact: "later" });
    const res = await callCreate(VISITOR, { confirmed: true });
    const ok = res.created === false && res.reason === "missing_contact";
    record_("B6", "gate rejects a conversation without a usable contact", ok ? "CONTROL" : "CONTROL-FAILED", "reason=" + res.reason);
    assert.ok(ok);
  });
});
