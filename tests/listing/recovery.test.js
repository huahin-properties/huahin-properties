// LISTING-E2E-01 — recovery of the customer's form (owner-form-flow.js, the logic behind Owner Submission.dc.html) against the REAL
// server functions on the emulators: refresh, partial upload, lost response, double click, chat-draft prefill with edit protection.
// Synthetic data only. NOT a real-browser test (the page itself is not run here).
"use strict";
const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");
const { install, snapshot, diffSnapshots } = require("../chat/stub-anthropic");
const H = require("./helpers");
const { ACTORS: A, call } = H;

let iso, snapBefore, db, Flow;
const mem = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), _m: m }; };

// what the browser does, backed by the real handlers: create-only uploads into the submitter's own staging folder
function deps(storage, actor, opts) {
  const o = Object.assign({ failUploadOnce: new Set(), loseResponse: false, counts: { uploads: 0, submits: 0 }, uid: actor.uid }, opts || {});
  const { admin } = H.load();
  const bucket = admin.storage().bucket(H.BUCKET_NAME);
  const fns = H.load().fns;
  const draftCall = (name, data) => fns[name].run({ auth: { uid: actor.uid, token: actor.token }, data, rawRequest: {} });
  return { o, d: {
    storage, crypto: require("crypto").webcrypto, relation: undefined, language: "th",
    fb: {
      ensureSignedIn: async () => o.uid,
      uploadCaseStagingPhoto: async (uid, key, name, data) => {
        const p = "caseUploads/" + uid + "/" + key + "/" + name + ".webp";
        if (o.failUploadOnce.has(name)) { o.failUploadOnce.delete(name); throw new Error("synthetic network drop"); }
        const f = bucket.file(p); const [exists] = await f.exists();
        if (!exists) { o.counts.uploads++; await f.save(Buffer.from(String(data).slice(0, 40) + name), { contentType: "image/webp", resumable: false }); }
        return p; // "already there" is success (slots are create-only)
      },
      submitListingCase: async (data) => { o.counts.submits++; const r = await call("submitListingCase", { uid: o.uid, token: actor.token }, data); if (o.loseResponse) { o.loseResponse = false; throw new Error("synthetic: the answer never arrived"); } return r; },
      getPropertyDraft: async () => (await draftCall("getPropertyDraft", {})),
      updatePropertyDraft: async (fields) => (await draftCall("updatePropertyDraft", { fields })),
    },
  } };
}
const fill = (flow, extra) => { const f = Object.assign({ name: "Synthetic Person", phone: "0800000000", txnType: "sale", type: "house", price: "7500000", description: "Synthetic description for a synthetic property." }, extra || {}); Object.keys(f).forEach((k) => flow.setField(k, f[k])); };

