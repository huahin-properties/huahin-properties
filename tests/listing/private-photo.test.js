// LISTING-E2E-01 — private (pending-review) photos: how the team's browser actually gets the bytes WITHOUT any download token.
// Uses the real private-photo.js transport (Authorization: Firebase <ID token> → Storage REST), a REAL Auth-emulator ID token, the REAL storage.rules and
// a REAL file written by submitListingCase. Not a browser: the page that shows the <img> is not run here (that stays open).
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { initializeTestEnvironment } = require("@firebase/rules-unit-testing");
const { install, snapshot, diffSnapshots } = require("../chat/stub-anthropic");
const H = require("./helpers");
const { ACTORS: A, call, newKey, putStaging, payload } = H;

const authHost = () => process.env.FIREBASE_AUTH_EMULATOR_HOST;
async function idToken(email, uid) {
  if (uid) await H.load().admin.auth().createUser({ uid, email, password: "synthetic-pass-123" }).catch((e) => { if (!/already/i.test(String(e.message))) throw e; });
  const url = "http://" + authHost() + "/identitytoolkit.googleapis.com/v1/accounts:" + (uid ? "signInWithPassword" : "signUp") + "?key=synthetic";
  const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password: "synthetic-pass-123", returnSecureToken: true }) });
  const j = await r.json(); assert.ok(j.idToken, JSON.stringify(j)); return j.idToken;
}
async function anonToken() {
  const r = await fetch("http://" + authHost() + "/identitytoolkit.googleapis.com/v1/accounts:signUp?key=synthetic", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ returnSecureToken: true }) });
  return (await r.json()).idToken;
}

