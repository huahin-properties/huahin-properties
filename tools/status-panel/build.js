#!/usr/bin/env node
// Internal PROJECT-STATUS panel — builds docs/status-panel/index.html from PROJECT-STATUS.md ONLY.
//   node tools/status-panel/build.js [--out <file>] [--fragment <file>] [--stamp <text>] [--check]
// Roadmap 0-24, foundation C0-C4.2 and the current-task table are read straight from the markdown tables in PROJECT-STATUS.md (sections 1-3).
// Everything a table can not hold (owners, scopes/checklists for the percentages, the issue registry, history) is the JSON block between
// <!-- STATUS-REGISTRY:BEGIN/END --> in section 6 of the same file. There is no second copy of any status: edit PROJECT-STATUS.md, run this again.
// Percentages follow the rule in the PROJECT-STATUS handoff (v2, section 3): passed / applicable acceptance items of ONE scope and ONE evidence level,
// shown only when the scope's checklist is LOCKED by Work; otherwise the panel says it can not be computed yet. No network, no secrets.
"use strict";
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..", "..");
const SRC = path.join(ROOT, "PROJECT-STATUS.md");
const ENV = { docs: "เอกสาร", dev: "พัฒนา (โค้ด/ในเครื่อง)", test: "TEST (Cloud)", prod: "Production" };
const ITEM_STATUS = { pass: ["ผ่าน", "✓"], fail: ["ไม่ผ่าน", "✕"], blocked: ["ติดขัด", "■"], unverified: ["ยังไม่ยืนยัน", "?"], na: ["ไม่เกี่ยว", "–"] };
const SEV = { critical: ["วิกฤต", 0], high: ["สูง", 1], med: ["กลาง", 2], low: ["ต่ำ", 3], info: ["ข้อมูล", 4] };
const ISSUE_STATUS = { open: "เปิดอยู่", blocked: "ติดขัด", closed: "ปิดแล้ว" };
const EMOJI = [["🟢", "ok", "ผ่านเฉพาะขอบเขตที่ระบุ", "●"], ["🟡", "part", "บางส่วน / กำลังตรวจ / รอหลักฐาน", "◐"], ["🔴", "bad", "ติดขัด / มีข้อบกพร่อง", "✕"], ["⚪", "none", "ยังไม่เริ่ม", "○"], ["🔵", "dir", "ทิศทางที่อนุมัติ / อนาคต (ไม่ใช่โค้ดเสร็จ)", "◇"]];
const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const inline = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

