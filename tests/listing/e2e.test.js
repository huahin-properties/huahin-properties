// LISTING-E2E-01 — the whole chain, per submitter group, through the REAL rules and the REAL handlers
// (emulators, synthetic data, no credentials): photos → submit → Staff prepares → Staff cannot publish →
// Owner decides → Owner publishes → public page data + photos → cross-user denial → take-down.
// "Browser" actions use @firebase/rules-unit-testing contexts (so every read/write is judged by firestore.rules);
// server actions call the real callable handlers in-process. NOT a production PASS and NOT a browser test.
"use strict";
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const { initializeTestEnvironment } = require("@firebase/rules-unit-testing");
const { install, snapshot, diffSnapshots } = require("../chat/stub-anthropic");
const { isAllowed } = require("../helpers/synthetic");
const H = require("./helpers");
const publish = async (actor, id, extra) => { const pv = await call("previewListingCase", actor, { propertyId: id }); return call("publishListingCase", actor, Object.assign({ propertyId: id, reviewedSig: pv.publishSig }, extra || {})); };
const { ACTORS: A, call, errCode, errReason, newKey, putStaging, payload, PRIVATE_FIELDS } = H;

const ctxOf = (env, a) => env.authenticatedContext(a.uid, a.token);
const _f = new WeakMap();
const F = (c) => { if (!_f.has(c)) _f.set(c, c.firestore()); return _f.get(c); };
const allowed = (p) => isAllowed(p);
const storageHost = () => process.env.FIREBASE_STORAGE_EMULATOR_HOST;
const dl = async (url) => (await fetch(url)).status; // unauthenticated browser download

let env, iso, snapBefore, db;

const GROUPS = [
  { name: "site owner (posting in the site's name)", actor: A.owner, relation: "website", type: "villa", n: 3, ownerDirect: true },
  { name: "agent / collaborator", actor: A.agent, other: A.agent2, relation: "representative", type: "house", n: 2 },
  { name: "outsider consigning (anonymous sign-in)", actor: A.extA, other: A.extB, relation: "self", type: "land", n: 1 }, // land: Photo Standard v1 minimum is 1
];