describe("LISTING-E2E-01 recovery: refresh / partial upload / lost response / double click / chat-draft prefill (real handlers, emulators, synthetic)", function () {
  this.timeout(120000);
  before(async () => {
    snapBefore = snapshot(); iso = install();
    db = H.load().admin.firestore();
    Flow = (await import(pathToFileURL(path.join(H.ROOT, "owner-form-flow.js")).href)).OwnerFormFlow;
  });
  beforeEach(async () => { await H.wipe(); await H.seedRoles(); });
  after(() => { iso.restore(); assert.strictEqual(diffSnapshots(snapBefore, snapshot()).length, 0); assert.strictEqual(iso.blocked.length, 0, JSON.stringify(iso.blocked)); });

  it("R1 refresh in the middle: the form, the key and the already-uploaded photos come back; only the missing photo is uploaded; one Case with all photos", async () => {
    const store = mem(); const x = deps(store, A.extA);
    const a = new Flow(x.d); fill(a); await a.addPhoto("data-1", "t1"); await a.addPhoto("data-2", "t2");
    const key = a.state.key;
    // ── the page is refreshed: a NEW flow object on the same storage ──
    const b = new Flow(x.d);
    assert.strictEqual(b.state.key, key); assert.strictEqual(b.state.fields.description, "Synthetic description for a synthetic property."); assert.strictEqual(b.state.fields.price, "7500000");
    assert.deepStrictEqual(b.state.slots.map((s) => s.n), [0, 1]); assert.strictEqual(b.photoCount(), 2); assert.ok(b.state.slots.every((s) => s.thumb), "thumbnails are restored too");
    await b.addPhoto("data-3", "t3");
    assert.strictEqual(x.o.counts.uploads, 3, "nothing was uploaded twice");
    assert.ok(b.canSubmit());
    const done = await b.submit();
    assert.ok(done.propertyId && done.trackToken);
    const rec = (await db.doc("caseInternal/" + done.propertyId).get()).data();
    assert.strictEqual(rec.photoCount, 3); assert.strictEqual(rec.price, 7500000); assert.strictEqual(rec.contactName, "Synthetic Person");
    assert.strictEqual((await db.collection("caseInternal").get()).size, 1);
    assert.strictEqual((await H.listFiles("casePhotos/" + done.propertyId + "/")).length, 3);
    assert.deepStrictEqual(await H.listFiles("caseUploads/"), []);
  });

  it("R2 a failed upload is retried in the SAME slot (no gap, no duplicate); the failure does not lose the other photos or the fields", async () => {
    const store = mem(); const x = deps(store, A.extA, { failUploadOnce: new Set(["1"]) });
    const a = new Flow(x.d); fill(a);
    await a.addPhoto("d0", "t0");
    await assert.rejects(a.addPhoto("d1", "t1"), /synthetic network drop/);
    assert.strictEqual(a.photoCount(), 1); assert.strictEqual(a.state.nextSlot, 1);
    await a.addPhoto("d1", "t1"); // retry
    assert.deepStrictEqual(a.state.slots.map((s) => s.n), [0, 1]); assert.strictEqual(x.o.counts.uploads, 2);
    const done = await a.submit();
    assert.strictEqual((await db.doc("caseInternal/" + done.propertyId).get()).data().photoCount, 2);
  });

  it("R3 the submit WORKED but the answer was lost: the repeat (same page or after a refresh) gets the SAME case — no duplicate case, no second upload, nothing re-entered; after success a refresh shows the link without asking the server", async () => {
    const store = mem(); const x = deps(store, A.extA, { loseResponse: true });
    const a = new Flow(x.d); fill(a); await a.addPhoto("d0", "t0"); await a.addPhoto("d1", "t1");
    await assert.rejects(a.submit(), /answer never arrived/);
    assert.strictEqual((await db.collection("caseInternal").get()).size, 1, "the server did create it");
    assert.ok(!a.state.done, "the page does not know yet");
    assert.deepStrictEqual(await H.listFiles("caseUploads/"), [], "the server already removed the staging files");
    // refresh, then press submit again
    const b = new Flow(x.d);
    assert.strictEqual(b.photoCount(), 2, "the form still says the photos are uploaded (it does not need the staging files again)");
    const done = await b.submit();
    assert.strictEqual(done.alreadyExisted, true);
    assert.strictEqual((await db.collection("caseInternal").get()).size, 1); assert.strictEqual(x.o.counts.uploads, 2); assert.strictEqual((await db.collection("casePhotos").get()).size, 2);
    assert.strictEqual((await H.listFiles("casePhotos/" + done.propertyId + "/")).length, 2);
    // a third page load: the confirmation comes from the device, no server call
    const calls = x.o.counts.submits;
    const c = new Flow(x.d);
    assert.deepStrictEqual(c.state.done, { propertyId: done.propertyId, trackToken: done.trackToken, alreadyExisted: true });
    assert.strictEqual((await c.submit()).propertyId, done.propertyId); assert.strictEqual(x.o.counts.submits, calls);
    assert.strictEqual(c.state.slots.length, 0, "the finished form no longer holds photos"); assert.strictEqual(c.state.fields.description, "", "…or the typed details (only the contact is kept)");
    assert.strictEqual(c.state.fields.name, "Synthetic Person");
  });

  it("R4 a double click while the first submit is running sends ONE request", async () => {
    const store = mem(); const x = deps(store, A.extA);
    const a = new Flow(x.d); fill(a); await a.addPhoto("d0", "t0"); await a.addPhoto("d1", "t1");
    const [r1, r2] = await Promise.all([a.submit(), a.submit()]);
    assert.strictEqual(x.o.counts.submits, 1); assert.ok(r1 && r1.propertyId); assert.ok(r2 === null || r2.propertyId === r1.propertyId);
    assert.strictEqual((await db.collection("caseInternal").get()).size, 1);
  });

  it("R5 a server refusal keeps everything for the retry; an incomplete form is refused before any request", async () => {
    const store = mem(); const x = deps(store, A.extA);
    const a = new Flow(x.d); fill(a, { price: "0" }); await a.addPhoto("d0", "t0"); await a.addPhoto("d1", "t1");
    await assert.rejects(a.submit(), (e) => e.code === "form_incomplete"); assert.strictEqual(x.o.counts.submits, 0);
    a.setField("price", "7500000"); a.setField("txnType", "buy"); // the server refuses an unknown transaction type
    await assert.rejects(a.submit(), (e) => e.code === "invalid-argument" || /txn|bad_/.test(String(e.message)));
    assert.strictEqual(a.photoCount(), 2); assert.strictEqual(a.state.fields.description.length > 0, true);
    a.setField("txnType", "sale");
    assert.ok((await a.submit()).propertyId);
    assert.strictEqual((await db.collection("caseInternal").get()).size, 1);
  });

  it("R6 land needs 1 photo, a house 2 (Photo Standard v1): the form lets a land plot with 1 photo through, not a house", async () => {
    const store = mem(); const x = deps(store, A.extA);
    const a = new Flow(x.d); fill(a, { type: "land" }); await a.addPhoto("d0", "t0");
    assert.ok(a.canSubmit(), "land: 1 is enough");
    a.setField("type", "house"); assert.ok(!a.canSubmit(), "house: 1 is not");
    await a.addPhoto("d1", "t1"); assert.ok(a.canSubmit());
  });

  it("R7 the browser identity changed (storage cleared / another account): the old staged photos can not be used — the form says so, keeps the typed data, asks for new photos, and a stale key is not reused", async () => {
    const store = mem(); const x = deps(store, A.extA);
    const a = new Flow(x.d); fill(a); await a.addPhoto("d0", "t0"); await a.addPhoto("d1", "t1");
    const oldKey = a.state.key;
    x.o.uid = A.extB.uid;
    const b = new Flow(Object.assign({}, x.d));
    await b.addPhoto("n0", "t");
    assert.ok(b.state.lostPhotos); assert.notStrictEqual(b.state.key, oldKey); assert.strictEqual(b.photoCount(), 1, "only the new photo counts");
    assert.strictEqual(b.state.fields.description.length > 0, true, "typed details are kept");
  });

  it("R8 photo slots are limited to 30 per submission and never reused", async () => {
    const store = mem(); const x = deps(store, A.extA);
    const a = new Flow(x.d);
    for (let i = 0; i < 30; i++) await a.addPhoto("d" + i, "t");
    await assert.rejects(a.addPhoto("d31", "t"), (e) => e.code === "photo_slots_used");
    a.removePhoto(a.state.slots[0].path); assert.strictEqual(a.photoCount(), 29);
    await assert.rejects(a.addPhoto("again", "t"), (e) => e.code === "photo_slots_used", "a removed photo's slot is not given out again");
  });

  // ── chat draft ↔ form ───────────────────────────────────────────────────
  it("R9 the chat draft pre-fills the form (type, sale/rent, price, pin) — never over what the customer typed — and the customer's edits go back to the draft with Staff edits protected", async () => {
    const uid = A.extA.uid;
    await db.doc("propertyDrafts/draft__" + uid).set({ ownerUid: uid, status: "draft", createdAt: 1, updatedAt: 1, fields: {
      type: { value: "villa", source: "ai_chat", updatedAt: 1 }, status: { value: "rent", source: "ai_chat", updatedAt: 1 },
      price: { value: 45000, source: "ai_chat", updatedAt: 1 }, coordsRaw: { value: "12.558940,99.909039", source: "staff_edit", updatedAt: 2 },
      bedrooms: { value: 3, source: "ai_chat", updatedAt: 1 } } });
    const store = mem(); const x = deps(store, A.extA);
    const a = new Flow(x.d);
    a.setField("price", "50000"); // typed by the customer BEFORE the draft arrived
    const applied = await a.prefillFromDraft();
    assert.deepStrictEqual(applied.sort(), ["coords", "txnType", "type"].sort());
    assert.strictEqual(a.state.fields.price, "50000", "the customer's own value wins"); assert.strictEqual(a.state.fields.txnType, "rent"); assert.strictEqual(a.state.fields.type, "villa"); assert.strictEqual(a.state.fields.coords, "12.558940,99.909039");
    assert.deepStrictEqual(a.state.prefilled.sort(), ["coords", "txnType", "type"].sort());
    // the customer changes the pin (staff_edit in the draft → protected) and the price (ai_chat → the customer may correct it)
    a.setField("coords", "12.500000,99.900000"); a.setField("price", "52000"); a.setField("type", "house");
    await a.saveToDraft();
    const d = (await db.doc("propertyDrafts/draft__" + uid).get()).data().fields;
    assert.strictEqual(d.price.value, 52000); assert.strictEqual(d.price.source, "customer_edit", "provenance is decided by the server");
    assert.strictEqual(d.type.value, "house"); assert.strictEqual(d.coordsRaw.value, "12.558940,99.909039", "a Staff value is not overwritten by the customer's draft edit");
    assert.strictEqual(d.coordsRaw.source, "staff_edit"); assert.strictEqual(d.bedrooms.value, 3, "fields the form does not know are untouched");
    // a refreshed form keeps what the customer typed (no re-prefill over it)
    const b = new Flow(x.d); assert.strictEqual(await b.prefillFromDraft().then((r) => r.length), 0); assert.strictEqual(b.state.fields.price, "52000");
  });

  it("R10 after the draft became a Case, draft edits are refused by the server (post-submit changes are Staff-governed) and the form does not break", async () => {
    const store = mem(); const x = deps(store, A.extA);
    const a = new Flow(x.d); fill(a); await a.addPhoto("d0", "t0"); await a.addPhoto("d1", "t1");
    await db.doc("propertyDrafts/draft__" + A.extA.uid).set({ ownerUid: A.extA.uid, status: "draft", fields: {} });
    const done = await a.submit();
    assert.strictEqual((await db.doc("propertyDrafts/draft__" + A.extA.uid).get()).data().caseId, done.propertyId);
    a.setField("price", "1"); const r = await a.saveToDraft();
    assert.ok(r === null || r.updated === false);
  });
});