function section(md, titlePrefix) {
  const lines = md.split("\n"); const i = lines.findIndex((l) => l.startsWith(titlePrefix));
  if (i < 0) throw new Error("PROJECT-STATUS.md: section not found: " + titlePrefix);
  let j = i + 1; while (j < lines.length && !/^#{1,2} /.test(lines[j])) j++;
  return lines.slice(i + 1, j);
}
function table(lines) {
  const rows = lines.filter((l) => /^\|/.test(l)); if (rows.length < 3) throw new Error("table not found");
  const cells = (l) => l.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
  const head = cells(rows[0]); return { head, rows: rows.slice(2).map(cells) };
}
function statusOf(cell) {
  for (const [emo, key, label, glyph] of EMOJI) if (cell.startsWith(emo)) return { key, label, glyph, text: cell.slice(emo.length).trim() };
  return { key: "none", label: "ไม่ระบุสี", glyph: "○", text: cell };
}
function parse(md) {
  const m = /<!-- STATUS-REGISTRY:BEGIN -->\s*```json\n([\s\S]*?)\n```\s*<!-- STATUS-REGISTRY:END -->/.exec(md);
  if (!m) throw new Error("STATUS-REGISTRY block not found in PROJECT-STATUS.md");
  const reg = JSON.parse(m[1]);
  const road = table(section(md, "## 1. เส้นทางหลัก")); const base = table(section(md, "## 2. ฐานระบบก่อนเส้นทางหลัก")); const tasks = table(section(md, "## 3. งานปัจจุบันและตำแหน่งที่หยุด"));
  return { reg, roadmap: road.rows.map((r) => ({ no: r[0], code: r[1], status: statusOf(r[2]), meaning: r[3], evidence: r[4] })),
    foundation: base.rows.map((r) => ({ code: r[0], name: r[1], status: statusOf(r[2]), note: r[3] })),
    tasks: tasks.rows.map((r) => ({ name: r[0], status: statusOf(r[1]), evidence: r[2], next: r[3] })) };
}
function validate(d) {
  const e = []; const r = d.reg; const ids = new Set();
  if (r.schema !== 1) e.push("schema must be 1");
  if (d.roadmap.length !== 25) e.push("roadmap must have 25 rows (0-24), has " + d.roadmap.length);
  d.roadmap.forEach((x, i) => { if (String(i) !== x.no) e.push("roadmap row " + i + " is numbered " + x.no); });
  for (const s of r.scopes) {
    if (!ENV[s.env]) e.push("scope " + s.id + ": bad env");
    if (typeof s.locked !== "boolean") e.push("scope " + s.id + ": locked must be boolean");
    for (const it of s.items) {
      if (ids.has(it.id)) e.push("duplicate item id " + it.id); ids.add(it.id);
      if (!ITEM_STATUS[it.status]) e.push("item " + it.id + ": bad status " + it.status);
      if (it.status === "na" && !it.ref) e.push("item " + it.id + ": N/A needs a reason in ref");
    }
  }
  const scopeIds = new Set(r.scopes.map((s) => s.id));
  for (const t of d.tasks) {
    const m = r.taskMeta[t.name];
    if (!m) { e.push("task without taskMeta: " + t.name); continue; }
    if (!ENV[m.env]) e.push("task " + m.id + ": bad env"); if (!r.actors[m.actor]) e.push("task " + m.id + ": bad actor");
    if (m.scope && !scopeIds.has(m.scope)) e.push("task " + m.id + ": unknown scope");
    for (const i of m.items || []) if (!ids.has(i)) e.push("task " + m.id + ": unknown item " + i);
  }
  for (const k of Object.keys(r.taskMeta)) if (!d.tasks.some((t) => t.name === k)) e.push("taskMeta for a row that is not in section 3: " + k);
  const did = new Set();
  for (const x of r.decisions || []) {
    if (did.has(x.id)) e.push("duplicate decision " + x.id); did.add(x.id);
    if (!x.question || !Array.isArray(x.options) || x.options.length < 2 || !x.codeView || !r.actors[x.decider]) e.push("decision " + x.id + ": needs question, 2+ options, codeView, decider");
    if (!/ไม่ใช่มติ/.test(x.codeView || "")) e.push("decision " + x.id + ": codeView must say it is not a decision (ไม่ใช่มติ)");
    if (!["open", "decided"].includes(x.status)) e.push("decision " + x.id + ": bad status");
  }
  const iid = new Set();
  for (const i of r.issues) {
    if (iid.has(i.id)) e.push("duplicate issue " + i.id); iid.add(i.id);
    if (!SEV[i.sev]) e.push("issue " + i.id + ": bad sev"); if (!ISSUE_STATUS[i.status]) e.push("issue " + i.id + ": bad status");
    if (!ENV[i.env]) e.push("issue " + i.id + ": bad env"); if (!r.actors[i.actor]) e.push("issue " + i.id + ": bad actor"); if (!i.next || !i.source) e.push("issue " + i.id + ": needs next and source");
  }
  const secret = /(password|passwd|api[_-]?key|secret|token)\s*[:=]\s*\S{6,}|[\w.+-]+@[\w-]+\.[a-z]{2,}|\b0\d{8,9}\b/i;
  const blob = JSON.stringify(r); const hit = secret.exec(blob); if (hit) e.push("registry looks like it contains a secret / e-mail / phone: " + hit[0].slice(0, 20));
  return e;
}
function pct(scope) {
  const items = scope.items.filter((i) => i.status !== "na"); const n = items.length; const pass = items.filter((i) => i.status === "pass").length;
  const count = {}; for (const k of Object.keys(ITEM_STATUS)) count[k] = scope.items.filter((i) => i.status === k).length;
  return { n, pass, count, computable: scope.locked && n > 0, percent: n ? Math.round((pass / n) * 100) : null };
}
function pill(st) { return `<span class="pill s-${st.key}" title="${esc(st.label)}"><span aria-hidden="true">${st.glyph}</span> ${esc(st.label.split(" /")[0])}</span>`; }
function git(args) { try { return execSync("git " + args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch (e) { return ""; } }
function stampText() {
  const sha = git("rev-parse --short=7 HEAD"); if (!sha) return "ไม่มี git";
  const date = git("log -1 --format=%cs HEAD");
  return "สร้างจาก HEAD " + sha + " (" + date + ") — commit ก่อนหน้าไฟล์นี้ ไม่ใช่ commit ที่บรรจุไฟล์นี้ (ถ้า PROJECT-STATUS.md แก้หลังจากนั้นให้ build ใหม่)";
}

function render(d, stamp) {
  const r = d.reg; const P = r.package; const actor = (k) => esc(r.actors[k] || k);
  const sc = r.scopes.map((s) => ({ s, p: pct(s) }));
  const sha7 = (x) => (/^[0-9a-f]{40}$/.test(x) ? x.slice(0, 7) : x);
  const counts = (s) => ["pass", "fail", "blocked", "unverified"].map((k) => `<span class="seg seg-${k}" style="flex:${Math.max(s.count[k], 0)}" title="${ITEM_STATUS[k][0]} ${s.count[k]}"></span>`).join("");
  const scopeCard = ({ s, p }) => {
    const head = p.computable ? `<div class="big">${p.pass}/${p.n} <span>= ${p.percent}%</span></div><div class="note">เกณฑ์ lock แล้ว · ผ่าน/ใช้ได้ ที่ระดับหลักฐานของขอบเขตนี้</div>`
      : `<div class="big nc">ยังคำนวณไม่ได้</div><div class="note">กำลังยืนยันรายการ — checklist ร่าง ${p.n} รายการ ${esc(s.lockNote || "รอ Work lock")}</div><div class="preview">ตัวอย่างถ้า lock ตามร่าง: ${p.pass}/${p.n}${p.n ? " = " + Math.round((p.pass / p.n) * 100) + "%" : ""} <em>(ไม่ใช่ความคืบหน้า)</em></div>`;
    const blockers = r.issues.filter((i) => i.status !== "closed" && i.env === s.env && (i.sev === "critical" || i.sev === "high"));
    const lis = s.items.map((it) => `<li class="it it-${it.status}"><span class="ig" aria-hidden="true">${ITEM_STATUS[it.status][1]}</span><span class="itx"><strong class="iid">${esc(it.id)}</strong> ${esc(it.text)}<small>${ITEM_STATUS[it.status][0]} · ${esc(it.level)} · ${esc(it.ref)}</small></span></li>`).join("");
    return `<article class="card scope" data-env="${s.env}" id="scope-${esc(s.id)}"><div class="eyebrow">${esc(ENV[s.env])} · ${esc(s.id)}</div><h3>${esc(s.name)}</h3>${head}
<div class="bar" role="img" aria-label="ผ่าน ${p.count.pass} · ไม่ผ่าน ${p.count.fail} · ติดขัด ${p.count.blocked} · ยังไม่ยืนยัน ${p.count.unverified}">${counts(p)}</div>
<div class="legend"><span><i class="d seg-pass"></i>ผ่าน ${p.count.pass}</span><span><i class="d seg-fail"></i>ไม่ผ่าน ${p.count.fail}</span><span><i class="d seg-blocked"></i>ติดขัด ${p.count.blocked}</span><span><i class="d seg-unverified"></i>ยังไม่ยืนยัน ${p.count.unverified}</span>${p.count.na ? `<span>ไม่เกี่ยว ${p.count.na}</span>` : ""}</div>
${blockers.length ? `<div class="blk"><strong>ตัวขวางหลัก:</strong> ${blockers.map((i) => `<a href="#iss-${esc(i.id)}">${esc(i.id)}</a>`).join(" · ")}</div>` : ""}
<details><summary>รายการ checklist (${s.items.length})</summary><ul class="items">${lis}</ul></details></article>`;
  };
  const roadRows = d.roadmap.map((x) => `<tr data-st="${x.status.key}"><td data-l="ลำดับ" class="mono">${esc(x.no)}</td><td data-l="รหัส / ขั้นตอน"><strong>${inline(x.code)}</strong></td><td data-l="สถานะ">${pill(x.status)}</td><td data-l="ความหมายและข้อจำกัด">${inline(x.meaning)}</td><td data-l="หลักฐาน" class="ev">${inline(x.evidence)}</td></tr>`).join("");
  const baseRows = d.foundation.map((x) => `<tr data-st="${x.status.key}"><td data-l="รหัส" class="mono">${esc(x.code)}</td><td data-l="งาน">${inline(x.name)}</td><td data-l="สถานะ">${pill(x.status)}</td><td data-l="คงไว้ / กลับไปทำ">${inline(x.note)}</td></tr>`).join("");
  const scopeById = Object.fromEntries(r.scopes.map((s) => [s.id, s]));
  const itemById = {}; r.scopes.forEach((sc) => sc.items.forEach((it) => { itemById[it.id] = { it, sc }; }));
  const taskRows = d.tasks.map((t) => {
    const m = r.taskMeta[t.name]; const s = m.scope ? scopeById[m.scope] : null;
    let pc = '<span class="nc">ยังคำนวณไม่ได้</span>';
    if (s && m.items && m.items.length) {
      const its = m.items.map((i) => itemById[i]).filter(Boolean).filter((x) => x.it.status !== "na"); const ps = its.filter((x) => x.it.status === "pass").length; const allLocked = its.every((x) => x.sc.locked);
      pc = `${ps}/${its.length}${allLocked ? " = " + Math.round((ps / its.length) * 100) + "%" : ' <em class="draft">ร่าง ยังไม่ lock</em>'}`;
    }
    return `<tr data-st="${t.status.key}" data-env="${m.env}"><td data-l="รหัส" class="mono">${esc(m.id)}</td><td data-l="งาน"><strong>${inline(t.name)}</strong></td><td data-l="สถานะ">${pill(t.status)}<div class="sub">${inline(t.status.text)}</div></td><td data-l="สภาพแวดล้อม / ขอบเขต">${esc(ENV[m.env])}${m.scope ? " · " + esc(m.scope) : ""}</td><td data-l="ผ่าน / ทั้งหมด">${pc}</td><td data-l="ขั้นถัดไป">${inline(t.next)}</td><td data-l="ผู้รับผิดชอบ">${actor(m.actor)}</td><td data-l="วัน / commit" class="mono sm">${esc(m.date)}<br>${esc(m.commit)}</td><td data-l="หลักฐาน" class="ev">${inline(t.evidence)}</td></tr>`;
  }).join("");
  const issues = r.issues.slice().sort((a, b) => SEV[a.sev][1] - SEV[b.sev][1] || a.id.localeCompare(b.id));
  const issueRows = issues.map((i) => `<tr id="iss-${esc(i.id)}" data-env="${i.env}" data-sev="${i.sev}" data-st="${i.status}"><td data-l="รหัส" class="mono"><strong>${esc(i.id)}</strong></td><td data-l="ปัญหา">${inline(i.title)}</td><td data-l="ระดับ"><span class="sev sev-${i.sev}">${SEV[i.sev][0]}</span></td><td data-l="สถานะ">${ISSUE_STATUS[i.status]}</td><td data-l="สภาพแวดล้อม">${esc(ENV[i.env])}</td><td data-l="ผู้รับผิดชอบ">${actor(i.actor)}</td><td data-l="ขั้นถัดไป">${inline(i.next)}</td><td data-l="ที่มา" class="ev">${inline(i.source)}</td></tr>`).join("");
  const hist = r.history.map((h) => `<li><span class="mono">${esc(h.date)}</span> ${inline(h.text)} <span class="mono sm">${esc(h.ref)}</span></li>`).join("");
  const envChips = ["all", "docs", "dev", "test", "prod"].map((k) => `<button type="button" class="chip" data-f-env="${k}" aria-pressed="${k === "all"}">${k === "all" ? "ทุกสภาพแวดล้อม" : esc(ENV[k])}</button>`).join("");
  const stChips = [["all", "ทุกสถานะ"], ["ok", "● ผ่าน"], ["part", "◐ บางส่วน"], ["bad", "✕ ติดขัด"], ["none", "○ ยังไม่เริ่ม"], ["dir", "◇ ทิศทาง"]].map(([k, l]) => `<button type="button" class="chip" data-f-st="${k}" aria-pressed="${k === "all"}">${l}</button>`).join("");
  const open = r.issues.filter((i) => i.status !== "closed").length; const crit = r.issues.filter((i) => i.status !== "closed" && i.sev === "critical").length;
  const css = CSS; const js = JS;
  return `<title>แผงติดตามโครงการ Huahin</title>
<style>${css}</style>
<div class="wrap" id="top">
<header class="mast"><div><div class="eyebrow">แผง PROJECT-STATUS ภายใน · ไม่ใช่หน้าเว็บลูกค้า</div><h1>huahin . properties — สถานะโครงการ</h1></div>
<dl class="stamp"><div><dt>ชุดส่งต่อ</dt><dd class="mono">${esc(P.set || P.id)}</dd></div><div><dt>วันที่</dt><dd>${esc(P.date)} (${esc(P.tz)})</dd></div><div><dt>แหล่งข้อมูล</dt><dd>PROJECT-STATUS.md · ${esc(stamp)}</dd></div></dl></header>
<p class="fresh">ตัวเลขทั้งหมดมาจากไฟล์ PROJECT-STATUS.md ณ commit ที่ระบุ — แผงนี้ <strong>ไม่ตรวจความสดอัตโนมัติ</strong> ถ้าไฟล์เปลี่ยนต้องรัน <code>npm run status-panel</code> ใหม่</p>
<nav class="jump" aria-label="ข้ามไปส่วน"><a href="#now">1 ปัจจุบัน</a><a href="#you">2 เจ้าของทำอะไร</a><a href="#prog">3 ความคืบหน้า</a><a href="#road">4 Roadmap 0–24</a><a href="#tasks">5 งาน</a><a href="#issues">6 ค้าง/ติดขัด (${open})</a><a href="#decisions">ข้อที่รอตัดสิน (${(r.decisions || []).length})</a><a href="#hist">7 ประวัติ</a></nav>

<section id="now" class="card hero"><div class="eyebrow">1 · CURRENT</div><h2>${esc(r.current.task)}</h2><p class="goal"><strong>เป้าหมายโครงการ:</strong> ${esc(r.goal)}</p>
<div class="grid2"><div><h4>รหัสงาน / เฟส</h4><p>${r.current.phases.map((x) => `<span class="tag mono">${esc(x)}</span>`).join(" ")}</p><h4>สภาพแวดล้อมของรอบนี้</h4><p>${r.current.environments.map((x) => `<span class="tag">${esc(x)}</span>`).join(" ")}</p><h4>ผู้ทำตอนนี้</h4><p>${esc(r.current.actor)}</p></div>
<div><h4>เวอร์ชันที่ต้องไม่ปนกัน</h4><table class="kv"><tr><th>Code (baseline / ที่เจ้าของลอง)</th><td class="mono">${esc(sha7(P.codeSha))}</td></tr><tr><th>เอกสารล่าสุดใน GitHub (v1.1)</th><td class="mono">${esc(sha7(P.docBaseSha))}</td></tr><tr><th>Deploy บน TEST</th><td class="mono">${esc(sha7(P.deployedTestSha))}</td></tr><tr><th>Deploy บน production</th><td>${esc(P.deployedProdSha)}</td></tr><tr><th>PR</th><td>${esc(P.prState)}</td></tr><tr><th>เว็บไซต์สาธารณะ</th><td>${esc(P.website)}</td></tr></table></div></div>
<p class="sum">ค้าง/ติดขัดที่เปิดอยู่ ${open} รายการ${crit ? ` · วิกฤต ${crit}` : ""} — ดูส่วน 6</p></section>

<section id="you" class="card you"><div class="eyebrow">2 · YOU DO NOW</div><h2>${esc(r.youDoNow.text)}</h2><dl class="yd"><div><dt>จอ / ลิงก์</dt><dd>${esc(r.youDoNow.where)}</dd></div><div><dt>ผ่านเมื่อ</dt><dd>${esc(r.youDoNow.passWhen)}</dd></div><div><dt>ขั้นถัดไป</dt><dd>${esc(r.youDoNow.next)}</dd></div></dl></section>

<section id="prog"><div class="eyebrow">3 · ความคืบหน้า แยกตามสภาพแวดล้อม</div><h2>พัฒนา / TEST จริง / production — ตัวหารและหลักฐานคนละชุด ห้ามเฉลี่ยรวม</h2>
<p class="rule">สูตร = รายการที่ผ่านหลักฐานตามระดับ ÷ รายการที่ใช้ได้ในขอบเขตนั้น ×100 แสดงจำนวนคู่เปอร์เซ็นต์เสมอ · ไม่นับ BLOCKED/FAIL/UNVERIFIED ออกจากตัวหาร · 100% ของ checklist ไม่อนุมัติ release · ผล test ในเครื่อง ภาพจากเจ้าของ และ production ไม่รวมกัน</p>
${["dev", "test", "prod", "docs"].map((env) => { const g = sc.filter((x) => x.s.env === env); return g.length ? `<div class="envh" data-env="${env}"><h3>${esc(ENV[env])} — ${g.length} ขอบเขต · ตัวหารแยกกัน</h3></div><div class="cards">${g.map(scopeCard).join("")}</div>` : ""; }).join("")}</section>

<div class="filters" role="group" aria-label="กรองข้อมูล"><div class="fl"><span>สภาพแวดล้อม (กรองความคืบหน้า / งาน / ค้าง)</span>${envChips}</div><div class="fl"><span>สถานะ (Roadmap / งาน)</span>${stChips}</div><label class="fl"><span>ค้นหา</span><input id="q" type="search" placeholder="พิมพ์รหัสหรือคำ เช่น DOC-OBS, Staff"></label><div id="fcount" class="sm" aria-live="polite"></div></div>

<section id="road"><div class="eyebrow">4 · ROADMAP 0–24 (รหัส C/Phase เดิม ไม่เปลี่ยน)</div><h2>เส้นทางหลักตั้งแต่ต้นจนปลายทาง</h2><p class="key">${EMOJI.map(([, k, l, g]) => `<span class="pill s-${k}"><span aria-hidden="true">${g}</span> ${esc(l)}</span>`).join(" ")}</p>
<div class="tw"><table class="t" data-filter="rows"><thead><tr><th>ลำดับ</th><th>รหัส / ขั้นตอน</th><th>สถานะ</th><th>ความหมายและข้อจำกัด</th><th>หลักฐาน</th></tr></thead><tbody>${roadRows}</tbody></table></div>
<details class="more"><summary>ฐานระบบก่อนเส้นทางหลัก — C0 ถึง C4.2 (${d.foundation.length})</summary><div class="tw"><table class="t" data-filter="rows"><thead><tr><th>รหัส</th><th>งาน</th><th>สถานะ</th><th>คงไว้ / กลับไปทำ</th></tr></thead><tbody>${baseRows}</tbody></table></div></details></section>

<section id="tasks"><div class="eyebrow">5 · งานปัจจุบันและตำแหน่งที่หยุด</div><h2>ตารางงาน (${d.tasks.length})</h2>
<div class="tw"><table class="t" data-filter="rows"><thead><tr><th>รหัส</th><th>งาน</th><th>สถานะ</th><th>สภาพแวดล้อม / ขอบเขต</th><th>ผ่าน / ทั้งหมด</th><th>ขั้นถัดไป</th><th>ผู้รับผิดชอบ</th><th>วัน / commit</th><th>หลักฐาน</th></tr></thead><tbody>${taskRows}</tbody></table></div></section>

<section id="issues"><div class="eyebrow">6 · ข้อที่รอตัดสิน และค้าง / ติดขัด / งานเก่าที่ยังมีประโยชน์</div><h2>ทะเบียนค้าง (${r.issues.length}) — DOC-OBS-01…05 และงานจากประวัติ</h2>
<h3 class="sub3" id="decisions">ข้อที่รอตัดสิน (${(r.decisions || []).length}) — ข้อเสนอของ Code ไม่ใช่มติ</h3><div class="cards dec">${(r.decisions || []).map((x) => `<article class="card" data-env="docs"><div class="eyebrow">${esc(x.id)} · ผู้ตัดสิน: ${actor(x.decider)} · ${x.status === "open" ? "รอตัดสิน" : "ตัดสินแล้ว"}</div><h3>${inline(x.question)}</h3><ol class="opts">${x.options.map((o) => `<li>${inline(o)}</li>`).join("")}</ol><p class="cv">${inline(x.codeView)}</p><p class="sm">กระทบ: ${inline(x.affects || "-")}</p></article>`).join("")}</div>
<p class="rule">DOC-OBS เป็นรหัสชั่วคราวของข้อสังเกต ไม่ใช่เลข PENDING และ <strong>การบันทึกไม่ใช่คำสั่งให้แก้</strong> · ไม่พบหลักฐาน = UNVERIFIED · BLOCKED ไม่ใช่ FAIL</p>
<div class="tw"><table class="t" data-filter="rows"><thead><tr><th>รหัส</th><th>ปัญหา</th><th>ระดับ</th><th>สถานะ</th><th>สภาพแวดล้อม</th><th>ผู้รับผิดชอบ</th><th>ขั้นถัดไป</th><th>ที่มา / หลักฐาน</th></tr></thead><tbody>${issueRows}</tbody></table></div></section>

<section id="hist"><div class="eyebrow">7 · ประวัติและหลักฐาน</div><details open><summary>เหตุการณ์สำคัญ (${r.history.length})</summary><ul class="hist">${hist}</ul></details>
<details><summary>ผู้รับผิดชอบ</summary><ul class="hist">${Object.keys(r.actors).map((k) => `<li><strong>${esc(k)}</strong> — ${esc(r.actors[k])}</li>`).join("")}</ul></details></section>
<footer class="foot">ห้ามมีรหัสผ่าน คีย์ อีเมล เบอร์ หรือ token ในแผงนี้ · production ยัง RED / ห้าม merge / deploy / GREEN จนกว่าเจ้าของอนุมัติ · แก้สถานะที่ PROJECT-STATUS.md ที่เดียว</footer>
</div>
<script>${js}</script>`;
}

const CSS = `
:root{--bg:#f3f5f8;--surface:#fff;--ink:#16202c;--muted:#546273;--line:#d8dee6;--accent:#1d4fd7;--accent-ink:#fff;--soft:#e9eef7;
--ok:#12794a;--ok-bg:#dff3e8;--part:#8a5a00;--part-bg:#fbefcf;--bad:#b3261e;--bad-bg:#fbe1de;--none:#566272;--none-bg:#e8ebf0;--dir:#2a5f9e;--dir-bg:#dfeaf8;
--f-body:'IBM Plex Sans Thai',system-ui,'Noto Sans Thai','Segoe UI',sans-serif;--f-mono:'IBM Plex Mono',ui-monospace,Menlo,Consolas,monospace}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0f151d;--surface:#17202b;--ink:#e6ebf2;--muted:#9aa8b8;--line:#2b3746;--accent:#7ea3ff;--accent-ink:#0f151d;--soft:#1e2a3a;
--ok:#5fd09a;--ok-bg:#133526;--part:#f0c36a;--part-bg:#3a2e0f;--bad:#ff8f86;--bad-bg:#3d1b19;--none:#a3afbd;--none-bg:#232d3a;--dir:#8dbdf5;--dir-bg:#16283d;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#0f151d;--surface:#17202b;--ink:#e6ebf2;--muted:#9aa8b8;--line:#2b3746;--accent:#7ea3ff;--accent-ink:#0f151d;--soft:#1e2a3a;
--ok:#5fd09a;--ok-bg:#133526;--part:#f0c36a;--part-bg:#3a2e0f;--bad:#ff8f86;--bad-bg:#3d1b19;--none:#a3afbd;--none-bg:#232d3a;--dir:#8dbdf5;--dir-bg:#16283d;color-scheme:dark}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.65 var(--f-body);-webkit-text-size-adjust:100%}
.wrap{max-width:1240px;margin:0 auto;padding:20px 16px 56px;display:flex;flex-direction:column;gap:22px}
h1{font-size:clamp(22px,4.4vw,32px);line-height:1.25;margin:2px 0 0;text-wrap:balance;font-weight:700}
h2{font-size:clamp(17px,2.8vw,22px);line-height:1.35;margin:4px 0 10px;text-wrap:balance;font-weight:700}
h3{font-size:16px;margin:2px 0 8px;font-weight:700}h4{font-size:12.5px;margin:12px 0 4px;color:var(--muted);letter-spacing:.04em;font-weight:600}
p{margin:0 0 8px}code,.mono{font-family:var(--f-mono);font-size:.92em}code{background:var(--soft);padding:1px 5px;border-radius:4px}.sm{font-size:12px}
.eyebrow{font-size:12px;letter-spacing:.08em;color:var(--muted);font-weight:600;text-transform:uppercase}
.mast{display:flex;flex-wrap:wrap;gap:14px 28px;justify-content:space-between;align-items:flex-end;border-bottom:2px solid var(--ink);padding-bottom:14px}
.stamp{display:flex;flex-wrap:wrap;gap:6px 22px;margin:0}.stamp div{min-width:0}.stamp dt{font-size:11.5px;color:var(--muted)}.stamp dd{margin:0;font-size:13px;overflow-wrap:anywhere}
.fresh{background:var(--soft);border-radius:6px;padding:8px 12px;font-size:13px;margin:0}
.jump{display:flex;flex-wrap:wrap;gap:6px 14px;position:sticky;top:env(safe-area-inset-top,0px);background:var(--bg);padding:8px 0;z-index:5;border-bottom:1px solid var(--line)}
.jump a{font-size:13px;color:var(--ink);text-decoration:none;padding:3px 2px;border-bottom:2px solid transparent}.jump a:hover,.jump a:focus-visible{border-bottom-color:var(--accent)}
a{color:var(--accent)}a:focus-visible,button:focus-visible,summary:focus-visible,input:focus-visible{outline:3px solid var(--accent);outline-offset:2px;border-radius:4px}
.card{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:18px 18px 14px;min-width:0}
.hero{border-top:4px solid var(--accent)}.you{border:2px solid var(--ink)}.you h2{font-size:clamp(18px,3vw,24px)}
.grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr));gap:12px 28px}.grid2>div{min-width:0}
.goal{max-width:78ch}.sum{margin:10px 0 0;font-size:13px;color:var(--muted)}
.tag{display:inline-block;background:var(--soft);border-radius:5px;padding:1px 8px;font-size:13px;margin:0 4px 4px 0}
.kv{border-collapse:collapse;width:100%;font-size:13.5px}.kv th{text-align:left;font-weight:500;color:var(--muted);padding:3px 12px 3px 0;vertical-align:top;width:48%}.kv td{padding:3px 0;overflow-wrap:anywhere}
.yd{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr));gap:10px 22px;margin:8px 0 2px}.yd dt{font-size:12px;color:var(--muted)}.yd dd{margin:0}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(330px,100%),1fr));gap:14px}
.scope .big{font-size:26px;font-weight:700;line-height:1.2;margin:4px 0 2px}.scope .big span{font-size:16px;font-weight:600;color:var(--muted)}.nc{color:var(--muted);font-weight:600}
.note{font-size:13px;color:var(--muted);margin-bottom:6px}.preview{font-size:12.5px;border:1px dashed var(--line);border-radius:6px;padding:4px 8px;color:var(--muted);margin-bottom:8px}.preview em,.draft{font-style:normal;color:var(--part)}
.bar{display:flex;height:12px;border-radius:6px;overflow:hidden;background:var(--none-bg);margin:8px 0 6px}.seg{display:block;min-width:0}
.seg-pass{background:var(--ok)}.seg-fail{background:var(--bad)}.seg-blocked{background:var(--part)}.seg-unverified{background:var(--none)}
.legend{display:flex;flex-wrap:wrap;gap:3px 14px;font-size:12.5px;color:var(--muted)}.d{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px}
.blk{font-size:13px;margin:8px 0 2px}.rule{font-size:13px;color:var(--muted);max-width:90ch}
details{margin-top:8px}summary{cursor:pointer;font-weight:600;font-size:14px;padding:4px 0}
.items{list-style:none;margin:6px 0 0;padding:0;display:flex;flex-direction:column;gap:6px}.it{display:flex;gap:8px;font-size:13.5px;line-height:1.45;min-width:0}.itx{min-width:0;overflow-wrap:anywhere}.itx small{display:block;color:var(--muted)}
.ig{flex:0 0 20px;height:20px;border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:700;color:#fff;margin-top:1px}
.it-pass .ig{background:var(--ok)}.it-fail .ig{background:var(--bad)}.it-blocked .ig{background:var(--part)}.it-unverified .ig,.it-na .ig{background:var(--none)}.iid{font-family:var(--f-mono);font-size:12px}
.filters{display:flex;flex-wrap:wrap;gap:10px 22px;align-items:center;background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:10px 14px}
.fl{display:flex;flex-wrap:wrap;gap:6px;align-items:center;min-width:0}.fl>span{font-size:12px;color:var(--muted);margin-right:2px}
.chip{font:inherit;font-size:13px;border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:999px;padding:3px 12px;cursor:pointer}.chip[aria-pressed="true"]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
input[type=search]{font:inherit;font-size:14px;border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:6px;padding:5px 9px;min-width:0;width:min(260px,100%)}
.pill{display:inline-flex;gap:5px;align-items:center;border-radius:999px;padding:1px 10px;font-size:12.5px;font-weight:600;white-space:nowrap}
.s-ok{background:var(--ok-bg);color:var(--ok)}.s-part{background:var(--part-bg);color:var(--part)}.s-bad{background:var(--bad-bg);color:var(--bad)}.s-none{background:var(--none-bg);color:var(--none)}.s-dir{background:var(--dir-bg);color:var(--dir)}
.key{display:flex;flex-wrap:wrap;gap:6px}.sev{font-weight:700;font-size:12.5px;padding:1px 8px;border-radius:5px;white-space:nowrap}
.sev-critical{background:var(--bad);color:#fff}.sev-high{background:var(--bad-bg);color:var(--bad)}.sev-med{background:var(--part-bg);color:var(--part)}.sev-low,.sev-info{background:var(--none-bg);color:var(--none)}
.tw{overflow-x:auto}.t{border-collapse:collapse;width:100%;font-size:13.5px}.t th{text-align:left;font-size:12px;color:var(--muted);font-weight:600;border-bottom:2px solid var(--ink);padding:6px 10px;white-space:nowrap}
.t td{padding:9px 10px;border-bottom:1px solid var(--line);vertical-align:top;min-width:0;overflow-wrap:anywhere}.t tr:target td{background:var(--soft)}.ev{color:var(--muted);font-size:12.5px}.sub{font-size:12px;color:var(--muted);margin-top:3px}
.envh h3{margin:14px 0 6px;font-size:14px;color:var(--muted);letter-spacing:.03em}.sub3{margin:18px 0 8px;font-size:16px}.opts{margin:6px 0 8px;padding-left:20px;font-size:13.5px}.cv{font-size:13px;color:var(--muted);border-left:3px solid var(--line);padding-left:10px}.hist{margin:6px 0 0;padding-left:18px}.hist li{margin:4px 0}.foot{font-size:12.5px;color:var(--muted);border-top:1px solid var(--line);padding-top:12px}
tr[hidden]{display:none}
@media (max-width:820px){.t thead{position:absolute;left:-9999px}.t,.t tbody,.t tr,.t td{display:block;width:100%}.t tr{border:1px solid var(--line);border-radius:8px;margin:0 0 10px;padding:6px 10px;background:var(--surface)}
.t td{border:0;padding:5px 0}.t td::before{content:attr(data-l);display:block;font-size:11.5px;color:var(--muted);font-weight:600;margin-bottom:1px}.tw{overflow:visible}}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}`;
const JS = `(function(){var env='all',st='all',q='';var rows=[].slice.call(document.querySelectorAll('table[data-filter=rows] tbody tr'));var cards=[].slice.call(document.querySelectorAll('.scope'));
function ok(el){var e=el.getAttribute('data-env');if(env!=='all'&&e&&e!==env)return false;var s=el.getAttribute('data-st');if(st!=='all'&&s&&['ok','part','bad','none','dir'].indexOf(s)>-1&&s!==st)return false;if(q&&el.textContent.toLowerCase().indexOf(q)<0)return false;return true}
function apply(){var n=0;rows.forEach(function(r){var v=ok(r);r.hidden=!v;if(v)n++});cards.forEach(function(c){c.hidden=!(env==='all'||c.getAttribute('data-env')===env)});var f=document.getElementById('fcount');if(f)f.textContent='แสดง '+n+' จาก '+rows.length+' แถว'}
[].forEach.call(document.querySelectorAll('[data-f-env]'),function(b){b.addEventListener('click',function(){env=b.getAttribute('data-f-env');[].forEach.call(document.querySelectorAll('[data-f-env]'),function(x){x.setAttribute('aria-pressed',x===b)});apply()})});
[].forEach.call(document.querySelectorAll('[data-f-st]'),function(b){b.addEventListener('click',function(){st=b.getAttribute('data-f-st');[].forEach.call(document.querySelectorAll('[data-f-st]'),function(x){x.setAttribute('aria-pressed',x===b)});apply()})});
var qi=document.getElementById('q');if(qi)qi.addEventListener('input',function(){q=qi.value.trim().toLowerCase();apply()});apply()})();`;

function build(opts) {
  opts = opts || {}; const md = fs.readFileSync(opts.src || SRC, "utf8"); const d = parse(md); const errs = validate(d);
  if (errs.length) { const e = new Error("PROJECT-STATUS.md registry invalid:\n - " + errs.join("\n - ")); e.errors = errs; throw e; }
  const frag = render(d, opts.stamp || stampText());
  const doc = '<!doctype html>\n<html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap">\n' + frag.replace(/^<title>.*<\/title>\n/, "<title>แผงติดตามโครงการ Huahin</title>\n") + "\n</body></html>\n";
  return { data: d, fragment: frag, document: doc };
}
module.exports = { build, parse, validate, pct, ENV, ITEM_STATUS };
if (require.main === module) {
  const a = process.argv.slice(2); const val = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
  try {
    const out = build({ stamp: val("--stamp") });
    if (a.includes("--check")) { console.log("registry OK: " + out.data.roadmap.length + " roadmap rows, " + out.data.tasks.length + " tasks, " + out.data.reg.issues.length + " issues, " + out.data.reg.scopes.length + " scopes"); process.exit(0); }
    const o = val("--out") || path.join(ROOT, "docs", "status-panel", "index.html"); fs.mkdirSync(path.dirname(o), { recursive: true }); fs.writeFileSync(o, out.document);
    if (val("--fragment")) fs.writeFileSync(val("--fragment"), out.fragment);
    console.log("status panel written: " + path.relative(ROOT, o) + " (" + out.document.length + " bytes)");
  } catch (e) { console.error("STATUS PANEL BUILD REFUSED: " + e.message); process.exit(1); }
}
