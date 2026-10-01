# LISTING-E2E-01 — ชุด deploy สำหรับโปรเจกต์ **TEST เท่านั้น** (ยังไม่ deploy — รอ Work ตรวจ)

**ห้ามนำไฟล์เหล่านี้ขึ้น GitHub/Hosting/Functions ของ production** (`huahin-properties-5f1b5`) จนกว่า Owner จะสั่งเป็นรอบแยก และต้องทำ migration ข้อมูลเดิมก่อน (LEGACY-DATA-PLAN.md).
กันพลาด: ฟังก์ชันใหม่ปฏิเสธทุกคำขอ (`not_enabled`) ในโปรเจกต์ที่ id ไม่ขึ้นต้นด้วย `huahin-chat-test-` / `huahin-listing-test-` / `demo-`; `createCaseFromConversation` เขียนรูปแบบเดิมเมื่อไม่ใช่โปรเจกต์ทดสอบ; ตัว build ปฏิเสธ projectId ที่ไม่ใช่ `huahin-listing-test-*`.

## ชิ้นส่วน
| ส่วน | ไฟล์ | คำสั่ง (เฉพาะ TEST) |
|---|---|---|
| Functions | `functions/` (index.js, listing-case.js, case-fields.js, photo-standard.js) | `firebase deploy --only functions --project <test-project-id>` |
| Firestore rules | `firestore.rules` | `firebase deploy --only firestore:rules --project <test-project-id>` |
| Storage rules | `storage.rules` | `firebase deploy --only storage --project <test-project-id>` |
| Hosting | โฟลเดอร์ที่ได้จาก `node tools/build-listing-test.js --config <config> --out build/listing-test` | `firebase deploy --only hosting --project <test-project-id>` (รันในโฟลเดอร์ build นั้น) |

เงื่อนไขของโปรเจกต์ TEST: ชื่อ `huahin-listing-test-<suffix>` (≤30 ตัวอักษร) · เปิด Authentication (Email/Password + Anonymous) · Firestore + Storage (asia-southeast1) · Blaze (เพื่อใช้ Functions) · เว็บแอป 1 ตัว (ได้ apiKey/appId/messagingSenderId).
บัญชีทดสอบ (ข้อมูลสังเคราะห์เท่านั้น): Owner = ผู้ใช้อีเมล/รหัสผ่านที่มีเอกสาร `adminUsers/{uid}` role `owner` (ไม่ต้องใช้ uid ที่ฝังใน rules ของ production) · Staff = `adminUsers/{uid}` role `staff` · เอเจนต์ = `listers/{uid}`.

## ขั้นตอนของ Owner (ทีละขั้น — ยังไม่ต้องทำจนกว่า Work ตรวจ PR)
1. [Work ตรวจ PR] → 2. [Owner สร้างโปรเจกต์ TEST + เว็บแอป และส่ง config ที่ **ไม่ใช่ความลับ** ให้ Claude Code (apiKey ของเว็บแอปเป็นค่าสาธารณะ แต่ห้ามส่งคีย์ Anthropic/Stripe/Service account)] → 3. [Claude Code รัน build → ตรวจ MANIFEST/สแกน] → 4. [Owner: หน้าดำ Codespace — deploy ทีละคำสั่ง: functions → firestore:rules → storage → hosting; ยืนยันผลทีละคำสั่ง] → 5. [สร้างบัญชีทดสอบ 3 บทบาท] → 6. [ทดสอบ 3 กลุ่มด้วยข้อมูลสังเคราะห์ตามสคริปต์ของ Claude Code] → 7. [Owner ตัดสิน GREEN/ไม่ผ่าน]
