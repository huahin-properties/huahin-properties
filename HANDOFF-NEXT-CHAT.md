# HANDOFF — อ่านไฟล์นี้ก่อนเริ่มงานในแชทใหม่

> ## ⛳ สถานะล่าสุด ณ 21 กันยายน 2569 (อ่านบล็อกนี้ก่อน ที่เหลือคือประวัติ)
>
> | รายการ | สถานะ |
> |---|---|
> | เว็บไซต์ | 🔴 **RED / Public Hidden** (โหมดปิดปรับปรุง) |
> | PENDING #6 | CLOSED / PRODUCTION PASS |
> | PENDING #7 | CLOSED / PRODUCTION PASS |
> | PENDING #8 | CLOSED / PRODUCTION PASS |
> | PENDING #9 | ✅ **CLOSED / PRODUCTION PASS** (21 ก.ย. 2569) |
> | PENDING #10 | **OPEN / NOT FIXED** — ห้ามแก้ปนกับงานอื่น |
> | PENDING #11 | CLOSED / PRODUCTION PASS |
> | PENDING #12 | 🆕 **OPEN / NOT FIXED** — `CHAT_I18N` ขาดคีย์ ~23 คีย์ต่อภาษาใน ru/zh/de/no/fr/it (BLUEPRINT §35.29) |
> | PENDING #13 | 🆕 **OPEN / NOT FIXED** — ภาษาไม่ถูกส่งต่อไปหน้า `Owner Submission.dc.html` (BLUEPRINT §35.32) |
> | R7-3 | **NOT TESTABLE** — ยังไม่มีทรัพย์เผยแพร่จริง · **ห้ามสร้างทรัพย์เพื่อให้ test ผ่าน** |
> | Phase 2A-4 | **NOT STARTED** |
> | Phase 2B | **NOT STARTED** |
>
> **สิ่งที่เพิ่งจบ (21 ก.ย. 2569) — PENDING #9 = CLOSED / PRODUCTION PASS**
> อาการ: ปุ่มในแชทแสดง "List property" ภาษาอังกฤษขณะคุยภาษาไทย
> ROOT CAUSE (จาก source จริง): คีย์ `chat_list_property` ถูกใช้ที่เดียวคือ
> `ContactRail.dc.html` บรรทัด 1591 แต่ **ไม่มีในพจนานุกรม `CHAT_I18N` เลยแม้แต่ภาษาเดียว
> ทั้ง 8 ภาษา** จึงตกไปใช้ค่าสำรอง hardcode `|| "List property"` เสมอ (ที่ EN ดูถูกเป็นเรื่องบังเอิญ)
> MINIMAL FIX: เติมคีย์ `chat_list_property` ใน `CHAT_I18N` **ครบ 8 ภาษา จุดเดียว ไฟล์เดียว**
> (en: List property · th: ฝากขาย / ฝากเช่าทรัพย์ · ru: Разместить объект · zh: 发布房源 ·
> de: Immobilie inserieren · no: Legg ut eiendom · fr: Publier votre bien · it: Pubblica il tuo immobile)
> **ไม่แตะ logic แม้บรรทัดเดียว** — ไม่แตะ `_extractLinks()` · regex LIST_PROPERTY ·
> `primaryIntent` · navigation · Case logic · functions · firestore.rules
> คงค่าสำรอง `t.chat_list_property || "List property"` ไว้ตามเดิม
>
> **ผลทดสอบโปรดักชัน (หน้าต่าง Incognito · 🔴→🟢→TEST→🔴)**
> TH → "ฝากขาย / ฝากเช่าทรัพย์" ✅ · EN → "List property" ✅ (เหมือนเดิม ไม่ถดถอย) ·
> DE → "Immobilie inserieren" ✅ · FR → "Publier votre bien" ✅ ·
> กดปุ่มแล้วไป `Owner Submission.dc.html` จริง ไม่สร้าง Case ไม่เขียน Firestore ✅ ·
> ปิดเว็บกลับ 🔴 แดงแล้ว ✅ — รายละเอียดเต็ม BLUEPRINT §35.33
> หมายเหตุ: ป้ายปุ่มในประวัติแชทเก่าคงภาษาเดิมตอนที่ตอบ = พฤติกรรมถูกต้อง ไม่ใช่ข้อบกพร่อง
>
> **ขึ้น GitHub main แล้วในรอบนี้**: `ContactRail.dc.html` (คีย์ 8 ภาษา) ·
> `BLUEPRINT.md` (§35.27–§35.33 · 3709 บรรทัด 525 KB ยืนยันครบไฟล์)
> **ไม่มี Functions deploy ในรอบนี้เลย** — แก้เฉพาะไฟล์ฝั่ง client
>
> **Viewer ไม่ใช่ไฟล์ส่งมอบ GitHub**: `Copy Code to GitHub.dc.html` เป็น Operational Viewer
> ภายใน Claude Project **ไม่ได้อยู่ใน GitHub repository** · ห้ามตั้ง delivery step ให้เจ้าของ
> commit ไฟล์นี้ (ขั้น 88 ของรอบนี้ = **CANCELLED / NOT REQUIRED** เพราะตั้ง delivery step ผิด
> ไม่ใช่งานที่ค้าง) · ถ้าแก้ Viewer แล้ว ให้จบในโปรเจกต์เท่านั้น
>
> **ทางแก้เดิมที่ยังต้องรู้ (จากรอบ 20 ก.ย.)**: ปุ่ม List property มาจาก
> `data.meta.primaryIntent` ที่เซิร์ฟเวอร์จำแนกเป็น enum (SELL / RENT_OUT เท่านั้นที่สร้างปุ่ม)
> — BLUEPRINT §35.24–§35.26 · โทเคนและ regex เดิมยังอยู่ครบ
>
> **ลำดับความน่าเชื่อถือของเอกสาร**: BLUEPRINT.md > HANDOFF-NEXT-CHAT.md > CLAUDE.md
>
> **กติกาที่ล็อกไว้ ห้ามฝ่าฝืน**
> 1. ห้ามแก้ source โดยไม่ได้รับอนุมัติจากเจ้าของก่อน — เสนอขอบเขตแล้วรอคำว่า "อนุมัติ"
> 2. ห้าม deploy จนกว่าจะระบุ scope ชัดและได้รับอนุมัติ (เช่น `--only functions:receptionTurn`)
> 3. เปิดเว็บเป็นสีเขียวได้เฉพาะตอนทดสอบ และ **ต้องปิดกลับแดงทันทีที่เสร็จ** (กฎ §29.4)
> 4. ส่งไฟล์ทุกไฟล์ผ่าน Viewer `Copy Code to GitHub.dc.html` เท่านั้น — ห้ามให้ดาวน์โหลด
>    .zip/.js (Windows Defender ของเจ้าของบล็อก) · **แก้ไฟล์ในโปรเจกต์ ≠ ส่งมอบ**
> 5. Viewer ต้องมีงานให้เจ้าของทำ **ครั้งละหนึ่งขั้นเท่านั้น** และต้องอัปเดตทันทีที่สถานะเปลี่ยน
>    ก่อนพาเจ้าของไปขั้นถัดไป (§33.15) · ทุกขั้นต้องมี CURRENT · CLAUDE ทำอะไร ·
>    YOU DO NOW (หนึ่ง action) · PASS WHEN · NEXT
> 6. พบปัญหาใหม่ระหว่างทดสอบ → บันทึกเป็น PENDING ใหม่ **ห้ามแก้ปน** (§33.13)
> 7. ถ้าข้อทดสอบใดไม่ผ่าน → **หยุดทันที** รายงาน ไม่ทดสอบข้อถัดไป
> 8. ก่อนให้เจ้าของก็อปไฟล์จาก Viewer ต้องตรวจว่ากล่องโค้ดขึ้นต้นตรงกับบรรทัดแรกจริงของไฟล์
>    และขนาดใกล้เคียงไฟล์จริง (BLUEPRINT §35.30 — เคยเกือบทำให้ BLUEPRINT ถูกตัดทิ้งบน main)
>
> **งานที่เจ้าของยังไม่ได้เลือกสำหรับรอบถัดไป**: PENDING #10 · PENDING #12 · PENDING #13 ·
> Phase 2A-4 — **ห้ามเริ่มเอง** ต้องรอเจ้าของสั่ง

