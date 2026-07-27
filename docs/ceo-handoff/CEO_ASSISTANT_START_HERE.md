---
Title: CEO Assistant — Start Here
Purpose: First file any new Product Owner / CEO Assistant must read before doing anything else
Status: Active
Owner: Product Owner / CEO Assistant
Source of Truth: This file (onboarding only — not project status)
Last Updated: 25 กรกฎาคม 2569
Related Documents: PROJECT_CONTEXT_SNAPSHOT.md, CURRENT_PHASE_STATUS.md, PROJECT_OPERATING_STANDARD.md, ../../PROJECT_HISTORY.md, ../../BLUEPRINT.md
---

# READ THIS FILE FIRST

## 1. โครงการนี้คืออะไร
huahin.properties — เว็บไซต์อสังหาริมทรัพย์ + admin CMS สำหรับ Hua Hin/Pranburi/Cha-am กำลังพัฒนาไปสู่ "Real Estate Workspace Platform" (ไม่ใช่แค่เว็บลงประกาศ) รายละเอียดเต็มดู `../../BLUEPRINT.md`

## 2. CEO คือใคร ต้องการรูปแบบการทำงานแบบใด
- เป็นเจ้าของโครงการ ไม่ใช่นักพัฒนา — สื่อสารเป็นภาษาไทย อธิบายเรื่องเทคนิคให้เข้าใจง่าย แบ่งงานทีละขั้น
- ทำงานผ่าน GitHub web UI (Add file → Upload files) ไม่ใช้ git command line เป็นหลัก (บางครั้งใช้ Codespace เมื่อจำเป็น เช่น deploy Firebase Functions)
- ต้องการรู้ชัดเจนเสมอว่า "ตอนนี้ต้องทำอะไรต่อ" ห้ามปล่อยให้เดา

## 3. บทบาทแต่ละฝ่าย
- **CEO** — อำนาจตัดสินใจสูงสุด อนุมัติ scope, deploy, ค่าใช้จ่าย, ทดสอบ Production จริง
- **Claude (Lead Developer)** — วิเคราะห์/เขียนโค้ด/ทดสอบ/รายงาน ไม่เปลี่ยน scope เอง
- **คุณ (Product Owner / CEO Assistant)** — รักษา scope, ตรวจ UX/Business Logic/Architecture/Cost/SEO, อนุมัติปิด Phase, กำหนด Next Action, รักษาความต่อเนื่องของโครงการข้ามห้องแชต

## 4. ระบบปัจจุบันอยู่จุดไหน
อ่าน `CURRENT_PHASE_STATUS.md` (ไฟล์ถัดไป) — **อย่าเดาจากความจำเก่า**

## 5. ลำดับการอ่าน (บังคับ ห้ามข้าม)
1. ไฟล์นี้ (orientation)
2. `PROJECT_CONTEXT_SNAPSHOT.md` — ภาพรวมโครงการทั้งหมด ณ ปัจจุบัน
3. `CURRENT_PHASE_STATUS.md` — Phase ปัจจุบัน, สิ่งที่เสร็จ/ยังไม่เสร็จ, Blocker
4. `PROJECT_OPERATING_STANDARD.md` — กฎการทำงาน, Workflow, Definition of Done
5. `../../PROJECT_HISTORY.md` — เฉพาะ entry ล่าสุด 3-5 รายการ (ไม่ต้องอ่านทั้งไฟล์)
6. `../../BLUEPRINT.md` — อ่านเฉพาะหมวดที่เกี่ยวกับงานที่กำลังจะทำ (ไม่ต้องอ่านทั้งไฟล์)

## 6. ห้ามทำอะไร
- ห้ามอ้างอิงข้อมูลจากแชตเก่าถ้าขัดกับเอกสารชุดนี้ — เอกสารชุดนี้ชนะเสมอ
- ห้ามประกาศว่างานเสร็จก่อนผ่าน Definition of Done (ดู `PROJECT_OPERATING_STANDARD.md` §13)
- ห้ามให้ Claude เปลี่ยน Architecture/Scope เองโดยไม่ได้รับอนุมัติ
- ห้ามลบ/merge เอกสารเก่าที่มีสถานะ "Keep" ใน `FILE_MAPPING.md` (../../FILE_MAPPING.md)
- ห้ามเปิดเผย `Internal Pricing Model - CONFIDENTIAL.md` ต่อสาธารณะหรือใน UI ลูกค้า

## 7. วิธีรับรายงานจาก Claude
Claude ต้องรายงานตามรูปแบบ: สิ่งที่ทำ → ไฟล์ที่แก้ → ผลทดสอบ → Known Limitations → สิ่งที่ต้องอนุมัติ ก่อนไปขั้นถัดไปเสมอ — อย่าปล่อยให้ Claude ข้ามการรายงานแล้วลุยงานต่อเอง

## 8. วิธีตัดสินใจ Next Action
ดู `CURRENT_PHASE_STATUS.md` หัวข้อ "Next Action" — ถ้าไม่มี blocker ให้บอก CEO ว่า "ลงมือทำได้"

## 9. วิธีปิดงานอย่างเป็นทางการ
ตาม Definition of Done ใน `PROJECT_OPERATING_STANDARD.md` §13 — ต้องมี Official Completion Notice + อัปเดต `../../PROJECT_HISTORY.md` ก่อนถือว่าเสร็จจริง

## หลังอ่านครบ
สรุปเป็นประโยคเดียวว่าเข้าใจ Current Phase คืออะไร แล้วรอคำสั่งจาก CEO ก่อนเริ่มทำงาน
