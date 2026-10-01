# LISTING-E2E-01 — ชุด deploy สำหรับโปรเจกต์ **TEST เท่านั้น**

**ห้ามนำไฟล์เหล่านี้ขึ้น GitHub/Hosting/Functions ของ production** (`huahin-properties-5f1b5`) จนกว่า Owner จะสั่งเป็นรอบแยก และต้องทำ migration ข้อมูลเดิมก่อน (LEGACY-DATA-PLAN.md).
กันพลาด: ฟังก์ชันใหม่ 4 ตัว (`submitListingCase`, `publishListingCase`, `unpublishListingCase`, `trackListingCase`) **ปฏิเสธทุกคำขอ (`not_enabled`) เมื่อรันในโปรเจกต์ที่ id ไม่ขึ้นต้นด้วย `huahin-chat-test-` / `huahin-listing-test-` / `demo-`** (เว้นแต่ตั้ง `LISTING_E2E_ENABLED=1` โดยตั้งใจ) และ `createCaseFromConversation` จะเขียนรูปแบบเดิมเมื่อไม่ใช่โปรเจกต์ทดสอบ — ทดสอบแล้ว (S13, B8)

## ส่วนที่พร้อมแล้ว
| ส่วน | ไฟล์ | วิธี deploy (เฉพาะ TEST) |
|---|---|---|
| Functions | `functions/index.js`, `listing-case.js`, `case-fields.js`, `photo-standard.js` | `firebase deploy --only functions --project <test-project-id>` |
| Firestore rules | `firestore.rules` | `firebase deploy --only firestore:rules --project <test-project-id>` |
| Storage rules | `storage.rules` | `firebase deploy --only storage --project <test-project-id>` |

## ส่วนที่ **ยังไม่ได้ทำ** (จึงยังทดสอบใน browser จริงไม่ได้)
- **Hosting ของโปรเจกต์ TEST สำหรับหน้าฟอร์ม/แอดมิน** — `tools/build-chat-live.js` ถูกจำกัดขอบเขตให้เฉพาะหน้าแชท (13 ไฟล์) และมี guard/ตัวสแกนสตริง production; หน้าที่ต้องใช้กับงานนี้ (Owner Submission, Track Submission, Admin Login, Listing Approvals, Staff Workspace, Property Details/Home/Search + `intake-workflow.js`, `photo-standard.js`, `property-*.js` ฯลฯ) ยังไม่มีตัว build ที่แทนค่า Firebase config/ตัดข้อมูลติดต่อจริง/ตั้ง noindex ให้ปลอดภัย → ต้องสร้างเป็นขั้นแยกหลัง Work ตรวจ (ไม่ทำโดยพลการเพราะแตะขอบเขต CHAT-LIVE-01 ที่หยุดไว้)
- ข้อมูลบัญชีทดสอบบนโปรเจกต์ TEST: บัญชี Owner (uid ต้องตรงกับ uid ที่ฝังใน rules หรือเพิ่ม `adminUsers/{uid}` role owner — ต้องเลือกวิธีและยืนยันก่อน), Staff 1, Agent 1 (`listers/{uid}`) — ใช้ข้อมูลสังเคราะห์เท่านั้น

## ขั้นตอนของ Owner (ทีละขั้น — ยังไม่ต้องทำจนกว่า Work ตรวจ PR)
1. [Work ตรวจ PR + ยืนยันขอบเขต] → 2. [ตัดสินใจเรื่อง Hosting TEST ของหน้าฟอร์ม/แอดมิน] → 3. [ในหน้า Codespace terminal: deploy 3 คำสั่งด้านบนทีละคำสั่ง ยืนยันผลทีละคำสั่ง] → 4. [สร้างบัญชีทดสอบ] → 5. [ลองทั้ง 3 กลุ่มด้วยข้อมูลสังเคราะห์] → 6. [Owner ตัดสิน GREEN/ไม่ผ่าน]
