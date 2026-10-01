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
const { projectPublic, publicTextProblems } = require("./case-fields");
const { missingForSubmit, usableContact, COMMERCIAL_SUBTYPES } = require("./submission-checklist");

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
  const condition = d.condition === "new" || d.condition === "resale" ? d.condition : "resale";
  const priceMode = d.priceMode === "appraisal" ? "appraisal" : "fixed";
  const price = priceMode === "appraisal" ? null : Number(d.price);
  const description = clean(d.description, 4000); // optional: not part of the minimum to submit
  const area = d.area === undefined || d.area === "" || d.area === null ? "" : d.area;
  if (area && !AREAS.includes(area)) throw bad(HttpsError, "bad_area");
  const coordsRaw = clean(d.coordsRaw, 200);
  const commercialSubtype = d.commercialSubtype === undefined || d.commercialSubtype === null || d.commercialSubtype === "" ? "" : d.commercialSubtype;
  if (commercialSubtype && !COMMERCIAL_SUBTYPES.includes(commercialSubtype)) throw bad(HttpsError, "bad_commercial_subtype");
  const s = d.submitter || {};
  const submitter = { name: clean(s.name, 120), phone: clean(s.phone, 40), email: clean(s.email, 160) };
  // THE one checklist (functions/submission-checklist.js, mirrored by the form). Photos are checked separately below (own error reason).
  const missing = missingForSubmit({ txnType: d.txnType, type: d.type, price, priceMode, area, coords: coordsRaw, commercialSubtype, name: submitter.name, phone: submitter.phone, email: submitter.email }, 999);
  const REASON = { intent: "bad_txn_type", type: "bad_type", commercialSubtype: "missing_commercial_subtype", price: "bad_price", location: "missing_location", contactName: "missing_submitter_name", contact: "missing_submitter_contact" };
  if (missing.length) throw new HttpsError("invalid-argument", REASON[missing[0]] || missing[0], { reason: REASON[missing[0]] || missing[0], missing });
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
  return { key, txnType: d.txnType, type: d.type, condition, price, priceMode, commercialSubtype, description, area, coordsRaw, submitter, propertyOwner, language, photoPaths, ownershipDocPath };
}

