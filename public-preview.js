// LISTING-E2E-01 — the Owner's PREVIEW of exactly what will become public (or change on the public page), shown before every publish / public update.
// Plain DOM, no framework: it renders the server's own projection (previewListingCase) as text (never as HTML), the photos (through the authenticated
// private-photo loader), the reasons the server would refuse, and — for a live listing — what changes compared with the page as it is now.
// Resolves true only if the Owner presses the confirm button. The decision is bound to the preview's signature: if the content changes afterwards, the
// server refuses (reviewed_content_changed) and the Owner has to look again.
const FIELD_LABELS = { title: "ชื่อประกาศ", type: "ประเภท", status: "ขาย/เช่า", price: "ราคา", area: "อำเภอ", subdistrict: "ตำบล", zone: "โซน", bedrooms: "ห้องนอน", bathrooms: "ห้องน้ำ", description: "คำอธิบาย", fullDesc: "คำอธิบายเต็ม", shortDesc: "คำอธิบายสั้น", features: "จุดเด่น", landSize: "ที่ดิน", livingArea: "พื้นที่ใช้สอย", mapLink: "ลิงก์แผนที่" };
const REFUSALS = { public_text_has_contact_info: "ข้อความที่จะขึ้นเว็บมีเบอร์/อีเมล/ลิงก์/ไอดีติดต่อ — แก้ข้อความก่อน", price_required_to_publish: "ยังไม่มีราคา (เคสขอประเมินราคา) — ใส่ราคาก่อนเผยแพร่", intake_not_approved: "ยังไม่ได้บันทึกผลอนุมัติการรับเรื่อง", photos_below_minimum: "รูปยังไม่ถึงขั้นต่ำตามประเภททรัพย์", not_publishable_status: "สถานะปัจจุบันเผยแพร่ไม่ได้" };
export function previewRows(pv) {
  const cur = pv.currentPublicDocument || null;
  const rows = [];
  const keys = Object.keys(pv.publicDocument || {}).filter((k) => pv.publicDocument[k] !== null && pv.publicDocument[k] !== undefined && pv.publicDocument[k] !== "");
  keys.forEach((k) => {
    const v = pv.publicDocument[k];
    const text = typeof v === "object" ? JSON.stringify(v) : String(v);
    const before = cur ? (cur[k] === undefined ? "" : typeof cur[k] === "object" ? JSON.stringify(cur[k]) : String(cur[k])) : null;
    rows.push({ key: k, label: FIELD_LABELS[k] || k, text, before, changed: before !== null && before !== text });
  });
  return rows;
}
export function refusalText(pv) { return pv.wouldRefuse ? (REFUSALS[pv.wouldRefuse] || pv.wouldRefuse) + (pv.problems && pv.problems.length ? " (" + pv.problems.join(", ") + ")" : "") : ""; }

export function showPublicPreview(pv, opts) {
  const o = opts || {};
  return new Promise((resolve) => {
    const doc = document;
    const el = (tag, css, text) => { const e = doc.createElement(tag); if (css) e.style.cssText = css; if (text !== undefined) e.textContent = text; return e; };
    const overlay = el("div", "position:fixed;inset:0;z-index:2147483600;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;");
    const box = el("div", "background:#fff;max-width:760px;width:100%;max-height:92vh;overflow:auto;border-radius:12px;padding:20px 22px;font:14px/1.6 sans-serif;color:#222;");
    overlay.appendChild(box);
    box.appendChild(el("div", "font-size:18px;font-weight:700;margin-bottom:4px;", o.heading || "ตรวจก่อนเผยแพร่ — นี่คือสิ่งที่คนทั่วไปจะเห็นทั้งหมด"));
    box.appendChild(el("div", "font-size:12.5px;color:#666;margin-bottom:12px;", "รหัสเคส " + pv.propertyId + " · ข้อมูลติดต่อ เจ้าของ ผู้ส่ง หมายเหตุภายใน และสถานะการตรวจ จะไม่ขึ้นเว็บ"));
    const refusal = refusalText(pv);
    if (refusal) box.appendChild(el("div", "background:#fde8e8;border:1px solid #e3a3a3;border-radius:8px;padding:10px 12px;margin-bottom:12px;font-weight:600;", "⛔ เผยแพร่ไม่ได้: " + refusal));
    if (pv.publicUpdatePending) box.appendChild(el("div", "background:#fff4d6;border:1px solid #e6c36a;border-radius:8px;padding:8px 12px;margin-bottom:12px;", "มีการแก้ไขที่รออนุมัติจากเจ้าของเว็บ"));
    const table = el("div", "display:grid;grid-template-columns:130px 1fr;gap:4px 12px;margin-bottom:12px;");
    previewRows(pv).forEach((r) => {
      table.appendChild(el("div", "color:#666;", r.label));
      const cell = el("div", "word-break:break-word;" + (r.changed ? "background:#fff4d6;" : ""), r.text);
      if (r.changed) cell.appendChild(el("div", "font-size:12px;color:#8a6d1a;", "เดิมบนเว็บ: " + (r.before || "(ว่าง)")));
      table.appendChild(cell);
    });
    box.appendChild(table);
    box.appendChild(el("div", "font-weight:600;margin:6px 0;", "รูป " + pv.photoCount + " รูป (ขั้นต่ำ " + pv.photoStandard.min + " · ครบ " + pv.photoStandard.target + ")"));
    const strip = el("div", "display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;");
    (pv.photoPaths || []).forEach((p) => {
      const img = doc.createElement("img"); img.alt = ""; img.style.cssText = "width:96px;height:72px;object-fit:cover;border-radius:6px;background:#eee;";
      if (o.loadPhoto) o.loadPhoto(p).then((u) => { img.src = u; }).catch(() => { img.alt = "โหลดรูปไม่ได้"; });
      strip.appendChild(img);
    });
    box.appendChild(strip);
    const bar = el("div", "display:flex;gap:10px;justify-content:flex-end;");
    const done = (v) => { overlay.remove(); resolve(v); };
    const cancel = el("button", "padding:10px 18px;border:1px solid #bbb;background:#fff;border-radius:8px;cursor:pointer;", "ยกเลิก"); cancel.onclick = () => done(false);
    const ok = el("button", "padding:10px 18px;border:0;background:#7a1f2b;color:#fff;border-radius:8px;cursor:pointer;font-weight:700;", o.confirmLabel || "ยืนยันเผยแพร่ตามนี้");
    if (refusal) { ok.disabled = true; ok.style.opacity = ".4"; ok.style.cursor = "not-allowed"; }
    ok.onclick = () => done(true);
    bar.appendChild(cancel); bar.appendChild(ok); box.appendChild(bar);
    doc.body.appendChild(overlay);
  });
}
