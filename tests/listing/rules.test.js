// LISTING-E2E-01 — Firestore + Storage rules for the listing path. REAL rule files of this repo, SYNTHETIC data,
// emulators only (project demo-sec-test-01). Denial detection is strict (tests/helpers/synthetic.js: only
// permission-denied / storage/unauthorized count as "denied"; any other error fails the test).
"use strict";
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const { initializeTestEnvironment } = require("@firebase/rules-unit-testing");
const H = require("./helpers");
const { isAllowed } = require("../helpers/synthetic");
const { OWNER_UID, PROJECT_ID } = H;

const FS_RULES = fs.readFileSync(path.join(H.ROOT, "firestore.rules"), "utf8");
const ST_RULES = fs.readFileSync(path.join(H.ROOT, "storage.rules"), "utf8");
const UID = { staff: "syn-staff-uid", lister: "syn-lister-uid", lister2: "syn-lister2-uid", anonA: "syn-anon-a", anonB: "syn-anon-b", google: "syn-google-uid" };
let env;
const anonProv = { firebase: { sign_in_provider: "anonymous" } }, pwProv = { firebase: { sign_in_provider: "password" } };
const unauth = () => env.unauthenticatedContext();
const anon = (uid) => env.authenticatedContext(uid, anonProv);
const member = (uid) => env.authenticatedContext(uid, pwProv);
const owner = () => env.authenticatedContext(OWNER_UID, pwProv);
const _f = new WeakMap(), _s = new WeakMap();
const F = (ctx) => { if (!_f.has(ctx)) _f.set(ctx, ctx.firestore()); return _f.get(ctx); };
const S = (ctx) => { if (!_s.has(ctx)) _s.set(ctx, ctx.storage()); return _s.get(ctx); };
const img = (n) => Buffer.alloc(n || 16, 1);
const WEBP = { contentType: "image/webp" };
const allowed = (p) => isAllowed(p);

const CASE = "own-synthetic-case-1", CASE2 = "own-synthetic-case-2", LIVECASE = "own-synthetic-live-1", TOKEN = "T".repeat(48), LEGACY = "own-legacy-case-1", LEGACY_TOKEN = "L".repeat(48);