// ── TEST-PROJECT-ONLY guard ─────────────────────────────────────────────────
// LISTING-E2E-01 is deploy-ready for a TEST project only. If these functions are ever deployed to another project by
// mistake they refuse every call, so production behaviour cannot change until someone sets LISTING_E2E_ENABLED=1
// on purpose (a go-live decision that also requires the legacy-data migration — docs/listing-e2e/LEGACY-DATA-PLAN.md).
const TEST_PROJECT_RE = /^(huahin-chat-test-|huahin-listing-test-|demo-)/;
function isEnabled() {
  let pid = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "";
  if (!pid) { try { pid = (JSON.parse(process.env.FIREBASE_CONFIG || "{}") || {}).projectId || ""; } catch (e) { pid = ""; } }
  if (process.env.LISTING_E2E_ENABLED === "0") return false; // explicit off, even in a test project
  return process.env.LISTING_E2E_ENABLED === "1" || TEST_PROJECT_RE.test(pid);
}
function assertEnabled(HttpsError) {
  if (isEnabled()) return;
  throw new HttpsError("failed-precondition", "not_enabled", { reason: "not_enabled" });
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
// PRIVATE copy (pending review): NO download token. A tokenless object is governed only by storage.rules
// (team read), so a link cannot be passed around. The copy from a client-uploaded staging file would otherwise
// inherit the token the client SDK mints at upload time, so it is removed explicitly.
async function copyPrivate(bucket, src, dst) {
  const dstFile = bucket.file(dst);
  await bucket.file(src).copy(dstFile);
  await dstFile.setMetadata({ metadata: { firebaseStorageDownloadTokens: null } });
  return downloadUrl(bucket, dst, "").replace(/[?&]token=$/, "").replace(/&token=$/, "");
}

// ── the Case record ────────────────────────────────────────────────────────
// A Case lives in caseInternal/{id} (team-only). properties/{id} is NOT the Case any more: it is the public
// projection, created by publishListingCase from an explicit allow-list and deleted again on take-down. A pending,
// draft or offline Case therefore has no public document at all.
const casePhotoDocs = async (db, id) => (await db.collection("casePhotos").where("propertyId", "==", id).get()).docs.map((d) => d.data()).sort((a, b) => a.index - b.index);
const sigOf = (photos) => nodeCrypto.createHash("sha256").update(photos.map((p) => p.index + ":" + p.storagePath).join("|")).digest("hex");
const okResult = (id, c, extra) => Object.assign({ created: false, alreadyExisted: true, propertyId: id, trackToken: (c && c.trackToken) || "", photoCount: Number(c && c.photoCount) || 0 }, extra || {});
// test seam: lets the fault/concurrency tests run code at a precise point (never set in production)
const hooks = {};
async function hook(name, ctx) { if (typeof hooks[name] === "function") await hooks[name](ctx); }

// ── submitListingCase ──────────────────────────────────────────────────────
async function submitListingCase({ admin, HttpsError, request }) {
  assertEnabled(HttpsError);
  const actor = await resolveActor(admin, request, HttpsError);
  const v = validateSubmission(request.data, actor, HttpsError);
  const db = admin.firestore();
  let caseId = caseIdFor(actor.uid, v.key);
  let intRef = db.collection("caseInternal").doc(caseId);
  let completing = false, existingToken = ""; // true: the form completes a Case the chat already opened
  const draftId = "draft__" + actor.uid;
  const draftRef = db.collection("propertyDrafts").doc(draftId);

  // 1) The same submission again (double click / refresh / retry / lost response) → the existing Case. Nothing is touched.
  const exInt = await intRef.get();
  if (exInt.exists) {
    const ci = exInt.data() || {};
    if (ci.submittedByUid !== actor.uid) throw new HttpsError("already-exists", "case_id_taken", { reason: "case_id_taken" });
    return okResult(caseId, ci);
  }

  // 2) One draft, one Case — bound by the draft's own id (draft__<uid>), never by a name or a phone.
  const draftSnap = await draftRef.get();
  const draft = draftSnap.exists ? (draftSnap.data() || {}) : null;
  if (draft && draft.caseId && String(draft.caseId) !== caseId) {
    const oi = await db.collection("caseInternal").doc(String(draft.caseId)).get();
    const od = oi.exists ? (oi.data() || {}) : {};
    if (oi.exists && (od.submittedByUid === actor.uid || od.receptionVisitorId === actor.uid)) {
      if (od.formCompletedKey === v.key) return okResult(String(draft.caseId), od, { linkedFromDraft: true });
      // A lead the chat opened (no photos, no price yet) is COMPLETED by the form on the same Case.
      if (od.caseSource === "ai_assistant" && !od.formCompletedKey && od.listingStatus === "pending") {
        completing = true; existingToken = String(od.trackToken || ""); caseId = String(draft.caseId); intRef = oi.ref;
      } else return okResult(String(draft.caseId), od, { linkedFromDraft: true });
    }
  }

  // 3) Photo standard (server-enforced; the page only mirrors it).
  const std = photoStandardFor(v.type);
  if (v.photoPaths.length < std.min) throw new HttpsError("failed-precondition", "photos_below_minimum", { reason: "photos_below_minimum", min: std.min, have: v.photoPaths.length });

  // 4) Verify every photo is a stored image in the caller's own staging folder and copy it to a PRIVATE folder that belongs
  //    to THIS attempt only (casePhotos/<case>/a-<attempt>/<n>.webp). An attempt never writes to a path another attempt
  //    uses, so a competing or failed request can not alter the photos of the Case that won (see reconcile below).
  const bucket = bucketFor(admin);
  const attempt = "a-" + nodeCrypto.randomBytes(6).toString("hex");
  const attemptPrefix = "casePhotos/" + caseId + "/" + attempt + "/";
  const photoDocs = [];
  let ownershipDocStoragePath = "";
  // Removes exactly what THIS attempt created (its own photo prefix and its own ownership-document copy). A deletion that fails is reported, not hidden;
  // the leftover is found and removed by reconcileListingFiles (it is unreferenced and older than the grace period).
  const abandon = async () => {
    const failures = [];
    await deletePrefixSafe(bucket, attemptPrefix, failures);
    if (ownershipDocStoragePath) await safeDelete(bucket, ownershipDocStoragePath, failures);
    if (failures.length) console.warn("submitListingCase: could not remove", failures.length, "file(s) of an abandoned attempt", caseId);
  };
  try {
    for (let i = 0; i < v.photoPaths.length; i++) {
      await assertImageObject(bucket, v.photoPaths[i], HttpsError);
      const dst = attemptPrefix + i + ".webp";
      photoDocs.push({ index: i, storagePath: dst, dataUrl: await copyPrivate(bucket, v.photoPaths[i], dst) });
    }
    if (v.ownershipDocPath) {
      await assertImageObject(bucket, v.ownershipDocPath, HttpsError);
      ownershipDocStoragePath = "caseAttachments/" + caseId + "/ownership-" + attempt + ".webp"; // existing team-only area
      await copyPrivate(bucket, v.ownershipDocPath, ownershipDocStoragePath);
    }
    await hook("afterSubmitCopy", { caseId, attempt, actor });

    // 5) One transaction creates (or completes) the record. The first committed attempt wins.
    const now = Date.now();
    const trackToken = nodeCrypto.randomBytes(24).toString("hex");
    const caseSourceByRole = { external: "owner_form", agent: "agent_form", staff: "staff_form", owner: "owner_form" };
    const coordsOk = /^\s*-?\d{1,3}(\.\d+)?\s*,\s*-?\d{1,3}(\.\d+)?\s*$/.test(v.coordsRaw);
    const record = {
      propertyId: caseId, createdAt: now,
      source: "owner_submission", // capability key used by ~15 behaviours of Listing Approvals / Staff Workspace
      caseSource: caseSourceByRole[actor.role] || "owner_form",
      listingStatus: "pending", reviewStatus: "submitted", workflowVersion: "intake_v1", internalSplit: true,
      status: v.txnType, type: v.type, condition: v.condition, price: v.price, priceMode: v.priceMode, description: v.description,
      ...(v.commercialSubtype ? { commercialSubtype: v.commercialSubtype } : {}),
      locationProvided: coordsOk, locationFollowUpNeeded: !coordsOk,
      photoCount: photoDocs.length, photoStandard: { min: std.min, target: std.target },
      submittedAt: now, isDraft: false,
      ...(v.area ? { area: v.area } : {}),
      ...(actor.role === "agent" ? { listerId: actor.uid } : {}),
      coordsRaw: v.coordsRaw,
      contactName: v.submitter.name, contactPhone: v.submitter.phone, contactEmail: v.submitter.email,
      submittedByRole: actor.role, submittedByUid: actor.uid, submittedByLabel: actor.label || v.submitter.name,
      propertyOwnerRelation: v.propertyOwner.relation, ownerContact: v.propertyOwner.contact,
      ...(v.propertyOwner.name ? { ownerName: v.propertyOwner.name } : {}),
      ...(ownershipDocStoragePath ? { ownershipDocPath: ownershipDocStoragePath } : {}),
      submissionKey: v.key, customerLanguage: v.language, trackToken,
      ...(draft ? { draftId } : {}),
    };
    let lost = false;
    await db.runTransaction(async (t) => {
      lost = false;
      const cur = await t.get(intRef);
      if (completing) {
        if (!cur.exists || (cur.data() || {}).formCompletedKey) { lost = true; return; }
        // only what the form adds; the Case's identity, status, token, assignment and conversation link stay untouched
        const keep = ["status", "type", "condition", "price", "priceMode", "commercialSubtype", "description", "locationProvided", "locationFollowUpNeeded", "photoCount", "photoStandard", "area",
          "coordsRaw", "contactName", "contactPhone", "contactEmail", "propertyOwnerRelation", "ownerContact", "ownerName", "ownershipDocPath", "submissionKey", "customerLanguage"];
        const up = { formCompletedKey: v.key, formCompletedAt: now };
        keep.forEach((k) => { if (k in record) up[k] = record[k]; });
        t.update(intRef, up);
      } else {
        if (cur.exists) { lost = true; return; }
        t.create(intRef, record);
      }
      photoDocs.forEach((p) => t.set(db.collection("casePhotos").doc(caseId + "-" + p.index), {
        propertyId: caseId, index: p.index, dataUrl: p.dataUrl, storagePath: p.storagePath,
        uploadedByUid: actor.uid, uploadedByRole: actor.role, uploadedAt: now, attempt,
      }));
      if (draft) t.set(draftRef, { caseId, status: "submitted", submittedAt: now, updatedAt: now }, { merge: true });
    });
    if (lost) {
      // another attempt committed first: this attempt's files are removed, the winner's are untouched
      await abandon();
      const w = (await intRef.get()).data() || {};
      if (w.submittedByUid === actor.uid || w.receptionVisitorId === actor.uid) return okResult(caseId, w);
      throw new HttpsError("already-exists", "case_id_taken", { reason: "case_id_taken" });
    }
    // The submitter's staging area is no longer needed (client-minted tokens die with it); a retry returns the Case before looking at it.
    { const failures = []; await deletePrefixSafe(bucket, "caseUploads/" + actor.uid + "/" + v.key + "/", failures); if (failures.length) console.warn("submitListingCase: staging files not removed:", failures.length); }
    try { // best-effort audit trail; never blocks a submission that already succeeded
      await db.collection("activityLog").add({ type: "case_submitted", propertyId: caseId, byUid: actor.uid, byRole: actor.role, byEmail: actor.email || "", at: now, summary: "ส่งเรื่อง " + caseId + " (" + actor.role + ")" });
    } catch (e) { console.warn("activityLog (case_submitted) not written", caseId); }
    return { created: !completing, completedChatCase: completing, alreadyExisted: false, propertyId: caseId, trackToken: completing ? existingToken : trackToken, photoCount: photoDocs.length };
  } catch (e) {
    // anything that failed BEFORE the commit leaves no file behind; after a commit nothing here runs
    const won = await intRef.get().then((s) => (s.exists ? s.data() || {} : null)).catch(() => null);
    const sameSubmission = !!won && won.submissionKey === v.key && won.submittedByUid === actor.uid;
    // A sibling attempt of the SAME submission may have committed while this one failed (e.g. transaction contention): its record is the answer, this attempt's files go.
    const mineCommitted = await db.collection("casePhotos").where("propertyId", "==", caseId).get().then((q) => q.docs.some((d) => (d.data() || {}).attempt === attempt)).catch(() => false);
    if (!mineCommitted) await abandon(); // only when this attempt's own files are not the ones the record points at
    if (sameSubmission && !(e instanceof HttpsError && e.code === "invalid-argument")) return okResult(caseId, won);
    if (e instanceof HttpsError) throw e;
    console.error("submitListingCase failed", caseId, (e && e.message) || String(e));
    throw new HttpsError("internal", "ไม่สามารถบันทึกเคสได้ กรุณาลองอีกครั้ง");
  }
}

// ── publish / take down (Owner only) ───────────────────────────────────────
const TYPE_TH = { villa: "พูลวิลล่า", house: "บ้านเดี่ยว", townhouse: "ทาวน์เฮาส์", condo: "คอนโด", land: "ที่ดิน", commercial: "เชิงพาณิชย์" };
const TYPE_EN = { villa: "Pool Villa", house: "House", townhouse: "Townhouse", condo: "Condo", land: "Land", commercial: "Commercial" };
const AREA_TH = { "hua-hin": "หัวหิน", pranburi: "ปราณบุรี", "cha-am": "ชะอำ" };
const AREA_EN = { "hua-hin": "Hua Hin", pranburi: "Pranburi", "cha-am": "Cha-am" };
const PUBLISHABLE = ["pending", "pending_owner", "offline"];
const leaseMs = () => Number(process.env.LISTING_LEASE_MS) || 5 * 60 * 1000;
const graceMs = () => (process.env.LISTING_RECONCILE_GRACE_MS !== undefined ? Number(process.env.LISTING_RECONCILE_GRACE_MS) : 10 * 60 * 1000);

async function requireOwner(admin, HttpsError, request) {
  const actor = await resolveActor(admin, request, HttpsError);
  if (actor.role !== "owner") throw new HttpsError("permission-denied", "Only the Owner can do this.");
  return actor;
}
async function requireTeam(admin, HttpsError, request) {
  const actor = await resolveActor(admin, request, HttpsError);
  if (actor.role !== "owner" && actor.role !== "staff") throw new HttpsError("permission-denied", "Team members only.");
  return actor;
}
function requireId(HttpsError, request) {
  const id = request.data && request.data.propertyId;
  if (!isStr(id) || !id || id.length > 200 || id.includes("/")) throw bad(HttpsError, "bad_property_id");
  return id;
}
// Why a Case may (not) be published right now, from the CURRENT record. Used before AND inside the final transaction.
function publishVerdict(rec, HttpsError) {
  if (!PUBLISHABLE.includes(rec.listingStatus)) return new HttpsError("failed-precondition", "not_publishable_status", { reason: "not_publishable_status", status: rec.listingStatus || null });
  if (!(Number(rec.price) > 0)) return new HttpsError("failed-precondition", "price_required_to_publish", { reason: "price_required_to_publish" }); // an appraisal request can be submitted, not published
  if (rec.source === "owner_submission") {
    if (rec.reviewStatus === "approved") return { approvalPath: "intake_approved" };
    if (rec.submittedByRole === "owner") return { approvalPath: "owner_direct" };
    return new HttpsError("failed-precondition", "intake_not_approved", { reason: "intake_not_approved", reviewStatus: rec.reviewStatus || null });
  }
  return { approvalPath: "owner_listing_approval" };
}
function publicTitle(rec, type, area) {
  if (rec.title && typeof rec.title === "object") return rec.title;
  return {
    th: (TYPE_TH[type] || "") + (area ? AREA_TH[area] : "") + (rec.status === "rent" ? " ให้เช่า" : " ขาย"),
    en: (TYPE_EN[type] || "") + (area ? " " + AREA_EN[area] : "") + (rec.status === "rent" ? " for rent" : " for sale"),
  };
}
// THE public page, computed from the CURRENT record only (never from anything read earlier): the allow-list projection + the generated title.
// What the Owner previews, what is published and what a later sync applies are all produced by this one function.
function buildPublicDoc(rec) {
  const type = TYPES.includes(rec.type) ? rec.type : "house";
  const area = rec.area && AREA_TH[rec.area] ? rec.area : "";
  return Object.assign({}, projectPublic(rec), { type, title: publicTitle(rec, type, area) });
}
const stable = (v) => (Array.isArray(v) ? "[" + v.map(stable).join(",") + "]" : v && typeof v === "object" ? "{" + Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + stable(v[k])).join(",") + "}" : JSON.stringify(v === undefined ? null : v));
const hash = (s) => nodeCrypto.createHash("sha256").update(s).digest("hex");
const projectionSig = (rec) => hash(stable(buildPublicDoc(rec)));          // what a sync would change
const publishSig = (rec, photos) => hash(projectionSig(rec) + "|" + sigOf(photos)); // what a publish would create (text + the exact photo set)

