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
  it("PP1 the Owner's session loads the private photo bytes; nobody else does — no token in the URL, none on the file, none in the record", async () => {
    const key = newKey(); const photos = await putStaging(A.extA, key, [0, 1], { buf: Buffer.from("SYNTHETIC-PHOTO-BYTES") });
    const r = await call("submitListingCase", A.extA, payload(key, "house", photos));
    const rec = (await db.doc("casePhotos/" + r.propertyId + "-0").get()).data();
    assert.ok(!/token=/.test(rec.dataUrl)); assert.ok(!((await H.fileMeta(rec.storagePath)).metadata || {}).firebaseStorageDownloadTokens);
    const base = { bucket: H.BUCKET_NAME, path: rec.storagePath, host: host(), fetchImpl: fetch };
    const url = mod.storageMediaUrl(H.BUCKET_NAME, rec.storagePath, host());
    assert.ok(!/token=/.test(url), "the URL used carries no token");
    // team (the hard-coded Owner uid, created in the Auth emulator with that uid)
    const ownerTok = await idToken("owner@example.test", H.OWNER_UID);
    const blob = await mod.fetchPrivatePhotoBlob(Object.assign({ getIdToken: async () => ownerTok }, base));
    assert.strictEqual(Buffer.from(await blob.arrayBuffer()).toString(), "SYNTHETIC-PHOTO-BYTES");
    // everyone else
    const others = [["signed in, not team", await idToken("someone@example.test")], ["anonymous sign-in", await anonToken()], ["the submitter (anonymous)", await anonToken()], ["no token", null]];
    for (const [label, tok] of others) await assert.rejects(mod.fetchPrivatePhotoBlob(Object.assign({ getIdToken: async () => tok }, base)), (e) => [401, 403].includes(e.status), label + " must be refused");
    // the bare URL (what the old fallback used) does not load either
    assert.notStrictEqual((await fetch(url)).status, 200, "an <img src> with the bare URL shows nothing");
    // a wrong path / another case's file is refused too
    const k2 = newKey(); const other = await putStaging(A.extB, k2, [0, 1]); const r2 = await call("submitListingCase", A.extB, payload(k2, "house", other));
    assert.ok(r2.propertyId !== r.propertyId);
    // loader: caches per path, fails closed, clears
    const created = []; const loader = mod.createPrivatePhotoLoader({ bucket: H.BUCKET_NAME, host: host(), fetchImpl: fetch, getIdToken: async () => ownerTok, createObjectURL: (b) => { created.push(b); return "blob:synthetic-" + created.length; }, revokeObjectURL: () => {} });
    assert.strictEqual(await loader.load(rec.storagePath), "blob:synthetic-1"); assert.strictEqual(await loader.load(rec.storagePath), "blob:synthetic-1"); assert.strictEqual(created.length, 1, "fetched once");
    const bad = mod.createPrivatePhotoLoader({ bucket: H.BUCKET_NAME, host: host(), fetchImpl: fetch, getIdToken: async () => null, createObjectURL: () => "x" });
    await assert.rejects(bad.load(rec.storagePath)); await assert.rejects(bad.load(rec.storagePath), undefined, "a refusal is not cached as success");
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