describe("LISTING-E2E-01 end-to-end per submitter group (real rules + real handlers, emulators, synthetic)", function () {
  this.timeout(180000);
  before(async () => {
    snapBefore = snapshot(); iso = install();
    db = H.load().admin.firestore();
    env = await initializeTestEnvironment({ projectId: H.PROJECT_ID, firestore: { rules: fs.readFileSync(path.join(H.ROOT, "firestore.rules"), "utf8") }, storage: { rules: fs.readFileSync(path.join(H.ROOT, "storage.rules"), "utf8") } });
  });
  after(async () => { await env.cleanup(); iso.restore(); assert.strictEqual(diffSnapshots(snapBefore, snapshot()).length, 0); assert.strictEqual(iso.blocked.length, 0); });
  beforeEach(async () => { await H.wipe(env); await H.seedRoles(); });

  for (const g of GROUPS) {
    it("E2E " + g.name + ": photos → submit → Staff → Owner → public page; nobody outside the chain reads or edits it", async () => {
      const key = newKey();
      // 1 photos in the submitter's private staging folder, 2 submit (double click = same case)
      const photos = await putStaging(g.actor, key, Array.from({ length: g.n }, (_, i) => i));
      const d = payload(key, g.type, photos, { propertyOwner: { relation: g.relation, name: "Synthetic Real Owner", contact: "0822222222" } });
      const [r1, r2] = await Promise.all([call("submitListingCase", g.actor, d), call("submitListingCase", g.actor, d)]);
      assert.strictEqual(r1.propertyId, r2.propertyId); assert.strictEqual((await db.collection("caseInternal").get()).size, 1, "one case");
      const id = r1.propertyId;
      const rec0 = (await db.doc("caseInternal/" + id).get()).data();
      assert.strictEqual(rec0.submittedByUid, g.actor.uid, "submitter recorded from the verified identity");
      assert.strictEqual(rec0.propertyOwnerRelation, g.relation, "submitter, property owner and approver are separate facts");
      assert.strictEqual(rec0.ownerName, "Synthetic Real Owner");
      assert.ok(!rec0.approvedByUid, "nobody has approved yet");

      // 3 a pending case is NOT public in any way
      const pubView = F(env.unauthenticatedContext());
      assert.strictEqual((await pubView.doc("properties/" + id).get()).exists, false, "no public document for a pending case");
      assert.strictEqual((await pubView.collection("propertyPhotos").where("propertyId", "==", id).get()).size, 0, "no public photo record");
      assert.strictEqual(await allowed(pubView.doc("caseInternal/" + id).get()), false);
      assert.strictEqual(await allowed(pubView.doc("casePhotos/" + id + "-0").get()), false);
      assert.strictEqual(await allowed(pubView.collection("properties/" + id + "/caseMessages").get()), false);
      const privDoc = (await db.doc("casePhotos/" + id + "-0").get()).data();
      assert.ok(!/token=/.test(privDoc.dataUrl), "the private copy has no download token in its record");
      assert.notStrictEqual(await dl(privDoc.dataUrl), 200, "a pending photo cannot be downloaded without a session");
      const privMeta = (await H.load().admin.storage().bucket(H.BUCKET_NAME).file(privDoc.storagePath).getMetadata())[0];
      assert.ok(!(privMeta.metadata && privMeta.metadata.firebaseStorageDownloadTokens), "private file carries no download token");
      assert.deepStrictEqual(await H.listFiles("caseUploads/"), [], "staging copies (client-minted token) are removed after submit");

      // 4 cross-user denial — and the submitter's own access is the server's token-checked view, not the record
      const stranger = g.other || A.google;
      const sc = ctxOf(env, stranger);
      assert.strictEqual(await allowed(F(sc).doc("caseInternal/" + id).get()), false, "another user cannot read the case record");
      assert.strictEqual(await allowed(F(sc).doc("casePhotos/" + id + "-0").get()), false, "…or the private photo records");
      assert.strictEqual(await allowed(sc.storage().ref(privDoc.storagePath).getMetadata()), false, "…or the private photo files");
      assert.strictEqual(await allowed(F(sc).doc("caseInternal/" + id).update({ price: 1 })), false, "…or edit the case");
      assert.strictEqual(await allowed(F(sc).collection("properties/" + id + "/caseMessages").get()), false, "…or its conversation");
      assert.strictEqual(await errCode(call("trackListingCase", stranger, { id, action: "view" })), "permission-denied", "…or its tracking view without the token");
      const ac = ctxOf(env, g.actor);
      if (g.actor !== A.owner) assert.strictEqual(await allowed(F(ac).doc("caseInternal/" + id).get()), false, "even the submitter does not read the internal record (the site Owner reads it as team)");
      assert.strictEqual((await call("trackListingCase", null, { id, token: r1.trackToken })).id, id, "the submitter's view is the server's token-checked one");
      assert.strictEqual(await allowed(F(ac).doc("properties/" + id).set({ listingStatus: "live", price: 1, listerId: g.actor.uid })), false, "nobody can create a public page for it");

      // 5 submitters / agents cannot publish through the server either
      if (g.actor !== A.owner) for (const who of [g.actor, A.staff]) assert.strictEqual(await errCode(publish(who, id)), "permission-denied", "publish refused for " + who.uid);

      // 6 Staff prepares the case (through the rules): assign, verify, review, send to the Owner — but cannot publish or approve
      const st = ctxOf(env, A.staff), sf = F(st);
      assert.strictEqual(await allowed(sf.doc("caseInternal/" + id).update({ assignedToUid: A.staff.uid, assignedToEmail: "staff@example.test", verifications: { owner_identity: { by: "staff@example.test", at: 1 } }, reviewStatus: "reviewing" })), true, "Staff writes assignment + verification");
      assert.strictEqual(await allowed(sf.doc("caseInternal/" + id).update({ listingStatus: "pending_owner" })), true, "Staff sends it to the Owner");
      assert.strictEqual(await allowed(sf.doc("caseInternal/" + id).update({ listingStatus: "live" })), false, "Staff cannot make it live");
      assert.strictEqual(await allowed(sf.doc("caseInternal/" + id).update({ reviewStatus: "approved" })), false, "Staff cannot approve");
      assert.strictEqual(await allowed(sf.doc("caseInternal/" + id).update({ approvedByUid: A.staff.uid })), false, "Staff cannot forge the approval record");
      assert.strictEqual(await allowed(sf.doc("casePhotos/" + id + "-0").get()), true, "Staff can see the private photos to review them");
      assert.strictEqual(await errCode(publish(A.staff, id)), "permission-denied");
      await call("trackListingCase", null, { id, token: r1.trackToken, action: "send", message: "synthetic customer question", lang: "en" });
      assert.strictEqual((await sf.collection("properties/" + id + "/caseMessages").get()).size, 1, "Staff see the customer's message");

      // 7 Owner decides, then publishes through the server
      const oc = F(ctxOf(env, A.owner));
      if (!g.ownerDirect) {
        assert.strictEqual(await errReason(publish(A.owner, id)), "intake_not_approved", "the Owner's publish step does not skip the intake decision");
        assert.strictEqual(await allowed(oc.doc("caseInternal/" + id).update({ reviewStatus: "approved", approvedSubmissionId: "syn-sub-1" })), true, "Owner records the intake decision");
      }
      assert.strictEqual(await allowed(oc.doc("caseInternal/" + id).update({ listingStatus: "live" })), false, "not even the Owner publishes from a browser");
      const out = await publish(A.owner, id);
      assert.strictEqual(out.published, true); assert.strictEqual(out.photoCount, g.n);
      assert.strictEqual(out.approvalPath, g.ownerDirect ? "owner_direct" : "intake_approved");
      const intAfter = (await db.doc("caseInternal/" + id).get()).data();
      assert.strictEqual(intAfter.approvedByUid, A.owner.uid, "action record: who approved"); assert.strictEqual(intAfter.approvedByRole, "owner");

      // 8 the public page: allow-list data only + photos of THIS property that actually download
      const pub = (await pubView.doc("properties/" + id).get()).data();
      assert.strictEqual(pub.listingStatus, "live");
      const leaked = PRIVATE_FIELDS.filter((k) => k in pub); assert.deepStrictEqual(leaked, [], "public document has no private field: " + leaked);
      const txt = JSON.stringify(pub);
      if (g.actor === A.agent) assert.strictEqual(pub.listerId, g.actor.uid); else assert.ok(!("listerId" in pub));
      for (const secret of [r1.trackToken, ...(g.actor === A.agent ? [] : [g.actor.uid]), H.FIX.phone, "0822222222", "Synthetic Real Owner", key, "staff@example.test"]) assert.ok(!txt.includes(secret), "public document leaks " + secret);
      const pphotos = (await pubView.collection("propertyPhotos").where("propertyId", "==", id).get()).docs.map((x) => x.data());
      assert.strictEqual(pphotos.length, g.n, "all photos are bound to this property and public");
      for (const p of pphotos) { assert.strictEqual(p.propertyId, id); assert.strictEqual(await dl(p.dataUrl), 200, "public photo downloads"); assert.ok(p.dataUrl.includes("publishedCasePhotos")); }
      assert.strictEqual(pub.photoCount, undefined); assert.strictEqual(pub.publishedPhotoCount, g.n);
      assert.notStrictEqual(await dl(privDoc.dataUrl), 200, "publishing does not turn the private copy public");
      // the owner/agent/other users still cannot edit the public page or its photos from a browser
      for (const who of [A.owner, g.actor, stranger]) { const c = F(ctxOf(env, who)); assert.strictEqual(await allowed(c.doc("properties/" + id).update({ price: 1 })), false); assert.strictEqual(await allowed(c.doc("propertyPhotos/" + id + "-0").delete()), false); }

      // 9 take-down: public page and copies die, old public links stop working
      const oldUrl = pphotos[0].dataUrl;
      assert.strictEqual((await call("unpublishListingCase", A.owner, { propertyId: id, reason: "synthetic" })).unpublished, true);
      assert.strictEqual((await pubView.doc("properties/" + id).get()).exists, false);
      assert.strictEqual((await pubView.collection("propertyPhotos").where("propertyId", "==", id).get()).size, 0);
      assert.notStrictEqual(await dl(oldUrl), 200, "old public photo link is dead after take-down");
      assert.strictEqual((await call("trackListingCase", null, { id, token: r1.trackToken })).listingStatus, "offline");
    });
  }

  it("E2E-DRAFT chat/form share one draft binding: a second submission with another key but the same draft is the same case (draft id binds, never name/phone)", async () => {
    const draftId = "draft__" + A.extA.uid;
    await db.doc("propertyDrafts/" + draftId).set({ ownerUid: A.extA.uid, status: "draft", fields: {} });
    const k1 = newKey(), k2 = newKey();
    const p1 = await putStaging(A.extA, k1, [0, 1]), p2 = await putStaging(A.extA, k2, [0, 1]);
    const a = await call("submitListingCase", A.extA, payload(k1, "house", p1, { draftId }));
    const b = await call("submitListingCase", A.extA, payload(k2, "house", p2, { draftId }));
    assert.strictEqual(a.propertyId, b.propertyId, "same draft → same case");
    const k3 = newKey(); const p3 = await putStaging(A.extB, k3, [0, 1]);
    const c = await call("submitListingCase", A.extB, payload(k3, "house", p3));
    assert.notStrictEqual(c.propertyId, a.propertyId);
    assert.strictEqual((await db.collection("caseInternal").get()).size, 2);
  });

  it("E2E-CHAT a lead the chat opened is COMPLETED by the form on the SAME case (photos + details attached, token kept, no second case); repeating it changes nothing", async () => {
    const uid = A.extA.uid, chatId = "own-1800000000000-abcde", token = "C".repeat(48), draftId = "draft__" + uid;
    // exactly the shape createCaseFromConversation writes: ONE team-only record
    await db.doc("caseInternal/" + chatId).set({ propertyId: chatId, createdAt: 1, internalSplit: true, source: "owner_submission", caseSource: "ai_assistant", listingStatus: "pending", reviewStatus: "submitted", workflowVersion: "intake_v1", status: "sale", description: "customer summary from chat", submittedAt: 1,
      submittedByUid: uid, submittedByRole: "external", trackToken: token, conversationId: "reception__" + uid, receptionVisitorId: uid, contactName: "Synthetic Chat Lead", ownerContact: "line:synthetic", assignedToEmail: "staff@example.test" });
    await db.doc("propertyDrafts/" + draftId).set({ ownerUid: uid, status: "draft", caseId: chatId, fields: {} });
    const key = newKey(); const photos = await putStaging(A.extA, key, [0, 1, 2]);
    const d = payload(key, "villa", photos, { price: 9900000, description: "Synthetic form description" });
    const a = await call("submitListingCase", A.extA, d);
    assert.strictEqual(a.propertyId, chatId, "same case"); assert.strictEqual(a.trackToken, token, "the customer's existing tracking link keeps working");
    assert.strictEqual((await db.collection("caseInternal").get()).size, 1, "no second case"); assert.strictEqual((await db.collection("properties").get()).size, 0, "nothing public");
    const rec = (await db.doc("caseInternal/" + chatId).get()).data();
    assert.strictEqual(rec.type, "villa"); assert.strictEqual(rec.price, 9900000); assert.strictEqual(rec.photoCount, 3); assert.strictEqual(rec.listingStatus, "pending"); assert.strictEqual(rec.reviewStatus, "submitted"); assert.strictEqual(rec.description, "Synthetic form description");
    assert.strictEqual(rec.formCompletedKey, key); assert.strictEqual(rec.trackToken, token); assert.strictEqual(rec.assignedToEmail, "staff@example.test", "Staff's work on the case is not overwritten");
    assert.strictEqual(rec.conversationId, "reception__" + uid); assert.strictEqual(rec.contactPhone, H.FIX.phone);
    assert.strictEqual((await db.collection("casePhotos").where("propertyId", "==", chatId).get()).size, 3);
    const again = await call("submitListingCase", A.extA, d);
    assert.strictEqual(again.propertyId, chatId); assert.strictEqual((await db.collection("casePhotos").get()).size, 3);
    const k2 = newKey(); const p2 = await putStaging(A.extA, k2, [0, 1]);
    const third = await call("submitListingCase", A.extA, payload(k2, "villa", p2));
    assert.strictEqual(third.propertyId, chatId, "a different key from the same draft is still the same, already-complete case");
    assert.strictEqual((await db.collection("casePhotos").get()).size, 3, "…and does not add photos or reopen it");
    assert.strictEqual((await H.listFiles("casePhotos/" + chatId + "/")).length, 3, "…and leaves no file behind");
  });
});