// File deletion that tells "already gone" apart from a real failure. Failures are returned to the caller (never swallowed into a claim of success).
const isNotFound = (e) => e && (e.code === 404 || /No such object|not found/i.test(String(e.message || "")));
async function safeDelete(bucket, p, failures) {
  try { await hook("beforeDelete", { path: p }); await bucket.file(p).delete(); return true; } catch (e) {
    if (isNotFound(e)) return true;
    failures.push({ path: p, error: String((e && (e.code || e.message)) || e).slice(0, 120) }); return false;
  }
}
async function deletePrefixSafe(bucket, prefix, failures) {
  let files = [];
  try { [files] = await bucket.getFiles({ prefix }); } catch (e) { if (!isNotFound(e)) failures.push({ path: prefix, error: String((e && (e.code || e.message)) || e).slice(0, 120) }); return; }
  for (const f of files) await safeDelete(bucket, f.name, failures);
}
// remember files that could not be deleted, so reconcile retries them and nobody claims a link was revoked when it was not
async function noteCleanup(intRef, failures) {
  if (!failures.length) return;
  console.warn("listing cleanup failed for", failures.length, "file(s)");
  try { const cur = ((await intRef.get()).data() || {}).cleanupPending || []; await intRef.update({ cleanupPending: Array.from(new Set(cur.concat(failures.map((x) => x.path)))).slice(0, 100) }); } catch (e) { /* the log line above is the fallback */ }
}

