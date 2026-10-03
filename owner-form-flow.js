// LISTING-E2E-01 — the logic behind Owner Submission.dc.html, kept in a plain module so it can be tested without a browser.
//
// What it guarantees (tests/listing/recovery.test.js):
//   • the form fields, the submission key and the list of photos ALREADY UPLOADED survive a refresh (localStorage);
//   • each photo is uploaded to the submitter's private staging folder THE MOMENT it is chosen, once (slots are create-only);
//     after a refresh only photos that are not uploaded yet need to be chosen again;
//   • a submit whose answer was lost (network, closed tab) is repeated with the SAME key and gets the SAME Case back — no
//     duplicate Case, no second upload, nothing for the customer to re-enter;
//   • a chat draft pre-fills the form (type, sale/rent, price, pin) but never over something the customer typed, and the
//     customer's edits go back to the draft through the server (which decides provenance and protects Staff edits).
import { photoStandardFor } from "./photo-standard.js";
import { missingForSubmit } from "./submission-checklist.js";

const STORE_KEY = "hhOwnerForm.v1";
export const MAX_SLOTS = 30; // the server accepts at most 30 photos per Case; slots are numbered 0..29 and never reused
const BLANK = () => ({ fields: { name: "", phone: "", email: "", txnType: "", type: "villa", condition: "resale", price: "", priceMode: "fixed", area: "", commercialSubtype: "", description: "", coords: "", ownerContact: "" },
  touched: {}, key: "", uid: "", slots: [], nextSlot: 0, doc: null, done: null, prefilled: [] });
const COORDS_RE = /^\s*-?\d{1,3}(\.\d+)?\s*,\s*-?\d{1,3}(\.\d+)?\s*$/;
const TYPES = ["villa", "house", "townhouse", "condo", "land", "commercial"];

export function randomKey(cryptoObj) {
  const rnd = new Uint8Array(18);
  (cryptoObj || (typeof crypto !== "undefined" ? crypto : null)).getRandomValues(rnd);
  return "k" + Array.from(rnd).map((b) => b.toString(36).padStart(2, "0")).join("").slice(0, 30);
}

export class OwnerFormFlow {
  // deps.storage: {getItem,setItem,removeItem}; deps.fb: {ensureSignedIn, uploadCaseStagingPhoto, submitListingCase, getPropertyDraft?, updatePropertyDraft?}
  constructor(deps) { this.d = deps; this.s = BLANK(); this.busy = false; this.load(); }

  // ── persistence ────────────────────────────────────────────────────────
  load() {
    try {
      const raw = this.d.storage.getItem(STORE_KEY);
      if (raw) { const o = JSON.parse(raw); const b = BLANK(); this.s = Object.assign(b, o, { fields: Object.assign(b.fields, o.fields || {}) }); }
    } catch (e) { this.s = BLANK(); }
    if (!/^[A-Za-z0-9_-]{16,64}$/.test(this.s.key || "")) this.s.key = randomKey(this.d.crypto);
    return this.s;
  }
  save() { try { this.d.storage.setItem(STORE_KEY, JSON.stringify(this.s)); } catch (e) { /* storage full / blocked: the form still works, it just can not survive a refresh */ } }
  get state() { return this.s; }

  // ── fields ─────────────────────────────────────────────────────────────
  setField(k, v) { this.s.fields[k] = v; this.s.touched[k] = true; this.save(); }
  photoRule() { return photoStandardFor(this.s.fields.type); }
  photoCount() { return this.s.slots.length; }
  // ONE checklist (submission-checklist.js = the server's own): what is still missing before the form may be sent. Completeness (a percentage) is not computed here.
  missing() { const f = this.s.fields; return missingForSubmit({ txnType: f.txnType, type: f.type, price: f.price, priceMode: f.priceMode, area: f.area, coords: f.coords, commercialSubtype: f.commercialSubtype, name: f.name, phone: f.phone, email: f.email }, this.photoCount()); }
  canSubmit() { return this.missing().length === 0; }