**สร้าง: 18 กันยายน 2569** · ใช้สำหรับส่งต่อสถานะเมื่อเปิดแชทใหม่ในโปรเจกต์เดิม

> ลำดับความน่าเชื่อถือของเอกสาร: **BLUEPRINT.md > ไฟล์นี้ > CLAUDE.md**
> ถ้าขัดกัน ให้เชื่อ `BLUEPRINT.md` และตรวจโค้ดจริงใน `functions/index.js` ก่อนสรุป

---

## 0.00 รอบล่าสุด — **PENDING #8 และ PENDING #6 = CLOSED / PRODUCTION PASS** (20 กันยายน 2569)

**PENDING #8** (ค้าง 88% แม้ตอบโฉนดชัดเจน) — audit จาก rxLog โปรดักชันจริง (§35.14):
เทิร์น `rid f98b22069c47` มี `statedKeys: ["titleDeed"]` · `pfKeys` **ไม่มี `ownership`** ·
`unclearKeys: []` · `derivedUnclearKeys: []` · ไม่มี `draft_updated`/`draft_error`
→ **ROOT CAUSE**: โมเดลส่งคำตอบลงช่อง `titleDeed` แต่ evaluator นับช่อง `ownership`
และสะพานใน `normalisePropertyFields()` เป็นทางเดียว (ownership → titleDeed)