// Owner preview: EXACTLY what would become public (document + photo count) and why it would be refused. Nothing is written.
async function previewListingCase({ admin, HttpsError, request }) {
  assertEnabled(HttpsError);
  await requireOwner(admin, HttpsError, request);
  const id = requireId(HttpsError, request);
  const db = admin.firestore();
  const snap = await db.collection("caseInternal").doc(id).get();
  if (!snap.exists) throw new HttpsError("not-found", "case_not_found", { reason: "case_not_found" });
  const rec = snap.data() || {};
  const photos = await casePhotoDocs(db, id);
  const doc = buildPublicDoc(rec);
  const std = photoStandardFor(doc.type);
  const verdict = rec.listingStatus === "live" ? { approvalPath: "live" } : publishVerdict(rec, HttpsError);
  let wouldRefuse = verdict instanceof HttpsError ? verdict.details.reason : null;
  const problems = publicTextProblems(rec);
  if (!wouldRefuse && problems.length) wouldRefuse = "public_text_has_contact_info";
  if (!wouldRefuse && rec.listingStatus !== "live" && photos.length < std.min) wouldRefuse = "photos_below_minimum";
  const live = rec.listingStatus === "live" ? ((await db.collection("properties").doc(id).get()).data() || null) : null;
  // The photo set shown must be the set that ACTUALLY is / becomes public. Before the first publish that is every private photo. For a listing that is already
  // live, a later update keeps the PUBLISHED photos (new private photos reach the public page only when the Owner takes it down and publishes it again), so the
  // preview shows the published ones and says how many newer private photos are NOT included.
  let photoSource = "private", photoPaths = photos.map((p) => p.storagePath), photoUrls = [], unpublishedPhotoCount = 0, shownCount = photos.length;
  if (live) {
    const pub = (await db.collection("propertyPhotos").where("propertyId", "==", id).get()).docs.map((d) => d.data()).sort((a, b) => (a.index || 0) - (b.index || 0));
    photoSource = "published"; photoPaths = []; photoUrls = pub.map((p) => p.dataUrl); shownCount = pub.length; unpublishedPhotoCount = Math.max(0, photos.length - pub.length);
  }
  return {
    propertyId: id, listingStatus: rec.listingStatus || null, publicDocument: doc, photoSource, photoCount: shownCount, privatePhotoCount: photos.length, unpublishedPhotoCount,
    photoIndexes: photos.map((p) => p.index), photoPaths, photoUrls, photoStandard: std,
    problems, wouldRefuse, publishSig: publishSig(rec, photos), updateSig: projectionSig(rec), currentPublicDocument: live ? projectPublic(live) : null, publicUpdatePending: !!rec.publicUpdatePending,
  };
}

