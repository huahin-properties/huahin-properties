// SEC-TEST-01 (A) — Firestore rules probes, SYNTHETIC data, EMULATOR ONLY.
//
// Run:  npm run test:sec
//
// What this is: a set of probes that ask the CURRENT firestore.rules whether
// specific risky operations are allowed. It does not change any rule.
//
// How to read the output (see tests/helpers/synthetic.js for the labels):
//   GAP-CONFIRMED       the risky operation was allowed  => weakness is REAL.
//   GAP-NOT-REPRODUCED  the rules denied the exact case tested.
//   CONTROL             expected-deny (or intentionally-allowed) behaviour.
//   NOT-TESTED          specified, not executed (reason given).
// A green run is NOT a security certification. Mocha "passing" only means the
// probe ran and produced an answer; for GAP rows the answer is the finding.

const fs = require("fs");
const path = require("path");
const { initializeTestEnvironment } = require("@firebase/rules-unit-testing");
const {
  PROJECT_ID, UID, INVITED_EMAIL, TOKEN_A, TOKEN_B,
  seedDocs, assertEmulatorOnly, isAllowed, record, printSummary,
} = require("./helpers/synthetic");

assertEmulatorOnly();

const RULES = fs.readFileSync(path.join(__dirname, "..", "firestore.rules"), "utf8");
let testEnv;

async function seed() {
  await testEnv.clearFirestore();
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    for (const [p, data] of Object.entries(seedDocs())) await db.doc(p).set(data);
  });
}

const anon = () => testEnv.unauthenticatedContext().firestore();
const as = (uid, token) => testEnv.authenticatedContext(uid, token || {}).firestore();

// gap(): hypothesis "this risky operation is ALLOWED". allowed => GAP-CONFIRMED.
function gap(id, title, op, note) {
  it(id + " " + title, async () => {
    const allowed = await isAllowed(op());
    record({ id, title, label: allowed ? "GAP-CONFIRMED" : "GAP-NOT-REPRODUCED", note });
  });
}
// control(): expected outcome is stated. Mismatch => CONTROL-FAILED and the run fails.
function control(id, title, expectAllowed, op, note) {
  it(id + " " + title, async () => {
    const allowed = await isAllowed(op());
    const ok = allowed === expectAllowed;
    record({ id, title, label: ok ? "CONTROL" : "CONTROL-FAILED",
      note: (expectAllowed ? "expected ALLOWED" : "expected DENIED") + (ok ? "" : " but got " + (allowed ? "ALLOWED" : "DENIED")) + (note ? "; " + note : "") });
    if (!ok) throw new Error(id + ": control mismatch");
  });
}
function notTested(id, title, reason) {
  it(id + " " + title + " [NOT-TESTED]", async () => { record({ id, title, label: "NOT-TESTED", note: reason }); });
}

