// firebase-client.js — shared Firebase client for huahin.properties
//
// Requires the Firebase compat SDK <script> tags to be loaded in <helmet>
// BEFORE this module is imported:
//   <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
//   <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>
//   <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-storage-compat.js"></script>
//
// This gives every page in the site a single real, shared backend:
// Firestore holds property/owner/tenant records (everyone sees the same
// data), and Storage holds uploaded photos served from a fast CDN URL —
// replacing the browser-only localStorage + local-file demo used earlier.

const firebaseConfig = {
  apiKey: "AIzaSyCTfx0ucOxEvfcP15Gf-SJEXRS-_-F1oWQ",
  // Same-site custom authDomain (a subdomain of huahin.properties itself,
  // now confirmed "Connected" in Firebase Hosting). The previous default
  // *.firebaseapp.com authDomain is a totally different site from
  // huahin.properties — browsers that block third-party cookies (Chrome's
  // current default) silently drop the sign-in result crossing that
  // cross-site boundary: Google shows success, the redirect lands back on
  // Agent Signup with no error and no signed-in user — exactly what was
  // reported. auth.huahin.properties is same-site (same huahin.properties
  // eTLD+1), so that storage/cookie relay isn't blocked.
  authDomain: "auth.huahin.properties",
  projectId: "huahin-properties-5f1b5",
  storageBucket: "huahin-properties-5f1b5.firebasestorage.app",
  messagingSenderId: "264933237376",
  appId: "1:264933237376:web:61a10aa59d523934af3c65",
};

// Initialize immediately on import — other modules (e.g. conversation-firestore.js)
// only import this file to guarantee the app exists first, they never call an
// exported function here, so lazy init-on-first-call is too late for them.
if (window.firebase && !window.firebase.apps.length) window.firebase.initializeApp(firebaseConfig);

let _app = null;
function getApp() {
  if (!_app) {
    if (!window.firebase) {
      throw new Error(
        "Firebase SDK not loaded — add the firebase-app-compat.js / " +
        "firebase-firestore-compat.js / firebase-storage-compat.js <script> " +
        "tags in <helmet> before importing firebase-client.js."
      );
    }
    _app = (window.firebase.apps && window.firebase.apps.length)
      ? window.firebase.app()
      : window.firebase.initializeApp(firebaseConfig);
  }
  return _app;
}

function db() { return getApp().firestore(); }
function storageRef() { return getApp().storage(); }

// ── Firestore helpers ───────────────────────────────────────────────────

export async function fetchCollection(name) {
  const snap = await db().collection(name).get();
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
}

// ── Developer Maintenance Center (DMC) — read-only helpers ──────────────
// Added for DMC Phase 1 (System Overview / Firestore Inventory). These are
// intentionally READ-ONLY: no create/update/delete. Client SDK cannot list
// Firebase Authentication users directly (that requires the Admin SDK on a
// server) — getCurrentAuthUser() only ever returns the signed-in caller's
// own identity, never a full user list. Firestore document counts use
// getCountFromServer() where the loaded SDK version supports it, falling
// back to a plain .get() + length count (still read-only either way) so
// this keeps working even on an older compat SDK build.
export function getCurrentAuthUser() {
  const a = authApp();
  const u = a && a.currentUser;
  return u ? { uid: u.uid, email: u.email || null } : null;
}

export function getSdkStatus() {
  const hasFirebase = typeof window !== "undefined" && !!window.firebase;
  let authOk = false, firestoreOk = false, storageOk = false;
  try { authOk = !!(hasFirebase && authApp()); } catch (e) {}
  try { firestoreOk = !!(hasFirebase && db()); } catch (e) {}
  try { storageOk = !!(hasFirebase && storageRef()); } catch (e) {}
  return { sdkLoaded: hasFirebase, authOk, firestoreOk, storageOk };
}

export async function fetchCollectionCount(name) {
  try {
    const ref = db().collection(name);
    if (typeof ref.count === "function") {
      // Firestore compat SDK count() aggregation, when available.
      const agg = await ref.count().get();
      return { collection: name, count: agg.data().count, accessStatus: "ok" };
    }
    const snap = await ref.get();
    return { collection: name, count: snap.size, accessStatus: "ok" };
  } catch (e) {
    const denied = e && (e.code === "permission-denied" || /permission/i.test(e.message || ""));
    return { collection: name, count: null, accessStatus: denied ? "permission-denied" : "error", error: String(e && e.message || e), errorCode: (e && e.code) || "" };
  }
}

// DMC Phase 2 — read-only Storage folder listing. Client SDK cannot report
// aggregate folder size (that requires Admin SDK / gsutil), so callers must
// show "Not available from Client SDK" rather than estimate one.
export async function fetchStorageFolderInventory(folderPath) {
  try {
    const ref = storageRef().ref(folderPath);
    const res = await ref.listAll();
    return { folder: folderPath, fileCount: res.items.length, subfolderCount: res.prefixes.length, accessStatus: "ok" };
  } catch (e) {
    const denied = e && (e.code === "storage/unauthorized" || /permission|unauthorized/i.test(e.message || ""));
    return { folder: folderPath, fileCount: null, subfolderCount: null, accessStatus: denied ? "permission-denied" : "error", error: String(e && e.message || e) };
  }
}

// merge:true is critical here — WITHOUT it, .set() fully REPLACES the
// document, so every partial-patch caller in this file (approveListing,
// rejectListing, scheduleArchival, cancelArchival, the archival/expiry/
// photo-purge sweeps, markLeadContacted, etc. — each only passes 1-3
// changed fields) would silently WIPE OUT every other field on that
// document (title, price, description, photos, ownerId, everything) each
// time it ran. Found auditing Listing Approvals: approveListing() only
// ever sent {listingStatus, publishedAt, expiresAt, approvedAt, expiredAt,
// photosDeletedAt} — clicking "อนุมัติ" would have destroyed the rest of
// the listing's data. merge:true makes every partial-patch call a safe,
// targeted update while leaving full-object callers (Admin/Lister
// Dashboard saves, which always pass the complete built object) unchanged.
// merge:true is critical here — WITHOUT it, .set() fully REPLACES the
// document, so every partial-patch caller in this file (approveListing,
// rejectListing, scheduleArchival, cancelArchival, the archival/expiry/
// photo-purge sweeps, markLeadContacted, etc. — each only passes 1-3
// changed fields) would silently WIPE OUT every other field on that
// document (title, price, description, photos, ownerId, everything) each
// time it ran. Found auditing Listing Approvals: approveListing() only
// ever sent {listingStatus, publishedAt, expiresAt, approvedAt, expiredAt,
// photosDeletedAt} — clicking "อนุมัติ" would have destroyed the rest of
// the listing's data. merge:true makes every partial-patch call a safe,
// targeted update while leaving full-object callers (Admin/Lister
// Dashboard saves, which always pass the complete built object) unchanged.
//
// Kept as the general-purpose function (many existing pages call this by
// name) — updateDocFields/createDoc/replaceDoc below are the same
// operation under clearer names for NEW call sites, so intent is explicit
// at the call site instead of only in this comment.
export async function setDoc(collectionName, id, data) {
  await db().collection(collectionName).doc(String(id)).set(data, { merge: true });
}

// Explicit-intent aliases (impact audit, July 2026 — see BLUEPRINT.md).
// All three currently do the same safe merge:true write; createDoc/
// replaceDoc are separated from updateDocFields only so a call site's
// PURPOSE (new doc vs. full overwrite vs. partial patch) is readable at
// a glance, not because their underlying behavior differs. If a genuine
// full-replace-wipe-other-fields need ever comes up, give replaceDoc
// its own real .set(data) (no merge) implementation instead of changing
// this shared one.
export async function updateDocFields(collectionName, id, fields) {
  return setDoc(collectionName, id, fields);
}
export async function createDoc(collectionName, id, data) {
  return setDoc(collectionName, id, data);
}
export async function replaceDoc(collectionName, id, data) {
  return setDoc(collectionName, id, data);
}

// Fresh single-doc read (bypasses any client-cached list) — use this right
// before merging/overwriting a doc's non-editable lifecycle fields, so a
// change made elsewhere (e.g. an admin approval) in between page load and
// save isn't silently clobbered by a stale client-side copy.
export async function fetchDocById(collectionName, id) {
  const snap = await db().collection(collectionName).doc(String(id)).get();
  return snap.exists ? { ...snap.data(), id: snap.id } : null;
}

export async function deleteDocById(collectionName, id) {
  await db().collection(collectionName).doc(String(id)).delete();
}

// Seeds a collection from an in-code array ONE TIME ONLY (if the
// collection is currently empty) — so the site launches with the 21
// sample listings already in Firestore instead of an empty database.
export async function seedIfEmpty(collectionName, items, idKey) {
  const existing = await db().collection(collectionName).limit(1).get();
  if (!existing.empty) return false;
  const batch = db().batch();
  items.forEach((item) => {
    const ref = db().collection(collectionName).doc(String(item[idKey]));
    batch.set(ref, item);
  });
  await batch.commit();
  return true;
}

// ── Storage helpers ──────────────────────────────────────────────────────

// Uploads a File/Blob to Firebase Storage at `path` and returns its
// public download URL (a real https CDN URL — safe to store in Firestore
// and render directly in <img src>).
// This project is on the Blaze plan, so Storage is enabled and every photo
// upload (savePhoto/saveProfilePhoto/saveSiteContentPhoto below) goes
// through here rather than being embedded as a Firestore data: URL.
export async function uploadImage(file, path) {
  const ref = storageRef().ref().child(path);
  await ref.put(file);
  return await ref.getDownloadURL();
}

// ── Photo storage via Firestore (no paid plan required) ──────────────────
// Each photo lives in its own doc in "propertyPhotos" (id = "<propertyId>-
// <index>"), holding a resized/compressed data: URL. Keeping photos in
// their own docs — instead of embedded in the property document — keeps
// each doc comfortably under Firestore's 1MB-per-document limit even for
// a property with several photos.

