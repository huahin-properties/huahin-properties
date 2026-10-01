# LISTING-E2E-01 — ชุด deploy สำหรับโปรเจกต์ **TEST เท่านั้น** (ยังไม่ deploy — รอ Work ตรวจ + ผล BROWSER-LOCAL-01)

> **เส้นทางที่เจ้าของใช้จริง:** `OWNER-TEST-GUIDE.md` (สคริปต์เดียว `tools/listing-test/deploy-test.sh`, ใช้ `huahin-chat-test-01` ได้ — รับ prefix `huahin-chat-test-*` และ `huahin-listing-test-*`). เอกสารนี้คือรายละเอียดคำสั่งทีละตัว (เหมือนสิ่งที่สคริปต์รัน) — คำสั่ง build ที่เขียนว่า `huahin-listing-test-*` ใช้กับ `huahin-chat-test-*` ได้เช่นกัน

**ห้ามนำไฟล์เหล่านี้ขึ้น GitHub/Hosting/Functions ของ production** (`huahin-properties-5f1b5`) จนกว่า Owner จะสั่งเป็นรอบแยก และต้องทำ migration ข้อมูลเดิมก่อน (LEGACY-DATA-PLAN.md).
**ห้ามรัน `firebase deploy --only functions` (ทั้งหมด)** — จะ deploy ฟังก์ชันทุกตัวรวมถึง Stripe / LINE / อีเมล / triggers พร้อม secret ที่ไม่เกี่ยวข้อง. ใช้ชื่อฟังก์ชันทีละตัวตามด้านล่างเท่านั้น และ **ไม่ต้องให้คีย์ใดๆ ที่ไม่เกี่ยวข้อง**

กันพลาด: ฟังก์ชัน listing ปฏิเสธทุกคำขอ (`not_enabled`) ในโปรเจกต์ที่ id ไม่ขึ้นต้นด้วย `huahin-chat-test-` / `huahin-listing-test-` / `demo-`; ตัว build ปฏิเสธ projectId ที่ไม่ใช่ `huahin-listing-test-*`; **ฟังก์ชันแชทที่มี gate (`receptionTurn`, `getPropertyDraft`, `updatePropertyDraft`, `createCaseFromConversation`, `claudeComplete`) รู้จักโปรเจกต์ `huahin-listing-test-*` เป็นโปรเจกต์ทดสอบ "enforce" ด้วย allow-list + ID token + เพดานจำนวนครั้งชุดเดียวกับ `huahin-chat-test-*` (ไม่ได้ปิด gate)** — ทดสอบ GT1/GT20.

## 1) Functions — เฉพาะที่ต้องใช้ (9 ตัว, ไม่ใช้ secret ใดๆ)
`submitListingCase, previewListingCase, publishListingCase, unpublishListingCase, syncListingCase, addCasePhotos, reconcileListingFiles, listMyCases, trackListingCase`
```
firebase deploy --only functions:submitListingCase,functions:previewListingCase,functions:publishListingCase,functions:unpublishListingCase,functions:syncListingCase,functions:addCasePhotos,functions:reconcileListingFiles,functions:listMyCases,functions:trackListingCase --project <huahin-listing-test-…>
```
(คำสั่งนี้สร้างจาก `REQUIRED_FUNCTIONS` ใน `tools/build-listing-test.js` และมีเทสต์เทียบกับเอกสารนี้)
**ไม่ใช้/ไม่ deploy:** createCheckoutSession, createPortalSession, createFeaturedCheckoutSession, createBannerCheckoutSession, createVipCheckoutSession, stripeWebhook (Stripe) · lineAuthStart/Exchange/Callback (LINE) · notifyNewLead, notifyOwnerApproval (อีเมล/trigger) · agentProfileMeta, shareCard · startConversation, sendConversationTurn.
**ฟังก์ชันแชท (ไม่บังคับ — ใช้เมื่อจะทดสอบแชทเท่านั้น):** `receptionTurn, getPropertyDraft, updatePropertyDraft, createCaseFromConversation, claudeComplete` — ต้องใช้ secret Anthropic ของโปรเจกต์ TEST และ allow-list; เป็นเรื่องของ CHAT-LIVE-01 (พักไว้ที่ขั้น 6/8). การทดสอบ listing ไม่ต้องใช้ AI.

