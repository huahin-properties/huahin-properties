# HANDOFF — อ่านไฟล์นี้ก่อนเริ่มงานในแชทใหม่
**สร้าง: 18 กันยายน 2569** · ใช้สำหรับส่งต่อสถานะเมื่อเปิดแชทใหม่ในโปรเจกต์เดิม

> ลำดับความน่าเชื่อถือของเอกสาร: **BLUEPRINT.md > ไฟล์นี้ > CLAUDE.md**
> ถ้าขัดกัน ให้เชื่อ `BLUEPRINT.md` และตรวจโค้ดจริงใน `functions/index.js` ก่อนสรุป

---

## 1. สถานะงานล่าสุด (ตามที่บันทึกไว้)

| รอบงาน | สถานะ |
|---|---|
| C0 – C3 | ปิดแล้ว · ห้ามแก้ |
| **C4.1** Reception AI persistence (`conversationStage` / `primaryIntent`) | deploy แล้ว · production ใช้งานจริง · มีชุด smoke test 5 ข้อ |
| **C4.2a** `humanHandlingStartedAt` | 🔒 **CLOSED / PRODUCTION PASS** — ห้ามแก้ซ้ำ (ดูข้อ 2) |
| **C4.2b Step 1** `createCaseFromConversation` (server callable) | โค้ดอยู่ใน `functions/index.js` แล้ว · export อยู่ใน `export-for-github/functions/index.js` · **ยังไม่มี customer-facing UI โดยเจตนา** |
| **C4.2c** canonical post-Case messaging (`addCaseMessage`) | ยังไม่เริ่ม · ห้ามเริ่มเองโดยไม่ได้รับอนุมัติ |
| **C4.3 Phase 1** Unified Draft Schema + Server Authority | deploy แล้ว · Production PASS · CLOSED (BLUEPRINT §27) |
| **C4.3 Phase 2 / 2A1** Customer Property Workspace | มติผลิตภัณฑ์ LOCKED · implement บางส่วน (`draft-completeness.js`) — ตรวจ BLUEPRINT §28 ก่อนทำต่อ |

**หมายเหตุความคลาดเคลื่อนที่ต้องตรวจ (ไม่ใช่ defect):**
`BLUEPRINT.md` ตารางบรรทัด ~1859 ยังเขียนว่า C4.2b = "ยังไม่เริ่ม" แต่โค้ด `createCaseFromConversation`
มีอยู่จริงแล้วใน `functions/index.js` — **อย่าสรุปว่ายังไม่มีโค้ด** ให้ grep โค้ดจริงก่อน แล้วขออนุมัติก่อนแก้เอกสาร

---

## 2. ข้อห้ามที่ล็อกไว้ (Locked invariants — ห้ามละเมิด)

1. **C4.2a**: เมื่อมนุษย์รับเคสแล้ว `humanHandlingStartedAt` เป็นเครื่องหมาย **ถาวร**
   - ห้ามลบเมื่อ release / unassign / reassign
   - ห้ามสร้างใหม่เมื่อ claim ซ้ำ
   - เคสที่ `assignedToUid` / `assignedToEmail` ว่าง **ไม่ได้** ทำให้ AI กลับมาตอบลูกค้าอัตโนมัติได้
   - ผ่าน production test: `own-1787743946552-u8gro` · `humanHandlingStartedAt = 1788614248803`
   - ห้ามแก้ `firebase-client.js` / `assignCase` เพื่อเรื่องนี้อีก
2. **ID เคส**: prefix `own-` เท่านั้น · ห้ามใช้ `ai-`
3. **source semantics**: `source = "owner_submission"` คงไว้เพื่อ compatibility · provenance ใช้ `caseSource = "ai_assistant"` (additive)
4. **trackToken**: ห้าม log, ห้ามเขียนลง `caseMessages` / `activityLog` · คืนค่าเฉพาะใน callable response หลังตรวจ Reception↔Case binding ทั้งสองทาง
5. **เคสสร้างใหม่**: `humanHandlingStartedAt` ต้อง **ไม่มี** ตอนสร้าง
6. **ห้ามแก้** `firestore.rules` / `storage.rules` โดยไม่ได้รับอนุมัติแยก
7. **ห้ามเริ่มเอง**: C4.2c · BUY/RENT demand Cases · Matching · Attachments · Facebook auto-post · LINE OA
8. `propertyBasics {kind, area, scale}` = gate ของ production — ห้ามเปลี่ยนความหมาย (C4.3 Phase 1 เพิ่ม `propertyFields` แบบ additive ข้างๆ)

---

## 3. รายการที่ค้าง / ยังไม่ทดสอบ

