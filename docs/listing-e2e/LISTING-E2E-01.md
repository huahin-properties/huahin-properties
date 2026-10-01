# LISTING-E2E-01 — ลงประกาศพร้อมรูปให้ใช้งานได้จริง

สถานะ: **โค้ดพร้อมในสาขา + ทดสอบจำลองผ่าน (emulator, ข้อมูลสังเคราะห์) · ยังไม่ได้ใช้งานจริง · ข้อ 2 (ความเป็นส่วนตัว) = BLOCKED สำหรับ production** (ดู §6)
ไม่มีการ merge / deploy / แตะ production / ใช้ข้อมูลลูกค้าจริง / เปิดเผย secret ในงานนี้

## 1) เส้นทางเดียว (ไม่สร้างระบบคู่ขนาน)
ขยายระบบเดิม: Case = `properties/{id}` (`source:"owner_submission"`, `workflowVersion:"intake_v1"`), งานของ Staff อยู่ใน Listing Approvals / Staff Workspace เหมือนเดิม

```
ฟอร์ม (Owner Submission) หรือ แชท  ──►  submitListingCase (server)  ──►  Case เดียว
   รูป → caseUploads/<uid>/<key>/<n>.webp (ส่วนตัว, สร้างได้อย่างเดียว)
Staff เตรียมเคส (ผ่าน rules: ห้าม live / ห้าม approve / ห้ามเขียนข้อมูลภายในลงเอกสารสาธารณะ)
Owner ตัดสิน intake (reviewStatus=approved) ──► publishListingCase (server, Owner เท่านั้น)
   ──► คัดลอกรูปไป propertyPhotos/ (สาธารณะ) + ตั้ง live + บันทึกผู้อนุมัติ/เส้นทางอนุมัติ
Take-down ──► unpublishListingCase: ลบไฟล์+เอกสารรูปสาธารณะจริง (ลิงก์เก่าตาย)
```

## 2) โครงข้อมูล (Design P)
| ที่เก็บ | ใครอ่านได้ | เนื้อหา |
|---|---|---|
| `properties/{id}` (สาธารณะอ่านได้) | ทุกคน | เฉพาะฟิลด์ที่เผยแพร่ได้ (ประเภท ราคา สถานะ คำอธิบาย พื้นที่ จำนวนรูป `internalSplit:true` ฯลฯ) — ห้ามมีข้อมูลติดต่อ/token |
| `caseInternal/{id}` | ทีมงาน + ผู้ส่ง (`submittedByUid`) | ผู้ส่ง ผู้ติดต่อ เจ้าของทรัพย์จริง trackToken การมอบหมาย การยืนยัน ผู้อนุมัติ `draftId` ฯลฯ (รายชื่อ 48 ฟิลด์ใน `case-fields.js`) |
| `casePhotos/{id}-{n}` + Storage `casePhotos/{id}/{n}.webp` | ทีมงาน + ผู้อัปโหลด (เฉพาะเอกสาร) | รูปรอตรวจ — **ไม่มี download token** |
| `propertyPhotos/{id}-{n}` + Storage `propertyPhotos/…` | สาธารณะ | รูปที่เผยแพร่แล้วเท่านั้น (เกิดตอน Owner publish) |

- แยกบทบาท: **ผู้ส่ง** (`submittedByUid/Role`), **เจ้าของทรัพย์จริง** (`propertyOwnerRelation` self|representative|website + `ownerName/ownerContact`), **ผู้รับผิดชอบ** (`assignedTo*`), **ผู้อนุมัติ** (`approvedByUid/Email/Role` + `approvalPath`) — ไม่สมมติว่าผู้ส่ง = เจ้าของ
- บทบาทมาจาก token ที่ server ตรวจ (`resolveActor`): anonymous→external, `uid=OWNER`→owner, `adminUsers`→owner/staff, `listers`→agent; ค่าที่ client ส่ง (role/approvedBy/live) ถูกเมินและมีการทดสอบ
- id ของเคส = `own-` + sha256(uid:submissionKey) → กดซ้ำ/รีเฟรช/ส่งพร้อมกัน 8 ครั้ง = 1 เคส; ผูกกับ draft ด้วย `draft__<uid>` (ไม่ผูกด้วยชื่อ/เบอร์)

