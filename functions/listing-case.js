// LISTING-E2E-01 — the ONE server-side path that turns a submission (with photos) into a Property
// Case, the ONE server-side step that publishes it, the step that takes it down again, and the
// token-checked view the customer's tracking page uses.
//
// It EXTENDS the existing model instead of replacing it: the Case is the same `properties/{id}`
// record the intake workflow, Staff Workspace and Listing Approvals already use (source
// "owner_submission", listingStatus "pending", reviewStatus "submitted", workflowVersion "intake_v1").
// What changes is WHERE internal data lives:
//
//   properties/{id}      publicly readable by design → only fields that may be public
//   caseInternal/{id}    contact, owner, trackToken, assignment, verifications, approval attribution…
//                        (functions/case-fields.js) → read: Staff/Owner + the submitter; write: Staff/Owner
//   casePhotos/{id}-{n}  private photo records (+ Storage casePhotos/{id}/{n}.webp, team-only)
//   propertyPhotos/*     PUBLIC photo records/files — created ONLY at publish, removed again at take-down
//
// Four different people are kept apart (never assumed to be the same person):
//   submittedBy*      who typed it in (role derived HERE from the verified token)
//   propertyOwner*    who really owns the property (as stated; the relation is recorded, never trusted)
//   assignedTo*       who is responsible for the work (existing assignCase())
//   approvedBy*       who published it (Owner only, written by this module)
"use strict";

const nodeCrypto = require("crypto");
const { PHOTO_STANDARD, photoStandardFor } = require("./photo-standard");
const { splitCaseFields } = require("./case-fields");

// The original hard-coded Owner uid (same value as firestore.rules / storage.rules).
const OWNER_UID = "n7TZKSBscPXE1kRU8WzYpsqJh2g2";
const LISTING_DURATION_DAYS = 30; // same as firebase-client.js
const MAX_PHOTOS = 30;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024; // same cap as storage.rules
const TYPES = ["villa", "house", "townhouse", "condo", "land", "commercial"];
const AREAS = ["hua-hin", "pranburi", "cha-am"];
const LANGS = ["th", "en", "zh", "ru", "de", "no", "fr", "it"];
const RELATIONS = ["self", "representative", "website"];
const KEY_RE = /^[A-Za-z0-9_-]{16,64}$/;

const isStr = (v) => typeof v === "string";
const clean = (v, max) => (isStr(v) ? v.trim().slice(0, max) : "");
const bad = (HttpsError, reason, msg) => new HttpsError("invalid-argument", msg || reason, { reason });

function usableContact(raw) {
  const s = clean(raw, 160);
  if (s.length < 5) return false;
  if (s.replace(/[^0-9]/g, "").length >= 8) return true;
  if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(s)) return true;
  return /(line|ไลน์)\s*[:：]?\s*\S{3,}/i.test(s);
}

// Deterministic: the same (uid, submissionKey) always names the same Case → a double click, a
// refresh or a retry (even two at the same instant) can only ever resolve to ONE record.
// Never derived from a name or a phone number.
function caseIdFor(uid, key) {
  return "own-" + nodeCrypto.createHash("sha256").update(uid + ":" + key).digest("hex").slice(0, 20);
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a || "")), y = Buffer.from(String(b || ""));
  return x.length === y.length && x.length > 0 && nodeCrypto.timingSafeEqual(x, y);
}

// ── identity ──────────────────────────────────────────────────────────────
// role ∈ owner | staff | agent | external, from the verified token + Firestore. The request body
// can never name a role. (Anonymous sign-in is always "external".)
async function resolveActor(admin, request, HttpsError) {
  const a = request && request.auth;
  if (!a || !a.uid) throw new HttpsError("unauthenticated", "Sign-in required.");
  const provider = a.token && a.token.firebase && a.token.firebase.sign_in_provider;
  const anonymous = provider === "anonymous";
  const out = { uid: a.uid, email: (a.token && a.token.email) || "", anonymous, role: "external", label: "" };
  if (anonymous) return out;
  const db = admin.firestore();
  if (a.uid === OWNER_UID) { out.role = "owner"; return out; }
  const adm = await db.collection("adminUsers").doc(a.uid).get();
  if (adm.exists && adm.data() && (adm.data().role === "owner" || adm.data().role === "staff")) {
    out.role = adm.data().role; out.label = clean(adm.data().displayName || adm.data().name, 120); return out;
  }
  const lst = await db.collection("listers").doc(a.uid).get();
  if (lst.exists) { out.role = "agent"; out.label = clean((lst.data() || {}).displayName || (lst.data() || {}).name, 120); }
  return out;
}

