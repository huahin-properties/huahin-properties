// LISTING-E2E-01 — submitListingCase / publishListingCase / unpublishListingCase / syncListingCase / addCasePhotos /
// reconcileListingFiles / trackListingCase. The real handlers run in-process against the Firestore + Storage emulators
// (synthetic data, no credentials, every non-loopback call blocked). NOT a production PASS.
"use strict";
const assert = require("assert");
const { install, snapshot, diffSnapshots } = require("../chat/stub-anthropic");
const H = require("./helpers");
const { ACTORS: A, call, errCode, errReason, newKey, putStaging, payload, PRIVATE_FIELDS } = H;
const publish = async (actor, id, extra) => { const pv = await call("previewListingCase", actor, { propertyId: id }); return call("publishListingCase", actor, Object.assign({ propertyId: id, reviewedSig: pv.publishSig }, extra || {})); };
const listing = () => require("../../functions/listing-case.js");

let iso, snapBefore, db;
const getDoc = async (p) => { const s = await db.doc(p).get(); return s.exists ? s.data() : null; };
const count = async (c) => (await db.collection(c).get()).size;
const approveIntake = (id) => db.doc("caseInternal/" + id).update({ reviewStatus: "approved", approvedSubmissionId: "syn-sub-1" });
const PUB_ALLOWED = new Set(require("../../functions/case-fields.js").PUBLIC_FIELDS.concat(["source", "internalSplit", "listingStatus", "isDraft", "publishedAt", "expiresAt", "approvedAt", "photos", "publishedPhotoCount", "listerId", "viewCount"]));

async function submit(actor, { type = "house", n = 2, key = newKey(), extra } = {}) {
  const photos = await putStaging(actor, key, Array.from({ length: n }, (_, i) => i));
  const r = await call("submitListingCase", actor, payload(key, type, photos, extra));
  return { r, key, photos };
}
const ready = async (actor, opts) => { const x = await submit(actor, opts); await approveIntake(x.r.propertyId); return x; };

