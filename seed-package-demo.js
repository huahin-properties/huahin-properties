// Cleanup for a test batch created by seed-package-demo.js (or any script
// using the same isTestAccount/isTestData + testBatchId convention).
// Default is a DRY RUN — lists what would be deleted without deleting.
// Actual deletion requires an explicit --confirm=<batchId> style call.
//
// Usage (from browser console / eval_js):
//   import('./scripts/cleanup-test-batch.js').then(m => m.dryRun('PKG-UX-001'))
//   import('./scripts/cleanup-test-batch.js').then(m => m.confirmDelete('PKG-UX-001'))
//
// Firebase Authentication accounts are deleted LAST, and only in
// confirmDelete, and only for uids collected from listers docs matched by
// testBatchId (never by email-name guessing alone).

export async function dryRun(batchId) {
  const fb = await import("../firebase-client.js");
  const listers = (await fb.fetchCollection("listers")).filter((l) => l.testBatchId === batchId);
  const properties = (await fb.fetchCollection("properties")).filter((p) => p.testBatchId === batchId);
  const photos = (await fb.fetchCollection("propertyPhotos")).filter((p) => p.testBatchId === batchId);
  return {
    batchId, mode: "DRY RUN — nothing deleted",
    listersToDelete: listers.map((l) => ({ id: l.id, email: l.email })),
    propertiesToDelete: properties.map((p) => p.id),
    photosToDelete: photos.map((p) => p.id),
    authAccountsToDeleteLast: listers.map((l) => l.id),
    totalRecords: listers.length + properties.length + photos.length,
  };
}

export async function confirmDelete(batchId) {
  const fb = await import("../firebase-client.js");
  const plan = await dryRun(batchId);
  const result = { batchId, deleted: { photos: 0, properties: 0, listers: 0, authAccounts: 0 }, errors: [] };

  for (const id of plan.photosToDelete) {
    try { await fb.deleteDocById("propertyPhotos", id); result.deleted.photos++; }
    catch (e) { result.errors.push("photo " + id + ": " + e.message); }
  }
  for (const id of plan.propertiesToDelete) {
    try { await fb.deleteDocById("properties", id); result.deleted.properties++; }
    catch (e) { result.errors.push("property " + id + ": " + e.message); }
  }
  for (const id of plan.listersToDelete) {
    try { await fb.deleteDocById("listers", id.id); result.deleted.listers++; }
    catch (e) { result.errors.push("lister " + id.id + ": " + e.message); }
  }
  // Auth accounts deleted last, and only reachable if currently signed in as
  // that user (client SDK cannot delete arbitrary other users) — flag as
  // manual step, consistent with Production Cleanup SOP v1.1.
  result.authAccountsRequireManualDeletion = plan.authAccountsToDeleteLast;
  return result;
}
