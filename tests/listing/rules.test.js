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
const { OWNER_UID, PROJECT_ID, BUCKET_NAME } = H;

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

const CASE = "own-synthetic-case-1", CASE2 = "own-synthetic-case-2", TOKEN = "T".repeat(48), LEGACY = "own-legacy-case-1", LEGACY_TOKEN = "L".repeat(48);

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
      // a split Case (internal data elsewhere) submitted by anonymous visitor A
      await db.doc("properties/" + CASE).set({ source: "owner_submission", internalSplit: true, listingStatus: "pending", reviewStatus: "submitted", type: "house", status: "sale", price: 1, photoCount: 2 });
      await db.doc("caseInternal/" + CASE).set({ propertyId: CASE, submittedByUid: UID.anonA, submittedByRole: "external", trackToken: TOKEN, contactName: "Synthetic", contactPhone: "0800000000" });
      await db.doc("casePhotos/" + CASE + "-0").set({ propertyId: CASE, index: 0, dataUrl: "http://synthetic/private", uploadedByUid: UID.anonA });
      await db.doc("properties/" + CASE2).set({ source: "owner_submission", internalSplit: true, listingStatus: "pending", reviewStatus: "submitted", type: "land", status: "sale", price: 1 });
      await db.doc("caseInternal/" + CASE2).set({ propertyId: CASE2, submittedByUid: UID.anonB, trackToken: "U".repeat(48) });
      await db.doc("casePhotos/" + CASE2 + "-0").set({ propertyId: CASE2, index: 0, dataUrl: "http://synthetic/private2", uploadedByUid: UID.anonB });
      // a legacy Case (token still on the main document) and a legacy live listing owned by lister
      await db.doc("properties/" + LEGACY).set({ source: "owner_submission", listingStatus: "pending", reviewStatus: "submitted", trackToken: LEGACY_TOKEN, contactName: "Legacy" });
      await db.doc("properties/LIVE-L1").set({ listerId: UID.lister, listingStatus: "live", approvedAt: 1, title: { th: "x" }, price: 1 });
      await db.doc("properties/PAUSED-L1").set({ listerId: UID.lister, listingStatus: "paused", approvedAt: 5, price: 1 });
      await db.doc("properties/PAUSED-NEVER").set({ listerId: UID.lister, listingStatus: "paused", price: 1 });
      await db.doc("properties/OFFLINE-L1").set({ listerId: UID.lister, listingStatus: "offline", price: 1 });
      await db.doc("properties/PENDING-L1").set({ listerId: UID.lister, listingStatus: "pending", price: 1 });
      await db.doc("properties/DRAFT-L1").set({ listerId: UID.lister, isDraft: true, price: 1 });
      await db.doc("properties/LIVE-L2").set({ listerId: UID.lister2, listingStatus: "live", approvedAt: 1, price: 1 });
      await db.doc("propertyPhotos/LIVE-L1-0").set({ propertyId: "LIVE-L1", index: 0, dataUrl: "http://synthetic/pub" });
      await db.doc("propertyPhotos/" + CASE + "-0").set({ propertyId: CASE, index: 0, dataUrl: "http://synthetic/x" });
      await db.doc("propertyDrafts/draft__" + UID.anonA).set({ ownerUid: UID.anonA, status: "draft", fields: {} });
      await db.doc("properties/" + CASE + "/caseMessages/m1").set({ visibility: "customer", caseToken: TOKEN, senderType: "staff", direction: "outbound", customerText: "hi" });
      await db.doc("properties/" + CASE + "/caseMessages/m2").set({ visibility: "internal", senderType: "staff", direction: "outbound", customerText: "secret" });
      await db.doc("properties/" + LEGACY + "/caseMessages/m1").set({ visibility: "customer", caseToken: LEGACY_TOKEN, senderType: "staff", direction: "outbound", customerText: "hi" });
    });
  });

  // ── Firestore: creating / publishing ─────────────────────────────────────
  it("F1 nobody can create a property from a browser unless they are team or a signed-in member creating their OWN pending/draft listing: anonymous, unauthenticated, and the old public-submission shape are refused", async () => {
    const shapes = [{ source: "owner_submission", listingStatus: "pending", status: "sale", price: 1 }, { listingStatus: "live", price: 1 }, { listerId: UID.anonA, listingStatus: "pending", price: 1 }, { listerId: UID.anonA, isDraft: true, price: 1 }];
    for (const [i, d] of shapes.entries()) {
      assert.strictEqual(await allowed(F(unauth()).doc("properties/new-u" + i).set(d)), false, "unauth " + JSON.stringify(d));
      assert.strictEqual(await allowed(F(anon(UID.anonA)).doc("properties/new-a" + i).set(d)), false, "anonymous auth " + JSON.stringify(d));
    }
    assert.strictEqual(await allowed(F(member(UID.google)).doc("properties/new-g").set({ listerId: UID.lister, listingStatus: "pending", price: 1 })), false, "cannot create for someone else's lister id");
  });

  it("F2 an agent/lister can create+edit their OWN pending or draft listing but can never make anything live, write approval fields or internal fields", async () => {
    const L = F(member(UID.lister));
    assert.strictEqual(await allowed(L.doc("properties/new-p").set({ listerId: UID.lister, listingStatus: "pending", price: 1 })), true);
    assert.strictEqual(await allowed(L.doc("properties/new-d").set({ listerId: UID.lister, isDraft: true, price: 1 })), true);
    assert.strictEqual(await allowed(L.doc("properties/new-live").set({ listerId: UID.lister, listingStatus: "live", price: 1 })), false, "create live");
    assert.strictEqual(await allowed(L.doc("properties/new-nostatus").set({ listerId: UID.lister, isDraft: false, price: 1 })), false, "no status + not a draft = the 'grandfathered live' loophole");
    assert.strictEqual(await allowed(L.doc("properties/new-appr").set({ listerId: UID.lister, listingStatus: "pending", approvedAt: 1 })), false, "approval field on create");
    assert.strictEqual(await allowed(L.doc("properties/new-priv").set({ listerId: UID.lister, listingStatus: "pending", contactPhone: "1" })), false, "internal field on create");
    assert.strictEqual(await allowed(L.doc("properties/PENDING-L1").update({ description: "edited" })), true, "edit own pending");
    assert.strictEqual(await allowed(L.doc("properties/PENDING-L1").update({ listingStatus: "live" })), false, "pending → live");
    assert.strictEqual(await allowed(L.doc("properties/DRAFT-L1").update({ listingStatus: "live", isDraft: false })), false, "draft → live");
    assert.strictEqual(await allowed(L.doc("properties/DRAFT-L1").update({ isDraft: false })), false, "draft → published without a status (loophole)");
    assert.strictEqual(await allowed(L.doc("properties/DRAFT-L1").update({ listingStatus: "pending", isDraft: false })), true, "draft → submitted for approval");
    assert.strictEqual(await allowed(L.doc("properties/LIVE-L1").update({ description: "edited" })), true, "edit own live listing (status unchanged)");
    assert.strictEqual(await allowed(L.doc("properties/LIVE-L1").update({ listingStatus: "paused" })), true, "pause");
    assert.strictEqual(await allowed(L.doc("properties/PAUSED-L1").update({ listingStatus: "live" })), true, "resume an APPROVED listing");
    assert.strictEqual(await allowed(L.doc("properties/PAUSED-NEVER").update({ listingStatus: "live" })), false, "resume something never approved");
    assert.strictEqual(await allowed(L.doc("properties/OFFLINE-L1").update({ listingStatus: "live" })), false, "offline stays offline");
    assert.strictEqual(await allowed(L.doc("properties/OFFLINE-L1").update({ listingStatus: "pending" })), false, "offline → pending");
    for (const f of [{ approvedAt: 9 }, { publishedAt: 9 }, { expiresAt: 9 }, { reviewStatus: "approved" }, { publicPropertyCode: "HH-1" }, { source: "owner_submission" }, { approvedByUid: "x" }, { contactName: "x" }, { trackToken: "x".repeat(30) }, { assignedToEmail: "x@y.z" }]) {
      assert.strictEqual(await allowed(L.doc("properties/LIVE-L1").update(f)), false, "write " + Object.keys(f)[0]);
    }
    assert.strictEqual(await allowed(L.doc("properties/LIVE-L2").update({ description: "hijack" })), false, "someone else's listing");
    assert.strictEqual(await allowed(F(anon(UID.anonA)).doc("properties/LIVE-L1").update({ description: "x" })), false, "anonymous");
    assert.strictEqual(await allowed(F(unauth()).doc("properties/LIVE-L1").update({ description: "x" })), false, "unauthenticated");
  });

  it("F3 Staff can prepare and review but never publish, never approve, never write internal fields into a split Case's public document", async () => {
    const T = F(member(UID.staff));
    assert.strictEqual(await allowed(T.doc("properties/" + CASE).update({ listingStatus: "live" })), false, "live");
    assert.strictEqual(await allowed(T.doc("properties/" + CASE).update({ listingStatus: "pending_owner", description: "prepared" })), true, "prepared for the Owner");
    assert.strictEqual(await allowed(T.doc("properties/" + CASE).update({ reviewStatus: "reviewing" })), true);
    assert.strictEqual(await allowed(T.doc("properties/" + CASE).update({ reviewStatus: "approved" })), false, "Staff cannot approve");
    for (const f of [{ approvedAt: 1 }, { publishedAt: 1 }, { expiresAt: 1 }, { publicPropertyCode: "HH-1" }, { intakeCompletedAt: 1 }]) assert.strictEqual(await allowed(T.doc("properties/" + CASE).update(f)), false, "staff writes " + Object.keys(f)[0]);
    for (const f of [{ contactName: "leak" }, { trackToken: "leak".repeat(10) }, { assignedToEmail: "x@y.z" }, { verifications: { a: 1 } }]) assert.strictEqual(await allowed(T.doc("properties/" + CASE).update(f)), false, "internal field into public doc: " + Object.keys(f)[0]);
    assert.strictEqual(await allowed(T.doc("caseInternal/" + CASE).update({ assignedToEmail: "staff@example.test", verifications: { x: 1 } })), true, "internal fields go to caseInternal");
    for (const f of [{ approvedBy: "x" }, { approvedByUid: "x" }, { approvedByEmail: "x" }, { approvedByRole: "owner" }, { approvalPath: "x" }]) assert.strictEqual(await allowed(T.doc("caseInternal/" + CASE).update(f)), false, "Staff forges approval attribution: " + Object.keys(f)[0]);
    assert.strictEqual(await allowed(T.doc("properties/" + LEGACY).update({ assignedToEmail: "x@y.z" })), true, "legacy Case behaves as before");
    assert.strictEqual(await allowed(T.doc("properties/new-staff-live").set({ listingStatus: "live", price: 1 })), false, "create live");
    assert.strictEqual(await allowed(T.doc("properties/new-staff-approved").set({ listingStatus: "pending", reviewStatus: "approved" })), false, "create approved");
    assert.strictEqual(await allowed(T.doc("properties/new-staff").set({ listingStatus: "pending", price: 1 })), true);
  });

  it("F4 the Owner can publish (live) and write approval attribution; internal fields still cannot be written into a split Case's public document", async () => {
    const O = F(owner());
    assert.strictEqual(await allowed(O.doc("properties/" + CASE).update({ listingStatus: "live", approvedAt: 1, publishedAt: 1 })), true);
    assert.strictEqual(await allowed(O.doc("properties/" + CASE).update({ contactPhone: "0800000001" })), false, "enforces the split");
    assert.strictEqual(await allowed(O.doc("properties/" + LEGACY).update({ contactPhone: "0800000001" })), true, "legacy unchanged");
    assert.strictEqual(await allowed(O.doc("caseInternal/" + CASE).update({ approvedByUid: OWNER_UID, approvalPath: "owner_direct" })), true);
    assert.strictEqual(await allowed(O.doc("caseInternal/" + CASE).delete()), false, "internal records are never deleted");
    assert.strictEqual(await allowed(O.doc("casePhotos/" + CASE + "-9").set({ propertyId: CASE })), false, "private photo records are written by the server only");
  });

  // ── Firestore: who can read what ─────────────────────────────────────────
  it("F5 the public can read the public document but NOT internal data or private photo records; the submitter reads their own; other users and anonymous visitors do not", async () => {
    for (const [label, ctx] of [["unauth", unauth()], ["anonymous", anon(UID.anonB)], ["other member", member(UID.lister)]]) {
      assert.strictEqual(await allowed(F(ctx).doc("properties/" + CASE).get()), true, label + " reads the public document");
      assert.strictEqual(await allowed(F(ctx).doc("caseInternal/" + CASE).get()), false, label + ": internal");
      assert.strictEqual(await allowed(F(ctx).collection("caseInternal").get()), false, label + ": list internal");
      assert.strictEqual(await allowed(F(ctx).doc("casePhotos/" + CASE + "-0").get()), false, label + ": private photo record");
      assert.strictEqual(await allowed(F(ctx).collection("casePhotos").where("propertyId", "==", CASE).get()), false, label + ": private photos query");
    }
    const A = F(anon(UID.anonA));
    assert.strictEqual(await allowed(A.doc("caseInternal/" + CASE).get()), true, "submitter reads their internal record");
    assert.strictEqual(await allowed(A.doc("caseInternal/" + CASE2).get()), false, "…not somebody else's");
    assert.strictEqual(await allowed(A.collection("casePhotos").where("uploadedByUid", "==", UID.anonA).get()), true, "submitter lists their own private photos");
    assert.strictEqual(await allowed(A.collection("casePhotos").where("uploadedByUid", "==", UID.anonB).get()), false, "…not somebody else's");
    assert.strictEqual(await allowed(A.doc("caseInternal/" + CASE).update({ contactPhone: "x" })), false, "submitter cannot edit internal data");
    assert.strictEqual(await allowed(A.doc("casePhotos/" + CASE + "-0").delete()), false);
    const T = F(member(UID.staff)), O = F(owner());
    for (const c of [T, O]) { assert.strictEqual(await allowed(c.doc("caseInternal/" + CASE).get()), true); assert.strictEqual(await allowed(c.collection("casePhotos").get()), true); }
  });

  it("F6 drafts: only the owner of a draft can read it; nobody writes drafts from a browser", async () => {
    const id = "propertyDrafts/draft__" + UID.anonA;
    assert.strictEqual(await allowed(F(anon(UID.anonA)).doc(id).get()), true);
    for (const ctx of [unauth(), anon(UID.anonB), member(UID.lister)]) assert.strictEqual(await allowed(F(ctx).doc(id).get()), false);
    for (const ctx of [anon(UID.anonA), anon(UID.anonB), unauth(), owner()]) { assert.strictEqual(await allowed(F(ctx).doc(id).set({ ownerUid: UID.anonA, fields: {} })), false); assert.strictEqual(await allowed(F(ctx).doc(id).delete()), false); }
  });

  it("F7 Case messages keep working by token (token held in caseInternal for a new Case, on the document for a legacy one) and stay closed without it", async () => {
    const msg = (tok, extra) => Object.assign({ senderType: "customer", direction: "inbound", visibility: "customer", caseToken: tok, originalText: "synthetic hello", createdAt: 1 }, extra || {});
    const U = F(unauth());
    assert.strictEqual(await allowed(U.collection("properties/" + CASE + "/caseMessages").add(msg(TOKEN))), true, "new Case: right token");
    assert.strictEqual(await allowed(U.collection("properties/" + CASE + "/caseMessages").add(msg("x".repeat(48)))), false, "new Case: wrong token");
    assert.strictEqual(await allowed(U.collection("properties/" + CASE + "/caseMessages").add(msg(LEGACY_TOKEN))), false, "a legacy token does not open a new Case");
    assert.strictEqual(await allowed(U.collection("properties/" + LEGACY + "/caseMessages").add(msg(LEGACY_TOKEN))), true, "legacy Case: unchanged");
    assert.strictEqual(await allowed(U.collection("properties/" + LEGACY + "/caseMessages").add(msg(TOKEN))), false);
    assert.strictEqual(await allowed(U.collection("properties/" + CASE + "/caseMessages").where("visibility", "==", "customer").where("caseToken", "==", TOKEN).get()), true, "customer reads customer-visible messages");
    assert.strictEqual(await allowed(U.doc("properties/" + CASE + "/caseMessages/m2").get()), false, "internal note");
    assert.strictEqual(await allowed(U.collection("properties/" + CASE + "/caseMessages").get()), false, "unscoped list");
    assert.strictEqual(await allowed(U.doc("properties/" + CASE + "/caseMessages/m1").update({ customerText: "edit" })), false, "history is immutable");
    assert.strictEqual(await allowed(U.doc("properties/" + CASE).update({ infoResponseMessage: "x", trackToken: TOKEN, infoResponseAt: 1, infoResponseStatus: "responded" })), false, "no direct customer write to a new Case document");
  });

  it("F8 public listing photo records: only team or the owning member can create/update/delete; pending-case photos are no longer writable by anyone", async () => {
    const rec = (pid) => ({ propertyId: pid, index: 5, dataUrl: "http://synthetic/y" });
    assert.strictEqual(await allowed(F(unauth()).doc("propertyPhotos/LIVE-L1-0").get()), true, "public read");
    for (const [label, ctx] of [["unauth", unauth()], ["anonymous", anon(UID.anonA)], ["non-member", member(UID.google)], ["other member", member(UID.lister2)]]) {
      assert.strictEqual(await allowed(F(ctx).doc("propertyPhotos/LIVE-L1-5").set(rec("LIVE-L1"))), false, label + " create for someone else's listing");
      assert.strictEqual(await allowed(F(ctx).doc("propertyPhotos/LIVE-L1-0").update({ dataUrl: "http://evil" })), false, label + " update");
      assert.strictEqual(await allowed(F(ctx).doc("propertyPhotos/LIVE-L1-0").delete()), false, label + " delete");
    }
    assert.strictEqual(await allowed(F(unauth()).doc("propertyPhotos/" + CASE + "-0").update({ dataUrl: "http://evil" })), false, "the old 'public submission photo' update hole is closed");
    assert.strictEqual(await allowed(F(unauth()).doc("propertyPhotos/orphan-1").set(rec("brand-new-id"))), false, "any propertyId from anyone is closed");
    const L = F(member(UID.lister));
    assert.strictEqual(await allowed(L.doc("propertyPhotos/LIVE-L1-5").set(rec("LIVE-L1"))), true, "owning member");
    assert.strictEqual(await allowed(L.doc("propertyPhotos/LIVE-L1-5").delete()), true);
    assert.strictEqual(await allowed(F(member(UID.staff)).doc("propertyPhotos/LIVE-L2-7").set(rec("LIVE-L2"))), true, "team");
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

  it("ST2 private per-case photo copies: team read only, nobody writes from a browser; public listing photos: anonymous visitors cannot create/replace/delete (the old hole)", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await ctx.storage().ref("casePhotos/" + CASE + "/0.webp").put(img(), WEBP);
      await ctx.storage().ref("propertyPhotos/LIVE-L1-0.webp").put(img(), WEBP);
    });
    for (const [label, ctx] of [["unauth", unauth()], ["anonymous", anon(UID.anonA)], ["member", member(UID.lister)]]) assert.strictEqual(await allowed(S(ctx).ref("casePhotos/" + CASE + "/0.webp").getMetadata()), false, label + " reads private copy");
    assert.strictEqual(await allowed(S(owner()).ref("casePhotos/" + CASE + "/0.webp").getMetadata()), true, "team reads");
    assert.strictEqual(await allowed(S(member(UID.google)).ref("casePhotos/" + CASE + "/9.webp").put(img(), WEBP)), false, "no non-team user can write there");
    // KNOWN LIMIT (documented in the PR): the bucket's default-deny catch-all grants team members read/write on every path, and Storage ORs matching rules — so the team (not the public) can also write casePhotos/.
    assert.strictEqual(await allowed(S(unauth()).ref("propertyPhotos/LIVE-L1-0.webp").getMetadata()), true, "public listing photos stay public");
    for (const [label, ctx] of [["unauth", unauth()], ["anonymous", anon(UID.anonA)]]) {
      assert.strictEqual(await allowed(S(ctx).ref("propertyPhotos/LIVE-L1-0.webp").put(img(), WEBP)), false, label + " replace a live photo");
      assert.strictEqual(await allowed(S(ctx).ref("propertyPhotos/LIVE-L1-0.webp").delete()), false, label + " delete a live photo");
      assert.strictEqual(await allowed(S(ctx).ref("propertyPhotos/own-1800000000000-xyz-0.webp").put(img(), WEBP)), false, label + " the old anonymous own-*.webp create");
    }
    assert.strictEqual(await allowed(S(owner()).ref("propertyPhotos/LIVE-L1-1.webp").put(img(), WEBP)), true, "team (hard-coded owner uid)");
  });

  it("ST3 members via Firestore lookups (listers/adminUsers): probe — recorded as pending if the Storage emulator cannot resolve the cross-service lookup (known limit from SEC-TEST-01)", async function () {
    const lister = await allowed(S(member(UID.lister)).ref("propertyPhotos/LIVE-L1-2.webp").put(img(), WEBP));
    const staff = await allowed(S(member(UID.staff)).ref("propertyPhotos/LIVE-L1-3.webp").put(img(), WEBP));
    const nonMember = await allowed(S(member(UID.google)).ref("propertyPhotos/LIVE-L1-4.webp").put(img(), WEBP));
    assert.strictEqual(nonMember, false, "a signed-in non-member (no listers record) is refused");
    if (!lister || !staff) { console.log("      NOT-TESTED (pending): cross-service lookup unresolved in this emulator: lister=" + lister + " staff=" + staff); this.skip(); }
  });
});
