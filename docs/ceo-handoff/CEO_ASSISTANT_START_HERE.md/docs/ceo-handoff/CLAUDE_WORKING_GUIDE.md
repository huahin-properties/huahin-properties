---
Title: Claude Working Guide
Purpose: อธิบายวิธีที่ Claude (Lead Developer) ควรทำงานในโครงการนี้ สำหรับผู้ช่วย CEO ใช้ตรวจสอบว่า Claude ทำถูกวิธีหรือไม่
Status: Active
Owner: Product Owner / CEO Assistant
Source of Truth: ไฟล์นี้ + ../../CLAUDE.md (บทบาท/กฎเดิม)
Last Updated: 25 กรกฎาคม 2569
Related Documents: CEO_ASSISTANT_START_HERE.md, PROJECT_OPERATING_STANDARD.md
---

# Claude Working Guide

ก่อนเริ่มงานทุกครั้ง Claude ต้อง:
1. อ่าน `../../Mission Control.dc.html`, `../../BLUEPRINT.md` (เฉพาะหมวดที่เกี่ยวข้อง), และไฟล์ใน `/docs/ceo-handoff/` นี้
2. ยืนยัน Scope ของงานก่อนเขียนโค้ด — ถ้าไม่ชัดเจน ให้ถามก่อน ห้ามเดา

ระหว่างทำงาน Claude ต้อง:
- รายงานการเปลี่ยนแปลงทุกครั้งแบบ: สิ่งที่ทำ → ไฟล์ที่แก้ (ระบุครบ ทั้งที่แก้และที่ไม่แตะ) → เหตุผล → วิธีทดสอบ → Expected Result
- ระบุ Rollback Plan เมื่อแก้ไฟล์ที่กระทบ Production (เช่น Firestore Rules, Cloud Functions)
- ไม่เดาสาเหตุบั๊กโดยไม่มีหลักฐาน (log, error message, screenshot) — ถ้าไม่มีหลักฐานพอ ให้บอกว่า "ต้องการหลักฐานเพิ่มเติม" แทนการเดา
- ตรวจสอบว่าไฟล์ที่ส่งให้ CEO อัปโหลดจริงคือไฟล์ที่ Production ใช้งานอยู่ (ไม่ใช่ไฟล์ prototype/demo คนละตัว)
- ระวังเรื่อง Cache/Branch/Build/Version — เมื่อ deploy แล้วแต่ผลไม่เปลี่ยน ให้ตรวจสอบว่าไฟล์ที่แก้ไขจริงถูก deploy หรือไม่ ก่อนสรุปว่า fix ไม่ได้ผล
- ห้ามขยาย Scope เกินคำสั่งที่ได้รับโดยไม่แจ้งก่อน

เมื่อส่งมอบไฟล์:
- ต้องระบุไฟล์ที่แก้ทั้งหมดอย่างครบถ้วน พร้อมตำแหน่งที่ต้องอัปโหลด (root vs `functions/` เป็นต้น)
- สร้างไฟล์ดาวน์โหลดจริง (ไม่ใช่แค่บอกว่า "แก้แล้ว" โดยไม่มีไฟล์ให้ดาวน์โหลด)
- บอก Commit Message ที่แนะนำ และ Checklist สั้นๆ หลัง Upload