## 3) เกณฑ์รูป (Photo Standard v1, BLOCKED ไม่ได้แก้ — ใช้ตาม BLUEPRINT §32 LOCKED)
ขั้นต่ำส่งเรื่อง / เป้าหมาย "รูปครบ": ที่ดิน 1/3 · คอนโด 2/5 · บ้านเดี่ยว 2/6 · พูลวิลล่า 2/7 · ทาวน์เฮาส์ 2/5 · เชิงพาณิชย์ 2/5
- ฟอร์ม: ปุ่มถัดไปปลดเมื่อถึง "ขั้นต่ำ" ของประเภทนั้น (เดิมบังคับ 5 รูปทุกประเภท → ที่ดิน 3 รูปถูกบล็อก)
- server (`submitListingCase`/`publishListingCase`): ตรวจขั้นต่ำซ้ำ
- **ความขัดแย้งที่พบและแก้:** `intake-workflow.js` เดิมบังคับ `photos_5` (5 รูปทุกประเภท) ขัดกับมาตรฐาน LOCKED → เปลี่ยนเป็น `photos_min` (CRITICAL, ตามประเภท) + `photos_target` (OPTIONAL, ไม่บล็อก) พร้อมเหตุผลและเทสต์ (Y3) — Staff gate ไม่ได้เข้มกว่ามาตรฐาน

## 4) หลักฐานการทดสอบ (emulator + ข้อมูลสังเคราะห์)
`npm run test:listing` = **33 passing, 1 pending**
- core S1–S12: เคสเดียว/ไม่มีฟิลด์ภายในในเอกสารสาธารณะ, idempotent + 8 พร้อมกัน, path ของคนอื่นถูกปฏิเสธ, role ที่อ้างใน body ถูกเมิน, ขั้นต่ำรูปตามประเภท, draft binding, Owner-only publish, intake ต้อง approved, take-down + re-publish ได้ token ใหม่, tracking view ไม่รั่ว
- rules F1–F9 / ST1–ST3: ไม่มีใครสร้าง property จาก browser แบบสาธารณะ, lister ห้าม self-publish/ห้ามแตะ approval/internal, Staff ห้าม live/approve/ปลอมผู้อนุมัติ, สาธารณะอ่าน `caseInternal`/`casePhotos` ไม่ได้, draft เฉพาะเจ้าของ, caseMessages token ทั้งเคสใหม่/เก่า, Storage staging สร้างได้เฉพาะโฟลเดอร์ตัวเอง/ชนิดภาพ/≤8MB/ห้ามทับ-ลบ
- e2e ×3 กลุ่ม (เจ้าของเว็บ / เอเจนต์ / ผู้ฝากภายนอก): รูป→ส่ง→Staff→Owner→หน้าสาธารณะ + cross-user denial + take-down (ลิงก์รูปสาธารณะเก่าดาวน์โหลดไม่ได้), + E2E-CHAT (แชทเปิดเคส → ฟอร์มเติมรูป/รายละเอียดลงเคสเดียวกัน token เดิมยังใช้ได้), + E2E-DRAFT
- sync Y1–Y4: `case-fields.js`/`photo-standard.js` ฝั่ง browser = ฝั่ง server, Staff photo gate, ตัวกรอง public (`toPublicProperty`)
- ชุดเดิมยังผ่าน: test:sec 95 · test:chat 55 · test:chat-live 34 · test:chat-live-gate 21 (ปรับ expectation ที่ช่องโหว่ถูกปิดแล้ว: S2a, C6a/b/c/f, B1, G* callsite — ระบุในคอมมิต)
- สิ่งที่ทดสอบจริงถูกสังเกต: ลิงก์รูป **มี token** ดาวน์โหลดได้โดยไม่ล็อกอินแม้ rules ปิด (พฤติกรรม Firebase) → จึงออกแบบให้รูปรอตรวจ **ไม่มี token** เลย (ทดสอบ: ดาวน์โหลดไม่ผ่าน, metadata ไม่มี token, ไฟล์ staging ที่ client สร้าง token ถูกลบหลังส่ง)

