---
Title: Known Issues
Purpose: บั๊ก/ข้อจำกัดที่รู้อยู่แล้ว ณ ปัจจุบัน — รวมศูนย์จาก entries ต่างๆ ใน PROJECT_HISTORY.md
Status: Active
Owner: Product Owner / CEO Assistant
Source of Truth: ไฟล์นี้ (สรุป) — รายละเอียดต้นทางดู ../../PROJECT_HISTORY.md
Last Updated: 25 กรกฎาคม 2569
Related Documents: CURRENT_PHASE_STATUS.md, ../../PROJECT_HISTORY.md
---

# Known Issues

## 🔴 Open — ต้องตรวจสอบ
1. **Login/Session persistence**: ผู้ใช้รายงานว่าหลัง login ไม่มีปุ่ม "ออกจากระบบ" ที่ชัดเจน และเมื่อ login ซ้ำ ข้อมูล "รายการโปรด" (My Favorites) หายไปต้องสร้างใหม่ทุกครั้ง — ยังไม่ได้ตรวจสาเหตุ (สงสัยเรื่อง session/localStorage vs Firestore persistence)
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
