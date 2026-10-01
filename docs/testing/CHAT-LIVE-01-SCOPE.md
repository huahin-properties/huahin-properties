# CHAT-LIVE-01 — ขอบเขตหน้าทดสอบแชทจริง (แยกจาก production) — v2

สถานะ: **เอกสารขอบเขต + สคริปต์ build/guard + ชุดทดสอบที่ไม่ใช้ credentials** ยังไม่สร้างบริการ ไม่ตั้ง credentials ไม่ deploy ไม่ merge
ฐาน: `8c549c6` (PR #5 ผ่านการตรวจโค้ดของ Work; ผลรันที่ `afa0d8b` เป็นผลของ Code ไม่ใช่ production PASS)
v2 = ปรับตามคำตัดสิน 5 ข้อของ Work ที่ `916fe01` + ข้อสังเกตเพิ่มเติม

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
| `tools/build-chat-live.js` + `tools/chat-live/guard.js` + `tools/chat-live.config.example.json` | **ทำแล้ว** (ไม่แตะไฟล์ production แม้แต่ไบต์เดียว) |
| `tests/chat-live/build.test.js` (15) + `tests/chat-live/browser-guard.test.js` (10) | **ทำแล้ว** ผลในหัวข้อ 7 |
| `npm run test:chat-live` | **ทำแล้ว** (เพิ่ม script 1 บรรทัดใน `package.json`, lockfile ไม่เปลี่ยน) |
| แก้ Function: allow-list, token ของ `claudeComplete`, เพดานแบบ atomic | **ยังไม่ทำ — เป็นข้อเสนอให้ Work ตรวจ (หัวข้อ 4)** |
| สร้างโปรเจกต์/บริการ/credentials/deploy | **ไม่ทำ** |
| คู่มือเจ้าของทีละขั้น | ร่างหัวข้อ 8 — เขียนละเอียดหลัง Work อนุมัติหัวข้อ 4 |

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

> **ข้อสังเกตด้านความปลอดภัยของ production (รายงาน ไม่แก้ในแพ็กเกจนี้):** `firebase-client.js` ซึ่งถูกส่งให้ทุกเบราว์เซอร์มีค่าเริ่มต้นบัญชีแอดมินแบบข้อความล้วน และ `index.html` ฝังอีเมลแอดมินของประตูปรับปรุงเว็บ ผมไม่ได้ยืนยันว่าค่าเหล่านั้นยังใช้เข้าระบบจริงอยู่หรือไม่ — ขอให้ Work/เจ้าของพิจารณาเป็นแพ็กเกจแยก (ผมไม่ใส่ค่าลับซ้ำลงในเอกสาร/ชุดทดสอบ)

## 3. Guard คอนฟิก — ทำงานก่อน Firebase/แชท (ทำแล้ว + ทดสอบในเบราว์เซอร์จริง)

- build ห่อ `<body>` ทั้งหมดไว้ใน `<template id="chat-live-app">` (เนื้อหาใน template **ไม่รันสคริปต์ ไม่โหลด SDK/ฟอนต์/รูป**) และสคริปต์แรกสุดคือ `chat-live-guard.js`
- guard ตรวจ: config ครบทุกฟิลด์ · ไม่มีค่า production · hostname อยู่ใน allow-list (`<project>.web.app`, `<project>.firebaseapp.com`, และ loopback สำหรับทดสอบในเครื่อง) — ผ่านแล้วจึงสร้างเนื้อหาและโหลด `support.js`
- ไม่ผ่าน → แถบแดง "ไม่ใช่ระบบทดสอบ / คอนฟิกไม่ครบ — หยุดการทำงาน" และ **ไม่มีคำขอภายนอกเลยแม้แต่ครั้งเดียว** (ทดสอบ P2a–f)
- ชั้นที่สอง: `fetch`/`XMLHttpRequest` ที่ URL มีเครื่องหมาย production ถูกปฏิเสธในหน้า (P4)
- build เองก็ปฏิเสธ (exit ≠ 0, ไม่เขียนไฟล์) ถ้าคอนฟิกขาด/เป็น placeholder/เป็น production/projectId ไม่มีคำว่า `test`/authDomain–bucket ไม่ตรง/region ผิด (B1–B4, B7–B8)

ข้อค้นพบระหว่างทดสอบ: ครั้งแรก guard ที่หยุดแล้ว SDK/ฟอนต์/รูปยังถูกโหลดเพราะ `<helmet>` ถูกเบราว์เซอร์อ่านเอง จึงเปลี่ยนเป็นแนว template; ครั้งที่สองการโหลด SDK ซ้ำทำให้ Firebase app หาย จึงให้ `support.js` เป็นผู้โหลด SDK เหมือนเดิม และเพิ่มเทสต์ "SDK โหลดครั้งเดียว" (ในการทดสอบหน้า production ที่ไม่มี guard ก็เคยเห็นแอปหายชั่วคราวเป็นบางรอบ — สังเกตจากชุดทดสอบ Chromium ที่สกัดเครือข่าย ยังไม่ได้ยืนยันบนเบราว์เซอร์จริง)

## 4. ข้อเสนอแก้ Function (ให้ Work ตรวจ — ยังไม่ลงมือ)

หลักการ: **ทุกอย่างทำงานเฉพาะเมื่อ project id ไม่ใช่ `huahin-properties-5f1b5`** (เปิดโดยปริยายในทุกโปรเจกต์ที่ไม่ใช่ production; ถ้าเอกสารตั้งค่าขาด → ปฏิเสธทั้งหมด = fail closed) บน production โค้ดเส้นทางเดิมต้องไม่เปลี่ยน

### 4.1 ไฟล์ที่จะแก้/เพิ่ม

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `functions/chat-test-gate.js` (ใหม่) | `gateActive()`, `requireAllowedUid(uid)`, `verifyHttpUid(req)`, `reserveAiCalls(uid, n)` |
| `functions/index.js` | เรียก gate ที่ต้นของ 5 handler และก่อนทุกจุดเรียกโมเดลที่เส้นทางแชท (บรรทัดที่ `fetch("https://api.anthropic.com…")`: `claudeComplete` 3 จุด [โหมดแชท, retry ของ guard PD-16, โหมด content/tool] และ `callClaudeReceptionOnce` 1 จุด) — แก้เป็นบรรทัดเพิ่ม ไม่ย้ายตรรกะเดิม |
| `ContactRail.dc.html` | **ไม่แก้** — header `Authorization` ถูกใส่ใน test build เท่านั้น (build patch + ทดสอบแล้ว B5/B7) |
| `tests/chat-live/gate.test.js` (ใหม่, ใช้ Auth+Firestore emulator, Anthropic stub เดิม) | ดูหัวข้อ 4.5 |
| `package.json` | script `test:chat-live-gate` (ไม่เพิ่ม dependency) |

### 4.2 allow-list ที่ตรวจฝั่งเซิร์ฟเวอร์ (ข้อกำหนดของ Work)

- เอกสาร `chatTestAllow/{uid}` ใน Firestore ของโปรเจกต์ทดสอบ; handler อ่านด้วย Admin SDK; ไม่มี/`enabled !== true` → ปฏิเสธ **ก่อนเรียก AI และก่อนอ่าน/เขียนข้อมูลอื่น**
- ครอบคลุม **receptionTurn, claudeComplete, getPropertyDraft, updatePropertyDraft, createCaseFromConversation** (3 callable ที่ใช้ข้อมูลทดสอบ + 2 ตัวที่เรียก AI)
- **เขียนได้เฉพาะฝั่งที่มีสิทธิ์:** `firestore.rules` ปัจจุบันเป็น deny-by-default สำหรับคอลเลกชันที่ไม่ได้ระบุ → client เพิ่มสิทธิ์ตัวเองไม่ได้ (จะมีเทสต์ยืนยันกับ rules จริงใน repo; ถ้าพบว่ากฎ catch-all ไม่เป็นอย่างที่คาด จะแจ้งก่อนแก้)
- **ขั้นตอนอนุญาต UID แบบสั้นที่สุด:** (1) ผู้ทดสอบเปิดหน้าทดสอบ → แถบเหลืองบนสุดแสดง "รหัสผู้ทดสอบ (UID)" (guard ทำแล้ว) แล้วส่งให้เจ้าของ (2) เจ้าของเปิด Firebase Console ของโปรเจกต์ **ทดสอบ** → Firestore → `chatTestAllow` → Add document → Document ID = UID → ฟิลด์ `enabled` (boolean) = `true` → Save (ไม่ต้องใช้เทอร์มินัล)

### 4.3 `claudeComplete` แบบ HTTP ตรวจ Firebase ID token และ UID

- ต้องมี `Authorization: Bearer <ID token>`; `admin.auth().verifyIdToken` → uid → ตรวจ allow-list เหมือนข้างบน; ขาด/หมดอายุ/ไม่ถูกต้อง = 401, ไม่อยู่ใน allow-list = 403; ตรวจ **ก่อน** อ่าน body และก่อนเรียก AI (หลัง method check เดิม)
- **ห้าม fallback ข้ามข้อจำกัด:** ตามโค้ด ContactRail รหัสผิดพลาดบางตัวของ receptionTurn (รวม `permission-denied` และ `unauthenticated` — ดู CHAT-FIX-02 S2) อนุญาตให้ตกไปใช้ `claudeComplete` จึงต้องให้ `claudeComplete` ปฏิเสธ UID เดียวกันด้วยกฎเดียวกัน และมีเทสต์ "UID ที่ไม่อนุญาต → ทั้งสองเส้นทางถูกปฏิเสธ จำนวนการเรียก Anthropic = 0"
- ฝั่งเบราว์เซอร์: test build ส่ง header ด้วย `getIdToken()` (ไม่แก้ไฟล์ production)

### 4.4 เพดานการเรียก AI — จอง atomic ก่อนเรียกโมเดล นับ retry

- `reserveAiCalls(uid, n)` ใช้ Firestore transaction บน `chatTestQuota/global` และ `chatTestQuota/uid__<uid>`; เพดานอยู่ใน `chatTestConfig/limits` (`globalCap` = เพดานรวมของรอบทดสอบ, `perUidCap`) — **เอกสาร config ขาด/ค่าไม่ใช่ตัวเลข → ปฏิเสธ (fail closed)**; ตัวเลขเพดานเจ้าของเป็นผู้เลือก (ยังไม่กำหนด)
- จองก่อนเรียกโมเดล **ทุกครั้ง**: การเรียกแรก 1 ช่อง; **PD-16 retry จองอีก 1 ช่อง** (ทั้ง `receptionTurn` และ `claudeComplete`) ถ้าเต็มตอน retry → ถือเป็น `retry_failed` → ข้อความสำรองเพศหญิงเดิม (ไม่เรียกโมเดลเกินเพดาน)
- ช่องที่จองไม่คืนแม้การเรียกล้มเหลว (นับแบบระมัดระวัง); เต็ม → `resource-exhausted` (callable) / 429 (HTTP) ซึ่ง **ไม่อยู่ในรายการรหัสที่ ContactRail ยอมให้ fallback** (ตรวจจาก source ใน S2 — จะยืนยันซ้ำในเทสต์)
- **ไม่เรียก `maxInstances` ว่าเพดานค่าใช้จ่าย**: เป็นเพดานการทำงานพร้อมกัน เท่านั้น; เพดานค่าใช้จ่ายจริงต้องมี (ก) ตัวนับข้างบน และ (ข) การจำกัดงบ/spend ที่ Workspace ของคีย์ Anthropic และ billing ของ Firebase ตามหน้าทางการที่ Work ตรวจ — เจ้าของตั้งค่าเอง

### 4.5 หลักฐานที่จะส่ง (ทั้งหมดไม่ใช้ credentials; Anthropic = stub, Firebase = emulator)

1. UID ไม่อยู่ใน allow-list → ปฏิเสธทั้ง 5 ฟังก์ชัน, **Anthropic stub ถูกเรียก 0 ครั้ง**, ไม่มีเอกสาร conversation/draft/case ถูกเขียน
2. HTTP `claudeComplete`: ไม่มี token / token ปลอม / token หมดอายุ → 401; token ถูกแต่ไม่อยู่ใน allow-list → 403; AI = 0
3. ลำดับ fallback จริง: receptionTurn ปฏิเสธ → ส่งต่อ claudeComplete → ปฏิเสธ (ไม่มีทางอ้อม)
4. client เขียน `chatTestAllow/*`, `chatTestQuota/*`, `chatTestConfig/*` ด้วยกฎจริง → ถูกปฏิเสธ
5. เพดาน: ยิงพร้อมกัน 20 คำขอเมื่อเพดาน 5 → สำเร็จ **5** พอดี, Anthropic stub = 5 ครั้งพอดี, ที่เหลือถูกปฏิเสธก่อนเรียกโมเดล; เพดานรวมข้าม 2 UID; retry นับ (เหลือ 1 ช่อง → คำตอบแรกผ่าน retry ถูกปฏิเสธ → ข้อความสำรอง AI = 1 ครั้ง)
6. config ขาด → ปฏิเสธทั้งหมด
7. **production ไม่เปลี่ยนพฤติกรรม:** (ก) รันชุดเดิม 55 (`test:chat`) + SEC-TEST-01 ซ้ำโดยตั้ง project id เป็นของ production → ผลต้องเท่าเดิม (ข) เทสต์ใหม่ที่ตั้ง project id เป็น production: gate ปิด ไม่มีการอ่าน `chatTestAllow`/`chatTestQuota` เลย (นับการเข้าถึงด้วย Admin SDK spy) และไม่ต้องมี Authorization header (ค) negative control: ถอด gate ออก → เทสต์ข้อ 1–5 ต้องล้ม (ง) diff ของ `functions/index.js` แสดงเฉพาะบรรทัดเพิ่มที่ครอบด้วยเงื่อนไข gate

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

## 7. ผลทดสอบ (รอบนี้ — ไม่ใช้ credentials; ไม่ใช่ production PASS)

ดูตารางผลจริงในรายงานของ PR (commit ที่รัน, จำนวน passing/pending/failing, negative control) — ชุด `test:chat-live`:

- B1–B8 (15 เคส): config ขาด/placeholder/production/รูปแบบผิด → ปฏิเสธและไม่เขียนไฟล์; build ที่ถูกต้องไม่มีสตริง production/ช่องทางติดต่อจริง/ค่าลับ; ไฟล์ production ไม่เปลี่ยน (`git diff` เทียบ `8c549c6` และ `HEAD`); negative control: จุด patch หายไป หรือมีสตริง production ถูกปลูกไว้ → build ล้ม
- P1–P5 (10 เคส, Chromium จริง, ทุก host ภายนอกถูกสกัดและบันทึก): guard ผ่าน → Firebase เริ่มบน **โปรเจกต์ทดสอบ**, ไม่มีคำขอไป host production, SDK แต่ละไฟล์โหลดครั้งเดียว; guard ไม่ผ่าน 6 แบบ → **ไม่มีคำขอภายนอกเลย**; host ที่อนุญาตผ่าน; ตัวกรองรันไทม์บล็อก fetch/XHR ไป URL production; negative control: หน้า production เดิมที่ไม่มี guard เริ่ม Firebase บน production (พิสูจน์ว่า guard คือสิ่งที่กัน)
- ข้อจำกัด: ใช้ Firebase SDK 10.14.1 จาก `node_modules` แทน 10.12.2 ที่หน้าจริงใช้; Firestore/Functions/Anthropic จริงไม่ถูกเรียก; ไม่ใช่การทดสอบกับโมเดลจริงหรือโดเมนจริง; ต้องมี `CHAT_LIVE_VENDOR` (สำเนา React/Babel) ชุดเบราว์เซอร์จึงรัน ไม่เช่นนั้น pending

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

**Code ทำเองได้ (ไม่ต้องสิทธิ์เพิ่ม):** build/guard/ทดสอบ (ทำแล้ว) · หลัง Work อนุมัติหัวข้อ 4: แก้ Function + เทสต์ emulator + หลักฐาน production-ไม่เปลี่ยน · ร่างคู่มือ

**ต้องให้เจ้าของทำ (ตามลำดับ — จะส่งทีละขั้น):**
1. สร้างโปรเจกต์ Firebase ทดสอบ (ชื่อต้องมีคำว่า `test`) แล้วแจ้ง project id ← **ขั้นแรกและขั้นเดียวที่เจ้าของต้องทำเมื่อ Work อนุมัติให้เริ่ม**
2. เพิ่มโดเมนใน Network access ของ Code (หัวข้อ 6)
3. เปิด Anonymous Auth / Firestore / Hosting; สร้างเว็บแอปแล้วส่งค่า config (ไม่ใช่ความลับ — apiKey เว็บ)
4. สร้างคีย์ Anthropic ใหม่ใน Workspace แยก + ตั้งวงเงิน และตั้งเป็น secret `ANTHROPIC_API_KEY` ในโปรเจกต์ทดสอบเอง (ไม่ส่งคีย์ให้ Code)
5. รัน deploy ใน Codespace ทีละคำสั่ง (`--project <test-id>` ทุกคำสั่ง ห้ามพึ่ง default ของ `.firebaserc` ซึ่งเป็น production)
6. เพิ่ม UID ผู้ทดสอบ + ตั้งเพดานใน Firestore Console (หัวข้อ 4.2, 4.4)
7. ลองรอบสุดท้าย (O-1/O-2/O-3) หลัง Code และ Work ทดสอบเสร็จ

## 10. ไม่อยู่ในแพ็กเกจนี้

ไม่ merge · ไม่ deploy · ไม่เปิด GREEN · ไม่แตะฟีเจอร์ที่พักไว้ · ไม่ขยายไป staging ทั้งระบบ · ไม่แก้ช่องว่างร่าง→เคส/แชท↔ฟอร์ม/"ผมสีดำ" · ไม่แก้ค่าเริ่มต้นแอดมิน/อีเมลใน production (รายงานเท่านั้น) · ไม่มี credentials ในไฟล์ใด ๆ
