// ─────────────────────────────────────────────────────────────────────────────
// INTAKE WORKFLOW ENGINE — huahin.properties
//
// Quality-control layer over the EXISTING property/submission record. It owns
// no property data of its own: every requirement is evaluated by reading the
// source-of-truth fields that Owner Submission / Lister Dashboard already
// write. That is deliberate — there must never be a second property database.
//
// Design rules this file enforces:
//   • Steps are DEFINED IN DATA, not hard-coded in UI. Adding a step later is
//     a change to a definition array, not a rewrite.
//   • A step's identity is its stepKey (stable forever). The number shown in
//     the UI is display order only and may change when steps are inserted.
//   • The submit step is found by `type === "submit"`, never by its number.
//   • Completion is derived from ACTUAL DATA. There is no "mark complete"
//     checkbox anywhere in this engine — if the data goes away, the step goes
//     back to incomplete on its own.
//   • Each case records which workflow VERSION it belongs to, so adding a
//     required step tomorrow cannot retroactively invalidate today's cases.
// ─────────────────────────────────────────────────────────────────────────────

export const WORKFLOW_VERSION = "intake_v1";

// Requirement levels. CRITICAL and REQUIRED block submission; OPTIONAL never
// does (it still shows in the panel so staff know it exists).
export const LEVEL = { CRITICAL: "critical", REQUIRED: "required", OPTIONAL: "optional" };

// Where a value or a verification came from. Kept on verification records so an
// approval can be audited later ("who said the price was confirmed?").
export const SOURCE = {
  CUSTOMER: "customer_submission", OWNER_MSG: "owner_message",
  PHONE: "staff_phone_confirmation", STAFF: "staff_entry",
  MAP: "map_verification", DOC: "document", SITE: "site_inspection", SYSTEM: "system",
};

// ── small readers ────────────────────────────────────────────────────────────
// Every reader is defensive: an old case created before these fields existed
// must open normally, not throw.

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};
const str = (v) => (typeof v === "string" && v.trim() ? v.trim() : null);
const photoCount = (ctx) => (Array.isArray(ctx.photos) ? ctx.photos.length : Number(ctx.photoCount) || 0);
// A verification is only "done" if an actual record exists. Raw data being
// present is NOT verification — that distinction is the point of this step.
const verified = (ctx, key) => {
  const v = (ctx.prop && ctx.prop.verifications) || {};
  const rec = v[key];
  return !!(rec && rec.confirmed === true);
};
const isLand = (ctx) => (ctx.prop && ctx.prop.type) === "land";
const isCondo = (ctx) => (ctx.prop && ctx.prop.type) === "condo";

// ── workflow definition ──────────────────────────────────────────────────────
// To add a step in future: append an entry with a NEW stepKey and an `order`
// below the submit step's order. Nothing else needs to change — the strip, the
// gate, the progress maths and the submit detection all read this array.