export async function fetchWhere(collectionName, field, value) {
  const snap = await db().collection(collectionName).where(field, "==", value).get();
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
}

// Resizes an image File/Blob to a data: URL capped at ~1000px longest
// side, WebP q=0.72 — keeps a real phone photo to roughly 60-120KB so a
// page rendering many properties' cover photos at once (Home, Search,
// Admin list) stays fast and well under Firestore's 1MB doc limit.
export async function fileToDataUrl(file, maxDim) {
  const bitmap = await createImageBitmap(file);
  try {
    const cap = maxDim || 1000;
    const scale = Math.min(1, cap / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);
    return canvas.toDataURL("image/webp", 0.72);
  } finally {
    bitmap.close && bitmap.close();
  }
}

// Converts a data: URL (from fileToDataUrl) into a Blob for uploading.
async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl);
  return await res.blob();
}

// Photos now upload the actual bytes to Firebase Storage (Blaze plan is
// active on this project) and store only the short https download URL in
// Firestore — keeps documents tiny and avoids the 1MB-per-doc ceiling that
// bit when many/large photos were embedded as base64 data: URLs directly.
// The Firestore field is still named "dataUrl" for backward compatibility
// with every page that already reads it — its value is just a URL now.
//
// IMPORTANT: `photoUrl` here is EITHER a brand-new "data:" URL straight out
// of fileToDataUrl() (a photo the user just picked), OR an already-hosted
// "https://...firebasestorage..." URL for a photo that existed before this
// save (just possibly moved to a new index because an earlier photo was
// deleted/reordered). Only the first case needs re-uploading. Fetching an
// already-hosted Storage download URL back into the browser to re-upload
// it fails with a CORS error — Firebase Storage's default bucket has no
// CORS policy for plain fetch() (an <img src> tag can display the URL with
// no CORS involved, but JS fetch() of the same URL is a real cross-origin
// request and gets blocked) — this doesn't need gsutil CORS setup to fix;
// simply never re-fetch bytes we already have hosted. So: if it's already
// an https URL, just (re)point the Firestore doc at it directly, no
// upload. If a caller explicitly needs to force a re-upload of an https
// URL for some other reason, they can still call uploadImage directly.
export async function savePhoto(propertyId, index, photoUrl) {
  const id = `${propertyId}-${index}`;
  if (typeof photoUrl === "string" && /^https?:\/\//i.test(photoUrl)) {
    await setDoc("propertyPhotos", id, { propertyId, index, dataUrl: photoUrl });
    return id;
  }
  const blob = await dataUrlToBlob(photoUrl);
  const url = await uploadImage(blob, `propertyPhotos/${id}.webp`);
  await setDoc("propertyPhotos", id, { propertyId, index, dataUrl: url });
  return id;
}

export async function fetchPhotosFor(propertyId) {
  return fetchWhere("propertyPhotos", "propertyId", propertyId);
}

export async function fetchAllPhotos() {
  return fetchCollection("propertyPhotos");
}

// ── Leads (from ContactRail contact form + auto-bot engagement) ──────────
// Captures each inquiry with the favorited properties + intent score at
// the moment of submission, so Admin can see which leads are "hot" (score
// crossed the auto-bot threshold) vs a routine inquiry.
// ── Self-serve accounts (Agent / homeowner signup) ────────────────────────
// Creates a Firebase Auth account for a new Agent/owner self-signup, then
// the caller writes their "listers" doc (status: pending) keyed by this
// UID. Kept separate from admin auth (adminSignIn) — this is a brand-new
// account, not a sign-in.
export async function createListerAccount(email, password) {
  const a = authApp();
  if (!a) throw new Error("Firebase Auth SDK not loaded on this page.");
  const cred = await a.createUserWithEmailAndPassword(email, password);
  // Free signups are auto-approved immediately (no admin queue) — email
  // verification is the rigor check instead, per BLUEPRINT.md §2 ทาง 2.
  try { await cred.user.sendEmailVerification(); } catch (e) { console.warn("sendEmailVerification failed:", e); }
  return cred.user.uid;
}

// ── Social / phone sign-in for self-serve listers (BLUEPRINT.md §2 ทาง 2:
// "ล็อกอินง่าย ไม่ต้องพิมพ์อีเมล/รหัสผ่านเอง"). Each returns the signed-in
// user's uid; the caller then creates the "listers" doc if this is a
// brand-new account (checked via a Firestore read on that uid), exactly
// like the email/password flow. Google/Facebook providers must be turned
// on in the Firebase Console (Authentication → Sign-in method) before
// these work — no code change needed after that.
// auth/argument-error is 100% reproducible on the very first popup call
// after a fresh page load (the Auth SDK's persistence layer is still
// opening) — confirmed by testing, same root cause as the old redirect
// flow had. A retry with NO delay (an awaited delay before signInWithPopup
// would break the browser's "this click directly opened a popup" gesture
// tracking and get the popup blocked) clears it reliably.
export async function signInWithGoogle() {
  const a = authApp();
  if (!a) throw new Error("Firebase Auth SDK not loaded on this page.");
  const attempt = async () => {
    const provider = new window.firebase.auth.GoogleAuthProvider();
    const cred = await a.signInWithPopup(provider);
    return cred.user.uid;
  };
  try {
    return await attempt();
  } catch (e) {
    if (e && e.code === "auth/argument-error") return await attempt();
    throw e;
  }
}

// Popup-based sign-in (signInWithPopup, above) is unreliable in some
// browsers/networks — third-party-cookie restrictions, popup blockers, or
// the popup silently losing its opener reference all cause an intermittent
// generic failure with no useful error, even though the same account signs
// in fine moments later. signInWithRedirect avoids all of that (a full-page
// navigation to Google and back, no popup/third-party-cookie dependency) and
// is Firebase's own recommended fix for this exact flakiness. The page must
// call getRedirectSignInResult() on load to pick up the result afterwards.
// In a browser that has never visited this site before, the Auth SDK's
// local persistence layer (IndexedDB) can still be opening when the user
// clicks Sign in on the very first page load — signInWithRedirect then
// throws "auth/argument-error" once, even though the exact same call
// succeeds a second later. Retrying once after a short pause papers over
// that startup race instead of showing the user a scary red error.
async function withAuthRetry(fn) {
  const delays = [300, 600, 1000, 1500];
  for (let i = 0; i < delays.length; i++) {
    try {
      return await fn();
    } catch (e) {
      if (e && e.code === "auth/argument-error") {
        await new Promise((r) => setTimeout(r, delays[i]));
        continue;
      }
      throw e;
    }
  }
  return await fn();
}

// Popup-based sign-in — avoids the cross-domain redirect relay entirely
// (no getRedirectResult() needed on page load, no dependency on
// auth.huahin.properties DNS/SSL being perfectly warmed up). This is the
// simplest reliable path for a site not hosted on Firebase Hosting itself.

// Call as early as possible on page load (componentDidMount), well before
// the user can click Google/Facebook — waits for Firebase Auth's own
// "ready" signal (onAuthStateChanged fires exactly once after the SDK's
// internal init, including its popup/redirect resolver, is fully settled)
// instead of guessing a fixed delay. This is what actually explained the
// "works after a full page refresh, never on the very first load" pattern:
// a timer-based delay could be too short; this waits for the real event.
export async function warmUpAuthPersistence() {
  const a = authApp();
  if (!a) return;
  try { await a.setPersistence(window.firebase.auth.Auth.Persistence.LOCAL); } catch (e) {}
  await new Promise((resolve) => {
    const unsub = a.onAuthStateChanged(() => { unsub(); resolve(); });
    setTimeout(resolve, 4000); // safety cap so a broken listener never hangs the page
  });
}

// Redirect-based sign-in — a full-page navigation to Google and back, not
// a popup. This avoids all popup/user-gesture browser quirks entirely
// (popups intermittently failed to open or got auto-closed on the very
// first attempt in a fresh browser — a fundamentally popup-specific
// problem, confirmed by testing). huahin.properties is now an authorized
// JavaScript origin in Google Cloud Console (it was not, during earlier
// redirect testing) — that was the real gap, not the redirect mechanism.
export async function signInWithGoogleRedirect() {
  const a = authApp();
  if (!a) throw new Error("Firebase Auth SDK not loaded on this page.");
  const attempt = async () => {
    const provider = new window.firebase.auth.GoogleAuthProvider();
    await a.signInWithRedirect(provider);
  };
  try {
    await attempt();
  } catch (e) {
    // signInWithRedirect (a plain location change, not a popup) still hit
    // auth/argument-error on the very first call in a fresh browser — same
    // as signInWithPopup did. Since this isn't popup/gesture-sensitive,
    // retrying immediately (no delay) is safe and doesn't have the
    // gesture-timing problem the popup retry had.
    if (e && e.code === "auth/argument-error") {
      await attempt();
      return;
    }
    throw e;
  }
}

export async function signInWithFacebookRedirect() {
  const a = authApp();
  if (!a) throw new Error("Firebase Auth SDK not loaded on this page.");
  const attempt = async () => {
    const provider = new window.firebase.auth.FacebookAuthProvider();
    provider.addScope("email");
    await a.signInWithRedirect(provider);
  };
  try {
    await attempt();
  } catch (e) {
    if (e && e.code === "auth/argument-error") {
      await attempt();
      return;
    }
    throw e;
  }
}