**FIX OPTION A** (§35.15) — แก้ `functions/index.js` ไฟล์เดียว ฟังก์ชันเดียว: เพิ่มสะพาน
**ขากลับ titleDeed → ownership** · additive · ไม่ทับค่าที่โมเดลส่งเอง · ยกเว้น `unknown` ·
ไม่แตะ draft-completeness.js / สูตร / schema / validateDraftField / prompt / UI / rules
· deploy แคบ `--only functions:receptionTurn` (สำเร็จ ไม่มี error)

**ผลทดสอบ (§35.16) — R8-1 ถึง R8-5 PASS ครบ**: โฉนด → 100% · น.ส.3 ก map ถูก ไม่กลายเป็น
โฉนด · กำกวมไม่ถูกเดา (ค้าง 88%) · #6 ไม่ถดถอย + F5 คงค่า · 100% ไม่สร้าง Property / Case /
คิวอนุมัติ / ประกาศ (Firestore ไม่มีเอกสารใหม่ · Listing Approvals ทั้งหมด 8 เท่าเดิม)

**ปิดได้ทั้งสองรายการ**: PENDING #8 = CLOSED · **PENDING #6 = CLOSED** (R4 ทำได้แล้วเมื่อตัวบล็อกถูกปลด)

**🔴 ยังเปิดอยู่: PENDING #7** — AI อ้างถึง “ปุ่มด้านล่าง” ที่ยังไม่ปรากฏบนหน้าจอ (§35.12)
พบซ้ำ 2 ครั้งในรอบนี้ · เป็นปัญหาถ้อยคำของ prompt · **ยังไม่แก้ รอเจ้าของสั่งเป็นรอบงานแยก**

**เว็บ**: ปิดกลับ 🔴 Maintenance แล้วตามกฎ §29.4 · **Phase 2A-4 / 2B = ยังห้ามเริ่ม**

---

## 0. รอบก่อนหน้า — **PHASE 2A-2 = CLOSED / PRODUCTION PASS** (19 กันยายน 2569)

**TEST 10.4 = PASS** (§35.8) — ทดสอบครบ 4 จังหวะในกรอบ §29.4 มีภาพหน้าจอยืนยันทุกจังหวะ:
แถบขึ้น 100% จริง · `properties` ไม่มีเอกสารใหม่ · Listing Approvals ยังเป็น 7 รายการ ·
เว็บปิดกลับ Maintenance RED แล้ว
**GUARANTEE ที่พิสูจน์แล้ว:** ถึง 100% แล้วระบบ **ไม่สร้าง** Property / Case / คิวอนุมัติ /
ประกาศ โดยอัตโนมัติ

**PHASE 2A-2 = CLOSED / PRODUCTION PASS** (§35.9) — เงื่อนไขครบ 6 ข้อ

**🔴 PENDING #6 = DISCOVERED / NOT FIXED** (§35.7) — ระหว่างทดสอบ แถบขึ้น 38% แล้วตกเป็น 0%
ก่อนไต่ขึ้นใหม่จนถึง 100% · ข้อมูลไม่หาย (AI ยังสรุปครบ) จึงเป็นอาการชั้นแสดงผล ·
**ห้ามแก้รวมกับการปิด Phase 2A-2 · รอเจ้าของสั่งเป็นรอบงานแยก**

