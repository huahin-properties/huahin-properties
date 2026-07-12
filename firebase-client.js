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
// NOTE: Firebase Storage on new projects requires the paid Blaze plan to
// provision a bucket. For a $0-cost setup, photos are instead stored
// directly in Firestore (see savePhoto/fetchPhotosFor below) — this
// function is kept for projects that DO have Storage enabled.
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

export async function savePhoto(propertyId, index, dataUrl) {
  const id = `${propertyId}-${index}`;
  await setDoc("propertyPhotos", id, { propertyId, index, dataUrl });
  return id;
}

export async function fetchPhotosFor(propertyId) {
  return fetchWhere("propertyPhotos", "propertyId", propertyId);
}

export async function fetchAllPhotos() {
  return fetchCollection("propertyPhotos");
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

const ADMIN_SESSION_KEY = "hh_admin_authed";
export function setAdminAuthed() {
  try { sessionStorage.setItem(ADMIN_SESSION_KEY, "1"); } catch (e) {}
}
export function isAdminAuthed() {
  try { return sessionStorage.getItem(ADMIN_SESSION_KEY) === "1"; } catch (e) { return false; }
}
export function logoutAdmin() {
  try { sessionStorage.removeItem(ADMIN_SESSION_KEY); } catch (e) {}
}
// Call at the top of componentDidMount in every admin-only page; redirects
// immediately (before any private data loads) if not signed in.
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
  const existing = await db().collection("siteContent").doc(id).get();
  const prior = existing.exists ? existing.data() : {};
  await setDoc("siteContent", id, { ...prior, photoUrl: dataUrl });
}

// Generic reference-photo storage for owner/tenant contact cards (2 photos
// each, no captions needed) — same Firestore-doc-per-photo approach as
// property photos, in its own "profilePhotos" collection keyed by an
// arbitrary slot id such as "owner-OWN-001-1".
export async function saveProfilePhoto(slotId, dataUrl) {
  await setDoc("profilePhotos", slotId, { dataUrl });
}

export async function fetchAllProfilePhotos() {
  return fetchCollection("profilePhotos");
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