describe("LISTING-E2E-01 core: submit / publish / take down / track (emulators, synthetic)", function () {
  this.timeout(120000);
  before(async () => {
    snapBefore = snapshot(); iso = install();
    const { admin } = H.load(); db = admin.firestore();
  });
  beforeEach(async () => { await H.wipe(); await H.seedRoles(); const hk = listing().hooks; Object.keys(hk).forEach((k) => delete hk[k]); });
  after(() => { iso.restore(); assert.strictEqual(diffSnapshots(snapBefore, snapshot()).length, 0); assert.strictEqual(iso.blocked.length, 0, JSON.stringify(iso.blocked)); });

  // ── S1 submit ───────────────────────────────────────────────────────────
  it("S1 a submission creates ONE team-only record + private photos; NOTHING public exists (no properties document, no public photo)", async () => {
    const { r, key } = await submit(A.extA, { type: "house", n: 3 });
    assert.strictEqual(r.created, true); assert.strictEqual(r.photoCount, 3); assert.ok(r.trackToken.length >= 40);
    assert.strictEqual(await getDoc("properties/" + r.propertyId), null, "no public document for a pending Case");
    assert.strictEqual(await count("propertyPhotos"), 0, "no public photo record");
    const rec = await getDoc("caseInternal/" + r.propertyId);
    assert.strictEqual(rec.source, "owner_submission"); assert.strictEqual(rec.listingStatus, "pending"); assert.strictEqual(rec.reviewStatus, "submitted"); assert.strictEqual(rec.internalSplit, true);
    assert.strictEqual(rec.photoCount, 3); assert.deepStrictEqual(rec.photoStandard, { min: 2, target: 6 });
    assert.strictEqual(rec.trackToken, r.trackToken); assert.strictEqual(rec.contactPhone, H.FIX.phone); assert.strictEqual(rec.submittedByUid, A.extA.uid); assert.strictEqual(rec.submittedByRole, "external"); assert.strictEqual(rec.submissionKey, key);
    assert.strictEqual(rec.ownerName, H.FIX.owner); assert.strictEqual(rec.propertyOwnerRelation, "self"); assert.strictEqual(rec.price, 7500000);
    const ph = (await db.collection("casePhotos").where("propertyId", "==", r.propertyId).get()).docs.map((d) => d.data()).sort((a, b) => a.index - b.index);
    assert.strictEqual(ph.length, 3);
    for (const [i, p] of ph.entries()) {
      assert.strictEqual(p.index, i); assert.strictEqual(p.uploadedByUid, A.extA.uid);
      assert.ok(p.storagePath.startsWith("casePhotos/" + r.propertyId + "/a-")); assert.ok(!/token=/.test(p.dataUrl), "no download token in the record");
      assert.ok(await H.fileExists(p.storagePath)); assert.ok(!((await H.fileMeta(p.storagePath)).metadata || {}).firebaseStorageDownloadTokens, "no token on the private file");
    }
    assert.deepStrictEqual(await H.listFiles("caseUploads/"), [], "the submitter's staging files are removed");
    assert.strictEqual((await H.listFiles("casePhotos/" + r.propertyId + "/")).length, 3, "exactly the 3 files, no leftovers");
  });

  // ── S2 duplicates + competing attempts ──────────────────────────────────
  it("S2 the same submission twice, and 8 identical submissions at the same instant, give exactly ONE record, one set of photo records and no orphan file", async () => {
    const key = newKey(); const photos = await putStaging(A.extA, key, [0, 1]);
    const d = payload(key, "house", photos);
    const first = await call("submitListingCase", A.extA, d);
    const again = await call("submitListingCase", A.extA, d); // staging is gone by now: a retry after a lost response must not need it
    assert.strictEqual(first.created, true); assert.strictEqual(again.created, false); assert.strictEqual(again.alreadyExisted, true);
    assert.strictEqual(again.propertyId, first.propertyId); assert.strictEqual(again.trackToken, first.trackToken);
    const key2 = newKey(); const photos2 = await putStaging(A.extB, key2, [0, 1]);
    const rs = await Promise.all(Array.from({ length: 8 }, () => call("submitListingCase", A.extB, payload(key2, "condo", photos2))));
    assert.strictEqual(new Set(rs.map((x) => x.propertyId)).size, 1); assert.strictEqual(new Set(rs.map((x) => x.trackToken)).size, 1); assert.strictEqual(rs.filter((x) => x.created).length, 1);
    assert.strictEqual(await count("caseInternal"), 2); assert.strictEqual(await count("casePhotos"), 4);
    assert.strictEqual((await H.listFiles("casePhotos/")).length, 4, "losing attempts removed their own files; the winner's are untouched");
    assert.strictEqual(await count("properties"), 0);
  });

  it("S2b competing submissions with the SAME key but DIFFERENT photos/payload: the first committed one wins whole; the other changes nothing and leaves nothing", async () => {
    const key = newKey();
    const photosX = await putStaging(A.extA, key, [0, 1], { buf: Buffer.alloc(100, 1) });
    const dX = payload(key, "house", photosX, { price: 1111111 });
    let release; const gate = new Promise((res) => { release = res; });
    let held = 0;
    listing().hooks.afterSubmitCopy = async () => { held++; if (held === 1) await gate; }; // the first attempt waits after copying; the second runs to completion first
    const p1 = call("submitListingCase", A.extA, dX);
    await new Promise((r) => setTimeout(r, 400));
    // second attempt: same key, same uid; different price. (staging slots are create-only: same photos)
    const r2 = await call("submitListingCase", A.extA, payload(key, "house", photosX, { price: 2222222 }));
    release();
    const r1 = await p1;
    assert.strictEqual(r1.propertyId, r2.propertyId);
    const rec = await getDoc("caseInternal/" + r1.propertyId);
    assert.strictEqual(rec.price, 2222222, "the attempt that committed first defines the Case");
    assert.strictEqual(rec.photoCount, 2);
    const files = await H.listFiles("casePhotos/" + r1.propertyId + "/");
    const docs = (await db.collection("casePhotos").get()).docs.map((d) => d.data().storagePath).sort();
    assert.deepStrictEqual(files, docs, "every stored file belongs to a record and every record has its file — no mixture of two attempts");
    assert.strictEqual(files.length, 2);
  });

  it("S2c fault: a failure after the copy but before the commit leaves NO record and NO file; the retry then succeeds", async () => {
    const key = newKey(); const photos = await putStaging(A.extA, key, [0, 1]);
    listing().hooks.afterSubmitCopy = async () => { throw new Error("synthetic crash after copy"); };
    assert.strictEqual(await errCode(call("submitListingCase", A.extA, payload(key, "house", photos))), "internal");
    assert.strictEqual(await count("caseInternal"), 0); assert.strictEqual(await count("casePhotos"), 0);
    assert.deepStrictEqual(await H.listFiles("casePhotos/"), [], "the failed attempt removed its own copies");
    assert.strictEqual((await H.listFiles("caseUploads/")).length, 2, "the staged originals are still there for the retry");
    delete listing().hooks.afterSubmitCopy;
    const r = await call("submitListingCase", A.extA, payload(key, "house", photos));
    assert.strictEqual(r.created, true); assert.strictEqual((await H.listFiles("casePhotos/" + r.propertyId + "/")).length, 2);
  });

  it("S3 a different key is a different Case; the same key from another user is a different Case; another user's staging path is refused", async () => {
    const a = await submit(A.extA, { key: newKey("one") }); const b = await submit(A.extA, { key: newKey("two") });
    assert.notStrictEqual(a.r.propertyId, b.r.propertyId);
    const shared = newKey("shared");
    const x = await submit(A.extA, { key: shared }); const y = await submit(A.extB, { key: shared });
    assert.notStrictEqual(x.r.propertyId, y.r.propertyId);
    const stolen = await putStaging(A.extA, newKey("mine"), [0, 1]);
    assert.strictEqual(await errReason(call("submitListingCase", A.extB, payload(newKey("b"), "house", stolen))), "bad_photo_path");
    assert.strictEqual(await count("caseInternal"), 4);
  });

  // ── S4 / S5 roles ───────────────────────────────────────────────────────
  it("S4 the role comes from the verified account, never from the request: claims of role/approval/live in the body are ignored", async () => {
    const key = newKey(); const photos = await putStaging(A.extA, key, [0, 1]);
    const evil = payload(key, "house", photos, { role: "owner", submittedByRole: "owner", listingStatus: "live", reviewStatus: "approved", approvedBy: "x@y.z", approvedByUid: A.owner.uid, approvedAt: 1, publishedAt: 1, listerId: A.agent.uid, source: "x", internalSplit: false, assignedToEmail: "staff@example.test" });
    evil.propertyOwner = { relation: "website", name: "x", contact: "y" };
    const r = await call("submitListingCase", A.extA, evil);
    const rec = await getDoc("caseInternal/" + r.propertyId);
    assert.strictEqual(rec.submittedByRole, "external"); assert.strictEqual(rec.propertyOwnerRelation, "self", "an outsider cannot file 'in the website's name'");
    assert.strictEqual(rec.listingStatus, "pending"); assert.strictEqual(rec.reviewStatus, "submitted");
    for (const k of ["approvedAt", "publishedAt", "listerId", "approvedBy", "approvedByUid", "assignedToEmail"]) assert.ok(!(k in rec), k + " was taken from the request");
    assert.strictEqual(rec.source, "owner_submission"); assert.strictEqual(rec.internalSplit, true); assert.strictEqual(await getDoc("properties/" + r.propertyId), null);
  });

  it("S5 the four kinds of submitter get their role from their account: external, agent (listers record), staff, owner — via the same function", async () => {
    const out = {};
    for (const [k, actor] of [["external", A.extA], ["google-no-record", A.google], ["agent", A.agent], ["staff", A.staff], ["owner", A.owner]]) {
      const { r } = await submit(actor, { type: "land", n: 1, extra: k === "owner" ? { propertyOwner: { relation: "website", name: "", contact: "" } } : k === "staff" ? { propertyOwner: { relation: "representative", name: "Synthetic Seller", contact: "0822222222" } } : k === "agent" ? { propertyOwner: { relation: "representative", name: "Synthetic Client", contact: "0833333333" } } : {} });
      out[k] = await getDoc("caseInternal/" + r.propertyId);
    }
    assert.strictEqual(out.external.submittedByRole, "external"); assert.strictEqual(out["google-no-record"].submittedByRole, "external");
    assert.strictEqual(out.agent.submittedByRole, "agent"); assert.strictEqual(out.agent.listerId, A.agent.uid); assert.strictEqual(out.agent.propertyOwnerRelation, "representative");
    assert.strictEqual(out.staff.submittedByRole, "staff"); assert.strictEqual(out.staff.propertyOwnerRelation, "representative"); assert.strictEqual(out.staff.ownerName, "Synthetic Seller");
    assert.strictEqual(out.owner.submittedByRole, "owner"); assert.strictEqual(out.owner.propertyOwnerRelation, "website");
    assert.ok(!("listerId" in out.external) && !("listerId" in out.staff) && !("listerId" in out.owner));
    for (const k of Object.keys(out)) assert.strictEqual(out[k].listingStatus, "pending", k + " starts pending: nobody submits straight to live");
  });

  it("S5b when the form says nothing about the relation, the default depends on the verified role (and 'website' is never given to an outsider or an agent)", async () => {
    const rel = async (actor, ex) => { const { r } = await submit(actor, { n: 2, extra: Object.assign({ propertyOwner: undefined }, ex || {}) }); return (await getDoc("caseInternal/" + r.propertyId)).propertyOwnerRelation; };
    assert.strictEqual(await rel(A.extA), "self"); assert.strictEqual(await rel(A.agent), "representative"); assert.strictEqual(await rel(A.staff), "website"); assert.strictEqual(await rel(A.owner), "website");
    assert.strictEqual(await rel(A.agent, { propertyOwner: { relation: "website" } }), "representative"); assert.strictEqual(await rel(A.extA, { propertyOwner: { relation: "website" } }), "self");
  });

  it("S6 photo standard v1: land needs 1, every other type 2 — enforced by the server; missing/foreign/non-image/oversize/too many photos are refused", async () => {
    for (const [type, min] of [["land", 1], ["house", 2], ["villa", 2], ["condo", 2], ["townhouse", 2], ["commercial", 2]]) {
      const k1 = newKey(); const few = await putStaging(A.extA, k1, Array.from({ length: min - 1 }, (_, i) => i));
      assert.strictEqual(await errReason(call("submitListingCase", A.extA, payload(k1, type, few))), "photos_below_minimum", type + " below minimum");
      const k2 = newKey(); const ok = await putStaging(A.extA, k2, Array.from({ length: min }, (_, i) => i));
      assert.strictEqual((await call("submitListingCase", A.extA, payload(k2, type, ok))).created, true, type + " at minimum");
    }
    const k = newKey(); const photos = await putStaging(A.extA, k, [0, 1]);
    assert.strictEqual(await errReason(call("submitListingCase", A.extA, payload(k, "house", [photos[0], { path: photos[1].path.replace("/1.webp", "/7.webp") }]))), "photo_missing");
    const k3 = newKey(); const nonImage = await putStaging(A.extA, k3, [0, 1], { contentType: "application/pdf" });
    assert.strictEqual(await errReason(call("submitListingCase", A.extA, payload(k3, "house", nonImage))), "photo_not_image");
    const k4 = newKey(); const big = await putStaging(A.extA, k4, [0, 1], { buf: Buffer.alloc(8 * 1024 * 1024 + 1) });
    assert.strictEqual(await errReason(call("submitListingCase", A.extA, payload(k4, "house", big))), "photo_bad_size");
    const k5 = newKey();
    assert.strictEqual(await errReason(call("submitListingCase", A.extA, payload(k5, "house", Array.from({ length: 31 }, (_, i) => ({ path: "caseUploads/" + A.extA.uid + "/" + k5 + "/" + i + ".webp" }))))), "too_many_photos");
    for (const bad of [{ price: 0 }, { price: "abc" }, { txnType: "buy" }, { type: "castle" }, { area: "paris" }, { submitter: { name: "x", phone: "1" } }, { submissionKey: "short" }, { area: "", coordsRaw: "" }, { type: "commercial", commercialSubtype: "" }, { type: "commercial", commercialSubtype: "castle" }]) {
      const kk = newKey(); const ph = await putStaging(A.extA, kk, [0, 1]);
      assert.strictEqual(await errCode(call("submitListingCase", A.extA, payload(kk, "house", ph, bad))), "invalid-argument", JSON.stringify(bad));
    }
    assert.strictEqual((await H.listFiles("casePhotos/")).length, 11, "refused submissions left no private file behind");
  });

  it("S7 one draft, one Case: the draft's own id links it; a second form after a chat Case returns that Case; name/phone are never used to merge", async () => {
    const draftId = "draft__" + A.extA.uid;
    await db.doc("propertyDrafts/" + draftId).set({ ownerUid: A.extA.uid, status: "draft", fields: {} });
    const a = await submit(A.extA, { key: newKey() });
    assert.strictEqual((await getDoc("propertyDrafts/" + draftId)).caseId, a.r.propertyId); assert.strictEqual((await getDoc("caseInternal/" + a.r.propertyId)).draftId, draftId);
    const b = await submit(A.extA, { key: newKey() });
    assert.strictEqual(b.r.propertyId, a.r.propertyId); assert.strictEqual(b.r.linkedFromDraft, true);
    const c = await submit(A.extB, { key: newKey() });
    assert.notStrictEqual(c.r.propertyId, a.r.propertyId, "same name + phone, different visitor/draft → different Case");
    assert.strictEqual(await count("caseInternal"), 2);
  });

  // ── S8 / S9 publish ─────────────────────────────────────────────────────
  it("S8 only the Owner can publish; a Case needs the Owner's intake decision first; the photo standard is re-checked", async () => {
    const { r } = await submit(A.extA, { n: 2 });
    for (const who of ["extA", "agent", "staff", "google"]) assert.strictEqual(await errCode(publish(A[who], r.propertyId)), "permission-denied", who);
    assert.strictEqual(await errCode(publish(null, r.propertyId)), "unauthenticated");
    assert.strictEqual(await errReason(publish(A.owner, r.propertyId)), "intake_not_approved");
    await approveIntake(r.propertyId);
    await db.doc("casePhotos/" + r.propertyId + "-1").delete();
    assert.strictEqual(await errReason(publish(A.owner, r.propertyId)), "photos_below_minimum");
    assert.strictEqual(await errReason(publish(A.owner, "own-nope")), "case_not_found");
    assert.strictEqual(await count("properties"), 0); assert.deepStrictEqual(await H.listFiles("publishedCasePhotos/"), []);
  });

  it("S9 publish: the public page is the ALLOW-LIST projection only (unknown/internal fields never reach it); public photos are server-written copies; who approved is recorded privately; idempotent", async () => {
    const { r } = await ready(A.agent, { type: "villa", n: 3 });
    await db.doc("caseInternal/" + r.propertyId).update({ secretNote: "SYNTHETIC-SECRET", futureField: 123, internalNotes: "synthetic internal note", bedrooms: 4, features: ["pool"], description: "Synthetic villa near the beach." });
    const out = await publish(A.owner, r.propertyId);
    assert.strictEqual(out.published, true); assert.strictEqual(out.photoCount, 3); assert.strictEqual(out.approvalPath, "intake_approved");
    const pub = await getDoc("properties/" + r.propertyId);
    assert.strictEqual(pub.listingStatus, "live"); assert.strictEqual(pub.bedrooms, 4); assert.deepStrictEqual(pub.features, ["pool"]); assert.strictEqual(pub.photos.length, 3); assert.ok(pub.title.th && pub.title.en); assert.ok(pub.expiresAt > pub.publishedAt);
    const extra = Object.keys(pub).filter((k) => !PUB_ALLOWED.has(k));
    assert.deepStrictEqual(extra, [], "fields outside the allow-list reached the public document: " + extra);
    assert.ok(!JSON.stringify(pub).includes("SYNTHETIC-SECRET") && !JSON.stringify(pub).includes(H.FIX.phone) && !JSON.stringify(pub).includes(H.FIX.name));
    assert.strictEqual(pub.listerId, A.agent.uid, "an agent's own mini-site id is the one deliberate public link");
    const pp = (await db.collection("propertyPhotos").where("propertyId", "==", r.propertyId).get()).docs.map((d) => d.data());
    assert.strictEqual(pp.length, 3);
    for (const p of pp) { assert.ok(/token=/.test(p.dataUrl)); assert.ok(p.dataUrl.includes("publishedCasePhotos%2F" + r.propertyId + "%2F")); assert.ok(!p.dataUrl.includes("casePhotos%2F")); assert.strictEqual(p.publishedByUid, A.owner.uid); assert.strictEqual((await fetch(p.dataUrl)).status, 200); }
    const rec = await getDoc("caseInternal/" + r.propertyId);
    assert.strictEqual(rec.approvedByUid, A.owner.uid); assert.strictEqual(rec.approvedByRole, "owner"); assert.strictEqual(rec.approvalPath, "intake_approved"); assert.strictEqual(rec.publishOp.status, "done");
    assert.strictEqual((await db.collection("activityLog").where("type", "==", "listing_published").get()).size, 1);
    const again = await publish(A.owner, r.propertyId);
    assert.strictEqual(again.alreadyLive, true); assert.strictEqual(await count("propertyPhotos"), 3);
    assert.strictEqual((await H.listFiles("publishedCasePhotos/" + r.propertyId + "/")).length, 3);
    assert.strictEqual((await H.listFiles("casePhotos/" + r.propertyId + "/")).length, 3, "private originals stay");
  });

  it("S9b public text with contact details is refused (nothing copied, nothing public); after the Owner edits it, publishing works", async () => {
    const { r } = await ready(A.extA, { n: 2 });
    for (const bad of ["โทร 081-234-5678 ได้เลย", "ติดต่อ line: synthetic123", "mail synthetic@example.test", "www.example-listing.com", "call 0812345678"]) {
      await db.doc("caseInternal/" + r.propertyId).update({ description: bad });
      assert.strictEqual(await errReason(publish(A.owner, r.propertyId)), "public_text_has_contact_info", bad);
    }
    assert.strictEqual(await count("properties"), 0); assert.deepStrictEqual(await H.listFiles("publishedCasePhotos/"), []); assert.strictEqual(await count("propertyPhotos"), 0);
    await db.doc("caseInternal/" + r.propertyId).update({ description: "Quiet 3-bedroom house, 150 sqm, price 12,000,000 THB." });
    assert.strictEqual((await publish(A.owner, r.propertyId)).published, true);
  });

  it("S9c stale approval: if the approval is withdrawn while photos are being copied, publishing fails at commit; no public document, no public file, the lease is released", async () => {
    const { r } = await ready(A.extA, { n: 2 });
    listing().hooks.afterPublishCopy = async () => { await db.doc("caseInternal/" + r.propertyId).update({ reviewStatus: "returned" }); };
    assert.strictEqual(await errReason(publish(A.owner, r.propertyId)), "intake_not_approved");
    assert.strictEqual(await getDoc("properties/" + r.propertyId), null); assert.strictEqual(await count("propertyPhotos"), 0); assert.deepStrictEqual(await H.listFiles("publishedCasePhotos/"), []);
    assert.strictEqual((await getDoc("caseInternal/" + r.propertyId)).publishOp.status, "failed");
    delete listing().hooks.afterPublishCopy;
    await approveIntake(r.propertyId);
    assert.strictEqual((await publish(A.owner, r.propertyId)).published, true, "publishable again once re-approved");
  });

  it("S9d publish vs take-down: a take-down that arrives while the publish is copying cancels it — the listing does not appear and the copies are removed", async () => {
    const { r } = await ready(A.extA, { n: 2 });
    listing().hooks.afterPublishCopy = async () => { delete listing().hooks.afterPublishCopy; const o = await call("unpublishListingCase", A.owner, { propertyId: r.propertyId }); assert.strictEqual(o.cancelledPublish, true); };
    assert.strictEqual(await errReason(publish(A.owner, r.propertyId)), "publish_cancelled");
    assert.strictEqual(await getDoc("properties/" + r.propertyId), null); assert.strictEqual(await count("propertyPhotos"), 0); assert.deepStrictEqual(await H.listFiles("publishedCasePhotos/"), []);
    assert.notStrictEqual((await getDoc("caseInternal/" + r.propertyId)).listingStatus, "live");
  });

  it("S9e photos changed while publishing (a Staff photo added in between): the commit refuses (the copy would be stale)", async () => {
    const { r } = await ready(A.extA, { n: 2 });
    listing().hooks.afterPublishCopy = async () => { delete listing().hooks.afterPublishCopy; const key = newKey(); const p = await putStaging(A.staff, key, [0]); await call("addCasePhotos", A.staff, { propertyId: r.propertyId, paths: p.map((x) => x.path) }); };
    assert.strictEqual(await errReason(publish(A.owner, r.propertyId)), "photos_changed");
    assert.strictEqual(await getDoc("properties/" + r.propertyId), null); assert.deepStrictEqual(await H.listFiles("publishedCasePhotos/"), []);
    const ok = await publish(A.owner, r.propertyId);
    assert.strictEqual(ok.photoCount, 3);
  });

  it("S9f two Owner clicks at once: one publishes, the other is told it is in progress or already live; the end state is consistent (one set of public photos)", async () => {
    const { r } = await ready(A.extA, { n: 3 });
    const rs = await Promise.all([publish(A.owner, r.propertyId).catch((e) => ({ err: e.details && e.details.reason })), publish(A.owner, r.propertyId).catch((e) => ({ err: e.details && e.details.reason }))]);
    assert.strictEqual(rs.filter((x) => x.published === true).length, 1, JSON.stringify(rs));
    assert.ok(rs.every((x) => x.published === true || x.alreadyLive === true || ["publish_in_progress", "publish_cancelled"].includes(x.err)), JSON.stringify(rs));
    assert.strictEqual(await count("propertyPhotos"), 3);
    const op = (await getDoc("caseInternal/" + r.propertyId)).publishOp;
    assert.strictEqual(op.status, "done");
    const files = await H.listFiles("publishedCasePhotos/" + r.propertyId + "/");
    assert.strictEqual(files.length, 3); assert.ok(files.every((f) => f.includes("/" + op.opId + "/")), "only the winning operation's files remain");
  });

  it("S10 the Owner's own submission can be published without an intake round (approval path recorded as owner_direct); a Staff or agent Case never skips the decision", async () => {
    const { r } = await submit(A.owner, { type: "condo", n: 2, extra: { propertyOwner: { relation: "website", name: "", contact: "" } } });
    const out = await publish(A.owner, r.propertyId);
    assert.strictEqual(out.approvalPath, "owner_direct"); assert.strictEqual((await getDoc("caseInternal/" + r.propertyId)).submittedByRole, "owner");
    const s = await submit(A.staff, { n: 2 }); const g = await submit(A.agent, { n: 2 });
    assert.strictEqual(await errReason(publish(A.owner, s.r.propertyId)), "intake_not_approved");
    assert.strictEqual(await errReason(publish(A.owner, g.r.propertyId)), "intake_not_approved");
  });

  it("S11 take-down: the public document, public photo records AND files are removed, the record goes offline, private originals stay; the old public link dies; re-publish makes new copies", async () => {
    const { r } = await ready(A.extA, { n: 2 });
    await publish(A.owner, r.propertyId);
    const firstUrl = (await db.collection("propertyPhotos").doc(r.propertyId + "-0").get()).data().dataUrl;
    assert.strictEqual((await fetch(firstUrl)).status, 200);
    for (const who of ["extA", "agent", "staff"]) assert.strictEqual(await errCode(call("unpublishListingCase", A[who], { propertyId: r.propertyId })), "permission-denied", who);
    const out = await call("unpublishListingCase", A.owner, { propertyId: r.propertyId, reason: "synthetic reason" });
    assert.strictEqual(out.unpublished, true); assert.strictEqual(out.removedPublicPhotos, 2);
    assert.strictEqual(await getDoc("properties/" + r.propertyId), null, "offline = no public document"); assert.strictEqual(await count("propertyPhotos"), 0);
    assert.deepStrictEqual(await H.listFiles("publishedCasePhotos/"), []);
    assert.notStrictEqual((await fetch(firstUrl)).status, 200, "the old public photo link is dead");
    assert.strictEqual((await H.listFiles("casePhotos/" + r.propertyId + "/")).length, 2, "private originals stay");
    const rec = await getDoc("caseInternal/" + r.propertyId);
    assert.strictEqual(rec.listingStatus, "offline"); assert.strictEqual(rec.offlineReason, "synthetic reason");
    assert.strictEqual((await call("unpublishListingCase", A.owner, { propertyId: r.propertyId })).unpublished, false, "taking down twice is harmless");
    const re = await publish(A.owner, r.propertyId);
    assert.strictEqual(re.published, true);
    const newUrl = (await db.collection("propertyPhotos").doc(r.propertyId + "-0").get()).data().dataUrl;
    assert.notStrictEqual(newUrl, firstUrl); assert.strictEqual((await fetch(newUrl)).status, 200); assert.notStrictEqual((await fetch(firstUrl)).status, 200);
  });

  it("S11b a legacy member-uploaded photo of an unrelated listing is not touched by a take-down", async () => {
    const { r } = await ready(A.extA, { n: 2 });
    await publish(A.owner, r.propertyId);
    await db.doc("propertyPhotos/LEGACY-1-0").set({ propertyId: "LEGACY-1", index: 0, dataUrl: "http://synthetic/legacy" });
    await call("unpublishListingCase", A.owner, { propertyId: r.propertyId });
    assert.ok((await db.doc("propertyPhotos/LEGACY-1-0").get()).exists);
  });

  // ── S12 tracking + conversation ─────────────────────────────────────────
  it("S12 the customer's tracking view needs the token, shows no internal data, and not-found = wrong token = no token", async () => {
    const { r } = await submit(A.extA, { n: 2 });
    await db.doc("caseInternal/" + r.propertyId).update({ assignedToEmail: "staff@example.test", reviewReturn: { reason: "synthetic: please send the title deed", by: "staff@example.test", at: 1 }, internalNotes: "synthetic secret note" });
    const view = await call("trackListingCase", null, { id: r.propertyId, token: r.trackToken });
    assert.strictEqual(view.id, r.propertyId); assert.strictEqual(view.reviewStatus, "submitted"); assert.strictEqual(view.photoCount, 2); assert.strictEqual(view.contactName, H.FIX.name); assert.strictEqual(view.legacy, false);
    assert.deepStrictEqual(view.reviewReturn, { reason: "synthetic: please send the title deed" });
    const text = JSON.stringify(view);
    for (const secret of [r.trackToken, A.extA.uid, "staff@example.test", "synthetic secret note", H.FIX.phone, "caseUploads", "casePhotos"]) assert.ok(!text.includes(secret), "view must not contain: " + secret);
    for (const bad of [{ id: r.propertyId, token: "x".repeat(40) }, { id: "own-nope", token: r.trackToken }, { id: r.propertyId, token: "" }, { id: "a/b", token: r.trackToken }, { id: r.propertyId }, { token: r.trackToken }]) {
      for (const action of ["view", "messages", "send", "read", "language"]) assert.strictEqual(await errCode(call("trackListingCase", null, Object.assign({ action, message: "hello", lang: "en" }, bad))), "permission-denied", action + " " + JSON.stringify(bad).slice(0, 40));
    }
    assert.strictEqual(await errCode(call("trackListingCase", null, { id: r.propertyId, token: r.trackToken, action: "delete-everything" })), "invalid-argument");
  });

  it("S12b the customer's conversation goes through the server: customer-visible messages only, no caseToken / Thai note / staff identity in the response; a message sent lands on the Case; unrelated uid or wrong token can neither read nor send", async () => {
    const { r } = await submit(A.extA, { n: 2 });
    const col = db.collection("properties/" + r.propertyId + "/caseMessages");
    await col.add({ senderType: "staff", direction: "outbound", visibility: "customer", customerText: "Please send the title deed", thaiText: "THAI-NOTE", senderEmail: "staff@example.test", caseToken: r.trackToken, createdAt: 10 });
    await col.add({ senderType: "staff", direction: "internal", visibility: "internal", text: "INTERNAL-ONLY-NOTE", createdAt: 11 });
    const read = await call("trackListingCase", null, { id: r.propertyId, token: r.trackToken, action: "messages" });
    assert.strictEqual(read.messages.length, 1); assert.strictEqual(read.messages[0].customerText, "Please send the title deed");
    const txt = JSON.stringify(read);
    for (const secret of ["THAI-NOTE", "staff@example.test", "INTERNAL-ONLY-NOTE", r.trackToken, "caseToken", "thaiText"]) assert.ok(!txt.includes(secret), secret);
    // another signed-in uid with the case id but no token
    assert.strictEqual(await errCode(call("trackListingCase", A.extB, { id: r.propertyId, action: "messages" })), "permission-denied");
    assert.strictEqual(await errCode(call("trackListingCase", A.extB, { id: r.propertyId, token: "z".repeat(48), action: "messages" })), "permission-denied");
    const sent = await call("trackListingCase", null, { id: r.propertyId, token: r.trackToken, action: "send", message: "Here is the deed", thaiText: "นี่คือโฉนด", lang: "en" });
    assert.strictEqual(sent.sent, true);
    const msgs = (await col.get()).docs.map((d) => d.data()).filter((m) => m.senderType === "customer");
    assert.strictEqual(msgs.length, 1); assert.strictEqual(msgs[0].visibility, "customer"); assert.strictEqual(msgs[0].originalText, "Here is the deed"); assert.strictEqual(msgs[0].thaiText, "นี่คือโฉนด"); assert.ok(!("caseToken" in msgs[0]));
    const rec = await getDoc("caseInternal/" + r.propertyId); assert.strictEqual(rec.infoResponseStatus, "responded"); assert.ok(rec.lastCustomerMessageAt);
    assert.strictEqual(await errCode(call("trackListingCase", null, { id: r.propertyId, token: r.trackToken, action: "send", message: "   " })), "invalid-argument");
    assert.strictEqual(await getDoc("properties/" + r.propertyId), null, "still no public document");
  });

  it("S12c an older Case (token on its properties document) works through the same function — and an unrelated token is refused", async () => {
    await db.doc("properties/own-legacy-1").set({ source: "owner_submission", listingStatus: "pending", reviewStatus: "submitted", trackToken: "L".repeat(48), contactName: "Legacy Person", type: "house", status: "sale", price: 1, submittedAt: 5 });
    await db.collection("properties/own-legacy-1/caseMessages").add({ senderType: "staff", direction: "outbound", visibility: "customer", customerText: "legacy hello", createdAt: 2 });
    const v = await call("trackListingCase", null, { id: "own-legacy-1", token: "L".repeat(48) });
    assert.strictEqual(v.legacy, true); assert.strictEqual(v.contactName, "Legacy Person");
    assert.strictEqual((await call("trackListingCase", null, { id: "own-legacy-1", token: "L".repeat(48), action: "messages" })).messages.length, 1);
    assert.strictEqual((await call("trackListingCase", null, { id: "own-legacy-1", token: "L".repeat(48), action: "send", message: "hi" })).sent, true);
    assert.strictEqual(await errCode(call("trackListingCase", null, { id: "own-legacy-1", token: "M".repeat(48) })), "permission-denied");
    assert.strictEqual(await errCode(call("trackListingCase", null, { id: "own-legacy-1", token: "L".repeat(48) + "x" })), "permission-denied");
    await db.doc("properties/live-1").set({ source: "x", listingStatus: "live", trackToken: "Q".repeat(48) });
    assert.strictEqual(await errCode(call("trackListingCase", null, { id: "live-1", token: "Q".repeat(48) })), "permission-denied", "only owner_submission documents are trackable");
  });

  it("S13 outside a test project the listing functions refuse every call (so an accidental production deploy changes nothing); LISTING_E2E_ENABLED=1 is the deliberate switch", async () => {
    const saved = { g: process.env.GCLOUD_PROJECT, c: process.env.GOOGLE_CLOUD_PROJECT, f: process.env.FIREBASE_CONFIG, e: process.env.LISTING_E2E_ENABLED };
    try {
      process.env.GCLOUD_PROJECT = "huahin-properties-prod-like"; delete process.env.GOOGLE_CLOUD_PROJECT; process.env.FIREBASE_CONFIG = "{}"; delete process.env.LISTING_E2E_ENABLED;
      const key = newKey(); const photos = await putStaging(A.extA, key, [0, 1]);
      assert.strictEqual(await errReason(call("submitListingCase", A.extA, payload(key, "house", photos))), "not_enabled");
      for (const fn of ["previewListingCase", "publishListingCase", "unpublishListingCase", "syncListingCase", "reconcileListingFiles", "listMyCases"]) assert.strictEqual(await errReason(call(fn, A.owner, { propertyId: "x" })), "not_enabled", fn);
      assert.strictEqual(await errReason(call("addCasePhotos", A.staff, { propertyId: "x", paths: ["a"] })), "not_enabled");
      assert.strictEqual(await errReason(call("trackListingCase", null, { id: "x", token: "t".repeat(30) })), "not_enabled");
      assert.strictEqual(await count("caseInternal"), 0);
      process.env.LISTING_E2E_ENABLED = "1";
      assert.strictEqual((await call("submitListingCase", A.extA, payload(key, "house", photos))).created, true, "the deliberate switch enables it");
    } finally { for (const [k, v] of [["GCLOUD_PROJECT", saved.g], ["GOOGLE_CLOUD_PROJECT", saved.c], ["FIREBASE_CONFIG", saved.f], ["LISTING_E2E_ENABLED", saved.e]]) { if (v === undefined) delete process.env[k]; else process.env[k] = v; } }
  });

  // ── S14 sync, S15 staff photos, S16 reconcile ───────────────────────────
  it("S14 edits to a published Case: Staff can only REQUEST an update (the public page does not change); the Owner applies exactly what they previewed; stale preview / contact details refused; never publishes anything new", async () => {
    const { r } = await ready(A.extA, { n: 2 });
    assert.deepStrictEqual(await call("syncListingCase", A.staff, { propertyId: r.propertyId }), { synced: false, propertyId: r.propertyId, reason: "not_live" });
    await publish(A.owner, r.propertyId);
    const before = await getDoc("properties/" + r.propertyId);
    await db.doc("caseInternal/" + r.propertyId).update({ price: 9999999, bedrooms: 5, internalNotes: "synthetic internal", secretNote: "SYN" });
    const req = await call("syncListingCase", A.staff, { propertyId: r.propertyId });
    assert.deepStrictEqual([req.synced, req.reason, req.pendingOwnerApproval], [false, "owner_approval_required", true]);
    assert.deepStrictEqual(await getDoc("properties/" + r.propertyId), before, "the public page is unchanged by a Staff edit");
    assert.strictEqual((await getDoc("caseInternal/" + r.propertyId)).publicUpdatePending, true);
    for (const who of ["extA", "agent", "google"]) assert.strictEqual(await errCode(call("syncListingCase", A[who], { propertyId: r.propertyId })), "permission-denied", who);
    const pv = await call("previewListingCase", A.owner, { propertyId: r.propertyId });
    assert.strictEqual(pv.publicDocument.price, 9999999); assert.strictEqual(pv.currentPublicDocument.price, 7500000); assert.strictEqual(pv.publicUpdatePending, true);
    assert.ok(!("internalNotes" in pv.publicDocument) && !("secretNote" in pv.publicDocument));
    assert.strictEqual(await errReason(call("syncListingCase", A.owner, { propertyId: r.propertyId })), "preview_required");
    await db.doc("caseInternal/" + r.propertyId).update({ price: 8888888 }); // edited again after the Owner looked
    assert.strictEqual(await errReason(call("syncListingCase", A.owner, { propertyId: r.propertyId, reviewedSig: pv.updateSig })), "reviewed_content_changed");
    const pv2 = await call("previewListingCase", A.owner, { propertyId: r.propertyId });
    assert.strictEqual((await call("syncListingCase", A.owner, { propertyId: r.propertyId, reviewedSig: pv2.updateSig })).synced, true);
    let pub = await getDoc("properties/" + r.propertyId);
    assert.strictEqual(pub.price, 8888888); assert.strictEqual(pub.bedrooms, 5); assert.ok(!("internalNotes" in pub) && !("secretNote" in pub)); assert.strictEqual(pub.photos.length, 2); assert.strictEqual(pub.listingStatus, "live");
    assert.strictEqual((await getDoc("caseInternal/" + r.propertyId)).publicUpdatePending, false);
    const keep = pub.description;
    await db.doc("caseInternal/" + r.propertyId).update({ description: "call me 0812345678" });
    const bad = await call("syncListingCase", A.owner, { propertyId: r.propertyId, reviewedSig: (await call("previewListingCase", A.owner, { propertyId: r.propertyId })).updateSig });
    assert.deepStrictEqual([bad.synced, bad.reason], [false, "public_text_has_contact_info"]);
    assert.strictEqual((await getDoc("properties/" + r.propertyId)).description, keep, "the public page keeps its previous text");
    await db.doc("caseInternal/" + r.propertyId).update({ description: keep || "", listingStatus: "offline" });
    assert.strictEqual((await call("syncListingCase", A.owner, { propertyId: r.propertyId })).reason, "not_live");
  });

  it("S15 Staff add photos to a private Case through the server (own staging → private copy, no token); others cannot; bad paths and overflow are refused; a later publish includes them", async () => {
    const { r } = await ready(A.extA, { n: 2 });
    const k = newKey(); const p = await putStaging(A.staff, k, [0, 1]);
    for (const who of ["extA", "agent", "google"]) assert.strictEqual(await errCode(call("addCasePhotos", A[who], { propertyId: r.propertyId, paths: p.map((x) => x.path) })), "permission-denied", who);
    assert.strictEqual(await errReason(call("addCasePhotos", A.staff, { propertyId: r.propertyId, paths: ["caseUploads/" + A.extA.uid + "/" + newKey() + "/0.webp"] })), "bad_photo_path");
    assert.strictEqual(await errReason(call("addCasePhotos", A.staff, { propertyId: r.propertyId, paths: [] })), "bad_paths");
    assert.strictEqual(await errReason(call("addCasePhotos", A.staff, { propertyId: "own-nope", paths: p.map((x) => x.path) })), "case_not_found");
    const out = await call("addCasePhotos", A.staff, { propertyId: r.propertyId, paths: p.map((x) => x.path) });
    assert.strictEqual(out.added, 2);
    const rec = await getDoc("caseInternal/" + r.propertyId); assert.strictEqual(rec.photoCount, 4);
    const docs = (await db.collection("casePhotos").where("propertyId", "==", r.propertyId).get()).docs.map((d) => d.data()).sort((a, b) => a.index - b.index);
    assert.deepStrictEqual(docs.map((d) => d.index), [0, 1, 2, 3]);
    for (const d of docs) assert.ok(await H.fileExists(d.storagePath));
    assert.strictEqual((await H.listFiles("casePhotos/" + r.propertyId + "/")).length, 4);
    assert.strictEqual((await publish(A.owner, r.propertyId)).photoCount, 4);
  });

  it("S16 reconcile (Owner): files that no record references (leftovers of lost attempts / old publishes) are removed after the grace period; referenced, young and active ones are not", async () => {
    process.env.LISTING_RECONCILE_GRACE_MS = "0";
    const { r } = await ready(A.extA, { n: 2 });
    await publish(A.owner, r.propertyId);
    const b = H.load().admin.storage().bucket(H.BUCKET_NAME);
    await b.file("casePhotos/" + r.propertyId + "/a-orphan/0.webp").save(Buffer.alloc(8), { resumable: false });
    await b.file("publishedCasePhotos/" + r.propertyId + "/p-old/0.webp").save(Buffer.alloc(8), { resumable: false });
    for (const who of ["staff", "agent", "extA"]) assert.strictEqual(await errCode(call("reconcileListingFiles", A[who], { propertyId: r.propertyId })), "permission-denied", who);
    const out = await call("reconcileListingFiles", A.owner, { propertyId: r.propertyId });
    assert.strictEqual(out.removed, 2);
    assert.strictEqual((await H.listFiles("casePhotos/" + r.propertyId + "/")).length, 2); assert.strictEqual((await H.listFiles("publishedCasePhotos/" + r.propertyId + "/")).length, 2);
    assert.strictEqual((await call("reconcileListingFiles", A.owner, { propertyId: r.propertyId })).removed, 0);
    delete process.env.LISTING_RECONCILE_GRACE_MS;
  });

  // ── round-3 additions: one checklist, lifecycle cleanup races, stale type/content at commit, delete failures, ownership documents ──
  it("S17 one submission checklist: a request for appraisal is accepted (price optional) but can not be PUBLISHED without a price; the main location (area or pin) is required; commercial needs its subtype; the description is optional", async () => {
    const mk = async (extra, n = 2) => { const key = newKey(); const photos = await putStaging(A.extA, key, Array.from({ length: n }, (_, i) => i)); return call("submitListingCase", A.extA, payload(key, "house", photos, extra)); };
    const refuse = async (extra) => { const key = newKey(); const photos = await putStaging(A.extA, key, [0, 1]); return errReason(call("submitListingCase", A.extA, payload(key, "house", photos, extra))); };
    assert.strictEqual(await refuse({ area: "", coordsRaw: "" }), "missing_location");
    assert.strictEqual(await refuse({ price: 0 }), "bad_price");
    assert.strictEqual(await refuse({ type: "commercial", commercialSubtype: "" }), "missing_commercial_subtype");
    const pinOnly = await mk({ area: "", coordsRaw: "12.558940,99.909039", description: "" });
    assert.strictEqual((await getDoc("caseInternal/" + pinOnly.propertyId)).description, "");
    const r = await mk({ priceMode: "appraisal", price: undefined });
    const rec = await getDoc("caseInternal/" + r.propertyId);
    assert.strictEqual(rec.priceMode, "appraisal"); assert.strictEqual(rec.price, null);
    await approveIntake(r.propertyId);
    assert.strictEqual(await errReason(publish(A.owner, r.propertyId)), "price_required_to_publish");
    assert.strictEqual(await getDoc("properties/" + r.propertyId), null);
    await db.doc("caseInternal/" + r.propertyId).update({ price: 6500000, priceMode: "fixed" });
    assert.strictEqual((await publish(A.owner, r.propertyId)).published, true);
    assert.strictEqual((await getDoc("properties/" + r.propertyId)).price, 6500000);
  });

  it("S18 take-down → republish → the OLD take-down clean-up runs: it deletes only the old operation's files and never the new live photos", async () => {
    const { r } = await ready(A.extA, { n: 2 });
    await publish(A.owner, r.propertyId);
    const oldOp = (await getDoc("caseInternal/" + r.propertyId)).publishOp.opId;
    let newUrls = [];
    listing().hooks.afterUnpublishCommit = async () => { delete listing().hooks.afterUnpublishCommit; await publish(A.owner, r.propertyId); newUrls = (await db.collection("propertyPhotos").where("propertyId", "==", r.propertyId).get()).docs.map((d) => d.data().dataUrl); };
    const out = await call("unpublishListingCase", A.owner, { propertyId: r.propertyId });
    assert.strictEqual(out.unpublished, true); assert.strictEqual(out.publicFilesRemoved, true);
    const newOp = (await getDoc("caseInternal/" + r.propertyId)).publishOp.opId;
    assert.notStrictEqual(newOp, oldOp); assert.strictEqual((await getDoc("caseInternal/" + r.propertyId)).listingStatus, "live", "the republish is live");
    assert.strictEqual(newUrls.length, 2);
    for (const u of newUrls) assert.strictEqual((await fetch(u)).status, 200, "the NEW public photo still downloads");
    const files = await H.listFiles("publishedCasePhotos/" + r.propertyId + "/");
    assert.strictEqual(files.length, 2); assert.ok(files.every((f) => f.includes("/" + newOp + "/")), "only the new operation's files remain");
    assert.strictEqual((await db.collection("propertyPhotos").where("propertyId", "==", r.propertyId).get()).size, 2);
  });

  it("S19 an old publish that finishes late (its lease expired and a newer publish went live) cleans only its OWN files and cannot take the listing live", async () => {
    process.env.LISTING_LEASE_MS = "30";
    try {
      const { r } = await ready(A.extA, { n: 2 });
      let release; const gate = new Promise((res) => { release = res; });
      let n = 0;
      listing().hooks.afterPublishCopy = async () => { n++; if (n === 1) await gate; };
      const old = publish(A.owner, r.propertyId).catch((e) => ({ err: e.details && e.details.reason }));
      await new Promise((res) => setTimeout(res, 500));
      const fresh = await publish(A.owner, r.propertyId); // the first lease has expired
      assert.strictEqual(fresh.published, true);
      const liveOp = (await getDoc("caseInternal/" + r.propertyId)).publishOp.opId;
      release();
      const res = await old;
      assert.strictEqual(res.err, "publish_cancelled");
      const files = await H.listFiles("publishedCasePhotos/" + r.propertyId + "/");
      assert.strictEqual(files.length, 2); assert.ok(files.every((f) => f.includes("/" + liveOp + "/")), "the newer operation's files were not touched");
      const urls = (await db.collection("propertyPhotos").where("propertyId", "==", r.propertyId).get()).docs.map((d) => d.data().dataUrl);
      for (const u of urls) assert.strictEqual((await fetch(u)).status, 200);
      assert.strictEqual((await getDoc("caseInternal/" + r.propertyId)).publishOp.status, "done");
    } finally { delete process.env.LISTING_LEASE_MS; }
  });

  it("S20 reconcile while a publish is copying: the active operation's files, young files and referenced files are NOT deleted; real orphans are", async () => {
    process.env.LISTING_RECONCILE_GRACE_MS = "0";
    try {
      const { r } = await ready(A.extA, { n: 2 });
      const b = H.load().admin.storage().bucket(H.BUCKET_NAME);
      await b.file("publishedCasePhotos/" + r.propertyId + "/p-dead/0.webp").save(Buffer.alloc(8), { resumable: false });
      let during;
      listing().hooks.afterPublishCopy = async () => { delete listing().hooks.afterPublishCopy; during = await call("reconcileListingFiles", A.owner, { propertyId: r.propertyId }); };
      assert.strictEqual((await publish(A.owner, r.propertyId)).published, true);
      assert.strictEqual(during.removed, 1, "only the dead operation's file was removed during the copy");
      assert.strictEqual((await H.listFiles("publishedCasePhotos/" + r.propertyId + "/")).length, 2, "the copying operation's files survived");
      for (const d of (await db.collection("propertyPhotos").where("propertyId", "==", r.propertyId).get()).docs) assert.strictEqual((await fetch(d.data().dataUrl)).status, 200);
    } finally { delete process.env.LISTING_RECONCILE_GRACE_MS; }
    // with the default grace period nothing young is deleted
    const b2 = H.load().admin.storage().bucket(H.BUCKET_NAME);
    const x = await ready(A.extB, { n: 2 });
    await b2.file("casePhotos/" + x.r.propertyId + "/a-fresh/0.webp").save(Buffer.alloc(8), { resumable: false });
    const out = await call("reconcileListingFiles", A.owner, { propertyId: x.r.propertyId });
    assert.strictEqual(out.removed, 0); assert.strictEqual(out.skippedYoung, 1);
  });

  it("S21 the type, photo minimum and content are recomputed from the record AT COMMIT: land(1 photo) turned into a house during the copy is refused; a content edit after the Owner's preview is refused; no preview → refused", async () => {
    const land = await ready(A.extA, { type: "land", n: 1 });
    listing().hooks.afterPublishCopy = async () => { delete listing().hooks.afterPublishCopy; await db.doc("caseInternal/" + land.r.propertyId).update({ type: "house" }); };
    assert.strictEqual(await errReason(publish(A.owner, land.r.propertyId)), "photos_below_minimum");
    assert.strictEqual(await getDoc("properties/" + land.r.propertyId), null); assert.deepStrictEqual(await H.listFiles("publishedCasePhotos/"), []);
    const v = await ready(A.extB, { type: "villa", n: 2 });
    listing().hooks.afterPublishCopy = async () => { delete listing().hooks.afterPublishCopy; await db.doc("caseInternal/" + v.r.propertyId).update({ bedrooms: 9 }); };
    assert.strictEqual(await errReason(publish(A.owner, v.r.propertyId)), "reviewed_content_changed");
    assert.strictEqual(await getDoc("properties/" + v.r.propertyId), null); assert.deepStrictEqual(await H.listFiles("publishedCasePhotos/"), []);
    const pv = await call("previewListingCase", A.owner, { propertyId: v.r.propertyId });
    assert.strictEqual(pv.publicDocument.bedrooms, 9); assert.strictEqual(pv.wouldRefuse, null); assert.strictEqual(pv.photoCount, 2); assert.strictEqual(pv.publicDocument.title.en.startsWith("Pool Villa"), true);
    assert.strictEqual(await errReason(call("publishListingCase", A.owner, { propertyId: v.r.propertyId })), "preview_required");
    assert.strictEqual(await errReason(call("publishListingCase", A.owner, { propertyId: v.r.propertyId, reviewedSig: "0".repeat(64) })), "reviewed_content_changed");
    for (const who of ["extA", "agent", "staff"]) assert.strictEqual(await errCode(call("previewListingCase", A[who], { propertyId: v.r.propertyId })), "permission-denied", who);
    const ok = await call("publishListingCase", A.owner, { propertyId: v.r.propertyId, reviewedSig: pv.publishSig });
    assert.strictEqual(ok.published, true);
    const pub = await getDoc("properties/" + v.r.propertyId); assert.strictEqual(pub.bedrooms, 9); assert.strictEqual(pub.title.en.startsWith("Pool Villa"), true);
  });

  it("S22 a failed file deletion is REPORTED, not hidden: take-down says the files were not removed, remembers them, and reconcile removes them later", async () => {
    const { r } = await ready(A.extA, { n: 2 });
    await publish(A.owner, r.propertyId);
    const url = (await db.doc("propertyPhotos/" + r.propertyId + "-0").get()).data().dataUrl;
    listing().hooks.beforeDelete = async ({ path }) => { if (path.startsWith("publishedCasePhotos/")) throw Object.assign(new Error("synthetic storage outage"), { code: 503 }); };
    const out = await call("unpublishListingCase", A.owner, { propertyId: r.propertyId });
    assert.strictEqual(out.unpublished, true); assert.strictEqual(out.publicFilesRemoved, false); assert.strictEqual(out.cleanupFailed.length, 2);
    assert.strictEqual(await getDoc("properties/" + r.propertyId), null, "the listing is down even though the files could not be deleted");
    assert.strictEqual((await db.collection("propertyPhotos").where("propertyId", "==", r.propertyId).get()).size, 0);
    assert.strictEqual((await fetch(url)).status, 200, "…and the old link still works — which is exactly why the result must not claim otherwise");
    assert.strictEqual((await getDoc("caseInternal/" + r.propertyId)).cleanupPending.length, 2);
    delete listing().hooks.beforeDelete;
    process.env.LISTING_RECONCILE_GRACE_MS = "0";
    try { const rc = await call("reconcileListingFiles", A.owner, { propertyId: r.propertyId }); assert.strictEqual(rc.removed, 2); } finally { delete process.env.LISTING_RECONCILE_GRACE_MS; }
    assert.notStrictEqual((await fetch(url)).status, 200); assert.deepStrictEqual((await getDoc("caseInternal/" + r.propertyId)).cleanupPending, []);
    // a not-found file is not a failure
    assert.strictEqual((await call("unpublishListingCase", A.owner, { propertyId: r.propertyId })).unpublished, false);
  });

  it("S23 ownership documents: the attempt-specific copy is deleted when an attempt fails or loses; the winner's document stays and is referenced", async () => {
    const key = newKey(); const photos = await putStaging(A.extA, key, [0, 1]); const doc = await putStaging(A.extA, key, ["doc"]);
    const body = payload(key, "house", photos, { ownershipDocPath: doc[0].path });
    listing().hooks.afterSubmitCopy = async () => { throw new Error("synthetic crash after copy"); };
    assert.strictEqual(await errCode(call("submitListingCase", A.extA, body)), "internal");
    assert.deepStrictEqual(await H.listFiles("caseAttachments/"), [], "no ownership document left behind by the failed attempt");
    assert.deepStrictEqual(await H.listFiles("casePhotos/"), []);
    delete listing().hooks.afterSubmitCopy;
    // two attempts at once, both with a document: exactly one document remains and the record points at it
    let held = 0, release; const gate = new Promise((res) => { release = res; });
    listing().hooks.afterSubmitCopy = async () => { held++; if (held === 1) await gate; };
    const p1 = call("submitListingCase", A.extA, body);
    await new Promise((res) => setTimeout(res, 400));
    const r2 = await call("submitListingCase", A.extA, body);
    release(); const r1 = await p1;
    assert.strictEqual(r1.propertyId, r2.propertyId);
    const rec = await getDoc("caseInternal/" + r1.propertyId);
    const atts = await H.listFiles("caseAttachments/");
    assert.deepStrictEqual(atts, [rec.ownershipDocPath], "only the winner's document exists, and the record references exactly it");
    assert.strictEqual((await H.listFiles("casePhotos/" + r1.propertyId + "/")).length, 2);
  });

  it("S24 an agent (or any submitter) lists and resumes ONLY their own cases through the server; nobody sees another person's case; the view is minimal (no owner contact, notes, assignment or approval details)", async () => {
    const a1 = await submit(A.agent, { n: 2 }); const a2 = await submit(A.agent, { n: 2, type: "land" }); const other = await submit(A.agent2, { n: 2 }); const ext = await submit(A.extA, { n: 2 });
    await db.doc("caseInternal/" + a1.r.propertyId).update({ internalNotes: "synthetic internal note", assignedToEmail: "staff@example.test", reviewReturn: { reason: "please send the deed" }, verifications: { x: 1 } });
    const mine = await call("listMyCases", A.agent, {});
    assert.deepStrictEqual(mine.cases.map((c) => c.id).sort(), [a1.r.propertyId, a2.r.propertyId].sort());
    const one = mine.cases.find((c) => c.id === a1.r.propertyId);
    assert.strictEqual(one.trackToken, a1.r.trackToken, "the submitter gets the link to follow their own case"); assert.strictEqual(one.needsReply, true);
    const txt = JSON.stringify(mine);
    for (const secret of ["synthetic internal note", "staff@example.test", H.FIX.phone, H.FIX.owner, other.r.propertyId, other.r.trackToken, ext.r.propertyId, A.agent2.uid, "approvedBy"]) assert.ok(!txt.includes(secret), "list leaks " + secret);
    assert.deepStrictEqual((await call("listMyCases", A.agent2, {})).cases.map((c) => c.id), [other.r.propertyId]);
    assert.deepStrictEqual((await call("listMyCases", A.extA, {})).cases.map((c) => c.id), [ext.r.propertyId]);
    assert.deepStrictEqual((await call("listMyCases", A.extB, {})).cases, []);
    assert.strictEqual(await errCode(call("listMyCases", null, {})), "unauthenticated");
  });

  it("S25 the preview of a LIVE listing shows the photo set that actually stays public (published photos), says how many newer private photos are not included, and an update does not publish them", async () => {
    const { r } = await ready(A.extA, { n: 2 });
    const first = await call("previewListingCase", A.owner, { propertyId: r.propertyId });
    assert.deepStrictEqual([first.photoSource, first.photoCount, first.unpublishedPhotoCount, first.photoPaths.length, first.photoUrls.length], ["private", 2, 0, 2, 0]);
    await publish(A.owner, r.propertyId);
    const k = newKey(); const p = await putStaging(A.staff, k, [0]); await call("addCasePhotos", A.staff, { propertyId: r.propertyId, paths: p.map((x) => x.path) });
    await db.doc("caseInternal/" + r.propertyId).update({ bedrooms: 3 });
    const pv = await call("previewListingCase", A.owner, { propertyId: r.propertyId });
    assert.deepStrictEqual([pv.photoSource, pv.photoCount, pv.privatePhotoCount, pv.unpublishedPhotoCount, pv.photoPaths.length, pv.photoUrls.length], ["published", 2, 3, 1, 0, 2]);
    for (const u of pv.photoUrls) assert.strictEqual((await fetch(u)).status, 200);
    assert.strictEqual((await call("syncListingCase", A.owner, { propertyId: r.propertyId, reviewedSig: pv.updateSig })).synced, true);
    assert.strictEqual((await db.collection("propertyPhotos").where("propertyId", "==", r.propertyId).get()).size, 2, "the update did not publish the new private photo");
    assert.strictEqual((await getDoc("properties/" + r.propertyId)).photos.length, 2);
  });
  // ── D2 land size (owner decision 3 ต.ค. 2569): value + unit, canonical ตร.ม. computed by the SERVER at projection time; old unitless data untouched ─────────────
  it("L1 publish: the public land size comes from the ENTERED value + unit (100 ตร.ว. → 400 ตร.ม.; 400 ตร.ม. → 100 ตร.ว.); a hand-edited landAreaSqm can not reach the public page; the old unitless landSize is not published next to it", async () => {
    const a = await ready(A.extA, { n: 2 });
    await db.doc("caseInternal/" + a.r.propertyId).update({ landAreaValue: 100, landAreaUnit: "sqwa", landAreaSqm: 9999, landSize: 55 });
    const pv = await call("previewListingCase", A.owner, { propertyId: a.r.propertyId });
    assert.deepStrictEqual([pv.publicDocument.landAreaValue, pv.publicDocument.landAreaUnit, pv.publicDocument.landAreaSqm], [100, "sqwa", 400], "the Owner's preview already shows the recomputed value");
    assert.ok(!("landSize" in pv.publicDocument), "no second, unitless land size in the preview");
    await publish(A.owner, a.r.propertyId);
    const pubA = await getDoc("properties/" + a.r.propertyId);
    assert.deepStrictEqual([pubA.landAreaValue, pubA.landAreaUnit, pubA.landAreaSqm], [100, "sqwa", 400]); assert.ok(!("landSize" in pubA));
    assert.deepStrictEqual([(await getDoc("caseInternal/" + a.r.propertyId)).landAreaSqm, (await getDoc("caseInternal/" + a.r.propertyId)).landSize], [9999, 55], "the server never rewrites the team record");
    const b = await ready(A.extA, { n: 2 });
    await db.doc("caseInternal/" + b.r.propertyId).update({ landAreaValue: 400, landAreaUnit: "sqm", landAreaSqm: 400 });
    await publish(A.owner, b.r.propertyId);
    const pubB = await getDoc("properties/" + b.r.propertyId); assert.deepStrictEqual([pubB.landAreaValue, pubB.landAreaUnit, pubB.landAreaSqm], [400, "sqm", 400]);
    assert.strictEqual(require("../../functions/land-area.js").landAreaView(pubB).otherValue, 100, "the same page shows 100 ตร.ว. as the other unit");
  });
  it("L2 an OLD record with only the unitless landSize is published exactly as it is: no unit, no conversion, no landArea fields — and the team record is not touched", async () => {
    const a = await ready(A.extA, { n: 2 });
    await db.doc("caseInternal/" + a.r.propertyId).update({ landSize: 100 });
    await publish(A.owner, a.r.propertyId);
    const pub = await getDoc("properties/" + a.r.propertyId);
    assert.strictEqual(pub.landSize, 100); assert.ok(!("landAreaValue" in pub) && !("landAreaUnit" in pub) && !("landAreaSqm" in pub));
    const rec = await getDoc("caseInternal/" + a.r.propertyId); assert.strictEqual(rec.landSize, 100); assert.ok(!("landAreaValue" in rec) && !("landAreaSqm" in rec), "nothing was upgraded in the record");
  });
  it("L3 an invalid unit or value never produces a public land area (and never a guessed one); the old landSize stays as it was", async () => {
    const a = await ready(A.extA, { n: 2 });
    await db.doc("caseInternal/" + a.r.propertyId).update({ landAreaValue: 100, landAreaUnit: "rai", landAreaSqm: 160000, landSize: 7 });
    await publish(A.owner, a.r.propertyId);
    const pub = await getDoc("properties/" + a.r.propertyId); assert.ok(!("landAreaValue" in pub) && !("landAreaUnit" in pub) && !("landAreaSqm" in pub)); assert.strictEqual(pub.landSize, 7);
    const b = await ready(A.extA, { n: 2 });
    await db.doc("caseInternal/" + b.r.propertyId).update({ landAreaValue: -5, landAreaUnit: "sqm", landAreaSqm: -5 });
    await publish(A.owner, b.r.propertyId);
    const pubB = await getDoc("properties/" + b.r.propertyId); assert.ok(!("landAreaValue" in pubB) && !("landAreaSqm" in pubB));
  });
  it("L4 a later Staff edit (value or unit changed, then saved again unchanged) re-projects once: 100 ตร.ว. → 400 ตร.ม. entered; saving the same entry again changes nothing", async () => {
    const a = await ready(A.extA, { n: 2 });
    await db.doc("caseInternal/" + a.r.propertyId).update({ landAreaValue: 100, landAreaUnit: "sqwa", landAreaSqm: 400 });
    await publish(A.owner, a.r.propertyId);
    await db.doc("caseInternal/" + a.r.propertyId).update({ landAreaValue: 400, landAreaUnit: "sqm", landAreaSqm: 400 });
    const pv = await call("previewListingCase", A.owner, { propertyId: a.r.propertyId });
    assert.deepStrictEqual([pv.currentPublicDocument.landAreaValue, pv.currentPublicDocument.landAreaUnit], [100, "sqwa"]); assert.deepStrictEqual([pv.publicDocument.landAreaValue, pv.publicDocument.landAreaUnit, pv.publicDocument.landAreaSqm], [400, "sqm", 400]);
    assert.strictEqual((await call("syncListingCase", A.owner, { propertyId: a.r.propertyId, reviewedSig: pv.updateSig })).synced, true);
    let pub = await getDoc("properties/" + a.r.propertyId); assert.deepStrictEqual([pub.landAreaValue, pub.landAreaUnit, pub.landAreaSqm], [400, "sqm", 400]);
    await db.doc("caseInternal/" + a.r.propertyId).update({ landAreaValue: 400, landAreaUnit: "sqm", landAreaSqm: 400 }); // saved again, nothing changed
    const same = await call("syncListingCase", A.staff, { propertyId: a.r.propertyId });
    assert.ok(same.synced === false || same.reason, "an identical save is not a change"); pub = await getDoc("properties/" + a.r.propertyId); assert.deepStrictEqual([pub.landAreaValue, pub.landAreaUnit, pub.landAreaSqm], [400, "sqm", 400]);
  });
  it("L5 (r9 review) a deliberate clear (all land fields and the old landSize emptied by the person) reaches the public document: the old unitless number does not come back", async () => {
    const a = await ready(A.extA, { n: 2 });
    await db.doc("caseInternal/" + a.r.propertyId).update({ landSize: 100 });
    await publish(A.owner, a.r.propertyId);
    assert.strictEqual((await getDoc("properties/" + a.r.propertyId)).landSize, 100, "legacy published as it was");
    await db.doc("caseInternal/" + a.r.propertyId).update({ landAreaValue: null, landAreaUnit: null, landAreaSqm: null, landSize: null });
    const pv = await call("previewListingCase", A.owner, { propertyId: a.r.propertyId });
    assert.ok(!pv.publicDocument.landSize && !pv.publicDocument.landAreaValue && !pv.publicDocument.landAreaSqm, "the preview shows no land size");
    assert.strictEqual((await call("syncListingCase", A.owner, { propertyId: a.r.propertyId, reviewedSig: pv.updateSig })).synced, true);
    const pub = await getDoc("properties/" + a.r.propertyId); assert.ok(!pub.landSize && !pub.landAreaValue && !pub.landAreaUnit && !pub.landAreaSqm, "no land field is public any more");
  });
});
