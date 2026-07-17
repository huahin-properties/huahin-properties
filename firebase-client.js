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
  authDomain: "huahin-properties-5f1b5.firebaseapp.com",
  projectId: "huahin-properties-5f1b5",
  storageBucket: "huahin-properties-5f1b5.firebasestorage.app",
  messagingSenderId: "264933237376",
  appId: "1:264933237376:web:61a10aa59d523934af3c65",
};

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

export async function setDoc(collectionName, id, data) {
  await db().collection(collectionName).doc(String(id)).set(data);
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
export async function savePhoto(propertyId, index, dataUrl) {
  const id = `${propertyId}-${index}`;
  const blob = await dataUrlToBlob(dataUrl);
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
export async function signInWithGoogle() {
  const a = authApp();
  if (!a) throw new Error("Firebase Auth SDK not loaded on this page.");
  const provider = new window.firebase.auth.GoogleAuthProvider();
  const cred = await a.signInWithPopup(provider);
  return cred.user.uid;
}

export async function signInWithFacebook() {
  const a = authApp();
  if (!a) throw new Error("Firebase Auth SDK not loaded on this page.");
  const provider = new window.firebase.auth.FacebookAuthProvider();
  const cred = await a.signInWithPopup(provider);
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

export async function saveLead(lead) {
  const id = "lead-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
  await setDoc("leads", id, { ...lead, createdAt: Date.now(), contacted: false });
  return id;
}

export async function fetchLeads() {
  const leads = await fetchCollection("leads");
  return leads.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function markLeadContacted(id, contacted) {
  await setDoc("leads", id, { contacted });
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

export function isAdminAuthed() {
  const a = authApp();
  return !!(a && a.currentUser);
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
      if (a) { const unsub = a.onAuthStateChanged((user) => { unsub(); resolve(user); }); return; }
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
  const system = `Translate the following real-estate listing description into all 8 languages. Respond with ONLY a JSON object, no markdown, no explanation, in this exact shape: {"th":"...","en":"...","ru":"...","zh":"...","de":"...","no":"...","fr":"...","it":"..."} — each value must be the FULL translation written entirely and naturally in that language's own script (never mixed languages), preserving the original meaning and tone.`;
  const messages = [{ role: "user", content: text }];
  const res = await fetch("https://claudecomplete-3j4ldf4pja-as.a.run.app", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ system, messages }),
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
  await db().collection("siteContent").doc("projectDashboard_backup_v1").set({ ...oldData, backedUpAt: Date.now() });
  return true;
}

export async function saveProjectDashboard(data, updatedByLabel) {
  await db().collection("siteContent").doc("projectDashboard").set({
    ...data, updatedAt: Date.now(), updatedBy: updatedByLabel || "admin",
  });
}

export async function fetchStripePrices() {
  const doc = await db().collection("siteContent").doc("stripePrices").get();
  return doc.exists ? doc.data() : { pro: "", agency: "", level3: "", level4: "" };
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
  await setDoc("properties", propertyId, { archiveScheduledAt: archiveAt, archived: false });
}

export async function cancelArchival(propertyId) {
  await setDoc("properties", propertyId, { archiveScheduledAt: null });
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
  await setDoc("listers", listerId, { agentCode: code });
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
      await setDoc("properties", p.id, { archived: true, archivedAt: now, photosDeletedAt: now });
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
  return { trial: 5, pro: 5, level3: 12, level4: 25 }[tier] || 0;
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
  await setDoc("listers", listerId, { tier: "trial", trialUsed: true, trialStartedAt: now, trialEndsAt });
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
export async function submitForApproval(propertyId, payload) {
  await setDoc("properties", propertyId, { ...(payload || {}), listingStatus: "pending", submittedAt: Date.now(), isDraft: false });
}

export async function approveListing(propertyId) {
  const now = Date.now();
  await setDoc("properties", propertyId, { listingStatus: "live", publishedAt: now, expiresAt: now + LISTING_DURATION_DAYS * 86400000, approvedAt: now, expiredAt: null, photosDeletedAt: null });
}

export async function rejectListing(propertyId, reason) {
  await setDoc("properties", propertyId, { listingStatus: "rejected", rejectedAt: Date.now(), rejectReason: reason || "" });
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
  await setDoc("properties", propertyId, { listingStatus: "live", publishedAt: now, expiresAt: now + LISTING_DURATION_DAYS * 86400000, expiredAt: null, photosDeletedAt: null });
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
      try { await setDoc("properties", p.id, { listingStatus: "expired", expiredAt: now }); expiredCount++; } catch (e) {}
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
        await setDoc("properties", p.id, { photosDeletedAt: now });
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
