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

module.exports = { PRIVATE_FIELDS, PRIVATE_SET, splitCaseFields };