export const WORKFLOW_DEFS = {
  [WORKFLOW_VERSION]: {
    version: WORKFLOW_VERSION,
    label: "ขั้นตอนรับทรัพย์ (v1)",
    steps: [
      {
        stepKey: "case_assignment",
        order: 10,
        type: "operational",
        icon: "📥",
        title: "รับงาน / ข้อมูลหลัก",
        purpose: "รับผิดชอบเคสนี้ และให้แน่ใจว่ามีข้อมูลพื้นฐานพอที่จะทำงานต่อได้",
        todo: [
          "กดรับงานเพื่อให้ระบบรู้ว่าใครดูแลเคสนี้",
          "ตรวจว่ามีชื่อและช่องทางติดต่อผู้ฝากทรัพย์",
          "ตรวจประเภททรัพย์ ราคา และพื้นที่ให้ครบ",
          "ถ้าลูกค้าส่งพิกัดไม่ได้ ให้หาตำแหน่งจากแผนที่แล้วกรอกให้เอง",
        ],
        requirements: [
          { key: "assigned", level: LEVEL.CRITICAL, label: "มีผู้รับผิดชอบเคส",
            get: (c) => str(c.prop.assignedToEmail), hint: "กดปุ่ม “รับงาน” ที่หัวการ์ด" },
          { key: "contact_name", level: LEVEL.CRITICAL, label: "ชื่อผู้ฝากทรัพย์",
            get: (c) => str(c.prop.ownerName) || str(c.prop.contactName) },
          { key: "contact_phone", level: LEVEL.CRITICAL, label: "เบอร์ติดต่อ",
            get: (c) => str(c.prop.ownerPhone) || str(c.prop.contactPhone) },
          { key: "intent", level: LEVEL.CRITICAL, label: "ต้องการขายหรือให้เช่า",
            get: (c) => str(c.prop.status) },
          { key: "type", level: LEVEL.CRITICAL, label: "ประเภททรัพย์",
            get: (c) => str(c.prop.type) },
          { key: "price", level: LEVEL.CRITICAL, label: "ราคาที่แจ้ง",
            get: (c) => num(c.prop.price) },
          { key: "area", level: LEVEL.REQUIRED, label: "พื้นที่ / อำเภอ",
            get: (c) => str(c.prop.area) },
          { key: "coords", level: LEVEL.REQUIRED, label: "พิกัดหรือลิงก์แผนที่",
            get: (c) => str(c.prop.mapLink) || str(c.prop.coordinates) || str(c.prop.mapsLink),
            hint: "กรอกพิกัดแบบ 12.5589,99.9090 หรือวางลิงก์ Google Maps" },
        ],
      },
      {
        stepKey: "property_information",
        order: 20,
        type: "operational",
        icon: "🏠",
        title: "ตรวจข้อมูลทรัพย์และสื่อ",
        purpose: "ให้แน่ใจว่าข้อมูลทรัพย์และรูปภาพพร้อมพอที่จะทำประกาศได้",
        todo: [
          "ตรวจจำนวนห้อง ขนาดที่ดิน พื้นที่ใช้สอย ตามประเภททรัพย์",
          "ตรวจจำนวนรูป — ต้องมีอย่างน้อย 5 รูปที่ใช้งานได้",
          "ถ้าข้อมูลไม่ครบ ให้สอบถามเจ้าของผ่านช่องแชทของเคสนี้",
        ],
        requirements: [
          { key: "photos_5", level: LEVEL.CRITICAL, label: "รูปภาพอย่างน้อย 5 รูป",
            get: (c) => (photoCount(c) >= 5 ? photoCount(c) : null),
            progressLabel: (c) => "รูปภาพ " + photoCount(c) + "/5",
            hint: "จำนวนนับจากรูปที่อยู่ในระบบจริง ไม่สามารถกดผ่านเองได้" },
          { key: "bedrooms", level: LEVEL.CRITICAL, label: "จำนวนห้องนอน",
            applies: (c) => !isLand(c), get: (c) => num(c.prop.bedrooms) },
          { key: "bathrooms", level: LEVEL.REQUIRED, label: "จำนวนห้องน้ำ",
            applies: (c) => !isLand(c), get: (c) => num(c.prop.bathrooms) },
          { key: "living_area", level: LEVEL.REQUIRED, label: "พื้นที่ใช้สอย (ตร.ม.)",
            applies: (c) => !isLand(c), get: (c) => num(c.prop.livingArea) },
          { key: "land_size", level: LEVEL.CRITICAL, label: "ขนาดที่ดิน",
            applies: (c) => !isCondo(c),
            get: (c) => num(c.prop.landSize) || num(c.prop.landRai) || num(c.prop.landNgan) || num(c.prop.landWah) },
          { key: "floor", level: LEVEL.REQUIRED, label: "ชั้นที่ (คอนโด)",
            applies: (c) => isCondo(c), get: (c) => str(c.prop.floor) },
          { key: "description", level: LEVEL.REQUIRED, label: "รายละเอียดทรัพย์",
            get: (c) => str(c.prop.description) },
          { key: "features", level: LEVEL.OPTIONAL, label: "สิ่งอำนวยความสะดวก",
            get: (c) => (Array.isArray(c.prop.features) && c.prop.features.length ? c.prop.features.length : null) },
        ],
      },
      {
        stepKey: "owner_verification",
        order: 30,
        type: "operational",
        icon: "✅",
        title: "ยืนยันข้อมูลสำคัญ",
        purpose: "ยืนยันข้อมูลสำคัญกับเจ้าของทรัพย์โดยตรง ไม่ใช่แค่เชื่อข้อมูลที่กรอกมา",
        todo: [
          "โทรหรือแชทยืนยันราคาสุทธิที่เจ้าของต้องการ",
          "ยืนยันว่าเป็นเจ้าของหรือผู้มีอำนาจฝากขายจริง",
          "ยืนยันตำแหน่งทรัพย์",
          "กดปุ่มยืนยันในขั้นตอนนี้เมื่อคุยจบแล้ว พร้อมระบุว่ายืนยันทางไหน",
        ],
        requirements: [
          { key: "price_confirmed", level: LEVEL.CRITICAL, label: "ยืนยันราคากับเจ้าของแล้ว",
            get: (c) => (verified(c, "price_confirmed") ? true : null), verification: true },
          { key: "identity_confirmed", level: LEVEL.CRITICAL, label: "ยืนยันตัวตน/สิทธิ์ฝากขาย",
            get: (c) => (verified(c, "identity_confirmed") ? true : null), verification: true },
          { key: "location_confirmed", level: LEVEL.REQUIRED, label: "ยืนยันตำแหน่งทรัพย์",
            get: (c) => (verified(c, "location_confirmed") ? true : null), verification: true },
          { key: "terms_confirmed", level: LEVEL.OPTIONAL, label: "ยืนยันเงื่อนไขการขาย/ค่าคอม",
            get: (c) => (verified(c, "terms_confirmed") ? true : null), verification: true },
        ],
      },
      {
        stepKey: "property_readiness",
        order: 40,
        type: "operational",
        icon: "🔍",
        title: "ตรวจความพร้อมก่อนส่ง",
        purpose: "ตรวจคุณภาพงานรอบสุดท้ายก่อนส่งให้ผู้บริหารอนุมัติ",
        todo: [
          "อ่านรายละเอียดทรัพย์อีกครั้งว่าถูกต้องและอ่านรู้เรื่อง",
          "ตรวจว่าไม่มีคำถามค้างจากเจ้าของในแชท",
          "บันทึกหมายเหตุถ้ามีเรื่องที่ผู้อนุมัติควรรู้",
        ],
        requirements: [
          { key: "no_open_request", level: LEVEL.REQUIRED, label: "ไม่มีคำขอข้อมูลที่ยังค้าง",
            get: (c) => (c.prop.infoRequestStatus === "waiting" ? null : true),
            hint: "ถ้ายังรอข้อมูลจากเจ้าของ ให้ติดตามให้จบก่อน" },
          { key: "quality_reviewed", level: LEVEL.REQUIRED, label: "ตรวจคุณภาพข้อมูลแล้ว",
            get: (c) => (verified(c, "quality_reviewed") ? true : null), verification: true },
          { key: "readiness_note", level: LEVEL.OPTIONAL, label: "หมายเหตุถึงผู้อนุมัติ",
            get: (c) => str(c.prop.readinessNote) },
        ],
      },
      {
        // ALWAYS LAST. Located by type, never by number — inserting a step
        // above simply pushes this one's displayed number up.
        stepKey: "submit_for_review",
        order: 999,
        type: "submit",
        icon: "📤",
        title: "ส่งงานรอตรวจสอบ",
        purpose: "ส่งเคสให้ผู้บริหารตรวจและอนุมัติ",
        todo: [
          "ตรวจว่าทุกขั้นตอนก่อนหน้าครบแล้ว",
          "กดส่งงาน — ระบบจะบันทึกเป็นการส่งครั้งที่ 1, 2, 3 … ตามลำดับ",
        ],
        requirements: [],
      },
    ],
  },
};