- **DEFERRED / NOT TESTABLE**: Staff (non-Owner) ปล่อยเคสที่ `listingStatus = "live"` — ปัจจุบัน production ไม่มีเคส live เลย (มีแต่ `pending`) · **ห้ามสร้างหรือแก้เคสเพื่อปลอมเงื่อนไข live** · รอเคส live จริง
- AI-generated photo captions / SEO keywords ยังไม่ถูกต่อเข้า `<img alt>` จริงบนเว็บสาธารณะ (BLUEPRINT §24.8)
- `Agent Signup.dc.html` ช่องรหัสผ่านใช้ `type="text"` (เห็นรหัสเป็นตัวอักษร) — ยังไม่ยืนยันว่าตั้งใจหรือเป็น bug
- ยังไม่มีเพดานค่าใช้จ่าย / rate limit ของ Anthropic API
- Google Maps POI auto-calc ใน AI Quick Add ทำงานไม่สม่ำเสมอ — ต้อง re-verify

---

## 4. ขั้นตอน deploy (เจ้าของทำเองไม่ได้ผ่าน CLI เครื่องตัวเอง)

1. ผมเตรียมไฟล์ลง `export-for-github/` แล้วให้ดาวน์โหลด
2. เจ้าของอัปโหลดไฟล์ผ่าน **หน้าเว็บ GitHub** (Add file → Upload files) — ไม่ใช้ git command
3. ไฟล์เว็บ static ขึ้นอัตโนมัติ
4. ถ้าแก้ `functions/index.js` ต้องเปิด **GitHub Codespace** แล้วรัน:
   ```
   firebase deploy --only functions:receptionTurn,functions:createCaseFromConversation
   ```
5. **ลำดับทดสอบหลัง deploy**: รัน C4.1 smoke test ทั้ง 5 ข้อก่อน → ผ่านครบ 5 ข้อเท่านั้น จึงทดสอบ C4.2b Step 1

---

## 5. วิธีทำงานกับเจ้าของโปรเจกต์

- สื่อสารภาษาไทย · เจ้าของไม่เขียนโค้ด · ระบุชัดว่าคำสั่งอยู่ "จอไหน" (แท็บ GitHub / Codespace terminal / Firebase console)
- อธิบายก่อนลงมือ · ขออนุมัติ scope ก่อนแก้ของใหญ่ · เจ้าของมักสั่งว่า "อธิบายก่อน ยังไม่ต้องเขียนโค้ด"
- ใช้การแก้แบบเจาะจงเสมอ (targeted edit) ห้าม rewrite ไฟล์ทั้งไฟล์
- ทุกครั้งที่แก้โค้ด ต้อง export ลง `export-for-github/` แล้วส่งให้ดาวน์โหลด

---

## 6. พื้นที่โปรเจกต์ (18 ก.ย. 2569)

เคยขึ้นป๊อปอัพแดง *"This project is too large to save"* → ได้ลบสำเนาส่งออกรุ่นเก่าออกแล้ว
(`export-C0.5*`, `export-C1`, `export-C2`, `export-C3.*`, `export-C4-blueprint`, `export-C4.1-upload`,
`export-C4.2a-upload`, `export-for-github-latest`, `export-for-github-v10`, `upload-now`,
`upload-chat-identity`, `deliver-2A1/*.zip`, `screenshots/`)

**เก็บไว้**: `export-for-github/` (ล่าสุด) · `export-C4.3-2A1-upload/` · `deliver-2A1/` (ไฟล์เอกสาร)
**กติกาใหม่**: ห้ามสร้างโฟลเดอร์ export ใหม่ต่อรอบงาน — ให้เขียนทับ `export-for-github/` เท่านั้น

---

## 🔒 STANDARD DELIVERY WORKFLOW (ล็อก 18 ก.ย. 2569)
วิธีส่งมอบงานของโปรเจกต์นี้ถูกล็อกเป็นมาตรฐานแล้ว — **อ่าน BLUEPRINT.md §29 ก่อนส่งมอบไฟล์ใด ๆ**
สรุปสั้น: GitHub = single source of truth · ทุกไฟล์ที่ต้องขึ้น GitHub ส่งผ่านหน้า Viewer (`Copy Code to GitHub.dc.html`) ทีละการ์ด/ทีละไฟล์ พร้อม path + commit message + กล่องโค้ดที่ “เลือกโค้ดทั้งหมด → Ctrl + C” · ไม่ใช้ดาวน์โหลด ZIP/.js เป็นค่าเริ่มต้น (Defender บล็อก) · แชทบอกทีละขั้น · deploy หลัง commit ครบ และต้องระบุ scope ก่อน · ห้ามเปลี่ยน workflow เอง

**สถานะ**: ไฟล์ทั้ง 4 commit ขึ้น main แล้ว · **§28.1 Phase 2A-1 DEPLOY สำเร็จ 18 ก.ย. 2569 ~05:20** (`receptionTurn` + `updatePropertyDraft` — Successful update operation ทั้งคู่, Deploy complete! ไม่มี error) · ยังไม่มี UI ในเฟสนี้ตามเจตนา · **Phase 2A-2 ยังไม่เริ่ม รอมติ**
**บังคับก่อน deploy ทุกรอบ**: `git pull` ใน Codespace ก่อน (Codespace ที่ใช้เป็นตัวเก่า ถ้าไม่ pull จะ deploy โค้ดเก่า)
**ขอบเขต deploy ของ §28.1 Phase 2A-1**: `firebase deploy --only functions:receptionTurn,functions:updatePropertyDraft` เท่านั้น
