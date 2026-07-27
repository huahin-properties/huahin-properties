---
Title: Project Operating Standard
Purpose: กฎการทำงานหลักของทีมทั้งหมด — Single Source of Truth ด้าน Workflow
Status: Active
Owner: Product Owner / CEO
Source of Truth: ไฟล์นี้ (Workflow) — ดู ../../SOURCE_OF_TRUTH_MATRIX.md สำหรับหมวดอื่น
Last Updated: 25 กรกฎาคม 2569
Related Documents: ../../CEO GUIDE.md, ../../START HERE.md, ../../RELEASE CHECKLIST.md, ../../PROJECT_HISTORY.md
---

# Project Operating Standard

## 1. Team Roles

### CEO
- ตัดสินใจ, กำหนดทิศทาง, ทดสอบ Production จริง, อนุมัติ Business Direction, ส่งผลการทดสอบ, อนุมัติงานที่มีผลต่อธุรกิจ

### Lead Developer — Claude
- อ่าน Documentation ก่อนเริ่มงาน, วิเคราะห์ระบบ, เขียน/แก้โค้ด, Dry Run, ตรวจ Security, จัดทำรายงาน, จัดทำ Release Package, ห้ามขยาย Scope โดยไม่ได้รับอนุมัติ

### Product Owner / CEO Assistant
- รักษา Scope, ตรวจ UX/Business Logic/Architecture/Cost/SEO, ตรวจความพร้อม Production, อนุมัติการปิด Phase, กำหนด Next Action, รักษาความต่อเนื่องของโครงการ

## 2. Source of Truth
ดู `../../SOURCE_OF_TRUTH_MATRIX.md` — สรุป: Current Status → Mission Control, Architecture → Blueprint, Workflow → ไฟล์นี้, History → PROJECT_HISTORY.md, Release → RELEASE CHECKLIST.md

## 3. Start of Work
ก่อนเริ่มงานทุกครั้งต้อง: (1) อ่าน Mission Control (2) อ่าน Blueprint ที่เกี่ยวข้อง (3) อ่าน Current Phase Status (4) อ่านไฟล์นี้ (5) อ่าน Known Issues (6) ตรวจ Source Code ที่เกี่ยวข้อง (7) ยืนยัน Scope ก่อนเขียนโค้ด

## 4. Scope Control
- ห้ามเพิ่ม Feature ใหม่เอง, ห้าม Refactor ส่วนที่ไม่เกี่ยวข้อง, ห้ามเปลี่ยน Architecture โดยไม่ได้รับอนุมัติ
- สิ่งนอก Scope ให้บันทึกใน Backlog แทนการทำทันที
- แก้เฉพาะจุดที่มีหลักฐานว่ามีปัญหา — Test first, verify, then fix

## 5. Database Management Rules
- ก่อนลบ Lister ต้องตรวจ Property Ownership ก่อน
- ก่อน Cleanup ต้องทำ Dry Run เสมอ
- Cleanup ต้องทำเป็น Phase ไม่ทำทีเดียวทั้งหมด
- ห้ามลบ Production Data โดยไม่มีรายงาน
- ต้องมี Backup/Rollback Plan ก่อนแก้ข้อมูลจริง
- ต้องตรวจ Orphan Records และ Security Rules ก่อน Deploy

## 6. Daily Close
ก่อนจบวันต้องอัปเดต: Mission Control, Blueprint, Project Status, Documentation, Known Issues, Next Action — พร้อมบันทึกการเปลี่ยนแปลง Feature/Architecture/Workflow และสิ่งที่ยังไม่ผ่านการทดสอบ หากมีการเปลี่ยนแปลงระบบแต่เอกสารยังไม่อัปเดต ให้ถือว่างานวันนั้นยังไม่ปิด

## 7. Release Verification
ก่อน Upload ต้องใช้ `../../RELEASE CHECKLIST.md` — ถ้ามีข้อใดไม่ผ่าน ❌ ห้าม Upload ต้องแก้ให้ผ่านก่อน

## 8. GitHub Upload
ตรวจไฟล์ที่เปลี่ยน → ตรวจ Branch → Upload → Commit → ตรวจ Commit → ตรวจ GitHub Actions → ตรวจ GitHub Pages Build

## 9. GitHub Verification (Release Verification Model — v1.0 ขึ้นไป)
Claude ไม่มีสิทธิ์เข้าถึง GitHub Repository โดยตรง ดังนั้น "Verify Upload" หมายถึง **Release Verification** ไม่ใช่ Claude ตรวจสอบเอง:
1. CEO Upload GitHub จริง
2. CEO รวบรวมหลักฐาน (Commit, Branch, GitHub Actions, GitHub Pages, เว็บไซต์จริง) ส่งให้ Product Owner
3. Product Owner ตรวจหลักฐานและอนุมัติอย่างชัดเจน
4. เมื่อ Product Owner อนุมัติแล้วเท่านั้น จึงถือว่า Upload + Verify = Completed — **Product Owner's Approval คือ Source of Truth** ของขั้นตอนนี้ ไม่ใช่การคาดการณ์หรือ Claude เดาเอง
5. Claude มีหน้าที่อัปเดต Documentation/CEO Operating Console ให้สะท้อนผลการอนุมัตินั้น

หลัง Upload ต้องตรวจ: Commit สำเร็จ, Branch ถูกต้อง, ไฟล์ครบ, GitHub Actions ผ่าน, GitHub Pages Build ผ่าน, หน้าเว็บโหลดไฟล์ใหม่จริง (ไม่ใช่ cache เก่า), Version ถูกต้อง

## 10. Final Release Verification
หลัง Upload ตรวจซ้ำ: เว็บไซต์เปิดได้, ฟังก์ชันที่แก้ทำงานจริง, Console ไม่มี Error สำคัญ, Firestore/Authentication ทำงาน, Rules ไม่บล็อกการใช้งานปกติ, Realtime ทำงาน, Version ตรงกับ Release — ถ้าข้อใดไม่ผ่าน ถือว่า Release ยังไม่เสร็จ

## 11. Official Completion
ห้ามประกาศว่า Feature/Sprint/Phase เสร็จสมบูรณ์จนกว่า Product Owner จะอนุมัติ ต้องสร้าง Official Completion Notice ที่มี: Project, Phase/Sprint/Feature, Status, Approved By, Completion Date, Summary, Verification Result, Known Limitations, Superseded By, Next Phase

## 12. Completion History
งานที่ปิดอย่างเป็นทางการทุกครั้งต้องบันทึกใน `../../PROJECT_HISTORY.md` พร้อม: Date, Project, Phase/Sprint/Feature, Status, Approved By, Summary, Release Version, Verification, Next Phase

## 13. Definition of Done
งานถือว่าเสร็จเมื่อผ่านครบทั้ง 6 ข้อ:
1. พัฒนาเสร็จ
2. ทดสอบผ่าน
3. Product Owner อนุมัติ
4. Upload และ Verification ผ่าน
5. Official Completion Notice ถูกสร้าง
6. `../../PROJECT_HISTORY.md` ถูกอัปเดต

หากขาดข้อใดข้อหนึ่ง ให้ถือว่างานยังไม่เสร็จ — แม้ Upload ขึ้น GitHub สำเร็จแล้วก็ตาม