// LINE Login — Firebase has no built-in LINE provider, but LINE Login v2.1's
// OIDC endpoint plugs straight into Firebase's generic OpenID Connect
// provider (configured in Firebase Console → Authentication → Sign-in
// method → Add provider → OpenID Connect, provider ID "oidc.line", using the
// LINE Login channel's Channel ID/Secret). Same redirect flow as Google/FB.
export async function signInWithLineRedirect() {
  // Back on the main app (same one Google/Facebook use) — the earlier
  // "missing initial state" error very likely came from the same
  // duplicate-Firebase-load bug that broke Google (fixed in Agent
  // Signup.dc.html's helmet), not from authDomain. The separate "lineAuth"
  // app + credential-bridging approach introduced its own new failure
  // (auth/invalid-credential) and added complexity for no proven benefit —
  // reverting to the simple, already-working pattern.
  const a = authApp();
  if (!a) throw new Error("Firebase Auth SDK not loaded on this page.");
  const attempt = async () => {
    const provider = new window.firebase.auth.OAuthProvider("oidc.line");
    await a.signInWithRedirect(provider);
  };
  try {
    await attempt();
  } catch (e) {
    if (e && e.code === "auth/argument-error") {
      await attempt();
      return;
    }
    throw e;
  }
}

export async function getRedirectSignInResult() {
  const a = authApp();
  if (!a) return null;
  const result = await a.getRedirectResult();
  return result && result.user ? result.user.uid : null;
}

export async function signInWithFacebook() {
  const a = authApp();
  if (!a) throw new Error("Firebase Auth SDK not loaded on this page.");
  const attempt = async () => {
    const provider = new window.firebase.auth.FacebookAuthProvider();
    provider.addScope("email");
    const cred = await a.signInWithPopup(provider);
    return cred.user.uid;
  };
  try {
    return await attempt();
  } catch (e) {
    if (e && e.code === "auth/argument-error") return await attempt();
    throw e;
  }
}

// Popup version of LINE sign-in — added alongside signInWithGoogle/
// signInWithFacebook once the redirect flow (huahin.properties →
// auth.huahin.properties → back) proved intermittently flaky on mobile:
// the cross-domain relay depends on getRedirectResult() reading a result
// written by a different page load, which on some phones/networks came
// back empty on the first try and only worked on a second attempt. Popup
// avoids that relay entirely — the whole exchange happens without a
// full-page navigation away from huahin.properties.
export async function signInWithLine() {
  const a = authApp();
  if (!a) throw new Error("Firebase Auth SDK not loaded on this page.");
  const attempt = async () => {
    const provider = new window.firebase.auth.OAuthProvider("oidc.line");
    const cred = await a.signInWithPopup(provider);
    return cred.user.uid;
  };
  try {
    return await attempt();
  } catch (e) {
    if (e && e.code === "auth/argument-error") return await attempt();
    throw e;
  }
}

// LINE Login v2 — server-side OAuth (see functions/index.js: lineAuthStart /
// lineAuthCallback / lineAuthExchange). Replaces the Firebase-popup/redirect
// path above for the actual LINE button click; signInWithLine() above is
// left in place unused as a documented rollback point, not called anywhere.
const LINE_AUTH_START_URL = "https://asia-southeast1-huahin-properties-5f1b5.cloudfunctions.net/lineAuthStart";
const LINE_AUTH_EXCHANGE_URL = "https://asia-southeast1-huahin-properties-5f1b5.cloudfunctions.net/lineAuthExchange";

export function goToLineLogin() {
  window.location.href = LINE_AUTH_START_URL;
}

// Called once on page load when the URL carries ?lineExchange=<code> (the
// server redirected back with this after a successful LINE login). Trades
// the short-lived one-time code for a Firebase custom token and signs in —
// the custom token only ever exists in this HTTPS response body, never in
// a URL, so it can't leak via browser history or server logs.
export async function completeLineLogin(exchangeCode) {
  const res = await fetch(LINE_AUTH_EXCHANGE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: exchangeCode }),
  });
  const json = await res.json();
  if (!res.ok || !json.token) throw new Error(json.error || "exchange_failed");
  const a2 = authApp();
  if (!a2) throw new Error("Firebase Auth SDK not loaded on this page.");
  const cred = await a2.signInWithCustomToken(json.token);
  return cred.user.uid;
}

// Phone OTP is two steps: start (sends the SMS) then confirm (verifies the
// code the user typed). recaptchaContainerId must be an element ID already
// in the DOM (an invisible reCAPTCHA badge Firebase manages itself).
let _phoneConfirmation = null;

export async function startPhoneSignIn(phoneNumber, recaptchaContainerId) {
  const a = authApp();
  if (!a) throw new Error("Firebase Auth SDK not loaded on this page.");
  const verifier = new window.firebase.auth.RecaptchaVerifier(recaptchaContainerId, { size: "invisible" });
  _phoneConfirmation = await a.signInWithPhoneNumber(phoneNumber, verifier);
}

export async function confirmPhoneSignIn(code) {
  if (!_phoneConfirmation) throw new Error("ยังไม่ได้ขอรหัส OTP");
  const cred = await _phoneConfirmation.confirm(code);
  _phoneConfirmation = null;
  return cred.user.uid;
}

// AI Welcome Gateway search log — every query typed into the homepage's
// full-screen AI search box, stored with a rough parse (budget/beds/type
// keywords extracted client-side) so this becomes a structured demand
// signal over time, not just free text. Best-effort/non-blocking: callers
// should .catch(() => {}) this, a logging failure must never block search.
export async function logAiSearchQuery(query, lang) {
  const id = "aiq-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
  const lower = (query || "").toLowerCase();
  const bedMatch = lower.match(/(\d+)\s*(bed|bedroom|ห้องนอน|卧)/);
  const priceMatch = lower.match(/(\d+(?:\.\d+)?)\s*(m|million|ล้าน|万)/);
  await setDoc("aiSearchQueries", id, {
    query, lang: lang || "en", createdAt: Date.now(),
    parsedBedrooms: bedMatch ? Number(bedMatch[1]) : null,
    parsedBudgetHint: priceMatch ? priceMatch[0] : null,
  });
}

export async function saveLead(lead) {
  const id = "lead-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
  await setDoc("leads", id, { ...lead, createdAt: Date.now(), contacted: false });
  return id;
}

