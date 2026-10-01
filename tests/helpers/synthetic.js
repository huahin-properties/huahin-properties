// SEC-TEST-01 — shared helpers and SYNTHETIC data.
//
// Everything here is invented. No real customer, owner, agent, phone, e-mail
// or token appears in this file. Hostnames use the reserved ".test" TLD and
// the phone number is a fake placeholder.
//
// Safety: assertEmulatorOnly() refuses to run unless the project id starts
// with "demo-" and the Firestore/Storage hosts are loopback addresses, so a
// mis-set environment can never point these tests at production.

const PROJECT_ID = "demo-sec-test-01";

const LOOPBACK = /^(127\.0\.0\.1|localhost|\[::1\]|::1)(:\d+)?$/;

function assertEmulatorOnly() {
  const fsHost = process.env.FIRESTORE_EMULATOR_HOST;
  const stHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST;
  if (!fsHost || !LOOPBACK.test(fsHost)) {
    throw new Error(
      "SEC-TEST-01 refuses to run: FIRESTORE_EMULATOR_HOST is missing or not loopback (" +
        fsHost + "). Run through `npm run test:sec` (firebase emulators:exec)."
    );
  }
  if (stHost && !LOOPBACK.test(stHost)) {
    throw new Error("SEC-TEST-01 refuses to run: storage emulator host is not loopback (" + stHost + ").");
  }
  if (!PROJECT_ID.startsWith("demo-")) throw new Error("SEC-TEST-01: project id must start with demo-");
  const envProject = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
  if (envProject && !envProject.startsWith("demo-")) {
    throw new Error("SEC-TEST-01 refuses to run: GCLOUD_PROJECT is not a demo-* project (" + envProject + ").");
  }
}

// Fake identities (uids are made up; they are NOT real Firebase accounts).
const UID = {
  OWNER: "syn-owner-uid",
  STAFF: "syn-staff-uid",
  LISTER_1: "syn-lister-1-uid",
  LISTER_2: "syn-lister-2-uid",
  STRANGER: "syn-stranger-uid",      // any signed-in person with no role
  ATTACKER: "syn-attacker-uid",
};
const INVITED_EMAIL = "invitee@example.test";

const TOKEN_A = "SYNTHETIC-TRACK-TOKEN-A-0123456789"; // > 20 chars on purpose
const TOKEN_B = "SYNTHETIC-TRACK-TOKEN-B-9876543210";

// Seed documents written with rules disabled (the "already in the database"
// state). Shapes follow the field names seen in source; values are fake.
function seedDocs() {
  return {
    ["adminUsers/" + UID.OWNER]: { role: "owner" },
    ["adminUsers/" + UID.STAFF]: { role: "staff" },
    ["staffInvites/" + INVITED_EMAIL]: { email: INVITED_EMAIL, role: "staff" },
    ["listers/" + UID.LISTER_1]: { displayName: "Synthetic Lister One", tier: "trial", subscriptionStatus: "none", status: "active", email: "lister1@example.test" },
    ["listers/" + UID.LISTER_2]: { displayName: "Synthetic Lister Two", tier: "trial", subscriptionStatus: "none", status: "active", email: "lister2@example.test" },
    "properties/CASE-SYN-1": {
      source: "owner_submission", listingStatus: "pending", price: 1000000,
      contactName: "Synthetic Person One", ownerContact: "+00 000 000 0001",
      trackToken: TOKEN_A, internalNotes: "synthetic internal note 1",
    },
    "properties/CASE-SYN-2": {
      source: "owner_submission", listingStatus: "pending", price: 2000000,
      contactName: "Synthetic Person Two", ownerContact: "+00 000 000 0002",
      trackToken: TOKEN_B, internalNotes: "synthetic internal note 2",
    },
    "properties/LIVE-SYN-1": { listingStatus: "live", listerId: UID.LISTER_1, price: 3000000, title: "Synthetic live listing 1" },
    "properties/LIVE-SYN-2": { listingStatus: "live", listerId: UID.LISTER_2, price: 4000000, title: "Synthetic live listing 2" },
    "properties/PEND-SYN-L1": { listingStatus: "pending", listerId: UID.LISTER_1, price: 5000000, title: "Synthetic pending lister-1 listing" },
    "properties/OFFLINE-SYN-L1": { listingStatus: "offline", listerId: UID.LISTER_1, price: 6000000 },
    "properties/CASE-SYN-1/caseMessages/M1": { senderType: "customer", direction: "inbound", visibility: "customer", caseToken: TOKEN_A, originalText: "synthetic customer-visible message" },
    "properties/CASE-SYN-1/caseMessages/M2": { senderType: "staff", direction: "outbound", visibility: "internal", caseToken: TOKEN_A, originalText: "synthetic INTERNAL note" },
    "propertyPhotos/PH-SYN-1": { propertyId: "CASE-SYN-1", url: "synthetic://photo-1" },
    "owners/OWN-SYN-1": { name: "Synthetic Owner", phone: "+00 000 000 0003" },
    "tenants/TEN-SYN-1": { name: "Synthetic Tenant", phone: "+00 000 000 0004" },
    "buyerRegistrations/BR-SYN-1": { listerId: UID.LISTER_1, propertyId: "LIVE-SYN-1", phone: "0000000005", email: "buyer@example.test" },
    "leads/LEAD-SYN-1": { name: "Synthetic Lead", phone: "+00 000 000 0006" },
    "profilePhotos/PP-SYN-1": { ownerUid: UID.LISTER_1, url: "synthetic://profile-1" },
    "siteContent/projectDashboard": { note: "synthetic internal dashboard" },
  };
}

