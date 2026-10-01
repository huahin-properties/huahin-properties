# CHAT-LIVE-01 — นำแชทขึ้นโปรเจกต์ทดสอบ `huahin-chat-test-01` (เตรียมแล้ว ยังไม่ deploy)

สถานะ: เตรียมสคริปต์และชุดทดสอบเท่านั้น **ยังไม่ได้ deploy อะไร ยังไม่ merge ไม่แตะ production** ข้อมูลโปรเจกต์ (Anonymous Auth, Firestore, Hosting, Blaze, งบแจ้งเตือน 25 บาท, spend cap ของ Cloud Run Functions 25 บาท) เป็นสิ่งที่เจ้าของแจ้ง — Code ยังไม่ได้ตรวจในคอนโซล

## 1. ตรวจเครื่องมือและสิทธิ์ที่ Code มี (1 ต.ค. 2569)

| สิ่งที่ตรวจ | ผล |
|---|---|
| `firebase` CLI / `gcloud` ติดตั้งในเครื่อง Code | **ไม่มี** (ใช้ `npx firebase-tools@15.32.1` ได้ เพราะ npm registry เข้าถึงได้) |
| credentials ของ Firebase/Google (`FIREBASE_TOKEN`, `GOOGLE_APPLICATION_CREDENTIALS` ฯลฯ) | **ไม่มี** (มีเฉพาะโทเค็น GitHub ของเซสชัน) และห้ามขอให้ส่งในแชท |
| `firebase.googleapis.com`, `firebasehosting.googleapis.com`, `cloudfunctions.googleapis.com` | เข้าถึงเครือข่ายได้ แต่ไม่มีสิทธิ์ล็อกอิน จึง deploy เองไม่ได้ |
| `www.gstatic.com`, `unpkg.com`, `*.web.app`, `*.cloudfunctions.net`, `*.run.app`, `console.firebase.google.com` | **ถูกบล็อก** → Code เปิดหน้าทดสอบที่ deploy แล้วด้วยเบราว์เซอร์ไม่ได้ จนกว่าเจ้าของแก้ Network access |

**ข้อสรุป:** Code deploy เองไม่ได้ จึงให้ **สคริปต์ตัวเดียวรันใน Codespace ของเจ้าของ** (ที่ล็อกอิน Firebase ได้) แทนการให้เจ้าของพิมพ์คำสั่งทีละคำสั่ง

## 2. สคริปต์ `tools/chat-live/deploy-test.sh`

รัน: `bash tools/chat-live/deploy-test.sh` (ค่าเริ่มต้นโปรเจกต์ `huahin-chat-test-01`)

ทำเองทั้งหมด (เจ้าของแค่ตอบคำถามในหน้าดำ): ตรวจล็อกอิน → ตรวจว่ามองเห็นโปรเจกต์ (เทียบ project id แบบตรงตัวจาก JSON ไม่ใช่แค่ข้อความที่ประกอบอยู่) → ตรวจ Firestore → อ่านค่า web app ที่มีอยู่แล้ว (ค่าสาธารณะ ไม่ใช่ความลับ) → build หน้าทดสอบ (ปฏิเสธถ้ามีอะไรชี้ production) → แสดงแผน → **ให้พิมพ์ `DEPLOY-TEST` ยืนยัน** → ตั้งคีย์ AI (พิมพ์ในหน้าดำเอง) → `npm ci` ใน `functions/` → deploy กฎ+index Firestore → deploy **เฉพาะ 5 ฟังก์ชัน** → deploy หน้าเว็บทดสอบ

ความปลอดภัยของสคริปต์ (ทดสอบแล้วด้วย firebase ปลอม — `tests/chat-live/deploy-script.test.js` D1–D13):
- ปฏิเสธ project id ที่ไม่ใช่ `huahin-chat-test-*` (รวม production, ตัวพิมพ์ใหญ่, ยาวเกิน, มีอักขระแปลก) ก่อนเรียก firebase แม้แต่ครั้งเดียว
- **ทุกคำสั่ง firebase ใส่ `--project huahin-chat-test-01`** ไม่พึ่งค่า default ของ `.firebaserc` (ซึ่งเป็น production); ไม่มี deploy ที่ไม่มี `--only`; id production ไม่ปรากฏในคำสั่งใด ๆ
- ไม่อ่าน/พิมพ์/ส่งต่อคีย์: ขั้นตอนคีย์คือการรัน `firebase functions:secrets:set ANTHROPIC_API_KEY` ซึ่งขอค่าในหน้าดำของ Codespace เอง
- พิมพ์ยืนยันผิด → ไม่ deploy; ไม่มีสิทธิ์เห็นโปรเจกต์ → หยุด; sdkconfig ผิด/ของโปรเจกต์อื่น → หยุด; build ปฏิเสธ → หยุด; ไม่ลบโฟลเดอร์ `build/` ของอื่น