// ── Lister inbox (Phase 1 of the "real workspace" push) ───────────────────
// Reuses the existing "leads" collection (general contact-form inquiries,
// already tagged with propertyId) — just filtered down to the properties a
// given lister owns, so their Dashboard can show "customers contacted me"
// without a new collection or schema migration.
export async function fetchLeadsForProperties(propertyIds) {
  if (!propertyIds || !propertyIds.length) return [];
  const all = await fetchCollection("leads");
  const idSet = new Set(propertyIds);
  return all.filter((l) => idSet.has(l.propertyId)).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

// ── Lister appointments (Phase 3) ──────────────────────────────────────────
// Simple manual CRUD list, scoped to the lister's own uid. Not yet wired to
// the public "Schedule Viewing" button on Property Details (that request
// flow is mock-backed per property-repositories.js) — a real customer-side
// booking would need that button to call saveAppointment too; flagged as a
// follow-up, not done here.
export async function fetchAppointments(listerId) {
  const rows = await fetchWhere("appointments", "listerId", listerId);
  return rows.sort((a, b) => (a.when || 0) - (b.when || 0));
}

export async function saveAppointment(listerId, appt) {
  const id = "appt-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
  await setDoc("appointments", id, { ...appt, listerId, status: "upcoming", createdAt: Date.now() });
  return id;
}

export async function updateAppointmentStatus(id, status) {
  await updateDocFields("appointments", id, { status });
}

export async function deleteAppointment(id) {
  await deleteDocById("appointments", id);
}

export async function fetchLeads() {
  const leads = await fetchCollection("leads");
  return leads.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function markLeadContacted(id, contacted = true) {
  await updateDocFields("leads", id, { contacted });
}

// ── Activity log + monthly targets (Aug 2026, staff performance tracking) ──
// Every meaningful team action writes one small activityLog doc automatically
// (never typed by hand) so the Owner can see real work and real statistics
// without asking, and the staff member can see their own progress. Fire and
// forget: a failed log write must NEVER block the action the user just took.
export async function logActivity(entry) {
  try {
    const a = authApp();
    const user = a && a.currentUser;
    const id = "act-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
    await setDoc("activityLog", id, {
      ...(entry || {}),
      actorUid: user ? user.uid : "",
      actorEmail: user ? (user.email || "") : "",
      at: Date.now(),
    });
  } catch (e) { console.warn("logActivity failed (non-blocking):", e); }
}

export async function fetchWhereGte(collectionName, field, value, limitN) {
  let q = db().collection(collectionName).where(field, ">=", value).orderBy(field, "desc");
  if (limitN) q = q.limit(limitN);
  const snap = await q.get();
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
}

// Bounded read — only the requested window, capped, so cost stays flat even
// as activityLog grows forever (it is append-only by design).
export async function fetchActivityLog(sinceMs) {
  try {
    return await fetchWhereGte("activityLog", "at", sinceMs || 0, 500);
  } catch (e) {
    console.warn("fetchActivityLog failed:", e);
    return [];
  }
}

// Monthly targets are Owner-set (staff read-only, enforced in firestore.rules).
// Doc id is the month key "YYYY-MM" so history is kept automatically.
export function monthKey(d) {
  const dt = d || new Date();
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
}

export async function fetchMonthlyTargets(key) {
  try {
    const doc = await db().collection("monthlyTargets").doc(key || monthKey()).get();
    return doc.exists ? doc.data() : null;
  } catch (e) { console.warn("fetchMonthlyTargets failed:", e); return null; }
}

export async function saveMonthlyTargets(key, targets) {
  await setDoc("monthlyTargets", key || monthKey(), { ...(targets || {}), updatedAt: Date.now() });
}

// ── One-time migration: existing photos saved as huge base64 data: URLs
// (from before Storage was enabled) get re-uploaded to Storage and their
// Firestore doc updated to hold the short URL instead. Safe to run more
// than once — already-migrated docs (dataUrl starting with "https:") are
// skipped. Call once from Admin Dashboard's system-status panel.
export async function migrateExistingPhotosToStorage(onProgress) {
  let migrated = 0, skipped = 0, failed = 0;
  const jobs = [
    { collection: "propertyPhotos", pathPrefix: "propertyPhotos" },
    { collection: "profilePhotos", pathPrefix: "profilePhotos" },
    { collection: "siteContent", pathPrefix: "siteContent", field: "photoUrl" },
  ];
  for (const job of jobs) {
    const docs = await fetchCollection(job.collection);
    for (const d of docs) {
      const field = job.field || "dataUrl";
      const val = d[field];
      if (!val || !val.startsWith("data:")) { skipped++; continue; }
      try {
        const blob = await dataUrlToBlob(val);
        const url = await uploadImage(blob, `${job.pathPrefix}/${d.id}.webp`);
        await setDoc(job.collection, d.id, { ...d, [field]: url });
        migrated++;
      } catch (e) {
        console.warn(`Migration failed for ${job.collection}/${d.id}:`, e);
        failed++;
      }
      if (onProgress) onProgress({ migrated, skipped, failed });
    }
  }
  return { migrated, skipped, failed };
}

// ── Facebook post footer (fixed block appended to every AI-generated
// Facebook caption — hashtags + contact info) — editable from Site Content ──
const DEFAULT_FB_FOOTER = `#HuaHin #HouseForSale #HouseForRent #RealEstate #BeachLiving #Property #HuaHinProperty #HuaHinTown #Convenience #BeachfrontLiving

‼️ ช่องทางติดต่อเรา
เพจขายบ้าน
https://www.m.me/huahinpropertyhuahinrealestate/
เพจบ้านเช่า
https://www.m.me/HuaHinRentalVillasApartmentCondosVacati.../
กลุ่มตลาดซื้อขายบ้านและที่ดินหัวหิน
Hua Hin Property
https://www.facebook.com/groups/179909282791693/?ref=share_group_link
กลุ่มตลาดบ้านเช่าหัวหิน
Hua Hin House for rent
https://www.facebook.com/groups/999627083412222/?ref=share_group_link
-📱โทรติดต่อ : 0851785480 (คุณปิ๋ม)
-📱 เบอร์สำรอง : 0805820777 (คุณเจต)
www.huahin.properties
@huahinproperties
https://lin.ee/rGhvAdJ
อีเมลล์ : doothailand@gmail.com`;

export async function fetchFacebookFooter() {
  try {
    const doc = await db().collection("settings").doc("facebook").get();
    if (doc.exists && doc.data().footer) return doc.data().footer;
  } catch (e) {
    console.warn("fetchFacebookFooter failed, using default:", e);
  }
  return DEFAULT_FB_FOOTER;
}

export async function saveFacebookFooter(footer) {
  await setDoc("settings", "facebook", { footer });
}

// ── Admin credentials (stored in Firestore so they can be changed from the
// Admin panel without redeploying code) ──────────────────────────────────
// NOTE: this is a lightweight gate to keep casual visitors out of the admin
// tools, not real security — anyone who opens devtools can read Firestore
// rules/data. Before handling real customer/owner data in production,
// replace this with proper Firebase Authentication (email+password or SSO).
const DEFAULT_ADMIN_CREDENTIALS = {
  username: "132435",
  password: "qewret",
  recoveryEmail: "doothailand@gmail.com",
  recoveryPhone: "0805820777",
};

export async function fetchAdminCredentials() {
  try {
    const doc = await db().collection("settings").doc("admin").get();
    if (doc.exists) return { ...DEFAULT_ADMIN_CREDENTIALS, ...doc.data() };
  } catch (e) {
    console.warn("fetchAdminCredentials failed, using defaults:", e);
  }
  return DEFAULT_ADMIN_CREDENTIALS;
}

export async function saveAdminCredentials(fields) {
  const existing = await fetchAdminCredentials();
  await setDoc("settings", "admin", { ...existing, ...fields });
}

// Actually changes the real Firebase Auth password used by adminSignIn —
// saveAdminCredentials() above only stores a display copy in Firestore and
// never touched the real login credential, which caused "รหัสผ่านไม่ถูกต้อง"
// confusion (the stored text didn't match what Firebase Auth actually
// checks). Requires the admin to be currently signed in; Firebase may throw
// auth/requires-recent-login if the session is old — caller should ask the
// admin to log out/in again and retry in that case.
export async function updateAdminPassword(newPassword) {
  const a = authApp();
  const user = a && a.currentUser;
  if (!user) throw new Error("ต้องล็อกอินก่อนถึงจะเปลี่ยนรหัสผ่านได้");
  await user.updatePassword(newPassword);
}

// ── Admin auth (real Firebase Authentication — Email/Password) ───────────
// Replaces the old sessionStorage-flag placeholder. Every admin-only page
// must load firebase-auth-compat.js in <helmet> alongside the other
// Firebase SDK scripts for these to work.
function authApp() {
  if (typeof window === "undefined" || !window.firebase || !window.firebase.auth) return null;
  return getApp().auth();
}

export async function adminSignIn(email, password) {
  const a = authApp();
  if (!a) throw new Error("Firebase Auth SDK not loaded on this page.");
  await a.signInWithEmailAndPassword(email, password);
}

// Tracks whether the CURRENT signed-in user has actually been verified as
// admin/staff (matches Firestore's isAdmin() rule: hardcoded owner UID OR
// an adminUsers/{uid} doc exists) — set by onAdminAuthReady() below. Before
// this fix, isAdminAuthed() only checked "is ANY Firebase user signed in",
// so a ordinary lister/trial account (signed in for their own Lister
// Dashboard) could open every admin-only page (Admin Dashboard, Owners,
// Site Content, Property Map, AI Quick Add) and see internal data — the
// UI never verified the signed-in identity was actually an admin, it just
// checked "signed in at all". Firestore Rules already correctly restrict
// actual writes to real admins, but the page itself must not render for a
// non-admin visitor at all.
let _verifiedAdminUid = null; // uid string once confirmed admin, else null

async function verifyRealAdmin(uid) {
  if (!uid) { _verifiedAdminUid = null; return false; }
  try {
    // This exact read is gated by `allow read: if isAdmin();` in
    // firestore.rules — it throws permission-denied for any non-admin uid,
    // so a successful (even empty) result IS the admin proof. Mirrors the
    // server-side isAdmin() check instead of trusting "just signed in".
    await db().collection("adminUsers").doc(uid).get();
    _verifiedAdminUid = uid;
    return true;
  } catch (e) {
    _verifiedAdminUid = null;
    return false;
  }
}

export function isAdminAuthed() {
  const a = authApp();
  return !!(a && a.currentUser && _verifiedAdminUid === a.currentUser.uid);
}

// Real signed-in email, straight from Firebase Auth — used as the
// authoritative source for "email you signed up with" displays and as a
// fallback for older lister docs that were saved with email: "" (a bug in
// the social sign-in path that hardcoded an empty string instead of
// reading the real email off the Google/Facebook account).
export function currentAuthEmail() {
  const a = authApp();
  return (a && a.currentUser && a.currentUser.email) || "";
}

export function logoutAdmin() {
  const a = authApp();
  if (a) a.signOut().catch(() => {});
}

// Firebase Auth restores a signed-in session asynchronously (reads
// IndexedDB) on every page load. Admin pages must await this ONCE at the
// top of componentDidMount, BEFORE calling requireAdminAuth() — otherwise
// a genuinely signed-in admin can get bounced back to the login page by a
// false "not signed in yet" read.
export function onAdminAuthReady() {
  return new Promise((resolve) => {
    // The Firebase SDK <script> tags load async in <helmet> — on a slow
    // connection/cold cache, window.firebase can still be undefined the
    // instant componentDidMount runs. Poll briefly instead of treating
    // "SDK not loaded yet" as "definitely signed out": that was a real bug
    // that permanently bounced genuinely signed-in users back to login.
    let waited = 0;
    const poll = () => {
      const a = authApp();
      if (a) {
        const unsub = a.onAuthStateChanged(async (user) => {
          unsub();
          // Verify real admin status (see verifyRealAdmin above) BEFORE
          // resolving, so requireAdminAuth()'s synchronous check right
          // after this await already has the correct answer.
          if (user) await verifyRealAdmin(user.uid);
          else _verifiedAdminUid = null;
          resolve(user);
        });
        return;
      }
      waited += 50;
      if (waited >= 8000) { resolve(null); return; }
      setTimeout(poll, 50);
    };
    poll();
  });
}

// Call at the top of componentDidMount in every admin-only page (after
// awaiting onAdminAuthReady()); redirects immediately if not signed in.
export function requireAdminAuth() {
  if (!isAdminAuthed()) {
    // Signed in as SOME account but not a verified admin (e.g. a lister/
    // trial account that stumbled onto an admin URL) — sign them out of
    // that non-admin session before sending to the login screen, so the
    // Admin Login page doesn't see a leftover non-admin session and so a
    // shared/public device doesn't stay signed in as that other person.
    const a = authApp();
    if (a && a.currentUser) a.signOut().catch(() => {});
    window.location.href = "Admin Login.dc.html";
    return false;
  }
  return true;
}

// ── Maintenance / "coming soon" mode ─────────────────────────────────────
// Lets Admin hide the public site behind a simple splash screen while still
// building/fixing it, toggled with one button on Site Content — no
// redeploy needed. This is a casual-visitor deterrent (a client-side check
// on each public page), not real server-side security — good enough to
// keep ordinary visitors from seeing work-in-progress, not to stop a
// determined technical person.
export async function fetchMaintenanceMode() {
  try {
    const doc = await db().collection("siteContent").doc("maintenance").get();
    return doc.exists ? !!doc.data().on : false;
  } catch (e) {
    console.warn("fetchMaintenanceMode failed, defaulting to off:", e);
    return false;
  }
}

export async function saveMaintenanceMode(on) {
  await setDoc("siteContent", "maintenance", { on });
}

// Unlocking the splash with the admin password remembers the visitor's
// browser indefinitely (localStorage, not sessionStorage) so Admin can
// browse the live public pages smoothly without re-entering it every visit.
const SITE_BYPASS_KEY = "hh_site_bypass";
export function setSiteBypass() {
  try { localStorage.setItem(SITE_BYPASS_KEY, "1"); } catch (e) {}
}
export function hasSiteBypass() {
  try { return localStorage.getItem(SITE_BYPASS_KEY) === "1"; } catch (e) { return false; }
}

// ── Site content (homepage hero + area cards) ───────────────────────────
// Lets Admin replace the homepage hero photo and each area card's photo +
// description without touching code. Stored as its own small collection so
// it's independent of property data. Photos reuse the same resized data:
// URL approach as property photos (no paid Storage plan required).
export async function fetchSiteContent() {
  const docs = await fetchCollection("siteContent");
  const byId = {};
  docs.forEach((d) => { byId[d.id] = d; });
  return byId;
}

export async function saveSiteContentText(id, desc) {
  const existing = await db().collection("siteContent").doc(id).get();
  const prior = existing.exists ? existing.data() : {};
  await setDoc("siteContent", id, { ...prior, desc });
}

export async function saveSiteContentPhoto(id, dataUrl) {
  const blob = await dataUrlToBlob(dataUrl);
  const url = await uploadImage(blob, `siteContent/${id}.webp`);
  const existing = await db().collection("siteContent").doc(id).get();
  const prior = existing.exists ? existing.data() : {};
  await setDoc("siteContent", id, { ...prior, photoUrl: url });
}

// Generic reference-photo storage for owner/tenant contact cards (2 photos
// each, no captions needed) — same Firestore-doc-per-photo approach as
// property photos, in its own "profilePhotos" collection keyed by an
// arbitrary slot id such as "owner-OWN-001-1".
export async function saveProfilePhoto(slotId, dataUrl) {
  const blob = await dataUrlToBlob(dataUrl);
  const url = await uploadImage(blob, `profilePhotos/${slotId}.webp`);
  await setDoc("profilePhotos", slotId, { dataUrl: url });
  return url;
}

// Public-safe single-lister lookup (Agent Profile.dc.html — anyone visiting
// a lister's shared personal site, no sign-in required, per firestore.rules).
export async function fetchListerById(id) {
  const doc = await db().collection("listers").doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function fetchAllProfilePhotos() {
  return fetchCollection("profilePhotos");
}

// ── Property Collections (agent/admin curated shareable sets) ───────────
// A named, shareable list of property IDs an admin or agent builds by
// filtering their own (or all) listings — sent to a specific client as a
// public link, no login required to view (Collection View.dc.html).
export async function saveCollection({ ownerType, ownerId, ownerLabel, name, propertyIds }) {
  const id = "col-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
  await setDoc("propertyCollections", id, {
    ownerType, ownerId, ownerLabel: ownerLabel || "", name, propertyIds: propertyIds || [],
    createdAt: Date.now(), updatedAt: Date.now(),
  });
  return id;
}

export async function fetchCollectionsByOwner(ownerType, ownerId) {
  const all = await fetchWhere("propertyCollections", "ownerId", ownerId);
  return all.filter((c) => c.ownerType === ownerType);
}

export async function fetchCollectionById(id) {
  return fetchDocById("propertyCollections", id);
}

export async function renameCollection(id, name) {
  await updateDocFields("propertyCollections", id, { name, updatedAt: Date.now() });
}

export async function updateCollectionProperties(id, propertyIds) {
  await updateDocFields("propertyCollections", id, { propertyIds, updatedAt: Date.now() });
}

export async function deleteCollectionDoc(id) {
  await deleteDocById("propertyCollections", id);
}

// ── Stripe (subscriptions for Agents/homeowners) ──────────────────────────
// Same Cloud Functions project/region as the Claude proxy above — the URL
// hash is fixed per-project, only the function name segment changes. After
// `firebase deploy --only functions`, the terminal prints the REAL URLs;
// if they don't match this guessed pattern, update these two constants.
const CHECKOUT_URL = "https://asia-southeast1-huahin-properties-5f1b5.cloudfunctions.net/createCheckoutSession";
const PORTAL_URL = "https://asia-southeast1-huahin-properties-5f1b5.cloudfunctions.net/createPortalSession";
const FEATURED_CHECKOUT_URL = "https://asia-southeast1-huahin-properties-5f1b5.cloudfunctions.net/createFeaturedCheckoutSession";

export async function startFeaturedCheckout(propertyId, days, amountThb) {
  const res = await fetch(FEATURED_CHECKOUT_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ propertyId, days, amountThb }),
  });
  const data = await res.json();
  if (!res.ok || !data.url) throw new Error(data.error || "ไม่สามารถเริ่มการชำระเงินได้");
  window.location.href = data.url;
}

