# RELEASE NOTES — Step 7

**Step**: Developer Maintenance Center — Phase 2
**Date**: 20 July 2026

## Files Modified
- `Developer Maintenance Center.dc.html` — added Storage Inventory, Dependency Checker, Audit Log tabs; parallel Firestore+Storage refresh; scan stage/duration display
- `firebase-client.js` — added `fetchStorageFolderInventory()` (read-only), added `errorCode` to `fetchCollectionCount()`

## New Features
- **Storage Inventory**: read-only file counts for `propertyPhotos/` and `profilePhotos/` folders. Size always shows "Not available from Client SDK" (never estimated).
- **Dependency Checker**: OK/Warning/Missing/Unknown status for Firebase SDK, Firestore, Auth, Storage (verified); Maps/Stripe/Cloud Functions/External Services (Unknown — not verifiable from client).
- **Audit Log**: in-memory session log (page opened, refresh, inventory completed, warnings), newest first, capped at 100 entries, no Firestore writes.
- **Firestore Health**: per-collection error codes surfaced; scan duration shown.
- **Parallel refresh**: Firestore + Storage scans run concurrently via `Promise.all`.

## Known Limitations
Storage folder size unavailable from Client SDK (expected — requires Admin SDK). Maps/Stripe/Cloud Functions/External Services dependency status is always "Unknown" (no client-side verification method exists yet).

## CEO Actions
None required for this phase — same upload workflow as Step 6 once ready to release.
