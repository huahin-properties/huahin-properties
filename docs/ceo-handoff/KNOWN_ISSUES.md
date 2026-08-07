> 🔒 **PHS-CLOSE-1 — 8 สิงหาคม 2569 (2026-08-08)** — ปิดงานรอบสุดท้าย: ไฟล์นี้ตรวจสอบแล้วว่าเป็นเวอร์ชันล่าสุดที่ใช้งานจริง ณ รอบส่งมอบนี้ ไม่มีเนื้อหาล้าสมัยหรือขัดแย้งกับไฟล์อื่นในชุดส่งมอบ (ตรวจสอบพร้อมกันทั้ง 23 ไฟล์ในชุด Handoff Package)

---

---
Title: Known Issues
Purpose: บั๊ก/ข้อจำกัดที่รู้อยู่แล้ว ณ ปัจจุบัน — รวมศูนย์จาก entries ต่างๆ ใน PROJECT_HISTORY.md
Status: Active
Owner: Product Owner / CEO Assistant
Source of Truth: ไฟล์นี้ (สรุป) — รายละเอียดต้นทางดู ../../PROJECT_HISTORY.md
Last Updated: 30 กรกฎาคม 2569
Related Documents: CURRENT_PHASE_STATUS.md, ../../PROJECT_HISTORY.md
---

# Known Issues

## ✅ Resolved (30 กรกฎาคม 2569)
- **Agent Signup redirect flash**: หน้า `Agent Signup.dc.html` เคยกะพริบกลับไปที่ฟอร์ม login/signup ระหว่างรอผล Google/Facebook redirect — แก้แล้ว (เพิ่ม loading overlay)
- **Firestore lister ซ้ำซ้อน**: อีเมลเดียวกันสร้าง 2 บัญชี (2 UID) เพราะ Firebase Auth ตั้ง "สร้างหลายบัญชีต่อ 1 identity provider" — เปลี่ยนเป็น "Link accounts by email" แล้ว
- **โควตาแพ็กเกจไม่ตรงกับโฆษณา**: `tierQuota`/`tierLimit`/`photoLimit`/`aiGenLimit` ไม่ตรงกับที่เว็บโฆษณาไว้ (ระดับ 2 โฆษณา 15 หลัง แต่โค้ดจำกัดไว้ 25, ระดับ 3/พรีเมียมไม่มี AI quota เลย ตกไปใช้ค่า default 1) — แก้ให้ตรงกันหมดแล้ว (ดู PROJECT_HISTORY.md รายละเอียด)
- **Rollout Level ชนกับชื่อแพ็กเกจ**: เปลี่ยนชื่อเป็น "ระยะการเปิดตัว (Rollout Stage)" แล้ว ไม่ซ้ำกับ "ระดับ 1/2/3" ของแพ็กเกจอีกต่อไป
- **Firestore Security Rules เตือนหมดอายุค้าง**: ยืนยันแล้วว่ากฎจริงถูก publish ใช้งานแล้ว — ลบเช็คลิสต์เตือนที่ค้างใน Admin Dashboard ออกแล้ว
- **ข้อมูลตัวอย่างค้างใน data.js**: ลบ OWNERS/TENANTS อีเมลปลอม (@example.com) ที่เคยโชว์เป็น fallback ในหน้า Owners ออกแล้ว

## 🔴 Open — ต้องตรวจสอบ
0. **Stripe ยังไม่ได้ต่อ Live mode**: เว็บตอนนี้ชี้ไปที่ Stripe Sandbox (โหมดทดสอบ) เท่านั้น — มีบัญชี Stripe Live จริง (huahin-property.ai) แล้วแต่ยังไม่ได้เชื่อมต่อกับ production — ห้ามรับเงินจริงจนกว่าจะสลับเป็น Live คีย์เสร็จ
1. **Login/Session persistence**: ผู้ใช้รายงานว่าหลัง login ไม่มีปุ่ม "ออกจากระบบ" ที่ชัดเจน และเมื่อ login ซ้ำ ข้อมูล "รายการโปรด" (My Favorites) หายไปต้องสร้างใหม่ทุกครั้ง — ยังไม่ได้ตรวจสาเหตุ
2. **Realtime Conversation ownership**: กำลังยืนยันว่า fix ล่าสุด (sender identity resolution, ownerId ผูก Firebase UID จริง) แก้ปัญหาชื่อผู้ส่งไม่ขึ้น/ข้อความไม่ถึง Owner ได้จริงหรือไม่ — ดู `CURRENT_PHASE_STATUS.md`

## 🟡 Known Limitation (ยอมรับแล้ว ไม่ใช่บั๊ก)
- **Agent Signup password fields**: ใช้ `type="text"` แทน `type="password"` ทั้งหน้า Signup และ Login — รหัสผ่านเห็นเป็นตัวอักษรชัดบนหน้าจอ ยังไม่ยืนยันว่าตั้งใจ (เทียบกับ Admin Login ที่ตั้งใจให้เป็นแบบนี้) หรือเป็นข้อบกพร่อง
- **Step-numbering สองระบบขนาน**: Mission numbering (Mission 01-12) มีสองชุดที่ยังไม่ reconcile กันสมบูรณ์ (บันทึกไว้ใน PROJECT_HISTORY.md ตั้งแต่ Mission 11)
- **AI photo captions ไม่ได้เชื่อมกับ `<img alt>` จริง**: AI Quick Add สร้าง SEO caption/alt-text ไว้แล้ว แต่ยังไม่ถูกใช้งานจริงในหน้าเว็บสาธารณะ (SEO gap ที่ระบุไว้ใน Blueprint §24.8)

## 📌 Backlog — Documentation System v1.1 (UX Improvement, ไม่กระทบ v1.0)
1. **Current Stage vs Release Workflow ซ้ำกัน**: ปรับ Current Stage ให้เหลือ Progress bar เดียวต่อหัวข้อ (Documentation/Validation/Upload/Snapshot/New Chat) แทนการพูดเรื่องเดียวกันซ้ำกับ Workflow ข้อ 4
2. **Documentation Prompt กินพื้นที่**: เปลี่ยนจาก text box สูง เป็น Summary 2-3 บรรทัด + ปุ่ม Copy Prompt + Open Fullscreen
3. **Quick Actions ควรมี Visual Hierarchy**: ปุ่ม "เปิด ChatGPT ห้องใหม่" ควรเป็น Primary (สีเข้มสุด) รองลงมา Bootstrap → Snapshot → Document
4. **CEO Guide Version label** (จาก v1.0 review เดิม): แสดง "CEO Operating Console — Version 1.0 / Documentation System v1.0" ไว้ด้านบนสุด

## 📌 Deferred / Not Yet Built
- Workspace Economy, Mini-Site Customiser, Customer Space เต็มรูปแบบ, Member Workspace — มีแค่ prototype `.dc.html` ยังไม่ implement backend จริง
- LINE Official Account webhook, Facebook auto-post integration — พูดคุยแนวคิดแล้ว ยังไม่สร้าง
- Real payment สำหรับ Workspace Resources/Add-ons — demo pricing เท่านั้น

## วิธีใช้ไฟล์นี้
เมื่อพบบั๊ก/ข้อจำกัดใหม่ ให้เพิ่มในหมวดที่เหมาะสมทันที และย้ายไปหมวด "ปิดแล้ว" (หรือลบออก + บันทึกใน PROJECT_HISTORY.md) เมื่อแก้เสร็จและผ่าน Definition of Done