const BANNER_CHECKOUT_URL = "https://asia-southeast1-huahin-properties-5f1b5.cloudfunctions.net/createBannerCheckoutSession";

export async function startBannerCheckout(bannerId, position, amountThb, email) {
  const res = await fetch(BANNER_CHECKOUT_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ bannerId, position, amountThb, email }),
  });
  const data = await res.json();
  if (!res.ok || !data.url) throw new Error(data.error || "ไม่สามารถเริ่มการชำระเงินได้");
  window.location.href = data.url;
}

// Banner slot pricing per position (THB / 30 days) — admin-editable.
export async function fetchBannerPrices() {
  const doc = await db().collection("siteContent").doc("bannerPrices").get();
  return doc.exists ? doc.data() : { top: "", mid: "", side: "" };
}

export async function saveBannerPrices(prices) {
  await setDoc("siteContent", "bannerPrices", prices);
}

export async function startCheckout(priceId, listerId, email, tier) {
  const res = await fetch(CHECKOUT_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ priceId, listerId, email, tier }),
  });
  const data = await res.json();
  if (!res.ok || !data.url) throw new Error(data.error || "ไม่สามารถเริ่มการชำระเงินได้");
  window.location.href = data.url;
}

const VIP_CHECKOUT_URL = "https://asia-southeast1-huahin-properties-5f1b5.cloudfunctions.net/createVipCheckoutSession";

// Homeowner VIP pool boost (ทาง 4) — admin triggers on the owner's behalf,
// same one-time dynamic-price pattern as Featured/Banner.
export async function startVipCheckout(propertyId, tier, amountThb) {
  const res = await fetch(VIP_CHECKOUT_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ propertyId, tier, amountThb }),
  });
  const data = await res.json();
  if (!res.ok || !data.url) throw new Error(data.error || "ไม่สามารถเริ่มการชำระเงินได้");
  window.location.href = data.url;
}

// Homeowner VIP tier pricing (THB / 30 days per tier) — admin-editable.
export async function fetchHomeownerVipPrices() {
  const doc = await db().collection("siteContent").doc("homeownerVipPrices").get();
  return doc.exists ? doc.data() : { silver: "", gold: "", diamond: "" };
}

export async function saveHomeownerVipPrices(prices) {
  await setDoc("siteContent", "homeownerVipPrices", prices);
}

// Agent VIP subscription Stripe Price IDs per tier — admin-editable (real
// Stripe Products/Prices needed since these are recurring subscriptions).
export async function fetchAgentVipPrices() {
  const doc = await db().collection("siteContent").doc("agentVipPrices").get();
  return doc.exists ? doc.data() : { silver: "", gold: "", diamond: "" };
}

export async function saveAgentVipPrices(prices) {
  await setDoc("siteContent", "agentVipPrices", prices);
}

// Rollout level (1-4) gating how much of the paid feature set is visible —
// see BLUEPRINT.md §12 rollout plan. 1 = free-only, 2 = plan tiers visible,
// 3-4 = Agent VIP visible. Single admin-controlled switch, no code changes
// needed to advance a stage.
export async function fetchRolloutLevel() {
  const doc = await db().collection("siteContent").doc("rollout").get();
  return doc.exists ? (doc.data().level || 1) : 1;
}

export async function saveRolloutLevel(level) {
  await setDoc("siteContent", "rollout", { level });
}

// Founding Agents (BLUEPRINT.md §2 ทาง 2) — capped free-signup window during
// launch. limit=0/empty means unlimited (feature off).
export async function fetchFoundingAgentSettings() {
  const doc = await db().collection("siteContent").doc("foundingAgents").get();
  return doc.exists ? { limit: doc.data().limit || 0, note: doc.data().note || "" } : { limit: 0, note: "" };
}

export async function saveFoundingAgentSettings(settings) {
  await setDoc("siteContent", "foundingAgents", settings);
}

export async function countFoundingAgents() {
  const snap = await db().collection("listers").where("foundingAgent", "==", true).get();
  return snap.size;
}

export async function openBillingPortal(customerId) {
  const res = await fetch(PORTAL_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ customerId }),
  });
  const data = await res.json();
  if (!res.ok || !data.url) throw new Error(data.error || "ไม่สามารถเปิดหน้าจัดการสมาชิกได้");
  window.location.href = data.url;
}

