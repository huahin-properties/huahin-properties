> 🔒 **PHS-CLOSE-1 — 8 สิงหาคม 2569 (2026-08-08)** — ปิดงานรอบสุดท้าย: ไฟล์นี้ตรวจสอบแล้วว่าเป็นเวอร์ชันล่าสุดที่ใช้งานจริง ณ รอบส่งมอบนี้ ไม่มีเนื้อหาล้าสมัยหรือขัดแย้งกับไฟล์อื่นในชุดส่งมอบ (ตรวจสอบพร้อมกันทั้ง 23 ไฟล์ในชุด Handoff Package)

---

---
Title: huahin.properties — Master Handoff (Single-File Project Snapshot)
Purpose: ไฟล์เดียวรวมทุกสิ่งที่ผู้ช่วย CEO/นักพัฒนาใหม่ต้องรู้ ใช้เมื่อส่งได้เพียงไฟล์เดียว
Status: Active
Owner: Product Owner / CEO Assistant
Source of Truth: สรุปจากไฟล์ต้นทางทั้งหมด — หากขัดแย้งกับต้นทาง ให้ยึดต้นทาง (Mission Control / Blueprint / PROJECT_HISTORY) เป็นหลัก ไฟล์นี้คือสรุปเพื่อความสะดวกเท่านั้น
Last Updated: 25 กรกฎาคม 2569
Related Documents: ทุกไฟล์ในโครงการ (ดู docs/ceo-handoff/DOCUMENT_INDEX.md)
---

# HUAHIN_PROPERTIES_MASTER_HANDOFF

## 1. Project Overview
huahin.properties — เว็บไซต์อสังหาริมทรัพย์ + admin CMS สำหรับ Hua Hin/Pranburi/Cha-am กำลังพัฒนาสู่ "Real Estate Workspace Platform": Member มี Digital Office (Mini-Site `huahin.properties/@username`), Customer มี Customer Space ส่วนตัว, AI เป็น Property Assistant ไม่ใช่ chatbot ทั่วไป บริการเฉพาะ 3 อำเภอ หัวหิน/ชะอำ/ปราณบุรี

## 2. Current Status
Phase ปัจจุบัน: **Realtime Conversation System (Firestore) — Bug-fix & Stabilization** — ระบบแชท Realtime ข้ามอุปกรณ์ระหว่างลูกค้าที่เปิด Shared Collection Link กับ Owner/Agent/Admin schema/rules/functions deploy แล้ว กำลังยืนยันว่า sender identity resolution และการส่งข้อความถึง Owner Inbox ทำงานถูกต้อง 100% หลัง fix ล่าสุด

## 3. Current Phase
รายละเอียดเต็มดู `docs/ceo-handoff/CURRENT_PHASE_STATUS.md` — สรุป: schema/security rules/functions เสร็จแล้ว, รอ CEO ทดสอบ production ด้วยลิงก์ Shared Collection ใหม่ ยืนยันทั้งฝั่งลูกค้าและฝั่ง Owner ก่อนปิด Phase

## 4. Architecture
- Frontend: Design Components (.dc.html) — Home, Search Results, Property Details, Sell, About, Contact, Admin Dashboard, Owners, Property Map, AI Quick Add, Site Content ฯลฯ
- Backend: Firebase (Firestore + Auth + Storage + Cloud Functions), Stripe, Anthropic Claude API ผ่าน Cloud Function proxy
- Hosting: GitHub Pages + custom domain, อัปโหลดผ่าน GitHub web UI, Cloud Functions deploy ผ่าน GitHub Codespace
- Chat: `conversation-firestore.js` + `ContactRail.dc.html`, Firebase Anonymous Auth, Callable Functions `startConversation`/`sendConversationTurn`
- Security: Firestore Rules role-based + deny-by-default (deployed)

