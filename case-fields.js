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