describe("LISTING-E2E-01 private photo transport (real token, real rules, real file)", function () {
  this.timeout(120000);
  let iso, snapBefore, env, mod, db;
  before(async () => {
    snapBefore = snapshot(); iso = install(); db = H.load().admin.firestore();
    env = await initializeTestEnvironment({ projectId: H.PROJECT_ID, firestore: { rules: fs.readFileSync(path.join(H.ROOT, "firestore.rules"), "utf8") }, storage: { rules: fs.readFileSync(path.join(H.ROOT, "storage.rules"), "utf8") } });
    mod = await import(pathToFileURL(path.join(H.ROOT, "private-photo.js")).href);
  });
  after(async () => { await env.cleanup(); iso.restore(); assert.strictEqual(diffSnapshots(snapBefore, snapshot()).length, 0); });
  beforeEach(async () => { await H.wipe(env); await H.seedRoles(); });

  const host = () => "http://" + process.env.FIREBASE_STORAGE_EMULATOR_HOST;
  it("PP1 team members get the private photo bytes through getCasePhoto (no token anywhere, no public URL); nobody else does; only RECORDED private photos of that Case can be requested", async () => {
    const key = newKey(); const photos = await putStaging(A.extA, key, [0, 1], { buf: Buffer.from("SYNTHETIC-PHOTO-BYTES") });
    const r = await call("submitListingCase", A.extA, payload(key, "house", photos));
    const rec = (await db.doc("casePhotos/" + r.propertyId + "-0").get()).data();
    assert.ok(!/token=/.test(rec.dataUrl)); assert.ok(!((await H.fileMeta(rec.storagePath)).metadata || {}).firebaseStorageDownloadTokens);
    const ask = (actor, id, p) => call("getCasePhoto", actor, { propertyId: id, path: p });
    // Owner and Staff (the Staff row is a real adminUsers document; the page's user in the TEST project was exactly this)
    for (const who of [A.owner, A.staff]) {
      const res = await ask(who, r.propertyId, rec.storagePath);
      assert.strictEqual(Buffer.from(res.base64, "base64").toString(), "SYNTHETIC-PHOTO-BYTES"); assert.ok(/^image\//.test(res.contentType) || res.contentType === "application/octet-stream");
      assert.ok(!JSON.stringify(res).includes("token"), "no token in the response");
    }
    // everyone else: the submitter, another outsider, an agent, anonymous
    for (const [label, who] of [["the submitter", A.extA], ["another outsider", A.extB], ["an agent", A.agent], ["not signed in", null]]) {
      const c = await H.errCode(ask(who, r.propertyId, rec.storagePath)); assert.ok(["permission-denied", "unauthenticated"].includes(c), label + " → " + c);
    }
    // wrong / unrecorded / traversal / another case's / non-private paths are refused even for the Owner
    const k2 = newKey(); const other = await putStaging(A.extB, k2, [0, 1]); const r2 = await call("submitListingCase", A.extB, payload(k2, "house", other));
    const rec2 = (await db.doc("casePhotos/" + r2.propertyId + "-0").get()).data();
    const bad = [[r.propertyId, rec2.storagePath, "invalid-argument"], [r2.propertyId, rec.storagePath, "invalid-argument"], [r.propertyId, "casePhotos/" + r.propertyId + "/../" + r2.propertyId + "/x", "invalid-argument"],
      [r.propertyId, "casePhotos/" + r.propertyId + "/nothing-here.webp", "not-found"], [r.propertyId, "caseUploads/x/y/0.webp", "invalid-argument"], ["", rec.storagePath, "invalid-argument"], [r.propertyId, 5, "invalid-argument"]];
    for (const [id, p, want] of bad) assert.strictEqual(await H.errCode(ask(A.owner, id, p)), want, JSON.stringify([id, p]));
    // the bare Storage URL still shows nothing (no public path, no token)
    assert.notStrictEqual((await fetch(mod.storageMediaUrl(H.BUCKET_NAME, rec.storagePath, host()))).status, 200, "an <img src> with the bare URL shows nothing");
    // the browser-side transport: object URL cache, refusal not cached, error status mapping
    const created = []; const callFn = (name, data) => call(name, A.staff, data);
    const loader = mod.createPrivatePhotoLoader({ callFn, createObjectURL: (b) => { created.push(b); return "blob:synthetic-" + created.length; } });
    assert.strictEqual(await loader.load(rec.storagePath), "blob:synthetic-1"); assert.strictEqual(await loader.load(rec.storagePath), "blob:synthetic-1"); assert.strictEqual(created.length, 1, "fetched once, cached");
    assert.strictEqual(Buffer.from(await created[0].arrayBuffer()).toString(), "SYNTHETIC-PHOTO-BYTES");
    const denied = mod.createPrivatePhotoLoader({ callFn: async () => { throw Object.assign(new Error("x"), { code: "functions/permission-denied" }); }, createObjectURL: () => "x" });
    await assert.rejects(denied.load(rec.storagePath), (e) => e.status === 403); await assert.rejects(denied.load(rec.storagePath), undefined, "a refusal is not cached as success");
    await assert.rejects(mod.createPrivatePhotoLoader({ callFn, createObjectURL: () => "x" }).load("somewhere/else.webp"), (e) => e.status === 400);
    loader.clear();
  });

  it("PP2 a PUBLISHED photo is the only kind a plain <img src> loads (its token is public by design); after take-down it does not", async () => {
    const key = newKey(); const photos = await putStaging(A.extA, key, [0, 1]);
    const r = await call("submitListingCase", A.extA, payload(key, "house", photos));
    await db.doc("caseInternal/" + r.propertyId).update({ reviewStatus: "approved", approvedSubmissionId: "s1" });
    const pv = await call("previewListingCase", A.owner, { propertyId: r.propertyId });
    await call("publishListingCase", A.owner, { propertyId: r.propertyId, reviewedSig: pv.publishSig });
    const pub = (await db.doc("propertyPhotos/" + r.propertyId + "-0").get()).data().dataUrl;
    assert.strictEqual((await fetch(pub)).status, 200);
    const priv = (await db.doc("casePhotos/" + r.propertyId + "-0").get()).data();
    assert.notStrictEqual((await fetch(mod.storageMediaUrl(H.BUCKET_NAME, priv.storagePath, host()))).status, 200, "the private original stays private after publishing");
    await call("unpublishListingCase", A.owner, { propertyId: r.propertyId });
    assert.notStrictEqual((await fetch(pub)).status, 200);
  });
});