  // ── chat draft → form (never over what the customer typed) ─────────────
  async prefillFromDraft() {
    if (!this.d.fb.getPropertyDraft) return [];
    let res; try { res = await this.d.fb.getPropertyDraft(); } catch (e) { return []; }
    const df = (res && res.fields) || {};
    const val = (k) => (df[k] && df[k].value !== undefined ? df[k].value : undefined);
    const map = [["type", "type", (v) => TYPES.includes(v)], ["status", "txnType", (v) => v === "sale" || v === "rent"], ["price", "price", (v) => Number(v) > 0], ["coordsRaw", "coords", (v) => COORDS_RE.test(String(v))]];
    const applied = [];
    for (const [dk, fk, ok] of map) {
      const v = val(dk);
      if (v === undefined || !ok(v)) continue;
      if (this.s.touched[fk] || this.s.prefilled.includes(fk)) continue; // typed by the customer (theirs wins) or already filled in from the draft once
      if (fk === "type" && this.s.fields.type !== "villa" && this.s.fields.type !== v) continue; // not the untouched default
      this.s.fields[fk] = String(v); applied.push(fk);
    }
    if (applied.length) { this.s.prefilled = Array.from(new Set(this.s.prefilled.concat(applied))); this.save(); }
    return applied;
  }
  // Customer edits go back to the draft through the server (it stamps the source; a Staff value is not overwritten by it).
  async saveToDraft() {
    if (!this.d.fb.updatePropertyDraft) return null;
    const f = this.s.fields, out = {};
    if (TYPES.includes(f.type) && this.s.touched.type) out.type = f.type;
    if ((f.txnType === "sale" || f.txnType === "rent") && this.s.touched.txnType) out.status = f.txnType;
    if (Number(f.price) > 0 && this.s.touched.price) out.price = Number(f.price);
    if (COORDS_RE.test(f.coords) && this.s.touched.coords) out.coordsRaw = f.coords.trim();
    if (!Object.keys(out).length) return null;
    try { return await this.d.fb.updatePropertyDraft(out); } catch (e) { return null; }
  }

  // ── photos: uploaded once, at the moment they are chosen ───────────────
  async _uid() {
    const uid = await this.d.fb.ensureSignedIn();
    if (this.s.uid && this.s.uid !== uid) { // another browser identity: the staged files belong to the old one and can not be used
      this.s.slots = []; this.s.nextSlot = 0; this.s.doc = null; this.s.lostPhotos = true; this.s.key = randomKey(this.d.crypto);
    }
    this.s.uid = uid; this.save();
    return uid;
  }
  async addPhoto(data, thumb) {
    if (this.s.nextSlot >= MAX_SLOTS) throw Object.assign(new Error("photo_slots_used"), { code: "photo_slots_used" });
    const uid = await this._uid();
    const n = this.s.nextSlot;
    // the slot number is only consumed after the upload succeeded: a failed or repeated attempt re-uses the same slot
    // (the upload helper treats "already there" as success because slots are create-only)
    const path = await this.d.fb.uploadCaseStagingPhoto(uid, this.s.key, String(n), data);
    this.s.slots.push({ n, path, thumb: thumb || "" }); this.s.nextSlot = n + 1; this.save();
    return path;
  }
  removePhoto(path) { this.s.slots = this.s.slots.filter((x) => x.path !== path); this.save(); }
  async setOwnershipDoc(data) { const uid = await this._uid(); this.s.doc = await this.d.fb.uploadCaseStagingPhoto(uid, this.s.key, "doc", data); this.save(); return this.s.doc; }

  // ── submit ─────────────────────────────────────────────────────────────
  async submit() {
    if (this.busy) return this.busyResult || null; // a second click while the first is running does nothing
    if (this.s.done) return this.s.done;
    if (!this.canSubmit()) throw Object.assign(new Error("form_incomplete"), { code: "form_incomplete" });
    this.busy = true;
    try {
      const uid = await this._uid();
      const f = this.s.fields;
      const res = await this.d.fb.submitListingCase({
        submissionKey: this.s.key, txnType: f.txnType, type: f.type, condition: f.condition, price: f.priceMode === "appraisal" ? null : Number(f.price), priceMode: f.priceMode, area: f.area, commercialSubtype: f.type === "commercial" ? f.commercialSubtype : "", description: f.description, coordsRaw: f.coords,
        submitter: { name: f.name, phone: f.phone, email: f.email },
        propertyOwner: { relation: this.d.relation || undefined, name: "", contact: f.ownerContact },
        language: this.d.language || "th",
        photos: this.s.slots.map((x) => ({ path: x.path })), ownershipDocPath: this.s.doc || "",
      });
      const r = (res && res.data) ? res.data : res;
      this.s.done = { propertyId: r.propertyId, trackToken: r.trackToken, alreadyExisted: !!r.alreadyExisted };
      // the Case exists: what the customer typed and uploaded is no longer needed on this device (keep the answer so a refresh shows the link)
      this.s.slots = []; this.s.doc = null; this.s.fields = Object.assign(BLANK().fields, { name: f.name, phone: f.phone, email: f.email }); this.s.touched = {};
      this.save();
      this.busyResult = this.s.done;
      return this.s.done;
    } finally { this.busy = false; }
  }
  startNew() { const keep = { name: this.s.fields.name, phone: this.s.fields.phone, email: this.s.fields.email }; this.s = BLANK(); Object.assign(this.s.fields, keep); this.s.key = randomKey(this.d.crypto); this.busyResult = null; this.save(); }
}