export async function fetchMyListerDoc() {
  const a = authApp();
  const user = a && a.currentUser;
  if (!user) return null;
  const doc = await db().collection("listers").doc(user.uid).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

// Stripe Price IDs per tier — kept admin-editable in Site Content (not
// hardcoded) so pricing/plan changes never require a code redeploy.
// Auto-translates a self-serve listing description into all 8 site languages
// in one AI call — used by Lister Dashboard when an agent saves a property,
// so the description shows correctly translated everywhere (cards, modal,
// AI chat) without a separate "translate" button, same pre-translated
// approach as the main site's AI Quick Add (one AI call at save time, never
// a live per-view translation).
export async function translateDescriptionAll(text) {
  if (!text || !text.trim()) return null;
  const system = `The input text may be written in any language (Thai, English, or otherwise). First understand its full meaning regardless of source language, then translate it into all 8 languages below. Respond with ONLY a JSON object, no markdown, no explanation, in this exact shape: {"th":"...","en":"...","ru":"...","zh":"...","de":"...","no":"...","fr":"...","it":"..."} — each value must be the FULL translation written entirely and naturally in that language's own script (never mixed languages), preserving the original meaning and tone. Every one of the 8 fields must be filled even if the source text was already in that language.`;
  const messages = [{ role: "user", content: text }];
  const res = await fetch("https://claudecomplete-3j4ldf4pja-as.a.run.app", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ system, messages, max_tokens: 4000 }),
  });
  const data = await res.json();
  const raw = data.completion || data.reply || data.text || "";
  try {
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match ? match[0] : cleaned);
    // Firestore rejects any field with an `undefined` value — guarantee all
    // 8 keys are always present (falling back to the original text for any
    // language the AI happened to skip) so a partial AI response can never
    // corrupt the save.
    const LANGS = ["th", "en", "ru", "zh", "de", "no", "fr", "it"];
    const safe = {};
    LANGS.forEach((l) => { safe[l] = (parsed && parsed[l]) || text; });
    return safe;
  } catch (e) {
    console.warn("translateDescriptionAll: failed to parse AI response", e);
    return null;
  }
}

// CEO Project Dashboard (BLUEPRINT.md "living status" companion) — a single
// structured doc, NOT plain text like saveSiteContentText. Firestore stores
// nested objects/arrays natively so phases/modules/history all round-trip
// as real arrays/objects, not a serialized blob. Locked to admin-only read
// AND write in firestore.rules (carved out of the public siteContent rule).
export async function fetchProjectDashboard() {
  const doc = await db().collection("siteContent").doc("projectDashboard").get();
  return doc.exists ? doc.data() : null;
}

// One-time safety copy of the pre-v2 doc, taken automatically the first time
// the schema migration runs — never overwritten again, so the original v1
// data is always recoverable even if something goes wrong with v2.
export async function saveProjectDashboardBackup(oldData) {
  const existing = await db().collection("siteContent").doc("projectDashboard_backup_v1").get();
  if (existing.exists) return false;
  await db().collection("siteContent").doc("projectDashboard_backup_v1").set({ ...oldData, backedUpAt: Date.now() }, { merge: true });
  return true;
}

export async function saveProjectDashboard(data, updatedByLabel) {
  await db().collection("siteContent").doc("projectDashboard").set({
    ...data, updatedAt: Date.now(), updatedBy: updatedByLabel || "admin",
  }, { merge: true });
}

export async function fetchStripePrices() {
  const doc = await db().collection("siteContent").doc("stripePrices").get();
  return doc.exists ? doc.data() : { pro: "", agency: "", level3: "", level4: "", proAnnual: "", level3Annual: "", level4Annual: "" };
}

export async function saveStripePrices(prices) {
  await setDoc("siteContent", "stripePrices", prices);
}

// Featured Listing boost pricing (THB per duration) — admin-editable, no
// Stripe Product/Price needed since checkout uses dynamic price_data.
export async function fetchFeaturedPrices() {
  const doc = await db().collection("siteContent").doc("featuredPrices").get();
  return doc.exists ? doc.data() : { p7: "", p30: "" };
}

export async function saveFeaturedPrices(prices) {
  await setDoc("siteContent", "featuredPrices", prices);
}

// Returns "owner" | "staff" | null (null = not a team member yet, e.g. the
// account exists in Firebase Auth but was never added as Owner/Staff).
export async function fetchMyRole() {
  const a = authApp();
  const user = a && a.currentUser;
  if (!user) return null;
  if (user.uid === "n7TZKSBscPXE1kRU8WzYpsqJh2g2") return "owner";
  try {
    const doc = await db().collection("adminUsers").doc(user.uid).get();
    return doc.exists ? doc.data().role : null;
  } catch (e) {
    return null;
  }
}

export async function fetchTeam() {
  const [members, invites] = await Promise.all([
    fetchCollection("adminUsers"),
    fetchCollection("staffInvites"),
  ]);
  return { members, invites };
}

export async function inviteStaff(email) {
  const key = email.trim().toLowerCase();
  await setDoc("staffInvites", key, { email: key, role: "staff", invitedAt: Date.now() });
}

export async function revokeInvite(email) {
  await deleteDocById("staffInvites", email.trim().toLowerCase());
}

export async function removeTeamMember(uid) {
  await deleteDocById("adminUsers", uid);
}

// Called by Staff Signup after createUserWithEmailAndPassword succeeds —
// completes the loop by writing their own adminUsers/{uid} doc (allowed by
// the Firestore rule only when a matching staffInvites/{email} exists).
export async function completeStaffSignup(email) {
  const a = authApp();
  const user = a && a.currentUser;
  if (!user) throw new Error("Not signed in.");
  await setDoc("adminUsers", user.uid, { role: "staff", email: email.trim().toLowerCase(), joinedAt: Date.now() });
  await deleteDocById("staffInvites", email.trim().toLowerCase()).catch(() => {});
}


// ── Listing lifecycle: auto-archive photos for closed/expired listings ───
// A property becomes eligible for archival when its `archiveScheduledAt`
// (epoch ms) timestamp has passed. We keep all Firestore text data forever
// (price, description, owner) — only the photo BINARY files in Storage get
// deleted, since those are what actually consume space. This runs as a
// client-side sweep triggered from the Admin Dashboard on load (there is no
// server-side cron in this project) — so it only fires when an admin opens
// the dashboard, not on a fixed schedule. Note this limitation if a listing
// needs to be archived exactly on time regardless of admin activity.
export async function scheduleArchival(propertyId, archiveAt) {
  await updateDocFields("properties", propertyId, { archiveScheduledAt: archiveAt, archived: false });
}

export async function cancelArchival(propertyId) {
  await updateDocFields("properties", propertyId, { archiveScheduledAt: null });
}

// Full delete — used by the lister's own "ลบทรัพย์ทั้งใบ" button (Lister
// Dashboard). Removes photo files from Storage, their Firestore docs, and
// finally the property doc itself. Irreversible — unlike archival (which
// only strips photos and keeps the listing record for history).
export async function deletePropertyFully(propertyId) {
  const photos = await fetchPhotosFor(propertyId);
  for (const ph of photos) {
    try {
      if (ph.dataUrl && ph.dataUrl.startsWith("https://")) {
        const path = decodeURIComponent(new URL(ph.dataUrl).pathname.split("/o/")[1].split("?")[0]);
        await storageRef().ref(path).delete().catch(() => {});
      }
    } catch (e) {}
    await deleteDocById("propertyPhotos", ph.id).catch(() => {});
  }
  await deleteDocById("properties", propertyId);
}

// ── Buyer Registration / Agent Code (BLUEPRINT.md §2 ทาง 4) ──────────────
// Procuring-cause style dispute prevention for VIP agents: whoever registers
// a buyer for a property FIRST keeps the claim for a protection window.

export function generateAgentCode() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `HHP-A${n}`;
}

export async function ensureAgentCode(listerId, existingCode) {
  if (existingCode) return existingCode;
  const code = generateAgentCode();
  await updateDocFields("listers", listerId, { agentCode: code });
  return code;
}

const BUYER_PROTECTION_DAYS = 60;

// Returns { ok:true, registration } on success, or { ok:false, conflict }
// if this phone/email is already registered for this property by someone
// else within the protection window (first timestamp wins).
export async function registerBuyer(propertyId, listerId, agentCode, buyer) {
  const phone = (buyer.phone || "").replace(/\D/g, "");
  const email = (buyer.email || "").trim().toLowerCase();
  const snap = await db().collection("buyerRegistrations").where("propertyId", "==", propertyId).get();
  const now = Date.now();
  const existing = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const conflict = existing.find((r) => {
    if (r.listerId === listerId) return false;
    if (r.protectionUntil && r.protectionUntil < now) return false;
    const samePhone = phone && r.phone === phone;
    const sameEmail = email && r.email === email;
    return samePhone || sameEmail;
  });
  if (conflict) return { ok: false, conflict };
  const id = "buyer-" + Date.now();
  const registration = {
    propertyId, listerId, agentCode: agentCode || "",
    buyerName: buyer.name || "", phone, email,
    registeredAt: now, protectionUntil: now + BUYER_PROTECTION_DAYS * 24 * 60 * 60 * 1000,
  };
  await setDoc("buyerRegistrations", id, registration);
  return { ok: true, registration: { id, ...registration } };
}

// Teaser stats (BLUEPRINT.md §2 ทาง 4 — "Mutual Social Proof") — counts of
// properties/agents in each VIP pool, shown as a locked preview to whoever
// hasn't unlocked that tier yet (numbers only, no identifying details).
export async function fetchVipPoolStats() {
  const now = Date.now();
  const [propsSnap, listersSnap] = await Promise.all([
    db().collection("properties").where("vipTier", "in", ["silver", "gold", "diamond"]).get(),
    db().collection("listers").where("vipTier", "in", ["silver", "gold", "diamond"]).get(),
  ]);
  const count = (snap, tier, field) => snap.docs.filter((d) => {
    const data = d.data();
    return data.vipTier === tier && (field ? data[field] > now : true);
  }).length;
  return {
    silverProps: count(propsSnap, "silver", "vipUntil"), goldProps: count(propsSnap, "gold", "vipUntil"), diamondProps: count(propsSnap, "diamond", "vipUntil"),
    silverAgents: count(listersSnap, "silver"), goldAgents: count(listersSnap, "gold"), diamondAgents: count(listersSnap, "diamond"),
  };
}