**ห้ามเริ่ม Phase 2A-4 / 2B จนเจ้าของอนุมัติขั้นถัดไป**

---

## 0.05 Product Review ที่ปิดในรอบเดียวกัน (19 กันยายน 2569)

**Anthropic API credit = RESTORED — ไม่ใช่ blocker อีกต่อไป** (ข้อความเก่าที่เขียนว่า “รอเติมเครดิต” ยกเลิก)

**PRODUCT REVIEW = CLOSED** — บันทึกเต็มใน BLUEPRINT **§35**
- **P-1 Commercial** = แนวทาง C · completeness แยกตาม `commercialSubtype` · matrix 6 subtype
  (shophouse 8 · retail 7 · office 7 · warehouse 8 · hotel_resort 8 · other 7) ·
  `other` ห้ามต่ำกว่า 7 · ไม่เลือก subtype = ไปไม่ถึง 100%
  · **Q-1** parking ของพาณิชย์ = Conditional ตาม subtype (§32.1 ข้อ 11 ใช้กับ Residential)
  · **Q-2** frontage / ไฟ 3 เฟส = Phase 2A-4 Schema Work ยังไม่เข้าตัวหาร
  · **Q-3** จำนวนคูหา = Schema Review candidate ห้ามถือเป็น requirement
- **P-2 House / Pool Villa** = ทางที่สาม · **ในโครงการ 15 · นอกโครงการ 17**
  (+`utilities` +`roadWidth`) · `projectStatus` ไม่ทราบ = unanswered **ห้ามเดา**
- **P-3 Photos** = แนวทาง B · **รูปไม่เข้า denominator ของ Information Completeness** ·
  แสดง Photo Readiness แยกเป็น x/y ตาม PHOTO STANDARD v1 ·
  ข้อมูลครบแต่ไม่มีรูป = “ข้อมูลทรัพย์สิน 100%” + “รูป 0/6”
  · **CLARIFICATION ถาวร (§35.4)**: §31.1(9) และ §32.1(9) ห้ามถูกอ่านว่ารูปต้องเข้า denominator

**สถานะการนำไปใช้: DESIGN STANDARD สำหรับ Phase 2A-4 เท่านั้น — ยังไม่ implement · ไม่แก้ source · ไม่ deploy**

**Consistency audit (§35.5)**: ไม่พบข้อขัดแย้งที่ค้าง · 3 จุดถ้อยคำเก่าถูกแก้ด้วย clarification
(§31.1 ข้อ 9 · §32.1 ข้อ 9 · §32.1 ข้อ 11) โดยไม่ลบข้อความเดิม

**งานถัดไป — Final Re-test 10.4 เฉพาะ 2 ข้อ** (ยืนยันแล้วว่าทำได้ทันทีโดยไม่ต้อง implement ก่อน
เพราะ 10.4 พิสูจน์ guarantee ของ pipeline ไม่ใช่สูตร):
(ข) Firestore `properties` ไม่มีเอกสารใหม่ · (ค) Listing Approvals ไม่มีคิวใหม่ ·
ห้ามทำซ้ำ 10.1 / 10.2 / 10.3 / 10.4(ก) ที่มีหลักฐาน PASS แล้ว · กรอบ §29.4 เปิดเขียว → ทดสอบ → ปิดแดง

**Phase 2A-4 / 2B = ยังห้ามเริ่ม**

---

## 0.1 รอบก่อนหน้า — Phase 2A-3 ปิดรอบแล้ว (19 กันยายน 2569)

| ข้อทดสอบ | ผล |
|---|---|
| 23.1 regression (7 ทรัพย์โหลดครบ) | PASS |
| 23.2 ฟิลด์ใหม่ + กฎซ่อน/แสดง | PASS |
| 23.3 prefill converter (สระว่ายน้ำส่วนตัว → “มีสระว่ายน้ำ”) | PASS |
| 23.4 customer flow | **FAIL** — ดู PENDING #4 |
| 23-UX ปุ่มกลับหน้ารายการทรัพย์ | DONE · commit ขึ้น GitHub แล้ว |