async function publishListingCase({ admin, HttpsError, request }) {
  assertEnabled(HttpsError);
  const actor = await requireOwner(admin, HttpsError, request);
  const id = requireId(HttpsError, request);
  const reviewedSig = request.data && request.data.reviewedSig;
  if (!isStr(reviewedSig) || reviewedSig.length !== 64) throw new HttpsError("failed-precondition", "preview_required", { reason: "preview_required" });
  const db = admin.firestore();
  const intRef = db.collection("caseInternal").doc(id), pubRef = db.collection("properties").doc(id);
  const first = await intRef.get();
  if (!first.exists) throw new HttpsError("not-found", "case_not_found", { reason: "case_not_found" });
  const rec0 = first.data() || {};
  if (rec0.listingStatus === "live") return { published: false, alreadyLive: true, propertyId: id };
  const verdict0 = publishVerdict(rec0, HttpsError);
  if (verdict0 instanceof HttpsError) throw verdict0;
  const problems0 = publicTextProblems(rec0);
  if (problems0.length) throw new HttpsError("failed-precondition", "public_text_has_contact_info", { reason: "public_text_has_contact_info", fields: problems0 });
  const photos0 = await casePhotoDocs(db, id);
  if (photos0.length < photoStandardFor(buildPublicDoc(rec0).type).min) throw new HttpsError("failed-precondition", "photos_below_minimum", { reason: "photos_below_minimum", min: photoStandardFor(buildPublicDoc(rec0).type).min, have: photos0.length });
  if (publishSig(rec0, photos0) !== reviewedSig) throw new HttpsError("failed-precondition", "reviewed_content_changed", { reason: "reviewed_content_changed" });

  // (1) reserve: only one publish at a time (a lease); a take-down in between cancels the reservation
  const opId = "p-" + nodeCrypto.randomBytes(6).toString("hex");
  try {
    await db.runTransaction(async (t) => {
      const cur = await t.get(intRef);
      const rec = cur.data() || {};
      if (rec.listingStatus === "live") throw new HttpsError("already-exists", "already_live", { reason: "already_live" });
      const verdict = publishVerdict(rec, HttpsError);
      if (verdict instanceof HttpsError) throw verdict;
      const op = rec.publishOp;
      if (op && op.status === "publishing" && Date.now() - (op.startedAt || 0) < leaseMs()) throw new HttpsError("aborted", "publish_in_progress", { reason: "publish_in_progress" });
      t.update(intRef, { publishOp: { opId, status: "publishing", startedAt: Date.now(), byUid: actor.uid } });
    });
  } catch (e) {
    if (e && e.details && e.details.reason === "already_live") return { published: false, alreadyLive: true, propertyId: id };
    throw e;
  }

  // (2) copy the private photos to a path that belongs to THIS operation only (public, tokened). Nothing outside this prefix is ever touched by this operation.
  const bucket = bucketFor(admin);
  const opPrefix = "publishedCasePhotos/" + id + "/" + opId + "/";
  const released = async () => {
    const failures = [];
    await deletePrefixSafe(bucket, opPrefix, failures);
    await intRef.get().then((s) => { const o = (s.data() || {}).publishOp; if (o && o.opId === opId && o.status === "publishing") return intRef.update({ publishOp: Object.assign({}, o, { status: "failed" }) }); }).catch(() => {});
    await noteCleanup(intRef, failures);
  };
  try {
    const published = [];
    for (const p of photos0) published.push({ index: p.index, dataUrl: await copyWithToken(bucket, p.storagePath, opPrefix + p.index + ".webp") });
    await hook("afterPublishCopy", { id, opId });

    // (3) commit: EVERYTHING the decision depends on is recomputed from what the transaction reads NOW — type, photo minimum, price, approval,
    //     public text, the exact photo set, and the content the Owner reviewed. Nothing from the reads above is trusted.
    const now = Date.now();
    let approvalPath = "";
    await db.runTransaction(async (t) => {
      const cur = await t.get(intRef);
      const rec = cur.data() || {};
      const op = rec.publishOp;
      if (!op || op.opId !== opId || op.status !== "publishing") throw new HttpsError("aborted", "publish_cancelled", { reason: "publish_cancelled" });
      const verdict = publishVerdict(rec, HttpsError);
      if (verdict instanceof HttpsError) throw verdict;
      approvalPath = verdict.approvalPath;
      const pbad = publicTextProblems(rec);
      if (pbad.length) throw new HttpsError("failed-precondition", "public_text_has_contact_info", { reason: "public_text_has_contact_info", fields: pbad });
      const photosNow = (await t.get(db.collection("casePhotos").where("propertyId", "==", id))).docs.map((d) => d.data()).sort((a, b) => a.index - b.index);
      const pubDoc = buildPublicDoc(rec); // type, title and projection from the CURRENT record
      const std = photoStandardFor(pubDoc.type);
      if (photosNow.length < std.min) throw new HttpsError("failed-precondition", "photos_below_minimum", { reason: "photos_below_minimum", min: std.min, have: photosNow.length });
      if (sigOf(photosNow) !== sigOf(photos0)) throw new HttpsError("aborted", "photos_changed", { reason: "photos_changed" });
      if (publishSig(rec, photosNow) !== reviewedSig) throw new HttpsError("aborted", "reviewed_content_changed", { reason: "reviewed_content_changed" });
      const expiresAt = now + LISTING_DURATION_DAYS * 86400000;
      t.set(pubRef, Object.assign({}, pubDoc, {
        source: "owner_submission", internalSplit: true, listingStatus: "live", isDraft: false,
        publishedAt: now, expiresAt, approvedAt: now, photos: published.map((p) => ({ label: "Photo " + (p.index + 1) })), publishedPhotoCount: published.length,
        ...(rec.listerId ? { listerId: rec.listerId } : {}), viewCount: 0,
      })); // full replace: nothing from an earlier projection survives
      published.forEach((p) => t.set(db.collection("propertyPhotos").doc(id + "-" + p.index), { propertyId: id, index: p.index, dataUrl: p.dataUrl, publishedAt: now, publishedByUid: actor.uid, publishOpId: opId }));
      t.update(intRef, {
        listingStatus: "live", publishedAt: now, expiresAt, approvedAt: now, isDraft: false, expiredAt: null, photosDeletedAt: null, offlineAt: null, offlineReason: null, publishedPhotoCount: published.length,
        approvedByUid: actor.uid, approvedByEmail: actor.email || "", approvedByRole: "owner", approvalPath, approvedContentSig: reviewedSig, publicUpdatePending: false,
        publishOp: { opId, status: "done", startedAt: op.startedAt, finishedAt: now, byUid: actor.uid },
      });
    });
    // No sweep of "other" prefixes here: a newer or concurrent operation's files are never ours to delete. Leftovers of failed operations are removed by
    // their own failure handler, or by reconcileListingFiles after a grace period.
    try {
      await db.collection("activityLog").add({ type: "listing_published", propertyId: id, byUid: actor.uid, byRole: "owner", byEmail: actor.email || "", approvalPath, at: now, summary: "เผยแพร่ประกาศ " + id });
    } catch (e) { console.warn("activityLog (listing_published) not written", id); }
    return { published: true, alreadyLive: false, propertyId: id, photoCount: published.length, approvalPath };
  } catch (e) {
    const live = await intRef.get().then((s) => (s.data() || {}).publishOp && (s.data() || {}).publishOp.opId === opId && (s.data() || {}).publishOp.status === "done").catch(() => false);
    if (!live) await released();
    if (e instanceof HttpsError) throw e;
    console.error("publishListingCase failed", id, (e && e.message) || String(e));
    throw new HttpsError("internal", "เผยแพร่ไม่สำเร็จ กรุณาลองอีกครั้ง");
  }
}