export async function runArchivalSweep(properties) {
  const now = Date.now();
  const due = (properties || []).filter(
    (p) => p.archiveScheduledAt && p.archiveScheduledAt <= now && !p.archived
  );
  let archivedCount = 0;
  for (const p of due) {
    try {
      const photos = await fetchPhotosFor(p.id);
      for (const ph of photos) {
        try {
          if (ph.dataUrl && ph.dataUrl.startsWith("https://")) {
            const path = decodeURIComponent(new URL(ph.dataUrl).pathname.split("/o/")[1].split("?")[0]);
            await storageRef().ref(path).delete().catch(() => {});
          }
        } catch (e) {}
        await deleteDocById("propertyPhotos", ph.id).catch(() => {});
      }
      await updateDocFields("properties", p.id, { archived: true, archivedAt: now, photosDeletedAt: now });
      archivedCount += 1;
    } catch (e) {
      console.warn("Archival failed for", p.id, e);
    }
  }
  return archivedCount;
}


// ── AI knowledge notes ──────────────────────────────────────────────────
// Free-text notes (title + body) Admin can add/edit/delete from Site
// Content. The AI chat widget (ContactRail) pulls all of these in as extra
// context alongside the property listings — e.g. "current promotion",
// "updated contact number". Delete a note and the AI stops mentioning it.
export async function fetchAiNotes() {
  const docs = await fetchCollection("aiNotes");
  return docs.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
}

export async function saveAiNote(id, title, body) {
  const noteId = id || ("note-" + Date.now());
  const existing = await db().collection("aiNotes").doc(noteId).get();
  const prior = existing.exists ? existing.data() : { createdAt: Date.now() };
  await setDoc("aiNotes", noteId, { ...prior, title, body });
  return noteId;
}

export async function deleteAiNote(id) {
  await deleteDocById("aiNotes", id);
}

// ── AI restricted topics ────────────────────────────────────────────────
// Free-text instructions Admin writes describing things the AI chat must
// NOT reveal or discuss (e.g. total number of listings, commission rates,
// owner identities). Stored as a single doc, injected into every chat
// system prompt as a hard restriction list.
export async function fetchAiRestrictions() {
  const doc = await db().collection("siteContent").doc("aiRestrictions").get();
  return doc.exists ? doc.data().text || "" : "";
}

export async function saveAiRestrictions(text) {
  await setDoc("siteContent", "aiRestrictions", { text });
}

// ── AI persona ───────────────────────────────────────────────────────────
// Lets Admin name/re-cast the chat assistant (e.g. swap "Anna" for another
// name, or change her role from "AI assistant" to "Senior Agent") without
// touching code. Both fields are plugged straight into the chat's system
// prompt.
export async function fetchAiPersona() {
  const doc = await db().collection("siteContent").doc("aiPersona").get();
  return doc.exists ? { name: doc.data().name || "", role: doc.data().role || "" } : { name: "", role: "" };
}

export async function saveAiPersona(name, role) {
  await setDoc("siteContent", "aiPersona", { name, role });
}

// ── Listing lifecycle v2 (กรกฎาคม 2026) — Trial + 30-day expiry + admin
// approval queue. Replaces the old "instant self-serve publish" model
// (isDraft toggle only). See BLUEPRINT.md §2 ทาง 2 (rewritten) for the
// full business rationale. Kept alongside the legacy `isDraft` field for
// backward compatibility with any listing saved before this change.
//
// properties.listingStatus: "pending" | "live" | "expired" | "rejected"
//   pending  — submitted by lister, awaiting admin approval, not public
//   live     — approved, public, counts down from publishedAt+30d
//   expired  — 30 days passed since publishedAt, hidden but NOT deleted
//   rejected — admin declined (text stays, hidden, lister can resubmit)
// properties.publishedAt / expiresAt — epoch ms, set on approve/renew
// properties.viewCount — incremented on every Property Details view
// listers.tier === "trial" + trialStartedAt/trialEndsAt/trialUsed(perm.)

const LISTING_DURATION_DAYS = 30;
const TRIAL_DURATION_DAYS = 30;
const PHOTO_PURGE_DAYS_AFTER_EXPIRY = 90;

// Listing quota per tier — trial shares Level 1's cap (5) per the "no
// downgrade shock" design: trial → Level 1 keeps the same 5-listing room.
export function tierQuota(tier) {
  return { trial: 5, pro: 5, level3: 15, level4: 25 }[tier] || 0;
}

export async function isTrialEligible(listerId) {
  const doc = await db().collection("listers").doc(listerId).get();
  const data = doc.exists ? doc.data() : {};
  return !data.trialUsed && !data.tier;
}

// One-time, non-renewing 30-day trial — 5 listings, full visibility
// accelerator (equivalent to Level 3: all listings featured + homepage).
// `trialUsed` is set permanently and never cleared, even after the trial
// ends or the lister upgrades, so a person cannot re-trial with the same
// account.
export async function startTrial(listerId) {
  const doc = await db().collection("listers").doc(listerId).get();
  const data = doc.exists ? doc.data() : {};
  if (data.trialUsed) throw new Error("คุณใช้สิทธิ์ทดลองฟรีไปแล้ว ไม่สามารถเริ่มใหม่ได้อีก");
  const now = Date.now();
  const trialEndsAt = now + TRIAL_DURATION_DAYS * 86400000;
  await updateDocFields("listers", listerId, { tier: "trial", trialUsed: true, trialStartedAt: now, trialEndsAt });
  return trialEndsAt;
}

// Grace period (3 days) after trial ends before the visibility accelerator
// actually drops — softens the "everything disappears at once" shock and
// gives one last countdown nudge to upgrade before losing it.
const TRIAL_GRACE_DAYS = 3;

export function trialStatus(lister) {
  if (!lister || lister.tier !== "trial" || !lister.trialEndsAt) return null;
  const now = Date.now();
  const daysLeft = Math.ceil((lister.trialEndsAt - now) / 86400000);
  const graceEndsAt = lister.trialEndsAt + TRIAL_GRACE_DAYS * 86400000;
  return {
    daysLeft, endsAt: lister.trialEndsAt,
    inGrace: now > lister.trialEndsAt && now <= graceEndsAt,
    ended: now > graceEndsAt,
    nearEnd: daysLeft <= 7 && daysLeft >= 0,
  };
}

// Submits a new/edited listing for admin approval — the lister's own write
// is only ever allowed to move a listing INTO "pending" (see
// firestore.rules); only the admin can move pending → live/rejected.
// Auto-publish (Aug 2026 policy change — see chat log): a lister's own
// listing goes straight to "live" the moment they submit it, no admin
// wait. Admin still reviews after the fact from Listing Approvals.dc.html
// and can force a listing "offline" there at any time (see
// setPropertyOffline/reinstateProperty below) if it turns out to be wrong
// or harmful — that decision sticks until admin reinstates it (Firestore
// rules block a lister from flipping "offline" back to "live" themselves).
export async function submitForApproval(propertyId, payload, opts) {
  const now = Date.now();
  // Staff (adminUsers role "staff") may prepare a listing but never publish
  // it — their submit lands in "pending_owner" for the Owner to approve in
  // Listing Approvals. Firestore rules enforce this too, so a modified
  // client can't bypass it. Owners and ordinary paying listers publish
  // straight to "live" as before.
  if (opts && opts.staffPending) {
    await setDoc("properties", propertyId, {
      ...(payload || {}), listingStatus: "pending_owner", submittedAt: now, isDraft: false,
    });
    return;
  }
  await setDoc("properties", propertyId, {
    ...(payload || {}), listingStatus: "live", submittedAt: now, isDraft: false,
    publishedAt: now, expiresAt: now + LISTING_DURATION_DAYS * 86400000, approvedAt: now,
  });
}

// Reads the signed-in user's admin role from adminUsers/{uid}: "owner",
// "staff", or null when they are not a team member at all. Used to decide
// whether a save publishes immediately or goes into the Owner approval
// queue (see submitForApproval above).
export async function fetchAdminRole() {
  const a = authApp();
  const user = a && a.currentUser;
  if (!user) return null;
  try {
    const doc = await db().collection("adminUsers").doc(user.uid).get();
    if (doc.exists && doc.data().role) return doc.data().role;
  } catch (e) { console.warn("fetchAdminRole (uid) failed:", e); }
  // The Lister Dashboard signs in with the team member's own lister account,
  // whose Firebase UID differs from the Admin Login account UID stored in
  // adminUsers. Fall back to matching on the verified email claim so an
  // Owner/Staff is recognised in the dashboard too.
  try {
    const email = (user.email || "").trim().toLowerCase();
    if (!email) return null;
    const snap = await db().collection("adminUsers").where("email", "==", email).limit(1).get();
    if (!snap.empty) {
      const d = snap.docs[0].data();
      if (d.role) return d.role;
    }
  } catch (e) { console.warn("fetchAdminRole (email) failed:", e); }
  return null;
}

// Admin-only: takes a live listing offline (hidden from the public site)
// without deleting it — used when a report or manual review turns up a
// problem. reason is stored for the admin's own record only.
// Lister-controlled pause/resume for their own already-live listing —
// distinct from admin setPropertyOffline: freely reversible by the lister,
// unlike "offline" which only an admin can undo (see firestore.rules
// listerListingStatusOk — "paused" is allowed both ways, "offline" isn't).
export async function setListerPropertyPaused(propertyId, paused) {
  await updateDocFields("properties", propertyId, { listingStatus: paused ? "paused" : "live" });
}

export async function setPropertyOffline(propertyId, reason) {
  await updateDocFields("properties", propertyId, { listingStatus: "offline", offlineAt: Date.now(), offlineReason: reason || "" });
}

// Admin-only: reverses setPropertyOffline, putting the listing back live.
export async function reinstateProperty(propertyId) {
  await updateDocFields("properties", propertyId, { listingStatus: "live", offlineAt: null, offlineReason: null });
}

// Public: anyone (no login required) can flag a listing for admin review.
// Written to its own collection rather than onto the property doc so a
// visitor's report can never touch the listing itself.
export async function reportProperty(propertyId, reason, contact) {
  const id = `${propertyId}_${Date.now()}`;
  await setDoc("propertyReports", id, {
    propertyId, reason: reason || "", contact: contact || "", createdAt: Date.now(), resolved: false,
  });
}

