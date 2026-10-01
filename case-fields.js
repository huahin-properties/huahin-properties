// LISTING-E2E-01 — browser-side mirror of functions/case-fields.js (same list, same order).
// tests/listing/sync.test.js compares them. Used by firebase-client.js to keep internal
// Case fields out of the publicly readable properties/{id} document.
export const PRIVATE_FIELDS = [
  "contactName", "contactPhone", "contactEmail", "ownerContact", "ownerName", "ownerPhone",
  "submittedByUid", "submittedByRole", "submittedByLabel", "propertyOwnerRelation", "receptionVisitorId", "conversationId",
  "trackToken", "ownershipDocPath", "ownershipDocUrl", "coordsRaw", "submissionKey",
  "customerLanguage", "customerLanguageConfirmed", "customerLanguageSource",
  "infoRequestStatus", "infoRequestMessage", "infoRequestAt", "infoResponseMessage", "infoResponseAt", "infoResponseStatus",
  "lastCustomerMessageAt", "customerLastReadAt", "staffLastReadAt",
  "assignedToUid", "assignedToEmail", "assignedAt", "assignedByUid", "assignedByEmail", "assignedByRole", "humanHandlingStartedAt",
  "verifications", "readinessNote", "internalNotes", "reviewReturn", "rejectReason", "offlineReason",
  "approvedBy", "approvedByUid", "approvedByEmail", "approvedByRole", "approvalPath", "draftId",
];
const PRIVATE_SET = new Set(PRIVATE_FIELDS);
export function splitCaseFields(obj) {
  const pub = {}, priv = {};
  Object.keys(obj || {}).forEach((k) => { (PRIVATE_SET.has(k) ? priv : pub)[k] = obj[k]; });
  return { pub, priv };
}

// Mirror of functions/case-fields.js PUBLIC_FIELDS (the allow-list the SERVER projects to the public page). The browser only uses it to decide
// whether an edit to a published Case needs to be re-projected. tests/listing/sync.test.js compares the two.
export const PUBLIC_FIELDS = [
  "type", "status", "condition", "price", "currency", "area", "subdistrict", "zone",
  "bedrooms", "bathrooms", "poolSize", "parking", "titleDeed", "kitchenTypes", "purchaseOptions",
  "projectStatus", "projectName", "poolStatus", "furnishing", "commercialSubtype", "yearBuilt", "floor", "floors",
  "commonFee", "foreignQuota", "landShape", "roadWidth", "landCondition", "utilities", "zoningColor", "electricalPhase",
  "landRai", "landNgan", "landWah", "livingArea", "landSize",
  "title", "shortDesc", "fullDesc", "description", "features", "collections", "seoTags", "seo",
  "mapLink", "mapDisplayMode", "distanceBeach", "distanceTown", "publicPropertyCode", "vipTier",
];