// The workflow a case belongs to. An old case with no version recorded is read
// with v1 — that is what it was created under.
export function defFor(prop) {
  const v = (prop && prop.workflowVersion) || WORKFLOW_VERSION;
  return WORKFLOW_DEFS[v] || WORKFLOW_DEFS[WORKFLOW_VERSION];
}

export function submitStepOf(def) {
  return (def.steps || []).find((s) => s.type === "submit") || null;
}

// ── evaluation ───────────────────────────────────────────────────────────────
// ctx = { prop, photos } — nothing else. All progress is a pure function of
// the case's real data, so it recomputes correctly on every render and can
// never drift out of step with the underlying record.

export function evaluate(ctx) {
  const prop = (ctx && ctx.prop) || {};
  const c = { prop, photos: ctx && ctx.photos, photoCount: ctx && ctx.photoCount };
  const def = defFor(prop);
  const ordered = (def.steps || []).slice().sort((a, b) => a.order - b.order);
  const submitStep = submitStepOf(def);
  const returned = (prop.reviewReturn && prop.reviewReturn.stepKey) || null;

  const steps = ordered.map((sdef, i) => {
    const reqs = (sdef.requirements || [])
      .filter((r) => (typeof r.applies === "function" ? r.applies(c) : true))
      .map((r) => {
        let value = null;
        try { value = r.get(c); } catch (e) { value = null; }
        const done = value !== null && value !== undefined && value !== false && value !== "";
        return {
          key: r.key, label: r.label, level: r.level, done,
          blocking: r.level === LEVEL.CRITICAL || r.level === LEVEL.REQUIRED,
          isVerification: !!r.verification,
          hint: r.hint || "",
          progressLabel: typeof r.progressLabel === "function" ? r.progressLabel(c) : null,
        };
      });
    const blocking = reqs.filter((r) => r.blocking);
    const missing = blocking.filter((r) => !r.done);
    const doneCount = reqs.filter((r) => r.done).length;
    const isSubmit = sdef.type === "submit";
    const complete = isSubmit
      ? (prop.reviewStatus === "waiting_review" || prop.reviewStatus === "approved"
         || Number(prop.submissionCount) > 0)
      : missing.length === 0 && blocking.length > 0;
    const started = doneCount > 0;

    let state = "not_started";
    if (returned === sdef.stepKey) state = "returned";
    else if (complete) state = "complete";
    else if (sdef.stepKey === "property_readiness" && prop.infoRequestStatus === "waiting") state = "waiting";
    else if (started) state = "in_progress";

    return {
      stepKey: sdef.stepKey,
      // Display order only. Business logic uses stepKey / type.
      number: i + 1,
      type: sdef.type, icon: sdef.icon, title: sdef.title,
      purpose: sdef.purpose, todo: sdef.todo || [],
      requirements: reqs,
      missing, doneCount, total: reqs.length,
      blockingTotal: blocking.length,
      blockingDone: blocking.length - missing.length,
      percent: reqs.length ? Math.round((doneCount / reqs.length) * 100) : 0,
      complete, state, isSubmit,
    };
  });

  // The gate: every blocking requirement on every step BEFORE the submit step.
  // No step numbers appear here, so a future inserted step is covered
  // automatically.
  const submitOrder = submitStep ? submitStep.order : Infinity;
  const beforeSubmit = ordered
    .map((sdef, i) => ({ sdef, i }))
    .filter(({ sdef }) => sdef.order < submitOrder)
    .map(({ i }) => steps[i]);
  const blockers = [];
  beforeSubmit.forEach((s) => {
    s.missing.forEach((r) => blockers.push({
      stepKey: s.stepKey, stepTitle: s.title, stepNumber: s.number,
      label: r.progressLabel || r.label, hint: r.hint,
    }));
  });

  const totalBlocking = beforeSubmit.reduce((n, s) => n + s.blockingTotal, 0);
  const doneBlocking = beforeSubmit.reduce((n, s) => n + s.blockingDone, 0);

  return {
    version: def.version, label: def.label,
    steps, submitStepKey: submitStep ? submitStep.stepKey : null,
    canSubmit: blockers.length === 0,
    blockers,
    overallDone: doneBlocking, overallTotal: totalBlocking,
    overallPercent: totalBlocking ? Math.round((doneBlocking / totalBlocking) * 100) : 0,
    reviewStatus: prop.reviewStatus || null,
    submissionCount: Number(prop.submissionCount) || 0,
  };
}

// Colour per state — one place, so the strip and the panel never disagree.
export function stateStyle(state) {
  const map = {
    not_started: { bg: "oklch(95% 0.005 80)", fg: "oklch(52% 0.02 60)", bd: "oklch(89% 0.01 70)", label: "ยังไม่เริ่ม" },
    in_progress: { bg: "oklch(95% 0.04 240)", fg: "oklch(42% 0.12 245)", bd: "oklch(84% 0.06 240)", label: "กำลังทำ" },
    waiting: { bg: "oklch(96% 0.07 95)", fg: "oklch(45% 0.11 75)", bd: "oklch(86% 0.09 95)", label: "รอข้อมูล" },
    complete: { bg: "oklch(95% 0.05 150)", fg: "oklch(40% 0.11 150)", bd: "oklch(84% 0.07 150)", label: "ครบแล้ว" },
    returned: { bg: "oklch(95% 0.06 25)", fg: "oklch(46% 0.17 27)", bd: "oklch(85% 0.09 25)", label: "ต้องแก้ไข" },
  };
  return map[state] || map.not_started;
}
