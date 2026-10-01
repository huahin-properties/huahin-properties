# CHAT-LIVE-01 — ขอบเขตหน้าทดสอบแชทจริง (แยกจาก production)

สถานะ: **เอกสารขอบเขตเท่านั้น รอ Work ตรวจ** ยังไม่สร้างบริการ ไม่ขอ/ไม่ใช้ credentials ไม่ deploy ไม่ merge
ฐาน: `8c549c6` (PR #5 ผ่านการตรวจโค้ดของ Work; ผลรันที่ `afa0d8b` เป็นผลของ Code ไม่ใช่ production PASS)
เป้าหมายแรก: ContactRail + `receptionTurn` (+ `createCaseFromConversation`, `getPropertyDraft`, `updatePropertyDraft` ที่ ContactRail เรียก)

## 0. สิ่งที่ตรวจไม่ได้ในรอบนี้ (ต้องบอกตรง ๆ)

- เว็บทางการ `firebase.google.com` และ `docs.anthropic.com` ถูกบล็อกจากสภาพแวดล้อมของ Code (EGRESS_BLOCKED) → **ราคา โควตา ข้อกำหนดแผน Blaze การจำกัดค่าใช้จ่ายของ Anthropic และคุณสมบัติ App Check "ยังไม่ได้ตรวจจากแหล่งทางการ"** ทุกตัวเลข/ข้อความในหัวข้อ 4 ที่เกี่ยวกับเรื่องนี้เป็น "ต้องยืนยัน" ไม่ใช่ข้อเท็จจริงที่ตรวจแล้ว
- ต้องให้ Work (หรือเจ้าของ) เปิดหน้าทางการตามรายการในหัวข้อ 4.4 แล้วยืนยัน ก่อนอนุมัติขั้นสร้าง

## 1. สิ่งที่ตรวจจากโค้ดจริง (อ่านจาก repo ที่ `8c549c6`)

จุดที่ชี้ production ฝังตายตัวในโค้ด — หน้าทดสอบ **ใช้ไฟล์เดิมตรง ๆ ไม่ได้**:

| จุด | ที่อยู่ | ค่าปัจจุบัน (production) |
|---|---|---|
| Firebase config (apiKey, projectId, storageBucket, appId, authDomain) | `firebase-client.js:14-28` | `huahin-properties-5f1b5`, `auth.huahin.properties` |
| Region ของ callable | `conversation-firestore.js` `functionsAsync()` และ `ContactRail.dc.html` `_functionsSdk()` | `asia-southeast1` (ตั้งใจให้ตรงกับ Function) |
| URL แชทสำรอง `claudeComplete` | `ContactRail.dc.html:447` | `https://claudecomplete-3j4ldf4pja-as.a.run.app` (Cloud Run URL ของ production) |
| ลิงก์ในโค้ด Function | `functions/index.js` `SITE_URL`, `LINE_REDIRECT_URI` | `https://huahin.properties`, URL ของ production |
| `.firebaserc` | ราก repo | `default` = `huahin-properties-5f1b5` → **คำสั่ง `firebase deploy` ที่ไม่ใส่ `--project` จะไปที่ production** |
| `hosting-public/index.html`, `CNAME`, `firebase.json` rewrites | ราก repo | redirect ไป `https://huahin.properties/`, rewrite `/s` ไป `agentProfileMeta` |
| หน้า `.dc.html` | ทุกหน้า | โหลดด้วย `support.js` (runtime ของ Design Components) ผ่านหน้า `.html` ที่ราก — ต้องยืนยันว่าตัวไหนเป็นจุดเข้าที่เปิดเต็มแท็บได้ (ยังไม่ได้เปิดในเบราว์เซอร์) |

ผลข้างเคียงที่ต้องระวัง (พบจากโค้ด):

1. `createCaseFromConversation` สร้างเอกสาร `properties` ที่ `listingStatus: "pending"` → trigger `notifyOwnerApproval` (`functions/index.js` ~2453) จะ**ส่ง LINE push** ถ้ามี secret `LINE_MESSAGING_TOKEN`/`LINE_OWNER_USER_ID` ในโปรเจกต์นั้น
2. `notifyNewLead` (trigger `leads/{id}`) ส่งอีเมลผ่าน Resend ถ้ามี `RESEND_API_KEY`
3. ถ้า deploy `functions/` ทั้งก้อน จะได้ trigger/Stripe/LINE Login ทั้งหมด และคำสั่งจะขอ secret ทั้ง 8 ตัว → **ห้าม deploy ทั้งก้อนไปโปรเจกต์ทดสอบ**
4. ยังไม่พบ rate limit / App Check / `maxInstances` ใน `receptionTurn`, `claudeComplete` (grep แล้วไม่พบ) → ใครมี URL ก็เรียกได้และใช้เงินตามคีย์ AI → ต้องมีการควบคุมแยก (หัวข้อ 4)
5. `claudeComplete` เป็น `onRequest` + `cors: true` ไม่ตรวจ auth (โค้ดเดิม ไม่แก้ในแพ็กเกจนี้) → ถ้าทดสอบเส้นทางสำรองบนระบบทดสอบ ต้องนับเป็น endpoint สาธารณะของโปรเจกต์ทดสอบด้วย

## 2. บริการ Firebase ที่ "จำเป็นตรงไหน" (ไม่เพิ่มอัตโนมัติ)

| บริการ | จำเป็นไหม | เหตุผล / ที่มา |
|---|---|---|
| Authentication → **Anonymous เท่านั้น** | จำเป็น | `getVisitorId()` ใช้ `signInAnonymously()`; Function ใช้ `request.auth.uid` |
| Firestore (+ rules + indexes) | จำเป็น | `conversations/reception__<uid>`, `propertyDrafts/draft__<uid>`, `properties` (เคส) |
| Functions (region `asia-southeast1`) | จำเป็น เฉพาะ 5 ตัว: `receptionTurn`, `getPropertyDraft`, `updatePropertyDraft`, `createCaseFromConversation`, `claudeComplete` (เส้นสำรอง) | `startConversation`/`sendConversationTurn` ใช้กับ share-link ไม่ใช่เป้าหมายรอบนี้ |
| Hosting | **จำเป็น 1 อย่าง: เป็น URL สาธารณะให้ Code/Work เปิดเบราว์เซอร์** (เซิร์ฟเวอร์ในเครื่อง Code เปิดจากเครื่อง Work ไม่ได้) ใช้ site ของโปรเจกต์ทดสอบเอง ไม่ใช่ preview channel ของ production | ไม่ใช้ rewrite `/s`, ไม่ใช้โดเมน `huahin.properties` |
| Storage | **ไม่จำเป็นสำหรับแชท** ฟอร์ม/อัปโหลดรูป (`own-*.webp`) อยู่นอกเส้นทางนี้ → ไม่เปิดในรอบนี้ รอรอบ "เผยแพร่พร้อมรูป" | `ContactRail` ไม่อัปโหลดรูป (ยืนยันเพิ่มด้วยการ grep ตอนทำจริง) |
| Auth providers อื่น (Google/Facebook/LINE/Phone), authDomain custom | ไม่จำเป็น | Anonymous ไม่ต้องใช้ redirect |
| Stripe, Resend, LINE Messaging, Secret อื่นนอก `ANTHROPIC_API_KEY` | **ห้ามตั้ง** | ปิดการชำระเงิน อีเมล LINE SMS |

## 3. กลไก "หยุดถ้าคอนฟิกไม่ครบ ห้ามถอยไป production"

เสนอ (ยังไม่ทำ รอ Work อนุมัติ) — ทำเป็น **ชุดไฟล์ test-build แยกโฟลเดอร์** ไม่แก้ไฟล์ production:

1. สร้างผ่านสคริปต์ build เดียว (`tools/build-chat-live.js`) ที่คัดลอกไฟล์ที่เส้นทางแชทต้องใช้ไป `build/chat-live/` แล้ว **แทนค่าตาม allow-list** จาก `chat-live.config.json` (projectId, apiKey, appId, authDomain, storageBucket, claudeComplete URL) — ค่า production ใน repo ไม่ถูกแก้
2. สคริปต์ **ล้มทันที (exit ≠ 0)** ถ้า: ขาดคีย์ใดคีย์หนึ่ง, projectId เป็น `huahin-properties-5f1b5`, หรือผลลัพธ์ยังมีสตริง `huahin-properties-5f1b5`, `huahin.properties`(ยกเว้นข้อความแสดงผล), `auth.huahin.properties`, `claudecomplete-3j4ldf4pja` ค้างในไฟล์ใน `build/chat-live/` (สแกนจริง ไม่ใช่แค่รายการที่รู้)
3. ฝัง guard ตอนรันในหน้าทดสอบ: ก่อนเริ่มแชท ตรวจ `firebase.app().options.projectId === <test id>` และ hostname ตรงกับ allow-list ถ้าไม่ตรง → แสดงแถบแดง "ไม่ใช่ระบบทดสอบ" และ**ไม่เริ่มแชท** (ไม่ fallback)
4. แถบ "TEST — ข้อมูลสังเคราะห์เท่านั้น" ติดทุกหน้า + `noindex` (เพื่อลดการหลงเข้า **ไม่ใช่การควบคุมสิทธิ์**)
5. ชุดทดสอบอัตโนมัติ (Code ทำเองได้ ไม่ใช้ credentials): ผลลัพธ์ build ไม่มีสตริง production · build ล้มเมื่อ config ขาด/เป็น production · เปิดหน้าด้วย Chromium ที่บล็อกทุก host ยกเว้น allow-list แล้วนับคำขอ ต้องไม่มีคำขอไป host production
6. Deploy ต้องใช้ `--project <test-id>` ทุกคำสั่ง ห้ามพึ่ง `default`; เสนอให้สคริปต์ deploy ตรวจ `--project` ก่อนรันและปฏิเสธถ้าเป็น `huahin-properties-5f1b5` (เจ้าของรันเองใน Codespace)

## 4. คีย์ AI แยก + จำกัดผู้เรียก/จำนวนการเรียก

หลักการ: `noindex`, URL ลับ, หรือแถบ TEST **ไม่ถือเป็นการควบคุมสิทธิ์**

### 4.1 คีย์ AI
- สร้างคีย์ใหม่ใน Workspace ของ Anthropic Console ที่แยกจากคีย์ production, ตั้งเป็น secret `ANTHROPIC_API_KEY` ในโปรเจกต์ทดสอบเท่านั้น (เจ้าของทำ — Code ไม่รับค่าคีย์ในแชท/ไฟล์/บันทึก)
- ลบหรือหมุนคีย์เมื่อจบรอบทดสอบ

### 4.2 จำกัดผู้เรียก (ตัวเลือก — ต้องให้ Work/เจ้าของเลือก ยังไม่เลือก)
| ตัวเลือก | ควบคุมอะไรได้ | ข้อจำกัด (ที่รู้จากโค้ด/หลักการ) |
|---|---|---|
| A. ปิดโปรเจกต์ทดสอบด้วย Firebase Auth แบบ "ต้องล็อกอินบัญชีที่อนุญาต" แทน Anonymous | จำกัดผู้ใช้ได้จริง | **ขัดกับเส้นทางจริง (Anonymous)** ที่เราต้องการทดสอบ จึงไม่ใช้ตรง ๆ |
| B. เพิ่ม allow-list uid/อีเมลใน Function ฝั่งทดสอบ (ตรวจ `request.auth.token`) + Anonymous → ต้องมีขั้นให้ผู้ทดสอบผูกตัวตนก่อน | จำกัดได้ | **เป็นการแก้โค้ด Function** นอกขอบเขตที่ Work อนุมัติ ต้องขอเพิ่ม |
| C. App Check (reCAPTCHA/Enterprise) บังคับที่ callable | ลดบอต/การเรียกจากแหล่งที่ไม่ใช่เว็บทดสอบ | **ไม่ใช่การกำหนดสิทธิ์รายบุคคล**; ต้องแก้ Function/ไคลเอนต์; `onRequest` (`claudeComplete`) ต้องตรวจเอง — **ยังไม่ได้ตรวจเอกสารทางการ** |
| D. Cloud Run/IAM ปิดไม่ให้เรียกโดยไม่ระบุตัว (ไม่ allow unauthenticated) | จำกัดที่ชั้นโครงสร้างพื้นฐาน | เบราว์เซอร์ทั่วไปเรียกไม่ได้ → ขัดกับการทดสอบจากเบราว์เซอร์ **ยังไม่ได้ตรวจ** |
| E. ตั้งเพดานที่ต้นทาง: `maxInstances` ต่ำ + งบ/เพดานใน Anthropic Console + Budget alert ของ GCP | จำกัด "ความเสียหายสูงสุด" ไม่จำกัด "ใครเรียก" | Budget alert ของ GCP เป็นการแจ้งเตือน ไม่ใช่การตัดอัตโนมัติ (ต้องยืนยันจากเอกสารทางการ) |

ข้อเสนอเบื้องต้นของ Code (รอ Work ตัดสิน): **E เป็นพื้นฐานบังคับ + เจ้าของแจกที่อยู่เว็บทดสอบเฉพาะผู้ทดสอบ + (ถ้า Work เห็นว่าจำเป็น) ขอ C หรือ B เป็นแพ็กเกจเล็กแยก** — ต้องบอกตรง ๆ ว่ากับ E อย่างเดียว ใครรู้ URL ก็ยังใช้ได้จนถึงเพดาน

### 4.3 จำนวนการเรียก
- เพดานใช้จ่ายต่อเดือนใน Anthropic Console สำหรับ Workspace ทดสอบ, `maxInstances` ของ 5 ฟังก์ชัน, งบ+alert ใน GCP — **ตัวเลขยังไม่กำหนด** (ต้องให้เจ้าของเลือกวงเงินเอง)
- ตัวนับฝั่งแอปต่อ uid ไม่มีในโค้ดปัจจุบัน — ถ้าต้องการต้องขอเป็นแพ็กเกจแยก

### 4.4 รายการที่ต้องยืนยันจากแหล่งทางการก่อนอนุมัติ (Code เข้าถึงไม่ได้)
1. Firebase: Cloud Functions ต้องใช้แผน Blaze หรือไม่ + ค่าบริการ/โควตาฟรีของ Functions, Firestore, Hosting, Auth (Anonymous) — firebase.google.com/pricing
2. Firebase: App Check กับ callable (`enforceAppCheck`) และกับ `onRequest` — firebase.google.com/docs/app-check
3. Anthropic: การตั้งเพดานใช้จ่าย/rate limit ระดับ Workspace/คีย์ และวิธีทำใน Console — docs.anthropic.com (rate limits / workspaces)
4. Google Cloud: Budget & alerts (แจ้งเตือนหรือตัดอัตโนมัติ) และ IAM ของ Cloud Run
5. คีย์ API ของ Firebase ฝั่งเว็บ (apiKey) ไม่ใช่ความลับ แต่ควรจำกัด HTTP referrer ในโปรเจกต์ทดสอบ — ยืนยันวิธีจาก Google Cloud Console

## 5. ข้อมูลสังเคราะห์เท่านั้น / ปิดช่องทางภายนอก

- ผู้ทดสอบใช้ชื่อ/เบอร์/ที่อยู่ที่แต่งขึ้น (ชุดตัวอย่างจะแนบในแผนทดสอบ เช่น "ทดสอบ สมมติ", `0800000000`, พิกัดสมมติ) ห้ามใส่ข้อมูลจริง ห้ามรูปจริง
- ไม่ตั้ง secret: `RESEND_API_KEY`, `LINE_*`, `STRIPE_*` ในโปรเจกต์ทดสอบ → trigger ที่เกี่ยวข้อง (ถ้า deploy) จะ log แล้วออกเงียบ ๆ; แต่แนะนำ **ไม่ deploy trigger เหล่านั้นเลย** (deploy เฉพาะ 5 ฟังก์ชันตามหัวข้อ 2)
- ไม่เปิด Phone Auth (SMS) ไม่ใส่คีย์ชำระเงิน
- ตรวจหลังทดสอบว่าไม่มี log ส่งอีเมล/LINE/SMS/ชำระเงิน (ตรวจจาก Function logs ในโปรเจกต์ทดสอบ — เจ้าของเปิดให้ดูหรือส่งออก)

## 6. แผนทดสอบเบราว์เซอร์ (ร่าง — ยังไม่รัน)

ป้ายผลใช้ชุดเดิม: PASS-BROWSER / GAP-CONFIRMED / NOT-TESTED. ผลบนระบบทดสอบ ≠ production PASS.

| # | ขั้น | สิ่งที่ตรวจ (browser + ข้อมูลที่เก็บ) |
|---|---|---|
| L1 | คุยเล่น (ไทย) | ตอบเป็นเสียงผู้หญิง (ไม่มี ครับ/ผม) · ไม่มีเอกสารเคส · `conversations/reception__<uid>` มีข้อความ · ไม่มีปุ่มเกินจริง |
| L2 | ฝากขาย/ฝากเช่า | `primaryIntent` ถูกต้อง · ปุ่มส่งต่อทีมงานปรากฏจากสถานะฝั่งเซิร์ฟเวอร์ |
| L3 | ร่างสะสม | `propertyDrafts/draft__<uid>` ฟิลด์เพิ่มตามที่พิมพ์ · provenance `customer_stated` · ค่าว่างไม่ทับค่าเดิม |
| L4 | รีเฟรช/แท็บใหม่ | uid เดิมกลับมา · ประวัติ+ร่างต่อได้ (**เบราว์เซอร์จริง** — ปิดช่อง "same-uid ≠ รีเฟรช" ที่ CHAT-TEST-01 ติดไว้) · ทดสอบเพิ่ม: ล้างข้อมูลเว็บ = uid ใหม่ (คาดว่าเริ่มใหม่) |
| L5 | ยืนยันส่งครั้งเดียว | กดซ้ำ/สองแท็บ → 1 เคส (`linkedCaseIds`) · `caseSource: ai_assistant` · `listingStatus: pending` · ได้ trackToken |
| L6 | ตรวจข้อมูลที่เก็บ | อ่านจาก Firebase Console ของโปรเจกต์ทดสอบ (เจ้าของเปิดสิทธิ์ดู หรือ Code ใช้บัญชีที่ได้รับสิทธิ์) เทียบกับสิ่งที่พิมพ์ |
| L7 | 8 ภาษา | ทุกภาษา: ตอบเป็นภาษาของลูกค้า · UI ครบ · ไทยเป็นผู้หญิง · ภาษาละตินไม่ถูก guard PD-16 แตะ (guard ตรวจอักษรไทยเท่านั้น) |
| L8 | เส้นทางสำรอง | จำลองให้ `receptionTurn` ใช้ไม่ได้ในเบราว์เซอร์จริง → ใช้ `claudeComplete` + guard `pd16` · ไม่บันทึกข้อมูลกลาง |
| L9 | ข้อผิดพลาด | ออฟไลน์/Function ล่ม → ข้อความ error เดิม ไม่ตอบซ้ำสองครั้ง |

**แยกเป็นช่องว่างที่ยังไม่แก้ — ไม่รับรองว่าผ่าน** (คาดผล GAP, บันทึกตามจริง):
- G-A: ฟิลด์ในร่าง (`area`, `bedrooms`, `price` ฯลฯ) **ไม่ถูกคัดลอกเข้าเคส** และไม่มีลิงก์ draft↔case (C5e/C5f)
- G-B: แชทกับฟอร์ม `Owner Submission` สร้าง **สองเคสแยก** ฟอร์มไม่อ่านร่าง (C6b–d)
- G-C: ตัวตรวจ "ผมสีดำ" (C7l) · Home/AI Concierge เสียงผู้หญิงไม่ได้รับรอง (S4)
- ข้อมูลที่เคสเก็บและเปิดอ่านได้สาธารณะ (SEC gaps) ยังเป็นเหมือนเดิม — **ระบบทดสอบจึงต้องใช้ข้อมูลสังเคราะห์เท่านั้น**

การทดสอบด้วยโมเดลจริงไม่แน่นอน (non-deterministic): บันทึกคำตอบจริง ผลรันซ้ำอาจต่าง ไม่ตัดสินว่า "ผ่าน" จากรอบเดียว

## 7. ใครทำอะไร

**Code ทำเองได้ (ไม่ต้องสิทธิ์เพิ่ม):**
- สคริปต์ build test-site + guard + สแกน production string + ชุดทดสอบอัตโนมัติ (Chromium ที่ติดตั้งแล้ว + stub/emulator) · แผนทดสอบละเอียด · สคริปต์ deploy ที่ปฏิเสธโปรเจกต์ production · คู่มือทีละขั้น
- หลังมี URL + สิทธิ์: รันแผน L1–L9 ด้วย Playwright ผ่านเบราว์เซอร์จริงที่เปิดได้ (ถ้า network policy ของ Code อนุญาตโดเมน `*.web.app`/Firebase — **ยังไม่ทราบ ต้องตรวจ**; ตอนนี้ firebase.google.com ถูกบล็อก)

**ต้องให้เจ้าของทำ (Code ไม่มีสิทธิ์/ไม่ควรถือ):**
1. สร้างโปรเจกต์ Firebase ใหม่ (ชื่อที่ไม่ปนกับ production) และตัดสินเรื่องแผนชำระเงิน (Blaze หรือไม่ — รอยืนยันจากเอกสารทางการ)
2. เปิด Anonymous Auth, Firestore, Hosting; ตั้ง region
3. สร้างคีย์ Anthropic ใหม่ + วงเงิน แล้วตั้ง secret `ANTHROPIC_API_KEY` ในโปรเจกต์ทดสอบเอง
4. รัน deploy ใน Codespace (`--project <test-id>`, เฉพาะ rules, indexes, 5 functions, hosting) ทีละคำสั่ง
5. เลือกวิธีจำกัดผู้เรียก (หัวข้อ 4.2) และวงเงิน
6. ให้สิทธิ์ดู Console/Logs แก่ Code/Work หรือส่งออกข้อมูลที่ตรวจ (ไม่ส่งคีย์)
7. ลองรอบสุดท้าย (O-1/O-2/O-3) หลัง Code และ Work ทดสอบเสร็จ

**คำแนะนำทีละขั้นสำหรับเจ้าของ** — จะเขียนเฉพาะส่วนที่ขาดสิทธิ์ (ข้อ 1–6) **หลัง Work อนุมัติแผน** โดยระบุทุกขั้นว่า "หน้าจอ Firebase Console / หน้าดำ Codespace / หน้าขาว GitHub" และตรวจผลทีละคำสั่งก่อนไปต่อ

## 8. คำถามที่ต้องให้ Work ตัดสินก่อนเริ่ม

1. อนุมัติแนว test-build แยก (`build/chat-live/` + allow-list + สแกน) แทนการแก้ไฟล์ production ใช่ไหม
2. วิธีจำกัดผู้เรียกข้อ 4.2: E อย่างเดียว หรือ E + (B หรือ C) — และยอมรับการแก้ Function ฝั่งทดสอบหรือไม่
3. ยืนยันว่าแหล่งทางการหัวข้อ 4.4 ให้ Work ตรวจ หรือจะเปิดให้ Code เข้าถึงโดเมนเหล่านั้น
4. ยืนยันขอบเขตว่าไม่เปิด Storage ในรอบนี้ (รูปอยู่รอบ "เผยแพร่พร้อมรูป")
5. ยืนยันว่า deploy เฉพาะ 5 ฟังก์ชัน ไม่รวม trigger/Stripe/LINE

## 9. ไม่อยู่ในแพ็กเกจนี้ / ข้อจำกัด

ไม่ merge · ไม่ deploy · ไม่เปิด GREEN · ไม่แตะฟีเจอร์ที่พักไว้ (ค่าตอบแทน โควตา สมาชิก Participants/Deal) · ไม่แก้ช่องว่างร่าง→เคส/แชท↔ฟอร์ม/"ผมสีดำ" · ไม่แตะ production · ไม่มี credentials ในไฟล์นี้ · เอกสารนี้ไม่ได้ทดสอบอะไรใหม่ (อ่านโค้ดอย่างเดียว) และไม่รับรองผลผ่าน