// ── probe recorder ───────────────────────────────────────────────────────
// Labels (agreed with Work, 1 Oct 2026):
//   GAP-CONFIRMED      the risky operation was ALLOWED by the current rules.
//                      A passing run of this probe means "gap confirmed",
//                      NOT "safe".
//   GAP-NOT-REPRODUCED the hypothesis was tested and the rules DENIED it, for
//                      the exact case tested. Not a guarantee for other cases.
//   CONTROL            behaviour that should be denied (or intentionally
//                      allowed) and was checked. A CONTROL that does not
//                      match expectation fails the run.
//   NOT-TESTED         specified but not executed (reason recorded).
const results = [];

// Only these error codes are accepted as "the rules said no":
//   Firestore client SDK  -> FirebaseError.code === "permission-denied"
//   Storage client SDK    -> StorageError.code  === "storage/unauthorized"
// Message text is NOT inspected: a message that merely mentions "403",
// "unauthorized" or "permission" (proxy page, emulator crash, network error)
// is not evidence that a rule denied anything.
const DENIAL_CODES = new Set(["permission-denied", "storage/unauthorized"]);

function isPermissionDenied(e) {
  return !!e && typeof e.code === "string" && DENIAL_CODES.has(e.code);
}

// Runs the operation. Resolves { allowed: true, value } when it succeeds,
// { allowed: false, error } on an expected rules denial, and RE-THROWS every
// other error (network, emulator down, SDK/runtime, bad test code) so the test fails.
async function attempt(promise) {
  try {
    return { allowed: true, value: await promise };
  } catch (e) {
    if (isPermissionDenied(e)) return { allowed: false, error: e };
    throw e;
  }
}

async function isAllowed(promise) {
  return (await attempt(promise)).allowed;
}

function record(entry) {
  results.push(entry);
  return entry;
}

let printedUpTo = 0;
function printSummary() {
  const batch = results.slice(printedUpTo);
  printedUpTo = results.length;
  const order = ["GAP-CONFIRMED", "GAP-NOT-REPRODUCED", "CONTROL", "NOT-TESTED", "CONTROL-FAILED"];
  const lines = ["", "══════════ SEC-TEST-01 RESULT SUMMARY ══════════"];
  for (const label of order) {
    const rows = batch.filter((r) => r.label === label);
    if (!rows.length) continue;
    lines.push("", "[" + label + "] " + rows.length);
    for (const r of rows) lines.push("  - " + r.id + ": " + r.title + (r.note ? "  — " + r.note : ""));
  }
  lines.push(
    "",
    "A passing run is NOT a security certification. GAP-CONFIRMED rows are open",
    "weaknesses; GAP-NOT-REPRODUCED covers only the single case tested.",
    "Synthetic data, emulator only (project " + PROJECT_ID + ").",
    "═════════════════════════════════════════════════", ""
  );
  console.log(lines.join("\n"));
  if (process.env.SEC_TEST_RESULTS_FILE) {
    require("fs").writeFileSync(process.env.SEC_TEST_RESULTS_FILE, JSON.stringify(results, null, 2));
  }
}

module.exports = { PROJECT_ID, UID, INVITED_EMAIL, TOKEN_A, TOKEN_B, seedDocs, assertEmulatorOnly, isAllowed, attempt, isPermissionDenied, record, printSummary, results };
