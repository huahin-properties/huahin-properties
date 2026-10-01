// LISTING-E2E-01 — submitListingCase / publishListingCase / unpublishListingCase / trackListingCase.
// The real handlers run in-process against the Firestore + Storage emulators (synthetic data, no credentials,
// every non-loopback call blocked). NOT a production PASS.
"use strict";
const assert = require("assert");
const { install, snapshot, diffSnapshots } = require("../chat/stub-anthropic");
const H = require("./helpers");
const { ACTORS: A, call, errCode, errReason, newKey, putStaging, payload, PRIVATE_FIELDS } = H;

let iso, snapBefore, db, bucket;
const getDoc = async (p) => { const s = await db.doc(p).get(); return s.exists ? s.data() : null; };
const count = async (c) => (await db.collection(c).get()).size;
const privKeysIn = (obj) => PRIVATE_FIELDS.filter((k) => obj && k in obj);

// submit a synthetic case as `actor`
async function submit(actor, { type = "house", n = 2, key = newKey(), extra } = {}) {
  const photos = await putStaging(actor, key, Array.from({ length: n }, (_, i) => i));
  const r = await call("submitListingCase", actor, payload(key, type, photos, extra));
  return { r, key, photos };
}
// what Staff + the Owner's intake decision leave on the record (the callable under test is the publish step)
const approveIntake = (id) => db.doc("properties/" + id).update({ reviewStatus: "approved", approvedSubmissionId: "syn-sub-1" });

