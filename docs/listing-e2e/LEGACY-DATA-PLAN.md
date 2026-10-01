# LISTING-E2E-01 — สำรวจรูปแบบข้อมูลเดิม (อ่านอย่างเดียว) และแผนย้าย

สำรวจจากซอร์ส/fixtures/เทสต์เท่านั้น — **ไม่ได้อ่านหรือแก้ข้อมูล production** และรอบนี้ห้ามย้าย/ลบข้อมูล production

## รูปแบบข้อมูลเดิมที่พบ
| กลุ่ม | สร้างโดย | ลักษณะ | ที่อยู่ |
|---|---|---|---|
| A. เคสจากฟอร์มเดิม | Owner Submission (เขียน Firestore ตรงจาก browser) | id `own-<ts>-<rand>`; `contactName/Phone/Email`, `ownerContact`, `trackToken`, `coordsRaw`, `ownershipDocUrl` (data URL) **อยู่ใน `properties/{id}`** อ่านได้สาธารณะ; ไม่มี `internalSplit`; รูปใน `propertyPhotos/{id}-{n}` (สาธารณะ) + Storage `propertyPhotos/` | public |
| B. เคสจากแชท (CHAT-FIX/C4.2b) | `createCaseFromConversation` เดิม | เหมือน A + `conversationId`, `receptionVisitorId`, `caseSource:"ai_assistant"`; ไม่มีรูป | public |
| C. ประกาศจาก Lister Dashboard / Admin | ลิสเตอร์/ทีมงาน | มี `listerId`, `listingStatus`, รูป `propertyPhotos`; ข้อมูลติดต่อเป็นของประกาศ (ตั้งใจแสดง) | public (ตั้งใจ) |
| D. ตัวอย่าง `data.js` (24 รายการ) | static | ไม่มีข้อมูลส่วนตัว | ไม่เกี่ยว |
| E. `submissions` subcollection / `caseMessages` | Staff/ลูกค้า | ไม่เปลี่ยนโครงสร้าง; rules ของ caseMessages รองรับ token ทั้งใน `caseInternal` และเอกสารเดิม | – |

เคสใหม่ (หลังการเปลี่ยนนี้): `internalSplit:true` — โครงตาม LISTING-E2E-01.md §2

## พฤติกรรมของเคสเดิมหลังการเปลี่ยน (ทดสอบแล้ว)
- เคสกลุ่ม A/B **ทำงานเหมือนเดิม** (rules/compat layer ไม่แตะเคสที่ไม่มี `internalSplit`): Track Submission อ่านด้วย id + เทียบ token ที่ client, caseMessages ใช้ token บนเอกสารเดิม, Staff อ่าน/เขียนเหมือนเดิม
- **ยังรั่ว:** contact + trackToken + (กลุ่ม A/B ที่ยังรอตรวจ) รูป ใน public — คือสิ่งที่ migration ต้องแก้

## แผนย้าย (ยังไม่ทำ — ต้องให้ Owner สั่งเป็นรอบแยก)
1. สำรองก่อน: export Firestore (`properties`, `propertyPhotos`, `submissions`, `conversations`) และ Storage `propertyPhotos/own-*` ไปที่เก็บส่วนตัว (ขั้นตอนทีละคำสั่งให้ Owner)
2. สคริปต์ Admin SDK แบบ **dry-run ก่อน** (รายงานจำนวนเคสแต่ละกลุ่ม ไม่เขียนอะไร) แล้วให้ Owner ตรวจจำนวน
3. กลุ่ม A/B ที่ `listingStatus != live`: สร้าง `caseInternal/{id}` จาก `splitCaseFields` (ฟิลด์ private), ลบฟิลด์ private ออกจาก `properties/{id}`, ตั้ง `internalSplit:true`, ตั้ง `submittedByUid` = `receptionVisitorId` (แชท) หรือเว้น (ฟอร์มเก่าไม่มี uid — ติดตามด้วย token เดิมไม่ได้อีกผ่านหน้าเก่า → ใช้ `trackListingCase` ซึ่งอ่าน token จาก `caseInternal`: **ลิงก์ติดตามเดิมของลูกค้ายังใช้ได้**)
4. รูปรอตรวจของกลุ่ม A/B: ย้ายไฟล์ไป `casePhotos/{id}/{n}.webp` (ไม่มี token) + เอกสาร `casePhotos/{id}-{n}`, ลบ `propertyPhotos/{id}-{n}` (ไฟล์+เอกสาร) — เฉพาะเคสที่ไม่ live
5. เคส live กลุ่ม A/B: ลบเฉพาะฟิลด์ private ออกจาก `properties/{id}` (ย้ายไป `caseInternal`) — รูปที่เผยแพร่แล้วคงอยู่
6. ตรวจซ้ำ (read-only): สาธารณะอ่าน `properties` ไม่เห็นฟิลด์ใน `PRIVATE_FIELDS` เลย + Track Submission ของเคสตัวอย่าง 2–3 รายการยังใช้ได้ + caseMessages ยังตอบกลับได้
7. ย้อนกลับ: เก็บสำเนาก่อนย้ายไว้; สคริปต์ย้อนกลับ = เขียนฟิลด์กลับจาก `caseInternal` (เก็บเอกสารเดิมไว้ในคอลเลกชันสำรอง)
8. หลังย้ายเสร็จและตรวจแล้ว จึงนับข้อ 2 ว่าปิดสำหรับ production
