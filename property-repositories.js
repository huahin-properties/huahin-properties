// Repository layer stubs (Step 2.2C — preparation only). NO Firestore reads
// or writes happen here yet; every function is a typed seam the UI can call
// today (returns safe empty/mock results) and swap for a real
// firebase-client.js-backed implementation later WITHOUT the UI changing
// its call shape. This is what "prepare for data integration" means here —
// not a live connection.

import { DATA_STATE } from "./property-adapter.js";

// Mock reviews mapped per propertyId so different listings don't show
// identical reviews (Step 2.2C finalization). Properties without a mapped
// entry return EMPTY, not a fabricated review set — this is still 100%
// sample data, clearly labeled as such in the UI, not real customer
// feedback for any property.
const MOCK_REVIEWS_BY_PROPERTY = {
  "HH-101": [
    { id: "r1", reviewer: "K. Somchai", rating: 5, date: "12 มิ.ย. 2569", comment: "บ้านสวยตรงตามรูป ทีมงานดูแลดีมาก นัดชมง่าย ตอบเร็ว" },
    { id: "r2", reviewer: "Sarah W.", rating: 4, date: "2 พ.ค. 2569", comment: "Great location, agent was very responsive. Would recommend." },
  ],
  "HH-102": [
    { id: "r3", reviewer: "K. Ananya", rating: 5, date: "18 เม.ย. 2569", comment: "ประทับใจการบริการ ข้อมูลครบถ้วนตรงไปตรงมา" },
  ],
};

/** Reviews Repository — proposed Firestore shape (not created):
 * reviews/{id}: { propertyId, reviewerName, rating, comment, createdAt, approved }
 * TODO(future): replace this function's body with
 * fb.fetchCollection("reviews") filtered by propertyId + approved == true,
 * once the collection exists and Product Owner has approved its security
 * rules — the { state, reviews, propertyId } return shape already matches
 * what that real call would need to produce, so the UI won't need to change. */
export async function fetchReviews(propertyId) {
  const mapped = MOCK_REVIEWS_BY_PROPERTY[propertyId];
  if (!mapped || !mapped.length) return { state: DATA_STATE.EMPTY, reviews: [], propertyId };
  return { state: DATA_STATE.LOADED, reviews: mapped, propertyId };
}

/** Viewing Requests Repository — proposed Firestore shape (not created):
 * viewingRequests/{id}: { propertyId, name, phone, requestedDate, createdAt, status }
 * TODO(future): replace with a real Firestore write once the collection and
 * its security rules exist and are approved. The caller already treats
 * this as async and branches on `ok`/`state`, so swapping this body is the
 * only change needed later — no UI rewrite. */
export async function submitViewingRequest(payload) {
  try {
    // Mock persistence only — never touches Firestore. Errors are still
    // caught and surfaced through the same {state, ok} shape a real write
    // would use, so error/permission-denied handling is exercised now.
    return { state: DATA_STATE.LOADED, ok: true, mock: true, payload };
  } catch (e) {
    return { state: DATA_STATE.ERROR, ok: false, error: e, payload };
  }
}

/** Media Repository — video/360 tour URLs. Proposed field: property doc's
 * `videoUrl` / `virtualTourUrl` (see property-adapter.js normalizeProperty).
 * TODO(future): source video/virtualTour from the normalized property model
 * once videoUrl/virtualTourUrl fields exist in real data — this function
 * already reads through the adapter-shaped property so no caller changes
 * are needed when that happens. */
export async function fetchMedia(normalizedProperty) {
  if (!normalizedProperty) return { state: DATA_STATE.LOADING, video: null, virtualTour: null };
  const video = normalizedProperty.hasVideo ? normalizedProperty.videoUrl : null;
  const virtualTour = normalizedProperty.hasVirtualTour ? normalizedProperty.virtualTourUrl : null;
  return { state: (video || virtualTour) ? DATA_STATE.LOADED : DATA_STATE.EMPTY, video, virtualTour };
}