## 3. สิ่งที่ยังไม่ได้ยืนยัน (ต้องดูผลจริงตอนรัน — Code รันกับ Firebase จริงไม่ได้)
- รูปแบบผลลัพธ์จริงของ `firebase apps:list WEB` / `apps:sdkconfig` (สคริปต์อ่านแบบหยืดหยุ่น ถ้าอ่านไม่ได้จะหยุดโดยไม่ deploy)
- การ deploy ฟังก์ชันบางตัว (`--only functions:...`) ขอ secret ของตัวอื่นหรือไม่ (ตัวที่ไม่ deploy ไม่ควรถูกขอ)
- `firebase functions:secrets:set` ต้องเปิด Secret Manager API (ปกติเปิดให้เมื่อมี Blaze) — ถ้าถูกถาม ให้ตอบตกลง
- ว่า Function รุ่น 2 ตอบที่ `https://asia-southeast1-huahin-chat-test-01.cloudfunctions.net/claudeComplete` จริง (ดู CHAT-LIVE-01-SCOPE §3.2) — ตรวจโดยทดสอบ L8 หลัง deploy
- ตัวแปร runtime ของ Cloud Functions (`FIREBASE_CONFIG`/`GCLOUD_PROJECT`) ที่ gate ใช้ตัดสินโหมด — **smoke test แรกหลัง deploy: UID ที่ยังไม่อยู่ใน `chatTestAllow` ต้องถูกปฏิเสธ** (ถ้าได้คำตอบ = หยุดทันที)
- เมื่อ spend cap 25 บาทเต็ม บริการอาจหยุดทำงาน — เป็นผลของวงเงินที่เจ้าของตั้งใจ ไม่ใช่ความผิดปกติ

## 3b. ข้อควรรู้หลัง PR #7 (Code ตรวจแล้ว)
- ต้องมี **Web app อย่างน้อย 1 ตัวในโปรเจกต์ทดสอบ** ก่อนรันสคริปต์ (Firebase Console → Project settings → Your apps → ถ้าไม่มีให้ Add app → Web) ไม่เช่นนั้นสคริปต์หยุดโดยไม่สร้างอะไร — จะแจ้งเป็นขั้นของเจ้าของเมื่อถึงเวลา
- ถ้ามี Web app หลายตัว สคริปต์ใช้ตัวแรกที่ CLI ส่งมา (ตรวจแล้วว่า config ที่อ่านเป็นของโปรเจกต์ที่ระบุตรงตัว)
- รูปแบบ `--json` จริงของ `projects:list` / `apps:list` ยังไม่ได้ยืนยันกับ Firebase จริง (ทดสอบกับ firebase ปลอมเท่านั้น) — ถ้าอ่านไม่ได้สคริปต์หยุดก่อนสร้าง/deploy อะไร

## 4. ลำดับต่อจากนี้ (เจ้าของทำทีละขั้น — Code จะบอกขั้นต่อไปเมื่อขั้นก่อนเสร็จ)
1. **ขั้นแรก (หน้าขาว GitHub):** เปิด Codespace บนกิ่ง `claude/chat-live-01`
2. รันสคริปต์ในหน้าดำของ Codespace; ล็อกอิน Firebase ตามที่สคริปต์บอก; พิมพ์ `DEPLOY-TEST`; พิมพ์คีย์ AI **ใหม่ที่ใช้เฉพาะรอบทดสอบ** ในหน้าดำเมื่อถูกถาม
3. เปิดหน้าทดสอบ → คัดลอก UID ในแถบเหลือง (Firebase Console ของโปรเจกต์ทดสอบ) → เพิ่ม `chatTestAllow/<UID>` (`enabled` = true) และ `chatTestConfig/limits` (`globalCap`, `perUidCap` เลขจำนวนเต็ม)
4. เจ้าของเพิ่มโดเมนใน Network access ของ Code (รายการโดเมนจริง: `www.gstatic.com`, `unpkg.com`, `huahin-chat-test-01.web.app`, `huahin-chat-test-01.firebaseapp.com`, `asia-southeast1-huahin-chat-test-01.cloudfunctions.net`, `*.run.app`) เพื่อให้ Code/Work ทดสอบ L1–L9 ในเบราว์เซอร์จริง
5. Code/Work ทดสอบก่อน → เจ้าของลองรอบสุดท้าย (O-1/O-2/O-3) → Work สอนใช้งานและทำคู่มือ

ไม่มีขั้นใดขอให้ส่งคีย์หรือรหัสผ่านในแชท

## Work correction of deploy script (2026-10-01)

The script requires successful JSON discovery and an existing web app; it never creates one. Project matching is exact, and SDK configuration must contain the matching projectId. Configuration is written exclusively into a private temporary directory, removed on exit. Existing files cannot be overwritten by make-config. Tests run in a disposable repository fixture and do not delete the working repository build directory.

Validation: deploy-script tests use fake Firebase and npm only. No services or credentials are used; this is not production PASS. The build/browser suite is reported separately. This correction does not authorize an unattended deployment. Work/Code must re-review the resulting commit and update the Viewer before guiding the owner through deployment.
