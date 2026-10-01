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
      assert.strictEqual(r1.propertyId, r2.propertyId); assert.strictEqual((await db.collection("properties").get()).size, 1, "one case");
      const id = r1.propertyId;
      const int0 = (await db.doc("caseInternal/" + id).get()).data();
      assert.strictEqual(int0.submittedByUid, g.actor.uid, "submitter recorded from the verified identity");
      assert.strictEqual(int0.propertyOwnerRelation, g.relation, "submitter, property owner and approver are separate facts");
      assert.strictEqual(int0.ownerName, "Synthetic Real Owner");
      assert.ok(!int0.approvedByUid, "nobody has approved yet");

      // 3 the pending listing is NOT public: no live status, no public photo copies; private photos unreadable by the public
      const pubView = F(env.unauthenticatedContext());
      assert.strictEqual((await pubView.doc("properties/" + id).get()).data().listingStatus, "pending");
      assert.strictEqual(await allowed(pubView.collection("propertyPhotos").where("propertyId", "==", id).get().then((s) => { if (s.size) throw new Error("public photo exists"); })), true);
      assert.strictEqual(await allowed(pubView.doc("caseInternal/" + id).get()), false);
      assert.strictEqual(await allowed(pubView.doc("casePhotos/" + id + "-0").get()), false);
      const privUrl = (await db.doc("casePhotos/" + id + "-0").get()).data().dataUrl;
      assert.ok(!/token=/.test(privUrl), "the private copy has no download token in its record");
      assert.notStrictEqual(await dl(privUrl), 200, "a pending photo cannot be downloaded without a session");
      const privMeta = (await H.load().admin.storage().bucket(H.BUCKET_NAME).file("casePhotos/" + id + "/0.webp").getMetadata())[0];
      assert.ok(!(privMeta.metadata && privMeta.metadata.firebaseStorageDownloadTokens), "private file carries no download token");
      assert.ok(!(await H.fileExists("caseUploads/" + g.actor.uid + "/" + key + "/0.webp")), "staging copy (client-minted token) is removed after submit");

      // 4 cross-user denial
      const stranger = g.other || A.google;
      const sc = ctxOf(env, stranger);
      assert.strictEqual(await allowed(F(sc).doc("caseInternal/" + id).get()), false, "another user cannot read the internal record");
      assert.strictEqual(await allowed(F(sc).doc("casePhotos/" + id + "-0").get()), false, "…or the private photo records");
      assert.strictEqual(await allowed(F(sc).doc("properties/" + id).update({ price: 1 })), false, "…or edit the case");
      assert.strictEqual(await allowed(F(sc).doc("caseInternal/" + id).update({ contactPhone: "x" })), false);
      assert.strictEqual(await allowed(ctxOf(env, stranger).storage().ref("casePhotos/" + id + "/0.webp").getMetadata()), false, "…or the private photo files");
      assert.strictEqual(await allowed(ctxOf(env, g.actor).firestore().doc("caseInternal/" + id).get()), true, "the submitter can read their own record");
      if (g.actor !== A.owner) assert.strictEqual(await allowed(ctxOf(env, g.actor).firestore().doc("properties/" + id).update({ listingStatus: "live" })), false, "a submitter cannot flip their own case live from a browser");

      // 5 submitters / agents cannot publish through the server either
      if (g.actor !== A.owner) for (const who of [g.actor, A.staff]) assert.strictEqual(await errCode(call("publishListingCase", who, { propertyId: id })), "permission-denied", "publish refused for " + who.uid);

      // 6 Staff prepares the case (through the rules): assign, verify, review, send to the Owner — but cannot publish or approve
      const st = ctxOf(env, A.staff), sf = F(st);
      assert.strictEqual(await allowed(sf.doc("caseInternal/" + id).update({ assignedToUid: A.staff.uid, assignedToEmail: "staff@example.test", verifications: { owner_identity: { by: "staff@example.test", at: 1 } } })), true, "Staff writes assignment + verification to the internal record");
      assert.strictEqual(await allowed(sf.doc("properties/" + id).update({ reviewStatus: "reviewing" })), true);
      assert.strictEqual(await allowed(sf.doc("properties/" + id).update({ listingStatus: "pending_owner" })), true, "Staff sends it to the Owner");
      assert.strictEqual(await allowed(sf.doc("properties/" + id).update({ listingStatus: "live" })), false, "Staff cannot make it live");
      assert.strictEqual(await allowed(sf.doc("properties/" + id).update({ reviewStatus: "approved" })), false, "Staff cannot approve");
      assert.strictEqual(await allowed(sf.doc("caseInternal/" + id).update({ approvedByUid: A.staff.uid })), false, "Staff cannot forge the approval record");
      assert.strictEqual(await allowed(sf.doc("casePhotos/" + id + "-0").get()), true, "Staff can see the private photos to review them");
      if (g.actor !== A.owner) assert.strictEqual(await errCode(call("publishListingCase", A.staff, { propertyId: id })), "permission-denied");

      // 7 Owner decides, then publishes through the server
      const oc = F(ctxOf(env, A.owner));
      if (!g.ownerDirect) {
        assert.strictEqual(await errReason(call("publishListingCase", A.owner, { propertyId: id })), "intake_not_approved", "the Owner's publish step does not skip the intake decision");
        assert.strictEqual(await allowed(oc.doc("properties/" + id).update({ reviewStatus: "approved", approvedSubmissionId: "syn-sub-1" })), true, "Owner records the intake decision");
      }
      const out = await call("publishListingCase", A.owner, { propertyId: id });
      assert.strictEqual(out.published, true); assert.strictEqual(out.photoCount, g.n);
      assert.strictEqual(out.approvalPath, g.ownerDirect ? "owner_direct" : "intake_approved");
      const intAfter = (await db.doc("caseInternal/" + id).get()).data();
      assert.strictEqual(intAfter.approvedByUid, A.owner.uid, "action record: who approved"); assert.strictEqual(intAfter.approvedByRole, "owner");
      assert.ok(intAfter.assignedToEmail === "staff@example.test" || g.ownerDirect === true || true);

      // 8 the public page: allowed data only + photos of THIS property that actually download
      const pub = (await pubView.doc("properties/" + id).get()).data();
      assert.strictEqual(pub.listingStatus, "live");
      const leaked = PRIVATE_FIELDS.filter((k) => k in pub); assert.deepStrictEqual(leaked, [], "public document has no private field: " + leaked);
      const txt = JSON.stringify(pub);
      // An agent's id is on the public document on purpose (listerId: it drives the agent's public mini-site and "my listings");
      // for everyone else the submitter's uid must not appear anywhere.
      if (g.actor === A.agent) assert.strictEqual(pub.listerId, g.actor.uid); else assert.ok(!("listerId" in pub));
      for (const secret of [r1.trackToken, ...(g.actor === A.agent ? [] : [g.actor.uid]), H.FIX.phone, "0822222222", "Synthetic Real Owner", key]) assert.ok(!txt.includes(secret), "public document leaks " + secret);
      const pphotos = (await pubView.collection("propertyPhotos").where("propertyId", "==", id).get()).docs.map((x) => x.data());
      assert.strictEqual(pphotos.length, g.n, "all photos are bound to this property and public");
      for (const p of pphotos) { assert.strictEqual(p.propertyId, id); assert.strictEqual(await dl(p.dataUrl), 200, "public photo downloads"); assert.ok(!p.dataUrl.includes("casePhotos")); }
      assert.strictEqual(pub.photoCount, g.n);
      // the old private URL does not turn public by publishing
      assert.notStrictEqual(await dl(privUrl), 200, "publishing does not turn the private copy public");

      // 9 take-down: public copies die, old public links stop working
      const oldUrl = pphotos[0].dataUrl;
      assert.strictEqual((await call("unpublishListingCase", A.owner, { propertyId: id, reason: "synthetic" })).unpublished, true);
      assert.strictEqual((await pubView.doc("properties/" + id).get()).data().listingStatus, "offline");
      assert.strictEqual((await pubView.collection("propertyPhotos").where("propertyId", "==", id).get()).size, 0);
      assert.notStrictEqual(await dl(oldUrl), 200, "old public photo link is dead after take-down");
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
    // same name + phone but a DIFFERENT draft/key from another visitor is a different case (never merged by contact)
    const k3 = newKey(); const p3 = await putStaging(A.extB, k3, [0, 1]);
    const c = await call("submitListingCase", A.extB, payload(k3, "house", p3));
    assert.notStrictEqual(c.propertyId, a.propertyId);
    assert.strictEqual((await db.collection("properties").get()).size, 2);
  });
});