## 5) สิ่งที่ "ยังไม่ได้ทำ/ยังไม่ได้ยืนยัน" (ห้ามอ้างว่าครบ)
1. **ไม่ได้ทดสอบใน browser จริง** — หน้า Owner Submission / Track Submission / Listing Approvals ถูกแก้และตรวจ syntax แล้ว แต่ยังไม่ได้รันใน browser (ต้องทดสอบบนโปรเจกต์ TEST)
2. **Storage rules ที่ใช้ cross-service lookup** (ทีมงาน/lister เขียน `propertyPhotos`) — emulator แก้ค่าไม่ได้ (pending ST3; ข้อจำกัดเดิมของ SEC-TEST-01) ต้องยืนยันบน TEST จริง
3. ทีมงาน (Staff) **เขียนทับ `casePhotos/` ได้** เพราะ catch-all ของ bucket ให้ทีมงานเขียนทุก path (ไม่ใช่สาธารณะ) — บันทึกไว้
4. ลิงก์ดาวน์โหลดที่ทีมงานขอด้วย `getDownloadURL` จะมี token (เป็นลิงก์ลับของทีม ไม่ถูกเก็บในฐานข้อมูล)
5. แชทเปิดเคสแบบบางสุด (lead) — เมื่อลูกค้ากรอกฟอร์มต่อ ข้อมูลจะเติมลงเคสเดิม; แต่ **ฟอร์มยังไม่ prefill จากร่างแชท** (ลูกค้ากรอกซ้ำ) — ค้าง
6. หน้า Lister Dashboard: เอเจนต์ **ตั้ง live เองไม่ได้อีก** (rules) และต่ออายุ `expiresAt` เองไม่ได้ — เป็นการเปลี่ยนพฤติกรรมโดยตั้งใจ ต้องแจ้งผู้ใช้/ทดสอบ UI
7. `profilePhotos` ยังให้ผู้ล็อกอินใดๆ เขียนได้, สมาชิกเขียนทับรูปของสมาชิกอื่นใน `propertyPhotos` ได้ (ช่องโหว่เดิม ไม่ได้แก้ในรอบนี้)
8. ชุดทดสอบเบราว์เซอร์ (SDK 10.14.1 vs 10.12.2 ของหน้า) ไม่ได้รันในรอบนี้

## 6) ข้อ 2 — ความเป็นส่วนตัว: **BLOCKED สำหรับการใช้งานจริง**
- เคสใหม่ (ฟอร์ม + แชท): ข้อมูลติดต่อ/trackToken/ผู้ส่ง/เจ้าของจริง/การอนุมัติ **ไม่อยู่ในเอกสารที่สาธารณะอ่านได้** ✔ (ทดสอบ)
- **เคสเดิมใน production (สร้างก่อนการเปลี่ยนนี้)** ยังมี contact + trackToken ใน `properties/{id}` ที่ทุกคนอ่านได้, และรูปของเคสรอตรวจแบบเดิมอยู่ใน `propertyPhotos` สาธารณะ → **ต้องย้าย (migration) ก่อนเปิดใช้งานจริง** ตาม `LEGACY-DATA-PLAN.md` — รอบนี้ห้ามย้าย/ลบข้อมูล production จึงไม่ได้ทำ ⇒ ห้ามเรียกชุดนี้ว่า "พร้อมใช้งานจริง"
- ข้อเท็จจริงของเคสรอตรวจ (ราคา/คำอธิบาย/พื้นที่/สถานะ) ยังอ่านได้สาธารณะตาม Design P (ไม่มีข้อมูลติดต่อ) — Work/Owner ควรยืนยันว่ายอมรับ หรือให้ซ่อนเคส pending จากการอ่านสาธารณะในรอบถัดไป (ต้องแก้ `getEffectiveProperties`/query ที่ดึงทั้ง collection)
