// LISTING-E2E-01 — which Case fields are INTERNAL (never in a document the public can read).
// MIRRORED (same list, same order) by /case-fields.js used by the browser data layer;
// tests/listing/sync.test.js fails if the two lists ever differ.
"use strict";

const PRIVATE_FIELDS = [
  // who the people are
  "contactName", "contactPhone", "contactEmail", "ownerContact", "ownerName", "ownerPhone",
  "submittedByUid", "submittedByRole", "submittedByLabel", "propertyOwnerRelation", "receptionVisitorId", "conversationId",
  // access secrets / private attachments / exact location
  "trackToken", "ownershipDocPath", "ownershipDocUrl", "coordsRaw", "submissionKey",
  // customer language + customer-contact bookkeeping
  "customerLanguage", "customerLanguageConfirmed", "customerLanguageSource",
  "infoRequestStatus", "infoRequestMessage", "infoRequestAt", "infoResponseMessage", "infoResponseAt", "infoResponseStatus",
  "lastCustomerMessageAt", "customerLastReadAt", "staffLastReadAt",
  // staff work
  "assignedToUid", "assignedToEmail", "assignedAt", "assignedByUid", "assignedByEmail", "assignedByRole", "humanHandlingStartedAt",
  "verifications", "readinessNote", "internalNotes", "reviewReturn", "rejectReason", "offlineReason",
  // approval attribution (who) — the fact that it is live (approvedAt/publishedAt) stays public
  "approvedBy", "approvedByUid", "approvedByEmail", "approvedByRole", "approvalPath", "draftId",
];
const PRIVATE_SET = new Set(PRIVATE_FIELDS);

// Split a flat Case object into { pub, priv }.
function splitCaseFields(obj) {
  const pub = {}, priv = {};
  Object.keys(obj || {}).forEach((k) => { (PRIVATE_SET.has(k) ? priv : pub)[k] = obj[k]; });
  return { pub, priv };
}

// ── PUBLIC ALLOW-LIST (Owner-approved projection) ───────────────────────────
// A Case lives in caseInternal/{id}. The ONLY thing the public ever sees of it is properties/{id}, which the
// server creates at publish time from THIS explicit list — a field that is not named here can never become public,
// including fields added to the Case record in future (the previous design copied "everything not private").
const PUBLIC_FIELDS = [
  "type", "status", "condition", "price", "currency", "area", "subdistrict", "zone",
  "bedrooms", "bathrooms", "poolSize", "parking", "titleDeed", "kitchenTypes", "purchaseOptions",
  "projectStatus", "projectName", "poolStatus", "furnishing", "commercialSubtype", "yearBuilt", "floor", "floors",
  "commonFee", "foreignQuota", "landShape", "roadWidth", "landCondition", "utilities", "zoningColor", "electricalPhase",
  "landRai", "landNgan", "landWah", "livingArea", "landSize",
  "title", "shortDesc", "fullDesc", "description", "features", "collections", "seoTags", "seo",
  "mapLink", "mapDisplayMode", "distanceBeach", "distanceTown", "publicPropertyCode", "vipTier",
];
// Free-text fields shown to everyone: they are checked for contact details before they can go public.
const PUBLIC_TEXT_FIELDS = ["title", "shortDesc", "fullDesc", "description"];

const PHONE_RES = [/(?:\+?66|0)[\s.\-]?\d(?:[\s.\-]?\d){7,9}/, /(?<![\d,.])\d{9,}(?![\d,.])/];
const OTHER_CONTACT_RES = [
  /[^\s@]+@[^\s@]+\.[^\s@]+/,                      // e-mail
  /https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|net|org|co\.th|me|ly)\b/i, // links
  /(?:line|ไลน์|ไลน|whatsapp|wechat|telegram|facebook|messenger|โทร|tel)\s*(?:id|ไอดี)?\s*[:：@=-]\s*[\w@.+-]{3,}/i,
  /(?:^|\s)@[A-Za-z0-9_.]{3,}/,
];
function collectStrings(v, out) {
  if (typeof v === "string") out.push(v);
  else if (v && typeof v === "object") Object.keys(v).forEach((k) => collectStrings(v[k], out));
  return out;
}
// Returns the list of public text fields that contain what looks like contact information ([] = clean).
function publicTextProblems(rec) {
  const bad = [];
  PUBLIC_TEXT_FIELDS.forEach((f) => {
    const texts = collectStrings(rec && rec[f], []);
    if (texts.some((t) => PHONE_RES.some((re) => re.test(t)) || OTHER_CONTACT_RES.some((re) => re.test(t)))) bad.push(f);
  });
  return bad;
}
// The allow-list projection: ONLY these fields, never anything else.
function projectPublic(rec) {
  const out = {};
  PUBLIC_FIELDS.forEach((k) => { if (rec && rec[k] !== undefined) out[k] = rec[k]; });
  return out;
}

module.exports = { PRIVATE_FIELDS, PRIVATE_SET, splitCaseFields, PUBLIC_FIELDS, PUBLIC_TEXT_FIELDS, publicTextProblems, projectPublic };