## 5. Workflow (ดูรายละเอียดเต็ม PROJECT_OPERATING_STANDARD.md)
Start of Work → Scope Control → Database Rules → Daily Close → Release Verification → GitHub Upload → GitHub Verification → Final Release Verification → Official Completion → Completion History → Definition of Done (6 ข้อ)

## 6. Team Roles
- **CEO**: ตัดสินใจ, ทดสอบ production, อนุมัติ business direction
- **Claude (Lead Developer)**: เขียน/แก้โค้ด, ทดสอบ, รายงาน — ไม่เปลี่ยน scope เอง
- **Product Owner / CEO Assistant**: รักษา scope, ตรวจงาน, กำหนด next action

## 7. Scope Rules
ห้ามเพิ่ม feature ใหม่เอง, ห้าม refactor นอกจุดที่เกี่ยวข้อง, ห้ามเปลี่ยน architecture โดยไม่อนุมัติ, สิ่งนอก scope → backlog, แก้เฉพาะจุดที่มีหลักฐานว่ามีปัญหา

## 8. Known Issues (สรุป — เต็มดู KNOWN_ISSUES.md)
- 🔴 Login session/My Favorites หายหลัง login ซ้ำ — ยังไม่ตรวจสาเหตุ
- 🔴 กำลังยืนยัน fix ระบบแชท Realtime ว่าใช้งานได้จริงหลัง deploy ล่าสุด
- 🟡 Agent Signup password field เป็น `type="text"` (plaintext) — ไม่ยืนยันว่าตั้งใจหรือบั๊ก
- 🟡 Mission numbering สองระบบขนานยังไม่ reconcile
- 🟡 AI photo alt-text ยังไม่เชื่อมกับ `<img alt>` จริง (SEO gap)

## 9. Next Action
1. CEO อัปโหลดไฟล์ล่าสุด (functions/index.js, ContactRail.dc.html ฯลฯ) ขึ้น GitHub + deploy
2. CEO ทดสอบลิงก์ Shared Collection ใหม่ทั้ง 2 ฝั่ง (ลูกค้า/Owner)
3. รายงานผลกลับให้ Claude วิเคราะห์ต่อถ้ายังไม่ผ่าน → Product Owner ตรวจ → ปิด Phase

## 10. Definition of Done
1. พัฒนาเสร็จ 2. ทดสอบผ่าน 3. Product Owner อนุมัติ 4. Upload+Verification ผ่าน 5. Official Completion Notice สร้างแล้ว 6. PROJECT_HISTORY.md อัปเดตแล้ว — ขาดข้อใดข้อหนึ่ง = ยังไม่เสร็จ

## 11. Handoff Instructions
เมื่อเปลี่ยนห้องแชต/ผู้ช่วยใหม่ ใช้ `docs/ceo-handoff/HANDOFF_CHECKLIST.md` ตรวจก่อนส่งมอบ แล้วส่งไฟล์ตามรายการในนั้น หรือถ้าส่งได้ไฟล์เดียว ใช้ไฟล์นี้ (`HUAHIN_PROPERTIES_MASTER_HANDOFF.md`) แทน

## 12. New Chat Bootstrap Prompt
ดูข้อความเต็มใน `docs/ceo-handoff/NEW_CHAT_BOOTSTRAP_PROMPT.md` — สรุปสั้น: "อ่านเอกสารที่แนบก่อนตอบ ใช้ PROJECT_CONTEXT_SNAPSHOT/CURRENT_PHASE_STATUS/PROJECT_OPERATING_STANDARD เป็นหลัก ทำหน้าที่ Product Owner รักษา scope ห้ามประกาศงานเสร็จก่อนผ่าน Definition of Done แล้วสรุปว่า next action ของ CEO คืออะไร"

## Confidential Note
`Internal Pricing Model - CONFIDENTIAL.md` เก็บราคาต้นทุน/margin — **ห้ามรวมในไฟล์นี้หรือเปิดเผยต่อสาธารณะ** อยู่แยกไฟล์เสมอ