function validateSubmission(data, actor, HttpsError) {
  const d = data || {};
  const key = d.submissionKey;
  if (!isStr(key) || !KEY_RE.test(key)) throw bad(HttpsError, "bad_submission_key", "submissionKey must be 16-64 chars [A-Za-z0-9_-].");
  if (d.txnType !== "sale" && d.txnType !== "rent") throw bad(HttpsError, "bad_txn_type");
  if (!TYPES.includes(d.type)) throw bad(HttpsError, "bad_type");
  const condition = d.condition === "new" || d.condition === "resale" ? d.condition : "resale";
  const price = Number(d.price);
  if (!Number.isFinite(price) || price <= 0 || price > 100000000000) throw bad(HttpsError, "bad_price");
  const description = clean(d.description, 4000);
  if (!description) throw bad(HttpsError, "missing_description");
  const area = d.area === undefined || d.area === "" || d.area === null ? "" : d.area;
  if (area && !AREAS.includes(area)) throw bad(HttpsError, "bad_area");
  const coordsRaw = clean(d.coordsRaw, 200);
  const s = d.submitter || {};
  const submitter = { name: clean(s.name, 120), phone: clean(s.phone, 40), email: clean(s.email, 160) };
  if (submitter.name.length < 2) throw bad(HttpsError, "missing_submitter_name");
  if (!usableContact(submitter.phone) && !usableContact(submitter.email)) throw bad(HttpsError, "missing_submitter_contact");
  const po = d.propertyOwner || {};
  let relation = RELATIONS.includes(po.relation) ? po.relation : (actor.role === "external" ? "self" : actor.role === "agent" ? "representative" : "website");
  // The relation is a STATEMENT recorded for Staff to verify — never an authority. Only team
  // members may file "in the website's name"; nobody else can claim to be the site.
  if (relation === "website" && actor.role !== "owner" && actor.role !== "staff") relation = actor.role === "agent" ? "representative" : "self";
  const propertyOwner = { relation, name: clean(po.name, 120), contact: clean(po.contact, 160) };
  const language = LANGS.includes(d.language) ? d.language : "th";
  const photos = Array.isArray(d.photos) ? d.photos : [];
  if (photos.length > MAX_PHOTOS) throw bad(HttpsError, "too_many_photos");
  const prefix = "caseUploads/" + actor.uid + "/" + key + "/";
  const seen = new Set();
  const photoPaths = photos.map((p) => (p && isStr(p.path) ? p.path : ""));
  photoPaths.forEach((p) => {
    // exactly <prefix><index>.webp : no traversal, nothing outside the caller's own folder
    if (!p.startsWith(prefix) || !/^[0-9]{1,2}\.webp$/.test(p.slice(prefix.length)) || seen.has(p)) throw bad(HttpsError, "bad_photo_path");
    seen.add(p);
  });
  let ownershipDocPath = "";
  if (d.ownershipDocPath) {
    if (!isStr(d.ownershipDocPath) || d.ownershipDocPath !== prefix + "doc.webp") throw bad(HttpsError, "bad_document_path");
    ownershipDocPath = d.ownershipDocPath;
  }
  return { key, txnType: d.txnType, type: d.type, condition, price, description, area, coordsRaw, submitter, propertyOwner, language, photoPaths, ownershipDocPath };
}

