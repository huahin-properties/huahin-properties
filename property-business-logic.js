// Pure, framework-free business logic for Property Details interactive
// features (Compare, Schedule Viewing, Mortgage Calculator, Reviews, Mini
// Site). No Firebase/Firestore — client-side only. Designed so the same
// functions can later back a dedicated Compare page or real data sources
// without rewriting the logic, only swapping inputs.

const MAX_COMPARE_ITEMS = 4;

/** Toggle a property id in/out of the compare list. Caps at MAX_COMPARE_ITEMS
 * (oldest silently dropped is avoided — instead the add is a no-op past cap,
 * so the user isn't surprised by losing an earlier pick). */
export function toggleCompareId(list, id) {
  const current = Array.isArray(list) ? list : [];
  if (current.includes(id)) return current.filter((x) => x !== id);
  if (current.length >= MAX_COMPARE_ITEMS) return current; // at cap: no-op, UI can surface a message
  return [...current, id];
}

export function compareLimitReached(list) {
  return Array.isArray(list) && list.length >= MAX_COMPARE_ITEMS;
}

export const COMPARE_MAX = MAX_COMPARE_ITEMS;

/** Schedule Viewing form validation. Returns { valid, errors } where errors
 * has a message per invalid field (empty string = no error). Mock-only —
 * no network call, caller decides what "success" means (local state). */
export function validateScheduleForm({ name, date, phone }) {
  const errors = { name: "", date: "", phone: "" };
  const trimmedName = (name || "").trim();
  const trimmedPhone = (phone || "").trim();

  if (!trimmedName) errors.name = "กรุณากรอกชื่อของคุณ";
  else if (trimmedName.length < 2) errors.name = "ชื่อสั้นเกินไป";

  if (!date) errors.date = "กรุณาเลือกวันที่ต้องการนัดชม";
  else {
    const picked = new Date(date + "T00:00:00");
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (isNaN(picked.getTime())) errors.date = "รูปแบบวันที่ไม่ถูกต้อง";
    else if (picked < today) errors.date = "กรุณาเลือกวันที่ในอนาคต";
  }

  if (!trimmedPhone) errors.phone = "กรุณากรอกเบอร์โทรหรือ WhatsApp";
  else if (!/^[0-9+\-\s]{7,20}$/.test(trimmedPhone)) errors.phone = "รูปแบบเบอร์โทรไม่ถูกต้อง";

  const valid = !errors.name && !errors.date && !errors.phone;
  return { valid, errors };
}

/** Mortgage estimate — pure amortization (principal & interest only, no fees
 * / insurance / tax). Defensive against zero/missing price, zero/negative
 * years, and out-of-range rates so the UI can never show NaN/Infinity. */
export function computeMortgage({ price, downPct, years, rate }) {
  const safePrice = Number.isFinite(price) && price > 0 ? price : 0;
  const safeDownPct = Number.isFinite(downPct) ? Math.min(90, Math.max(0, downPct)) : 20;
  const safeYears = Number.isFinite(years) && years > 0 ? years : 20;
  const safeRate = Number.isFinite(rate) && rate >= 0 ? rate : 6.5;

  if (safePrice <= 0) {
    return { monthly: 0, principal: 0, valid: false, error: "ไม่มีราคาทรัพย์สำหรับคำนวณ" };
  }

  const principal = safePrice * (1 - safeDownPct / 100);
  const monthlyRate = (safeRate / 100) / 12;
  const numPayments = safeYears * 12;
  const monthly = monthlyRate > 0
    ? principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -numPayments))
    : principal / numPayments;

  if (!Number.isFinite(monthly) || monthly < 0) {
    return { monthly: 0, principal, valid: false, error: "ค่าที่กรอกไม่สามารถคำนวณได้" };
  }
  return { monthly: Math.round(monthly), principal: Math.round(principal), valid: true, error: "" };
}

/** Mock reviews model — shaped so swapping in real Firestore-sourced reviews
 * later only means changing the `reviews` input, not this function. */
export const MOCK_REVIEWS = [
  { id: "r1", reviewer: "K. Somchai", rating: 5, date: "12 มิ.ย. 2569", comment: "บ้านสวยตรงตามรูป ทีมงานดูแลดีมาก นัดชมง่าย ตอบเร็ว" },
  { id: "r2", reviewer: "Sarah W.", rating: 4, date: "2 พ.ค. 2569", comment: "Great location, agent was very responsive. Would recommend." },
  { id: "r3", reviewer: "K. Ananya", rating: 5, date: "18 เม.ย. 2569", comment: "ประทับใจการบริการ ข้อมูลครบถ้วนตรงไปตรงมา" },
];

export function getReviewsModel(reviews) {
  const list = Array.isArray(reviews) ? reviews : [];
  if (!list.length) return { reviews: [], avgRating: "0.0", count: 0, isEmpty: true };
  const withStars = list.map((r) => ({ ...r, stars: "★".repeat(r.rating) + "☆".repeat(5 - r.rating) }));
  const avg = list.reduce((s, r) => s + r.rating, 0) / list.length;
  return { reviews: withStars, avgRating: avg.toFixed(1), count: list.length, isEmpty: false };
}

/** Mini Site slug — validates a candidate slug (lowercase letters, digits,
 * hyphens only) and falls back to a safe placeholder when missing/invalid,
 * so the UI never shows "undefined" or a broken-looking URL segment. */
export function resolveMiniSiteSlug(candidate) {
  const fallback = "agent-name";
  if (!candidate || typeof candidate !== "string") return fallback;
  const trimmed = candidate.trim().toLowerCase();
  if (!/^[a-z0-9]([a-z0-9-]{0,48}[a-z0-9])?$/.test(trimmed)) return fallback;
  return trimmed;
}