// Take a published Case down. The public document AND the public photo records disappear in ONE transaction (nothing public links to the listing
// afterwards). The files that transaction removed records for — the operation prefix(es) it captured, nothing else — are then deleted. A republish
// that commits in between uses a NEW operation prefix, so this clean-up can never touch its photos. If a deletion fails the result says so and the
// path is kept in cleanupPending for reconcile; "the old link is dead" is only claimed when every deletion succeeded.
async function unpublishListingCase({ admin, HttpsError, request }) {
  assertEnabled(HttpsError);
  const actor = await requireOwner(admin, HttpsError, request);
  const id = requireId(HttpsError, request);
  const reason = clean(request.data && request.data.reason, 500);
  const db = admin.firestore();
  const intRef = db.collection("caseInternal").doc(id), pubRef = db.collection("properties").doc(id);
  const now = Date.now();
  const out = await db.runTransaction(async (t) => {
    const cur = await t.get(intRef);
    if (!cur.exists) throw new HttpsError("not-found", "case_not_found", { reason: "case_not_found" });
    const rec = cur.data() || {};
    const photoDocs = (await t.get(db.collection("propertyPhotos").where("propertyId", "==", id))).docs;
    if (rec.listingStatus !== "live") {
      if (rec.publishOp && rec.publishOp.status === "publishing") { t.update(intRef, { publishOp: Object.assign({}, rec.publishOp, { status: "cancelled" }) }); return { unpublished: false, cancelledPublish: true, propertyId: id, status: rec.listingStatus || null, removed: 0, prefixes: [] }; }
      return { unpublished: false, propertyId: id, status: rec.listingStatus || null, removed: 0, prefixes: [] };
    }
    const ops = new Set(); let removed = 0;
    photoDocs.forEach((d) => { const x = d.data() || {}; if (x.publishedByUid) { if (x.publishOpId) ops.add(x.publishOpId); t.delete(d.ref); removed++; } });
    if (rec.publishOp && rec.publishOp.status === "done" && rec.publishOp.opId) ops.add(rec.publishOp.opId);
    t.delete(pubRef);
    t.update(intRef, { listingStatus: "offline", offlineAt: now, offlineReason: reason || null, offlineByUid: actor.uid, publishOp: null, publicUpdatePending: false });
    return { unpublished: true, propertyId: id, removedPublicPhotos: removed, prefixes: Array.from(ops).map((o) => "publishedCasePhotos/" + id + "/" + o + "/") };
  });
  const result = { unpublished: out.unpublished, propertyId: id };
  if ("status" in out) result.status = out.status;
  if (out.cancelledPublish) result.cancelledPublish = true;
  if (out.unpublished) {
    await hook("afterUnpublishCommit", { id });
    const failures = []; const bucket = bucketFor(admin);
    for (const pfx of out.prefixes) await deletePrefixSafe(bucket, pfx, failures);
    await noteCleanup(intRef, failures);
    result.removedPublicPhotos = out.removedPublicPhotos; result.publicFilesRemoved = failures.length === 0;
    if (failures.length) result.cleanupFailed = failures.map((f) => f.path);
    try {
      await db.collection("activityLog").add({ type: "listing_unpublished", propertyId: id, byUid: actor.uid, byRole: "owner", byEmail: actor.email || "", at: now, summary: "ถอนประกาศ " + id });
    } catch (e) { console.warn("activityLog (listing_unpublished) not written", id); }
  }
  return result;
}

// Edits to an ALREADY published Case reach the public page only with the Owner's approval of the exact new content:
//   • Staff (or anyone on the team): the request is recorded (publicUpdatePending) — the public page does NOT change;
//   • Owner: must pass reviewedSig (= updateSig from previewListingCase); the page is re-projected only if the current content still equals what was reviewed.
// Never changes the status, never publishes anything new, and refuses text containing contact details.
async function syncListingCase({ admin, HttpsError, request }) {
  assertEnabled(HttpsError);
  const actor = await requireTeam(admin, HttpsError, request);
  const id = requireId(HttpsError, request);
  const db = admin.firestore();
  const intRef = db.collection("caseInternal").doc(id), pubRef = db.collection("properties").doc(id);
  const reviewedSig = request.data && request.data.reviewedSig;
  return db.runTransaction(async (t) => {
    const [cur, pub] = await Promise.all([t.get(intRef), t.get(pubRef)]);
    if (!cur.exists) throw new HttpsError("not-found", "case_not_found", { reason: "case_not_found" });
    const rec = cur.data() || {};
    if (rec.listingStatus !== "live" || !pub.exists) return { synced: false, propertyId: id, reason: "not_live" };
    const keep = pub.data() || {};
    const next = buildPublicDoc(rec);
    const same = stable(projectPublic(keep)) === stable(projectPublic(Object.assign({}, next)));
    if (same) { if (rec.publicUpdatePending) t.update(intRef, { publicUpdatePending: false }); return { synced: false, propertyId: id, reason: "no_change" }; }
    if (actor.role !== "owner") {
      t.update(intRef, { publicUpdatePending: true, publicUpdateRequestedAt: Date.now(), publicUpdateRequestedBy: actor.uid });
      return { synced: false, propertyId: id, reason: "owner_approval_required", pendingOwnerApproval: true };
    }
    const problems = publicTextProblems(rec);
    if (problems.length) return { synced: false, propertyId: id, reason: "public_text_has_contact_info", fields: problems };
    if (!isStr(reviewedSig) || reviewedSig.length !== 64) throw new HttpsError("failed-precondition", "preview_required", { reason: "preview_required" });
    if (projectionSig(rec) !== reviewedSig) throw new HttpsError("aborted", "reviewed_content_changed", { reason: "reviewed_content_changed" });
    t.set(pubRef, Object.assign({}, next, {
      source: "owner_submission", internalSplit: true, listingStatus: "live", isDraft: false,
      publishedAt: keep.publishedAt || rec.publishedAt || null, expiresAt: rec.expiresAt || keep.expiresAt || null, approvedAt: rec.approvedAt || keep.approvedAt || null,
      photos: keep.photos || [], publishedPhotoCount: keep.publishedPhotoCount || 0, ...(rec.listerId ? { listerId: rec.listerId } : {}), viewCount: keep.viewCount || 0,
    }));
    t.update(intRef, { publicUpdatePending: false, approvedContentSig: reviewedSig, publicUpdateApprovedBy: actor.uid, publicUpdateApprovedAt: Date.now() });
    return { synced: true, propertyId: id };
  });
}