describe("LISTING-E2E-01 core: submit / publish / take down / track (emulators, synthetic)", function () {
  this.timeout(120000);
  before(async () => {
    snapBefore = snapshot(); iso = install();
    const { admin } = H.load(); db = admin.firestore(); bucket = admin.storage().bucket(H.BUCKET_NAME);
  });
  beforeEach(async () => { await H.wipe(); await H.seedRoles(); });
  after(() => { iso.restore(); assert.strictEqual(diffSnapshots(snapBefore, snapshot()).length, 0); assert.strictEqual(iso.blocked.length, 0, JSON.stringify(iso.blocked)); });

  // ── S1 submit ───────────────────────────────────────────────────────────
  it("S1 an external (anonymous) visitor's submission creates ONE Case: public document without any internal field, internal record, private photo records", async () => {
    const { r, key } = await submit(A.extA, { type: "house", n: 3 });
    assert.strictEqual(r.created, true); assert.strictEqual(r.photoCount, 3); assert.ok(r.trackToken.length >= 40);
    const pub = await getDoc("properties/" + r.propertyId), int = await getDoc("caseInternal/" + r.propertyId);
    assert.deepStrictEqual(privKeysIn(pub), [], "the publicly readable document carries NO internal field: " + privKeysIn(pub));
    assert.ok(!JSON.stringify(pub).includes(A.extA.uid) && !JSON.stringify(pub).includes(r.trackToken) && !JSON.stringify(pub).includes(H.FIX.phone) && !JSON.stringify(pub).includes(key), "no uid / token / phone / key anywhere in it");
    assert.strictEqual(pub.source, "owner_submission"); assert.strictEqual(pub.listingStatus, "pending"); assert.strictEqual(pub.reviewStatus, "submitted");
    assert.strictEqual(pub.internalSplit, true); assert.strictEqual(pub.photoCount, 3); assert.deepStrictEqual(pub.photoStandard, { min: 2, target: 6 });
    assert.strictEqual(int.trackToken, r.trackToken); assert.strictEqual(int.contactPhone, H.FIX.phone); assert.strictEqual(int.submittedByUid, A.extA.uid); assert.strictEqual(int.submittedByRole, "external");
    assert.strictEqual(int.ownerName, H.FIX.owner); assert.strictEqual(int.propertyOwnerRelation, "self");
    const ph = (await db.collection("casePhotos").where("propertyId", "==", r.propertyId).get()).docs.map((d) => d.data()).sort((a, b) => a.index - b.index);
    assert.strictEqual(ph.length, 3); ph.forEach((p, i) => { assert.strictEqual(p.index, i); assert.strictEqual(p.uploadedByUid, A.extA.uid); assert.ok(p.dataUrl.includes("casePhotos%2F" + r.propertyId + "%2F" + i + ".webp")); assert.ok(await_ok(p)); });
    for (let i = 0; i < 3; i++) assert.ok(await H.fileExists("casePhotos/" + r.propertyId + "/" + i + ".webp"));
    assert.strictEqual(await count("propertyPhotos"), 0, "nothing public is created for a pending Case");
  });
  function await_ok() { return true; }

  // ── S2 duplicates ───────────────────────────────────────────────────────
  it("S2 the same submission twice, and 8 identical submissions at the same instant, give exactly ONE Case with one set of photo records", async () => {
    const key = newKey(); const photos = await putStaging(A.extA, key, [0, 1]);
    const d = payload(key, "house", photos);
    const first = await call("submitListingCase", A.extA, d);
    const again = await call("submitListingCase", A.extA, d);
    assert.strictEqual(first.created, true); assert.strictEqual(again.created, false); assert.strictEqual(again.alreadyExisted, true);
    assert.strictEqual(again.propertyId, first.propertyId); assert.strictEqual(again.trackToken, first.trackToken);
    // concurrent, fresh key
    const key2 = newKey(); const photos2 = await putStaging(A.extB, key2, [0, 1]);
    const rs = await Promise.all(Array.from({ length: 8 }, () => call("submitListingCase", A.extB, payload(key2, "condo", photos2))));
    assert.strictEqual(new Set(rs.map((x) => x.propertyId)).size, 1, "all 8 resolve to one Case");
    assert.strictEqual(new Set(rs.map((x) => x.trackToken)).size, 1, "and one token");
    assert.strictEqual(rs.filter((x) => x.created).length, 1, "exactly one of them created it");
    assert.strictEqual(await count("properties"), 2); assert.strictEqual(await count("caseInternal"), 2); assert.strictEqual(await count("casePhotos"), 4);
  });

  it("S3 a different key is a different Case; the same key from another user is a different Case; another user's staging path is refused", async () => {
    const a = await submit(A.extA, { key: newKey("one") }); const b = await submit(A.extA, { key: newKey("two") });
    assert.notStrictEqual(a.r.propertyId, b.r.propertyId);
    const shared = newKey("shared");
    const x = await submit(A.extA, { key: shared }); const y = await submit(A.extB, { key: shared });
    assert.notStrictEqual(x.r.propertyId, y.r.propertyId);
    // B tries to attach A's staged photos
    const stolen = await putStaging(A.extA, newKey("mine"), [0, 1]);
    assert.strictEqual(await errReason(call("submitListingCase", A.extB, payload(newKey("b"), "house", stolen))), "bad_photo_path");
    assert.strictEqual(await count("properties"), 4);
  });

  // ── S4 roles ────────────────────────────────────────────────────────────
  it("S4 the role comes from the verified account, never from the request: claims of role/approval/live in the body are ignored", async () => {
    const key = newKey(); const photos = await putStaging(A.extA, key, [0, 1]);
    const evil = payload(key, "house", photos, { role: "owner", submittedByRole: "owner", listingStatus: "live", reviewStatus: "approved", approvedBy: "x@y.z", approvedByUid: A.owner.uid, approvedAt: 1, publishedAt: 1, listerId: A.agent.uid, source: "x", internalSplit: false, assignedToEmail: "staff@example.test" });
    evil.propertyOwner = { relation: "website", name: "x", contact: "y" };
    const r = await call("submitListingCase", A.extA, evil);
    const pub = await getDoc("properties/" + r.propertyId), int = await getDoc("caseInternal/" + r.propertyId);
    assert.strictEqual(int.submittedByRole, "external"); assert.strictEqual(int.propertyOwnerRelation, "self", "an outsider cannot file 'in the website's name'");
    assert.strictEqual(pub.listingStatus, "pending"); assert.strictEqual(pub.reviewStatus, "submitted"); assert.ok(!("approvedAt" in pub) && !("publishedAt" in pub) && !("listerId" in pub));
    assert.ok(!("approvedBy" in int) && !("approvedByUid" in int) && !("assignedToEmail" in int)); assert.strictEqual(pub.source, "owner_submission"); assert.strictEqual(pub.internalSplit, true);
  });

  it("S5 the four kinds of submitter get their role from their account: external, agent (listers record), staff, owner — via the same function", async () => {
    const out = {};
    for (const [k, actor] of [["external", A.extA], ["google-no-record", A.google], ["agent", A.agent], ["staff", A.staff], ["owner", A.owner]]) {
      const { r } = await submit(actor, { type: "land", n: 1, extra: k === "owner" ? { propertyOwner: { relation: "website", name: "", contact: "" } } : k === "staff" ? { propertyOwner: { relation: "representative", name: "Synthetic Seller", contact: "0822222222" } } : k === "agent" ? { propertyOwner: { relation: "representative", name: "Synthetic Client", contact: "0833333333" } } : {} });
      out[k] = { pub: await getDoc("properties/" + r.propertyId), int: await getDoc("caseInternal/" + r.propertyId) };
    }
    assert.strictEqual(out.external.int.submittedByRole, "external"); assert.strictEqual(out["google-no-record"].int.submittedByRole, "external");
    assert.strictEqual(out.agent.int.submittedByRole, "agent"); assert.strictEqual(out.agent.pub.listerId, A.agent.uid); assert.strictEqual(out.agent.int.propertyOwnerRelation, "representative");
    assert.strictEqual(out.staff.int.submittedByRole, "staff"); assert.strictEqual(out.staff.int.propertyOwnerRelation, "representative"); assert.strictEqual(out.staff.int.ownerName, "Synthetic Seller");
    assert.strictEqual(out.owner.int.submittedByRole, "owner"); assert.strictEqual(out.owner.int.propertyOwnerRelation, "website");
    assert.ok(!("listerId" in out.external.pub) && !("listerId" in out.staff.pub) && !("listerId" in out.owner.pub));
    for (const k of Object.keys(out)) { assert.strictEqual(out[k].pub.listingStatus, "pending", k + " starts pending: nobody submits straight to live"); assert.deepStrictEqual(privKeysIn(out[k].pub), [], k); }
  });

  it("S5b when the form says nothing about the relation, the default depends on the verified role (and 'website' is never given to an outsider or an agent)", async () => {
    const rel = async (actor, ex) => { const { r } = await submit(actor, { n: 2, extra: Object.assign({ propertyOwner: undefined }, ex || {}) }); return (await getDoc("caseInternal/" + r.propertyId)).propertyOwnerRelation; };
    assert.strictEqual(await rel(A.extA), "self"); assert.strictEqual(await rel(A.agent), "representative"); assert.strictEqual(await rel(A.staff), "website"); assert.strictEqual(await rel(A.owner), "website");
    assert.strictEqual(await rel(A.agent, { propertyOwner: { relation: "website" } }), "representative"); assert.strictEqual(await rel(A.extA, { propertyOwner: { relation: "website" } }), "self");
  });

  // ── S6 validation / photo standard ────────────────────────────────────────
  it("S6 photo standard v1: land needs 1, every other type 2 — enforced by the server; missing/foreign/non-image/oversize/too many photos are refused", async () => {
    assert.strictEqual((await submit(A.extA, { type: "land", n: 1 })).r.created, true);
    for (const t of ["house", "villa", "condo", "townhouse", "commercial"]) {
      const key = newKey(); const photos = await putStaging(A.extA, key, [0]);
      assert.strictEqual(await errReason(call("submitListingCase", A.extA, payload(key, t, photos))), "photos_below_minimum", t);
      const k2 = newKey(); const p2 = await putStaging(A.extA, k2, [0, 1]);
      assert.strictEqual((await call("submitListingCase", A.extA, payload(k2, t, p2))).created, true, t + " with 2");
    }
    const k = newKey(); const ok2 = await putStaging(A.extA, k, [0, 1]);
    const base = (ph, ex) => payload(k, "house", ph, ex);
    assert.strictEqual(await errReason(call("submitListingCase", A.extA, base([...ok2, { path: "caseUploads/" + A.extA.uid + "/" + k + "/9.webp" }]))), "photo_missing");
    assert.strictEqual(await errReason(call("submitListingCase", A.extA, base([{ path: "caseUploads/" + A.extA.uid + "/" + k + "/../0.webp" }, ok2[1]]))), "bad_photo_path");
    assert.strictEqual(await errReason(call("submitListingCase", A.extA, base([{ path: "propertyPhotos/x-0.webp" }, ok2[1]]))), "bad_photo_path");
    assert.strictEqual(await errReason(call("submitListingCase", A.extA, base([ok2[0], ok2[0]]))), "bad_photo_path", "the same file twice");
    const kp = newKey(); const pdf = await putStaging(A.extA, kp, [0, 1], { contentType: "application/pdf" });
    assert.strictEqual(await errReason(call("submitListingCase", A.extA, payload(kp, "house", pdf))), "photo_not_image");
    const kb = newKey(); const big = await putStaging(A.extA, kb, [0, 1], { buf: Buffer.alloc(8 * 1024 * 1024 + 1, 1) });
    assert.strictEqual(await errReason(call("submitListingCase", A.extA, payload(kb, "house", big))), "photo_bad_size");
    const many = Array.from({ length: 31 }, (_, i) => ({ path: "caseUploads/" + A.extA.uid + "/" + k + "/" + i + ".webp" }));
    assert.strictEqual(await errReason(call("submitListingCase", A.extA, base(many))), "too_many_photos");
    // field validation
    const kk = newKey(); const ph = await putStaging(A.extA, kk, [0, 1]);
    for (const [ex, reason] of [[{ price: 0 }, "bad_price"], [{ price: "x" }, "bad_price"], [{ type: "boat" }, "bad_type"], [{ txnType: "swap" }, "bad_txn_type"], [{ description: "  " }, "missing_description"], [{ area: "mars" }, "bad_area"], [{ submitter: { name: "A", phone: "0800000000" } }, "missing_submitter_name"], [{ submitter: { name: "Syn Name", phone: "12" } }, "missing_submitter_contact"], [{ submissionKey: "short" }, "bad_submission_key"]]) {
      assert.strictEqual(await errReason(call("submitListingCase", A.extA, Object.assign(payload(kk, "house", ph), ex))), reason, JSON.stringify(ex));
    }
    assert.strictEqual(await errCode(call("submitListingCase", null, payload(kk, "house", ph))), "unauthenticated");
  });

  // ── S7 one draft, one Case ──────────────────────────────────────────────
  it("S7 one draft, one Case: the draft's own id links it; a second form after a chat Case returns that Case; name/phone are never used to merge", async () => {
    await db.doc("propertyDrafts/draft__" + A.extA.uid).set({ ownerUid: A.extA.uid, status: "draft", fields: { price: { value: 7500000 } } });
    const { r } = await submit(A.extA, { n: 2 });
    const int = await getDoc("caseInternal/" + r.propertyId), draft = await getDoc("propertyDrafts/draft__" + A.extA.uid);
    assert.strictEqual(int.draftId, "draft__" + A.extA.uid); assert.strictEqual(draft.caseId, r.propertyId); assert.strictEqual(draft.status, "submitted");
    const key2 = newKey(); const p2 = await putStaging(A.extA, key2, [0, 1]);
    const second = await call("submitListingCase", A.extA, payload(key2, "condo", p2));
    assert.strictEqual(second.propertyId, r.propertyId); assert.strictEqual(second.linkedFromDraft, true); assert.strictEqual(second.created, false);
    assert.strictEqual(await count("properties"), 1);
    // same name + phone but a different visitor (no draft link) = a separate Case, not a merge
    const other = await submit(A.extB, { n: 2 });
    assert.notStrictEqual(other.r.propertyId, r.propertyId); assert.strictEqual(await count("properties"), 2);
    // a draft that belongs to someone else is never touched
    assert.strictEqual((await getDoc("propertyDrafts/draft__" + A.extB.uid)), null);
  });

  // ── S8 publish ──────────────────────────────────────────────────────────
  it("S8 only the Owner can publish; a Case needs the Owner's intake decision first; the photo standard is re-checked", async () => {
    const { r } = await submit(A.extA, { n: 2 });
    for (const who of ["extA", "extB", "agent", "staff", "google"]) assert.strictEqual(await errCode(call("publishListingCase", A[who], { propertyId: r.propertyId })), "permission-denied", who);
    assert.strictEqual(await errCode(call("publishListingCase", null, { propertyId: r.propertyId })), "unauthenticated");
    assert.strictEqual(await errReason(call("publishListingCase", A.owner, { propertyId: r.propertyId })), "intake_not_approved");
    assert.strictEqual((await getDoc("properties/" + r.propertyId)).listingStatus, "pending");
    await approveIntake(r.propertyId);
    // photo standard re-checked: drop the private photo records below the minimum
    const snap = await db.collection("casePhotos").where("propertyId", "==", r.propertyId).get();
    await snap.docs[1].ref.delete();
    assert.strictEqual(await errReason(call("publishListingCase", A.owner, { propertyId: r.propertyId })), "photos_below_minimum");
    assert.strictEqual(await errReason(call("publishListingCase", A.owner, { propertyId: "x/y" })), "bad_property_id");
    assert.strictEqual(await errReason(call("publishListingCase", A.owner, { propertyId: "own-does-not-exist" })), "case_not_found");
  });

  it("S9 publish: live document with title + photos, public photo copies, who approved recorded privately, audit trail; idempotent; private data still private", async () => {
    const { r } = await submit(A.extA, { type: "villa", n: 3 });
    await approveIntake(r.propertyId);
    const out = await call("publishListingCase", A.owner, { propertyId: r.propertyId });
    assert.strictEqual(out.published, true); assert.strictEqual(out.photoCount, 3); assert.strictEqual(out.approvalPath, "intake_approved");
    const pub = await getDoc("properties/" + r.propertyId), int = await getDoc("caseInternal/" + r.propertyId);
    assert.strictEqual(pub.listingStatus, "live"); assert.ok(pub.publishedAt && pub.expiresAt > pub.publishedAt && pub.approvedAt);
    assert.strictEqual(pub.photos.length, 3); assert.ok(pub.title.th && pub.title.en); assert.strictEqual(pub.publishedPhotoCount, 3);
    assert.deepStrictEqual(privKeysIn(pub), [], "the live document still has no internal field (approver identity included)");
    assert.strictEqual(int.approvedByUid, A.owner.uid); assert.strictEqual(int.approvedByRole, "owner"); assert.strictEqual(int.approvedByEmail, "owner@example.test"); assert.strictEqual(int.approvalPath, "intake_approved");
    const pubPhotos = (await db.collection("propertyPhotos").where("propertyId", "==", r.propertyId).get()).docs.map((d) => d.data()).sort((a, b) => a.index - b.index);
    assert.strictEqual(pubPhotos.length, 3);
    pubPhotos.forEach((p, i) => { assert.ok(p.dataUrl.includes("propertyPhotos%2F" + r.propertyId + "-" + i + ".webp")); assert.strictEqual(p.publishedByUid, A.owner.uid); });
    for (let i = 0; i < 3; i++) { assert.ok(await H.fileExists("propertyPhotos/" + r.propertyId + "-" + i + ".webp")); assert.ok(await H.fileExists("casePhotos/" + r.propertyId + "/" + i + ".webp"), "private originals stay"); }
    const log = (await db.collection("activityLog").where("propertyId", "==", r.propertyId).get()).docs.map((d) => d.data().type).sort();
    assert.deepStrictEqual(log, ["case_submitted", "listing_published"]);
    const again = await call("publishListingCase", A.owner, { propertyId: r.propertyId });
    assert.strictEqual(again.alreadyLive, true); assert.strictEqual((await db.collection("propertyPhotos").where("propertyId", "==", r.propertyId).get()).size, 3);
  });

  it("S10 the Owner's own submission can be published without an intake round (approval path recorded as owner_direct)", async () => {
    const { r } = await submit(A.owner, { type: "condo", n: 2, extra: { propertyOwner: { relation: "website", name: "", contact: "" } } });
    const out = await call("publishListingCase", A.owner, { propertyId: r.propertyId });
    assert.strictEqual(out.approvalPath, "owner_direct"); assert.strictEqual((await getDoc("caseInternal/" + r.propertyId)).submittedByRole, "owner");
    // but a Staff-filed Case never skips the decision, and an agent's Case never does
    const s = await submit(A.staff, { n: 2 }); const g = await submit(A.agent, { n: 2 });
    assert.strictEqual(await errReason(call("publishListingCase", A.owner, { propertyId: s.r.propertyId })), "intake_not_approved");
    assert.strictEqual(await errReason(call("publishListingCase", A.owner, { propertyId: g.r.propertyId })), "intake_not_approved");
  });

  it("S11 take-down: public files AND records are physically removed, the listing goes offline, private originals stay, re-publish makes new copies", async () => {
    const { r } = await submit(A.extA, { n: 2 }); await approveIntake(r.propertyId);
    await call("publishListingCase", A.owner, { propertyId: r.propertyId });
    const firstUrl = (await db.collection("propertyPhotos").doc(r.propertyId + "-0").get()).data().dataUrl;
    for (const who of ["extA", "agent", "staff"]) assert.strictEqual(await errCode(call("unpublishListingCase", A[who], { propertyId: r.propertyId })), "permission-denied", who);
    assert.ok(await H.fileExists("propertyPhotos/" + r.propertyId + "-0.webp"));
    const out = await call("unpublishListingCase", A.owner, { propertyId: r.propertyId, reason: "synthetic reason" });
    assert.strictEqual(out.unpublished, true); assert.strictEqual(out.removedPublicPhotos, 2);
    const pub = await getDoc("properties/" + r.propertyId);
    assert.strictEqual(pub.listingStatus, "offline"); assert.strictEqual(await count("propertyPhotos"), 0);
    for (let i = 0; i < 2; i++) { assert.ok(!(await H.fileExists("propertyPhotos/" + r.propertyId + "-" + i + ".webp")), "public file " + i + " is gone"); assert.ok(await H.fileExists("casePhotos/" + r.propertyId + "/" + i + ".webp")); }
    assert.strictEqual((await getDoc("caseInternal/" + r.propertyId)).offlineReason, "synthetic reason"); assert.deepStrictEqual(privKeysIn(pub), []);
    assert.strictEqual((await call("unpublishListingCase", A.owner, { propertyId: r.propertyId })).unpublished, false, "taking down twice is harmless");
    const re = await call("publishListingCase", A.owner, { propertyId: r.propertyId });
    assert.strictEqual(re.published, true);
    const newUrl = (await db.collection("propertyPhotos").doc(r.propertyId + "-0").get()).data().dataUrl;
    assert.notStrictEqual(newUrl, firstUrl, "new public copy = new token: the old link stays dead");
  });

  // ── S12 tracking ────────────────────────────────────────────────────────
  it("S12 the customer's tracking view needs the token, shows no internal data, and not-found = wrong token", async () => {
    const { r } = await submit(A.extA, { n: 2 });
    await db.doc("caseInternal/" + r.propertyId).update({ assignedToEmail: "staff@example.test", reviewReturn: { reason: "synthetic: please send the title deed", by: "staff@example.test", at: 1 }, internalNotes: "synthetic secret note" });
    const view = await call("trackListingCase", null, { id: r.propertyId, token: r.trackToken });
    assert.strictEqual(view.id, r.propertyId); assert.strictEqual(view.reviewStatus, "submitted"); assert.strictEqual(view.photoCount, 2); assert.strictEqual(view.contactName, H.FIX.name);
    assert.deepStrictEqual(view.reviewReturn, { reason: "synthetic: please send the title deed" });
    const text = JSON.stringify(view);
    for (const secret of [r.trackToken, A.extA.uid, "staff@example.test", "synthetic secret note", H.FIX.phone, "caseUploads"]) assert.ok(!text.includes(secret), "view must not contain: " + secret);
    for (const bad of [{ id: r.propertyId, token: "x".repeat(40) }, { id: "own-nope", token: r.trackToken }, { id: r.propertyId, token: "" }, { id: "a/b", token: r.trackToken }, { id: r.propertyId }, { token: r.trackToken }]) {
      assert.strictEqual(await errCode(call("trackListingCase", null, bad)), "permission-denied", JSON.stringify(bad).slice(0, 40));
    }
    await call("trackListingCase", null, { id: r.propertyId, token: r.trackToken, action: "language", lang: "en" });
    await call("trackListingCase", null, { id: r.propertyId, token: r.trackToken, action: "responded", message: "synthetic reply" });
    await call("trackListingCase", null, { id: r.propertyId, token: r.trackToken, action: "read" });
    const int = await getDoc("caseInternal/" + r.propertyId);
    assert.strictEqual(int.customerLanguage, "en"); assert.strictEqual(int.customerLanguageConfirmed, true); assert.strictEqual(int.infoResponseMessage, "synthetic reply"); assert.ok(int.customerLastReadAt);
    assert.deepStrictEqual(privKeysIn(await getDoc("properties/" + r.propertyId)), [], "bookkeeping never touches the public document");
    await call("trackListingCase", null, { id: r.propertyId, token: r.trackToken, action: "language", lang: "fr" });
    assert.strictEqual((await getDoc("caseInternal/" + r.propertyId)).customerLanguage, "en", "language is locked once confirmed");
    assert.strictEqual(await errReason(call("trackListingCase", null, { id: r.propertyId, token: r.trackToken, action: "delete" })), "bad_action");
  });
});
