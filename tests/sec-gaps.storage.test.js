// SEC-TEST-01 (A2) — Firebase Storage rules probes, SYNTHETIC data, EMULATOR ONLY.
// Uses the Storage emulator + Firestore emulator (storage.rules reads
// adminUsers via firestore.exists/get). Labels: see tests/helpers/synthetic.js.
// A green run is NOT a security certification.

const fs = require("fs");
const path = require("path");
const { initializeTestEnvironment } = require("@firebase/rules-unit-testing");
const { PROJECT_ID, UID, assertEmulatorOnly, isAllowed, record, printSummary } = require("./helpers/synthetic");

assertEmulatorOnly();
if (!process.env.FIREBASE_STORAGE_EMULATOR_HOST) {
  throw new Error("SEC-TEST-01 storage: FIREBASE_STORAGE_EMULATOR_HOST not set; run via npm run test:sec");
}

const FS_RULES = fs.readFileSync(path.join(__dirname, "..", "firestore.rules"), "utf8");
const ST_RULES = fs.readFileSync(path.join(__dirname, "..", "storage.rules"), "utf8");
let testEnv;

const img = (n = 16) => Buffer.alloc(n, 1);
const WEBP = { contentType: "image/webp" };

const anonSt = () => testEnv.unauthenticatedContext().storage();
const asSt = (uid) => testEnv.authenticatedContext(uid).storage();

function gap(id, title, op, note) {
  it(id + " " + title, async () => {
    const allowed = await isAllowed(op());
    record({ id, title, label: allowed ? "GAP-CONFIRMED" : "GAP-NOT-REPRODUCED", note });
  });
}
function control(id, title, expectAllowed, op, note) {
  it(id + " " + title, async () => {
    const allowed = await isAllowed(op());
    const ok = allowed === expectAllowed;
    record({ id, title, label: ok ? "CONTROL" : "CONTROL-FAILED",
      note: (expectAllowed ? "expected ALLOWED" : "expected DENIED") + (ok ? "" : " but got " + (allowed ? "ALLOWED" : "DENIED")) + (note ? "; " + note : "") });
    if (!ok) throw new Error(id + ": control mismatch");
  });
}