**23-UX ที่แก้ไปแล้วใน `Lister Dashboard.dc.html`** (3 จุด ใช้ navigation เดิม ไม่สร้างระบบใหม่):
1. ปุ่มใหญ่ “← กลับไปหน้ารายการทรัพย์” วางใต้ “สวัสดีคุณ / อีเมล” แสดงเฉพาะเมื่อ `showEdit` (ลิงก์เล็กเดิมในกรอบฟอร์มยังอยู่)
2. `clearEditParams()` + `goBackToList()` ล้าง `?edit=` / `?from=` ด้วย `replaceState` และตั้ง `dashTab: "list"` — ไม่เรียก `history.back()` เมื่อมาจาก deep link
3. `onSetListTab` เรียก `goBackToList()` เมื่อ `view === "edit"`

**test fixture:** `HH-80774` (พูลวิลล่า 1,000,000 บาท ไม่มีรูป) — เปิด public ชั่วคราวเพื่อทดสอบ 23.4 แล้ว **คืนสถานะครบแล้ว**: ทรัพย์ = ปิดชั่วคราว · เว็บ = โหมดปิดปรับปรุง RED · ยืนยันจาก Incognito ว่าเห็นแต่หน้า “กำลังปรับปรุงเว็บไซต์”

### PENDING ISSUES — บันทึกไว้ ยังไม่แก้ (ห้ามแก้โดยไม่ได้รับอนุมัติ)

**เคลียร์แล้ว:** #4 (หน้ารายละเอียดพังเมื่อไม่มีรูป) · #3 (`[object Object]`) · #1 (ค่า default ฟอร์มใหม่)
ทั้งสาม PRODUCTION PASS และขึ้น GitHub แล้ว — ดู BLUEPRINT §33.9 / §33.10 / §33.11

**#2 — popup multi-select ไม่ปิดเมื่อคลิกนอกกรอบ:** แก้แล้ว (LD-46, Actions #722)
TEST-2/3/4 PASS · เหลือ regression ขั้นสุดท้าย + ส่ง BLUEPRINT ขึ้น GitHub