// Staff add photos to a Case that is still private: the browser uploads to ITS OWN staging folder, this copies the files into the
// Case's private area and registers them. (A published Case picks the photos up the next time the Owner publishes it.)
async function addCasePhotos({ admin, HttpsError, request }) {
  assertEnabled(HttpsError);
  const actor = await requireTeam(admin, HttpsError, request);
  const id = requireId(HttpsError, request);
  const paths = Array.isArray(request.data && request.data.paths) ? request.data.paths : [];
  if (!paths.length || paths.length > 10) throw bad(HttpsError, "bad_paths");
  const prefix = "caseUploads/" + actor.uid + "/";
  const re = new RegExp("^" + prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[A-Za-z0-9_-]{16,64}/[0-9]{1,2}\\.webp$");
  paths.forEach((p) => { if (!isStr(p) || !re.test(p)) throw bad(HttpsError, "bad_photo_path"); });
  const db = admin.firestore(), bucket = bucketFor(admin);
  const intRef = db.collection("caseInternal").doc(id);
  const snap = await intRef.get();
  if (!snap.exists) throw new HttpsError("not-found", "case_not_found", { reason: "case_not_found" });
  const attempt = "a-" + nodeCrypto.randomBytes(6).toString("hex");
  const copies = [];
  try {
    for (let i = 0; i < paths.length; i++) { await assertImageObject(bucket, paths[i], HttpsError); const dst = "casePhotos/" + id + "/" + attempt + "/" + i + ".webp"; copies.push({ i, storagePath: dst, dataUrl: await copyPrivate(bucket, paths[i], dst) }); }
    const now = Date.now();
    const added = await db.runTransaction(async (t) => {
      const existing = (await t.get(db.collection("casePhotos").where("propertyId", "==", id))).docs.map((d) => d.data());
      let next = existing.reduce((m, p) => Math.max(m, p.index + 1), 0);
      if (existing.length + copies.length > MAX_PHOTOS) throw new HttpsError("failed-precondition", "too_many_photos", { reason: "too_many_photos" });
      copies.forEach((c) => { t.set(db.collection("casePhotos").doc(id + "-" + next), { propertyId: id, index: next, dataUrl: c.dataUrl, storagePath: c.storagePath, uploadedByUid: actor.uid, uploadedByRole: actor.role, uploadedAt: now, attempt }); next++; });
      t.update(intRef, { photoCount: existing.length + copies.length });
      return copies.length;
    });
    const failures = [];
    for (const p of paths) await safeDelete(bucket, p, failures);
    if (failures.length) console.warn("staging files not removed after addCasePhotos:", failures.length);
    return { added, propertyId: id };
  } catch (e) {
    const failures = [];
    await deletePrefixSafe(bucket, "casePhotos/" + id + "/" + attempt + "/", failures);
    if (failures.length) console.warn("addCasePhotos clean-up failed:", failures.length);
    if (e instanceof HttpsError) throw e;
    throw new HttpsError("internal", "เพิ่มรูปไม่สำเร็จ");
  }
}

// Reconciliation (Owner). Removes files no record references any more (leftovers of failed or lost attempts and of take-downs whose deletion failed).
// Never touches anything that may still be in use: files younger than a grace period, the live operation's files, an operation whose lease has not
// expired, and every file a record refers to. It deletes by exact path from the record it just read, never by sweeping a prefix that a newer operation could use.
async function reconcileListingFiles({ admin, HttpsError, request }) {
  assertEnabled(HttpsError);
  await requireOwner(admin, HttpsError, request);
  const id = requireId(HttpsError, request);
  const db = admin.firestore(), bucket = bucketFor(admin);
  const intRef = db.collection("caseInternal").doc(id);
  const rec = (await intRef.get()).data() || {};
  const now = Date.now(), grace = graceMs();
  const old = (f) => now - new Date((f.metadata && (f.metadata.timeCreated || f.metadata.updated)) || 0).getTime() >= grace;
  const failures = []; let removed = 0, skippedYoung = 0;
  const keepPrivate = new Set((await casePhotoDocs(db, id)).map((p) => p.storagePath));
  const [pFiles] = await bucket.getFiles({ prefix: "casePhotos/" + id + "/" });
  for (const f of pFiles) { if (keepPrivate.has(f.name)) continue; if (!old(f)) { skippedYoung++; continue; } if (await safeDelete(bucket, f.name, failures)) removed++; }
  const op = rec.publishOp || {};
  const activeOps = new Set();
  if (op.opId && op.status === "done" && rec.listingStatus === "live") activeOps.add(op.opId);
  if (op.opId && op.status === "publishing" && now - (op.startedAt || 0) < leaseMs()) activeOps.add(op.opId);
  const [uFiles] = await bucket.getFiles({ prefix: "publishedCasePhotos/" + id + "/" });
  for (const f of uFiles) {
    const opId = f.name.split("/")[2];
    if (activeOps.has(opId)) continue;
    if (!old(f)) { skippedYoung++; continue; }
    if (await safeDelete(bucket, f.name, failures)) removed++;
  }
  const [aFiles] = await bucket.getFiles({ prefix: "caseAttachments/" + id + "/ownership-" });
  for (const f of aFiles) { if (f.name === rec.ownershipDocPath) continue; if (!old(f)) { skippedYoung++; continue; } if (await safeDelete(bucket, f.name, failures)) removed++; }
  // whatever an earlier take-down could not delete is retried by the loops above; the list is rewritten from what is still there
  const stillPending = [];
  for (const pth of rec.cleanupPending || []) { const [ex] = await bucket.file(pth).exists().catch(() => [false]); if (ex && !failures.some((x) => x.path === pth)) { /* kept young or active: not ours to delete yet */ stillPending.push(pth); } else if (ex) stillPending.push(pth); }
  if (rec.cleanupPending && rec.cleanupPending.length) await intRef.update({ cleanupPending: stillPending }).catch(() => {});
  return { removed, skippedYoung, failed: failures.map((x) => x.path), propertyId: id };
}

// The submitter's OWN cases (an agent resumes and follows what they sent through the form). Only cases whose recorded submitter is the caller, and only
// the minimal view the tracking page needs — never another person's case, never internal notes, assignment, verification or approval details.
async function listMyCases({ admin, HttpsError, request }) {
  assertEnabled(HttpsError);
  const actor = await resolveActor(admin, request, HttpsError);
  const snap = await admin.firestore().collection("caseInternal").where("submittedByUid", "==", actor.uid).get();
  const rows = snap.docs.map((d) => { const c = d.data() || {}; return {
    id: d.id, type: c.type || "", status: c.status || "", listingStatus: c.listingStatus || "", reviewStatus: c.reviewStatus || "submitted", submittedAt: c.submittedAt || null,
    photoCount: Number(c.photoCount) || 0, price: Number(c.price) || 0, priceMode: c.priceMode || "fixed", publicPropertyCode: c.publicPropertyCode || "", trackToken: c.trackToken || "",
    needsReply: !!(c.reviewReturn || c.infoRequestMessage) && !c.infoResponseAt,
  }; }).sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0)).slice(0, 50);
  return { cases: rows };
}