// Admin-only: marks a report as handled (keeps it for the record, just no
// longer counted in the "ยังไม่จัดการ" badge).
export async function resolveReport(reportId) {
  await updateDocFields("propertyReports", reportId, { resolved: true, resolvedAt: Date.now() });
}

export async function approveListing(propertyId) {
  const now = Date.now();
  await updateDocFields("properties", propertyId, { listingStatus: "live", publishedAt: now, expiresAt: now + LISTING_DURATION_DAYS * 86400000, approvedAt: now, expiredAt: null, photosDeletedAt: null });
}

export async function rejectListing(propertyId, reason) {
  await updateDocFields("properties", propertyId, { listingStatus: "rejected", rejectedAt: Date.now(), rejectReason: reason || "" });
}

// Client-side mirror of the Firestore rule's listerHasActivePaidPackage() —
// used to decide what the UI shows (button vs. upgrade prompt). This is
// NOT the real enforcement (that lives in firestore.rules and can't be
// bypassed) — it's purely so the UI doesn't show a button that would then
// fail with a confusing permission error.
export function hasActivePaidPackage(lister) {
  if (!lister) return false;
  const paidTiers = ["pro", "agency", "level3", "level4"];
  return lister.subscriptionStatus === "active" && paidTiers.includes(lister.tier);
}

// Renewing an expired listing does NOT require re-approval (per business
// rule: owner can reactivate instantly without re-entering data) — resets
// the 30-day clock immediately. ONLY allowed when the lister currently
// holds an active PAID package (P1 fix "Membership Renewal Logic" —
// trial/no-package listers must upgrade instead of renewing for free).
// The real gate is the Firestore rule (listerHasActivePaidPackage there);
// this client-side check just fails fast with a clear message instead of
// letting Firestore's generic permission-denied bubble up unexplained.
export async function renewListing(propertyId, lister) {
  if (!hasActivePaidPackage(lister)) {
    throw new Error("ต่ออายุฟรีได้เฉพาะบัญชีที่มีแพ็กเกจจ่ายเงินที่ยัง active อยู่ — กรุณาอัปเกรดแพ็กเกจก่อน");
  }
  const now = Date.now();
  await updateDocFields("properties", propertyId, { listingStatus: "live", publishedAt: now, expiresAt: now + LISTING_DURATION_DAYS * 86400000, expiredAt: null, photosDeletedAt: null });
}

export async function fetchPendingListings() {
  return fetchWhere("properties", "listingStatus", "pending");
}

export async function incrementViewCount(propertyId) {
  try {
    await db().collection("properties").doc(propertyId).update({
      viewCount: window.firebase.firestore.FieldValue.increment(1),
    });
  } catch (e) { console.warn("incrementViewCount failed:", e); }
}

// Client-side sweep (no server-side cron in this project, same limitation
// as runArchivalSweep above — only fires when an admin has the dashboard
// open): (1) flips "live" listings past their expiresAt to "expired"
// (hidden from public, all data + cover photo kept); (2) once a listing
// has been expired 90+ days without renewal, deletes its non-cover photo
// files from Storage to save space (cover photo + all text/price data are
// kept forever).
export async function runExpirySweep(properties) {
  const now = Date.now();
  let expiredCount = 0, photosPurged = 0;
  for (const p of properties || []) {
    if (p.listingStatus === "live" && p.expiresAt && p.expiresAt <= now) {
      try { await updateDocFields("properties", p.id, { listingStatus: "expired", expiredAt: now }); expiredCount++; } catch (e) {}
    }
    if (p.listingStatus === "expired" && p.expiredAt && (now - p.expiredAt) > PHOTO_PURGE_DAYS_AFTER_EXPIRY * 86400000 && !p.photosDeletedAt) {
      try {
        const photos = await fetchPhotosFor(p.id);
        const nonCover = photos.filter((ph) => ph.id !== `${p.id}-0`);
        for (const ph of nonCover) {
          try {
            if (ph.dataUrl && ph.dataUrl.startsWith("https://")) {
              const path = decodeURIComponent(new URL(ph.dataUrl).pathname.split("/o/")[1].split("?")[0]);
              await storageRef().ref(path).delete().catch(() => {});
            }
          } catch (e) {}
          await deleteDocById("propertyPhotos", ph.id).catch(() => {});
        }
        await updateDocFields("properties", p.id, { photosDeletedAt: now });
        photosPurged++;
      } catch (e) { console.warn("Photo purge failed for", p.id, e); }
    }
  }
  return { expiredCount, photosPurged };
}

// Admin duplicate-trial detection (BLUEPRINT §2 ข้อ 6) — groups listers by
// normalized phone number and flags any group where more than one account
// shares a phone AND at least one of them already used a trial. Heuristic
// only (phone numbers can be shared legitimately, e.g. family) — admin
// makes the final call.
export async function findDuplicateTrialSuspects() {
  const listers = await fetchCollection("listers");
  const byPhone = {};
  listers.forEach((l) => {
    const phone = (l.phone || "").replace(/\D/g, "");
    if (!phone) return;
    (byPhone[phone] = byPhone[phone] || []).push(l);
  });
  return Object.values(byPhone).filter((group) => group.length > 1 && group.some((l) => l.trialUsed));
}


// STEP 2A — the Staff workflow needs to stamp "who claimed this case" on a
// submission. Everything else already reads the signed-in admin through
// fetchAdminRole(); this is the same lookup without the Firestore round-trip.
export function currentAdminUser() {
  const a = authApp();
  const user = a && a.currentUser;
  return user ? { uid: user.uid, email: user.email || "" } : null;
}


// ── Case conversation (STEP 2B.2) ────────────────────────────────────────
// Multi-round message history for an owner-submission case, stored as a
// subcollection of the property so it inherits the case's identity and the
// existing trackToken authorises the customer side. Append-only: every
// send is a NEW doc, so a later round can never overwrite an earlier one.

export async function fetchCaseMessages(propertyId, customerOnly) {
  // A customer (not signed in) may only read messages marked visible to
  // them, so the QUERY itself has to carry that filter — an unfiltered read
  // is rejected outright by the security rules. Staff/Owner read everything.
  let q = db().collection("properties").doc(String(propertyId)).collection("caseMessages");
  if (customerOnly) q = q.where("visibility", "==", "customer");
  const snap = await q.get();
  return snap.docs
    .map((d) => ({ ...d.data(), id: d.id }))
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
}

export async function addCaseMessage(propertyId, msg) {
  const ref = await db().collection("properties").doc(String(propertyId))
    .collection("caseMessages").add({ createdAt: Date.now(), ...msg });
  return ref.id;
}

// Translate one message via the SAME server-side Claude proxy the chatbot
// already uses — the API key stays a Firebase secret, never in the browser.
// Returns the translated text, or the original if translation fails (never
// blocks a message from being sent).
export async function translateMessage(text, targetLang) {
  const names = { th: "Thai", en: "English", zh: "Chinese (Simplified)", ru: "Russian", de: "German", no: "Norwegian", fr: "French", it: "Italian" };
  const target = names[targetLang] || "Thai";
  try {
    const res = await fetch("https://claudecomplete-3j4ldf4pja-as.a.run.app", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({
        system: `Translate the user's message into ${target}. This is a real-estate enquiry between a property owner and an agency in Hua Hin, Thailand. Reply with ONLY the translation — no notes, no quotes, no explanation. Keep property codes, numbers, prices and proper nouns exactly as written.`,
        messages: [{ role: "user", content: text }],
        max_tokens: 1500, model: "claude-haiku-4-5",
      }),
    });
    const data = await res.json();
    const out = (data.reply || data.completion || "").trim();
    return out || text;
  } catch (e) {
    console.warn("translateMessage failed:", e);
    return text;
  }
}

// AI drafts a Thai reply for Staff. Sends only the case essentials and the
// recent conversation — never the whole database — to keep cost predictable.
export async function draftCaseReply(caseSummary, recentThaiMessages) {
  const convo = (recentThaiMessages || []).slice(-8)
    .map((m) => (m.direction === "inbound" ? "ลูกค้า: " : "ทีมงาน: ") + (m.thaiText || m.originalText || "")).join("\n");
  try {
    const res = await fetch("https://claudecomplete-3j4ldf4pja-as.a.run.app", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({
        system: "คุณเป็นผู้ช่วยของทีมงาน huahin.properties (นายหน้าอสังหาริมทรัพย์ หัวหิน/ปราณบุรี/ชะอำ) ช่วยร่างข้อความภาษาไทยที่สุภาพ กระชับ เป็นมืออาชีพ เพื่อส่งให้เจ้าของทรัพย์ที่ฝากขาย/ฝากเช่า โดยดูจากข้อมูลเคสและบทสนทนาที่ผ่านมา ถ้ายังขาดข้อมูลสำคัญ ให้ถามอย่างชัดเจนทีละข้อ ตอบกลับเป็นข้อความที่พร้อมส่งเท่านั้น ไม่ต้องอธิบายเพิ่ม ไม่ต้องใส่เครื่องหมายคำพูด ห้ามสัญญาเรื่องราคา ค่าคอมมิชชั่น หรือเงื่อนไขทางกฎหมายแทนทีมงาน",
        messages: [{ role: "user", content: "ข้อมูลเคส:\n" + caseSummary + "\n\nบทสนทนาที่ผ่านมา:\n" + (convo || "(ยังไม่มี)") + "\n\nช่วยร่างข้อความถัดไปที่ควรส่งให้ลูกค้า" }],
        max_tokens: 700, model: "claude-haiku-4-5",
      }),
    });
    const data = await res.json();
    return (data.reply || data.completion || "").trim();
  } catch (e) {
    console.warn("draftCaseReply failed:", e);
    throw e;
  }
}