## 2) Firestore rules + indexes
```
firebase deploy --only firestore:rules --project <id>
```
**ไม่ต้อง deploy indexes ใหม่:** ทุก query ของ flow นี้เป็น equality บนฟิลด์เดียว (`casePhotos.propertyId`, `propertyPhotos.propertyId`, `caseInternal.submittedByUid`, `caseInternal.<field>`, `properties/*/caseMessages.visibility`) ใช้ single-field index อัตโนมัติ — มีเทสต์ตรวจว่าไม่มี `orderBy`/`where` ซ้อนใน `listing-case.js` (Y7). `firestore.indexes.json` ของ repo ไม่ถูกแก้.

## 3) Storage rules
```
firebase deploy --only storage --project <id>
```
(ใช้ `storage.rules` ใน root — default deny + พาธที่ระบุ: `caseUploads/`, `casePhotos/`, `publishedCasePhotos/`, `propertyPhotos/`, `profilePhotos/`, `siteContent/`, `caseAttachments/`). ต้องมี bucket เริ่มต้นของโปรเจกต์ TEST.

## 4) Hosting (หน้าเว็บทดสอบ)
1. สร้าง config (ไฟล์ JSON ส่วนตัว **ไม่ commit**): `projectId, apiKey, appId, messagingSenderId, authDomain=<id>.firebaseapp.com, storageBucket, region=asia-southeast1` — ค่าของเว็บแอปเป็นค่าสาธารณะ ไม่ใช่ความลับ
2. `node tools/build-listing-test.js --config <config.json> --out build/listing-test` → ได้โฟลเดอร์ที่มี `firebase.json` ของตัวเอง (`public: "."`, ไม่มี rewrites ไปฟังก์ชัน production, header noindex) + `MANIFEST.json`
3. **ต้องรันคำสั่ง hosting จากภายในโฟลเดอร์ build นั้น** (ไม่ใช่จาก root ซึ่งมี `hosting-public` + rewrite ไป `agentProfileMeta` ของ production):
```
cd build/listing-test
firebase deploy --only hosting --project <id>
```
เทสต์ H2/H7 ยืนยันว่า `firebase.json` ในโฟลเดอร์ build ไม่มี rewrites/functions และ config ที่ฝังเป็นของ TEST เท่านั้น. หน้าแรก `Home`/`index.html` มีผู้ช่วยต้อนรับที่เรียก `claudeComplete` **โดยไม่มี header ยืนยันตัวตน** → บนโปรเจกต์ TEST (gate enforce) จะได้ 401/403 และไม่เรียก AI — ตั้งใจ. วิดเจ็ต ContactRail ใส่ ID token เองและใช้ allow-list.

## 5) Allow-list และเพดานแชท (เฉพาะถ้าจะทดสอบแชท)
Guard ของหน้า TEST แสดง UID ของผู้ทดสอบบนแถบเหลือง → Owner เพิ่มเอกสาร `chatTestAllow/<uid>` = `{ enabled: true }` และตั้ง `chatTestConfig/limits` = `{ globalCap: <1..10000>, perUidCap: <1..10000> }` ใน Firestore ของโปรเจกต์ TEST (ไม่มี config = ปฏิเสธ ไม่ใช่ไม่จำกัด) — รายละเอียดเดียวกับ `docs/testing/CHAT-LIVE-01-DEPLOY.md`.

## 6) เงื่อนไขของโปรเจกต์ TEST และบัญชีทดสอบ
ชื่อ `huahin-listing-test-<suffix>` (≤30 ตัวอักษร) · Authentication: Email/Password + Anonymous · Firestore + Storage (asia-southeast1) · Blaze (ต้องใช้สำหรับ Functions) · เว็บแอป 1 ตัว.
บัญชี (ข้อมูลสังเคราะห์เท่านั้น): Owner = ผู้ใช้อีเมล/รหัสผ่านที่มีเอกสาร `adminUsers/{uid}` role `owner` · Staff = `adminUsers/{uid}` role `staff` · เอเจนต์ = `listers/{uid}`.

## 7) ขั้นตอนของ Owner (ทีละขั้น — ยังไม่ต้องทำ)
1. [Work ตรวจ PR + ผล BROWSER-LOCAL-01] → 2. [Owner สร้างโปรเจกต์ TEST + เว็บแอป ส่ง config ที่ไม่ใช่ความลับ] → 3. [Claude Code รัน build + ตรวจ MANIFEST/สแกน] → 4. [หน้าดำ Codespace: deploy ทีละคำสั่ง: functions (9 ตัว) → firestore:rules → storage → hosting (จากในโฟลเดอร์ build); ยืนยันผลทีละคำสั่ง] → 5. [สร้างบัญชีทดสอบ 3 บทบาท] → 6. [ทดสอบ browser 3 กลุ่มด้วยข้อมูลสังเคราะห์] → 7. [Owner ตัดสิน GREEN/ไม่ผ่าน]