// ── trackListingCase — the customer's token-checked view and conversation (no account, no public read) ─────────
// The token is the whole authorisation, and it is checked HERE: customers can not read caseMessages (or anything else) from the
// browser. Not found and wrong token look identical. Works for a Case record (caseInternal) and for an older Case whose token is
// still on its properties document.
async function loadForTrack(admin, id, token, HttpsError) {
  const denied = () => new HttpsError("permission-denied", "not_available");
  if (!isStr(id) || !id || id.length > 200 || id.includes("/") || !isStr(token) || token.length < 20 || token.length > 200) throw denied();
  const db = admin.firestore();
  const intRef = db.collection("caseInternal").doc(id), pubRef = db.collection("properties").doc(id);
  const [intSnap, pubSnap] = await Promise.all([intRef.get(), pubRef.get()]);
  if (intSnap.exists) {
    const rec = intSnap.data() || {};
    if (!safeEqual(rec.trackToken, token)) throw denied();
    return { rec, ref: intRef, legacy: false };
  }
  if (pubSnap.exists) {
    const rec = pubSnap.data() || {};
    if (rec.source !== "owner_submission" || !safeEqual(rec.trackToken, token)) throw denied();
    return { rec, ref: pubRef, legacy: true };
  }
  throw denied();
}
const safeMessage = (m) => {
  const own = m.senderType === "customer" || m.direction === "inbound";
  return { id: m.id, senderType: m.senderType || (m.direction === "inbound" ? "customer" : "staff"), direction: m.direction || "", createdAt: m.createdAt || null, messageType: m.messageType || "",
    originalText: own ? (m.originalText || "") : (m.originalText || ""), customerText: m.customerText || "" };
};

async function trackListingCase({ admin, HttpsError, request }) {
  assertEnabled(HttpsError);
  const d = request.data || {};
  const db = admin.firestore();
  const { rec, ref, legacy } = await loadForTrack(admin, d.id, d.token, HttpsError);
  const id = d.id;
  const msgs = db.collection("properties").doc(id).collection("caseMessages");
  const action = d.action || "view";
  const now = Date.now();
  if (action === "messages") {
    const snap = await msgs.where("visibility", "==", "customer").get();
    const rows = snap.docs.map((x) => safeMessage(Object.assign({ id: x.id }, x.data()))).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)).slice(-200);
    return { messages: rows };
  }
  if (action === "send") {
    const text = clean(d.message, 4000);
    if (!text) throw bad(HttpsError, "missing_message");
    const lang = LANGS.includes(d.lang) ? d.lang : (LANGS.includes(rec.customerLanguage) ? rec.customerLanguage : "th");
    const mine = await msgs.where("direction", "==", "inbound").get();
    if (mine.size >= 500) throw new HttpsError("resource-exhausted", "too_many_messages", { reason: "too_many_messages" });
    const row = { senderType: "customer", direction: "inbound", messageType: "response", channel: "track_submission", visibility: "customer",
      originalLanguage: lang, originalText: text, thaiText: clean(d.thaiText, 4000) || text, customerLanguage: lang, customerText: text, caseId: id, createdAt: now };
    const added = await msgs.add(row);
    await ref.update({ infoResponseMessage: row.thaiText, infoResponseAt: now, infoResponseStatus: "responded", lastCustomerMessageAt: now });
    return { sent: true, id: added.id };
  }
  if (action === "language") {
    if (!LANGS.includes(d.lang)) throw bad(HttpsError, "bad_language");
    if (rec.customerLanguageConfirmed !== true) await ref.update({ customerLanguage: d.lang, customerLanguageConfirmed: true, customerLanguageSource: "message_detected" });
  } else if (action === "read") {
    await ref.update({ customerLastReadAt: now });
  } else if (action !== "view") throw bad(HttpsError, "bad_action");
  const fresh = action === "view" ? rec : (await ref.get()).data() || {};
  const reviewReturn = fresh.reviewReturn && typeof fresh.reviewReturn === "object" ? { reason: String(fresh.reviewReturn.reason || "").slice(0, 1000) } : null;
  let photoCount = Number(rec.photoCount) || 0;
  if (legacy) { try { photoCount = (await db.collection("propertyPhotos").where("propertyId", "==", id).get()).size; } catch (e) { /* keep */ } }
  // exactly what the customer's page needs — no internal ids, emails, staff names or secrets
  return {
    id, legacy, type: rec.type || "", status: rec.status || "", listingStatus: rec.listingStatus || "", reviewStatus: rec.reviewStatus || "submitted",
    submittedAt: rec.submittedAt || null, publicPropertyCode: rec.publicPropertyCode || "", photoCount, price: Number(rec.price) || 0,
    contactName: fresh.contactName || "", customerLanguage: fresh.customerLanguage || "th", customerLanguageConfirmed: fresh.customerLanguageConfirmed === true,
    infoRequestMessage: fresh.infoRequestMessage || "", infoRequestAt: fresh.infoRequestAt || null,
    infoResponseMessage: fresh.infoResponseMessage || "", infoResponseAt: fresh.infoResponseAt || null, reviewReturn,
    lastStaffMessageAt: fresh.lastStaffMessageAt || null, customerLastReadAt: fresh.customerLastReadAt || null,
  };
}

module.exports = { isEnabled, hooks, listMyCases, submitListingCase, previewListingCase, publishListingCase, unpublishListingCase, syncListingCase, addCasePhotos, reconcileListingFiles, trackListingCase, resolveActor, caseIdFor, validateSubmission, PHOTO_STANDARD, OWNER_UID, TYPES, MAX_PHOTOS };