describe("SEC-TEST-01 A: Firestore rules probes (synthetic, emulator)", function () {
  this.timeout(30000);

  before(async () => {
    testEnv = await initializeTestEnvironment({ projectId: PROJECT_ID, firestore: { rules: RULES } });
  });
  beforeEach(seed);
  after(async () => { printSummary(); await testEnv.cleanup(); });

  // ── Public reading of private / unpublished data ──────────────────────
  it("G1 anonymous can read an unpublished case incl. contact + trackToken", async () => {
    let allowed = false, leaked = [];
    try {
      const snap = await anon().doc("properties/CASE-SYN-1").get();
      allowed = true;
      const d = snap.data() || {};
      for (const f of ["contactName", "ownerContact", "trackToken", "internalNotes"]) if (f in d) leaked.push(f);
    } catch (e) { if (!/permission|PERMISSION/i.test(String(e.message || e.code))) throw e; }
    record({ id: "G1", title: "anonymous reads unpublished case (pending) document", label: allowed ? "GAP-CONFIRMED" : "GAP-NOT-REPRODUCED",
      note: allowed ? "fields visible: " + leaked.join(", ") : undefined });
  });

  it("G2 anonymous can list the whole properties collection (pending/offline included)", async () => {
    let allowed = false, statuses = {};
    try {
      const snap = await anon().collection("properties").get();
      allowed = true;
      snap.forEach((d) => { const s = d.data().listingStatus || "none"; statuses[s] = (statuses[s] || 0) + 1; });
    } catch (e) { if (!/permission|PERMISSION/i.test(String(e.message || e.code))) throw e; }
    record({ id: "G2", title: "anonymous lists all properties", label: allowed ? "GAP-CONFIRMED" : "GAP-NOT-REPRODUCED",
      note: allowed ? "statuses returned: " + JSON.stringify(statuses) : undefined });
  });

  gap("G3a", "anonymous reads owners", () => anon().doc("owners/OWN-SYN-1").get());
  gap("G3b", "anonymous reads tenants", () => anon().doc("tenants/TEN-SYN-1").get());
  gap("G3c", "anonymous reads listers (profile incl. internal fields)", () => anon().doc("listers/" + UID.LISTER_1).get(),
    "listers doc also holds tier/subscription/email-type fields in this synthetic shape; real shape unknown");
  gap("G3d", "anonymous reads a staffInvites document by e-mail key", () => anon().doc("staffInvites/" + INVITED_EMAIL).get(),
    "get is public by design for Staff Signup; combined with G9 it matters");
  control("G3e", "anonymous cannot LIST staffInvites", false, () => anon().collection("staffInvites").get());

  gap("G4a", "any signed-in user (no role) reads another agent's buyerRegistration",
    () => as(UID.STRANGER).doc("buyerRegistrations/BR-SYN-1").get());
  gap("G4b", "any signed-in user lists all buyerRegistrations",
    () => as(UID.STRANGER).collection("buyerRegistrations").get());

  // ── Writing: creation without allowed-field list / self-publish ───────
  gap("G5", "anonymous creates a pending owner_submission case with arbitrary extra fields (vipTier, listerId, approvedBy)",
    () => anon().doc("properties/NEW-SYN-1").set({
      source: "owner_submission", listingStatus: "pending",
      vipTier: "diamond", featured: true, listerId: UID.LISTER_1, approvedBy: "forged@example.test", price: 1,
    }), "rules only check source + listingStatus, no allowed-field list");
  control("G5b", "anonymous cannot create a listing as live", false,
    () => anon().doc("properties/NEW-SYN-2").set({ source: "owner_submission", listingStatus: "live" }));

  gap("G6", "signed-in lister creates own listing directly as live (no Owner approval)",
    () => as(UID.LISTER_1).doc("properties/NEW-SYN-3").set({ listerId: UID.LISTER_1, listingStatus: "live", price: 1 }),
    "rules comment says live is admin-only; code allows it (Aug 2026 auto-publish)");
  gap("G7a", "signed-in lister moves own pending listing to live",
    () => as(UID.LISTER_1).doc("properties/PEND-SYN-L1").update({ listingStatus: "live" }));
  gap("G7b", "signed-in lister writes approval fields (approvedBy/publishedAt) on own listing",
    () => as(UID.LISTER_1).doc("properties/PEND-SYN-L1").update({ approvedBy: "forged@example.test", publishedAt: Date.now() }));
  control("G7c", "lister cannot move an admin-offlined listing back to live", false,
    () => as(UID.LISTER_1).doc("properties/OFFLINE-SYN-L1").update({ listingStatus: "live" }));
  control("G7d", "lister cannot edit another lister's listing", false,
    () => as(UID.LISTER_1).doc("properties/LIVE-SYN-2").update({ price: 1 }));
  control("G7e", "Staff cannot set a listing live (update)", false,
    () => as(UID.STAFF).doc("properties/PEND-SYN-L1").update({ listingStatus: "live" }));
  control("G7f", "Staff cannot create a listing as live", false,
    () => as(UID.STAFF).doc("properties/NEW-SYN-4").set({ listingStatus: "live" }));
  control("G7g", "Owner can set a listing live", true,
    () => as(UID.OWNER).doc("properties/PEND-SYN-L1").update({ listingStatus: "live" }));

  gap("G8", "signed-in lister edits own listers doc: tier/subscriptionStatus/status",
    () => as(UID.LISTER_1).doc("listers/" + UID.LISTER_1).update({ tier: "agency", subscriptionStatus: "active", status: "approved" }),
    "any field of own doc is writable; client-side gating relies on these fields");
  control("G8b", "lister cannot edit another lister's doc", false,
    () => as(UID.LISTER_1).doc("listers/" + UID.LISTER_2).update({ tier: "agency" }));

  // ── Privilege escalation ──────────────────────────────────────────────
  gap("G9", "signed-up user with an INVITED e-mail but email_verified=false creates own adminUsers doc as staff",
    () => as(UID.ATTACKER, { email: INVITED_EMAIL, email_verified: false }).doc("adminUsers/" + UID.ATTACKER).set({ role: "staff" }),
    "rules do not check email_verified; invite doc is publicly readable (G3d)");
  it("G9b chain: after G9, does the new staff reach internal data?", async () => {
    const ctx = testEnv.authenticatedContext(UID.ATTACKER, { email: INVITED_EMAIL, email_verified: false });
    const db = ctx.firestore();
    const created = await isAllowed(db.doc("adminUsers/" + UID.ATTACKER).set({ role: "staff" }));
    if (!created) { record({ id: "G9b", title: "chain after self-promotion to staff", label: "NOT-TESTED", note: "G9 was denied, so chain not reachable" }); return; }
    const readsLeads = await isAllowed(db.doc("leads/LEAD-SYN-1").get());
    const readsCase = await isAllowed(db.doc("properties/CASE-SYN-1/caseMessages/M2").get());
    record({ id: "G9b", title: "after self-promotion to staff: reads leads / internal case messages", label: readsLeads && readsCase ? "GAP-CONFIRMED" : "GAP-NOT-REPRODUCED",
      note: "leads=" + readsLeads + ", internal caseMessage=" + readsCase });
  });
  control("G9c", "invited e-mail user cannot self-assign role owner", false,
    () => as(UID.ATTACKER, { email: INVITED_EMAIL, email_verified: true }).doc("adminUsers/" + UID.ATTACKER).set({ role: "owner" }));
  control("G9d", "user WITHOUT an invite cannot create adminUsers doc", false,
    () => as(UID.ATTACKER, { email: "noinvite@example.test", email_verified: true }).doc("adminUsers/" + UID.ATTACKER).set({ role: "staff" }));
  control("G9e", "Staff cannot change own role to owner", false,
    () => as(UID.STAFF).doc("adminUsers/" + UID.STAFF).update({ role: "owner" }));
  control("G9f", "lister cannot create an adminUsers doc without invite", false,
    () => as(UID.LISTER_1).doc("adminUsers/" + UID.LISTER_1).set({ role: "owner" }));

  // ── Photos / profile docs in Firestore ────────────────────────────────
  gap("G10a", "anonymous reads propertyPhotos doc belonging to an unpublished case", () => anon().doc("propertyPhotos/PH-SYN-1").get());
  gap("G10b", "anonymous creates a propertyPhotos doc attached to ANOTHER party's LIVE listing",
    () => anon().doc("propertyPhotos/PH-SYN-ATTACK").set({ propertyId: "LIVE-SYN-1", url: "synthetic://not-theirs" }),
    "create rule needs only a non-empty propertyId string");
  gap("G10c", "any signed-in user overwrites someone else's profilePhotos doc",
    () => as(UID.STRANGER).doc("profilePhotos/PP-SYN-1").set({ ownerUid: UID.STRANGER, url: "synthetic://replaced" }));

  // ── Tokens: the case-tracking design ──────────────────────────────────
  it("G11 chain: token read from the PUBLIC case doc opens customer messages and lets a stranger post as the customer", async () => {
    const snap = await anon().doc("properties/CASE-SYN-1").get().catch(() => null);
    const token = snap && snap.exists ? snap.data().trackToken : null;
    if (!token) { record({ id: "G11", title: "token chain", label: "GAP-NOT-REPRODUCED", note: "token not readable anonymously" }); return; }
    const reads = await isAllowed(anon().collection("properties/CASE-SYN-1/caseMessages")
      .where("visibility", "==", "customer").where("caseToken", "==", token).get());
    const posts = await isAllowed(anon().collection("properties/CASE-SYN-1/caseMessages").add({
      senderType: "customer", direction: "inbound", visibility: "customer", caseToken: token, originalText: "synthetic forged customer message" }));
    const writesInfo = await isAllowed(anon().doc("properties/CASE-SYN-1").update({
      trackToken: token, infoResponseMessage: "synthetic forged reply", infoResponseAt: Date.now(), infoResponseStatus: "answered" }));
    record({ id: "G11", title: "token learned from public doc => read customer messages / post / write reply",
      label: reads || posts || writesInfo ? "GAP-CONFIRMED" : "GAP-NOT-REPRODUCED", note: "read=" + reads + ", post=" + posts + ", infoReply=" + writesInfo });
  });
  control("T1a", "WRONG token cannot read customer messages", false,
    () => anon().collection("properties/CASE-SYN-1/caseMessages").where("visibility", "==", "customer").where("caseToken", "==", TOKEN_B).get());
  control("T1b", "EMPTY/short token cannot read customer messages", false,
    () => anon().collection("properties/CASE-SYN-1/caseMessages").where("visibility", "==", "customer").where("caseToken", "==", "short").get());
  control("T1c", "token of another case cannot post on this case", false,
    () => anon().collection("properties/CASE-SYN-1/caseMessages").add({ senderType: "customer", direction: "inbound", visibility: "customer", caseToken: TOKEN_B, originalText: "x" }));
  control("T1d", "token holder cannot read INTERNAL messages", false,
    () => anon().collection("properties/CASE-SYN-1/caseMessages").where("visibility", "==", "internal").where("caseToken", "==", TOKEN_A).get());
  control("T1e", "wrong token cannot write the reply fields", false,
    () => anon().doc("properties/CASE-SYN-1").update({ trackToken: TOKEN_B, infoResponseMessage: "x", infoResponseAt: 1, infoResponseStatus: "answered" }));
  control("T1f", "caseMessages history is immutable even for Owner (update)", false,
    () => as(UID.OWNER).doc("properties/CASE-SYN-1/caseMessages/M1").update({ originalText: "edited" }));
  control("T1g", "caseMessages history is immutable even for Owner (delete)", false,
    () => as(UID.OWNER).doc("properties/CASE-SYN-1/caseMessages/M1").delete());
  control("T1h", "anonymous cannot change price of a case", false,
    () => anon().doc("properties/CASE-SYN-1").update({ price: 1 }));
  control("T1i", "anonymous may bump viewCount only (intended)", true,
    () => anon().doc("properties/LIVE-SYN-1").update({ viewCount: 5 }));

  // ── Other controls ────────────────────────────────────────────────────
  control("C1", "anonymous cannot write owners", false, () => anon().doc("owners/OWN-SYN-2").set({ name: "x" }));
  control("C2", "anonymous cannot read leads", false, () => anon().doc("leads/LEAD-SYN-1").get());
  control("C3", "anonymous can create a lead (public contact form, intended)", true, () => anon().doc("leads/LEAD-SYN-NEW").set({ name: "synthetic", phone: "000" }));
  control("C4", "signed-in stranger cannot read leads", false, () => as(UID.STRANGER).doc("leads/LEAD-SYN-1").get());
  control("C5", "anonymous cannot read adminUsers", false, () => anon().doc("adminUsers/" + UID.OWNER).get());
  control("C6", "anonymous cannot read internal project dashboard", false, () => anon().doc("siteContent/projectDashboard").get());
  control("C7", "Staff can read owners (admin tools)", true, () => as(UID.STAFF).doc("owners/OWN-SYN-1").get());
  control("C8", "stranger cannot write owners", false, () => as(UID.STRANGER).doc("owners/OWN-SYN-2").set({ name: "x" }));
  control("C9", "stranger cannot write properties of another lister", false, () => as(UID.STRANGER).doc("properties/LIVE-SYN-1").update({ price: 1 }));

  // ── Not testable here ─────────────────────────────────────────────────
  notTested("F1", "Cloud Function token check / issue / revoke", "Function does not exist yet (target of a later package)");
  notTested("F2", "server-side approval record + chat/form link by evidence", "Function does not exist yet (target of a later package)");
  notTested("F3", "publicListings collection with allowlist fields", "collection does not exist yet (target of a later package)");
});
