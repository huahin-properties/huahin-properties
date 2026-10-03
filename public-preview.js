// LISTING-E2E-01 — the Owner's PREVIEW of exactly what will become public (or change on the public page), shown before every publish / public update.
// Plain DOM, no framework: it renders the server's own projection (previewListingCase) as text (never as HTML), the photos (through the authenticated
// private-photo loader), the reasons the server would refuse, and — for a live listing — what changes compared with the page as it is now.
// Resolves true only if the Owner presses the confirm button. The decision is bound to the preview's signature: if the content changes afterwards, the
// server refuses (reviewed_content_changed) and the Owner has to look again.
import { landAreaView } from "./land-area.js";
const FIELD_LABELS = { title: "ชื่อประกาศ", type: "ประเภท", status: "ขาย/เช่า", price: "ราคา", area: "อำเภอ", subdistrict: "ตำบล", zone: "โซน", bedrooms: "ห้องนอน", bathrooms: "ห้องน้ำ", description: "คำอธิบาย", fullDesc: "คำอธิบายเต็ม", shortDesc: "คำอธิบายสั้น", features: "จุดเด่น", landSize: "ที่ดิน (ค่าเดิม ไม่ระบุหน่วย)", landArea: "ที่ดิน", livingArea: "พื้นที่ใช้สอย", mapLink: "ลิงก์แผนที่" };
const REFUSALS = { public_text_has_contact_info: "ข้อความที่จะขึ้นเว็บมีเบอร์/อีเมล/ลิงก์/ไอดีติดต่อ — แก้ข้อความก่อน", price_required_to_publish: "ยังไม่มีราคา (เคสขอประเมินราคา) — ใส่ราคาก่อนเผยแพร่", intake_not_approved: "ยังไม่ได้บันทึกผลอนุมัติการรับเรื่อง", photos_below_minimum: "รูปยังไม่ถึงขั้นต่ำตามประเภททรัพย์", not_publishable_status: "สถานะปัจจุบันเผยแพร่ไม่ได้" };
export function previewRows(pv) {
  const cur = pv.currentPublicDocument || null;
  const rows = [];
  const keys = Object.keys(pv.publicDocument || {}).filter((k) => pv.publicDocument[k] !== null && pv.publicDocument[k] !== undefined && pv.publicDocument[k] !== "");
  // D2: the three land-area fields are ONE row "ที่ดิน": the value as entered with its unit and the same area in the other unit; the old unitless landSize is shown without any unit.
  const landText = (doc) => { const v = doc ? landAreaView(doc) : null; if (!v) return ""; const u = (k) => (k === "sqwa" ? "ตร.ว." : "ตร.ม."), n = (x) => String(Math.round(x * 100) / 100); return v.kind === "known" ? n(v.value) + " " + u(v.unit) + " (" + n(v.otherValue) + " " + u(v.otherUnit) + ")" : n(v.value) + " (ไม่ระบุหน่วย)"; };
  const isLand = (k) => k === "landAreaValue" || k === "landAreaUnit" || k === "landAreaSqm" || k === "landSize";
  const nowLand = landText(pv.publicDocument);
  if (nowLand) { const before = cur ? landText(cur) : null; rows.push({ key: "landArea", label: FIELD_LABELS.landArea, text: nowLand, before, changed: before !== null && before !== nowLand }); }
  keys.forEach((k) => {
    if (isLand(k)) return;
    const v = pv.publicDocument[k];
    const show = (x) => (x && typeof x === "object" && !Array.isArray(x) && (x.th || x.en) ? [x.th, x.en].filter(Boolean).join(" / ") : x && typeof x === "object" ? JSON.stringify(x) : k === "price" && Number(x) > 0 ? Number(x).toLocaleString("en-US") : String(x));
    const text = show(v);
    const before = cur ? (cur[k] === undefined ? "" : show(cur[k])) : null;
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
    box.appendChild(el("div", "font-size:18px;font-weight:700;margin-bottom:4px;", o.heading || "ตรวจก่อนเผยแพร่ — ข้อมูลและรูปด้านล่างคือสิ่งที่คนทั่วไปจะเห็น"));
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
    const published = pv.photoSource === "published";
    box.appendChild(el("div", "font-weight:600;margin:6px 0;", (published ? "รูปที่ขึ้นเว็บอยู่แล้ว " : "รูป ") + pv.photoCount + " รูป (ขั้นต่ำ " + pv.photoStandard.min + " · ครบ " + pv.photoStandard.target + ")"));
    if (published && pv.unpublishedPhotoCount > 0) box.appendChild(el("div", "background:#fff4d6;border:1px solid #e6c36a;border-radius:8px;padding:8px 12px;margin-bottom:8px;", "ℹ️ มีรูปใหม่ในเคส " + pv.unpublishedPhotoCount + " รูป ที่ยังไม่ขึ้นเว็บ — การอัปเดตครั้งนี้เปลี่ยนเฉพาะข้อความ/ข้อมูล รูปที่ขึ้นเว็บยังเป็นชุดข้างบน (ถ้าต้องการรูปใหม่ ต้องปลดประกาศแล้วเผยแพร่ใหม่)"));
    // Confirmation depends on the photos having been REVIEWED: it stays disabled while any photo is loading; if some can not be shown, the Owner must explicitly accept publishing without having seen them.
    const strip = el("div", "display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;");
    const sources = published ? (pv.photoUrls || []).map((u) => () => Promise.resolve(u)) : (pv.photoPaths || []).map((p) => () => (o.loadPhoto ? o.loadPhoto(p) : Promise.reject(new Error("no loader"))));
    let pending = sources.length, failed = 0;
    const statusLine = el("div", "font-size:12.5px;color:#555;margin-bottom:8px;", pending ? "กำลังโหลดรูป " + pending + " รูป…" : "");
    const ackRow = el("label", "display:none;gap:8px;align-items:center;font-size:12.5px;margin-bottom:10px;color:#8a1f1f;");
    const ack = doc.createElement("input"); ack.type = "checkbox"; ackRow.appendChild(ack);
    ackRow.appendChild(el("span", "", ""));
    const bar = el("div", "display:flex;gap:10px;justify-content:flex-end;");
    const done = (v) => { overlay.remove(); resolve(v); };
    const cancel = el("button", "padding:10px 18px;border:1px solid #bbb;background:#fff;border-radius:8px;cursor:pointer;", "ยกเลิก"); cancel.setAttribute("data-preview-cancel", "1"); cancel.onclick = () => done(false);
    const ok = el("button", "padding:10px 18px;border:0;background:#7a1f2b;color:#fff;border-radius:8px;cursor:pointer;font-weight:700;", o.confirmLabel || "ยืนยันเผยแพร่ตามนี้"); ok.setAttribute("data-preview-confirm", "1");
    const refreshOk = () => {
      const blocked = !!refusal || pending > 0 || (failed > 0 && !ack.checked);
      ok.disabled = blocked; ok.style.opacity = blocked ? ".4" : "1"; ok.style.cursor = blocked ? "not-allowed" : "pointer";
      ok.setAttribute("data-state", refusal ? "refused" : pending > 0 ? "loading" : failed > 0 && !ack.checked ? "needs-ack" : "ready");
    };
    ack.onchange = refreshOk;
    sources.forEach((get) => {
      const img = doc.createElement("img"); img.alt = ""; img.style.cssText = "width:96px;height:72px;object-fit:cover;border-radius:6px;background:#eee;"; img.setAttribute("data-preview-photo", "1");
      strip.appendChild(img);
      let settled = false;
      const finish = (okFlag) => {
        if (settled) return; settled = true;
        pending--; if (!okFlag) { failed++; img.alt = "โหลดรูปไม่ได้"; img.style.outline = "2px solid #c0392b"; img.setAttribute("data-failed", "1"); }
        statusLine.textContent = pending ? "กำลังโหลดรูป " + pending + " รูป…" : failed ? "⚠️ โหลดรูปไม่ได้ " + failed + " รูป" : "ตรวจรูปครบแล้ว";
        if (!pending && failed) { ackRow.style.display = "flex"; ackRow.lastChild.textContent = "ฉันรับทราบว่ารูป " + failed + " รูปแสดงไม่ได้ และยอมเผยแพร่โดยไม่ได้เห็นรูปเหล่านั้น"; }
        refreshOk();
      };
      get().then((u) => { img.onload = () => finish(true); img.onerror = () => finish(false); img.src = u; }).catch(() => finish(false));
    });
    box.appendChild(strip); box.appendChild(statusLine); box.appendChild(ackRow);
    ok.onclick = () => { if (!ok.disabled) done(true); };
    bar.appendChild(cancel); bar.appendChild(ok); box.appendChild(bar);
    refreshOk();
    doc.body.appendChild(overlay);
  });
}