// ── storage helpers (Admin SDK) ─────────────────────────────────────────────
function bucketFor(admin) {
  let name = process.env.LISTING_STORAGE_BUCKET || "";
  if (!name) { try { name = (JSON.parse(process.env.FIREBASE_CONFIG || "{}") || {}).storageBucket || ""; } catch (e) { name = ""; } }
  if (!name) name = (process.env.GCLOUD_PROJECT || "") + ".firebasestorage.app";
  return admin.storage().bucket(name);
}
function downloadUrl(bucket, path, token) {
  const host = process.env.FIREBASE_STORAGE_EMULATOR_HOST;
  const base = host ? "http://" + host : "https://firebasestorage.googleapis.com";
  return base + "/v0/b/" + bucket.name + "/o/" + encodeURIComponent(path) + "?alt=media&token=" + token;
}
async function assertImageObject(bucket, path, HttpsError) {
  const f = bucket.file(path);
  let md;
  try { [md] = await f.getMetadata(); } catch (e) { throw new HttpsError("failed-precondition", "photo_missing", { reason: "photo_missing", path }); }
  const size = Number(md.size);
  if (!Number.isFinite(size) || size <= 0 || size > MAX_PHOTO_BYTES) throw new HttpsError("failed-precondition", "photo_bad_size", { reason: "photo_bad_size", path });
  if (md.contentType && !/^image\//.test(md.contentType)) throw new HttpsError("failed-precondition", "photo_not_image", { reason: "photo_not_image", path });
  return f;
}
// copy src → dst (deterministic destination → retry-safe) with a FRESH download token
async function copyWithToken(bucket, src, dst) {
  const dstFile = bucket.file(dst);
  await bucket.file(src).copy(dstFile);
  const token = nodeCrypto.randomUUID();
  await dstFile.setMetadata({ metadata: { firebaseStorageDownloadTokens: token } });
  return downloadUrl(bucket, dst, token);
}
async function deleteIfExists(bucket, path) { try { await bucket.file(path).delete(); } catch (e) { /* already gone */ } }

const okResult = (id, c, extra) => Object.assign({ created: false, alreadyExisted: true, propertyId: id, trackToken: (c && c.trackToken) || "", photoCount: Number(c && c.photoCount) || 0 }, extra || {});

// ── submitListingCase ──────────────────────────────────────────────────────
async function submitListingCase({ admin, HttpsError, request }) {
  const actor = await resolveActor(admin, request, HttpsError);
  const v = validateSubmission(request.data, actor, HttpsError);
  const db = admin.firestore();
  const caseId = caseIdFor(actor.uid, v.key);
  const caseRef = db.collection("properties").doc(caseId);
  const intRef = db.collection("caseInternal").doc(caseId);
  const draftId = "draft__" + actor.uid;
  const draftRef = db.collection("propertyDrafts").doc(draftId);

  // 1) The same submission again (double click / refresh / retry) → the existing Case.
  const [exSnap, exInt] = await Promise.all([caseRef.get(), intRef.get()]);
  if (exSnap.exists) {
    const ci = exInt.exists ? (exInt.data() || {}) : {};
    if (ci.submittedByUid !== actor.uid) throw new HttpsError("already-exists", "case_id_taken", { reason: "case_id_taken" });
    return okResult(caseId, Object.assign({}, exSnap.data(), ci));
  }

  // 2) One draft, one Case — bound by the draft's own id (draft__<uid>), never by a name or a phone.
  //    If the chat already turned this visitor's draft into a Case, no second Case is opened.
  const draftSnap = await draftRef.get();
  const draft = draftSnap.exists ? (draftSnap.data() || {}) : null;
  if (draft && draft.caseId && String(draft.caseId) !== caseId) {
    const [o, oi] = await Promise.all([db.collection("properties").doc(String(draft.caseId)).get(), db.collection("caseInternal").doc(String(draft.caseId)).get()]);
    const od = Object.assign({}, o.exists ? o.data() : {}, oi.exists ? oi.data() : {});
    if (o.exists && (od.submittedByUid === actor.uid || od.receptionVisitorId === actor.uid)) {
      return okResult(String(draft.caseId), od, { linkedFromDraft: true });
    }
  }

  // 3) Photo standard (server-enforced; the page only mirrors it).
  const std = photoStandardFor(v.type);
  if (v.photoPaths.length < std.min) throw new HttpsError("failed-precondition", "photos_below_minimum", { reason: "photos_below_minimum", min: std.min, have: v.photoPaths.length });

  // 4) Verify every photo is a stored image in the caller's own staging folder; copy to the private per-case folder.
  const bucket = bucketFor(admin);
  const photoDocs = [];
  for (let i = 0; i < v.photoPaths.length; i++) {
    await assertImageObject(bucket, v.photoPaths[i], HttpsError);
    const dst = "casePhotos/" + caseId + "/" + i + ".webp";
    photoDocs.push({ index: i, storagePath: dst, dataUrl: await copyWithToken(bucket, v.photoPaths[i], dst) });
  }
  let ownershipDocStoragePath = "";
  if (v.ownershipDocPath) {
    await assertImageObject(bucket, v.ownershipDocPath, HttpsError);
    ownershipDocStoragePath = "caseAttachments/" + caseId + "/ownership-document.webp"; // existing team-only path
    await bucket.file(v.ownershipDocPath).copy(bucket.file(ownershipDocStoragePath));
  }

  // 5) Create the Case (public-safe), its internal record and its private photo records atomically.
  const now = Date.now();
  const trackToken = nodeCrypto.randomBytes(24).toString("hex");
  const caseSourceByRole = { external: "owner_form", agent: "agent_form", staff: "staff_form", owner: "owner_form" };
  const coordsOk = /^\s*-?\d{1,3}(\.\d+)?\s*,\s*-?\d{1,3}(\.\d+)?\s*$/.test(v.coordsRaw);
  const flat = {
    source: "owner_submission", // capability key in firestore.rules and ~15 behaviours of Listing Approvals
    caseSource: caseSourceByRole[actor.role] || "owner_form",
    listingStatus: "pending", reviewStatus: "submitted", workflowVersion: "intake_v1", internalSplit: true,
    status: v.txnType, type: v.type, condition: v.condition, price: v.price, description: v.description,
    locationProvided: coordsOk, locationFollowUpNeeded: !coordsOk,
    photoCount: photoDocs.length, photoStandard: { min: std.min, target: std.target },
    submittedAt: now, isDraft: false,
    ...(v.area ? { area: v.area } : {}),
    ...(actor.role === "agent" ? { listerId: actor.uid } : {}),
    // ── internal (split out below) ──
    coordsRaw: v.coordsRaw,
    contactName: v.submitter.name, contactPhone: v.submitter.phone, contactEmail: v.submitter.email,
    submittedByRole: actor.role, submittedByUid: actor.uid, submittedByLabel: actor.label || v.submitter.name,
    propertyOwnerRelation: v.propertyOwner.relation, ownerContact: v.propertyOwner.contact,
    ...(v.propertyOwner.name ? { ownerName: v.propertyOwner.name } : {}),
    ...(ownershipDocStoragePath ? { ownershipDocPath: ownershipDocStoragePath } : {}),
    submissionKey: v.key, customerLanguage: v.language, trackToken,
    ...(draft ? { draftId } : {}),
  };
  const { pub, priv } = splitCaseFields(flat);
  try {
    await db.runTransaction(async (t) => {
      const again = await t.get(caseRef);
      if (again.exists) throw new HttpsError("aborted", "concurrent_duplicate", { reason: "concurrent_duplicate" });
      t.create(caseRef, pub);
      t.create(intRef, Object.assign({ propertyId: caseId, createdAt: now }, priv));
      photoDocs.forEach((p) => t.set(db.collection("casePhotos").doc(caseId + "-" + p.index), {
        propertyId: caseId, index: p.index, dataUrl: p.dataUrl, storagePath: p.storagePath,
        uploadedByUid: actor.uid, uploadedByRole: actor.role, uploadedAt: now,
      }));
      if (draft) t.set(draftRef, { caseId, status: "submitted", submittedAt: now, updatedAt: now }, { merge: true });
    });
  } catch (e) {
    // A parallel identical request may have won the race: same uid + key → same id → return its Case.
    const [won, wonInt] = await Promise.all([caseRef.get(), intRef.get()]);
    if (won.exists && wonInt.exists && (wonInt.data() || {}).submittedByUid === actor.uid) return okResult(caseId, Object.assign({}, won.data(), wonInt.data()));
    console.error("submitListingCase failed", caseId, (e && e.message) || String(e));
    throw e instanceof HttpsError ? e : new HttpsError("internal", "ไม่สามารถบันทึกเคสได้ กรุณาลองอีกครั้ง");
  }
  try { // best-effort audit trail; never blocks a submission that already succeeded
    await db.collection("activityLog").add({ type: "case_submitted", propertyId: caseId, byUid: actor.uid, byRole: actor.role, byEmail: actor.email || "", at: now, summary: "ส่งเรื่อง " + caseId + " (" + actor.role + ")" });
  } catch (e) { console.warn("activityLog (case_submitted) not written", caseId); }
  return { created: true, alreadyExisted: false, propertyId: caseId, trackToken, photoCount: photoDocs.length };
}

// ── publish / take down (Owner only) ───────────────────────────────────────
const TYPE_TH = { villa: "พูลวิลล่า", house: "บ้านเดี่ยว", townhouse: "ทาวน์เฮาส์", condo: "คอนโด", land: "ที่ดิน", commercial: "เชิงพาณิชย์" };
const TYPE_EN = { villa: "Pool Villa", house: "House", townhouse: "Townhouse", condo: "Condo", land: "Land", commercial: "Commercial" };
const AREA_TH = { "hua-hin": "หัวหิน", pranburi: "ปราณบุรี", "cha-am": "ชะอำ" };
const AREA_EN = { "hua-hin": "Hua Hin", pranburi: "Pranburi", "cha-am": "Cha-am" };

async function requireOwner(admin, HttpsError, request) {
  const actor = await resolveActor(admin, request, HttpsError);
  if (actor.role !== "owner") throw new HttpsError("permission-denied", "Only the Owner can do this.");
  return actor;
}
function requireId(HttpsError, request) {
  const id = request.data && request.data.propertyId;
  if (!isStr(id) || !id || id.length > 200 || id.includes("/")) throw bad(HttpsError, "bad_property_id");
  return id;
}

async function publishListingCase({ admin, HttpsError, request }) {
  const actor = await requireOwner(admin, HttpsError, request);
  const id = requireId(HttpsError, request);
  const db = admin.firestore();
  const ref = db.collection("properties").doc(id), intRef = db.collection("caseInternal").doc(id);
  const [snap, intSnap] = await Promise.all([ref.get(), intRef.get()]);
  if (!snap.exists) throw new HttpsError("not-found", "case_not_found", { reason: "case_not_found" });
  const c = snap.data() || {}, ci = intSnap.exists ? (intSnap.data() || {}) : {};
  if (c.listingStatus === "live") return { published: false, alreadyLive: true, propertyId: id };
  if (!["pending", "pending_owner", "offline"].includes(c.listingStatus)) throw new HttpsError("failed-precondition", "not_publishable_status", { reason: "not_publishable_status", status: c.listingStatus || null });
  // A Case that came through intake must have been decided by the Owner first, unless the Owner is
  // publishing their OWN submission (the approval path is then recorded as such).
  let approvalPath;
  if (c.source === "owner_submission") {
    if (c.reviewStatus === "approved") approvalPath = "intake_approved";
    else if (ci.submittedByRole === "owner") approvalPath = "owner_direct";
    else throw new HttpsError("failed-precondition", "intake_not_approved", { reason: "intake_not_approved", reviewStatus: c.reviewStatus || null });
  } else approvalPath = "owner_listing_approval";

  const type = TYPES.includes(c.type) ? c.type : "house";
  const std = photoStandardFor(type);
  const bucket = bucketFor(admin);
  const priv = (await db.collection("casePhotos").where("propertyId", "==", id).get()).docs.map((d) => d.data()).sort((a, b) => a.index - b.index);
  const legacyPub = (await db.collection("propertyPhotos").where("propertyId", "==", id).get()).docs.map((d) => d.data()).sort((a, b) => (a.index || 0) - (b.index || 0));
  const have = Math.max(priv.length, legacyPub.length);
  if (have < std.min) throw new HttpsError("failed-precondition", "photos_below_minimum", { reason: "photos_below_minimum", min: std.min, have });

  const published = [];
  for (const p of priv) published.push({ index: p.index, dataUrl: await copyWithToken(bucket, p.storagePath, "propertyPhotos/" + id + "-" + p.index + ".webp") });
  const finalPhotos = published.length ? published : legacyPub.map((p) => ({ index: p.index || 0, dataUrl: p.dataUrl }));
  const now = Date.now();
  const area = c.area && AREA_TH[c.area] ? c.area : "";
  const title = c.title && typeof c.title === "object" ? c.title : {
    th: (TYPE_TH[type] || "") + (area ? AREA_TH[area] : "") + (c.status === "rent" ? " ให้เช่า" : " ขาย"),
    en: (TYPE_EN[type] || "") + (area ? " " + AREA_EN[area] : "") + (c.status === "rent" ? " for rent" : " for sale"),
  };
  await db.runTransaction(async (t) => {
    const cur = await t.get(ref);
    const cd = cur.data() || {};
    if (cd.listingStatus === "live") return; // a parallel publish already did it
    if (!["pending", "pending_owner", "offline"].includes(cd.listingStatus)) throw new HttpsError("failed-precondition", "not_publishable_status", { reason: "not_publishable_status" });
    if (published.length) finalPhotos.forEach((p) => t.set(db.collection("propertyPhotos").doc(id + "-" + p.index), { propertyId: id, index: p.index, dataUrl: p.dataUrl, publishedAt: now, publishedByUid: actor.uid }));
    t.update(ref, {
      listingStatus: "live", publishedAt: now, expiresAt: now + LISTING_DURATION_DAYS * 86400000, approvedAt: now,
      expiredAt: null, photosDeletedAt: null, offlineAt: null, isDraft: false, title,
      photos: finalPhotos.map((p) => ({ label: "Photo " + (p.index + 1) })), publishedPhotoCount: finalPhotos.length,
    });
    const attribution = { approvedByUid: actor.uid, approvedByEmail: actor.email || "", approvedByRole: "owner", approvalPath, offlineReason: null };
    if (intSnap.exists) t.update(intRef, attribution); else t.set(intRef, Object.assign({ propertyId: id, createdAt: now }, attribution), { merge: true });
  });
  try {
    await db.collection("activityLog").add({ type: "listing_published", propertyId: id, byUid: actor.uid, byRole: "owner", byEmail: actor.email || "", approvalPath, at: now, summary: "เผยแพร่ประกาศ " + id });
  } catch (e) { console.warn("activityLog (listing_published) not written", id); }
  return { published: true, alreadyLive: false, propertyId: id, photoCount: finalPhotos.length, approvalPath };
}

// Take a published Case down. The PUBLIC copies are physically removed (files and records) — hiding the
// listing is not enough, because a photo URL keeps working after the page stops linking to it. The
// private originals stay, so the Owner can publish again (new copies, new tokens).
async function unpublishListingCase({ admin, HttpsError, request }) {
  const actor = await requireOwner(admin, HttpsError, request);
  const id = requireId(HttpsError, request);
  const reason = clean(request.data && request.data.reason, 500);
  const db = admin.firestore();
  const ref = db.collection("properties").doc(id), intRef = db.collection("caseInternal").doc(id);
  const [snap, intSnap] = await Promise.all([ref.get(), intRef.get()]);
  if (!snap.exists) throw new HttpsError("not-found", "case_not_found", { reason: "case_not_found" });
  const c = snap.data() || {};
  if (c.listingStatus !== "live") return { unpublished: false, propertyId: id, status: c.listingStatus || null };
  const now = Date.now();
  // status first: from this write on, nothing public links to the listing
  await ref.update({ listingStatus: "offline", offlineAt: now });
  if (intSnap.exists) await intRef.update({ offlineReason: reason || null, offlineByUid: actor.uid }); else await intRef.set({ propertyId: id, offlineReason: reason || null, offlineByUid: actor.uid }, { merge: true });
  const bucket = bucketFor(admin);
  const pubDocs = (await db.collection("propertyPhotos").where("propertyId", "==", id).get()).docs;
  let removed = 0;
  for (const d of pubDocs) {
    const data = d.data() || {};
    if (!data.publishedByUid) continue; // only copies THIS flow published; legacy member-uploaded photos are not touched
    await deleteIfExists(bucket, "propertyPhotos/" + d.id + ".webp");
    await d.ref.delete();
    removed++;
  }
  try {
    await db.collection("activityLog").add({ type: "listing_unpublished", propertyId: id, byUid: actor.uid, byRole: "owner", byEmail: actor.email || "", at: now, summary: "ถอนประกาศ " + id });
  } catch (e) { console.warn("activityLog (listing_unpublished) not written", id); }
  return { unpublished: true, propertyId: id, removedPublicPhotos: removed };
}

// ── trackListingCase — the customer's token-checked view (no account, no public read) ─────────
// The token is the whole authorisation. Not found and wrong token look identical.
async function trackListingCase({ admin, HttpsError, request }) {
  const d = request.data || {};
  const id = d.id, token = d.token;
  const denied = () => new HttpsError("permission-denied", "not_available");
  if (!isStr(id) || !id || id.length > 200 || id.includes("/") || !isStr(token) || token.length < 20 || token.length > 200) throw denied();
  const db = admin.firestore();
  const intRef = db.collection("caseInternal").doc(id);
  const [snap, intSnap] = await Promise.all([db.collection("properties").doc(id).get(), intRef.get()]);
  if (!snap.exists || !intSnap.exists) throw denied();
  const ci = intSnap.data() || {};
  if (!safeEqual(ci.trackToken, token)) throw denied();
  const c = snap.data() || {};
  const action = d.action || "view";
  const now = Date.now();
  if (action === "responded") {
    const message = clean(d.message, 4000);
    if (!message) throw bad(HttpsError, "missing_message");
    await intRef.update({ infoResponseMessage: message, infoResponseAt: now, infoResponseStatus: "responded", lastCustomerMessageAt: now });
  } else if (action === "language") {
    if (!LANGS.includes(d.lang)) throw bad(HttpsError, "bad_language");
    if (ci.customerLanguageConfirmed !== true) await intRef.update({ customerLanguage: d.lang, customerLanguageConfirmed: true, customerLanguageSource: "message_detected" });
  } else if (action === "read") {
    await intRef.update({ customerLastReadAt: now });
  } else if (action !== "view") throw bad(HttpsError, "bad_action");
  const fresh = action === "view" ? ci : (await intRef.get()).data() || {};
  const reviewReturn = fresh.reviewReturn && typeof fresh.reviewReturn === "object" ? { reason: String(fresh.reviewReturn.reason || "").slice(0, 1000) } : null;
  // exactly what the customer's page needs — no internal ids, emails, staff names or secrets
  return {
    id, type: c.type || "", status: c.status || "", listingStatus: c.listingStatus || "", reviewStatus: c.reviewStatus || "submitted",
    submittedAt: c.submittedAt || null, publicPropertyCode: c.publicPropertyCode || "", photoCount: Number(c.photoCount) || 0,
    contactName: fresh.contactName || "", customerLanguage: fresh.customerLanguage || "th", customerLanguageConfirmed: fresh.customerLanguageConfirmed === true,
    infoRequestMessage: fresh.infoRequestMessage || "", infoRequestAt: fresh.infoRequestAt || null,
    infoResponseMessage: fresh.infoResponseMessage || "", infoResponseAt: fresh.infoResponseAt || null, reviewReturn,
  };
}

module.exports = { submitListingCase, publishListingCase, unpublishListingCase, trackListingCase, resolveActor, caseIdFor, validateSubmission, PHOTO_STANDARD, OWNER_UID, TYPES, MAX_PHOTOS };