describe("SEC-TEST-01 A2: Storage rules probes (synthetic, emulator)", function () {
  this.timeout(60000);

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: { rules: FS_RULES },
      storage: { rules: ST_RULES },
    });
  });
  beforeEach(async () => {
    await testEnv.clearFirestore();
    await testEnv.clearStorage();
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const fdb = ctx.firestore();
      await fdb.doc("adminUsers/" + UID.STAFF).set({ role: "staff" });
      await fdb.doc("adminUsers/" + UID.OWNER).set({ role: "owner" });
      const st = ctx.storage();
      // photo of an UNPUBLISHED owner-submission case, and another lister's photo
      await st.ref("propertyPhotos/own-1700000000000-abc-0.webp").put(img(), WEBP);
      await st.ref("propertyPhotos/LIVE-SYN-2-0.webp").put(img(), WEBP);
      await st.ref("profilePhotos/lister-avatar-" + UID.LISTER_2 + ".webp").put(img(), WEBP);
      await st.ref("caseAttachments/CASE-SYN-1/deed.pdf").put(img(), { contentType: "application/pdf" });
    });
  });
  after(async () => { printSummary(); await testEnv.cleanup(); });

  // ── public read of unpublished-case photos ────────────────────────────
  gap("S1a", "anonymous reads a photo of an unpublished owner-submission case (by name)",
    () => anonSt().ref("propertyPhotos/own-1700000000000-abc-0.webp").getMetadata(),
    "propertyPhotos is public-read for ALL objects, published or not");
  gap("S1b", "anonymous LISTS the propertyPhotos folder (enumerates names)",
    () => anonSt().ref("propertyPhotos").listAll(), "read rule also covers list");

  // ── anonymous upload channel ──────────────────────────────────────────
  control("S2a", "anonymous may create a small own-*.webp image (intended submission channel)", true,
    () => anonSt().ref("propertyPhotos/own-1800000000000-xyz-0.webp").put(img(), WEBP));
  control("S2b", "anonymous cannot upload a PDF under own-*.webp name", false,
    () => anonSt().ref("propertyPhotos/own-1800000000001-xyz-0.webp").put(img(), { contentType: "application/pdf" }));
  control("S2c", "anonymous cannot upload over 8 MB", false,
    () => anonSt().ref("propertyPhotos/own-1800000000002-xyz-0.webp").put(img(8 * 1024 * 1024 + 1), WEBP));
  control("S2d", "anonymous cannot upload with a non-own- name", false,
    () => anonSt().ref("propertyPhotos/LIVE-SYN-1-0.webp").put(img(), WEBP));
  control("S2e", "anonymous cannot overwrite an existing photo", false,
    () => anonSt().ref("propertyPhotos/own-1700000000000-abc-0.webp").put(img(), WEBP));
  control("S2f", "anonymous cannot delete a photo", false,
    () => anonSt().ref("propertyPhotos/own-1700000000000-abc-0.webp").delete());

  // ── any signed-in user ────────────────────────────────────────────────
  gap("S3a", "any signed-in user (no role) overwrites another lister's listing photo",
    () => asSt(UID.STRANGER).ref("propertyPhotos/LIVE-SYN-2-0.webp").put(img(), WEBP),
    "rule is isSignedIn() only; filename ownership is not checkable (documented in storage.rules)");
  gap("S3b", "any signed-in user deletes another lister's listing photo",
    () => asSt(UID.STRANGER).ref("propertyPhotos/LIVE-SYN-2-0.webp").delete());
  gap("S3c", "any signed-in user uploads a non-image, >8 MB object into propertyPhotos (public bucket path)",
    () => asSt(UID.STRANGER).ref("propertyPhotos/anything.pdf").put(img(9 * 1024 * 1024), { contentType: "application/pdf" }),
    "type/size limits apply only to the anonymous own-* rule");

  // ── controls ──────────────────────────────────────────────────────────
  control("S4a", "signed-in user cannot write ANOTHER user's profile photo slot", false,
    () => asSt(UID.STRANGER).ref("profilePhotos/lister-avatar-" + UID.LISTER_2 + ".webp").put(img(), WEBP));
  control("S4b", "signed-in user may write own profile photo slot", true,
    () => asSt(UID.STRANGER).ref("profilePhotos/lister-avatar-" + UID.STRANGER + ".webp").put(img(), WEBP));
  control("S5a", "anonymous cannot write siteContent images", false,
    () => anonSt().ref("siteContent/banner.webp").put(img(), WEBP));
  control("S5b", "signed-in non-team user cannot write siteContent images", false,
    () => asSt(UID.STRANGER).ref("siteContent/banner.webp").put(img(), WEBP));
  // Team membership in storage.rules is decided by firestore.exists(adminUsers/{uid}) — a CROSS-SERVICE
  // lookup. In this harness (Storage + Firestore emulators, firebase-tools 15.32.1) that lookup did not
  // resolve: an adminUsers-doc Staff was denied while the hard-coded Owner uid path was allowed. So team
  // allow-paths are recorded as NOT-TESTED (inconclusive) rather than counted as a rules verdict.
  function teamProbe(id, title, op) {
    it(id + " " + title, async () => {
      const allowed = await isAllowed(op());
      record(allowed
        ? { id, title, label: "CONTROL", note: "expected ALLOWED, got ALLOWED" }
        : { id, title, label: "NOT-TESTED", note: "inconclusive: cross-service adminUsers lookup did not resolve in the Storage emulator here; NOT a verdict on storage.rules" });
    });
  }
  teamProbe("S5c", "team member (Staff via adminUsers doc) may write siteContent images", () => asSt(UID.STAFF).ref("siteContent/banner.webp").put(img(), WEBP));
  const HARD = (ST_RULES.match(/request\.auth\.uid == "([^"]+)"/) || [])[1];
  control("S5d", "hard-coded Owner uid path (taken from storage.rules text) may write siteContent images", true,
    () => asSt(HARD).ref("siteContent/banner2.webp").put(img(), WEBP), "proves the harness can evaluate the team rule when no cross-service lookup is needed");
  control("S6a", "anonymous cannot read caseAttachments", false,
    () => anonSt().ref("caseAttachments/CASE-SYN-1/deed.pdf").getMetadata());
  control("S6b", "signed-in non-team user cannot read caseAttachments", false,
    () => asSt(UID.STRANGER).ref("caseAttachments/CASE-SYN-1/deed.pdf").getMetadata());
  teamProbe("S6c", "team member (Staff via adminUsers doc) may read caseAttachments", () => asSt(UID.STAFF).ref("caseAttachments/CASE-SYN-1/deed.pdf").getMetadata());
  control("S7", "anonymous cannot read an unnamed path (default deny)", false,
    () => anonSt().ref("someNewFolder/x.bin").getMetadata());
});