describe("LISTING-E2E-01 rules (real firestore.rules + storage.rules, emulators)", function () {
  this.timeout(120000);
  before(async () => { env = await initializeTestEnvironment({ projectId: PROJECT_ID, firestore: { rules: FS_RULES }, storage: { rules: ST_RULES } }); });
  after(async () => { await env.cleanup(); });
  beforeEach(async () => {
    await env.clearFirestore(); await env.clearStorage();
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await db.doc("adminUsers/" + UID.staff).set({ role: "staff" });
      await db.doc("listers/" + UID.lister).set({ displayName: "Synthetic Lister" });
      await db.doc("listers/" + UID.lister2).set({ displayName: "Synthetic Lister 2" });
      // new-style Cases: the record is team-only; there is NO public document for a pending one
      await db.doc("caseInternal/" + CASE).set({ propertyId: CASE, source: "owner_submission", internalSplit: true, listingStatus: "pending", reviewStatus: "submitted", type: "house", status: "sale", price: 1, submittedByUid: UID.anonA, submittedByRole: "external", trackToken: TOKEN, contactName: "Synthetic", contactPhone: "0800000000", listerId: UID.lister });
      await db.doc("casePhotos/" + CASE + "-0").set({ propertyId: CASE, index: 0, storagePath: "casePhotos/" + CASE + "/a-x/0.webp", dataUrl: "http://synthetic/private", uploadedByUid: UID.anonA });
      await db.doc("caseInternal/" + CASE2).set({ propertyId: CASE2, source: "owner_submission", internalSplit: true, listingStatus: "pending", reviewStatus: "submitted", submittedByUid: UID.anonB, trackToken: "U".repeat(48) });
      // a published new-style Case: the record + the public projection (server-written)
      await db.doc("caseInternal/" + LIVECASE).set({ propertyId: LIVECASE, source: "owner_submission", internalSplit: true, listingStatus: "live", reviewStatus: "approved", submittedByUid: UID.anonA, listerId: UID.lister, approvedAt: 1 });
      await db.doc("properties/" + LIVECASE).set({ source: "owner_submission", internalSplit: true, listingStatus: "live", listerId: UID.lister, price: 5, viewCount: 0, approvedAt: 1 });
      await db.doc("propertyPhotos/" + LIVECASE + "-0").set({ propertyId: LIVECASE, index: 0, dataUrl: "http://synthetic/pub", publishedByUid: OWNER_UID });
      // legacy documents (created before this change) and the member-owned listings of the existing flows
      await db.doc("properties/" + LEGACY).set({ source: "owner_submission", listingStatus: "pending", reviewStatus: "submitted", trackToken: LEGACY_TOKEN, contactName: "Legacy" });
      await db.doc("properties/LIVE-L1").set({ listerId: UID.lister, listingStatus: "live", approvedAt: 1, title: { th: "x" }, price: 1 });
      await db.doc("properties/PAUSED-L1").set({ listerId: UID.lister, listingStatus: "paused", approvedAt: 5, price: 1 });
      await db.doc("properties/PAUSED-NEVER").set({ listerId: UID.lister, listingStatus: "paused", price: 1 });
      await db.doc("properties/OFFLINE-L1").set({ listerId: UID.lister, listingStatus: "offline", price: 1 });
      await db.doc("properties/PENDING-L1").set({ listerId: UID.lister, listingStatus: "pending", price: 1 });
      await db.doc("properties/DRAFT-L1").set({ listerId: UID.lister, isDraft: true, price: 1 });
      await db.doc("properties/LIVE-L2").set({ listerId: UID.lister2, listingStatus: "live", approvedAt: 1, price: 1 });
      await db.doc("propertyPhotos/LIVE-L1-0").set({ propertyId: "LIVE-L1", index: 0, dataUrl: "http://synthetic/pub" });
      await db.doc("propertyDrafts/draft__" + UID.anonA).set({ ownerUid: UID.anonA, status: "draft", fields: {} });
      for (const id of [CASE, LEGACY]) {
        await db.doc("properties/" + id + "/caseMessages/m1").set({ visibility: "customer", caseToken: id === CASE ? TOKEN : LEGACY_TOKEN, senderType: "staff", direction: "outbound", customerText: "hi", createdAt: 1 });
        await db.doc("properties/" + id + "/caseMessages/m2").set({ visibility: "internal", senderType: "staff", direction: "outbound", text: "secret", createdAt: 2 });
      }
    });
  });

  // ── Firestore: creating / editing public documents ───────────────────────
  it("F1 nobody can create a property from a browser unless they are team or a signed-in member creating their OWN pending/draft listing: anonymous, unauthenticated and the old public-submission shape are refused", async () => {
    const shapes = [{ source: "owner_submission", listingStatus: "pending", status: "sale", price: 1 }, { listingStatus: "live", price: 1 }, { listerId: UID.anonA, listingStatus: "pending", price: 1 }, { listerId: UID.anonA, isDraft: true, price: 1 }];
    for (const [i, d] of shapes.entries()) {
      assert.strictEqual(await allowed(F(unauth()).doc("properties/new-u" + i).set(d)), false, "unauth " + JSON.stringify(d));
      assert.strictEqual(await allowed(F(anon(UID.anonA)).doc("properties/new-a" + i).set(d)), false, "anonymous auth " + JSON.stringify(d));
    }
    assert.strictEqual(await allowed(F(member(UID.google)).doc("properties/new-g").set({ listerId: UID.lister, listingStatus: "pending", price: 1 })), false, "cannot create for someone else's lister id");
  });

  it("F2 an agent/lister can no longer CREATE a listing document from a browser; they can still edit their EXISTING listings (including the internalNotes field the Lister Dashboard always sends) but can never make anything live or write approval fields", async () => {
    const L = F(member(UID.lister));
    // new listings are no longer created from a browser by an agent (they go through the private Case path); the old "create" shapes are refused
    for (const d of [{ listerId: UID.lister, listingStatus: "pending", price: 1, internalNotes: null }, { listerId: UID.lister, isDraft: true, price: 1, internalNotes: "my own note" }]) assert.strictEqual(await allowed(L.doc("properties/new-x").set(d)), false, "agent creates a listing document: " + JSON.stringify(d));
    assert.strictEqual(await allowed(L.doc("properties/new-live").set({ listerId: UID.lister, listingStatus: "live", price: 1 })), false, "create live");
    assert.strictEqual(await allowed(L.doc("properties/PENDING-L1").update({ description: "edited", internalNotes: "n" })), true, "edit own pending");
    assert.strictEqual(await allowed(L.doc("properties/PENDING-L1").update({ listingStatus: "live" })), false, "pending → live");
    assert.strictEqual(await allowed(L.doc("properties/DRAFT-L1").update({ listingStatus: "live", isDraft: false })), false, "draft → live");
    assert.strictEqual(await allowed(L.doc("properties/DRAFT-L1").update({ isDraft: false })), false, "draft → published without a status");
    assert.strictEqual(await allowed(L.doc("properties/DRAFT-L1").update({ listingStatus: "pending", isDraft: false })), true, "draft → submitted for approval");
    assert.strictEqual(await allowed(L.doc("properties/LIVE-L1").update({ description: "edited" })), true);
    assert.strictEqual(await allowed(L.doc("properties/LIVE-L1").update({ listingStatus: "paused" })), true, "pause");
    assert.strictEqual(await allowed(L.doc("properties/PAUSED-L1").update({ listingStatus: "live" })), true, "resume an APPROVED listing");
    assert.strictEqual(await allowed(L.doc("properties/PAUSED-NEVER").update({ listingStatus: "live" })), false);
    assert.strictEqual(await allowed(L.doc("properties/OFFLINE-L1").update({ listingStatus: "live" })), false);
    for (const f of [{ approvedAt: 9 }, { publishedAt: 9 }, { expiresAt: 9 }, { reviewStatus: "approved" }, { publicPropertyCode: "HH-1" }, { source: "owner_submission" }]) assert.strictEqual(await allowed(L.doc("properties/LIVE-L1").update(f)), false, "write " + Object.keys(f)[0]);
    assert.strictEqual(await allowed(L.doc("properties/LIVE-L2").update({ description: "hijack" })), false);
    assert.strictEqual(await allowed(F(anon(UID.anonA)).doc("properties/LIVE-L1").update({ description: "x" })), false);
    assert.strictEqual(await allowed(F(unauth()).doc("properties/LIVE-L1").update({ description: "x" })), false);
  });

  it("F2b the PUBLIC PROJECTION of a new-style Case is server-only: nobody — not the Owner, not Staff, not the agent whose listing it is, not the submitter — can create, edit or delete it from a browser; the public view-count still works", async () => {
    for (const [label, ctx] of [["owner", owner()], ["staff", member(UID.staff)], ["agent", member(UID.lister)], ["submitter", anon(UID.anonA)], ["unauth", unauth()]]) {
      const db = F(ctx);
      assert.strictEqual(await allowed(db.doc("properties/" + LIVECASE).update({ price: 1 })), false, label + " edit");
      assert.strictEqual(await allowed(db.doc("properties/" + LIVECASE).update({ listingStatus: "offline" })), false, label + " status");
      assert.strictEqual(await allowed(db.doc("properties/" + LIVECASE).delete()), false, label + " delete");
      assert.strictEqual(await allowed(db.doc("properties/" + LIVECASE).set({ price: 1 })), false, label + " replace");
      assert.strictEqual(await allowed(db.doc("properties/" + CASE).set({ listingStatus: "live", price: 1, listerId: UID.lister })), false, label + " create a public doc for a pending Case");
    }
    assert.strictEqual(await allowed(F(unauth()).doc("properties/" + LIVECASE).update({ viewCount: 1 })), true, "view counter");
    assert.strictEqual(await allowed(F(unauth()).doc("properties/" + LIVECASE).update({ viewCount: 1, price: 1 })), false, "…and only the counter");
  });

  it("F3 Staff on the Case RECORD: prepare, review, assign, verify — never live, never approve, never forge approval/publish fields or the submitter identity", async () => {
    const T = F(member(UID.staff));
    assert.strictEqual(await allowed(T.doc("caseInternal/" + CASE).update({ listingStatus: "live" })), false, "live");
    assert.strictEqual(await allowed(T.doc("caseInternal/" + CASE).update({ listingStatus: "pending_owner", description: "prepared" })), true, "prepared for the Owner");
    assert.strictEqual(await allowed(T.doc("caseInternal/" + CASE).update({ reviewStatus: "reviewing", assignedToEmail: "staff@example.test", verifications: { x: 1 }, internalNotes: "n" })), true);
    assert.strictEqual(await allowed(T.doc("caseInternal/" + CASE).update({ reviewStatus: "approved" })), false, "Staff cannot approve");
    for (const f of [{ approvedAt: 1 }, { publishedAt: 1 }, { expiresAt: 1 }, { publicPropertyCode: "HH-1" }, { intakeCompletedAt: 1 }, { approvedSubmissionId: "x" }, { approvedBy: "x" }, { approvedByUid: "x" }, { approvedByEmail: "x" }, { approvedByRole: "owner" }, { approvalPath: "x" }, { publishOp: { status: "done" } }, { submittedByUid: "other" }, { trackToken: "z".repeat(40) }, { source: "x" }]) assert.strictEqual(await allowed(T.doc("caseInternal/" + CASE).update(f)), false, "staff writes " + Object.keys(f)[0]);
    assert.strictEqual(await allowed(T.doc("caseInternal/new-record").set({ listingStatus: "pending" })), false, "records are created by the server only");
    assert.strictEqual(await allowed(T.doc("caseInternal/" + CASE).delete()), false);
    assert.strictEqual(await allowed(T.doc("properties/" + LEGACY).update({ assignedToEmail: "x@y.z" })), true, "an older Case behaves as before");
    assert.strictEqual(await allowed(T.doc("properties/new-staff-live").set({ listingStatus: "live", price: 1 })), false);
    assert.strictEqual(await allowed(T.doc("properties/new-staff").set({ listingStatus: "pending", price: 1 })), true, "(existing flow) staff may still prepare a listing");
  });

  it("F4 the Owner on the Case record: may record the intake decision and edit, but NOT write live / publish stamps / approval attribution (only publishListingCase does); cannot create or delete records", async () => {
    const O = F(owner());
    assert.strictEqual(await allowed(O.doc("caseInternal/" + CASE).update({ reviewStatus: "approved", approvedSubmissionId: "s1", intakeCompletedAt: 1, publicPropertyCode: "HH-1" })), true, "intake decision");
    assert.strictEqual(await allowed(O.doc("caseInternal/" + CASE).update({ description: "edited by owner" })), true);
    for (const f of [{ listingStatus: "live" }, { approvedAt: 1 }, { publishedAt: 1 }, { expiresAt: 1 }, { approvedByUid: OWNER_UID }, { approvedBy: "x" }, { approvalPath: "x" }, { publishOp: { status: "done" } }, { trackToken: "z".repeat(40) }]) assert.strictEqual(await allowed(O.doc("caseInternal/" + CASE).update(f)), false, "owner writes " + Object.keys(f)[0] + " from a browser");
    assert.strictEqual(await allowed(O.doc("caseInternal/new-record").set({ x: 1 })), false); assert.strictEqual(await allowed(O.doc("caseInternal/" + CASE).delete()), false);
    assert.strictEqual(await allowed(O.doc("casePhotos/" + CASE + "-9").set({ propertyId: CASE })), false, "private photo records are written by the server only");
    assert.strictEqual(await allowed(O.doc("properties/" + LEGACY).update({ contactPhone: "0800000001" })), true, "an older Case: unchanged");
  });

  // ── Firestore: who can read what ─────────────────────────────────────────
  it("F5 the Case record and the private photo records are TEAM-ONLY — the submitter, the agent whose listing it is, other users and anonymous visitors all get nothing; no public document exists for a pending Case", async () => {
    for (const [label, ctx] of [["unauth", unauth()], ["submitter (anonymous sign-in)", anon(UID.anonA)], ["other anonymous", anon(UID.anonB)], ["agent named on the Case", member(UID.lister)], ["other member", member(UID.google)]]) {
      assert.strictEqual(await allowed(F(ctx).doc("caseInternal/" + CASE).get()), false, label + ": record");
      assert.strictEqual(await allowed(F(ctx).collection("caseInternal").get()), false, label + ": list records");
      assert.strictEqual(await allowed(F(ctx).collection("caseInternal").where("submittedByUid", "==", UID.anonA).get()), false, label + ": query by submitter");
      assert.strictEqual(await allowed(F(ctx).doc("casePhotos/" + CASE + "-0").get()), false, label + ": private photo record");
      assert.strictEqual(await allowed(F(ctx).collection("casePhotos").where("propertyId", "==", CASE).get()), false, label + ": private photos query");
      assert.strictEqual(await allowed(F(ctx).collection("casePhotos").where("uploadedByUid", "==", UID.anonA).get()), false, label + ": private photos by uploader");
    }
    const noDoc = await F(unauth()).doc("properties/" + CASE).get(); assert.strictEqual(noDoc.exists, false, "a pending Case has no public document at all");
    assert.strictEqual((await F(unauth()).collection("properties").get()).docs.some((d) => d.id === CASE || d.id === CASE2), false);
    for (const c of [F(member(UID.staff)), F(owner())]) { assert.strictEqual(await allowed(c.doc("caseInternal/" + CASE).get()), true); assert.strictEqual(await allowed(c.collection("casePhotos").get()), true); }
    assert.strictEqual(await allowed(F(unauth()).doc("properties/" + LIVECASE).get()), true, "the published projection is public by design");
  });

  it("F6 drafts: only the owner of a draft can read it; nobody writes drafts from a browser", async () => {
    const id = "propertyDrafts/draft__" + UID.anonA;
    assert.strictEqual(await allowed(F(anon(UID.anonA)).doc(id).get()), true);
    for (const ctx of [unauth(), anon(UID.anonB), member(UID.lister)]) assert.strictEqual(await allowed(F(ctx).doc(id).get()), false);
    for (const ctx of [anon(UID.anonA), anon(UID.anonB), unauth(), owner()]) { assert.strictEqual(await allowed(F(ctx).doc(id).set({ ownerUid: UID.anonA, fields: {} })), false); assert.strictEqual(await allowed(F(ctx).doc(id).delete()), false); }
  });

  it("F7 caseMessages are TEAM-ONLY in the browser: a signed-out reader who knows the case id — with no token, a wrong token, the right token, or an unrelated uid — can neither list, query nor read, and cannot write; the same for an older Case", async () => {
    for (const id of [CASE, LEGACY]) {
      const tok = id === CASE ? TOKEN : LEGACY_TOKEN;
      const col = (ctx) => F(ctx).collection("properties/" + id + "/caseMessages");
      for (const [label, ctx] of [["unauth", unauth()], ["unrelated anonymous uid", anon(UID.anonB)], ["submitter", anon(UID.anonA)], ["unrelated member", member(UID.lister)]]) {
        assert.strictEqual(await allowed(col(ctx).get()), false, id + " " + label + ": list, no token");
        assert.strictEqual(await allowed(col(ctx).where("visibility", "==", "customer").get()), false, id + " " + label + ": customer-visible, no token");
        assert.strictEqual(await allowed(col(ctx).where("visibility", "==", "customer").where("caseToken", "==", "x".repeat(48)).get()), false, id + " " + label + ": wrong token");
        assert.strictEqual(await allowed(col(ctx).where("visibility", "==", "customer").where("caseToken", "==", tok).get()), false, id + " " + label + ": even the right token — customers use the server");
        assert.strictEqual(await allowed(F(ctx).doc("properties/" + id + "/caseMessages/m1").get()), false, id + " " + label + ": single read");
        assert.strictEqual(await allowed(F(ctx).doc("properties/" + id + "/caseMessages/m2").get()), false, id + " " + label + ": internal note");
        assert.strictEqual(await allowed(col(ctx).add({ senderType: "customer", direction: "inbound", visibility: "customer", caseToken: tok, originalText: "synthetic hello", createdAt: 1 })), false, id + " " + label + ": create with the right token");
        assert.strictEqual(await allowed(F(ctx).doc("properties/" + id + "/caseMessages/m1").update({ customerText: "edit" })), false);
        assert.strictEqual(await allowed(F(ctx).doc("properties/" + id + "/caseMessages/m1").delete()), false);
      }
      assert.strictEqual(await allowed(col(member(UID.staff)).get()), true, id + " team reads"); assert.strictEqual(await allowed(col(owner()).get()), true);
      assert.strictEqual(await allowed(col(member(UID.staff)).add({ senderType: "staff", direction: "outbound", visibility: "customer", customerText: "reply", createdAt: 3 })), true, id + " team writes");
      assert.strictEqual(await allowed(F(member(UID.staff)).doc("properties/" + id + "/caseMessages/m1").update({ customerText: "edit" })), false, "history is immutable");
    }
  });

  it("F7b the older direct token write on a legacy Case's own document still demands the token the writer presents (unchanged), and does not exist for a new-style Case", async () => {
    assert.strictEqual(await allowed(F(unauth()).doc("properties/" + LEGACY).update({ infoResponseMessage: "x", trackToken: LEGACY_TOKEN, infoResponseAt: 1, infoResponseStatus: "responded" })), true, "legacy: right token presented");
    assert.strictEqual(await allowed(F(unauth()).doc("properties/" + LEGACY).update({ infoResponseMessage: "x", trackToken: "w".repeat(48), infoResponseAt: 1, infoResponseStatus: "responded" })), false, "legacy: wrong token");
    assert.strictEqual(await allowed(F(unauth()).doc("properties/" + LIVECASE).update({ infoResponseMessage: "x", trackToken: TOKEN })), false, "new-style: no such path");
  });

  it("F8 public photo records: team or the owning member may write for the EXISTING flows; never for a Case that went through submitListingCase (server only); the public can read", async () => {
    const rec = (pid) => ({ propertyId: pid, index: 5, dataUrl: "http://synthetic/y" });
    assert.strictEqual(await allowed(F(unauth()).doc("propertyPhotos/LIVE-L1-0").get()), true);
    for (const [label, ctx] of [["unauth", unauth()], ["anonymous", anon(UID.anonA)], ["non-member", member(UID.google)], ["other member", member(UID.lister2)]]) {
      assert.strictEqual(await allowed(F(ctx).doc("propertyPhotos/LIVE-L1-5").set(rec("LIVE-L1"))), false, label + " create for someone else's listing");
      assert.strictEqual(await allowed(F(ctx).doc("propertyPhotos/LIVE-L1-0").update({ dataUrl: "http://evil" })), false, label + " update");
      assert.strictEqual(await allowed(F(ctx).doc("propertyPhotos/LIVE-L1-0").delete()), false, label + " delete");
    }
    const L = F(member(UID.lister));
    assert.strictEqual(await allowed(L.doc("propertyPhotos/LIVE-L1-5").set(rec("LIVE-L1"))), true, "owning member (existing flow)");
    assert.strictEqual(await allowed(L.doc("propertyPhotos/LIVE-L1-5").delete()), true);
    assert.strictEqual(await allowed(F(member(UID.staff)).doc("propertyPhotos/LIVE-L2-7").set(rec("LIVE-L2"))), true, "team (existing flow)");
    // a Case that went through submitListingCase: nobody — not the team, not the agent it names, not the submitter
    for (const [label, ctx] of [["owner", owner()], ["staff", member(UID.staff)], ["agent named on the Case", member(UID.lister)], ["submitter", anon(UID.anonA)]]) {
      assert.strictEqual(await allowed(F(ctx).doc("propertyPhotos/" + LIVECASE + "-9").set(rec(LIVECASE))), false, label + " create for a Case");
      assert.strictEqual(await allowed(F(ctx).doc("propertyPhotos/" + LIVECASE + "-0").update({ dataUrl: "http://evil" })), false, label + " update");
      assert.strictEqual(await allowed(F(ctx).doc("propertyPhotos/" + LIVECASE + "-0").delete()), false, label + " delete");
      assert.strictEqual(await allowed(F(ctx).doc("propertyPhotos/" + CASE + "-9").set(rec(CASE))), false, label + " create for a PENDING Case");
    }
  });

  it("F9 other collections untouched by this change keep their rules (smoke): leads still creatable by anyone, adminUsers closed", async () => {
    assert.strictEqual(await allowed(F(unauth()).collection("leads").add({ propertyId: "x", message: "hello" })), true);
    assert.strictEqual(await allowed(F(anon(UID.anonA)).doc("adminUsers/" + UID.anonA).set({ role: "staff" })), false);
    assert.strictEqual(await allowed(F(anon(UID.anonA)).doc("adminUsers/" + UID.anonA).set({ role: "owner" })), false);
  });

  // ── Storage ──────────────────────────────────────────────────────────────
  it("ST1 staging uploads: a submitter creates images in THEIR OWN folder only; no replace, no delete, image-only, size-capped; reading is owner + team only", async () => {
    const KEY = "k".repeat(20);
    const p = (uid, name) => "caseUploads/" + uid + "/" + KEY + "/" + name;
    const mine = S(anon(UID.anonA));
    assert.strictEqual(await allowed(mine.ref(p(UID.anonA, "0.webp")).put(img(), WEBP)), true, "own folder, anonymous sign-in");
    assert.strictEqual(await allowed(mine.ref(p(UID.anonA, "doc.webp")).put(img(), WEBP)), true, "ownership document slot");
    assert.strictEqual(await allowed(mine.ref(p(UID.anonA, "1.webp")).put(img(), WEBP)), true);
    assert.strictEqual(await allowed(mine.ref(p(UID.anonA, "0.webp")).put(img(32), WEBP)), false, "replace");
    assert.strictEqual(await allowed(mine.ref(p(UID.anonA, "0.webp")).delete()), false, "delete");
    assert.strictEqual(await allowed(mine.ref(p(UID.anonB, "0.webp")).put(img(), WEBP)), false, "another uid's folder");
    assert.strictEqual(await allowed(S(unauth()).ref(p(UID.anonA, "2.webp")).put(img(), WEBP)), false, "unauthenticated");
    assert.strictEqual(await allowed(mine.ref(p(UID.anonA, "2.webp")).put(img(), { contentType: "application/pdf" })), false, "not an image");
    assert.strictEqual(await allowed(mine.ref(p(UID.anonA, "3.webp")).put(img(8 * 1024 * 1024 + 1), WEBP)), false, "over 8 MB");
    for (const bad of ["evil.webp", "123.webp", "0.png", "0.webp.exe"]) assert.strictEqual(await allowed(mine.ref(p(UID.anonA, bad)).put(img(), WEBP)), false, bad);
    assert.strictEqual(await allowed(mine.ref("caseUploads/" + UID.anonA + "/short/0.webp").put(img(), WEBP)), false, "key shape");
    assert.strictEqual(await allowed(mine.ref(p(UID.anonA, "0.webp")).getMetadata()), true, "reads own");
    assert.strictEqual(await allowed(S(anon(UID.anonB)).ref(p(UID.anonA, "0.webp")).getMetadata()), false, "another visitor cannot read it");
    assert.strictEqual(await allowed(S(unauth()).ref(p(UID.anonA, "0.webp")).getMetadata()), false);
    assert.strictEqual(await allowed(S(owner()).ref(p(UID.anonA, "0.webp")).getMetadata()), true, "team can");
  });

  it("ST2 the bucket's old team catch-all is gone: the team can READ private case photos but cannot write them; published case photos are public-read / nobody-writes (even the team); unknown paths are closed to everyone", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await ctx.storage().ref("casePhotos/" + CASE + "/a-x/0.webp").put(img(), WEBP);
      await ctx.storage().ref("publishedCasePhotos/" + LIVECASE + "/p-1/0.webp").put(img(), WEBP);
      await ctx.storage().ref("propertyPhotos/LIVE-L1-0.webp").put(img(), WEBP);
      await ctx.storage().ref("someNewFolder/x.webp").put(img(), WEBP);
    });
    const priv = "casePhotos/" + CASE + "/a-x/0.webp", pubp = "publishedCasePhotos/" + LIVECASE + "/p-1/0.webp";
    for (const [label, ctx] of [["unauth", unauth()], ["anonymous", anon(UID.anonA)], ["member", member(UID.lister)]]) assert.strictEqual(await allowed(S(ctx).ref(priv).getMetadata()), false, label + " reads a private copy");
    assert.strictEqual(await allowed(S(owner()).ref(priv).getMetadata()), true, "team reads");
    for (const [label, ctx] of [["owner", owner()], ["member", member(UID.lister)], ["anonymous", anon(UID.anonA)]]) {
      assert.strictEqual(await allowed(S(ctx).ref("casePhotos/" + CASE + "/a-x/9.webp").put(img(), WEBP)), false, label + " writes a private copy");
      assert.strictEqual(await allowed(S(ctx).ref(priv).delete()), false, label + " deletes a private copy");
      assert.strictEqual(await allowed(S(ctx).ref(pubp).put(img(8), WEBP)), false, label + " overwrites a published case photo");
      assert.strictEqual(await allowed(S(ctx).ref(pubp).delete()), false, label + " deletes a published case photo");
      assert.strictEqual(await allowed(S(ctx).ref("publishedCasePhotos/" + LIVECASE + "/p-2/0.webp").put(img(), WEBP)), false, label + " creates a published case photo");
      assert.strictEqual(await allowed(S(ctx).ref("someNewFolder/y.webp").put(img(), WEBP)), false, label + " writes an unknown path");
      assert.strictEqual(await allowed(S(ctx).ref("someNewFolder/x.webp").getMetadata()), false, label + " reads an unknown path");
    }
    assert.strictEqual(await allowed(S(unauth()).ref(pubp).getMetadata()), true, "published case photos are public");
    assert.strictEqual(await allowed(S(unauth()).ref("propertyPhotos/LIVE-L1-0.webp").getMetadata()), true, "existing public photos unchanged");
    for (const [label, ctx] of [["unauth", unauth()], ["anonymous", anon(UID.anonA)]]) {
      assert.strictEqual(await allowed(S(ctx).ref("propertyPhotos/LIVE-L1-0.webp").put(img(), WEBP)), false, label + " replaces an existing public photo");
      assert.strictEqual(await allowed(S(ctx).ref("propertyPhotos/own-1800000000000-xyz-0.webp").put(img(), WEBP)), false, label + " the old anonymous own-*.webp create");
    }
    assert.strictEqual(await allowed(S(owner()).ref("propertyPhotos/LIVE-L1-1.webp").put(img(), WEBP)), true, "team still manages existing-flow photos (hard-coded owner uid)");
  });

  it("ST3 members via Firestore lookups (listers/adminUsers): probe — recorded as pending if the Storage emulator cannot resolve the cross-service lookup (known limit from SEC-TEST-01)", async function () {
    const lister = await allowed(S(member(UID.lister)).ref("propertyPhotos/LIVE-L1-2.webp").put(img(), WEBP));
    const staff = await allowed(S(member(UID.staff)).ref("propertyPhotos/LIVE-L1-3.webp").put(img(), WEBP));
    const nonMember = await allowed(S(member(UID.google)).ref("propertyPhotos/LIVE-L1-4.webp").put(img(), WEBP));
    assert.strictEqual(nonMember, false, "a signed-in non-member (no listers record) is refused");
    if (!lister || !staff) { console.log("      NOT-TESTED (pending): cross-service lookup unresolved in this emulator: lister=" + lister + " staff=" + staff); this.skip(); }
  });
});
