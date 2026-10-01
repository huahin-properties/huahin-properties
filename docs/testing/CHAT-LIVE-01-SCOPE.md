# CHAT-LIVE-01 — ขอบเขตหน้าทดสอบแชทจริง (แยกจาก production) — v4


ฐาน: `8c549c6` (PR #5 ผ่านการตรวจโค้ดของ Work; ผลรันที่ `afa0d8b` เป็นผลของ Code ไม่ใช่ production PASS)
v2 = ปรับตามคำตัดสิน 5 ข้อของ Work ที่ `916fe01` · v4 = ปิดข้อปรับสุดท้ายตามรีวิว `3d0f85e` (demo-* ปิด gate ได้เฉพาะเมื่อมีหลักฐาน emulator loopback; คืนค่า provider จริงหลังทดสอบ + ทดสอบร่วมในโปรเซสเดียว) · v3 = ปรับตามรีวิว `8f51b5c` (ความปลอดภัยของโฟลเดอร์ผลลัพธ์, URL claudeComplete ผูกกับโปรเจกต์ทดสอบ, ลงมือทำ gate ตามขอบเขตหัวข้อ 4, แผนทดสอบ production-ไม่เปลี่ยนแบบ DI)

เป้าหมายแรก: ContactRail + `receptionTurn` (+ `createCaseFromConversation`, `getPropertyDraft`, `updatePropertyDraft`, `claudeComplete` ที่ ContactRail เรียก)

## 0. คำตัดสินของ Work (บันทึกตามที่ได้รับ)

1. ใช้ test-build แยก ไม่แก้คอนฟิก production
2. **Anonymous Auth + allow-list UID ผู้ทดสอบที่ตรวจฝั่งเซิร์ฟเวอร์ + เพดานจำนวนการเรียก AI** (ไม่ใช้ "ตั้งเพดานที่ต้นทางอย่างเดียว"; ยังไม่เพิ่ม App Check ในชุดนี้)
3. Work ตรวจแหล่งทางการแล้ว (ลิงก์: Firebase Functions get-started, Claude Workspaces, Firebase spend caps, App Check) — **Code เปิดลิงก์เหล่านี้เองไม่ได้ (เครือข่ายบล็อก)** จึงไม่ได้ยืนยันเนื้อหาซ้ำ ข้อความในเอกสารนี้ที่อิงเรื่องค่าใช้จ่าย/แผน/เพดานเป็นของ Work; ส่วนที่เป็นรายละเอียดตัวเลขยังไม่ระบุ
4. ไม่เปิด Storage รอบแชทนี้
5. Deploy เฉพาะ 5 ฟังก์ชันที่ระบุภายหลัง ไม่ deploy trigger หรือบริการอื่น

## 1. ทำแล้วใน PR นี้ / ยังไม่ได้ทำ

| รายการ | สถานะ |
|---|---|
| `tools/build-chat-live.js` + `tools/chat-live/guard.js` + `tools/chat-live.config.example.json` | ทำแล้ว; v3: จำกัดโฟลเดอร์ผลลัพธ์, URL `claudeComplete` derive จาก project id |
| `functions/chat-test-gate.js` (ใหม่) + 21 บรรทัดเพิ่มใน `functions/index.js` | **ทำแล้ว (v3)** — ทำงานเฉพาะ project id `huahin-chat-test-*`; production และ emulator `demo-*` = ปิด (พฤติกรรมเดิม); id ที่ไม่ทราบ = ปฏิเสธ |
| `tests/chat-live/build.test.js` (21) + `browser-guard.test.js` (12) + `gate.test.js` (21) | ทำแล้ว ผลหัวข้อ 7 |
| `npm run test:chat-live`, `npm run test:chat-live-gate` | ทำแล้ว (เพิ่ม 2 script; ไม่เพิ่ม dependency; lockfile ไม่เปลี่ยน) |
| สร้างโปรเจกต์/บริการ/credentials/deploy | **ไม่ทำ** |
| คู่มือเจ้าของทีละขั้น | ร่างหัวข้อ 9 — เขียนละเอียดหลัง Work ตรวจ PR นี้ |
| ค่าเริ่มต้นแอดมินในไฟล์สาธารณะ | **บันทึกเป็นงานแยก** `docs/security/SEC-URGENT-01-admin-default-credentials.md` (ไม่แสดงค่า ไม่ล็อกอิน production) |

## 2. Entry page และไฟล์ที่จำเป็นจริง

คำนวณจาก `index.html` (Home — เป็นหน้าที่ฝัง ContactRail) ตาม `dc-import` และ `import()` / `<script src>` จริง ไม่เดา:

`index.html`, `support.js`, `image-slot.js`, `data.js`, `favorites.js`, `firebase-client.js`, `conversation-firestore.js`, `conversation-store.js`, `ContactRail.dc.html`, `PropertyCard.dc.html`, `LanguageSwitcher.dc.html`, `logo.png` (12 ไฟล์) + ไฟล์ที่ build สร้าง: `chat-live-config.js`, `chat-live-guard.js`, `firebase.json` (Hosting เท่านั้น: noindex header, ไม่มี rewrite) และ `MANIFEST.json` (sha256)

- **ไม่รวม** `Owner Submission.dc.html` (ปุ่ม "List property" ของแชทนำทางไปหน้านั้น → ในระบบทดสอบจะ 404; ฟอร์มอยู่นอกขอบเขตแชทรอบนี้ และเป็นฝั่ง "แชท↔ฟอร์ม" ที่ยังเป็นช่องว่าง)
- `support.js` (runtime ของ Design Components) ดึง **React 18.3.1 / ReactDOM / @babel/standalone 7.29.0 จาก `unpkg.com`** และหน้าดึง Firebase SDK 10.12.2 จาก `www.gstatic.com` และฟอนต์จาก `fonts.googleapis.com` — เหมือน production; build ไม่เปลี่ยน
- `data.js` เป็นข้อมูลตัวอย่าง 24 รายการ (ไม่ใช่ข้อมูลลูกค้า)

### สิ่งที่ build ต้อง "เปลี่ยน" (ตรวจพบในโค้ด ไม่ใช่แค่ projectId)

| จุด | การจัดการใน test build |
|---|---|
| `firebaseConfig` + Function hosts ทั้ง 7 จุด + URL `claudeComplete` (6 จุดใน `firebase-client.js`, 1 ใน ContactRail) | แทนด้วยค่าจากคอนฟิกทดสอบ (ต้องตรง projectId/authDomain/bucket) |
| `DEFAULT_ADMIN_CREDENTIALS` ใน `firebase-client.js` (ชื่อผู้ใช้/รหัสผ่านแบบข้อความล้วน + อีเมล/เบอร์กู้คืนจริง) | แทนด้วยค่าสังเคราะห์ที่ใช้ไม่ได้ |
| `DEFAULT_FB_FOOTER` (เบอร์โทร อีเมล กลุ่ม Facebook จริง) | แทนด้วยข้อความสังเคราะห์ |
| ลิงก์ติดต่อจริง: LINE (3 รูปแบบ), WhatsApp, tel, mailto, อีเมลในประตู admin ของ `index.html` | แทนด้วย `#chat-live-disabled` / ค่าไม่ใช้งาน |
| `canonical`, `og:url/og:image`, JSON-LD, google-site-verification ที่ชี้ `huahin.properties` | ลบออก + ใส่ `noindex,nofollow` |
| สแกนสุดท้ายก่อนเขียนไฟล์ | ล้มทันทีถ้ายังเหลือ `5f1b5`, `auth.huahin.properties`, `claudecomplete-3j4ldf4pja`, URL `huahin.properties`, LINE/mailto/tel/wa.me จริง, เบอร์/อีเมลจริง, หรือค่า `password:` ที่ไม่ใช่สังเคราะห์ |

> **ข้อสังเกตด้านความปลอดภัยของ production (บันทึกเป็นงานเร่งด่วนแยก `docs/security/SEC-URGENT-01-admin-default-credentials.md` ไม่แก้ในแพ็กเกจนี้ ไม่แสดงค่า ไม่ล็อกอิน production; การลบจากโค้ดอย่างเดียวไม่ทำให้รหัสที่เคยเผยแพร่ใช้ไม่ได้ ต้องให้เจ้าของเปลี่ยน/เพิกถอนภายหลัง):** `firebase-client.js` ซึ่งถูกส่งให้ทุกเบราว์เซอร์มีค่าเริ่มต้นบัญชีแอดมินแบบข้อความล้วน และ `index.html` ฝังอีเมลแอดมินของประตูปรับปรุงเว็บ ไม่ได้ยืนยันว่าค่าเหล่านั้นยังใช้เข้าระบบจริงอยู่หรือไม่ (ไม่มีการลองล็อกอิน) ไม่ใส่ค่าลับซ้ำลงในเอกสาร/ชุดทดสอบ

## 3. Guard คอนฟิก — ทำงานก่อน Firebase/แชท (ทำแล้ว + ทดสอบในเบราว์เซอร์จริง)

- build ห่อ `<body>` ทั้งหมดไว้ใน `<template id="chat-live-app">` (เนื้อหาใน template **ไม่รันสคริปต์ ไม่โหลด SDK/ฟอนต์/รูป**) และสคริปต์แรกสุดคือ `chat-live-guard.js`
- guard ตรวจ: config ครบทุกฟิลด์ · ไม่มีค่า production · hostname อยู่ใน allow-list (`<project>.web.app`, `<project>.firebaseapp.com`, และ loopback สำหรับทดสอบในเครื่อง) — ผ่านแล้วจึงสร้างเนื้อหาและโหลด `support.js`
- ไม่ผ่าน → แถบแดง "ไม่ใช่ระบบทดสอบ / คอนฟิกไม่ครบ — หยุดการทำงาน" และ **ไม่มีคำขอภายนอกเลยแม้แต่ครั้งเดียว** (ทดสอบ P2a–f)
- ชั้นที่สอง: `fetch`/`XMLHttpRequest` ที่ URL มีเครื่องหมาย production ถูกปฏิเสธในหน้า (P4)
- build เองก็ปฏิเสธ (exit ≠ 0, ไม่เขียนไฟล์) ถ้าคอนฟิกขาด/เป็น placeholder/เป็น production/projectId ไม่มีคำว่า `test`/authDomain–bucket ไม่ตรง/region ผิด (B1–B4, B7–B8)

ข้อค้นพบระหว่างทดสอบ: ครั้งแรก guard ที่หยุดแล้ว SDK/ฟอนต์/รูปยังถูกโหลดเพราะ `<helmet>` ถูกเบราว์เซอร์อ่านเอง จึงเปลี่ยนเป็นแนว template; ครั้งที่สองการโหลด SDK ซ้ำทำให้ Firebase app หาย จึงให้ `support.js` เป็นผู้โหลด SDK เหมือนเดิม และเพิ่มเทสต์ "SDK โหลดครั้งเดียว" (ในการทดสอบหน้า production ที่ไม่มี guard ก็เคยเห็นแอปหายชั่วคราวเป็นบางรอบ — สังเกตจากชุดทดสอบ Chromium ที่สกัดเครือข่าย ยังไม่ได้ยืนยันบนเบราว์เซอร์จริง)

### 3.1 ความปลอดภัยของโฟลเดอร์ผลลัพธ์ (v3 — ตามรีวิว 8f51b5c ข้อ 1)

ก่อนอ่าน/สร้าง/ลบอะไร `build()` ตรวจโฟลเดอร์ผลลัพธ์ และตรวจซ้ำก่อนลบจริง:
- ต้องอยู่ **ใต้** `<repo>/build/` เท่านั้น (CLI) — ไม่ใช่ตัว `build/` เอง ไม่ใช่ root `/`, home, repo root, โฟลเดอร์ที่มีไฟล์ต้นฉบับ หรือโฟลเดอร์ที่เป็นแม่ของ source
- ไม่มี symlink ในเส้นทาง (ตรวจเส้นทางตามที่เขียน ไม่ใช่เส้นทางที่ resolve แล้ว) และไม่ resolve ออกนอกพื้นที่ที่กำหนด
- ถ้าโฟลเดอร์มีอยู่แล้ว: ต้องว่าง หรือมีไฟล์ marker `.chat-live-output` ที่ build เคยสร้าง — มิฉะนั้นปฏิเสธและ **ไม่ลบ** ไม่ว่าในนั้นจะมีอะไร
- `/build/` ใส่ใน `.gitignore` (ผลลัพธ์ไม่ถูก commit)
- negative tests B9–B15 ใช้ "repo จำลอง" ที่มีไฟล์ sentinel แล้วเทียบเนื้อหาทั้งต้นไม้ก่อน/หลังที่ build ถูกปฏิเสธ: ไฟล์ไม่เสียหาย

### 3.2 URL ของ claudeComplete ผูกกับโปรเจกต์ทดสอบ (v3 — ข้อ 2)

- `projectId` ต้องเป็น `huahin-chat-test-<ส่วนต่อท้าย>` (≤ 30 ตัวอักษร) — ชุดเดียวกับที่ gate ใน Function ใช้
- URL **ไม่รับจากคอนฟิกอีกต่อไป** build คำนวณเป็น `https://asia-southeast1-<projectId>.cloudfunctions.net/claudeComplete`; ถ้าคอนฟิกใส่ `claudeCompleteUrl` มา ต้องตรงตัวกับค่านี้ มิฉะนั้นปฏิเสธ (URL ของโปรเจกต์อื่นที่รูปแบบโดเมนถูกต้อง, `run.app`, http, ต่อท้าย path/query = ปฏิเสธ — B3/B4)
- guard ในเบราว์เซอร์ตรวจซ้ำ: URL, authDomain และ storageBucket ต้องผูกกับ `projectId` (P2g/P2h)
- **ยังไม่ได้ยืนยัน:** ว่า Function รุ่น 2 ที่ deploy ใน `asia-southeast1` ตอบที่ URL รูปแบบ `cloudfunctions.net` นี้จริง (Code เปิดเอกสาร/โดเมนไม่ได้) — ขั้นตรวจหลัง deploy: เปิดหน้าทดสอบแล้วทดสอบ L8; ถ้าไม่ตอบ จะไม่ถอยไปรับ `run.app` เฉย ๆ แต่ต้องมีหลักฐานเชื่อม URL กับโปรเจกต์ (เช่น รายการ URL จาก `firebase functions:list --project <test-id>` หรือหน้า Cloud Run ของโปรเจกต์นั้น) และ Work อนุมัติก่อน

## 4. gate ใน Function (v3 — ลงมือแล้วตามขอบเขตที่ Work อนุญาต)

### 4.1 ไฟล์ที่เปลี่ยน
| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `functions/chat-test-gate.js` (ใหม่) | `runtimeProjectId`, `stateFor`, `createGate`/`sharedGate`: `enforceCallable`, `enforceHttp`, `reserve`, `reserveHook`, `reserveHttp` |
| `functions/index.js` | เพิ่ม **21 บรรทัด ลบ/แก้ 4 บรรทัด** (เทียบ `8c549c6`): สร้าง gate, เรียก `enforceCallable` ใน 4 callable, `enforceHttp` + `reserveHttp` ใน `claudeComplete` (โหมดแชท, โหมด content/tool), และพารามิเตอร์ `beforeCall`/`beforeRetry` ให้ `callClaudeReception`/`pd16GuardChatText` (4 บรรทัดที่แก้คือ signature/การเรียกที่เพิ่มอาร์กิวเมนต์) — GT17 ตรวจ diff นี้ในเทสต์ |
| `ContactRail.dc.html` | ไม่แก้ (header `Authorization` ใส่ใน test build เท่านั้น) |
| `tests/chat-live/gate.test.js`, `tests/firebase.chat-live.json`, `package.json` | ทดสอบ (Firestore + Auth emulator `demo-sec-test-01`, stub) |

### 4.2 การตัดสินว่าอยู่ในโหมดไหน (ตามข้อกำหนดของ Work)
- ตัดสินจาก **runtime ฝั่งเซิร์ฟเวอร์เท่านั้น** (`FIREBASE_CONFIG`, `GCLOUD_PROJECT`, `GOOGLE_CLOUD_PROJECT` — ทุกแหล่งที่มีต้องตรงกัน) ไม่รับ project id จาก request/header/claims (GT2)
- `huahin-properties-5f1b5` → **ปิด** = พฤติกรรมเดิม ไม่อ่าน/เขียน `chatTest*` และไม่ต้องมี `Authorization` (GT16, spy)
- `huahin-chat-test-<suffix>` → **บังคับ** · อื่นทั้งหมด (ไม่ทราบ ไม่ตรงกัน ไม่มี ไม่ถูกต้อง) → **ปฏิเสธ ไม่ตีความเป็น production** (GT1, GT3)
- **demo-* (v4):** ชื่อ `demo-*` อย่างเดียว **ไม่ปิด gate** gate เป็น "ปิด" ก็ต่อเมื่อมีหลักฐานจาก runtime ว่าอยู่กับ emulator ในเครื่อง: `FIRESTORE_EMULATOR_HOST` ต้องมีและเป็น loopback (`127.x.x.x`, `localhost`, `[::1]`) และตัวแปร endpoint ของ emulator อื่นที่ตั้งไว้ (Auth, Storage, Database, Pub/Sub) ต้องเป็น loopback ทั้งหมด — ไม่มี flag, ค่าว่าง, host ภายนอก, host ที่ขึ้นต้นเหมือน loopback (`127.0.0.1.evil…`, `localhost.evil…`), `0.0.0.0` หรือ flag ของ Auth อย่างเดียว = **ปฏิเสธ** (GT1b, GT1c) ส่วนชุดทดสอบเดิม (`test:chat`, `test:sec`) ที่รันใต้ emulator จริงยังรันได้โดยไม่แก้ไฟล์
- production ตรงตัว: ปิด (พฤติกรรมเดิม) โดยไม่ขึ้นกับตัวแปร emulator; id ที่ไม่ทราบ: ปฏิเสธเสมอ แม้มีหลักฐาน emulator (GT1)
- **การคืนค่าหลังทดสอบ (v4):** `reset()` คืน provider ของ runtime เดิมจริง (ไม่ใช่ฟังก์ชันจำลองที่คืนค่า `undefined`); `setProjectIdProvider(undefined)` ถูกปฏิเสธ; `after` ของชุดยืนยันว่า provider เป็นของ runtime และ `state()` เท่ากับที่ runtime คำนวณเอง (GT19 เป็น negative control: ตัวคืนค่าแบบเก่าทำให้ state เป็น deny และ `isRuntimeProvider()` เป็น false); รันร่วมในโปรเซสเดียวด้วย `npm run test:chat-live-combined` (gate → chat → sec → `zz-gate-restored`) เพื่อพิสูจน์ว่าชุดอื่นไม่โดนสถานะค้าง

### 4.3 allow-list / token / เพดาน
- 5 handler ใช้กฎเดียวกัน: `receptionTurn`, `getPropertyDraft`, `updatePropertyDraft`, `createCaseFromConversation` (callable) และ `claudeComplete` (HTTP: `Authorization: Bearer <ID token>` → `verifyIdToken` → uid → allow-list) ตรวจ **ก่อน** อ่านข้อมูลหรือเรียกโมเดล (GT4–GT6)
- allow-list = `chatTestAllow/<uid>` ต้องมี `enabled === true` (boolean) ขาด/ชนิดอื่น = ปฏิเสธ; client เขียน/อ่าน `chatTestAllow`, `chatTestQuota`, `chatTestConfig` ไม่ได้ด้วย `firestore.rules` จริงใน repo (catch-all deny) ทั้งแบบ anonymous sign-in และไม่ล็อกอิน (GT8)
- **fallback ข้ามไม่ได้ (GT7):** `permission-denied`/`unauthenticated` อยู่ในรายการที่ ContactRail ยอมให้ตกไปใช้ `claudeComplete` (อ่านจาก source จริง) แต่ `claudeComplete` ปฏิเสธ uid เดียวกันทั้งแบบมี token (403) และไม่มี token (401); `resource-exhausted`/`failed-precondition` ไม่อยู่ในรายการ fallback
- เพดาน: `chatTestConfig/limits` = `globalCap`, `perUidCap` ต้องเป็น **จำนวนเต็มบวก 1–10000** (ปฏิเสธ NaN, ±Infinity, ลบ, 0, ทศนิยม, string, boolean, null, ขาด, เกิน) และตัวนับที่เสียหายก็ปฏิเสธ — fail closed ก่อนเรียกโมเดล (GT9)
- จองด้วย **Firestore transaction** ก่อนเรียกโมเดล **ทุกครั้ง รวม retry** (PD-16 retry ของทั้ง `receptionTurn` และ `claudeComplete` จองอีก 1 ช่อง; เต็ม → ข้อความสำรองหญิงเดิม, การเรียกแรกเต็ม → error `resource-exhausted`/429 ไม่ใช่ข้อความสำรอง) นับแม้การเรียกล้มเหลว (GT10–GT15)
- `maxInstances` ไม่ถูกเรียกว่าเพดานค่าใช้จ่าย; เพดานจำนวนเป็นตัวนับข้างบน ส่วนวงเงินจริงตั้งที่ Workspace ของคีย์ AI และ billing ของ Firebase (เจ้าของตั้ง ตามหน้าทางการที่ Work ตรวจ)

### 4.4 ขั้นตอนอนุญาต UID แบบสั้นที่สุด (ไม่เปลี่ยน)
(1) ผู้ทดสอบเปิดหน้าทดสอบ → แถบเหลืองแสดง UID แล้วส่งให้เจ้าของ (2) เจ้าของเปิด Firebase Console ของโปรเจกต์ **ทดสอบ** → Firestore → `chatTestAllow` → Add document → Document ID = UID, ฟิลด์ `enabled` (boolean) = `true` → Save · และตั้ง `chatTestConfig/limits` (`globalCap`, `perUidCap` เป็นตัวเลขจำนวนเต็ม) หนึ่งครั้ง — ไม่ต้องใช้เทอร์มินัล

## 5. บริการ Firebase ที่จำเป็น (ไม่เพิ่มอัตโนมัติ — ไม่เปลี่ยนจาก v1 ยกเว้นระบุ)

| บริการ | จำเป็นไหม |
|---|---|
| Authentication — Anonymous เท่านั้น | จำเป็น |
| Firestore (+ rules + indexes) | จำเป็น |
| Functions `asia-southeast1` **เฉพาะ 5 ตัว:** `receptionTurn`, `getPropertyDraft`, `updatePropertyDraft`, `createCaseFromConversation`, `claudeComplete` | จำเป็น (ห้าม deploy trigger/Stripe/LINE/ฟังก์ชันอื่น — `createCaseFromConversation` สร้าง `properties` ที่ `listingStatus: "pending"` ซึ่งปลุก trigger `notifyOwnerApproval` (LINE) ถ้ามี) |
| Hosting | จำเป็น 1 อย่าง: URL สาธารณะให้ Code/Work เปิดเบราว์เซอร์ |
| Storage | **ไม่เปิด** |
| Stripe / Resend / LINE secrets / Phone Auth / provider อื่น | **ห้ามตั้ง/เปิด** |

## 6. Code เปิดโดเมนทดสอบได้ไหม — ตรวจแล้ว (ก่อนให้เจ้าของทำขั้นตอนยาว)

ตรวจจากเครื่อง Code ด้วย `curl` ผ่าน proxy (1 ต.ค. 2569):

| โดเมน | ผล |
|---|---|
| `www.gstatic.com` (Firebase SDK) | **403 ถูกบล็อก** |
| `unpkg.com` (React/Babel ของ `support.js`) | **ถูกบล็อก** |
| `<project>.web.app` (ใช้ตัวอย่างโปรเจกต์ production ที่มีอยู่จริงเป็นตัวทดสอบการเข้าถึง) | **ถูกบล็อก** |
| `*.cloudfunctions.net` | **ถูกบล็อก** |
| `fonts.googleapis.com`, `identitytoolkit.googleapis.com`, `firestore.googleapis.com`, `www.googleapis.com` | ตอบกลับ (404 ที่หน้าราก = เข้าถึงได้) |
| `registry.npmjs.org` | เข้าถึงได้ (ใช้ดึง React/Babel มาจำลองในชุดทดสอบได้) |

สรุป: **ตอนนี้ Code ยังเปิดหน้าทดสอบที่ deploy แล้วบน `*.web.app` ด้วยเบราว์เซอร์ไม่ได้** (ชุดทดสอบในข้อ 7 ทำงานได้เพราะสกัดคำขอและใช้สำเนาไฟล์ในเครื่อง ไม่ใช่การเปิดโดเมนจริง) ก่อนเริ่มทดสอบเบราว์เซอร์กับระบบจริง เจ้าของต้องแก้ **Network access** ของสภาพแวดล้อม Code (เมนูสภาพแวดล้อมคลาวด์ที่แถบหัวเซสชัน → Edit) เพิ่มโดเมนอนุญาตเหล่านี้: `www.gstatic.com`, `unpkg.com`, `<test-id>.web.app`, `<test-id>.firebaseapp.com`, `asia-southeast1-<test-id>.cloudfunctions.net`, โดเมน `*.run.app` ของ `claudeComplete` (และ `firestore.googleapis.com`, `identitytoolkit.googleapis.com`, `securetoken.googleapis.com` ถ้ายังไม่เปิด) — เป็นการตั้งค่าของเจ้าของ (Code ทำเองไม่ได้) และต้องรู้ `<test-id>` ก่อน จึงเป็นขั้นหลังสร้างโปรเจกต์ ผมจะบอกรายการโดเมนตามจริงอีกครั้งตอนนั้น

## 7. ผลทดสอบ (ไม่ใช้ credentials; ไม่ใช่ production PASS) — รายละเอียดตัวเลขอยู่ในรายงานของ PR

| ชุด | ขอบเขต | ผล (รัน ณ commit ที่ระบุในรายงาน PR) |
|---|---|---|
| `npm run test:chat-live` | build (21: B1–B15 รวมแบบวนตามฟิลด์) + Chromium จริง (12: P1, P2a–h, P3, P4, P5) | ผ่าน 33 (ต้องมี `CHAT_LIVE_VENDOR`; ไม่มี = เบราว์เซอร์ pending) |
| `npm run test:chat-live-gate` | Firestore + Auth emulator, stub Anthropic: GT1–GT19 (รวม GT1b/GT1c, GT19) | ผ่าน 21 |
| `npm run test:chat-live-combined` (โปรเซสเดียว: gate → chat → sec → zz-gate-restored) | ตรวจการคืนค่าและผลกระทบต่อชุดอื่น | ผ่าน 173 / pending 13 (= 21 + 55 + 95 + 2 ; 8 + 5) |
| `npm run test:chat` (เดิม ไม่แก้) | CHAT-TEST-01/FIX-01/FIX-02 | ผ่าน 55 / pending 8 — เท่าเดิม |
| `npm run test:sec` (เดิม ไม่แก้) | SEC-TEST-01 | ผ่าน 95 / pending 5 — เท่าเดิม |

**หลักฐาน "production ไม่เปลี่ยนพฤติกรรม" (ตามแผนที่ Work แก้):**
1. Firestore/Auth ของชุดทดสอบ **ยังเป็น `demo-*` + loopback ตลอด**; `assertEmulatorOnly` ไม่ถูกแก้; ไม่ใช้ credentials จริง
2. สาขา production ของ gate ทดสอบด้วย **dependency injection** (GT16: provider = project id ของ production → ไม่มีการอ่าน/เขียน `chatTest*` ผ่าน spy บน Firestore, ไม่ต้องมี `Authorization`, ทุก handler ตอบเหมือนเดิม; และ gate แยกที่ฉีด `admin` เป็น spy ที่ throw เมื่อถูกแตะ → นับการแตะ = 0 ทั้ง production และ `demo-*`)
3. ชุดเดิมรันซ้ำ **โดยไม่แก้ไฟล์ทดสอบเดิม** กับโค้ดใหม่: 55/8 และ 95/5 เท่ากับก่อนแก้
4. GT17: diff ของ `functions/index.js` เทียบ `8c549c6` = เพิ่มเฉพาะบรรทัดที่เกี่ยวกับ gate และแก้ 4 บรรทัดที่เพิ่มอาร์กิวเมนต์
5. negative control: GT4 (ปิด gate = uid ที่ไม่อนุญาตไปถึงโมเดล) · GT18 (จองแบบไม่ atomic = ปล่อยเกินเพดาน ทำให้ GT10 ล้มได้จริง) · B7/B8 (build ล้มเมื่อต้นฉบับเปลี่ยน/มีสตริง production ถูกปลูก) · P5 (หน้า production เดิมที่ไม่มี guard **เริ่ม Firebase ด้วยคอนฟิก production โดยที่คำขอภายนอกทุกอันถูกสกัด — ไม่ได้เชื่อมต่อ production จริง** ใช้พิสูจน์ว่า guard คือสิ่งที่กัน)

**ข้อจำกัด:** ชุดเบราว์เซอร์ใช้ Firebase SDK **10.14.1 จาก `node_modules` แต่หน้าจริงใช้ 10.12.2 จาก gstatic (คนละเวอร์ชัน)**; React/Babel เป็นสำเนา 18.3.1/7.29.0 ตรงเวอร์ชัน; Firestore/Functions/Anthropic จริง ไม่ถูกเรียก; ไม่ใช่การทดสอบโดเมนจริงหรือโมเดลจริง; gate ทดสอบกับ Auth emulator (token จริงของ emulator) ส่วน token หมดอายุทดสอบด้วยการฉีดตัวตรวจ; ไม่ได้ทดสอบ Cloud Functions runtime จริง (ตัวแปร `FIREBASE_CONFIG`/`GCLOUD_PROJECT` ที่ runtime จริงตั้งให้ทดสอบเป็นการจำลองด้วยพารามิเตอร์ของฟังก์ชัน — ต้องยืนยันตอน deploy ขั้นแรก ด้วย L-gate smoke: UID ไม่อนุญาตต้องถูกปฏิเสธ)

## 8. แผนทดสอบเบราว์เซอร์ L1–L9 (ร่างปรับแล้ว — ยังไม่รัน)

ป้ายผล: PASS-BROWSER / GAP-CONFIRMED / NOT-TESTED. ผลบนระบบทดสอบ ≠ production PASS. โมเดลจริงไม่แน่นอน บันทึกคำตอบจริง รอบเดียวไม่ตัดสินว่า "ผ่าน"

| # | ขั้น | สิ่งที่ตรวจ |
|---|---|---|
| L1 | คุยเล่น (เทิร์นแรก) | ตามผล C1 เดิม: **ไม่มีเอกสาร conversation / draft / case ถูกสร้าง** (โค้ดเริ่มเก็บข้อมูลเมื่อ stage เป็น advisory/qualified เท่านั้น) · คำตอบไทยเสียงผู้หญิง · ไม่มีปุ่มเกินจริง |
| L2 | ฝากขาย/ฝากเช่า | **ตรวจตามเงื่อนไขจริงในโค้ด ไม่คาดว่ามีปุ่มทันที:** ปุ่ม "ติดต่อเรา" เกิดจากโทเคน `[[CONTACT]]` ในคำตอบเท่านั้น · ปุ่ม "List property" (นำทางไป Owner Submission ไม่สร้างเคส) เกิดจากโทเคน `[[LIST_PROPERTY]]`, ข้อความที่ตรง regex, หรือ `meta.primaryIntent` ของเซิร์ฟเวอร์ = SELL/RENT_OUT (ตามโค้ดปัจจุบัน — บันทึกสิ่งที่เกิดจริงต่อเทิร์น) · แถบ "ส่งให้ทีมงาน" เกิดเมื่อ stage ที่เซิร์ฟเวอร์คืนเป็น `qualified` เท่านั้น (ไม่ใช่ข้อความของ AI) |
| L3 | ร่างสะสม | `propertyDrafts/draft__<uid>` ฟิลด์เพิ่มตามที่พิมพ์ · provenance `customer_stated` · ค่าว่างไม่ทับค่าเดิม |
| L4 | รีเฟรช/แท็บใหม่ | uid เดิมกลับมา ประวัติ+ร่างต่อได้ (เบราว์เซอร์จริง — ปิดช่อง "same-uid ≠ รีเฟรช" ของ CHAT-TEST-01) · ล้างข้อมูลเว็บ = uid ใหม่ (คาดว่าเริ่มใหม่ และต้องถูกขออนุญาต UID ใหม่ — บันทึกเป็นข้อจำกัดของการทดสอบ) |
| L5 | ยืนยันส่งครั้งเดียว | กดซ้ำ/สองแท็บ → 1 เคส · `caseSource: ai_assistant` · `listingStatus: pending` · ได้ trackToken |
| L6 | ตรวจข้อมูลที่เก็บ | อ่านจาก Firebase Console โปรเจกต์ทดสอบ เทียบกับที่พิมพ์ |
| L7 | 8 ภาษา | แต่ละภาษา: ตอบภาษาลูกค้า · UI ครบ · ไทยเสียงผู้หญิง · ภาษาละตินไม่ถูก guard PD-16 แตะ |
| L8 | เส้นทางสำรอง | ทำให้ `receptionTurn` ใช้ไม่ได้ในเบราว์เซอร์จริง → `claudeComplete` + guard `pd16` + **ต้องผ่านข้อจำกัด UID/token/เพดานเดียวกัน** · ไม่บันทึกข้อมูลกลาง |
| L9 | ข้อผิดพลาด/เพดาน | ออฟไลน์/Function ล่ม/เพดานเต็ม/UID ไม่อนุญาต → ข้อความ error ไม่ตอบซ้ำสองครั้ง ไม่มีทาง fallback ข้ามข้อจำกัด |

**ช่องว่างที่ยังไม่แก้ — ไม่รับรองว่าผ่าน:** G-A ฟิลด์ร่างไม่ถูกคัดลอกเข้าเคส + ไม่มีลิงก์ draft↔case (C5e/C5f) · G-B แชทกับฟอร์มสร้างสองเคสแยก (C6b–d) · G-C ตัวตรวจ "ผมสีดำ" (C7l), Home/AI Concierge เสียงผู้หญิงไม่ได้รับรอง (S4) · SEC gaps (เคสอ่านสาธารณะได้) → ใช้ข้อมูลสังเคราะห์เท่านั้น

## 9. ใครทำอะไร

**Code ทำเองได้ (ไม่ต้องสิทธิ์เพิ่ม):** build/guard/gate/ทดสอบ (ทำแล้ว) · ร่างคู่มือ

**ต้องให้เจ้าของทำ (ตามลำดับ — จะส่งทีละขั้น):**
1. สร้างโปรเจกต์ Firebase ทดสอบ (ชื่อต้องมีคำว่า `test`) แล้วแจ้ง project id ← **ขั้นแรกและขั้นเดียวที่เจ้าของต้องทำเมื่อ Work อนุมัติให้เริ่ม**
2. เพิ่มโดเมนใน Network access ของ Code (หัวข้อ 6)
3. เปิด Anonymous Auth / Firestore / Hosting; สร้างเว็บแอปแล้วส่งค่า config (ไม่ใช่ความลับ — apiKey เว็บ)
4. สร้างคีย์ Anthropic ใหม่ใน Workspace แยก + ตั้งวงเงิน และตั้งเป็น secret `ANTHROPIC_API_KEY` ในโปรเจกต์ทดสอบเอง (ไม่ส่งคีย์ให้ Code)
5. รัน deploy ใน Codespace ทีละคำสั่ง (`--project <test-id>` ทุกคำสั่ง ห้ามพึ่ง default ของ `.firebaserc` ซึ่งเป็น production)
6. เพิ่ม UID ผู้ทดสอบ + ตั้งเพดานใน Firestore Console (หัวข้อ 4.2, 4.4)
7. ลองรอบสุดท้าย (O-1/O-2/O-3) หลัง Code และ Work ทดสอบเสร็จ

## 10. ไม่อยู่ในแพ็กเกจนี้

ไม่ merge · ไม่ deploy · ไม่เปิด GREEN · ไม่แตะฟีเจอร์ที่พักไว้ · ไม่ขยายไป staging ทั้งระบบ · ไม่แก้ช่องว่างร่าง→เคส/แชท↔ฟอร์ม/"ผมสีดำ" · ไม่แก้ค่าเริ่มต้นแอดมิน/อีเมลใน production (บันทึกเป็น SEC-URGENT-01 แยก; ไม่ล็อกอิน production) · ไม่มี credentials ในไฟล์ใด ๆ