**#5 — Purchase/Installment Multi-select Summary Inconsistency — ปิดแล้ว PRODUCTION PASS**
แก้ `purchaseSummary` ให้แสดงชื่อค่าจริงคั่นด้วยลูกน้ำ (LD-47, Actions #725) — ดู BLUEPRINT §33.14
**หนี้ PENDING #1–#5 จาก Phase 2A-3 เคลียร์หมดแล้ว**

**กฎถาวรเพิ่ม (BLUEPRINT §33.15) — VIEWER / CURRENT-WORK-ONLY RULE:** Viewer คือ operational
dashboard ไม่ใช่คลังประวัติ · ต้องอัปเดตทันทีทุกครั้งที่สถานะเปลี่ยน โดยไม่ต้องให้เจ้าของเตือน ·
แสดงเฉพาะ CURRENT / YOU DO NOW / PASS WHEN / NEXT 1 งาน · งานที่ปิดแล้วนำออกจากหน้าจอ
(ซ่อน presentation เท่านั้น ห้ามลบประวัติจริง) · ห้ามลบ issue ที่ยัง OPEN เพียงเพื่อให้ Viewer สั้นลง

**กฎถาวร ISSUE CAPTURE RULE** (BLUEPRINT §33.13): พบปัญหาใหม่ระหว่างทดสอบ แม้นอก scope
ต้องตั้งหมายเลข PENDING และบันทึกลง BLUEPRINT + HANDOFF ก่อนปิดรอบ ห้ามเก็บไว้ในแชท

### PENDING ISSUES (บันทึกเดิม 19 ก.ย. เช้า)
1. ฟอร์ม “เพิ่มทรัพย์ใหม่” มีค่า default ติดมาก่อน (ประเภท = พูลวิลล่า, โซน = หัวหิน, ตำบล = หัวหิน, สภาพ = มือสองในโครงการ) ขัดหลัก “ไม่ตอบ = ไม่เลือก” และจะทำให้สูตร completeness เพี้ยน
2. popup “ประเภทครัว” ไม่ปิดเมื่อคลิกนอกกรอบ (workaround: ไปแตะฟิลด์อื่น)
3. รายการทรัพย์ใน Lister Dashboard แสดงชื่อทำเลเป็น `[object Object], หัวหิน` — ค่าที่ควรเป็น string กลับเป็น object
4. 🔴 **รุนแรงที่สุด** — `Property Details.dc.html` พังทั้งหน้าฝั่งลูกค้าเมื่อทรัพย์ไม่มีรูป: `Property Details.renderVals(): Cannot read properties of undefined (reading 'url')` (อ่าน `.url` ของรูปแรกโดยไม่กันค่าว่าง) · **ควรแก้ก่อนเปิดเว็บสาธารณะ**

**ห้ามเริ่ม Phase 2A-4** จนกว่าเจ้าของสั่ง

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

---

## ✅ C4.3 Phase 2A-1 = PRODUCTION PASS (18 ก.ย. 2569)
ทดสอบบนโปรดักชันจริงครบ 10 ขั้น ผ่านทั้งหมด — รายละเอียดเต็มใน **BLUEPRINT.md §29.3**
สรุป: HOUSE/TOWNHOUSE = 8 ฟิลด์ · CONDO = 7 (มี floor ไม่มี landSize/ownership) · LAND = 5 · COMMERCIAL = 3 · ค่ากำกวมไม่ถูกนับ (percent 88 ไม่แตะ 100) · ยืนยันแล้ว percent ขยับเป็น 100 · optional fields ไม่กระทบ · **100% ไม่สร้าง Case / คิวอนุมัติ / ประกาศใด ๆ** (Firestore + Listing Approvals ยืนยันแล้ว)

**ข้อควรรู้สำหรับแชทใหม่**: `draftCompleteness` ยังไม่มี UI ตามเจตนา ตรวจได้ทาง DevTools เท่านั้น · ทดสอบลูกค้าใหม่ต้องปิด Incognito ทุกบานก่อน · ระหว่างทดสอบต้องปิดโหมดปรับปรุงเว็บ และเปิดกลับหลังเสร็จ
**ยังไม่เริ่ม / ห้ามเริ่มเอง**: Phase 2A-2 · C4.2c `addCaseMessage` · การแก้ source เพิ่ม

## 🔒 MAINTENANCE / PUBLIC TEST MODE (ล็อก 18 ก.ย. 2569) — BLUEPRINT §29.4
สีแดง = ปกติระหว่างพัฒนา · ก่อน Production Test ที่ต้องเข้าเว็บแบบลูกค้าทั่วไป **ต้องมีขั้นเปิดเป็นสีเขียว** และหลังทดสอบ **ต้องมีขั้นปิดกลับเป็นสีแดง** เป็น Step จริงใน Viewer · Claude เตือนทั้งสองจังหวะ (OPEN → TEST → CLOSE) · ถ้า production test ผิดปกติ ตรวจ public/maintenance state ก่อนวิเคราะห์โค้ด

## ✅ C4.3 Phase 2A-2 — ส่งขึ้นโปรดักชันแล้ว (ผลทดสอบเต็มใน BLUEPRINT §29.6)
แถบ “ข้อมูลทรัพย์สินของคุณ XX%” ใช้งานจริงบนเว็บแล้ว · ทดสอบผ่าน 10.1–10.3 (รวมข้อสำคัญ: รีเฟรชแล้วแถบยังถูกต้องผ่าน `getPropertyDraft`) · ข้อ 10.4 (100% ไม่สร้าง Case) **BLOCKED เพราะเครดิต Anthropic API หมด** ไม่ใช่ข้อบกพร่องของโค้ด — เติมเครดิตแล้วทดสอบข้อนี้ให้จบก่อนเริ่ม Phase 2B
**ดู log 2nd Gen ต้องใช้**: `resource.type="cloud_run_revision" resource.labels.service_name="receptionturn"` + All severities
**งานค้าง**: เติมเครดิต Anthropic · อัปเกรด Node.js 20 ก่อน 30 ต.ค. 2569

### รายละเอียดขอบเขตเดิม (BLUEPRINT §29.5)
เพิ่ม callable อ่านอย่างเดียว `getPropertyDraft` (ใช้ evaluator เดิม) + แถบ Progress ในแชท · ไฟล์ที่แก้: `functions/index.js`, `firebase-client.js`, `ContactRail.dc.html` · deploy แคบ `--only functions:getPropertyDraft` · เบราว์เซอร์ห้ามคำนวณ percent · ไม่แก้ rules · ไม่เริ่ม 2B/2C/2D


---

## รอบ 20 ก.ย. 2569 (ต่อ) — PENDING #7 ยังไม่ปิด · PENDING #11 เกิดใหม่

**เว็บไซต์ = 🔴 RED / Public Hidden** · ยังไม่ deploy อะไรในรอบนี้

### สถานะ PENDING
| # | สถานะ | สรุป |
|---|---|---|
| #6 | CLOSED / PRODUCTION PASS | — |
| #7 | **PARTIALLY FIXED / NOT CLOSED** | อาการ "AI อ้างถึงปุ่มที่ไม่มี" ผ่านแล้ว แต่ยังไม่ปิดจนกว่าเอกสารจะแยก boundary กับ #11 ชัด |
| #8 | CLOSED / PRODUCTION PASS | — |
| #9 | OPEN / NOT FIXED | ห้ามแก้ปน |
| #10 | OPEN / NOT FIXED | ห้ามแก้ปน |
| #11 | **DISCOVERED / NOT FIXED** | LIST_PROPERTY token emission is not deterministic |

### สิ่งที่ commit ขึ้น main แล้วในรอบนี้
`ContactRail.dc.html` — LIST_PROPERTY regex ใน `_extractLinks()` (บรรทัด ~1584)
เพิ่มแบบ additive สองครั้ง: วลีอังกฤษ 3 แบบ และคำไทย 3 คำ · **ไม่ deploy**
(ไฟล์นี้เป็น client ไม่ต้อง deploy functions)

### ผลสำคัญ
- B1/B2/B3 PASS · B4 และ C1 ปุ่มไม่ขึ้น
- `_extractLinks()` เห็นเฉพาะ **ข้อความที่ AI ตอบ** ไม่เห็นข้อความลูกค้า
  → การเติมคำใน regex คือการเดาคำของโมเดล ไม่ใช่ทางออกเชิงระบบ
- AUDIT #11 พบว่า **มี structured signal อยู่แล้ว**: `data.meta.primaryIntent`
  (enum SELL / RENT_OUT / …) ส่งถึง client แล้ว แต่ใช้แค่เขียน log

### งานค้าง — รอเจ้าของเลือก (ห้ามเริ่มเอง)
1. เลือกแนวทางแก้ #11 (แนะนำ: ใช้ `meta.primaryIntent` แทนการเดาคำ — BLUEPRINT §35.25)
2. #7 ปิดได้เมื่อ boundary กับ #11 ชัดในเอกสาร
3. Phase 2A-4 / 2B = NOT STARTED

### ข้อห้ามที่ล็อกไว้
ห้ามแก้ source โดยไม่ได้รับอนุมัติ · ห้าม deploy · ห้ามเปิดเว็บเขียวค้าง ·
ห้ามแก้ #9 / #10 ปน · ห้ามสร้างทรัพย์เพื่อให้ R7-3 ผ่าน · ห้ามเริ่ม Phase 2A-4 / 2B


---

## ปิดรอบ 20 ก.ย. 2569 — PENDING #7 + #11 CLOSED

**เว็บไซต์ = 🔴 RED / Public Hidden** · ไม่ได้ deploy functions ในรอบนี้เลย

| # | สถานะ |
|---|---|
| #6 | CLOSED / PRODUCTION PASS |
| #7 | **CLOSED / PRODUCTION PASS** |
| #8 | CLOSED / PRODUCTION PASS |
| #9 | OPEN / NOT FIXED |
| #10 | OPEN / NOT FIXED |
| #11 | **CLOSED / PRODUCTION PASS** |

### สรุปการแก้
`ContactRail.dc.html` — 3 รอบ additive:
prompt (กฎ ON-SCREEN ELEMENTS ทุกภาษา) → regex เพิ่มวลี EN/TH → **`meta.primaryIntent`**
รอบสุดท้ายคือรอบที่แก้ตรงเหตุ: ปุ่มมาจากค่าเจตนาที่เซิร์ฟเวอร์จำแนก ไม่ใช่ถ้อยคำที่โมเดลเลือก

### Regression D1–D8 = PASS ครบ (BLUEPRINT §35.26)
มีปุ่ม: ไทย SELL · อังกฤษ SELL · RENT_OUT · ไม่มีปุ่ม: BUY · RENT · ราคาตลาด ·
ปุ่มใบเดียวไม่ซ้อน · ไม่อ้างถึง UI ที่ไม่มี

### งานค้างรอบถัดไป (ห้ามเริ่มเอง)
1. PENDING #9 / #10 — ยังไม่แตะ
2. R7-3 — NOT TESTABLE จนกว่าจะมีทรัพย์เผยแพร่จริง (ห้ามสร้างเพื่อให้ผ่าน)
3. Phase 2A-4 / 2B — NOT STARTED
