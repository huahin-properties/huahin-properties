# ชุดส่งต่อโครงการ — สถานะปัจจุบัน (อ่านก่อนประวัติ)

**รุ่นหลัก: HP-HANDOFF-2026-10-03-v2 · 3 ตุลาคม 2569 · Asia/Bangkok**

- **สถานะปัจจุบัน (r9f):** source/code head `958c8770fed6bdd0265239cf030c3a43a2505dc3` · **Cloud TEST deployed `958c8770fed6bdd0265239cf030c3a43a2505dc3`** · เอกสาร/build base ที่ Work ตรวจ `a99aafdd07b473776db810ffdc9b46ea38c4e004` · production deployed ไม่ทราบ (RED) · D2 บน Cloud TEST: Owner preview / เผยแพร่ (Owner) / ไทย / จีน ถูกต้อง; ล้างค่าที่ดิน, อีก 6 ภาษา และบันทึกซ้ำไม่แปลงซ้ำ ยังไม่ครบบน Cloud · T12 คงสถานะเดิม (รอ Work) · D08 FAIL · combined UNVERIFIED · ดูบล็อก "ผลปรับรอบ r9f" ท้ายเอกสาร; บรรทัด r9e ด้านล่างเป็น **ประวัติ**
- [ประวัติ r9e] **สถานะ ณ r9e:** source/code head `958c8770fed6bdd0265239cf030c3a43a2505dc3` · **Cloud TEST deployed `958c8770fed6bdd0265239cf030c3a43a2505dc3`** (เจ้าของ deploy สำเร็จ — แก้จาก `2c89759` ที่เคยระบุ) · เอกสาร/build base ที่ Work ตรวจ `d293f8d5c01d5a123a6be9ddb13b478180187137` · production deployed ไม่ทราบ (RED) · หลักฐาน Cloud TEST ของ D2 (HH-24379): Owner preview / เผยแพร่ / ไทย / จีน ถูกต้อง — แยกจาก LOCAL; ล้างค่าที่ดินและครบ 8 ภาษา **ยังไม่ทดสอบบน Cloud** · T12 ยังไม่เปลี่ยน (รอ Work) · D08 FAIL · combined UNVERIFIED · ดูบล็อก "ผลปรับรอบ r9e" ท้ายเอกสาร; บรรทัด r9d ด้านล่างเป็น **ประวัติ**
- [ประวัติ r9d — Cloud TEST ที่ระบุตรงนี้ผิด แก้แล้วใน r9e] **สถานะ ณ r9d:** source/code head `958c8770fed6bdd0265239cf030c3a43a2505dc3` (ไม่เปลี่ยน) · เอกสาร/build base ที่ Work ตรวจ `0490b4a30c1913b8f44dba1f441593487bdddf69` · **Cloud TEST deployed ยังเป็น `2c897593321713783d0ba81c7167962e1793be9a`** (ไม่มี D2) · production deployed ไม่ทราบ (RED) · รอบนี้: ตรวจกลไกแปลเดิม 8 ภาษา (รายงานเท่านั้น) · D2 ผ่านเฉพาะ LOCAL · T12 FAIL · D08 FAIL · combined UNVERIFIED · ดูบล็อก "ผลปรับรอบ r9d" ท้ายเอกสาร; บรรทัด r9c ด้านล่างเป็น **ประวัติ**
- [ประวัติ r9c] **สถานะ ณ r9c:** source/code head `958c8770fed6bdd0265239cf030c3a43a2505dc3` (Work ตรวจ diff แล้ว; รอบนี้ไม่เปลี่ยนโค้ดเว็บ/Functions/rules) · เอกสาร/build base ที่ Work ตรวจ `84339ea46f1bc1edfbc49986a1749ce456bf20bb` · **Cloud TEST deployed ยังเป็น `2c897593321713783d0ba81c7167962e1793be9a`** (ยังไม่ deploy D2) · production deployed ไม่ทราบ (RED) · D2 ผ่านเฉพาะ LOCAL · T12 FAIL · D08 FAIL · combined UNVERIFIED · ดูบล็อก "ผลปรับรอบ r9c" ท้ายเอกสาร; บรรทัด r9b ด้านล่างเป็น **ประวัติ**
- [ประวัติ r9b] **สถานะ ณ r9b:** source/code head `958c8770fed6bdd0265239cf030c3a43a2505dc3` (แก้ข้อพบ Work review r9: Case Data ล้างที่ดิน + Lister validation) · เอกสาร/build base ที่ Work ตรวจ `7f596631ef11587d0532c5931d37cff69b4eded0` · **Cloud TEST deployed ยังเป็น `2c897593321713783d0ba81c7167962e1793be9a`** (ยังไม่ deploy r9/r9b) · production deployed ไม่ทราบ (RED) · T12 คง FAIL จนกว่า Work ตรวจและเจ้าของลอง Cloud TEST · S-TEST-FLOW 9/9 · S-TEST-PUBLIC 6/7 ≈ 86% (ผล Cloud ที่ 2c89759 ไม่เปลี่ยน) · ดูบล็อก "ผลปรับรอบ r9b" ท้ายเอกสาร; บรรทัด r9 ด้านล่างเป็น **ประวัติ**
- [ประวัติ r9] **สถานะ ณ r9:** source/code head `d7ee37e9323115168e8d0179372e9c2015ec42c4` (โค้ดเว็บ+Functions เปลี่ยน: หน่วยที่ดิน D2) · เอกสาร/build base ที่ Work ตรวจ `d0ffd49b56c5303e69c8c82ddb9b8db374442915` · **Cloud TEST deployed ยังเป็น `2c897593321713783d0ba81c7167962e1793be9a`** (ยังไม่ deploy r9) · production deployed ไม่ทราบ (RED) · T12 คง FAIL จนกว่า Work ตรวจและเจ้าของลอง Cloud TEST · S-TEST-FLOW 9/9 · S-TEST-PUBLIC 6/7 ≈ 86% (ผล Cloud ที่ 2c89759 ไม่เปลี่ยน) · ดูบล็อก "ผลปรับรอบ r9" ท้ายเอกสาร; บรรทัด r8 ด้านล่างเป็น **ประวัติ**
- [ประวัติ r8] **สถานะ ณ r8:** source/code head `678a04211879352d05e14fbe6166a9186a65507e` (โค้ดเว็บ ไม่เปลี่ยน) · เอกสาร/build base ที่ Work ตรวจ `2c897593321713783d0ba81c7167962e1793be9a` · **Cloud TEST deployed `2c897593321713783d0ba81c7167962e1793be9a`** (เจ้าของลองเคสสังเคราะห์เดิมแล้ว) · production deployed ไม่ทราบ (RED) · Cloud TEST: T10/T13/T14/T16 PASS, T12 FAIL → S-TEST-PUBLIC 6/7 ≈ 86% (เฉพาะขอบเขตนี้) · S-TEST-FLOW 9/9 · ดูบล็อก "ผลปรับรอบ r8" ท้ายเอกสาร; บรรทัดสถานะรุ่นก่อนหน้าด้านล่างเป็น **ประวัติ**
- [ประวัติ r7] **สถานะ ณ r7:** source/code head `678a04211879352d05e14fbe6166a9186a65507e` (draft ยังไม่ deploy; โค้ดเว็บเท่ากับ `7c1ec6b`) · เอกสาร/build base head ที่ Work ตรวจ `59d3ecb76ba179ce661e74c90040353e404f7604` · Cloud TEST deployed `d0fe6173ed2aa49fa92337b8519ca3eefb5fe7a5` (ไม่ใช่ source ปัจจุบัน) · production deployed ไม่ทราบ · ขอบเขต checklist 12 ชุด (lock 2: S-TEST-FLOW 9/9, S-TEST-PUBLIC 2/7) · FX-1/2/3/4 ใน draft (ผลในเครื่อง) + ตรวจผลกระทบ component แล้ว รอ Work — ดูบล็อก "ผลปรับรอบ r7" ท้ายเอกสาร; บรรทัดสถานะรุ่นก่อนหน้าด้านล่างเป็น **ประวัติ**
- [ประวัติ r6] **สถานะ ณ r6:** source/code head `7c1ec6b40bc5c5008d3bd20eb4ed8274bc3a3b99` (draft, ยังไม่ deploy) · เอกสาร/build base head ที่ Work ตรวจ `4a49ea68377f1a8f881891b020a12e1bf70964df` · Cloud TEST deployed `d0fe6173ed2aa49fa92337b8519ca3eefb5fe7a5` (ไม่ใช่ source ปัจจุบัน) · production deployed ไม่ทราบ · ขอบเขต checklist 12 ชุด (lock 2: S-TEST-FLOW 9/9, S-TEST-PUBLIC 2/7) · FX-1/2/3/4 อยู่ใน draft (ผลในเครื่อง) รอ Work ตรวจ — ดูบล็อก "ผลปรับรอบ r6" ท้ายเอกสาร; บรรทัดที่ระบุ SHA/สถานะรุ่นก่อนหน้าด้านล่างเป็น **ประวัติ**
- [ประวัติ r5] **สถานะ ณ r5:** Work ตรวจ head เอกสาร `f4d8090e631ad990de43d27570c05fa12b724722`; code/TEST SHA `d0fe6173ed2aa49fa92337b8519ca3eefb5fe7a5`; ขอบเขต checklist 12 ชุด (lock แล้ว 2: S-TEST-FLOW 9/9, S-TEST-PUBLIC 2/7); R12=PASS; ข้อกำหนดเจ้าของ A1–A10 บันทึกแล้ว; FX-3 อยู่ใน draft branch (ยังไม่ deploy). ดูบล็อก "ผลปรับรอบ r5" ท้ายเอกสาร. บรรทัดถัดไปที่ระบุ `34a0eb0` / "v2 ยังไม่ commit" เป็น **ประวัติ**
- รวม Work v1 + Claude Code v1.1 ที่ document commit `34a0eb0ee27bddfa72003958dd7e0546a9b490b2` + Claude AI ADDENDUM-CLAUDE-AI-01 + มติแผง PROJECT-STATUS ที่เจ้าของยืนยัน 3 ต.ค. 10:19
- [ประวัติ ณ v2] Code baseline/TEST ที่เจ้าของทดลอง: `d0fe6173ed2aa49fa92337b8519ca3eefb5fe7a5`; PR #8 ตรวจรอบนี้ OPEN/DRAFT/NOT MERGED, head เอกสาร `34a0eb0`, base `claude/chat-live-01`
- [ประวัติ ณ v2] v1/v1.1 และข้อความ "ยังไม่ commit" ด้านล่างเป็น snapshot ประวัติ; v1.1 อยู่ GitHub แล้ว ส่วน **v2 ฉบับนี้ยังไม่ commit**. ห้ามเอา code SHA/document SHA/deployed SHA ปนกัน
- [ประวัติ ณ v2] สถานะ: DOCUMENTATION RECONCILIATION; TEST หนึ่งเคสผ่าน UI ถึงปิดประกาศ; production NOT READY; ไม่ deploy/merge/GREEN ในรอบนี้
- เจ้าของยืนยันให้แผงใน Claude Code เป็นจุดดูความคืบหน้าหลัก; PROJECT-STATUS.md เป็นข้อมูลสถานะกลาง; Claude AI ใช้ชุดรุ่นเดียวกัน อ้าง Viewer เก่าเป็นประวัติ ไม่แก้สถานะแข่งกัน
- สิ่งที่ทำตอนนี้: Code ตรวจ/ประสานเอกสาร v2 และทำแผงติดตามภายในตามข้อกำหนดท้ายไฟล์; ไม่แก้ source เว็บไซต์/Functions/rules ในงานนี้
- อ่านครบ BLUEPRINT.md + HANDOFF-NEXT-CHAT.md + PROJECT-STATUS.md; บล็อกสถานะปัจจุบันนี้และข้อสรุป Work ท้ายไฟล์มีผลเหนือข้อความสถานะเก่า ส่วนมติผลิตภัณฑ์เดิมไม่ถูกยกเลิก

---

# เนื้อหาฉบับ Claude Code v1.1 — เก็บครบเพื่อรักษาประวัติ

**ชุดส่งต่อโครงการ — HUAHIN.PROPERTIES**

- ชุด: `HP-HANDOFF-2026-10-03-v1` · วันที่ 3 ตุลาคม 2569 (2026-10-03), เวลาอ้างอิง Asia/Bangkok
- เจ้าของโครงการอนุมัติให้จัดทำชุดส่งต่อในแชท Work วันนี้; ไม่ใช่การอนุมัติแก้ runtime / merge / production deploy
- อ่านร่วมกันครบสามไฟล์: `BLUEPRINT.md`, `HANDOFF-NEXT-CHAT.md`, `PROJECT-STATUS.md`
- ชุด v1.1 = v1 + บล็อก "ผลตรวจและประสานโดย Claude Code" ท้ายไฟล์ (เพิ่มอย่างเดียว ไม่แก้ v1)
- ฐานประวัติ: สองไฟล์ที่เจ้าของแนบวันนี้ มีบล็อกสถานะถึง 21 กันยายน 2569; ส่วนเพิ่มเติมอิงข้อความในแชท รายงาน Claude Code ภาพทดสอบของเจ้าของ และ GitHub ที่ตรวจวันนี้
- Repository: https://github.com/huahin-properties/huahin-properties · PR #8: https://github.com/huahin-properties/huahin-properties/pull/8
- ตรวจ GitHub วันนี้: PR #8 OPEN / DRAFT / NOT MERGED; branch `claude/listing-e2e-01`; head `d0fe6173ed2aa49fa92337b8519ca3eefb5fe7a5`; base `claude/chat-live-01` ที่ `beec235f04d59e243914b20cb106f8c64ceb6ec0`
- นี่คือ snapshot ของหลักฐาน ณ รอบนี้ ไม่ใช่การรับรอง source ทั้ง repository ใหม่ทั้งหมด และยังไม่ได้ commit ชุดนี้เข้า GitHub

# PROJECT-STATUS — ตารางงานตั้งแต่ต้นจนปลายทาง

**CURRENT: DOCUMENTATION RECONCILIATION ก่อน source รอบถัดไป.** LISTING-E2E real TEST ผ่านบางเส้นทางถึง take-down UI แต่ยังไม่ COMPLETE/production ready. เจ้าของไม่ต้องกรอกเคสใหม่ในรอบนี้

สี: 🟢 ผ่านเฉพาะขอบเขตที่ระบุ · 🟡 บางส่วน/กำลังตรวจ/รอหลักฐาน · 🔴 blocker/defect · ⚪ ยังไม่เริ่ม · 🔵 approved architecture/future direction (ไม่ใช่โค้ดเสร็จ)

Evidence tags: HISTORY=บันทึกเดิม; OWNER-OLD-CHAT=ข้อความเก่าที่เจ้าของนำมา; CODE-REPORT=Code รายงาน; SOURCE=ตรวจ GitHub; LOCAL=emulator/local Chromium; REAL-TEST=เจ้าของลองบน Cloud TEST; PROD=หลักฐาน production เดิมเท่านั้น

## 1. เส้นทางหลัก 0–24

หมายเลขลำดับเป็นแผนภาพรวม ไม่แทนรหัส C เดิม; ข้อใหม่จากแชทเก่าไม่มีวัน/decision id ครบ จึงเก็บทิศทางพร้อมรอตรวจ ไม่ยกระดับเป็นอนุมัติ implement วันนี้

| ลำดับ | รหัส / ขั้นตอน | สถานะ | ความหมายและข้อจำกัด | หลักฐาน |
|---|---|---|---|---|
| 0 | Governance / Decision Registry / Pre-Change Gate | 🟡 ต้อง sync | Registry เดิมมีแล้ว; เจ้าของอนุมัติชุดส่งต่อ/แบ่งหน้าที่วันนี้; ต้องเชื่อมกับ workflow Code | เอกสารเดิม §36 + มติแชท 3 ต.ค. |
| 1 | C4.1 — AI Reception / Intent | 🟢 มีแล้วตามประวัติ | production เดิม; ชุด AI TEST ใหม่ยังไม่ live verified | HANDOFF §1 |
| 2 | C4.3 Phase 1 — SELL/RENT_OUT Draft | 🟢 Production PASS เดิม | server authority; อย่ารวมกับ Phase 2D | BLUEPRINT §27 |
| 3 | Phase 2A-1 — Deterministic Completeness | 🟢 Production PASS เดิม | server คำนวณ ไม่ให้ AI คิดเอง | BLUEPRINT §29.3 |
| 4 | Phase 2A-2 — Persistent Progress | 🟢 CLOSED / Production PASS เดิม | 100% ไม่ auto-create/publish | HANDOFF §0 |
| 5 | Phase 2A-3 — Schema / Options | 🟢 CLOSED ตามประวัติ | มี known pending แยก; ไม่ reopen เฟสทั้งก้อน | HANDOFF §0.1 + ตารางเก่าเจ้าของ |
| 6 | Phase 2A-4 — Completeness v2 | ⚪ NOT STARTED ตาม roadmap | มาตรฐาน lock แล้ว; Code ใช้ photo minimum บางส่วนไม่ปิดเฟสนี้ | BLUEPRINT §32/§35 + roadmap เก่า |
| 7 | Phase 2B — Customer Workspace | ⚪ NOT STARTED ตาม roadmap | My Property Information; form TEST ไม่ใช่ workspace integrated proof | BLUEPRINT §28 |
| 8 | Phase 2C — AI ↔ Workspace Sync | ⚪ NOT STARTED ตาม roadmap | record เดียว; ไม่ถามซ้ำ; draft/form integration บางส่วนไม่ปิดทั้งหมด | BLUEPRINT §28 |
| 9 | Phase 2D — Review / Explicit Submit / Shared Record | ⚪ Unified phase ยังไม่เริ่มตาม roadmap | listing submit path มีแล้ว แต่ขอบเขต Unified ยังต้องเทียบ | BLUEPRINT §28 + TEST round |
| 10 | C5 — Demand Profile Core | 🔵 Architecture LOCKED / ยังไม่สร้าง | BUY/RENT demands/{demandId} | BLUEPRINT §26.15 |
| 11 | C5.1 — Demand Progress % | 🔵 ทิศทางเก่าที่เจ้าของนำมา / ยังไม่สร้าง | ต้องตรวจ decision source ก่อน implement | ข้อความแชทเก่าที่เจ้าของส่ง 3 ต.ค. |
| 12 | C5.2 — Natural Demand Collection | 🔵 ทิศทางเก่า / ยังไม่สร้างเต็ม | ถาม 1–2 เรื่อง ไม่ questionnaire/ไม่ถามซ้ำ | ข้อความแชทเก่า |
| 13 | C5.3 — Qualification | 🔵 Architecture / ยังไม่ implement | identified → collecting → qualified → active | BLUEPRINT §26.15 + แชทเก่า |
| 14 | C6 — Matching Engine Core | 🔵 Architecture direction / ยังไม่สร้าง | Demand ↔ Property | BLUEPRINT §26.15/§36 + แชทเก่า |
| 15 | C6.1 — Progressive Matching | 🔵 ทิศทางเก่า / ยังไม่สร้าง | เริ่ม match ก่อน demand 100%; ตรวจเกณฑ์ก่อนสร้าง | ข้อความแชทเก่า |
| 16 | C6.2 — Property Cards from Match | 🟡 UI บางส่วน / engine ยังไม่มี | มี card ไม่เท่ากับ canonical match | ข้อความแชทเก่า |
| 17 | C6.3 — Smart Match Collection | 🔵 ทิศทางอนาคต / ยังไม่สร้าง | 3–5 หลังหรือจำนวนเหมาะสม; แยก Favorites | PD-14 + แชทเก่า |
| 18 | C6.4 — Persistent Collection Link | 🔵 ทิศทางเก่า / ยังไม่สร้าง | ลิงก์เดียวกลับมาดู/แชร์ครอบครัว; ตรวจ privacy | ข้อความแชทเก่า |
| 19 | C6.5 — Continuous Auto-Match | 🔵 ทิศทางเก่า / ยังไม่สร้าง | ทรัพย์ใหม่เข้า collection ของ active demand | ข้อความแชทเก่า |
| 20 | C6.6 — Save / Hide / History | 🔵 ทิศทางเก่า / ยังไม่สร้าง | system matched ≠ customer saved; saved ไม่หายเอง | ข้อความแชทเก่า |
| 21 | C6.7 — Canonical Viewing Request | 🔵 แนวทาง / ยังไม่สร้างจริง | Customer ↔ Demand ↔ Property ↔ Match ↔ Viewing | PD-07 + แชทเก่า |
| 22 | Human Handoff — BUY/RENT | 🟡 ต้องออกแบบตาม context | กฎปัจจุบัน PD-05/06 มี; canonical demand/viewing ยังไม่ครบ | BLUEPRINT §36 |
| 23 | Negotiation | 🔵 FUTURE | ต่อจาก viewing; ไม่อ้างว่าดำเนินการแล้ว | ข้อความแชทเก่า |
| 24 | Deal / Participants / Commission | 🔵 FUTURE | Attribution / Revenue / Commission | BLUEPRINT §26 + แชทเก่า |

## 2. ฐานระบบก่อนเส้นทางหลัก — C0 ถึง C4.2

| รหัส | งาน | สถานะ | คงไว้/กลับไปทำ |
|---|---|---|---|
| C0/C0.5 | Lead capture / team visibility | 🟢 ปิดตาม HANDOFF เดิม | ตรวจเฉพาะผลกระทบจาก new private model |
| C1 | Sender identity / provenance | 🟢 ปิดตาม HANDOFF เดิม | รักษา privacy และ actor attribution |
| C2 | Assignment / workflow / review | 🟢 ปิดตาม HANDOFF เดิม | รับงานไม่ใช่อนุมัติ/publish |
| C3.1 | Workspace → canonical case/chat | 🟢 Production PASS เดิม 4 ก.ย. | thread เดียว; navigation/read ไม่แก้ assignment |
| C3.2 | Workflow progress card | 🟢 ส่วนที่กำหนดผ่าน | latest customer message preview เลื่อนไว้ ไม่ใช่เสร็จ |
| C4.2a | Permanent human marker | 🟢 Production PASS เดิม | release ไม่ลบ marker; AI ไม่กลับมาทำเอง |
| C4.2b | Confirmed case creation | 🟡 callable มีแล้ว | ข้อความเก่า not started ขัด source; unified customer UI/AI Cloud ต้องตรวจ |
| C4.2c | Canonical post-case messaging | 🟡 ต้อง reconcile | ระบบ messages ใหม่มีรายงาน; ยังไม่ปิดเฟสเดิมอัตโนมัติ |

## 3. งานปัจจุบันและตำแหน่งที่หยุด

| งาน | สถานะ | หลักฐาน | ใคร/ขั้นถัดไป |
|---|---|---|---|
| ชุดส่งต่อ v1 | 🟡 พร้อมส่ง review; ยังไม่ sync GitHub | ชุดนี้ + SOURCE PR #8 | เจ้าของส่งให้ทั้ง 3 หน้าต่าง; Code อ่านและเทียบ repo |
| CHAT-LIVE-01 | 🟡 local tests / real AI ยังไม่ทดสอบ | CODE-REPORT; pause 6/8 | ห้ามรัน script เก่า; แยกแผน AI deploy ภายหลัง |
| LISTING-E2E submit case/photos | 🟢 REAL-TEST หนึ่งเคส | user + ภาพ | ไม่ต้อง resubmit เดิม |
| Staff 7 photos/lightbox | 🟢 REAL-TEST | user ยืนยันครบ | คง negative permission เป็นงานค้าง |
| Staff data save/refresh | 🟢 REAL-TEST | 011249 + user | unit defect แยกไว้ |
| Staff submit review | 🟢 REAL-TEST | 012206 | ส่งแล้ว 1 ครั้ง |
| Owner intake/preview/publish | 🟢 REAL-TEST (T14 PASS บัญชี Owner เดียวกัน ที่ 2c89759) | 014754/014857/015012 + 144101/144107 | ผู้อนุมัติคนละบัญชีบน Cloud ยังไม่ทดสอบ |
| Public details 7 photos | 🟢 REAL-TEST photos | user + 015323 | ไม่ถือว่า fields ทั้งหมดถูก |
| Public search cover/data labels/map | 🟡 REAL-TEST Cloud 2c89759: T10/T13 PASS (เคสสังเคราะห์เดียว); T12 FAIL | ภาพ 145029–145325 | T12 รอมติหน่วยที่ดิน D2; แผนที่ยังไม่ยืนยันตำแหน่งจริง (ISS-MAP-LIMITS) |
| Take-down search/details | 🟢 REAL-TEST Cloud 2c89759: T16 PASS; ปิด→เปิดใหม่→ปิดอีกครั้ง; Search = 0; รูปเดิม 1 ไฟล์ 404 | ภาพ 143124/150108/150315/145508/145934 | ตรวจรูปอีก 6 ไฟล์และการลบ backend ยัง UNVERIFIED |
| Full 3 submitter groups | 🟡 LOCAL reported; REAL-TEST ไม่ครบ | CODE-REPORT | agent flow และ negative Cloud ต้องเติม |
| Privacy legacy migration | 🔴 BLOCKED production | CODE-REPORT plan | ห้าม migrate/delete จนอนุมัติแยก |
| Production release | 🔴 NOT READY | draft/unmerged + blockers | ห้าม merge/deploy/GREEN |
| ตรวจ source DOC-OBS + ทะเบียนแนวคิด r4 | 🟡 ข้อค้นพบพร้อมส่ง Work; ยังไม่แก้ระบบเว็บ | SOURCE · CODE-V2-01 r4 | Work ตรวจข้อเสนอแก้ขั้นต่ำ FX-1…FX-5 ก่อนแก้ |
| ข้อกำหนดเจ้าของ A1–A10 + FX-3 (DOC-OBS-05) r5 | 🟡 บันทึกแล้ว; FX-3 อยู่ใน draft branch (LOCAL) รอ Work ตรวจ | SOURCE/LOCAL | Work ตรวจ diff → เจ้าของ deploy TEST ตาม head ที่ตรวจ |
| FX-1/2/4 ใน draft + ทดสอบ FX-3 เพิ่ม + ทะเบียนรุ่น/ผลทดสอบ r6 | 🟡 พร้อมส่ง Work ตรวจ; LOCAL ผ่าน; ยังไม่ deploy | LOCAL/SOURCE | Work ตรวจ diff → เจ้าของ deploy TEST ตาม head ที่ตรวจ |
| ตรวจผลกระทบ component + FX-1 สองบัญชี r7 | 🟡 พร้อมส่ง Work ตรวจ; LOCAL ผ่าน; ยังไม่ deploy | LOCAL/SOURCE | Work ระบุ head → เจ้าของ deploy TEST → ทดสอบเฉพาะจุด |
| ซิงก์ผล Cloud TEST ที่ head 2c89759 (r8) | 🟢 REAL-TEST Cloud: T10/T13/T14/T16 PASS, T12 FAIL; S-TEST-PUBLIC 6/7 ≈ 86% (เฉพาะขอบเขตนี้) | ภาพเจ้าของ (Work ตรวจแล้ว) | Work ตรวจชุดส่งต่อ r8; ยังไม่ต้องทดสอบเพิ่ม |
| D2 หน่วยที่ดิน (FX-5) ใน draft r9 | 🟡 D2 อนุมัติ; แก้ขั้นต่ำใน draft ผ่านทดสอบในเครื่อง; T12 คง FAIL | LOCAL/SOURCE | Work ตรวจ → เจ้าของ deploy TEST (functions+hosting) → ทดสอบ T12 |
| D2 r9b แก้ข้อพบ Work review | 🟡 ผ่านทดสอบในเครื่อง (LOCAL); T12 คง FAIL | LOCAL/SOURCE | Work ตรวจ → เจ้าของ deploy TEST (functions+hosting) → ทดสอบ T12 |
| D2 ผลบน Cloud TEST ที่ head 958c877 (HH-24379) | 🟢 REAL-TEST Cloud: Owner preview/เผยแพร่/ไทย/จีน ถูกต้อง (TD1–TD4); ล้างค่า/ครบ 8 ภาษา/ไม่แปลงซ้ำ ยังไม่ทดสอบบน Cloud | ภาพเจ้าของ (Work ตรวจแล้ว) | Work ตัดสินเรื่อง T12 และขั้นต่อไป |

## 4. งานค้างและลำดับถัดไป

1. อ่านชุดนี้ครบ → Code เทียบเอกสาร/commits/test reports ปัจจุบัน; Work ตรวจ; sync docs/PR/Viewer โดยรักษาประวัติ
2. นำ DOC-OBS-01…05 ไป audit และเสนอขอบเขตแก้ ยังไม่แก้แฝงในรอบ docs
3. หลังอนุมัติ targeted fixes: Code ทำ + local regression ที่ตรง → Work review head → เจ้าของ update TEST + ลองเฉพาะจุด ไม่เริ่มเคสใหม่ทั้งชุดโดยไม่มีเหตุ
4. เติม Cloud tests ที่ขาด: direct image URL revocation (ต้องเก็บ URL ก่อน take-down รอบที่อนุมัติ), negative role/token access, agent/outsider/Owner group paths และ retry ที่จำเป็น
5. Real AI เป็นงานแยก: scoped build/secret/gate/allow-list/caps และ negative smoke ก่อนใช้งาน ห้ามใช้ old script
6. Reconcile phase 2A-4/2B/2C/2D กับ LISTING-E2E; ไม่เร่ง matching หรือ production โดยข้ามมาตรฐาน
7. Production migration/security/release plan ทำเมื่อเจ้าของเลือก scope และอนุมัติ ไม่ย้าย TEST records ขึ้น production โดยอัตโนมัติ

## 5. แนวทางบริการไม่มีค่ารายเดือน / มีค่ารายเดือน

เจ้าของนำตารางนี้จากแชทเก่า ยังไม่มีชื่อแพ็กเกจ/ราคา/วันอนุมัติครบ. สิทธิ์ที่ตั้งใจให้มีไม่ใช่ฟังก์ชันที่ผ่านทดสอบแล้ว

| บริการ | ไม่มีค่ารายเดือน (แนวทาง) | มีค่ารายเดือน (แนวทาง) |
|---|---|---|
| ลงทรัพย์/ติดต่อผ่านเว็บไซต์ | ได้ | ได้ |
| AI ข้อมูลทรัพย์ | พื้นฐาน | เต็มรูปแบบตาม scope ที่จะกำหนด |
| Search | ปกติ | ปกติ + สิทธิ์ marketing ตาม package |
| Matching | ตามความเหมาะสม | match + proactive tracking |
| จัดข้อมูล/หลายภาษา | ผู้ลงส่งข้อมูลค่อนข้างครบ/มาตรฐาน | ทีม/AI ช่วยจัด/ติดตาม/คุณภาพภาษา |
| Lead follow-up / ตรวจสถานะ | พื้นฐาน/ผู้ลงแจ้ง | ต่อเนื่อง/เตือนและทีมช่วย |
| Viewing / รายงาน | ประสานเมื่อสนใจ/พื้นฐาน | workflow + Lead/Match/Viewing reports |
| Social / Priority | ไม่รับประกันโปรโมต/คิวปกติ | quota กิจกรรม/priority |

Matching/continuous tracking/canonical viewing ยังไม่สร้างครบ ห้ามขายหรือสื่อสารว่าใช้งานพร้อมแล้วจากตารางนี้; ราคาเดิมในประวัติไม่ถูกยกเลิกหรือเปลี่ยนวันนี้

## หลักฐานการทดลองจริงล่าสุด — 2–3 ตุลาคม 2569

เคสสังเคราะห์ `own-14a754ca222d54e405fe`; public code `HH-67680`; ขายพูลวิลล่าหัวหิน 4,900,000 บาท; 7 รูป; 3 ห้องนอน / 2 ห้องน้ำ / พื้นที่ใช้สอย 180 ตร.ม.; Staff กรอกที่ดิน 100 ตร.ว.; พิกัดทดสอบ 12.558940,99.909039. ห้ามใช้เป็นทรัพย์ขายจริง

บัญชี TEST: `staff-test@example.com` (Staff), `owner-test@example.com` (Owner). สิทธิ์อยู่ `adminUsers/<TEST uid>`; บัญชี Owner production ไม่ได้เป็น Owner TEST อัตโนมัติ แม้ใช้อีเมลเดียวกัน. ไม่ต้องสร้างบัญชีซ้ำโดยไม่ตรวจของเดิม

| หลักฐาน | ผลและขอบเขต | ที่มา |
|---|---|---|
| Deploy TEST head d0fe617 | เจ้าของส่งภาพ deploy complete; ไม่ใช่ production | Screenshot 2026-10-03 010910.png |
| Staff รูปส่วนตัว 7 รูป | เจ้าของยืนยันเปิดขยายทุกรูปตรงกัน; Cloud TEST UI ผ่านเคสนี้ | คำยืนยัน 2 ต.ค. 23:41 + ภาพก่อนหน้า |
| Staff แก้ข้อมูลและบันทึก | Case Data บันทึกสำเร็จ; เจ้าของยืนยัน refresh แล้วครบ | 011030, 011236, 011244, 011249.png + คำยืนยัน |
| Staff ส่งตรวจ | checklist 19/19; ส่ง 1 ครั้ง; รอผู้บริหาร | 012115, 012206.png |
| Owner รับเรื่อง | UI อนุมัติการรับเรื่องและออก HH-67680 | 014754.png |
| Owner preview | แสดงข้อมูลสาธารณะและรูป 7 รูปก่อนยืนยัน | 014857.png |
| Owner publish | UI แสดงกำลังแสดง | 015012.png |
| Public Search | พบประกาศครั้งแรก แต่ไม่เห็นรูปปก; ไม่ PASS ด้านรูปปก | 015210.png |
| Public Details | รูปครบ 7 และเจ้าของยืนยันภาพขยายตรงกัน | 015318, 015323.png + คำยืนยัน |
| Owner take-down | ใส่เหตุผลทดสอบปิดประกาศ; UI ปิดใช้งาน(แอดมิน) | 015917, 015927.png |
| Public Search หลังปิด | 0 รายการ | 020034.png |
| ลิงก์ Details หลังปิด | หน้าเดิมยังมีข้อมูลก่อน refresh; Ctrl+Shift+R แล้วเหลือ header/footer ไม่มีข้อมูล/รูป | 020601 → 020932.png |

ชื่อภาพทั้งหมดใช้ prefix `Screenshot 2026-10-03 ` เว้นที่ระบุ 2 ต.ค. หลักฐานเป็นภาพและคำยืนยันของเจ้าของที่ Work ตรวจในแชท ไม่ใช่การเข้าฐานข้อมูล Cloud โดย Work; ภาพอยู่ในประวัติการสนทนา ไม่ได้แนบรวมกับสามไฟล์นี้ หากจำเป็นต้องอ้างไฟล์จริงให้ขอ/แนบภาพชื่อเดิมเพิ่ม

**ยังไม่ยืนยัน:** backend/ไฟล์ถูกลบครบจาก Cloud, ลิงก์รูป public เดิมใช้ไม่ได้, negative permission matrix บน Cloud, agent/outsider/Owner ทั้งสามเส้นทางครบ, retry/concurrency Cloud, slow network Cloud, real AI. หน้าไม่เห็นข้อมูลไม่ใช่หลักฐานว่าลบไฟล์แล้ว

### Defect/ข้อสังเกตที่ต้องตรวจต้นเหตุก่อนแก้

ใช้รหัสชั่วคราว DOC-OBS เท่านั้น ไม่ใช่การออกเลข PENDING ต่อจากทะเบียนโดยเดา

| รหัส | สิ่งที่เห็น | งานที่ควรตรวจต่อ |
|---|---|---|
| DOC-OBS-01 | Search ไม่มีรูปปก แต่ Details มี 7 รูป | trace public photos/cover rendering จาก record ถึง search |
| DOC-OBS-02 | Case Data กรอก 100 ตร.ว. แต่ Details แสดง 100 ตร.ม. | ยืนยัน canonical unit + conversion/label; 100 ตร.ว. = 400 ตร.ม.; ห้ามแก้ค่าข้อมูลบน Cloud เพื่อกลบปัญหา |
| DOC-OBS-03 | แผนที่แสดง undefined และระยะทาง 0 กม. | trace missing fields; ห้ามอ้างว่าคำนวณระยะจริงแล้ว; ออกแบบ unknown fallback ตาม scope |
| DOC-OBS-04 | อนุมัติโดย - | ตรวจ approval stamp กับ UI mapping; ยังไม่มีหลักฐานว่าประวัติ backend หาย |
| DOC-OBS-05 | หลังปิด Details ว่าง | แยก not-found/closed จาก load-error แล้วแสดงข้อความที่ถูกต้อง; ไม่เปิดข้อมูลส่วนตัวเพื่อบอกเหตุผล |

### ข้อจำกัดที่ต้องรักษาในรายการค้าง

- Legacy production contact/trackToken ในเอกสารที่ public อ่านได้: BLOCKED production; แผน `docs/listing-e2e/LEGACY-DATA-PLAN.md`; ยังไม่อนุญาต migration/delete
- ข้อจำกัด assigned Staff: หน้า Case Data จำกัดผู้รับผิดชอบ แต่ rules ยังให้ Staff คนอื่นแก้ allowed fields ได้ ตามรายงาน Code; ยังไม่ได้ harden server/rules
- Rules/paths ของรูปใน flow agent เก่าเคยเขียนทับข้ามสมาชิกได้ ตามรายงาน; ต้อง re-audit ก่อน production ไม่ถือว่าปิดจาก callable photo flow ใหม่
- Browser suite มี flake ตามรายงาน Code; local PASS ไม่เท่ากับไม่มี race ทุกครั้ง
- Tracking ยังไม่มี per-IP rate limit ตามรายงาน; orphan uploads cleanup ยังไม่ครบ; agent quota integration ยังมีงานค้าง ต้องตรวจ source ล่าสุดก่อนแก้
- TEST functions มี project guard; ห้ามย้ายหน้า/โค้ดขึ้น production ตรง ๆ เพราะอาจทำให้ฟอร์มหยุด
- บางลิงก์ Admin Dashboard ไม่อยู่ TEST build และ 404 ตาม scope ไม่ขยายงานทั้งหมดโดยอัตโนมัติ

## กติกาการรับช่วงและทำงานร่วมกัน — มติของเจ้าของในรอบนี้

1. เรียกสามไฟล์รวมว่า **ชุดส่งต่อโครงการ** หรือ **ชุดส่งต่อ**; ผู้รับทุกระบบอ่านครบก่อนรับช่วง
2. เจ้าของเป็นผู้ตัดสินขอบเขต/ค่าใช้จ่าย/การเปิดใช้งาน; Claude Code ทำ source และทดสอบ; ChatGPT Work ตรวจหลักฐาน/รีวิว/พาทดสอบ; Claude AI ช่วยภาพรวมผลิตภัณฑ์/ตรวจความสอดคล้องได้ ไม่เริ่มแก้ระบบคู่ขนานโดยไม่มีการมอบหมาย
3. ก่อนเปลี่ยน source: ระบุงาน/รหัส/ขอบเขต → อ่านมติที่เกี่ยวข้อง → ตรวจส่วนเดิมที่จะกระทบ → รายงานข้อขัดกัน → ทำเฉพาะขอบเขตที่เจ้าของอนุญาตแล้ว งานใหม่อยู่นอกขอบเขตต้องแยกเสนอ
4. รอบนี้ DOCUMENTATION ONLY: จัดชุดส่งต่อให้ครบก่อนเริ่มงานค้างเมื่อคืน ห้ามถือว่าการบันทึก defect คือคำสั่งให้แก้ทันที
5. ทุกครั้งที่ปิดรอบงานหรือสถานะเปลี่ยน Claude Code ต้อง sync ทั้งสามไฟล์ ส่งฉบับเต็ม ระบุชุด/วันที่/code commit/document commit/รายการเปลี่ยน และอัปเดต Viewer กับ PR description ให้ตรงกัน Work ตรวจ ก่อนให้เจ้าของทำขั้นถัดไป
6. ไม่ลบประวัติเดิม; บันทึกสิ่งใหม่พร้อมวันที่และที่มา ถ้ามติใหม่เปลี่ยนมติเก่าให้ระบุ supersedes และผู้อนุมัติ ไม่แก้ความหมาย PD เดิมย้อนหลัง ไม่สร้างเลข PD ใหม่แทนการยืนยันของเจ้าของ
7. งานค้างเก่าที่มีประโยชน์ต้องอยู่ในตาราง ยังไม่เริ่มไม่เท่ากับยกเลิก; ไม่ปิด issue จากการทดสอบคนละขอบเขต
8. เอกสารใช้เข้าใจและรับช่วงได้; การลงมือยังต้องมีสิทธิ์เข้า repository/โปรเจกต์/เครื่องมือ ถ้าไม่มีให้บอกตรง ๆ ไม่อ้างว่า deploy หรือแก้แล้ว
9. บทสนทนาส่งต่อ: "อ่านชุดส่งต่อทั้งสามไฟล์ สรุปความเข้าใจ จุดที่หยุด ข้อห้าม และขั้นถัดไปก่อนเริ่ม; ตรวจ repository head ล่าสุด; ถ้ามีข้อขัดแย้งให้รายงาน ไม่เดาสถานะ"
10. เลข C/Phase เป็นรหัสระบบเดิม; ลำดับ 0–24 เป็นภาพรวมที่เจ้าของนำจากแชทเก่า; `CHAT-LIVE-01`/`LISTING-E2E-01` เป็นรอบงานใหม่ ห้ามถือว่าชื่อใหม่ปิดเฟสเดิมโดยอัตโนมัติ

### วิธีตัดสินเมื่อข้อมูลขัดกัน

- เป้าหมายและมติ: ยึดมติที่เจ้าของอนุมัติล่าสุดซึ่งบันทึกพร้อมวันที่/ที่มา; BLUEPRINT เป็นทะเบียน ไม่ใช้บล็อกสถานะเก่าลบผลใหม่
- โค้ดจริง: ตรวจ GitHub ที่ commit ระบุ; merged code กับ branch draft ต้องแยก
- ผล deploy: ใช้หลักฐาน deploy ของโปรเจกต์ที่ถูกต้อง ไม่ใช่ GitHub commit อย่างเดียว
- ผลใช้งาน: แยก source inspection / Code report / emulator / local browser / real TEST / production
- ไม่พบหลักฐาน = UNVERIFIED; BLOCKED/NOT TESTABLE ไม่ใช่ FAIL; ไม่มีหลักฐาน production รอบใหม่ให้คงว่า production ยังไม่พร้อม
- ผล PASS เดิมเป็นประวัติของเวอร์ชันและขอบเขตเดิม ไม่รับรองชุดแก้ใหม่โดยอัตโนมัติ

### TEST และ production — ห้ามปน

| สิ่ง | TEST | Production |
|---|---|---|
| Firebase project | `huahin-chat-test-01` | `huahin-properties-5f1b5` |
| เว็บไซต์ | https://huahin-chat-test-01.web.app | https://huahin.properties |
| ข้อมูลรอบนี้ | ข้อมูลสมมติ + รูปที่เจ้าของมีสิทธิ์ใช้; แถบเหลือง TEST | ไม่ย้าย/ลบ/แก้ข้อมูลเก่าในรอบนี้ |
| การเปิด public | ใช้เฉพาะไซต์ TEST สำหรับทดสอบที่อนุญาต | คง RED / Public Hidden ตามสถานะที่รายงาน; ยังไม่ได้ตรวจสดรอบเอกสารนี้ |
| deploy | สคริปต์ listing แยก หลังตรวจ head/scope | ยังห้าม merge/deploy/GREEN |

- มติเดิม PD-12 ห้าม publish ทรัพย์สมมติบนเว็บจริงยังคงใช้ ส่วนข้อมูลสังเคราะห์ที่เจ้าของอนุญาตรอบใหม่ใช้กับ TEST แยกเท่านั้น
- Workflow เดิม manual Viewer upload เก็บเป็นประวัติ; workflow ปัจจุบันที่เจ้าของใช้: Claude Code push draft branch → Work review → เจ้าของ deploy TEST ตาม head ที่ตรวจ → เจ้าของลอง UI → sync ชุดส่งต่อ ไม่มีการอนุมัติ production แฝง
- ห้ามรันสคริปต์ CHAT-LIVE เดิม `tools/chat-live/deploy-test.sh` ที่พัก 6/8
- listing TEST ใช้ `tools/listing-test/deploy-test.sh`; isolated `build/listing-functions`; codebase `listing`; 10 named functions; selectors `functions:listing:<name>`; ไม่ deploy functions ทั้งระบบ ไม่ขอคีย์ AI เพื่อทดสอบฟอร์ม
- ไม่มีคำสั่ง deploy ให้รันในชุดรอบเอกสารนี้; Codespace เคยอยู่ detached HEAD ต้องตรวจ branch/HEAD ก่อน ใช้ fetch + pin reviewed SHA เมื่อถึงรอบที่อนุมัติ ไม่สั่ง git pull โดยไม่ตรวจสภาพ
- ห้ามใส่รหัสผ่าน/API key/trackToken/ลิงก์ติดตามที่มี token ลงชุดส่งต่อ; ผู้ใช้เก็บเอง

---

## ผลตรวจและประสานโดย Claude Code เทียบ repository — 3 ตุลาคม 2569 (DOCUMENTATION ONLY · ชุด `HP-HANDOFF-2026-10-03-v1.1`)

**ขอบเขต:** อ่านชุด v1 ทั้งสามไฟล์ + เทียบ git ของ repository (ไม่แก้ source, ไม่ deploy, ไม่แตะ production, ไม่ rerun test). ชุด v1 เก็บครบ ไม่ลบ/ไม่เขียนทับ; ส่วนนี้เป็น **การเพิ่ม** พร้อมที่มา. สามไฟล์ได้บล็อกเดียวกันนี้.
**Code SHA ที่ตรวจ:** `d0fe6173ed2aa49fa92337b8519ca3eefb5fe7a5` (= `origin/claude/listing-e2e-01` ก่อน commit เอกสาร). **Document commit SHA:** รายงานในข้อความส่งกลับหลัง commit (ไม่ใส่ในไฟล์เพราะอ้างตัวเองไม่ได้). commit เอกสารแตะเฉพาะไฟล์ `.md` (ตรวจด้วย `git diff d0fe617..HEAD --stat`).

### ก. สิ่งที่ตรวจแล้วตรงกับชุด v1 (SOURCE = git)
- PR #8 head = `d0fe617` ✔ · base `claude/chat-live-01` = `beec235` ✔ · `main` = `4e358a5` ("fix(home): wait for Firebase readiness… PENDING #18").
- SHA ในตาราง "ลำดับการพัฒนา" มีครบและเรียงเวลาตามที่ระบุ (be9250f → … → d0fe617; ทั้งหมดวันที่ 1–2 ต.ค. 2569).
- ฟังก์ชัน listing = 10 ตัว (`REQUIRED_FUNCTIONS` มี `getCasePhoto`); codebase `listing`; selector `functions:listing:<name>`; หน้า Case Data จำกัดผู้รับผิดชอบที่หน้าเว็บ ส่วน rules ไม่บังคับ — ตรงกับข้อจำกัดที่บันทึกไว้.
- ตัวเลข test ที่ Code รายงาน (listing 90 · chat-live 34 · browser-local 11) ตรงกับรอบสุดท้ายของ Code; รอบเอกสารนี้ **ไม่ได้ rerun**.

### ข. ข้อขัดแย้ง/ความคลาดเคลื่อนที่พบ (ยังไม่ได้แก้ source; แก้เฉพาะเอกสารที่ระบุในข้อ ง)
| # | ข้อพบ | หลักฐาน | การจัดการ |
|---|---|---|---|
| K1 | แถบ "PHS-CLOSE-1 · 8 ส.ค. 2569 · ไฟล์นี้เป็นเวอร์ชันล่าสุด ไม่มีเนื้อหาล้าสมัย (23 ไฟล์)" อยู่ต้น BLUEPRINT และ CLAUDE.md แต่เนื้อหาถึง ก.ย.–ต.ค. และชุด v1 ระบุว่าบล็อกเก่า = ประวัติ | อ่านไฟล์ | **ถือเป็นประวัติ ไม่ใช่ latest** — ไม่ลบ; CLAUDE.md ได้บล็อกชี้ชุดส่งต่อ (ข้อ ง) |
| K2 | CLAUDE.md ใน repo (15,473 B) ยังสั่ง "ทุกครั้งส่งไฟล์ใน `export-for-github/` ให้เจ้าของดาวน์โหลด/อัปโหลดเอง" ซึ่งขัด BLUEPRINT §29 และขัด workflow ปัจจุบัน (Code push draft branch → Work review → เจ้าของ deploy TEST) | CLAUDE.md "Deployment workflow", "Working conventions" | เพิ่มบล็อก CURRENT WORKFLOW ไว้บนสุดของ CLAUDE.md (ไม่ลบข้อความเดิม). สำเนา CLAUDE.md ฝั่งโปรเจกต์ออกแบบ (17,579 B, 1 ต.ค.) แก้เป็น §29 แล้วแต่ **เก่ากว่า** workflow ปัจจุบัน — ไม่ใช้ทับ; รอ Work/เจ้าของตัดสินว่าจะรวมหรือไม่ |
| K3 | ป้าย "Agent Signup ช่องรหัสผ่านเป็น `type=text`" ใน CLAUDE.md/HANDOFF เก่ายังเปิดอยู่ | โค้ดปัจจุบัน `Agent Signup.dc.html` บรรทัด 149/171/552–555: `type` = `password` เป็นค่าเริ่ม + ปุ่มตา | ป้ายล้าสมัย (ตรงกับ Handoff Package 1 ต.ค.); **ยังไม่ทดสอบ UI จริง** |
| K4 | ตารางระบุ `9f1f9b6` = "case messages/token authority, retry, public projection, TEST build" | `9f1f9b6` เป็น commit เอกสาร ("docs: test counts"); โค้ดรอบสองคือ `8ff7f3e` (record-only), `e05989d` (form flow), `d1c9eec` (TEST build), `905d4c9` (allow-list mirror), `d4acdb2` (tests) — `9f1f9b6` เป็นปลายช่วง | แก้การอ้างอิงเป็น "ช่วง 8ff7f3e…9f1f9b6 (ปลายช่วงเป็น commit เอกสาร)" |
| K5 | ชุด v1 ใช้ "PR #2–#7 → beec235 อยู่ใน claude/chat-live-01" โดยไม่ระบุว่า **ไม่อยู่บน main** | `origin/main` = `4e358a5`; `chat-live-01` นำ main 18 commit; main นำ chat-live-01 0 commit; `listing-e2e-01` นำ chat-live-01 อีก 32 commit | บันทึกชัด: งาน CHAT-LIVE/CHAT-FIX/CHAT-TEST/LISTING ทั้งหมด **ยังไม่อยู่บน main**; PR #8 ชี้ base `chat-live-01` ไม่ใช่ main — merge #8 อย่างเดียวไม่ถึง main (ลำดับ merge เป็นมติของเจ้าของ ยังไม่ตัดสิน) |
| K6 | PR #8 description ยังเขียน head `9b0341b` + "NOT verified on any real TEST"; `OWNER-TEST-GUIDE.md` เขียน "เตรียมแล้ว ยังไม่ได้ deploy"; `LISTING-E2E-01.md` ไม่มี getCasePhoto / Case Data / SDK wait / B-series | อ่านไฟล์/PR | อัปเดตตามข้อ ง โดยแยกหลักฐาน (LOCAL vs REAL-TEST) ไม่ยกผล LOCAL เป็น Cloud |
| K7 | ชุด v1 บันทึก "browser flakes ยังไม่สรุป root cause" | ผลรัน test:browser-local หลายรอบของ Code: ล้มเป็นพักๆ ราว 1 ใน 4 รอบเต็ม (B2 หนึ่งครั้ง; B5→B9 ล้มต่อเนื่องหนึ่งครั้ง; B11 สองครั้งก่อนเพิ่ม retry) | เพิ่มรายละเอียด; สมมติฐานที่ **ยังไม่พิสูจน์**: การอ่าน `adminUsers/<uid>` ครั้งแรกหลัง login อาจตอบ "ไม่มี role" ชั่วคราว — Case Data มี retry แล้ว หน้าทีมอื่น (Listing Approvals / Staff Workspace) อ่านครั้งเดียว |

### ค. ข้อสังเกต DOC-OBS — ตรวจ source เบื้องต้นเท่านั้น (ไม่ใช่ audit ต้นเหตุ ไม่ใช่คำสั่งแก้; ขอบเขตแก้รอเจ้าของอนุมัติ)
- **DOC-OBS-02 (ตร.ว./ตร.ม.):** `Lister Dashboard.dc.html` ติดป้ายช่อง `landSize` ว่า "ตร.ว." (บรรทัด ~946; ไร่/งาน/ตร.ว. แยกอีกชุดที่ ~984) และ **Case Data คัดลอกป้ายนั้น**; `Property Details.dc.html` (บรรทัด ~881) แสดง `landSize` พร้อม `t.sqm` ("ตร.ม./sqm") ทุกภาษา → เป็นความไม่สอดคล้องของ "หน่วยที่ใช้เรียก `landSize`" ที่มีอยู่เดิม ไม่พบโค้ดแปลงหน่วยตอนเขียน. หน่วย canonical = **ต้องให้เจ้าของตัดสิน** ก่อนแก้; ห้ามแก้ค่าบน Cloud.
- **DOC-OBS-04 (อนุมัติโดย -):** `Listing Approvals.dc.html` (~1091) แสดง `p.approvedBy`; ฝั่ง Case แบบใหม่ ตราอนุมัติที่ server เขียนตอนเผยแพร่คือ `approvedByEmail/approvedByUid/approvedByRole` (`listing-case.js` ~517) และการตัดสินรับเรื่องของ Case แบบใหม่ตั้งใจไม่เขียน `approvedBy` → ป้าย "-" น่าจะมาจาก **การ map ชื่อฟิลด์** ไม่ใช่ประวัติหาย (ยังไม่ตรวจข้อมูลบน Cloud).
- **DOC-OBS-01 (Search ไม่มีรูปปก):** Search อ่าน `p.photos[0].url` (`Search Results.dc.html` ~394–397). test ในเครื่องยืนยันแค่ว่า Search แสดงรายการ/ราคา **ไม่ได้ assert รูปปก** (ช่องว่างของ test). อ่านโค้ดแล้วยัง **ไม่พบต้นเหตุ**.
- **DOC-OBS-03 (แผนที่ undefined / 0 กม.):** ไม่ได้ตรวจในรอบนี้.
- **DOC-OBS-05 (Details ว่างหลังปิด):** build TEST ตั้ง `SAMPLE_FALLBACK_ON_ERROR=false` และ `Property Details` ไม่มีหน้า "ไม่พบ/ปิดแล้ว" แยก → ข้อสันนิษฐาน: หน้าว่างเป็นพฤติกรรมของ TEST build + ไม่มี not-found view (production ยังคง fallback ข้อมูลตัวอย่าง) — **ยังไม่พิสูจน์**.

### ง. เอกสารที่แก้ใน repository รอบนี้ (เฉพาะ `.md`)
`BLUEPRINT.md`, `HANDOFF-NEXT-CHAT.md`, `PROJECT-STATUS.md` (ใหม่ใน repo; เนื้อหา v1 ครบ + บล็อกนี้) · `CLAUDE.md` (เพิ่มบล็อก CURRENT WORKFLOW/ชี้ชุดส่งต่อ ไม่ลบเดิม) · `docs/listing-e2e/OWNER-TEST-GUIDE.md` (สถานะ: deploy TEST แล้ว head d0fe617 + หลักฐาน REAL-TEST ตามชุด v1) · `docs/listing-e2e/LISTING-E2E-01.md` (ภาคผนวกรอบ 4–9: getCasePhoto, Case Data, SDK wait, สคริปต์/โฟลเดอร์ฟังก์ชันแยก, B-series) · PR #8 description และ Viewer (ให้ตรงกัน).

### จ. คำถามที่ต้องให้ Work/เจ้าของตัดสินก่อนงานถัดไป
1. หน่วย canonical ของ `landSize` (ตร.ว. หรือ ตร.ม.) และให้ฟอร์ม/หน้าแสดงสอดคล้องอย่างไร (DOC-OBS-02).
2. ลำดับ merge: `chat-live-01` ↔ PR #8 ↔ `main` (K5) — ยังไม่มีมติ ห้ามถือว่า merge ได้.
3. รวม/ไม่รวมสำเนา CLAUDE.md ฝั่งโปรเจกต์ออกแบบ (K2).
4. ให้ Code audit DOC-OBS-01/03/05 ก่อน (ขอบเขตแก้แยกรายข้อ) หรือเริ่มชุดทดสอบ Cloud ที่ขาดก่อน.
5. rerun ชุด test ทั้งหมด (รวม combined 175) ที่ head ปัจจุบันก่อนส่ง Work ตรวจ source ต่อ หรือไม่.


---

# ภาคผนวกจาก Claude AI — เก็บตามที่ส่งมา (คำรายงานต้องอ่านคู่ข้อสรุป Work)

# ภาคผนวก — ADDENDUM-CLAUDE-AI-01 · ตรวจและประสานเอกสารจาก Claude AI Project (3 ต.ค. 2569)

- เพิ่มต่อท้ายชุด `HP-HANDOFF-2026-10-03-v1` · **ไม่ลบ ไม่แก้ข้อความเดิมแม้แต่บรรทัดเดียว** (ตรวจแล้ว: ชุดนี้มีเนื้อหา BLUEPRINT.md และ HANDOFF-NEXT-CHAT.md ฉบับในโปรเจกต์ครบทุกบรรทัด)
- ผู้เพิ่ม: Claude AI (เครื่องมือออกแบบ · อ่าน GitHub ได้บางส่วน · commit/deploy ไม่ได้) · รอบนี้ **ไม่แก้ source ไม่ deploy ไม่เปิด GREEN**
- การตั้งเลขชุดใหม่ (เช่น v2) ให้ Work/เจ้าของตัดสิน · ภาคผนวกนี้ไม่ใช่มติใหม่ เป็นรายการหลักฐานและข้อขัดแย้ง
- แหล่งอ้างอิง: **V** = Viewer `Copy Code to GitHub.dc.html` (อยู่เฉพาะใน Claude AI Project) · **PKG** = `handoff-claude-code/HANDOFF-PACKAGE-2026-10-01.md` · **LIVE** = Claude AI ตรวจ GitHub main ด้วย blob hash 30 ก.ย. 2569 · **CHAT** = มติในแชท Claude AI (ผ่าน ChatGPT)

## A1. ข้อจำกัดการตรวจ repository รอบนี้
- อ่านโครงสร้าง `docs/` ของ branch `claude/listing-e2e-01` ได้ (03:10 UTC) · **เปรียบเทียบ commit ไม่ได้** เพราะสิทธิ์ GitHub หมดอายุระหว่างตรวจ (`bad_refresh_token`)
- จึง **ยืนยันไม่ได้** ว่า head ปัจจุบันยังเป็น `d0fe617` หรือไม่ · Claude Code ต้องตรวจเอง
- พบเอกสารบน branch ที่ชุดนี้ยังไม่ได้อ้าง: `docs/ceo-handoff/` (10 ไฟล์ เช่น CURRENT_PHASE_STATUS.md, KNOWN_ISSUES.md) · `docs/security/SEC-TEST-01.md` · `docs/security/SEC-URGENT-01-admin-default-credentials.md` · `docs/testing/CHAT-FIX-01.md`, `CHAT-FIX-02.md`, `CHAT-TEST-01.md` → **ยังไม่ได้อ่าน** · ต้อง reconcile ก่อนถือว่าชุดนี้เป็นภาพรวมครบ

## A2. งานที่เกิดหลัง 21 ก.ย. บน main แต่ **ไม่อยู่ในชุดนี้เลย** (ค้นแล้ว 0 ครั้ง: STEP 99–114, #18, FIX F, 02230ae)

| งาน | สถานะ (เสนอ/อนุมัติ/impl/main/deploy/prod) | แหล่ง |
|---|---|---|
| STEP 98–110: #14 prompt, #15 Contact CTA, #16-A/#16-B persona, #16 server guard, S-4 fix, #17 F-2 (WHOLE-SENTENCE), #16 Home prompt | ✅/✅/✅/✅ main/receptionTurn deploy หลัง STEP 106/ดูตาราง PASS | V · PKG §3 |
| STEP 112 FIX F: `chat_error_generic` 8 ภาษา + แก้ขอบเขตตัวแปร `data` | ✅/✅/✅/✅ commit `02230ae` (23 ก.ย.)/— client/FR normal + FR error PASS 23 ก.ย. | V · github.md |
| **#18** Firebase init race (ต้นเหตุ STEP 99 S-3 FAIL `backend_init_failed_local_only`) — `whenFirebaseReady()` + init gate 15 วินาที + Home รอ Firebase | ✅/✅ (ไฟล์ 1–2 มีการ์ด · ไฟล์ 3 Home **ไม่มีการ์ดอนุมัติ**)/✅/✅ ครบ 3 ไฟล์ (LIVE hash ตรง)/— client/**❌ ยังไม่ทดสอบ** | V STEP 113–114 · LIVE · CHAT |
| STEP 99 combined regression §36.5 | **PAUSED** ที่ S-3 FAIL · ต้อง rerun S-3 หลัง #18 | V |

## A3. ข้อขัดแย้งที่พบ (รายงาน ไม่ตัดสิน)

| # | ชุดนี้เขียนว่า | หลักฐานอีกฝั่ง | ต้องให้ใครตัดสิน |
|---|---|---|---|
| X1 | H-2 = BLOCKED / NOT TESTABLE | V STEP 111: H-2 = PASS (Preview) · มติ CHAT: ใช้ "PASS (Preview)" ได้เฉพาะเมื่อมีหลักฐาน + ระบุ Production NOT VERIFIED · การตรวจสาธารณะที่ติด maintenance = BLOCKED แยก | Work + เจ้าของ (น่าจะเป็นทั้งคู่: Preview PASS · Production BLOCKED) |
| X2 | FR technical-error fallback ได้ EN — ยังต้องตรวจ | FIX F (STEP 112, `02230ae`) แก้แล้ว: เดิม fr ไม่มีคีย์ `chat_error_generic` จึงตกเป็น en · FR error = PASS 23 ก.ย. · ต้นเหตุ technical error ของรอบนั้น = **ไม่ทราบ** | Work ตรวจหลักฐานว่าพอปิดหรือไม่ |
| X3 | Home `submitWelcome` reachability ยังต้องตรวจ | การ audit ถูกสั่งในแชท Claude AI แต่ **ผลไม่ถูกเก็บไว้ในหลักฐานที่ส่งต่อได้** → UNVERIFIED | Claude Code ตรวจ source ใหม่ |
| X4 | PR #8 base = `claude/chat-live-01` (beec235) | main มี #18 (3 ไฟล์: ContactRail, Home, firebase-client.js) + FIX F + โฟลเดอร์ `m17/` — **ไม่ทราบ** ว่า chat-live-01 มีงานเหล่านี้หรือไม่ → เสี่ยงชนกันตอน merge / ทับ #18 | Claude Code เทียบ main ↔ chat-live-01 ↔ listing-e2e-01 ก่อน merge ใด ๆ |
| X5 | กฎข้อ 5: Claude Code อัปเดต Viewer | Viewer อยู่ใน Claude AI Project เท่านั้น ไม่อยู่ใน repo (HO เดิม) · ส่งสำเนาออกไปแล้ว 1 ต.ค. → **มี Viewer สองที่ เริ่มแยกกัน** · Viewer ใน Claude AI ล้าสมัย (STEP 114 ยังขึ้น "รอ commit", "#18 DELIVERY NOT STARTED") | เจ้าของเลือก Viewer ตัวหลักเพียงที่เดียว |
| X6 | workflow ปัจจุบัน = Code push draft branch | CLAUDE.md ใน Claude AI Project ยังบังคับ §29 (Viewer + เจ้าของ commit) · CLAUDE.md บน main ยังเป็นแบบ zip เก่า → **CLAUDE.md มีสามสภาพ** | เจ้าของยืนยัน workflow เดียว แล้วให้ Code sync CLAUDE.md |
| X7 | HO ประวัติ §3: Agent Signup `type="text"` | source ใน Claude AI Project: `type="{{ signupPasswordType }}"` / `{{ loginPasswordType }}` ค่าเริ่ม `password` + ปุ่มตา → ป้ายน่าจะล้าสมัย · ฉบับบน main/branch = ยังไม่ตรวจ | Claude Code ตรวจ branch |
| X8 | — (ไม่กล่าวถึง) | โฟลเดอร์ `m17/` (102 ไฟล์) ถูกเพิ่มบน main ระหว่าง `02230ae`→`2192b0b` · ไม่มี maintenance gate · มี service worker · ผู้เพิ่ม/เจตนา = **ไม่ทราบ** | เจ้าของ |
| X9 | บัญชี Staff TEST มีอยู่แล้ว | ในโปรเจกต์ production ไม่พบบันทึกบัญชี Staff ทดสอบ (PKG §9.4) — สอดคล้องกัน: บัญชีที่ชุดนี้ระบุอยู่ใน **TEST project** เท่านั้น | — (ไม่ขัด แค่ยืนยันขอบเขต) |
| X10 | — | ไฟล์ในโปรเจกต์ Claude AI ต่างจาก main: Property Details (−20 KB) · Lister Dashboard (−20 KB) · AI Concierge · firebase.json · CLAUDE.md · rules ยังไม่ได้เทียบ → **อย่าใช้ไฟล์จาก Claude AI Project เป็น source** | Claude Code ใช้ GitHub เป็นตัวจริง |

## A4. งานค้างจากประวัติที่ยังไม่อยู่ในตารางปัจจุบันของชุดนี้
- **#10** VERIFICATION PENDING (R10-TRUTH) · **#12** OPEN (CHAT_I18N ขาดคีย์ · จำนวนที่เหลือไม่ทราบ) · **#13** OPEN (ภาษาไม่ส่งต่อ Owner Submission) · **#14** ยังไม่ CLOSED (S-3 ❌, S-5 ?) · **#15/#17** PASS ยังไม่ประกาศ CLOSED · **#16** Home Production NOT VERIFIED, AI Concierge ผลทดสอบไม่ทราบ · **#18** ยังไม่ทดสอบ production — PKG §4
- 9 ข้อทดสอบ BLOCKED เพราะไม่มีทรัพย์เผยแพร่จริงบน production (T-1 V-1 V-2 V-4 V-5 B-1 C-4 TX-1 TX-2) — PD-12 ห้ามสร้างเพื่อให้ผ่าน · ข้อมูล TEST project **ไม่ใช้แทน** ได้ถ้าไม่มีมติ
- **อัปเกรด Node.js 20 ก่อน 30 ต.ค. 2569** (BP ประวัติ · เหลือ ~27 วัน) — ไม่อยู่ในตารางปัจจุบัน
- โหมด Stripe (Live/Test) · วันที่ deploy Functions ทุกตัว · rules ที่ deploy บน production = **ไม่ทราบ**
- สูตรแบ่งค่าคอม 20/40/40 = **ไม่พบหลักฐาน ไม่ใช่มติ** · ระบบ Participants/Commission = ห้ามสร้าง (BP §26.6) — PKG §9

## A5. สิ่งที่ Claude Code ควรตรวจก่อนรับช่วง (ไม่ใช่คำสั่งแก้)
1. head ปัจจุบันของ `claude/listing-e2e-01` เทียบ `d0fe617`
2. diff `main` ↔ `claude/chat-live-01` เฉพาะ ContactRail.dc.html · Home.dc.html · firebase-client.js (X4)
3. อ่าน docs/ceo-handoff/, docs/security/, docs/testing/CHAT-FIX-*.md (A1)
4. ตรวจ Home `submitWelcome` และ Agent Signup บน branch (X3, X7)


---

# ข้อสรุป Work และข้อกำหนดแผง PROJECT-STATUS — v2

## 1. การประสานสองฝ่าย

ชุดนี้เก็บ v1.1 จาก GitHub ครบและเพิ่มภาคผนวก Claude AI ครบ ไม่ใช้สำเนา Claude AI เป็น runtime source. ข้ออ้างใหม่ที่ยังไม่ตรวจเก็บ SOURCE-REPORTED/UNVERIFIED; ไม่เลือก PASS โดยผู้ใช้โหวตเมื่อหลักฐานต่างบริบท

| เรื่อง | สถานะปัจจุบันที่ให้ใช้ | หลักฐาน/ขั้นถัดไป |
|---|---|---|
| #18 Firebase init / Home และ FIX F | Claude AI รายงาน source บน main; ยังต้องเทียบ source/commit จริงกับ branch | Code ตรวจ main ↔ chat-live ↔ listing เฉพาะ ContactRail/Home/firebase-client; ไม่ merge/cherry-pick รอบนี้ |
| FR fallback | แยกปัญหาภาษา fallback (รายงาน FIX F ผ่าน 23 ก.ย.) จาก technical error ต้นทาง (ยังไม่ทราบ) | ตรวจ commit 02230ae และหลักฐานเดิมก่อนปิด; ไม่ retry FR รอบนี้ |
| H-2 | Preview PASS ตามรายงาน / Production BLOCKED หรือ NOT VERIFIED ตามหลักฐานที่ขาด | ไม่ขัดกันหากคนละ environment; ต้องแนบหลักฐานก่อนเรียก Preview VERIFIED |
| #14 / S-3 / combined regression | #14 PASS ใน snapshot เก่า ไม่ใช่ทั้งชุด regression CLOSED | Claude AI รายงาน STEP99 paused S-3; ตรวจ scope/date ก่อนปิด |
| Home submitWelcome | UNVERIFIED execution/UI reachability | source audit ภายหลังตาม scope ไม่สร้าง UI แฝง |
| Branch/main merge | ลำดับ merge ยังไม่มีมติ; branch มีฐาน main ตาม Code report ไม่สรุปว่า #18 หายหรือจะถูกทับแน่นอน | ทำ comparison แล้วรายงานความต่าง; ห้าม merge |
| Viewer หลายฉบับ / CLAUDE หลายฉบับ | Code dashboard เป็น operational view หลัก; GitHub source จริงและชุดส่งต่อกลาง | รักษา Viewer เดิมเป็นประวัติ/เวอร์ชันอ้างอิง ไม่ต้องย้าย HTML ทั้งชุดเพื่อทำ status dashboard |
| Agent password | default password ตาม Code source report; UI real ยังไม่ตรวจ | ไม่กลับไปแก้จากป้าย issue เก่าโดยไม่ดู source |
| m17/ | Claude AI รายงานเพิ่มบน main; เจตนา/ผลกระทบยังไม่ทราบ | inventory/read-only ก่อนเสนอ scope; ไม่ลบ/ปิดอะไรเอง |
| Node 20 | ข้อมูล deadline ที่พบจากรายงานเดิมยังไม่ยืนยันกับ official runtime lifecycle | Code ตรวจ Node engine/รุ่น dependencies และเอกสารทางการก่อนตั้ง deadline/แผนอัปเกรด ไม่ยืนยัน 30 ต.ค. เป็นข้อเท็จจริงในชุดนี้ |
| Stripe mode / production deployed rules/functions | UNKNOWN ในหลักฐานที่มี | ห้ามประกาศพร้อมจาก docs อย่างเดียว |

#10/#12/#13 ต้องอยู่ในตารางค้าง; #15/#17 มีรายงาน PASS แต่ CLOSED ต้องตรวจขอบเขต; #16 Home production/AI Concierge ยังไม่ยืนยันตาม Claude AI. Blocked production tests T-1/V-1/V-2/V-4/V-5/B-1/C-4/TX-1/TX-2 คงแยก ไม่ใช้ synthetic TEST แทนหลักฐาน production. ไม่ออกมติ commission 20/40/40 ที่ไม่มีที่มา

ต้องอ่าน docs/ceo-handoff/, docs/security/, docs/testing/CHAT-FIX-01/02 และ CHAT-TEST-01 ก่อนรับรองว่า inventory ครบ. รอบ Work นี้ยังไม่ได้ audit เนื้อหาทั้งหมด; เก็บเป็นงานเอกสารตรวจต่อ ไม่เรียกชุดนี้ว่ารับรองระบบทุกส่วนแล้ว

## 2. รูปแบบแผงหลักที่เจ้าของยืนยัน

แผงใช้สำหรับ Claude Code/Claude AI/Work เข้าใจงาน ไม่ใช่หน้าเว็บลูกค้า. Claude Code เป็นผู้สร้างภายในช่องทางที่ใช้งานได้จริง; ถ้า Artifact ใช้ไม่ได้ให้บอกช่องทางทดแทนที่เปิดได้ ไม่อ้างว่าติดตั้งใน Work/Claude แล้วจากการสร้างไฟล์อย่างเดียว

ลำดับการแสดง:
1. CURRENT: เป้าหมายโครงการ, งานปัจจุบัน, รหัส phase, environment, package version, updated date, code SHA/doc SHA/deployed SHA
2. YOU DO NOW: เจ้าของทำครั้งละหนึ่ง action หรือ "ยังไม่ต้องทำอะไร"; ระบุจอ/ลิงก์/เงื่อนไขผ่าน/ขั้นถัดไป
3. ความคืบหน้าแยก development / real TEST verification / production readiness พร้อมตัวเศษ ตัวหาร และ blocking issue
4. Roadmap 0–24 คงรหัสเดิม C/Phase; รายการงานปัจจุบัน CHAT-LIVE/LISTING เชื่อมกับ phase ไม่อ้างเท่ากัน
5. Tasks table: id, plain Thai name, status+สี+ข้อความ, applicable scope, passed/total, next action, responsible actor, date/commit, expandable evidence
6. Known issues/blocked/old useful work รวม DOC-OBS-01…05 และ issue registry ที่ reconcile แล้ว
7. History/decision/evidence กดขยายได้; ข้อมูลสถานะปัจจุบันไม่จมในประวัติ

หน้าจอภาษาไทยเป็นหลัก อ่านง่าย ฟอนต์ชัด desktop/mobile; ไม่ใช้สีอย่างเดียว; filter ตาม system/phase/environment/status ได้ถ้ารองรับ; ตารางแนวยาวบนมือถือใช้การ์ดหรือ horizontal scroll ที่อ่านได้. ไม่ต้องรื้อ Viewer เดิมทั้งหมด และไม่ย้ายข้อมูล runtime/customer เพื่อทำ dashboard

## 3. เปอร์เซ็นต์ที่ตรวจสอบได้

- ก่อนมี checklist/scope denominator ที่ review แล้ว แสดง "ยังคำนวณไม่ได้ — กำลังยืนยันรายการ" ไม่ใส่ 0% แทน unknown และไม่เดา % รวมเว็บ
- Scope งานที่ยังไม่เริ่มและมี checklist แล้วแสดง 0/N = 0%; ข้อ N/A ตัดออกได้เฉพาะมีเหตุผล; BLOCKED/FAIL/UNVERIFIED ยังอยู่ในตัวหาร ไม่ตัดเพื่อให้ % สูง
- สูตร = จำนวน acceptance items ที่ผ่านหลักฐานตามระดับที่แสดง / จำนวน applicable acceptance items ใน scope นั้น ×100; แสดงจำนวนคู่เปอร์เซ็นต์เสมอ ใช้น้ำหนักเท่ากันเว้นมีมติน้ำหนักใหม่
- Development, local tests, real TEST, production ต่างตัวหาร/หลักฐาน ห้ามเอา 90 tests local ไปผสม 7 pictures ให้เป็น progress. ภาพ 7/7 เป็น photo-specific check ไม่ใช่ 100% ของ listing system
- Parent phase % คิดจาก atomic criteria ที่ไม่ซ้ำ ไม่เฉลี่ย % งานย่อยที่คนละขนาด ไม่รวมแถวที่ทับกัน ไม่ใช้จำนวน commit/คำสั่ง/เวลาเป็นความสำเร็จ
- 100% ของ checklist ไม่อนุมัติ release อัตโนมัติ: approval/security/migration/deploy gates ต้องผ่านและผู้มีอำนาจยืนยัน; defect critical ทำ readiness BLOCKED แม้บาง checklist 100%
- ห้ามผสมกับ property-information %, photo readiness หรือ intake 19/19 ของหนึ่งเคส แผงนี้วัดงานพัฒนาโครงการ
- เปลี่ยน scope ให้ version/date/reason/approver; แสดง scope เปลี่ยน ไม่แก้ตัวหารเงียบ ๆ เพื่อปรับ %

สี: 🟢 ผ่านเฉพาะระดับระบุ; 🟡 กำลังทำ/บางส่วน/รอหลักฐาน; 🔴 fail/blocker; ⚪ not started; 🔵 approved direction/future. Production RED/Public Hidden เป็นสถานะเว็บไซต์ แยกจากสีความคืบหน้ารายงาน

## 4. ข้อมูลกลางและการอัปเดต

PROJECT-STATUS.md เป็นทะเบียนสถานะ; dashboard แสดงรายการเดียวกัน ห้ามมี manual status แยกสองชุดที่ไม่ sync. ถ้าต้องมี JSON/JS data ภายในแผง Code ต้องสร้างจากทะเบียนและมีคำสั่ง/วิธี sync ที่ตรวจได้ ไม่เพิ่มเป็นไฟล์หลักที่สี่. Dashboard แสดง source package version เสมอ; ถ้าไม่มีทางตรวจ version ล่าสุดให้แสดง "snapshot ณ… / ยังไม่ตรวจความสด" ไม่อ้าง live sync อัตโนมัติ

ทุก closing round ส่งสามไฟล์ฉบับเต็ม + change summary + document commit link และ dashboard updated version. Code ตรวจ source guard/doc changes, เปิดดู dashboard จริงและตรวจว่าตัวเลขตรงทะเบียนก่อนรายงาน ready; ส่งลิงก์/วิธีเปิดที่เจ้าของใช้ได้ Work review. ไม่ต้อง rerun unrelated backend suite สำหรับ docs-only; ถ้าแก้ runtime dashboard ให้ตรวจ rendering/counts/status ตัวจริงที่เกี่ยวข้อง

## 5. งานมอบหมายถัดไป — DOCUMENTATION + INTERNAL STATUS DISPLAY ONLY

Claude Code อ่าน v2 ทั้งสามไฟล์ เทียบ v1.1 ใน repo รักษาประวัติ; ตรวจ source/report conflicts ที่อ่านได้และ docs inventory; ใส่ current header v2 ชัดเจน; สร้าง/ปรับ internal PROJECT-STATUS dashboard ตาม spec นี้. การสร้างแผงติดตามได้รับอนุมัติจากเจ้าของแล้ว ไม่ใช่อนุมัติแก้ source เว็บไซต์/Functions/rules

ห้าม merge/deploy/GREEN, migration/production writes, old CHAT-LIVE script, defect fixes แฝง. Unknown เก็บ unknown; audit source ไม่จำเป็นต้อง production traffic/test. ส่ง head เอกสาร/แผงใหม่ + สามไฟล์เต็ม + review report ให้ Work; หากรายการ acceptance ยังไม่ lock ให้แผงแสดงยังคำนวณไม่ได้ก่อน

---

## ผลตรวจและประสานโดย Claude Code — ชุด v2 เทียบ repository (3 ต.ค. 2569 · CODE-V2-01 · เอกสารและแผงภายในเท่านั้น)

**ขอบเขต:** รับ `HP-HANDOFF-2026-10-03-v2` (Work v1 + Code v1.1 + Claude AI ADDENDUM-CLAUDE-AI-01 + ข้อสรุป Work) ตรวจกับ git ของ repository; **ไม่แก้ระบบเว็บ/Functions/rules, ไม่แก้ DOC-OBS, ไม่ merge/deploy, ไม่แตะ production, ไม่รัน test ชุดหลังบ้านซ้ำ**. รักษาประวัติครบ: ทุกบรรทัดของ v2 และของไฟล์เดิมใน repo อยู่ครบ (ตรวจทีละบรรทัด) แล้วเพิ่มบล็อกนี้ท้ายไฟล์. SHA: **code/TEST = `d0fe6173ed2aa49fa92337b8519ca3eefb5fe7a5`** · เอกสาร v1.1 = `34a0eb0ee27bddfa72003958dd7e0546a9b490b2` · document commit ของรอบนี้ = รายงานในข้อความส่งกลับหลัง commit · deployed production = ไม่ทราบ (ไม่แตะ). `origin/claude/listing-e2e-01` ก่อนรอบนี้ = `34a0eb0` (เทียบ `d0fe617` เปลี่ยนเฉพาะ `.md`) ตอบ A5-1.

### ผลตรวจรายข้อ (SOURCE = git/ไฟล์ใน repo; ไม่ใช่ production)
| ข้อ | ผลตรวจ | สถานะ |
|---|---|---|
| X4 / A5-2 ความเสี่ยงชน #18 | `main` (`4e358a5`) เป็น ancestor ของ `chat-live-01` (+18 commit) และของ `listing-e2e-01` (+32 อีก). `4e358a5` (Home #18) และ `02230ae` (FIX F) เป็น ancestor ของ `listing-e2e-01` → **อยู่ใน branch แล้ว**. ไฟล์ทั้งสาม: `Home.dc.html` ไม่ต่างจาก main; `ContactRail.dc.html` ต่าง main +3/−1 (CHAT-FIX-02: ส่งธง `guard:"pd16"` ที่เส้นทาง claudeComplete); `firebase-client.js` ต่าง chat-live-01 +298/−31 (ส่วน listing). ใน branch ปัจจุบันยังมี `whenFirebaseReady` (firebase-client.js, ContactRail, Home) และ `_convInitPromise`/`backend_init_forced_local` (ContactRail) | ไม่พบสัญญาณว่า #18 ถูกทับ; **ยังไม่ได้ทดลอง merge/rebase จริง** ลำดับ merge ยังไม่มีมติ |
| X3 / A5-4 Home `submitWelcome` | ฟังก์ชันอยู่ `Home.dc.html` บรรทัด 733; ผูกกับปุ่มส่ง 2 จุด (121, 124) ภายใน `showWelcome` (ค่าเริ่ม true) | เข้าถึงได้ตาม source; **การรันจริง UNVERIFIED** |
| X7 / A5-4 Agent Signup | `type="{{ signupPasswordType }}"` / `{{ loginPasswordType }}` ค่าเริ่ม `"password"` + ปุ่มตา (บรรทัด 149/171/552–555) บน branch | ป้าย `type=text` ล้าสมัยตาม source; UI จริงไม่ได้ทดสอบ |
| X8 `m17/` | 102 ไฟล์ (มี `sw.js`, `sitemap.xml`, `manifest.webmanifest`, 8 ภาษา); เพิ่ม 2026-09-26 โดย 3 commit (3a0d4db, 3eed793, 2192b0b); `m17/index.html` ไม่มีคำว่า maintenance/ปิดปรับปรุง; `sitemap.xml` ราก **ไม่อ้าง** m17 | อ่านอย่างเดียว; เจตนา/ผลกระทบ = ไม่ทราบ ไม่แตะ |
| X5 / X6 Viewer และ CLAUDE.md | repo `CLAUDE.md` มีบล็อกชี้ชุดส่งต่อ+workflow ปัจจุบันแล้ว (ข้อความเดิมเก็บ); สำเนาโปรเจกต์ Claude AI ไม่ใช่ source; แผงใหม่ (ด้านล่าง) เป็นจุดดูหลักของ Code | รอเจ้าของยืนยัน workflow เดียว |
| X10 | ไฟล์ในโปรเจกต์ Claude AI ไม่ใช้เป็น source — ใช้ GitHub | ตรงกับข้อสรุป Work |
| X1 / X2 | เป็นข้อขัดที่ Work/เจ้าของตัดสิน — Code ไม่ตัดสิน. ตรวจแล้วว่า `02230ae` เป็น ancestor ของ branch (FIX F อยู่) | ไม่เปลี่ยนสถานะ |
| A1 เอกสารที่ยังไม่ได้อ้าง | `docs/ceo-handoff/` 10 ไฟล์ (ฟิลด์ Last Updated = 30 ก.ค. 2569 และมีแถบ PHS-CLOSE-1 → **ประวัติ ไม่ใช่ latest**); `docs/security/SEC-TEST-01.md` (probe ใน emulator, มีแถว GAP — ไม่ใช่ใบรับรอง), `SEC-URGENT-01-admin-default-credentials.md` (**เปิดอยู่ ยังไม่แก้ ไม่แสดงค่า**); `docs/testing/CHAT-FIX-01/02`, `CHAT-TEST-01`, `CHAT-LIVE-01-*` (stub+emulator ไม่ใช่ production PASS) | อ่านหัวเอกสาร/สถานะเท่านั้น ไม่ได้ audit เนื้อหาทั้งหมด; เพิ่ม SEC-URGENT-01 เข้าทะเบียนค้างแล้ว |
| Node.js 20 (A4) | `functions/package.json` engines = "20"; ภาพ deploy ของเจ้าของ (2 ต.ค.) มีข้อความจาก Firebase CLI ว่า Node 20 deprecated 2026-04-30 และจะถูกปิด 2026-10-30 | เป็นหลักฐานจาก CLI **ไม่ใช่เอกสารทางการ**; วันที่/แผนอัปเกรด = UNVERIFIED จนเทียบเอกสาร lifecycle |
| Stripe / rules-functions production | ไม่มีสิทธิ์/หลักฐาน | UNKNOWN คงเดิม |

### แผง PROJECT-STATUS ภายใน (สร้างรอบนี้)
- **ไฟล์:** `docs/status-panel/index.html` (หน้าเดียว เปิดได้โดยไม่ต้องต่อเน็ต) สร้างโดย `node tools/status-panel/build.js` (หรือ `npm run status-panel`) จาก **PROJECT-STATUS.md ที่เดียว**: ตารางเส้นทาง 0–24, ฐาน C0–C4.2 และงานปัจจุบัน §3 ถูกอ่านจากตารางในไฟล์นี้ตรงๆ; รายการที่เครื่องอ่านต้องใช้ (checklist เปอร์เซ็นต์, ผู้รับผิดชอบ, ทะเบียนค้าง, ประวัติ) อยู่ในบล็อก `STATUS-REGISTRY` ท้ายไฟล์ §6 — **แก้ที่นั่นแล้ว build ใหม่ ห้ามแก้ HTML**. ตรวจ: `npm run test:status-panel` (ตัวเลขใน HTML ต้องตรงทะเบียน).
- **เปอร์เซ็นต์:** ตามสูตรข้อสรุป Work §3 (ผ่าน/จำนวนที่ใช้ได้ ตามระดับหลักฐาน; ไม่ผสม local กับ TEST กับ production). **ยังไม่มี checklist ที่ Work lock** ดังนั้นแผงแสดง "ยังคำนวณไม่ได้" ในทุกขอบเขต และแสดง "ตัวอย่างถ้า lock ตามร่าง" แยกชัดว่าไม่ใช่ความคืบหน้า.
- **ความสดของข้อมูล:** แผงแสดง package/สถานะตามไฟล์ ณ commit ที่ build และบอกว่า "ไม่ตรวจความสดอัตโนมัติ".

### เอกสารที่เปลี่ยนรอบนี้ (ไม่มีไฟล์ระบบเว็บ)
`BLUEPRINT.md`, `HANDOFF-NEXT-CHAT.md`, `PROJECT-STATUS.md` (v2 + บล็อกนี้ + §6 ทะเบียน), `docs/status-panel/index.html`, `tools/status-panel/build.js`, `tests/status-panel/panel.test.js`, `package.json` (สคริปต์ 2 ตัว), ภาพตรวจ `docs/status-panel/shots/`.

---

## ผลปรับรอบ r2 — CODE-V2-01 r2 (3 ต.ค. 2569 · หลัง Work ตรวจเบื้องต้น · เอกสารและแผงภายในเท่านั้น)

**ที่มาของงาน:** คำสั่งให้ "ปรับเอกสารและแผงตาม 5 จุดข้างต้น" **ไม่มีรายการ 5 จุดแนบมา** และไม่พบความเห็นใหม่ของ Work ใน PR #8 — Code จึงตีความว่าหมายถึง 5 ข้อที่รอตัดสินในรายงานรอบก่อน (D1–D5 ด้านล่าง) และ **ไม่ตัดสินแทนใคร**: บันทึกเป็น "รอตัดสิน" พร้อมตัวเลือกและข้อเสนอของ Code (ติดป้าย "ไม่ใช่มติ"). ถ้า 5 จุดของ Work คือเรื่องอื่น ให้ส่งรายการมา Code จะปรับต่อโดยไม่ทิ้งรอบนี้.
**ไม่เปลี่ยน:** code/TEST SHA `d0fe6173ed2aa49fa92337b8519ca3eefb5fe7a5` · ไม่แก้ระบบเว็บ/Functions/rules · ไม่แก้ DOC-OBS · ไม่ merge/deploy · **ยังไม่ lock เปอร์เซ็นต์** (ทุกขอบเขตยัง `locked:false` จนกว่า Work ตรวจ checklist ที่แยกขอบเขตแล้ว).

| ข้อ | สิ่งที่ปรับ |
|---|---|
| แยกขอบเขต checklist | เดิม 4 ชุดรวม → **11 ชุด ตัวหารแยกกัน**: พัฒนา 4 (`S-DEV-CORE` โมเดล/เผยแพร่ · `S-DEV-PHOTOSTAFF` รูป/Staff · `S-DEV-DEPLOY` · `S-DEV-QUALITY` ช่องโหว่/ทดสอบซ้ำ), TEST 3 (`S-TEST-FLOW` เส้นทางหลัก · `S-TEST-PUBLIC` หน้าสาธารณะ/DOC-OBS · `S-TEST-NEG` ปฏิเสธ/ลบ/ซ้ำ/ช้า/AI), production 3 (`S-PROD-SEC` · `S-PROD-REL` · `S-PROD-CHAT`), เอกสาร 1 (`S-DOC`, เพิ่ม R08–R11). รายการเดิมครบ (49) ไม่แก้ผลสถานะ; รวม 53 รายการ. ไม่มีเปอร์เซ็นต์รวมข้ามสภาพแวดล้อม |
| D1 lock เปอร์เซ็นต์ | รอ Work ตรวจและ lock ทีละชุด (ผู้ตัดสิน: Work) |
| D2 หน่วยขนาดที่ดิน | รอเจ้าของ: ตร.ว. / ตร.ม. / ใช้ ไร่-งาน-ตร.ว. (กระทบ DOC-OBS-02 · T12) |
| D3 ลำดับ merge | รอเจ้าของ (กลไก branch เป็นเส้นตรง แต่ประตู production ยังไม่ผ่าน → ข้อเสนอ Code: ยังไม่ merge) |
| D4 CLAUDE.md ฉบับเดียว | รอเจ้าของ (ตอนนี้: ฉบับ repo + บล็อกชี้ชุดส่งต่อ) |
| D5 ลำดับงานถัดไป | รอเจ้าของ (ข้อเสนอ Code: audit DOC-OBS ก่อน แบบอ่านอย่างเดียว) |
| ชุดส่งต่อรุ่นเดียวกัน | แผง, Viewer/พรีวิว และสามไฟล์แสดงชุดเดียวกัน: `HP-HANDOFF-2026-10-03-v2 + CODE-V2-01 r2` พร้อม commit เอกสารที่รายงานท้ายคอมเมนต์ PR |
| Artifact | เผยแพร่แผงเป็น Artifact ส่วนตัวแล้ว; **Code เปิดหน้า claude.ai เองไม่ได้ จึงยืนยันการแสดงผลได้เฉพาะ HTML ชุดเดียวกันใน Chromium ในเครื่อง** (R11 = UNVERIFIED) — วิธีเปิดที่ใช้ได้จริง: ดาวน์โหลด `docs/status-panel/index.html` แล้วเปิดในเบราว์เซอร์ |

## ผลปรับรอบ r3 — CODE-V2-01 r3 (3 ต.ค. 2569 · ตาม "5 จุด" ที่ Work ระบุ · เอกสารและแผงภายในเท่านั้น)

**แก้ความเข้าใจรอบ r2:** "5 จุด" ที่ Work หมายถึง **ไม่ใช่ D1–D5** (r2 ตีความผิด — ข้อ D1–D5 ยังเก็บไว้เป็นทะเบียนข้อรอตัดสินเหมือนเดิม แต่ D3/D4 ปรับสถานะตามมติด้านล่าง) 5 จุดจริงและสิ่งที่ปรับ:

| # | จุดของ Work | สิ่งที่ปรับ |
|---|---|---|
| 1 | ยืนยันการเปิด Artifact แผงจริง; ตรวจภาพเองไม่ได้ให้คง UNVERIFIED และใช้ภาพจากเจ้าของแยก | Code สั่งเปิด/อ่าน Artifact ได้ แต่ **เห็นภาพบน claude.ai เองไม่ได้** → `R11` คง UNVERIFIED; เพิ่ม `R12` "ภาพจากเจ้าของยืนยันการเปิดแผง" (UNVERIFIED รอภาพ) แยกจาก R11; วิธีเปิดที่ใช้ได้จริง = ดาวน์โหลด `docs/status-panel/index.html` แล้วเปิดในเบราว์เซอร์ |
| 2 | แยก checklist แชท AI ออกจาก Listing ก่อนคำนวณ % | ย้าย `T22` (แชท AI จริงบน TEST) ออกจาก `S-TEST-NEG` ไปขอบเขตใหม่ **`S-TEST-CHAT`**; `S-PROD-CHAT` (P07) คงแยกอยู่แล้ว → ขอบเขตรวม **12 ชุด**: พัฒนา 4 · TEST 4 · production 3 · เอกสาร 1; ทุกชุดยัง `locked:false` → ยังไม่แสดง % |
| 3 | Node.js 20 = UNVERIFIED จนตรวจ lifecycle ทางการ ไม่ใช่ FAIL เพียงเพราะใช้รุ่น 20 | `P06` เปลี่ยนจาก FAIL เป็น **UNVERIFIED** (ตัวหารยังนับ); `ISS-NODE20` ปรับเป็นความรุนแรงระดับกลาง ข้อความ "ยังไม่ตรวจ lifecycle ทางการ"; ขั้นถัดไป = Code ตรวจเอกสารทางการ (ยังไม่ทำรอบนี้) |
| 4 | เจ้าของยืนยัน: แผง Code เป็นตัวหลัก + workflow Code → Work review → เจ้าของทดสอบ TEST ไม่ต้องถามซ้ำ | `D4` เปลี่ยนเป็น **ตัดสินแล้ว** (บันทึกที่มา: เจ้าของยืนยันผ่าน Work); `ISS-DOCS-SPLIT` เหลือเฉพาะการเขียน CLAUDE.md ฉบับปัจจุบันใหม่ (งานเอกสารแยกรอบ ไม่บล็อก) |
| 5 | ลำดับ merge พักไว้ ไม่ใช้เป็นเงื่อนไขบล็อกการปิดรอบเอกสาร | `D3` สถานะ **พักไว้ (parked)**; `ISS-MERGE` ข้อความขั้นถัดไปแก้ตาม; ยัง **ห้าม merge** จนมีมติ |

**ไม่เปลี่ยน:** code/TEST SHA `d0fe6173ed2aa49fa92337b8519ca3eefb5fe7a5` · ไม่แก้ระบบเว็บ/Functions/rules · ไม่แก้ DOC-OBS · ไม่ merge/deploy · ไม่ lock เปอร์เซ็นต์ · ข้อความ r2 ข้างบนเก็บไว้เป็นประวัติ

## ผลปรับรอบ r4 — CODE-V2-01 r4 (3 ต.ค. 2569 · ทะเบียนแนวคิดของเจ้าของ + ตรวจ source DOC-OBS · เอกสารเท่านั้น ยังไม่แก้ระบบเว็บ)

**หลักการของรอบนี้ (ตามที่ Work สั่ง):** เดินต่อจากระบบและเคส TEST เดิม มุ่งปิดเส้นทาง **รับข้อมูล → Staff → Owner → เผยแพร่/ปิด** ให้ครบ ไม่สร้างใหม่ ไม่ทำทุกแนวคิดพร้อมกัน · ก่อนเสนอแก้ทุกจุด ตรวจข้อกำหนดที่เกี่ยวข้องก่อน (ดูคอลัมน์ "ตรวจข้อกำหนด" ด้านล่างและในแผง ส่วน 5ข) · รอบนี้เป็นการตรวจ source และเอกสาร — **ส่งข้อค้นพบกับข้อเสนอแก้ขั้นต่ำให้ Work ตรวจก่อนแก้ระบบเว็บ**

**หมายเหตุสำคัญเรื่องที่มาของแนวคิด:** ข้อความสั่งงานรอบนี้ไม่ได้แนบรายการ "แนวคิดที่เจ้าของเสริม" ฉบับใหม่มา — Code จึง **รวบรวมจากแนวคิด/ทิศทางที่เจ้าของเคยให้ไว้และบันทึกอยู่ในชุดส่งต่อแล้ว** (Roadmap 0–24, BLUEPRINT §26.15/§28/§24.8/โมเดลรายได้/social roadmap, CLAUDE.md, ทะเบียนค้าง) แล้วจัดชั้นใหม่; ถ้าเจ้าของมีแนวคิดอื่นที่ยังไม่อยู่ในรายการ ให้ส่งมาเพื่อเพิ่มในทะเบียน (แผง ส่วน 5ก) — Code ไม่เดาเพิ่มเอง

### ทะเบียนแนวคิด (แผง ส่วน 5ก · `ideas` ใน STATUS-REGISTRY)
| ชั้น | รหัส | เนื้อหา |
|---|---|---|
| **งานปัจจุบัน** (ปิดเส้นทางหลัก) | I01–I04 | รับข้อมูลพร้อมรูป · Staff เตรียมข้อมูลกลาง · Owner preview/อนุมัติ/เผยแพร่/ปิด · หน้าสาธารณะแสดงถูกต้อง (DOC-OBS-01…05) |
| **จำเป็นต่อขั้นถัดไป** | I05–I08 | ตัดสินหน่วยที่ดิน (D2) · เติม Cloud TEST ฝั่งปฏิเสธ/ลบ/ซ้ำ/ช้า (T17–T21) · บังคับสิทธิ์ที่ rules + rate limit (D09–D11) · ย้ายข้อมูลเก่าก่อน production (P01, BLOCKED) |
| **งานอนาคต** (บันทึกไว้ ไม่ทำรอบนี้) | F01–F08 | Demand/Qualification (C5) · Matching/คอลเลกชัน (C6) · Viewing/Handoff/Negotiation/Deal · Phase 2B/2C/2D · แชท AI จริงบน TEST · Supply/Demand umbrella + โมเดลรายได้ · Facebook/LINE/TikTok · alt-text SEO + guardrail ค่า API |

### ข้อค้นพบจากการตรวจ source (ยังไม่แก้) และข้อเสนอแก้ขั้นต่ำ — รอ Work ตรวจ
| ข้อเสนอ | จุดสังเกต | ที่พบ (SOURCE) | แก้ขั้นต่ำ | ตรวจข้อกำหนดก่อนเสนอ | ความเสี่ยง |
|---|---|---|---|---|---|
| **FX-1** | DOC-OBS-04 อนุมัติโดย "-" | ยืนยัน: `Listing Approvals.dc.html:1091` อ่าน `p.approvedBy` แต่ server เขียน `approvedByEmail/Uid/Role` (`listing-case.js:517`) และ `approvedBy*` เป็นฟิลด์ภายใน (`case-fields.js` PRIVATE_FIELDS) | หน้า Approvals ใช้ `approvedBy \|\| approvedByEmail \|\| approvedByRole \|\| "-"` | อีเมลอยู่ใน Case ภายใน ไม่รั่วหน้าสาธารณะ; ไม่แตะ rules/Functions/Cloud | ต่ำ |
| **FX-2** | DOC-OBS-03 แผนที่ undefined / 0 กม. | พบต้นเหตุ: `Property Details.dc.html:856–867` ตกไปใช้ `raw.distanceBeach/Town` เมื่อไม่มีพิกัด → `0` (data.js ใส่ค่าเริ่ม) หรือ `undefined`; บรรทัด 872–874 ใช้ `zoneText` ที่อาจว่าง | ถ้าไม่มีพิกัดและระยะไม่ใช่ตัวเลข > 0 ให้ซ่อนบรรทัดระยะ; ไม่มีโซนให้แสดงเฉพาะพื้นที่ | ห้ามอ้างว่าคำนวณระยะจริง; ตัวอย่างเดิมที่มีค่าต้องไม่ regress; ไม่เพิ่มข้อความจึงไม่ติดกฎ 8 ภาษา | ต่ำ |
| **FX-3** | DOC-OBS-05 หลังปิดหน้าว่าง | ยืนยัน (ไม่ใช่ข้อสันนิษฐานแล้ว): `Property Details.dc.html:802` คืน `hasProperty:false` และเนื้อหาทั้งหน้าอยู่ใต้ `sc-if hasProperty` ไม่มีมุมมองทดแทน; `window.__hhDataLoad.state="failed"` แยกกรณีโหลดล้มได้ | บล็อกข้อความ: state ok → "ไม่พบประกาศนี้หรือปิดประกาศแล้ว" (ข้อความเดียวทุกกรณี) + ปุ่มกลับค้นหา; failed → "โหลดไม่สำเร็จ ลองรีเฟรช" | ต้องมี 8 ภาษา (เพิ่มคีย์ใน data.js); ไม่เปิดเผยว่า Case ส่วนตัวเคยมี; ไม่ทำให้ TEST build มี sample fallback; ไม่แสดงข้อมูล/รูปใดๆ | ปานกลาง |
| **FX-4** | DOC-OBS-01 Search ไม่มีรูปปก | **ยังไม่พบต้นเหตุจากการอ่าน**: เส้นทาง Search → `getEffectiveProperties` → `fetchAllPhotos` → `photosById` → `p.photos[0].url` → `PropertyCard` ถูกต้องตามทฤษฎี; test ในเครื่องไม่ assert รูปปก | ขั้น 1 (ไม่แก้เว็บ): เพิ่ม test เผยแพร่เคสแล้วเปิด Search จริง (ผู้เยี่ยมชม/Owner) assert รูปปก; ถ้า pass ให้เจ้าของเก็บภาพ Network 1 ครั้ง; ขั้น 2: แก้เฉพาะที่พิสูจน์ได้ | รูปส่วนตัวห้ามเปิดสาธารณะ; ไม่ใช้ sample แทน (PD-12); ไม่เปลี่ยน rules propertyPhotos | ประเมินไม่ได้ |
| **FX-5** | DOC-OBS-02 หน่วยที่ดิน | ยืนยัน: ฟอร์ม/Case Data = ตร.ว.; `Property Details.dc.html:881` ต่อ `t.sqm`; `property-adapter.js:66` ไม่แปลง (100 ตร.ว. = 400 ตร.ม.) | **รอมติเจ้าของ D2** แล้วแก้ป้าย/แปลงแบบมีป้าย | ห้ามแก้ค่าบน Cloud; ห้ามแปลงข้อมูลเดิมย้อนหลังเงียบๆ; ต้องมีหน่วย 8 ภาษา | ปานกลาง |

**ลำดับที่เสนอ (ข้อเสนอของ Code ไม่ใช่มติ):** FX-1 → FX-2 → FX-3 (เล็ก ไม่ต้องรอมติหน่วย) · FX-4 ต้องมีหลักฐานก่อน · FX-5 หลัง D2. ทุกข้อ **ยังไม่ได้แก้** และรอ Work ตรวจ

**ไม่เปลี่ยน:** code/TEST SHA `d0fe6173ed2aa49fa92337b8519ca3eefb5fe7a5` · ไม่แก้ระบบเว็บ/Functions/rules · ไม่แก้ DOC-OBS · ไม่ merge/deploy · ไม่ lock เปอร์เซ็นต์ · ไม่รันชุดทดสอบ backend/browser ในรอบนี้ (ตรวจด้วยการอ่าน source เท่านั้น — ยังไม่ได้ทดลองในเบราว์เซอร์) · ข้อความ r2/r3 เก็บเป็นประวัติ

## ผลปรับรอบ r5 — CODE-V2-01 r5 (3 ต.ค. 2569 · ตาม WORK REVIEW head f4d8090 · รวมข้อกำหนดเจ้าของ + อัปเดตสถานะ + FX-3 ใน draft branch)

**แยกมติ/ข้อกำหนด ออกจากสิ่งที่ทำสำเร็จแล้ว:** ส่วน A ด้านล่างเป็น **ข้อกำหนดของเจ้าของ** (บันทึกและตรวจช่องว่างจาก source) ไม่ใช่รายการที่ทำเสร็จ; ส่วนที่ "ทำแล้ว" ระบุแยกในคอลัมน์สถานะ. ไม่สร้างฟังก์ชันตามส่วน A ในรอบนี้ — เป้าหมายปัจจุบันคือ **รับข้อมูล → ยืนยันส่ง → Staff ตรวจและเตรียม → Owner อนุมัติ → เผยแพร่/ปิด** บนระบบและเคส TEST เดิม; Phase 2B/2C/2D **ไม่ถือว่าเสร็จ** เพียงเพราะฟอร์ม TEST ทำงาน

### A. ข้อกำหนดเจ้าของ แยก 3 ชั้น (แผง ส่วน 5ข · `reqs`)
| รหัส | ชั้น | ข้อกำหนด (ย่อ) | ตรวจจาก source (ช่องว่าง) | สถานะ |
|---|---|---|---|---|
| A1 | **ปัจจุบัน** | ผู้ส่ง 3 กลุ่ม (บริษัท/เอเจนต์/ลูกค้าทั่วไป) ทุกกลุ่มต้องผ่าน Staff และ Owner อนุมัติก่อนเผยแพร่ | บทบาทผู้ส่งกำหนดที่ server (`listing-case.js:257/273`); ยังไม่ตรวจปุ่ม AI→ฟอร์ม; agent/Owner-ส่งเอง บน Cloud ยังไม่ทดสอบ | ทำแล้วบางส่วน |
| A2a | **ปัจจุบัน** | ต้องตรวจสรุปแล้วกดยืนยันส่งชัดเจน (ติดต่อเรา/เริ่มคุย/กรอก ≠ ยืนยัน) | ฟอร์มมีขั้นตรวจสรุป+ปุ่มส่ง (Cloud T02 ผ่าน); ทางแชท UNVERIFIED | ฟอร์มทำแล้ว |
| A2b | เมื่อถึงขั้น | หลายช่องทางเข้า (ฝากขาย/แชท/ติดต่อเรา) เชื่อมร่างเดียวเมื่อรู้ intent | ไม่พบฟิลด์ "ช่องทางเข้า" แยก และไม่พบการเชื่อมจาก "ติดต่อเรา" | ช่องว่าง (Phase 2C/2D) |
| A3 | เมื่อถึงขั้น | AI+ฟอร์มใช้ร่างเดียว ไม่ซ้ำ ไม่ถามซ้ำ ไม่เขียนทับเงียบๆ | ฟอร์มเติมเคสที่แชทเปิดในเคสเดิม + (uid, submissionKey) → เคสเดียว; กติกาไม่เขียนทับ/ไม่ถามซ้ำ ยังไม่ตรวจ | ทำแล้วบางส่วน |
| A4 | **ปัจจุบัน** | แยกข้อมูล 7 อย่าง (บทบาทผู้ส่ง/ที่มา/ช่องทาง/ผู้แนะนำ/เจ้าของทรัพย์/Staff/ผู้อนุมัติ); สิทธิ์ตรวจที่ server | มี submittedBy*/caseSource/ownerName/assignedTo*/approvedBy*; **ไม่พบ "ผู้แนะนำ" และ "ช่องทางเข้า"** | ช่องว่าง 2 ฟิลด์ |
| A5 | เมื่อถึงขั้น | Dashboard ทะเบียนกลางเดียว กรองที่มา/สถานะ/ผู้รับผิดชอบ; Owner รับงานแทนได้ | ทะเบียนเดียว caseInternal; Staff Workspace กรอง new/mine; กรองครบและ Owner รับแทน ยังไม่ตรวจ | ทำแล้วบางส่วน |
| A6 | **ปัจจุบัน** | สถานะแยก 7 ขั้น + พักไว้/ไม่ตอบ/ยกเลิก/สแปมแยกต่างหาก; ความครบ ≠ ผ่านตรวจ ≠ พร้อมเผยแพร่; ขอข้อมูลเพิ่มในเคสเดิม | มี pending/pending_owner/live/offline + reviewStatus + infoRequest (`listing-case.js:705`); **ไม่พบ พักไว้/ไม่ตอบ/ยกเลิก/สแปม** | เส้นทางหลักมี; 4 สถานะข้างเคียงเป็นช่องว่าง |
| A7 | เมื่อถึงขั้น | ตรวจ identity: Person/Property/Case/Listing; คนเดียวหลายทรัพย์; ทรัพย์เดียวหลายเคส; ห้ามรวมคนจากชื่อ | ปัจจุบัน caseId = propertyId = Listing (1:1:1) ข้อมูลคนอยู่ในเคส; **ไม่มีเอนทิตี Person/Property แยก**; ไม่มีโค้ดรวมคนจากชื่อ | ช่องว่างสถาปัตยกรรม — ห้ามเพิ่มรหัสจนกว่าจะออกแบบ+Work ตรวจ |
| A8 | เมื่อถึงขั้น | ส่งซ้ำ: คำขอเดิม→เคสเดิม; ผู้ส่ง/ทรัพย์ที่อาจซ้ำให้ Staff เปรียบเทียบ; IP เป็นสัญญาณประกอบ; ห้ามรวม/ลบอัตโนมัติ; ห้ามเปิดข้อมูลผู้ส่งอื่น | ซ้ำแบบเดียวกัน→เคสเดิม (submissionKey) ทำแล้ว; **ไม่พบการเปรียบเทียบสำหรับ Staff**; ไม่มีการรวม/ลบอัตโนมัติ (ตรงข้อห้าม) | ส่วนหนึ่งทำแล้ว; ส่วนเปรียบเทียบเป็นช่องว่าง |
| A9a | **ปัจจุบัน** | ปิดประกาศ: เอกสาร/รูปสาธารณะถูกลบ | B9 LOCAL + Cloud หนึ่งเคส (Search=0); ลบ backend/ลิงก์รูปเดิมบน Cloud ยังไม่ยืนยัน (T17/T18) | ทำแล้วบางส่วน |
| A9b | เมื่อถึงขั้น | แยก พักเคส/ล้างรูปร่าง/ลบเคส/ปิดประกาศ; ก่อนลบแสดงขอบเขต/จำนวนไฟล์/ขนาด/สิ่งที่ยังอยู่; ห้ามตัวล้างร่างกระทบเคสส่งตรวจ/ประกาศ; Staff เสนอ→Owner ยืนยันลบถาวร | มี take-down + reconcileListingFiles; **ไม่พบ พักเคส/ลบเคส/ล้างรูปร่าง และ Staff เสนอ→Owner ยืนยัน** | ช่องว่าง |
| A9c | อนาคต | ระบบล้างอัตโนมัติ | ไม่มี (ตรงข้อกำหนด) | งานอนาคต |
| A10a | **ปัจจุบัน** | เก็บที่มา/ประวัติเพื่อ attribution/แบ่งงาน/ค่าคอมในอนาคต | เก็บ caseSource/submittedBy*/assignedTo*/approvedBy*/ข้อความแล้ว (ขาด "ผู้แนะนำ" = A4) | มีพื้นฐาน |
| A10b | อนาคต | สูตรค่าคอม/สิทธิ์รับเงิน | ไม่มี ห้ามสร้าง | งานอนาคต |

**มติที่ยังไม่มี (ห้ามกำหนดเอง):** ระยะเวลาเก็บข้อมูล/ไฟล์แต่ละระดับ → บันทึกเป็น **D6 (รอเจ้าของ)** โดย Code ไม่เสนอจำนวนวัน

### B. สถานะตามผล Work
- **Lock `S-TEST-FLOW` = 9/9 = 100%** เฉพาะ "หนึ่งเคสสังเคราะห์" บน Cloud TEST — ไม่ใช่ความพร้อม production และไม่รวมการลบ backend/สิทธิ์ทั้งหมด
- **Lock `S-TEST-PUBLIC` = 2/7 ≈ 29%** คงข้อบกพร่องห้าข้อ (DOC-OBS-01…05) — ตัวเลขนี้ไม่ได้แปลว่าแก้แล้ว
- **`R12` = PASS** — เจ้าของส่งภาพ Artifact r3 จำนวน 6 ภาพ 3 ต.ค. 2569 เวลา 11:08–11:09; Work เปิดดูแล้วยืนยันว่าแสดงผลจริง (ไม่ใช่การรับรอง v4/v5 ทุกส่วน; ไม่ต้องขอภาพเดิมซ้ำ). **`R11`** คงข้อจำกัด "Code ไม่เห็นหน้าจอ claude.ai เอง" แยกจากหลักฐานภาพของเจ้าของ
- ขอบเขตอื่น **ยังไม่ lock**; แยกเกณฑ์ที่รวมหลายพฤติกรรมเป็นข้อย่อย (T17→a–c, T19→a–c, T20→a–b, T21→a–c, P04→a–b, D12→a–d) โดย **ทุกข้อย่อยคงสถานะเดิมของเกณฑ์แม่ (ไม่มี PASS เพิ่มจากการแยก)** — ทดสอบใน `tests/status-panel` (P14)
- **ความสอดคล้องของรุ่น:** code/TEST SHA `d0fe6173ed2aa49fa92337b8519ca3eefb5fe7a5` (ไม่เปลี่ยน แต่ r5 มีแก้โค้ดเว็บ 3 ไฟล์ใน draft — ดูส่วน C) · เอกสาร head ที่ Work ตรวจ (ฐานรอบนี้) `f4d8090e631ad990de43d27570c05fa12b724722` · ขอบเขต checklist ปัจจุบัน **12 ชุด** (พัฒนา 4 · TEST 4 · production 3 · เอกสาร 1) · ตัวเลข "11 ชุด" ในบล็อก r2/r3 เป็นประวัติ

### C. FX-3 (DOC-OBS-05) — งานเฉพาะจุดใน draft branch
สิ่งที่แก้ (3 ไฟล์เว็บ + test): `Property Details.dc.html` — บล็อกสถานะใหม่ 3 แบบ: **กำลังโหลด** (ไม่แสดง "ไม่พบ" ระหว่างโหลด) / **ไม่พบประกาศหรือปิดแล้ว** (ข้อความเดียวสำหรับปิดแล้วและไม่เคยมี ไม่เผยข้อมูล/รูปใดของเคสส่วนตัว + ปุ่มกลับหน้าค้นหา) / **โหลดไม่สำเร็จ** (ข้อความต่างหาก + ปุ่มลองอีกครั้งแบบกดเอง ไม่รีโหลดอัตโนมัติ); `data.js` — ข้อความ 7 คีย์ × 8 ภาษา และตั้ง `window.__hhDataLoad.state="failed"` เมื่อ production ตกไปใช้ข้อมูลตัวอย่าง (เพื่อไม่ให้ "โหลดล้ม" ถูกแสดงเป็น "ไม่พบ"); `tests/browser-local/scenarios.test.js` — B12. ผลรันชุดเต็มบน draft: 12/12 ผ่าน 2 รอบ และ 1 รอบล้มที่ B2 (flake เดิมที่บันทึกไว้เป็น D08 — ไม่เกี่ยวกับ FX-3; D08 ยังเป็น FAIL ไม่ปรับ). **Negative control (ทำแล้ว):** ใส่หน้า Details เดิมกลับ (ไม่มี FX-3) แล้วรัน browser-local → B12 **ล้ม** (11 ผ่าน / 1 ล้ม); ใส่ FX-3 → 12/12 ผ่าน. ผลในเครื่อง (Chromium + emulator, ข้อมูลสังเคราะห์) เท่านั้น — ไม่ใช่หลักฐาน Cloud. **ยังไม่ deploy; ยังไม่มีหลักฐาน Cloud** — T16 ยังเป็น FAIL จนกว่าเจ้าของลองบน TEST หลัง Work ตรวจและเจ้าของ deploy ตาม head ที่ตรวจ

**ไม่เปลี่ยน:** ไม่แก้ FX-1/FX-2/FX-4/FX-5, ไม่แก้ DOC-OBS อื่น, ไม่ merge/deploy/GREEN, ไม่แตะ Functions/rules, ไม่ใช้ข้อมูลจริง, ไม่รัน `tools/chat-live/deploy-test.sh`

## ผลปรับรอบ r6 — CODE-V2-01 r6 (3 ต.ค. 2569 · ตอบ WORK REVIEW head 4a49ea6)

**ทะเบียนรุ่น (แยกฟิลด์ ไม่ให้ baseline เก่าถูกเข้าใจว่าเป็น source ปัจจุบัน):**
| ฟิลด์ | ค่า | ความหมาย |
|---|---|---|
| `sourceHeadSha` — current source/code head | `7c1ec6b40bc5c5008d3bd20eb4ed8274bc3a3b99` | commit ล่าสุดที่มีโค้ดเว็บ/เครื่องมือบิลด์เปลี่ยน (draft, ยังไม่ deploy); commit หลังจากนี้เป็นเอกสาร/แผงเท่านั้น (ตรวจโดย test P8) |
| `docBaseSha` — document/build base head | `4a49ea68377f1a8f881891b020a12e1bf70964df` | head ที่ Work ตรวจรอบนี้ (ฐานของรอบ r6) |
| `deployedTestSha` — Cloud TEST deployed head | `d0fe6173ed2aa49fa92337b8519ca3eefb5fe7a5` | สิ่งที่เจ้าของลองบน Cloud TEST (รหัสนี้ **ไม่ใช่** source ปัจจุบัน) |
| `deployedProdSha` — production deployed head | ไม่ทราบ | ไม่ได้ตรวจ |
(ฟิลด์เดิม `codeSha` ถูกยกเลิกเพราะกำกวมระหว่าง "source ปัจจุบัน" กับ "TEST ที่ deploy")

### 1) FX-3 — รับไว้ใน draft; เพิ่มการตรวจตามคำสั่ง
หลักฐานเป็นผลในเครื่อง (Chromium + emulator, ข้อมูลสังเคราะห์) ไม่ใช่ Cloud — **T16 คง FAIL** จนทดสอบบน TEST. เพิ่มใน browser test B12: (ก) กดปุ่ม "ลองอีกครั้ง" จริง = การนำทางจากผู้ใช้ **1 ครั้ง** และไม่มีการนำทางอัตโนมัติก่อน/หลัง; (ข) จำลอง direct read ล้มขณะ collection โหลดได้ → แสดง "โหลดไม่สำเร็จ" ไม่ใช่ "ไม่พบ"; (ค) ข้อความ loading / not-found (หัวข้อ+ข้อความ+กลับ) / failed (หัวข้อ+ข้อความ+ลองอีกครั้ง+กลับ) ครบ **7 คีย์ × 8 ภาษา** ตรงกับพจนานุกรมและต่างกันทุกภาษา. Negative control: ตัดการตรวจ direct read → B12 ล้มที่ข้อ (ข).

### 2) FX-1 — ตราอนุมัติรับเรื่อง ≠ ตราอนุมัติเผยแพร่ (DOC-OBS-04) — ใน draft
ที่พบ: การอนุมัติรับเรื่องของ Case แบบใหม่ **ตั้งใจไม่เขียน `approvedBy`** (ตราผู้อนุมัติเขียนที่ server ตอนเผยแพร่เท่านั้น) — บรรทัด "อนุมัติโดย -" จึงเป็นตราของ "รับเรื่อง" ที่ไม่มีที่มา. ที่มาจริงของแต่ละเหตุการณ์: รับเรื่อง = `submissions/{id}.reviewedBy`; เผยแพร่ = `approvedByEmail/Uid/Role` (ภายใน). แก้ในหน้า Listing Approvals: แสดง 2 บรรทัดแยก "อนุมัติรับเรื่องโดย …" และ "อนุมัติเผยแพร่โดย …" ตรงกับผู้ดำเนินการของเหตุการณ์นั้น; ไม่มีอีเมลบันทึก → บอกว่า "ไม่มีบันทึก" (บทบาทแสดงเป็น "บทบาทที่บันทึก: …" เท่านั้น ไม่ใช้เป็นชื่อบุคคล); **ไม่เพิ่มฟิลด์ ไม่แตะ server ไม่เพิ่มข้อมูลผู้อนุมัติในข้อมูลสาธารณะ** (test: เอกสารสาธารณะไม่มี approvedBy*/reviewedBy). ตรวจ: B6 + negative control (เอา FX-1 ออก → B6 ล้ม).

### 3) FX-2 — ระยะ/ชื่อโซนที่ไม่มีหลักฐาน (DOC-OBS-03) — ใน draft
ตรวจเส้นทางพิกัดที่ Staff บันทึก: Staff บันทึก **`coordsRaw` ซึ่งเป็นฟิลด์ภายใน (ตำแหน่งแน่นอน)** ตั้งใจไม่ถูกฉายสู่ข้อมูลสาธารณะ และไม่มีโค้ดใดสร้าง `mapLink`/ระยะ/โซนสาธารณะจากมัน → ไม่ได้ "ตกหล่น" แต่ **ไม่เคยมีทาง** ให้ Case มีระยะ/โซนสาธารณะ (การออกแบบเพื่อความเป็นส่วนตัว). แก้: ซ่อนเฉพาะบรรทัดระยะ/ชื่อโซนที่ไม่มีหลักฐาน (ไม่แสดง 0 กม. หรือ undefined แทน "ไม่ทราบ"); **คงค่า 0 ที่เป็นตัวเลขที่เก็บไว้จริง**; `data.js` เลิกใส่ค่าเริ่ม 0; ระยะที่เก็บไว้กับระยะที่คำนวณจากพิกัดไม่ถูกผสม/แปลงเป็นกัน; การ์ดค้นหาไม่มีคำนำหน้า " · " ว่าง. ตรวจ: B13 (ไม่มีพิกัด/ไม่มีโซน → ไม่มี undefined/0; เก็บ 0 จริง; มีพิกัด → ยังแสดง) + negative control. **ยังไม่แก้ (รายงานให้ Work):** แผนที่ยังตั้งจุดกลางเริ่มต้นเมื่อไม่มีโซน/พิกัด; ตัวเลขจากพิกัดเป็นระยะเส้นตรงถึงจุดอ้างอิงของพื้นที่ (พฤติกรรมเดิม ไม่ใช่ระยะเดินทาง).

### 4) FX-4 — Search ไม่มีรูปปก (DOC-OBS-01) — พบต้นเหตุ แล้วจึงแก้ (draft)
ทำซ้ำได้ในเครื่องก่อนแก้ (B7 ล้มทั้ง visitor; ข้อมูลที่ Search ได้รับถูกต้องมี URL รูปครบ). **ต้นเหตุ:** `tools/build-listing-test.js` ห่อ **ทุก** ไฟล์ `.html` — รวมไฟล์ component (PropertyCard ฯลฯ) — ไว้ใน `<template id="chat-live-app">` เพื่อให้หน้า inert; แต่ runtime ดึง component เป็นข้อความแล้วหา `<script data-dc-script>` ซึ่งถูกซ่อนในเทมเพลต → component ทำงานโดยไม่มีตรรกะ ค่าที่คำนวณ (รูปปก/สไตล์ปก ฯลฯ) หายหมด (การ์ดยังแสดงราคา/ชื่อเพราะเป็น prop ตรง). **ข้อมูล Firestore/rules/รูปสาธารณะถูกต้องตลอด; ไฟล์ production ไม่ผ่านตัวบิลด์นี้ จึงไม่กระทบ production.** แก้: ห่อ template เฉพาะหน้าที่เบราว์เซอร์เปิด (ENTRIES). ตรวจ: B7 — รูปปกที่ **decode ได้จริง** (ไม่ใช่แค่มี URL) สำหรับ visitor 3 รอบ และ Owner; hosting-build: component ไม่ถูกห่อและสคริปต์ของ component มองเห็นได้. **ผลข้างเคียงที่ Work ต้องรับทราบ:** ใน TEST component ทุกตัว (LanguageSwitcher, SearchFilters, ContactRail ฯลฯ) จะ "ทำงานจริง" เหมือน production เป็นครั้งแรก และ **หลักฐาน Cloud TEST d0fe617 ทั้งหมดเกิดตอน component ไม่มีตรรกะ** (ลงทะเบียนเป็น ISS-TESTBUILD). ไม่ได้ขอให้เจ้าของเก็บ Network. T10 คง FAIL จนลองบน TEST.

### 5) FX-5 — หน่วยที่ดิน (DOC-OBS-02) — ตรวจที่มาแล้ว ยังไม่เปลี่ยนอะไร
| flow | หน่วยของ `landSize` ที่ปรากฏ (จาก source) |
|---|---|
| Lister Dashboard (เอเจนต์/เจ้าของ) | ตร.ว. (ป้าย, ข้อความสรุป/แชร์) + ช่อง ไร่/งาน/ตร.ว. แยกอีกชุด |
| Case Data (Staff) | ตร.ว. (คัดลอกจาก Lister) |
| Admin Dashboard / AI Quick Add | ตร.ม. (ป้าย; prompt AI ใช้ sqm) |
| Owner Submission (ฟอร์มสาธารณะ) | ไม่มีช่องที่ดิน |
| Property Details (หน้าสาธารณะ) | ต่อ "ตร.ม." เสมอ ไม่แปลงหน่วย |
| Home (ข้อความสเปคให้ AI) / ContactRail | `sqwah` / `sqm` (ไม่ตรงกัน) |
สรุป: ฟิลด์เดียวมีสองความหมายตามช่องทางที่กรอก และไม่มีโค้ดแปลง. **ข้อมูลที่ขาด (เฉพาะเจาะจง):** (1) หน่วยของค่า `landSize` ที่มีอยู่แล้วใน `properties` แยกตามช่องทางที่กรอก — ต้องดูตัวอย่างข้อมูลจริงแบบอ่านอย่างเดียว (Code ตรวจจาก source ไม่ได้); (2) มติ D2. ยังไม่เปลี่ยนหน่วย/ป้ายทั้งระบบ/ข้อมูล Cloud.

### 6) ผลทดสอบ ที่ source SHA `7c1ec6b` (ทะเบียน D12)
| ชุด | ผล | หมายเหตุ |
|---|---|---|
| D12a `test:listing` | **90 ผ่าน** | รันรอบนี้ |
| D12b `test:chat-live` | **34 ผ่าน** (12 pending) | รันรอบนี้; ก่อน commit เคยล้ม B6 เพราะ working tree ยังไม่ commit — ผ่านหลัง commit |
| D12c combined | **UNVERIFIED** | ไม่ได้รัน (175 เป็นผลรอบก่อน) |
| D12d `test:browser-local` | **13/13 ผ่าน** รอบสุดท้าย | หัวข้อก่อนหน้า (head 4a49ea6) 3 รอบ = ผ่าน 2 / **ล้ม 1 ที่ B2**; ในรอบพัฒนา FX-4–FX-2 มีรอบ B7/B12/B13 ล้มตามที่ทำซ้ำ/negative control — ไม่ได้ลบ |
**D08 คง FAIL** (browser test ยังล้มเป็นพัก ๆ; ต้นเหตุยังไม่สรุป — ไม่ปรับจากรอบที่ผ่าน). Negative control รอบนี้: เอา FX-1/2/4 ออก → B6, B7, B13 ล้ม; ตัดการตรวจ direct read ของ FX-3 → B12 ล้ม; ทุกข้อล้มด้วยเหตุผลตรงกับจุดที่แก้.

### 7) ข้อกำหนดเจ้าของ A1–A10
รักษาเป็น **ข้อกำหนดและช่องว่าง** ไม่ถือว่าเป็นฟังก์ชันที่ทำครบ ไม่สร้างระบบใหม่ตามข้อกำหนดทั้งหมดในรอบนี้ (ดูบล็อก r5 และแผงส่วน 5ข).

**ข้อจำกัด / ไม่ได้ทำ:** ผลทั้งหมดเป็นในเครื่อง ไม่มีหลักฐาน Cloud · ไม่ merge · ไม่ deploy (รวม TEST) · ไม่แตะ production · ไม่ migrate/ลบข้อมูล Cloud · ไม่เปิด GREEN · ไม่รัน `tools/chat-live/deploy-test.sh` · เจ้าของไม่ต้องส่งเคสใหม่หรือทดสอบเพิ่มในรอบนี้ · **การเปลี่ยนไฟล์ production-facing (ยังไม่ merge):** `Property Details.dc.html`, `Listing Approvals.dc.html`, `PropertyCard.dc.html`, `data.js`

## ผลปรับรอบ r7 — CODE-V2-01 r7 (3 ต.ค. 2569 · ตอบ WORK REVIEW r6: ตรวจผลกระทบจากการเลิกห่อ template)

**รุ่น:** source/code head `678a04211879352d05e14fbe6166a9186a65507e` (draft ยังไม่ deploy; **รอบนี้ไม่มีการแก้โค้ดเว็บ** — เปลี่ยนเฉพาะไฟล์ test; โค้ดเว็บยังเป็นชุดเดียวกับ `7c1ec6b`) · เอกสาร/build base ที่ Work ตรวจ `59d3ecb76ba179ce661e74c90040353e404f7604` · Cloud TEST deployed `d0fe6173ed2aa49fa92337b8519ca3eefb5fe7a5` · production ไม่ทราบ.

### 1) รายชื่อ component ที่ build รวมไว้ และสิ่งที่แต่ละตัวทำ
บิลด์ TEST (`ENTRIES` 18 หน้า) รวม component ที่ถูกดึงมาเป็นข้อความเพียง **4 ไฟล์** (ตรวจจาก build จริง) — ไม่ถือว่าทุกตัวเสียเหมือนกัน:
| component | หน้าที่ใช้ | ตรรกะที่เริ่มทำงาน | อ่านข้อมูล | เขียนข้อมูล | เรียก Functions |
|---|---|---|---|---|---|
| `PropertyCard` | Home, Search, Details, index | รูปปก/สไตล์การ์ด, ป้ายโซน, หัวใจ (favorites), ปุ่มแชร์ | ไม่มี (ใช้ prop จากหน้า + `data.js`) | `localStorage` (รายการโปรด, คะแนนความสนใจ) เท่านั้น | ไม่มี |
| `LanguageSwitcher` | About, Agent Profile, Contact, Home, Lister Dashboard, Details, Search, index | เปิด/ปิดเมนูภาษา เรียก callback ของหน้า | ไม่มี | ไม่มีเอง (หน้าเก็บ `hh_lang` ใน localStorage) | ไม่มี |
| `SearchFilters` | Search, Lister Dashboard | คำนวณค่าที่แสดงของตัวกรอง เรียก callback ของหน้า | ไม่มี | ไม่มี | ไม่มี |
| `ContactRail` (2,395 บรรทัด) | About, Contact, Home, Details, Search, index | แถบข้าง + แชท | `getEffectiveProperties` (properties/propertyPhotos), AI notes (`aiNotes`), persona/restrictions (`siteContent`), หา conversation เดิมของผู้เยี่ยมชม (`conversations`) | `localStorage` (สถานะแถบ, ประวัติแชท) + **ล็อกอิน anonymous** ให้ผู้เยี่ยมชม (Auth) | `startConversation`, `sendConversationTurn`, `receptionTurn`, `getPropertyDraft`, `createCaseFromConversation`, `claudeComplete` — **เฉพาะเมื่อผู้เยี่ยมชมส่งข้อความ/ยืนยันเอง** |
หน้าฟอร์ม/ทีมงาน (Owner Submission, Track Submission, Case Data, Staff Workspace, Listing Approvals, Admin, Leads, Staff Handbook) **ไม่มี component ใด ๆ** จึงไม่ได้รับผลจากการเลิกห่อ; Lister Dashboard มี LanguageSwitcher + SearchFilters (ครอบคลุมโดย B4 เดิม).

### 2) ContactRail และการเริ่มทำงานอัตโนมัติ — ตรวจใน browser จาก build จริง (B14, B18)
- **เปิดหน้าอย่างเดียว** (Home, Search, Details, About, Contact, index): จำนวนเอกสารในทุก collection **ไม่เปลี่ยน** (ไม่มีเคส/บทสนทนา/ข้อความ/ลีด/submission ใหม่), **ไม่มี Function ฝั่งแชท/เคสถูกเรียก**, ไม่มี URL production หรือ endpoint AI/production. สิ่งเดียวที่เปลี่ยนในแบ็กเอนด์คือ **การล็อกอิน anonymous ของผู้เยี่ยมชม** ไม่เกิน 1 คนต่อการเปิดหน้า (Search/Details/About/Contact = 1; Home/index = 0 ในรอบที่วัด) — **พฤติกรรมเดิมของ production** ที่เพิ่งเริ่มทำงานบน TEST.
- ข้อความทักทายอัตโนมัติของแถบ (หลัง 1.5 วินาที ตามรายการโปรด/เกณฑ์เดิม) เป็นข้อความ **ในเครื่องเท่านั้น** ไม่แตะแบ็กเอนด์. การเริ่ม conversation (`startConversation`) เกิดเมื่อผู้เยี่ยมชม **ส่งข้อความเอง** เท่านั้น (ตามพฤติกรรมเดิม).
- **ผู้เยี่ยมชมที่ส่งข้อความบน TEST เห็นอะไร:** ฟังก์ชันแชทยังไม่ deploy บน TEST (สคริปต์ CHAT-LIVE เดิมค้างที่ 6/8) และกล่องทดสอบบล็อกโฮสต์ Functions ของโปรเจกต์ → การเรียก `getPropertyDraft`/`receptionTurn` ล้ม → แถบแชทแสดงข้อความขออภัย/ติดต่อเรา **ไม่ใช่คำตอบ AI**, ไม่มีเคสเกิดขึ้น, ไม่เรียก endpoint production; URL เดียวที่ถูกพยายามคือ URL ของโปรเจกต์ TEST เอง. **gate เดิมไม่ถูกเปิด/ข้าม/แก้** (B18 ไม่ได้ทดสอบ gate 401/403 — ส่วนนั้นอยู่ในชุด chat-live). Cloud: UNVERIFIED (ลงทะเบียน ISS-RAIL-ANON; Anonymous Auth น่าจะเปิดอยู่เพราะลูกค้าสังเคราะห์ส่งฟอร์มได้ที่ T02).

### 3) TEST guard (B15 + hosting-build)
- **หน้า entry ยังรอ guard**: ห่อ `<template id="chat-live-app">` + guard เป็นสคริปต์แรก + เริ่มผ่าน `__chatLiveStart` เท่านั้น (ชุด hosting-build เดิมตรวจครบทุก entry).
- **ไฟล์ component ที่เปิด URL ตรง** (ทั้ง 4 ไฟล์): ไม่โหลด runtime/SDK, **ไม่มี request ไป Firestore/Auth/Functions/Storage หรือภายนอก**, ไม่เขียนข้อมูล, ไม่ล็อกอิน; guard ทำงานก่อน. สาเหตุที่ปลอดภัย: สคริปต์ที่ "รันได้" ของไฟล์ component มีเพียง `listing-test-config.js` + `listing-test-guard.js` (สคริปต์ตรรกะของ component เป็น `type="text/x-dc"` ไม่รัน) — เพิ่มการตรวจนี้ใน hosting-build แล้ว. **ไม่พบช่องว่าง จึงไม่แก้ build เพิ่ม.**

### 4) Search / Details / ภาษา (B17) และ FX-1 สองบัญชี (B16)
- B17: Search แสดงรูปปก decode ได้เฉพาะรายการที่มีรูป, ตัวกรองคำค้นลดรายการ, ตัวเลือกภาษาเปลี่ยนเมนูและจำค่า; Details แสดงรูปและเปลี่ยนภาษา. (สถานะ loading/notfound/failed ครอบคลุมโดย B12.)
- B16: ผู้อนุมัติรับเรื่อง (`owner2`) ≠ ผู้เผยแพร่ (`owner`) แสดงตามเหตุการณ์ ไม่สลับตรา; เลือก submission ตาม `approvedSubmissionId`; ไม่มี `approvedSubmissionId` → ใช้ submission ที่ **อนุมัติ** ล่าสุด ไม่ใช่ที่ถูกส่งกลับ; ผู้ที่ปฏิเสธไม่ถูกแสดงเป็นผู้อนุมัติ; ข้อมูลบทบาทอย่างเดียวแสดงเป็น "บทบาทที่บันทึก: owner" ไม่ใช่ชื่อคน; ไม่เพิ่มข้อมูลผู้อนุมัติในเอกสารสาธารณะ.

### 5) ข้อจำกัดที่คงไว้ (ห้ามประกาศว่าแผนที่/ตำแหน่งถูกต้องครบแล้ว)
**พิกัดที่ Staff กรอก (`coordsRaw`) ยังไม่ถูกนำไปแสดงแผนที่สาธารณะ** · **แผนที่อาจใช้จุดกลางเริ่มต้น** เมื่อไม่มีโซน/พิกัด · **ระยะจากพิกัดเป็นเส้นตรงถึงจุดอ้างอิงของพื้นที่ ไม่ใช่ระยะเดินทาง** (ลงทะเบียน ISS-MAP-LIMITS). **FX-5 คงรอตรวจข้อมูล (ตัวอย่าง `landSize` จริงแบบอ่านอย่างเดียว) และมติ D2** — ไม่แก้ค่า Cloud ไม่เปลี่ยนหน่วยทั้งระบบ.

### 6) หลักฐานและสถานะ
ผล Cloud TEST เดิมเก็บเป็นประวัติที่มีข้อจำกัดของ build (component ไม่มีตรรกะ); **ไม่ลบ PASS เดิม** (T01–T08, T09, T11, T15) และไม่อ้างว่า component ทุกตัวบน Cloud ได้รับการทดสอบ. **T10, T12, T13, T14, T16 คง FAIL** จนทดสอบบน Cloud TEST. **D08 คง FAIL** (flake). **D12c combined คง UNVERIFIED** (ไม่ได้รัน). ผลทดสอบที่ source `678a042`: `test:listing` **90**, `test:browser-local` **18/18** (รวม B14–B18 ใหม่; ไม่รัน chat-live/combined ซ้ำเพราะโค้ดเว็บไม่เปลี่ยนจาก `7c1ec6b`). การรัน browser-local ทั้งชุดมีเหตุผลเพราะการเลิกห่อกระทบทุกหน้า.

### 7) head ที่เสนอให้ deploy TEST + แผนให้เจ้าของทดสอบเฉพาะจุด (ข้อเสนอ — **ยังไม่สั่ง**, รอ Work)
- **head ที่เสนอ:** หัวของ `claude/listing-e2e-01` ที่ commit เอกสารรอบ r7 นี้ (โค้ดเว็บ = source `7c1ec6b`/`678a042` ไม่เปลี่ยน; commit หลังนั้นเป็นเอกสาร/แผงเท่านั้น). เจ้าของ deploy เองด้วย `tools/listing-test/deploy-test.sh` ตาม head ที่ Work ระบุ (pin SHA, ตรวจ branch/HEAD ก่อน) — ไม่รัน `tools/chat-live/deploy-test.sh`.
- **แผนทดสอบ (ข้อมูลสังเคราะห์เท่านั้น, ทำทีละข้อ, ไม่ต้องส่งเคสใหม่ก่อน Work สั่ง):** (1) เปิด Search ในฐานะผู้เยี่ยมชม — รูปปกของประกาศที่เผยแพร่แล้วแสดง (T10) + เปลี่ยนภาษา/ตัวกรองใช้ได้ · (2) เปิด Details — ไม่มีคำว่า undefined / "0 กม." ที่ไม่จริง (T13) · (3) เปิดลิงก์ของประกาศที่ปิดแล้ว — เห็น "ไม่พบประกาศนี้" ไม่ใช่หน้าว่าง (T16) · (4) ในหน้า Listing Approvals ในฐานะ Owner — เห็นแถว "อนุมัติรับเรื่องโดย …" และ "อนุมัติเผยแพร่โดย …" แยกกัน (T14) · (5) เปิดหน้าโฮม/ค้นหา — แถบแชทขึ้น; ถ้าพิมพ์ข้อความจะเห็นข้อความขออภัย/ติดต่อเรา (ไม่ใช่ AI) · (6) ตรวจว่าหน้าฟอร์ม/ทีมงานเดิมยังใช้ได้. ผลที่ได้จึงจะอัปเดต T10/T13/T14/T16 ตามหลักฐานจริง.

**ไม่เปลี่ยน/ไม่ทำ:** ไม่ merge · ไม่ deploy (รวม TEST) · ไม่แตะ production · ไม่ migrate/ลบข้อมูล Cloud · ไม่เปิด GREEN · ไม่รัน `tools/chat-live/deploy-test.sh` · ไม่สร้างข้อมูล Cloud · เจ้าของยังไม่ต้องส่งเคสใหม่.

## ผลปรับรอบ r8 — CODE-V2-01 r8 (3 ต.ค. 2569 · ซิงก์ผล Cloud TEST ที่ head 2c89759 · เอกสารและแผงเท่านั้น)

**หัวสามแบบ (แยกกัน):** source/code head `678a04211879352d05e14fbe6166a9186a65507e` (โค้ดเว็บ — ไม่เปลี่ยนในรอบนี้) · documentation head = commit ของรอบ r8 นี้ (ดู PR; มีแต่เอกสาร/แผง) · **Cloud TEST deployed head `2c897593321713783d0ba81c7167962e1793be9a`** (หัวของ r7 ที่เจ้าของ deploy; โค้ดเว็บเท่ากับ source head) · production deployed: ไม่ทราบ (คง RED).

**ผล Cloud TEST (REAL-TEST)** — `huahin-chat-test-01` ที่ head `2c89759` เคสสังเคราะห์เดิม `own-14a754ca222d54e405fe` / `HH-67680` · เจ้าของลองและส่งภาพ, Work ตรวจภาพแล้ว · **แยกจากผล emulator** (B6/B7/B12/B13/B16/B17 เป็นผลในเครื่อง ไม่ถูกรวมกับตารางนี้):
| ข้อ | ผล | หลักฐาน (รหัสภาพของเจ้าของ) | ข้อจำกัดที่ต้องคงไว้ |
|---|---|---|---|
| T10 Search รูปปก | **PASS** | 145029, 145035, 145207, 145211 — รูปปกตรงกับเคส; ไทย → English ได้ เมนู ตัวกรอง ชื่อประกาศเปลี่ยนตาม | เคสสังเคราะห์เดียว |
| T13 undefined / ระยะ 0 | **PASS เฉพาะเคสนี้** | 145317, 145322, 145325 — Details ไม่แสดง undefined หรือระยะ 0 ที่ไม่มีข้อมูลรองรับ | ไม่รับรองตำแหน่งแผนที่จริง (ISS-MAP-LIMITS) |
| T14 ผู้อนุมัติ | **PASS** | 144101, 144107 — ผู้อนุมัติรับเรื่องและผู้เผยแพร่แสดงแยกกัน | **บัญชี Owner เดียวกันเท่านั้น** (คนละบัญชีบน Cloud ยังไม่ทดสอบ) |
| T16 หลังปิด Details | **PASS** | 143124 (ไทย), 150108 (อังกฤษ) — แสดงไม่พบประกาศ ไม่แสดงรูป/ข้อมูลเดิม | ภาพ **150059 = ก่อน** Ctrl+Shift+R, **150108 = หลัง**; **ไม่มีหลักฐานว่ารูปเดิมแสดงระหว่างโหลด** |
| T12 หน่วยที่ดิน | **คง FAIL** | กรอก 100 ตร.ว. แต่ Details แสดง 100 sqm | รอข้อมูลตัวอย่าง `landSize` + มติ D2 |
| T23 ปิด → เปิดใหม่ → ปิดอีกครั้ง (รายการใหม่) | **PASS** | เปิดใหม่ 144321, 144507 · ปิด 145635, 145755 | ผ่าน UI บน TEST; ไม่ได้ตรวจการลบ backend ทั้งหมด |
| T15 (เดิม PASS) ปิดแล้ว Search = 0 | ยืนยันซ้ำ | 150315 — Search เหลือ 0 listings | — |
| T18a รูปสาธารณะเดิม **1 ไฟล์** | **PASS เฉพาะไฟล์นี้** | 145508 (ก่อนปิด โหลดได้) → 145934 (หลังปิด + hard refresh ตอบ 404 Not Found) | **ห้ามสรุปว่าตรวจครบ 7 ไฟล์หรือผ่านเกณฑ์ลบทั้งหมด** — T18b (ไฟล์อื่น) และ T17a–c (ลบ backend) ยัง **UNVERIFIED** |

**เปอร์เซ็นต์ (เฉพาะขอบเขตที่ Work lock):** `S-TEST-PUBLIC` = T09/T10/T11/T13/T14/T16 PASS + T12 FAIL = **6/7 ≈ 86%** (checklist เดิม 7 ข้อ ไม่เพิ่ม/ลด; ก่อนหน้า 2/7 ≈ 29%) · `S-TEST-FLOW` ยัง **9/9** · **เป็นตัวเลขของขอบเขตนั้นเท่านั้น ไม่ใช่เปอร์เซ็นต์ทั้งโครงการ** · ขอบเขตอื่นยังไม่ lock.

**ทะเบียนข้อสังเกต:** DOC-OBS-01, -03, -04, -05 ปิด (ยืนยันบน Cloud TEST เฉพาะเคสสังเคราะห์เดียว; -03 ติดตามข้อจำกัดต่อที่ ISS-MAP-LIMITS) · **DOC-OBS-02 เปิด** (T12) · FX-1…FX-4 สถานะ "ยืนยันบน Cloud TEST" (ยังไม่ merge) · ISS-TESTBUILD ยังเปิด: Cloud ยืนยันเฉพาะ component ที่ใช้ใน Search ทำงาน — ContactRail/การเริ่ม conversation บน Cloud **UNVERIFIED** · ISS-RAIL-ANON ยังเปิด.

**ผล Cloud TEST เดิมก่อนหน้า** (head `d0fe617`) เก็บเป็นประวัติที่มีข้อจำกัดของ build (component ไม่มีตรรกะ) — ไม่ลบ.

**ข้อจำกัดการทดสอบที่คงเดิม:** ไม่ได้ทดสอบบัญชีอื่น/สิทธิ์ (Cloud negative matrix), ข้อมูลเก่า (LEGACY-DATA-PLAN ยัง BLOCKED), AI จริง; D08 (flake ในเครื่อง) คง FAIL; combined คง UNVERIFIED.

**ไม่เปลี่ยน/ไม่ทำ:** รอบนี้เอกสารและแผงเท่านั้น — ไม่แก้ source เว็บไซต์/Functions/rules · ไม่ merge · ไม่ deploy · ไม่ migrate หรือลบข้อมูลเพิ่มเติม · ไม่เปิด GREEN · ไม่รัน `tools/chat-live/deploy-test.sh` · production คง RED · เจ้าของยังไม่ต้องส่งเคสใหม่.


## ผลปรับรอบ r9 — CODE-V2-01 r9 (3 ต.ค. 2569 · D2 อนุมัติ: แก้หน่วยขนาดที่ดินขั้นต่ำใน draft)

**หัวสี่แบบ (แยกกัน):** source head `d7ee37e9323115168e8d0179372e9c2015ec42c4` (โค้ดเว็บ + Functions) · doc/build base ที่ Work ตรวจ `d0ffd49b56c5303e69c8c82ddb9b8db374442915` · documentation head = commit เอกสารของรอบนี้ (ดู PR) · **Cloud TEST deployed `2c897593321713783d0ba81c7167962e1793be9a`** (ไม่เปลี่ยน) · production deployed: ไม่ทราบ (คง RED). ไม่ merge ไม่ deploy (TEST/production) ไม่เปิด GREEN; ไม่แก้/ไม่ migrate ข้อมูล Cloud รวมเคส TEST เดิม.

**มติ D2 (อนุมัติผ่าน Work):** กรอกขนาดที่ดินได้ทั้ง ตร.ว. และ ตร.ม. มีตัวเลือกหน่วยชัดเจน; 1 ตร.ว. = 4 ตร.ม.; ข้อมูลเก่าที่ไม่ระบุหน่วยห้ามเดาหรือแปลงอัตโนมัติ.

**รูปแบบข้อมูลหลัก (สั้น):** `landAreaValue` (ตัวเลขที่คนกรอก) · `landAreaUnit` (`sqwa`|`sqm`) · `landAreaSqm` (ค่ามาตรฐาน ตร.ม. ปัดทศนิยม 2 ตำแหน่ง คำนวณใหม่จากค่าที่กรอก+หน่วยทุกครั้ง จึงไม่แปลงซ้ำ; server คำนวณใหม่ตอนฉายสู่ข้อมูลสาธารณะ ค่าที่แก้มือไปไม่ถึงหน้าสาธารณะ). `landSize` เดิม = **ไม่มีหน่วย**: โค้ดใหม่ไม่เขียน ไม่ติดป้าย ไม่แปลง; มีขนาดแบบมีหน่วยเมื่อไหร่ ขนาดนั้นชนะค่าเก่า; หน่วยหายหรือผิด = ไม่สร้างฟิลด์. พื้นที่ใช้สอยไม่เปลี่ยน.

**ผลตรวจทุกเส้นทาง landSize:** (1) Case Data (Staff/Owner) — เขียน: แก้แล้ว; (2) Lister Dashboard (เอเจนต์) — เขียน + ข้อความโพสต์: แก้แล้ว; (3) Owner preview (`public-preview.js`) — อ่าน: แก้แล้ว; (4) Property Details สาธารณะ — อ่าน: แก้แล้ว "100 ตร.ว. (400 ตร.ม.)" / เลขเก่า "(ไม่ระบุหน่วย)"; (5) Staff checklist (`intake-workflow.js`) — presence เท่านั้น: รองรับฟิลด์ใหม่; (6) projection ฝั่ง server (`functions/listing-case.js`, allow-list สองชุด): แก้แล้ว; (7) i18n 8 ภาษา: เพิ่ม `sqwa`, `land_unit_unspecified`. **ไม่แก้ (รายงานเท่านั้น):** Owner Submission (ไม่มีช่องที่ดิน), Admin Dashboard และ AI Quick Add (เขียน landSize ป้าย ตร.ม. เลขไม่มีหน่วย), AI draft ใน `functions/index.js` + `draft-completeness.js` (prompt ใช้ "ตารางวา"), Home (sqwah) / ContactRail (sqm) ข้อความบริบท AI ไม่ตรงกัน, ช่อง ไร่/งาน/ตร.ว. ของ Lister เป็นอีกชุด.

**ข้อขัดแย้งกับมติ/ขอบเขตเดิมที่ต้องให้ Work ตัดสิน:** (ก) เส้นทาง AI draft ถือ landSize เป็นตารางวา แต่ข้อมูลเก่าที่เก็บไว้ไม่มีหน่วย — Code ไม่ติดป้ายให้เองแม้รู้ที่มา; (ข) รายการเก่าที่เดิมแสดง "X ตร.ม." จะแสดง "X (ไม่ระบุหน่วย)" หลัง merge (ISS-LAND-LEGACY-DISPLAY); (ค) ต้อง deploy listing functions คู่กับ hosting (ISS-LAND-DEPLOY) เพราะ allow-list/projection เปลี่ยน.

**ไฟล์ที่แก้:** `land-area.js` (ใหม่), `functions/land-area.js` (ใหม่), `case-fields.js`, `functions/case-fields.js`, `functions/listing-case.js`, `tools/listing-test/build-functions.js`, `Case Data.dc.html`, `Lister Dashboard.dc.html`, `Property Details.dc.html`, `public-preview.js`, `intake-workflow.js`, `data.js`, `package.json`, `tests/listing/land-area.test.js` (ใหม่), `tests/listing/core.test.js`, `tests/listing/functions-build.test.js`, `tests/browser-local/scenarios.test.js`, `docs/listing-e2e/browser-local/*` + เอกสาร/แผงสถานะ.

**ผลทดสอบ (LOCAL ที่ source `d7ee37e` — ไม่ใช่ Cloud):** test:listing **99 ผ่าน** (LA1–LA5: 100 ตร.ว.=400 ตร.ม., 400 ตร.ม.=100 ตร.ว., แปลงครั้งเดียว/ซ้ำไม่เปลี่ยน, ไม่เดาข้อมูลเก่า, browser/server ตรงกัน; L1–L4: server คำนวณใหม่, legacy ผ่านตามเดิม, หน่วยผิดไม่ขึ้นสาธารณะ, แก้ซ้ำไม่แปลงซ้ำ) · test:browser-local **21/21 ผ่าน** (B11 บันทึก→รีเฟรช→แก้→บันทึกซ้ำ 3 ครั้งไม่แปลงซ้ำ; B19 Staff→Owner preview→เผยแพร่ ครบ 8 ภาษา; B20 ข้อมูลเก่าไม่เดา; B21 ฟอร์มเอเจนต์) · test:chat-live 34 ผ่าน (12 pending) · negative control: ใช้หน้าเดิม → B11/B19/B20/B21 ล้ม (17 ผ่าน/4 ล้ม); ปิดการคำนวณใหม่ของ server → L1/L3 ล้ม · combined suite: ไม่ได้รัน (คง UNVERIFIED) · D08 (B2 flake) คง FAIL ตามบันทึกเดิม.

**ข้อจำกัด:** ยังไม่ทดสอบบน Cloud TEST (T12 คง FAIL); เส้นทาง Lister ครอบคลุมเฉพาะ edit/save ที่ B21 ทดสอบ; ไม่ได้เปลี่ยนข้อมูลเก่าใด ๆ; ผล PASS ทั้งหมดของรอบนี้เป็นหลักฐาน LOCAL เท่านั้น. Production RED.


## ผลปรับรอบ r9b — CODE-V2-01 r9b (3 ต.ค. 2569 · แก้เฉพาะข้อพบจาก Work review r9 · ก่อนเสนอ deploy TEST)

**หัวสี่แบบ (แยกกัน):** source head `958c8770fed6bdd0265239cf030c3a43a2505dc3` (r9 เดิม `d7ee37e…`) · doc base ที่ Work ตรวจ `7f596631ef11587d0532c5931d37cff69b4eded0` · documentation head = commit เอกสารของรอบนี้ (ดู PR) · **Cloud TEST deployed `2c897593321713783d0ba81c7167962e1793be9a`** (ไม่เปลี่ยน) · production deployed: ไม่ทราบ (RED). ไม่ merge ไม่ deploy ไม่แก้/migrate/ลบข้อมูล Cloud ไม่รันสคริปต์ CHAT-LIVE เดิม.

**ข้อ 1 — Case Data ล้างพื้นที่แล้วค่าเก่ากลับมา (แก้แล้ว):** แยกชัด — (ก) แก้ข้อมูลอื่นของเคสเก่าที่ไม่ทราบหน่วยและไม่แตะช่องที่ดิน → เก็บ `landSize` เดิมไว้ตามเดิม; (ข) คนที่เคยบันทึกพื้นที่แบบมีหน่วยแล้วตั้งใจล้างช่อง → ล้าง `landAreaValue/Unit/Sqm` และ `landSize` เดิมด้วย เพื่อไม่ให้ preview/public fallback กลับไปแสดงค่าเก่าโดยเงียบ. เปลี่ยนเฉพาะการบันทึกจากการกระทำของผู้ใช้ (ไม่มี backfill/migrate ข้อมูล Cloud).

**ข้อ 2 — Lister Dashboard ห้าม fallback (แก้แล้ว):** ตรวจด้วยกติกาเดียวกับตัวสร้างฟิลด์ (`landAreaFields`) ก่อนเขียน: ค่าที่ถูกปฏิเสธ (เช่นเกินขอบเขต) หรือการล้างหน่วยจากรายการที่มีหน่วยแล้ว → แจ้งข้อผิดพลาดและไม่เขียนข้อมูล ไม่คืนค่าเดิมพร้อมข้อความสำเร็จ; ข้อยกเว้นเดียว = ค่า legacy ที่ไม่ได้แก้จริง (ยังบันทึกฟิลด์อื่นได้); ตัวสร้าง patch โยนข้อผิดพลาดแทน fallback เงียบ.

**ข้อ 3 — ช่องทางที่ D2 รองรับ (ห้ามสรุปว่าครบทั้งระบบ):**

| ช่องทาง | สถานะ D2 |
|---|---|
| Case Data (Staff/Owner) | รองรับ (กรอกค่า+หน่วย, ล้าง, ข้อมูลเก่าไม่เดา) |
| Lister Dashboard (เอเจนต์) | รองรับเส้นทางแก้/บันทึก (B21, B23) |
| Owner preview | รองรับ (แถวเดียว "ที่ดิน" ค่า+หน่วย หรือ "N (ไม่ระบุหน่วย)") |
| Property Details สาธารณะ | รองรับ 8 ภาษา |
| Projection ฝั่ง server + allow-list | รองรับ (คำนวณใหม่ตอนฉาย) |
| Owner Submission | ไม่มีช่องที่ดิน — ไม่รองรับ |
| Admin Dashboard | ยังเขียน landSize ไม่มีหน่วย — ไม่รองรับ |
| AI Quick Add | ยังเขียน landSize ไม่มีหน่วย — ไม่รองรับ |
| AI draft (Functions) | prompt ใช้ "ตารางวา" — ไม่รองรับ |
| บริบท AI ใน Home / ContactRail | ข้อความ sqwah / sqm ไม่ตรงกัน — ไม่รองรับ |

**ไฟล์ที่แก้รอบนี้:** `Case Data.dc.html`, `Lister Dashboard.dc.html`, `tests/browser-local/scenarios.test.js` (B22, B23 ใหม่), `tests/listing/core.test.js` (L5 ใหม่) + เอกสาร/แผงสถานะ. ไม่แก้ source ช่องทางอื่น.

**ผลทดสอบ (LOCAL ที่ source `958c877` — ไม่ใช่ Cloud):** test:listing **100 ผ่าน** (L5: การล้างโดยตั้งใจถึงเอกสารสาธารณะ — ไม่มี landSize/ฟิลด์ที่ดิน) · test:browser-local **23/23 ผ่าน** (B22: legacy → ค่า+หน่วย → บันทึก → ล้าง → บันทึก → เปิดใหม่ ไม่มีค่าเก่ากลับ; B23: ค่าเกินขอบเขต/ล้างหน่วย = ไม่เขียน + ล้างช่อง = ล้างทุกฟิลด์) · test:chat-live 34 ผ่าน · test:status-panel ผ่าน · negative control: Case Data+Lister เดิม → B22/B23 ล้ม (21 ผ่าน/2 ล้ม) แล้วคืนโค้ดที่แก้ · ระหว่างทาง B22 ล้ม 2 รอบจากตัวทดสอบเอง (description สั้นเกิน; เคสที่คัดลอกมามีรูปไม่ครบจึงเผยแพร่ไม่ได้ → เปลี่ยนเป็นตรวจแถว preview จาก `public-preview.js` + L5 ฝั่ง server) · combined: ไม่ได้รัน (UNVERIFIED) · D08 (B2 flake) คง FAIL.

**ขั้นตอนทดสอบบน Cloud TEST แบบสั้น (หลัง Work ตรวจและเจ้าของ deploy TEST ตาม head ที่ Work ระบุ — deploy ทั้ง listing functions และ hosting):** (1) ส่งเคสสังเคราะห์ใหม่ → ใน Case Data กรอกที่ดิน 100 + หน่วย ตร.ว. → บันทึก → รีเฟรช → ดูว่ายังเป็น 100 ตร.ว. (ไม่เป็น 400) → (2) Owner ตรวจก่อนเผยแพร่ ต้องเห็น "100 ตร.ว. (400 ตร.ม.)" → เผยแพร่ → หน้าสาธารณะแสดงเท่ากันและเปลี่ยนภาษาได้ → (3) ลองล้างช่องที่ดินแล้วบันทึกอีกเคสสังเคราะห์: preview/สาธารณะต้องไม่มีที่ดิน. ห้ามแก้เคส TEST เดิมด้วยมือ; T12 เปลี่ยนเป็น PASS ได้เมื่อเจ้าของยืนยันเท่านั้น.

**ข้อจำกัด:** ผล PASS ทั้งหมดเป็นหลักฐาน LOCAL; ยังไม่ทดสอบบน Cloud TEST (T12 คง FAIL); รายการเก่าจะแสดง "X (ไม่ระบุหน่วย)" หลัง merge (ISS-LAND-LEGACY-DISPLAY); ต้อง deploy listing functions คู่ hosting (ISS-LAND-DEPLOY). Production RED.


## ผลปรับรอบ r9c — CODE-V2-01 r9c (3 ต.ค. 2569 · ปิดข้อมูลก่อนทดสอบ Cloud TEST · เอกสารเท่านั้น)

**หัวสี่แบบ (แยกกัน):** source `958c8770fed6bdd0265239cf030c3a43a2505dc3` (Work ตรวจ diff แล้ว; ไม่เปลี่ยนในรอบนี้) · documentation head = commit ของรอบนี้ (ดู PR; เอกสาร/แผงเท่านั้น) · doc base ที่ Work ตรวจ `84339ea46f1bc1edfbc49986a1749ce456bf20bb` · **Cloud TEST deployed `2c897593321713783d0ba81c7167962e1793be9a`** (ไม่มี D2) · production deployed: ไม่ทราบ (RED). ไม่ merge ไม่ deploy ไม่แก้/migrate/ลบข้อมูล Cloud ไม่รันสคริปต์ CHAT-LIVE เดิม.

**"1 pending" ของ test:listing = ST3** (`tests/listing/rules.test.js`, "members via Firestore lookups (listers/adminUsers)"): Storage emulator แก้ lookup ข้าม service ไม่ได้ (log: `lister=false staff=false`) จึง skip โดยตั้งใจ — **ไม่เกี่ยวกับ D2**, มีมาตั้งแต่ SEC-TEST-01 (บันทึกเดิมใน LISTING-E2E-01.md). ยังขาดหลักฐาน: สิทธิ์เขียน `propertyPhotos` ของสมาชิก/Staff ผ่าน lookup ต้องยืนยันบน Cloud TEST จริง; **ไม่นับเป็น PASS** (ISS-ST3-PENDING). ใช้ log จากการรันรอบ r9b (100 passing / 1 pending) ไม่รันซ้ำโดยไม่มีเหตุ.

**ข้อจำกัดคงเดิม:** B22 ไม่ได้กด Owner publish จริงในฉากนั้น (เคสที่คัดลอกมามีรูปไม่ครบ) — ตรวจแถว preview จาก `public-preview.js` + L5 ฝั่ง server แทน. D2 ณ เวลานั้นผ่านหลักฐาน LOCAL (ต่อมา deploy TEST ที่ 958c877 — ดู r9e/r9f). T12 คงสถานะเดิม รอ Work. D08 = FAIL. combined = UNVERIFIED.

**Viewer v45:** https://claude.ai/artifact/J9paCdLvTqg6qvjvh5gVJ8 (แยกแสดง source / documentation / Cloud TEST deployed / production; แผง Artifact v10 = https://claude.ai/artifact/WKkZMmpSMSdYjxQ812qdCs).

**คำสั่ง deploy TEST (เตรียมไว้ — ยังไม่รัน; รอ Work ตรวจชุดปิดรอบนี้ แล้วเจ้าของรันเองใน Codespace terminal "จอดำ"):** deploy จาก source `958c8770fed6bdd0265239cf030c3a43a2505dc3` (เอกสารหลังจากนี้ไม่เปลี่ยนโค้ด) — สคริปต์เดียวนี้ deploy listing Functions (10 ตัวจากโฟลเดอร์ `build/listing-functions`) + Firestore/Storage rules + Hosting (หน้า TEST) คู่กัน; ไม่ใช่สคริปต์ CHAT-LIVE เดิม; ใช้โปรเจกต์ `huahin-chat-test-01` เท่านั้น. แต่ละบรรทัดรันทีละคำสั่ง:

```
git fetch origin claude/listing-e2e-01
git checkout --detach 958c8770fed6bdd0265239cf030c3a43a2505dc3
git rev-parse HEAD
git status --short
bash tools/listing-test/deploy-test.sh huahin-chat-test-01
```

ตรวจก่อนไปบรรทัดถัดไป: `git rev-parse HEAD` ต้องพิมพ์ `958c8770fed6bdd0265239cf030c3a43a2505dc3`; `git status --short` ต้องไม่พิมพ์อะไร; สคริปต์จะถามให้พิมพ์ `DEPLOY-TEST` (ถ้าไม่ใช่ให้หยุด). ห้ามใช้ `tools/chat-live/deploy-test.sh`; ห้ามชี้ production.

**ขั้นทดสอบ TEST สั้น ๆ (เคสสังเคราะห์ใหม่เท่านั้น ห้ามแก้เคสเดิม):** (1) Case Data กรอกที่ดิน 100 เลือก ตร.ว. บันทึก → ดูว่าแสดง = 400 ตร.ม. (2) รีเฟรช/เปิดแก้ใหม่แล้วบันทึกซ้ำ → ยัง 100 ตร.ว. (ไม่เป็น 400 หรือ 1600) (3) Owner ตรวจก่อนเผยแพร่ ต้องเห็น "100 ตร.ว. (400 ตร.ม.)" → เผยแพร่ → หน้าสาธารณะ Details แสดงเท่ากัน (ลองสลับภาษา) (4) อีกเคสสังเคราะห์: ใส่แล้วล้างช่องที่ดิน บันทึก → preview และหน้าสาธารณะต้องไม่มีที่ดิน/ไม่มีเลขเก่า. จดผลแต่ละข้อ (ผ่าน/ไม่ผ่าน + ภาพหน้าจอ); T12 เปลี่ยนเป็น PASS ได้เมื่อ Work ตรวจและเจ้าของยืนยันเท่านั้น.

**ยืนยันไฟล์ไม่เปลี่ยนจาก source `958c877`:** `git diff 958c877 HEAD` ของไฟล์ระบบเว็บ/Functions/rules (ทุกไฟล์นอก `docs/`, `*.md`, `tools/status-panel/`, `tests/status-panel/`) = ว่าง (ตรวจในรอบส่งมอบ; แผง test P8 ตรวจเช่นกัน).


## ผลปรับรอบ r9d — CODE-V2-01 r9d · กลไกแปลอัตโนมัติ 8 ภาษา (ข้อมูลเพิ่มจากเจ้าของ · ตรวจ source เท่านั้น · ไม่แก้ source ไม่ deploy)

**หัวสี่แบบ (แยกกัน):** source `958c8770fed6bdd0265239cf030c3a43a2505dc3` (ไม่เปลี่ยน) · documentation head = commit ของรอบนี้ (ดู PR; เอกสาร/แผงเท่านั้น) · doc base ก่อนรอบนี้ `0490b4a30c1913b8f44dba1f441593487bdddf69` · **Cloud TEST deployed `2c897593321713783d0ba81c7167962e1793be9a`** · production deployed: ไม่ทราบ (RED).

### ส่วน A — ความทรงจำเจ้าของและข้อกำหนดผลิตภัณฑ์ (ไม่ใช่หลักฐานว่าโค้ดปัจจุบันทำครบ)
(1) ระบบเดิมเรียกแปลอัตโนมัติครบ 8 ภาษาตอน Save/อัปเดต ก่อนส่ง Owner อนุมัติ และเก็บคำแปลในฐานข้อมูล; (2) ผู้เยี่ยมชมเปิดประกาศ/เปลี่ยนภาษา ต้อง **อ่านคำแปลที่เก็บไว้** ไม่เรียก AI แปลสดตามการเปิดหน้า (ประหยัดโทเคน); (3) ต่อยอดกลไกเดิมก่อนเสนอระบบใหม่; (4) Owner ต้องตรวจเนื้อหาฉบับที่จะเผยแพร่ได้.

### ส่วน B — สิ่งที่ source ปัจจุบันทำจริง (อ่านโค้ด; ยังไม่ได้รันทดสอบ = SOURCE ไม่ใช่ LOCAL/REAL-TEST)
| คำถาม | ผลตรวจ |
|---|---|
| ปุ่ม Save เดิมเรียกฟังก์ชันแปลใด | **Lister Dashboard** (`saveProperty`): `translateDescriptionAll()` ใน `firebase-client.js` → POST ไป Cloud Function `claudeComplete` (Anthropic, โมเดลที่ฝั่ง server กำหนด) 1 การเรียก/ฟิลด์ คืน JSON ครบ 8 ภาษา (th en ru zh de no fr it). เรียกกับ **description, zone และ title** (3 การเรียกต่อ Save) และ bio ใน Agent Profile settings. **AI Quick Add** (แอดมิน) แปลต่างหากตอนสร้างร่าง (`translateDraft`, EN→TH→ภาษาอื่น) ก่อนยืนยันบันทึก |
| คำแปล 8 ภาษาเก็บที่ไหน | ใน Firestore `properties/{id}` เป็นออบเจ็กต์ภาษา: `description.{th,en,ru,zh,de,no,fr,it}`, `title.{…}`, `zone.{…}` (AI Quick Add: `title/shortDesc/fullDesc` ต่อภาษา). ฟิลด์ที่ขาดภาษาใดถูกเติมด้วยข้อความต้นฉบับ |
| หน้าสาธารณะอ่านหรือแปลสด | **อ่านที่เก็บไว้**: Property Details อ่าน `description[lang]` / `title[lang]` / `zone[lang]`; ไม่พบการเรียกแปลสดตามการเปิดหน้า/เปลี่ยนภาษาในหน้า Home/Search/Details/Card. การเรียก AI จากหน้าสาธารณะมีเฉพาะ **แชต** (ContactRail, Home, Agent Profile) ซึ่งไม่ใช่การแปลประกาศ |
| Save โดยเนื้อหาไม่เปลี่ยน แปลซ้ำหรือไม่ | **แปลซ้ำ** — ไม่มีการเทียบเนื้อหาเดิม/hash ใน `saveProperty`; ทุก Save เรียก 3 ครั้งใหม่ (เปลืองโทเคน และผลอาจเปลี่ยนเอง) (ISS-TR-RESAVE) |
| แก้เนื้อหา: คำแปลเก่า / แปลไม่สำเร็จ | คำแปลเก่าถูก **เขียนทับทั้งก้อน** ด้วยผลแปลใหม่ (ไม่มี stale marker ไม่มีการเทียบ). แปลไม่สำเร็จ = `console.warn` แล้วบันทึก **ข้อความต้นฉบับเป็น string** (ไม่ใช่ออบเจ็กต์ 8 ภาษา) ไม่มีสถานะ/ธง/retry/แจ้งผู้ใช้; ถ้า AI ข้ามบางภาษาจะเติมต้นฉบับโดยไม่บอก (ISS-TR-FAIL). หน้า Details ที่ได้ string จะแสดง string เดียวกันทุกภาษา |
| เส้นทาง Listing Case ใหม่ขาดการเชื่อมตรงไหน | (ก) **Case Data** เก็บ `description` เป็น string ข้อความเดียวและไม่เรียกแปลตอน Save; (ข) **publish/sync** (`buildPublicDoc`) ส่ง string นั้นขึ้นสาธารณะ และสร้าง `title` จากแม่แบบ th/en เท่านั้น ไม่มีคำแปลภาษา ru/zh/de/no/fr/it; (ค) **Owner preview** (`public-preview.js`) แสดงข้อความเดียว ไม่มีแถว/ตัวเลือกภาษาให้ Owner ตรวจฉบับที่จะเผยแพร่; (ง) ไม่มีตัวบันทึกสถานะการแปลต่อภาษา; (จ) ข้อควรตรวจ: ฟังก์ชันแปลเดิมไม่ส่ง Authorization — ถ้า gate ของโปรเจกต์เปิด (TEST) จะได้ 401 ผลแปลว่าง (UNVERIFIED, ISS-TR-GATE). ข้อมูลฝั่งฟอร์มลูกค้า (Owner Submission) เก็บข้อความภาษาที่ลูกค้าพิมพ์ ไม่มีการแปลเช่นกัน |

### ส่วน C — ข้อเสนอแนวทาง (ไม่ใช่มติ; ต่อยอดกลไกเดิม ยังไม่แก้ source)
1. ใช้ `translateDescriptionAll` เดิมซ้ำที่ขั้น Save ของ Staff/Case (ไม่สร้างฟังก์ชันแปลใหม่ตอนนี้) เก็บเป็นออบเจ็กต์ 8 ภาษารูปเดียวกับของเดิม ใน Case (ทีมเท่านั้น) พร้อมข้อมูลกำกับ: hash ของข้อความต้นฉบับ + สถานะแปลต่อภาษา (ok/pending/failed) + เวลา.
2. เรียกแปลเฉพาะเมื่อ hash ต้นฉบับเปลี่ยน (Save ซ้ำเนื้อหาเดิม = ไม่เรียก AI); แปลไม่สำเร็จ = ทำเครื่องหมาย pending/failed และคงคำแปลเก่าไว้ ไม่เขียนทับด้วยต้นฉบับเงียบ ๆ.
3. Owner preview แสดงฉบับที่จะเผยแพร่แยกตามภาษา (เทียบกับที่เผยแพร่อยู่) พร้อมสถานะ; ห้ามเผยแพร่ภาษาที่ยังไม่แปลโดยไม่ให้ Owner รับทราบ.
4. `buildPublicDoc` ส่งออบเจ็กต์ภาษาที่เก็บไว้ผ่าน allow-list (เพิ่มฟิลด์ตามแบบ D2) และหน้าสาธารณะอ่านที่เก็บไว้ตามเดิม ไม่แปลสด.
ผลกระทบ: แตะ Functions/allow-list และฟอร์ม Staff ต้องมี gate/Authorization และการทดสอบ AI แบบ mock เท่านั้น (ห้ามใช้ AI จริงจนกว่าจะมีมติ). **รอ Work ตัดสิน** — รอบนี้ไม่แก้ source ไม่ deploy.

**ข้อจำกัดของรายงานนี้:** ตรวจจากการอ่านโค้ดเท่านั้น ไม่ได้รันแปลจริง ไม่ได้ทดสอบบน Cloud; ความจำเจ้าของ (ส่วน A) แยกจากผลตรวจโค้ด (ส่วน B) ชัดเจน; ไม่ได้สรุปว่า "ระบบเดิมทำครบแล้ว" สำหรับเส้นทาง Listing Case. D2/T12/D08/combined/production สถานะเดิม.


## ผลปรับรอบ r9e — CODE-V2-01 r9e (3 ต.ค. 2569 · แก้สถานะ + หลักฐาน Cloud + แผนแก้ระบบแปลขั้นต่ำ · เอกสารเท่านั้น)

**หัวสี่แบบ (แยกกัน — แก้ตาม Work review r9d):** source `958c8770fed6bdd0265239cf030c3a43a2505dc3` · documentation head = commit ของรอบนี้ (ดู PR; เอกสาร/แผงเท่านั้น) · doc base ก่อนรอบนี้ `d293f8d5c01d5a123a6be9ddb13b478180187137` · **Cloud TEST deployed `958c8770fed6bdd0265239cf030c3a43a2505dc3`** (เจ้าของ deploy สำเร็จแล้ว; **แก้จาก `2c89759`** ที่ระบุผิดในบล็อก r9c/r9d — บล็อกเหล่านั้นเป็นประวัติ) · production deployed: ไม่ทราบ (RED). ไม่แก้ source ระบบแปล ไม่ merge ไม่ deploy ไม่แก้ข้อมูล Cloud ไม่ใช้ AI จริง ไม่เปิด GREEN.

### 1. หลักฐาน Cloud TEST ของเคส HH-24379 (REAL-TEST — ภาพเจ้าของที่ Work ตรวจ; แยกจาก LOCAL)
| ภาพ | สิ่งที่เห็น | รหัสในแผง |
|---|---|---|
| 211504 | Owner preview แสดง 100 ตร.ว. (400 ตร.ม.) | TD1 PASS |
| 212703 | เผยแพร่สำเร็จ ผู้เผยแพร่เป็นบัญชี Owner | TD2 PASS |
| 212839 | หน้าสาธารณะภาษาไทยแสดงหน่วยถูกต้อง | TD3 PASS |
| 212903 | หน้าภาษาจีนแสดงค่าเทียบเท่าถูกต้อง | TD4 PASS |

**ยังไม่ทดสอบบน Cloud (ไม่รับรอง):** ล้างค่าที่ดินแล้วค่าเก่าไม่กลับมา (TD5 — มีเฉพาะ LOCAL B22/L5); อีก 6 ภาษา en ru de no fr it (TD6 — เห็นเฉพาะไทยและจีน; LOCAL B19 ครบ 8 ภาษาแต่ไม่ใช่ Cloud); บันทึก/รีเฟรชแล้วไม่แปลงซ้ำ (TD7 — ไม่มีภาพในชุดที่ส่งมา). **T12:** คงสถานะที่ Work กำหนดไว้ (FAIL จากเคสเก่าที่ 2c89759) — Code ไม่เปลี่ยนเอง; หลักฐาน TD1–TD4 รอ Work ตัดสินว่าจะพลิก T12 หรือรอ TD5–TD7. ตัวเลข S-TEST-PUBLIC 6/7 ≈ 86% ไม่เปลี่ยน (scope ที่ lock). ผล LOCAL (listing 100 / browser-local 23/23 / chat-live 34) ยังเป็นหลักฐาน LOCAL ต่างหาก; ST3 pending, D08 FAIL, combined UNVERIFIED ตามเดิม.

### 2. แผนแก้ระบบแปลขั้นต่ำ (เสนอให้ Work ตรวจ — ยังไม่ลงมือ; อิงข้อพบ source ใน r9d)
**หลักการ:** ใช้กลไกเดิมเป็นฐาน (prompt/โครง JSON 8 ภาษาของ `translateDescriptionAll`, ที่เก็บเป็นออบเจ็กต์ภาษา, หน้าสาธารณะอ่านที่เก็บไว้) แต่ปิดช่องว่างที่ตรวจพบ.
1. **Authorization/สิทธิ์ฝั่ง server (ต้องตรวจก่อนต่อยอด):** ข้อพบ source — `translateDescriptionAll` เรียก `claudeComplete` จาก browser โดยไม่ส่ง Authorization; ตอน gate ปิด (`state off`) `enforceHttp` ไม่ตรวจอะไร (ใครรู้ URL เรียกใช้โทเคนได้) และตอน gate เปิด (TEST) ตอบ 401 → การแปลล้มเงียบ (ISS-TR-GATE; ยังไม่ได้ทดสอบ). ข้อเสนอ: การแปลของ Case ต้องผ่าน **ฟังก์ชันฝั่ง server ที่ตรวจว่าเป็นทีมงาน/Owner และเป็นเจ้าของเคส** (ใช้ gate/โควตาเดิมของ AI) ไม่เรียกจากหน้าเว็บตรง; ขอให้ Work เลือก (ก) ฟังก์ชัน callable ใหม่แบบทีมเท่านั้น หรือ (ข) ส่ง ID token ให้ `claudeComplete` + บังคับ allow-list — Code เอนไปที่ (ก) เพราะตรวจสิทธิ์ต่อเคสได้.
2. **แปลเมื่อเนื้อหาต้นทางเปลี่ยนเท่านั้น:** เก็บ hash ของข้อความต้นฉบับต่อฟิลด์ (title / description / zone) ที่แปลล่าสุด; Save โดยไม่เปลี่ยน hash = ไม่เรียกแปล (ไม่เสียโทเคน ไม่เขียนทับ); เรียกเมื่อ hash เปลี่ยนเท่านั้น และไม่เรียกซ้ำพร้อมกัน (กันกดซ้ำ).
3. **เก็บคำแปลพร้อมรุ่นต้นฉบับและสถานะความครบ:** ใน Case (ทีมเท่านั้น) ต่อฟิลด์: `sourceHash`, `sourceLang`, `translatedAt`, และต่อภาษา `{text, status: ok | failed | stale | pending, forHash}`; ความครบ = ทุกภาษาเป็น ok **และ** forHash ตรงกับต้นฉบับปัจจุบัน.
4. **แปลล้มเหลว:** คงคำแปลเก่าไว้ได้ แต่ทำเครื่องหมาย `stale` (forHash ไม่ตรง) และแจ้งทีม/Owner; **ห้ามแสดงคำแปลเก่าเป็นฉบับปัจจุบัน** (preview ต้องติดป้าย "ล้าสมัย"; ถ้านโยบายเผยแพร่ไม่อนุญาตก็ไม่ขึ้นสาธารณะ).
5. **ห้ามเติมต้นฉบับแทนภาษาที่ขาดแล้วนับว่าแปลสำเร็จ:** เลิก fallback `safe[l] = parsed[l] || text` แบบเงียบ — ภาษาที่ AI ข้าม/คืนว่าง = `failed` ไม่ใช่ `ok`; ข้อความต้นฉบับอาจแสดงเป็น fallback ที่ติดป้ายชัดเจนเท่านั้น (ถ้า Work เห็นชอบ) ไม่นับเป็นคำแปล.
6. **Owner preview ตรวจฉบับที่จะเผยแพร่ตามภาษา:** ตัวเลือกภาษา 8 ภาษา แสดงข้อความที่ *จะ* ขึ้นสาธารณะ (title/description/zone) เทียบกับที่เผยแพร่อยู่ พร้อมสถานะ ok/stale/failed/pending ต่อภาษา; ใช้ `buildPublicDoc` ตัวเดียวกับที่เผยแพร่ (หลักการเดิมของ preview).
7. **หน้าสาธารณะอ่านที่เก็บไว้ ไม่แปลสด:** `buildPublicDoc` ฉายออบเจ็กต์ภาษาที่ผ่านเกณฑ์ผ่าน allow-list (เพิ่มฟิลด์ตามแบบ D2) — หน้า Details อ่าน `description[lang]` ตามเดิม; ไม่เพิ่มการเรียก AI ตอนเปิดหน้า/สลับภาษา.
8. **เกณฑ์เผยแพร่เมื่อคำแปลไม่ครบ — เสนอให้ Work/เจ้าของตัดสิน (ยังไม่ใช่มติ; ยังไม่ถือว่าการติ๊กรับทราบทำให้เผยแพร่ได้):** ตัวเลือก A) บล็อกเผยแพร่จนทุกภาษา ok และไม่ stale; B) เผยแพร่ได้เฉพาะภาษาที่ ok โดยภาษาอื่นไม่ขึ้นหรือขึ้นข้อความต้นฉบับพร้อมป้ายภาษา (ต้องมีมติเรื่องหน้าตาหน้าสาธารณะ); C) Owner รับทราบรายภาษาแล้วเผยแพร่ (ต้องมีมติแยกว่ายอมรับได้หรือไม่ + บันทึกผู้รับทราบ). Code เสนอ A เป็นค่าตั้งต้นที่ปลอดภัยที่สุด.
**ขอบเขตแก้ที่คาดว่าจะแตะ (เมื่อ Work อนุมัติ):** ฟอร์ม Case Data (Save) · ฟังก์ชันแปลฝั่ง server (ใหม่หรือต่อยอด) + gate/โควตา · `functions/case-fields.js` + `listing-case.js` (allow-list/ฉาย) · `public-preview.js` + Listing Approvals (preview ตามภาษา) · i18n ป้ายสถานะ 8 ภาษา · allow-list ใน Functions folder สำหรับ deploy TEST.
**แผนทดสอบ (ไม่ใช้ AI จริง):** ใช้ตัวแปล mock ที่คืนค่า/ล้ม/ขาดภาษา — ทดสอบ: Save ซ้ำเนื้อหาเดิม = 0 การเรียก; แก้เนื้อหา = 1 การเรียก; ล้มเหลว = stale + คำแปลเก่าไม่ถูกแสดงเป็นปัจจุบัน; ภาษาขาด = failed ไม่ใช่ ok; ผู้ไม่ใช่ทีม/คนละเคส = ถูกปฏิเสธ; preview ครบ 8 ภาษา; หน้าสาธารณะไม่มีการเรียกแปลตอนเปิด/สลับภาษา (นับการเรียกเครือข่าย); ผ่านเกณฑ์เผยแพร่ที่ Work เลือก.
**ความเสี่ยง/ข้อจำกัด:** แตะ Functions (ต้อง deploy listing functions คู่ hosting); ต้องกำหนดโควตา/ค่าใช้จ่าย AI; ข้อมูลเก่าไม่มีคำแปล/ไม่มี hash — ต้องไม่ backfill อัตโนมัติ (ผ่านการ Save โดยคนเท่านั้น); ผลแปลคุณภาพภาษาไม่ได้รับรองโดยเทสต์.

### 3. ข้อพบตราผู้อนุมัติรับเรื่อง (ภาพ 211350 / 212703) — ต้นเหตุจาก source (ยังไม่ reproduce = UNVERIFIED)
**อาการ:** ขั้น "อนุมัติรับเรื่อง" แสดง "ไม่มีบันทึกผู้ดำเนินการ" และประวัติส่งงานยังขึ้น "รอตรวจ" หลังอนุมัติแล้ว; ส่วน **ตราผู้เผยแพร่แสดงถูกต้อง** (บัญชี Owner).
**ต้นเหตุตาม source:** (ก) Case แบบแยก (`caseInternal`) — `decideSubmission` **ไม่เขียน** `approvedBy` (เขียนเฉพาะ Case แบบเก่า; ตราที่ server เขียนมีเฉพาะตอนเผยแพร่) หน้า `_approvalStamps` จึงต้องอ่านผู้อนุมัติรับเรื่องจาก `reviewedBy` ของแถว submission ที่อนุมัติ (`state.submissions[p.id]`); (ข) รายการ submission ถูกโหลด **ครั้งเดียวต่อเคส** (`!this.state.submissions[p.id]` + `_subsAsked`) ตอนการ์ดแสดงสถานะ "รอตรวจ" แล้ว **ไม่โหลดซ้ำหลังกดอนุมัติ** (`decide()` เรียก `componentDidMount()` ซึ่งโหลดเคสใหม่ แต่ไม่ล้างแคช submissions) → แถวค้างเก่า `reviewResult=null, reviewedBy=null` → ข้อความ "ไม่มีบันทึกผู้ดำเนินการ" และ "รอตรวจ" (อาการเดียวกันทั้งสองจุด); (ค) ตราผู้เผยแพร่ไม่ใช้แคชนี้ (server เขียน `approvedByEmail` ตอนเผยแพร่) จึงถูกต้อง. **ข้อสงสัยอีกทาง:** `reviewedBy = (admin && admin.email) || ""` ถ้าบัญชีไม่มีอีเมลที่หน้าอ่านได้ จะว่างแม้รีเฟรช — แยกได้ด้วยภาพหลังรีเฟรชหน้า. **ทำไมเทสต์ในเครื่องไม่เจอ:** B16 เขียนข้อมูลลงฐานโดยตรง ไม่ได้ทำลำดับ "เปิดการ์ด → อนุมัติ → ดูต่อโดยไม่รีเฟรช". **ข้อเสนอแก้ขั้นต่ำ (ยังไม่แก้):** โหลดรายการ submission ซ้ำหลัง `decide`/ส่งงาน + ทดสอบลำดับดังกล่าว (ISS-APPROVER-STALE).


## ผลปรับรอบ r9f — CODE-V2-01 r9f (3 ต.ค. 2569 · ตอบ Work review r9e · ไม่แก้ source เว็บ)

**หัวสี่แบบ (แยกกัน):** source `958c8770fed6bdd0265239cf030c3a43a2505dc3` (ไม่เปลี่ยน) · **Cloud TEST deployed `958c8770fed6bdd0265239cf030c3a43a2505dc3`** · documentation head = commit ของรอบนี้ (ดู PR; เอกสาร/แผง/ไฟล์ทดสอบเท่านั้น) · doc base ก่อนรอบนี้ `a99aafdd07b473776db810ffdc9b46ea38c4e004` · production deployed: ไม่ทราบ (RED). ไม่ merge ไม่ deploy ไม่แก้ข้อมูล Cloud ไม่ใช้ AI จริง ไม่เปิด GREEN.

### 1. Viewer v47 เปิดไม่สำเร็จ (ภาพ 214621) — ต้นเหตุและการแก้
**ต้นเหตุ:** เนื้อหาของ Viewer อยู่ใน JSON (บล็อก `__bundler/template`) ซึ่งเป็นสตริง; ข้อความใหม่ที่ผมใส่ในรอบ r9e มีเครื่องหมายคำพูด `"` ดิบ (เช่น "ไม่มีบันทึกผู้ดำเนินการ") จึงปิดสตริงก่อนเวลา → `JSON.parse` พังที่ตำแหน่ง 15665 ("Unexpected non-whitespace character after JSON"). **การแก้ (เฉพาะการบรรจุ ไม่เปลี่ยนเนื้อหา/สถานะ):** escape ข้อความตามกติกา JSON ก่อนฝัง + ตรวจว่าทุกบล็อก `__bundler/*` parse ได้ + **เปิดจริงใน Chromium** (ไม่ใช่แค่ตรวจไวยากรณ์) ยืนยันว่าไม่มี "Error unpacking" และมีข้อความที่คาดไว้ — ทำซ้ำอาการเดิมกับ v47 ได้ และ v46 เปิดได้ → ใช้ v48.

### 2. สถานะ T12 และ TD7
**T12:** คงสถานะเดิม (FAIL จากเคสเก่าที่ 2c89759). การแสดงหน่วยใน **Owner preview และหน้าสาธารณะภาษาไทย/จีนผ่านบน Cloud แล้ว** (TD1–TD4, HH-24379, head 958c877); **การล้างค่าและการทดสอบส่วนที่เหลือยังไม่ครบ** (TD5 ล้างค่า, TD6 อีก 6 ภาษา, TD7b บันทึกซ้ำ). **TD7 แยกสองพฤติกรรม:** TD7a = บันทึกครั้งแรก+รีเฟรช — เจ้าของยืนยัน "ข้อมูลครบถูกต้อง" → **PASS** (REAL-TEST, คำยืนยันของเจ้าของ ไม่มีรหัสภาพ); TD7b = บันทึกซ้ำแล้วไม่แปลงซ้ำ — ยังไม่มีคำยืนยันชัดเจน → **UNVERIFIED** (LOCAL B11 ผ่าน แต่ไม่ใช่ Cloud). ไม่มีข้อความในสถานะปัจจุบันที่ว่า D2 ยังไม่ deploy หรือผ่านเฉพาะ LOCAL (ข้อความดังกล่าวในบล็อกรอบก่อนเป็นประวัติ ณ เวลานั้น).

### 3. แบบฟังก์ชันแปลฝั่ง server สำหรับทีมงาน (เสนอ — ยังไม่ลงมือ; ใช้กลไกแปลเดิมเป็นฐาน)
**ชื่อ/ที่อยู่:** callable `translateCaseText` ใน listing codebase (asia-southeast1) · ใช้ prompt/โครง JSON 8 ภาษาเดียวกับ `translateDescriptionAll` ย้ายมาเรียกจาก server (ไม่เรียกจาก browser) · เรียก AI **ครั้งเดียวต่อรอบ** แบบรวมหลายฟิลด์ (ลดการเรียก 3 ครั้งต่อ Save เดิม).
**สิทธิ์ (ตามนโยบายผู้รับผิดชอบเคส):** `requireTeam` + Owner ทำได้ทุกเคส; **Staff ทำได้เฉพาะเคสที่ `assignedToUid` = ตัวเอง บังคับที่ server** (ปัจจุบันบังคับแค่ฝั่งหน้าเว็บ — นี่คือข้อควรตัดสินเรื่องนโยบายที่ Work ต้องยืนยัน); ผู้ไม่ใช่ทีม/คนละเคส = `permission-denied`; ใช้ Authorization ของ Firebase Auth ตามเดิม (ไม่เปิด `claudeComplete` ให้ไม่ผ่านตัวตน).
**ขั้นตอน (ตามลำดับ):**
1. ตรวจ `assertEnabled` + สิทธิ์ + gate/โควตาเดิม (`enforceCallable`; จอง `reserve` เมื่อจะเรียก AI จริงเท่านั้น; มีเพดานต่อผู้ใช้/รวม).
2. **ธุรกรรม A (claim):** อ่านเคส คำนวณ `sourceHash` ต่อฟิลด์ (hash ของข้อความต้นฉบับที่ normalize + เวอร์ชัน prompt) เทียบกับ `translations[field].sourceHash`; ฟิลด์ที่ hash ตรงและทั้ง 8 ภาษา `ok` = **ไม่ต้องแปล**; ถ้าไม่เหลือฟิลด์ที่ต้องแปล → ตอบ `complete` ทันที **ไม่เรียก AI ไม่หักโควตา** (Save ซ้ำเนื้อหาเดิม = 0 การเรียก). **ป้องกันคำขอซ้ำ:** มี `translationJob {id, hashes, startedAt, by}` ที่ยังไม่หมดอายุ (เช่น 90 วินาที) ของ hash เดียวกัน → ตอบ `in_progress` ไม่เรียกซ้ำ; งานค้างเกินกำหนด = ถือว่า `failed(timeout)` เพื่อลองใหม่ได้.
3. เรียก AI (นอกธุรกรรม) แล้วตรวจผลเข้ม: ทุกภาษาต้องเป็นข้อความไม่ว่าง; **ภาษาที่ขาด/ว่าง = `failed` ไม่เติมต้นฉบับแทน**.
4. **ธุรกรรม B (commit):** อ่านเคสใหม่ **เทียบ `sourceHash` ปัจจุบันกับ hash ที่ขอแปล**; ถ้าเนื้อหาเปลี่ยนระหว่างแปล → **ทิ้งผลเก่าของฟิลด์นั้น** (`superseded`) ไม่เขียนทับคำแปลของรุ่นใหม่; ถ้าตรง → เขียน `translations[field] = {sourceHash, sourceLang, translatedAt, promptVersion, langs: {th..it: {text, status: ok|failed}}}` แล้วล้าง job.
5. **ล้มเหลว (AI error/timeout/parse):** ล้าง job; คำแปลเก่า (ถ้ามี) **เก็บไว้แต่ติด `stale`** (เพราะ hash ไม่ตรงต้นฉบับใหม่) ไม่ถูกนับว่าเป็นฉบับปัจจุบัน; ภาษาที่ไม่เคยแปล = `failed`/`pending`.
6. **ลองใหม่ชัดเจน:** ปุ่ม/พารามิเตอร์ `retry: true` แปลซ้ำเฉพาะภาษาที่ `failed`/`pending`/`stale` (ผ่านขั้นตอน 1–4 ครบ รวมโควตา) ; แสดงสถานะรายภาษาและเหตุผลให้ทีม/Owner เห็น.
**การเก็บ/ป้องกัน:** `caseInternal/{id}.translations` เขียนได้เฉพาะ server (เพิ่มคีย์นี้ในรายการที่ rules ห้ามไคลเอนต์เขียน — แตะ `firestore.rules`); ไม่ backfill ข้อมูลเก่า (เริ่มเมื่อคนกด Save).
**ฟิลด์:** `description` (ข้อความฟรีของ Staff) และ ชื่อทำเล/soi ที่พิมพ์เอง (ชื่อพื้นที่มาตรฐานใช้พจนานุกรม i18n เดิม ไม่ต้องใช้ AI); **คำถามเปิดสำหรับ Work:** Case ไม่มีช่องชื่อประกาศ — ปัจจุบัน `title` สร้างจากแม่แบบ th/en; จะแปลชื่อที่สร้างเป็น 6 ภาษาที่เหลือด้วย AI หรือเพิ่มแม่แบบ i18n (ไม่เสียโทเคน) ให้ Work เลือก.
**การฉายและ preview:** `buildPublicDoc` ฉายคำแปลที่ **ครบและตรงรุ่น** เท่านั้นผ่าน allow-list (เพิ่มฟิลด์แบบ D2) และ `projectionSig` ต้องรวมคำแปล เพื่อให้ "สิ่งที่ Owner ตรวจ = สิ่งที่เผยแพร่" (กลไก reviewedSig เดิม); **Owner preview** มีตัวเลือก 8 ภาษา แสดงข้อความที่จะขึ้นจริงรายภาษา เทียบกับที่เผยแพร่อยู่ พร้อมสถานะ ok/stale/failed/pending และเหตุผลที่ถูกบล็อก; **หน้าสาธารณะอ่านที่เก็บไว้ ไม่แปลสด** (ไม่เพิ่มการเรียก AI ตอนเปิดหน้า/สลับภาษา).
**เกณฑ์ A (เสนอ — ต้องให้เจ้าของยืนยันก่อนนำไปใช้):** เผยแพร่/อัปเดตหน้าสาธารณะได้เมื่อ **ครบทั้ง 8 ภาษาและตรงรุ่นต้นฉบับปัจจุบัน** ของฟิลด์ที่ต้องแปลทุกฟิลด์; คำแปลเก่าเก็บไว้ได้แต่ **ห้ามเผยแพร่คู่กับต้นฉบับใหม่โดยอ้างว่าครบ** (รายการที่เผยแพร่แล้วคงฉบับที่เผยแพร่ไว้จนกว่าฉบับใหม่ครบและ Owner อนุมัติผ่าน preview/sync). **ยังไม่ใช้ B/C หรือการติ๊กรับทราบเป็นทางข้าม** จนกว่าจะมีมติ.
**แผนทดสอบ (ไม่ใช้ AI จริง — ใช้ตัวแปล mock ผ่านจุดฉีด dependency แบบเดียวกับ hook ที่มีอยู่):** Save เนื้อหาเดิมครบแล้ว = 0 การเรียกและไม่หักโควตา; แก้เนื้อหา = 1 การเรียก; เนื้อหาเปลี่ยนระหว่างแปล → ผลเก่าไม่ทับรุ่นใหม่; คำขอซ้ำขณะ job ค้าง = `in_progress`; mock คืนภาษาไม่ครบ = failed (ไม่เติมต้นฉบับ); mock ล้ม = stale + คำแปลเก่าไม่ถูกฉายเป็นปัจจุบัน; retry แปลเฉพาะที่ล้ม; Staff คนอื่น/ผู้ไม่ใช่ทีม/คนละเคส = ปฏิเสธ; ไคลเอนต์เขียน `translations` ตรง ๆ = rules ปฏิเสธ; เพดานโควตา; เกณฑ์ A: ไม่ครบ = publish/sync ถูกบล็อก, preview แสดงเหตุผลรายภาษา; หน้าสาธารณะเปิด/สลับภาษา = 0 การเรียกเครือข่ายแปล.
**ขอบเขตที่จะแตะ (เมื่อ Work อนุมัติ):** ฟังก์ชันใหม่ + รายการไฟล์/selector ของ listing deploy (`build-functions.js`, `deploy-test.sh`, ชุดทดสอบ) · `functions/case-fields.js`/`listing-case.js` · `firestore.rules` · Case Data (Save + สถานะ) · `public-preview.js` + Listing Approvals · i18n ป้ายสถานะ 8 ภาษา. **ความเสี่ยง:** แตะ Functions + rules (ต้อง deploy คู่ hosting); ค่าใช้จ่าย AI/โควตาต้องตั้งค่า; คุณภาพคำแปลเทสต์ไม่รับรอง.

### 4. ISS-APPROVER-STALE — ทำซ้ำใน browser ด้วยลำดับจริง (B24, LOCAL; ไม่แก้ source เว็บ)
ลำดับ: เปิดการ์ดเคสที่รอตรวจ → อนุมัติรับเรื่อง (ปุ่มจริง) → ตรวจชื่อ/ประวัติ **ไม่รีเฟรช** → รีเฟรช. ผล: **ก่อนอนุมัติ** ประวัติ "ครั้งที่ 1 · รอตรวจ"; **หลังอนุมัติ ไม่รีเฟรช** "อนุมัติรับเรื่องโดย ไม่มีบันทึกผู้ดำเนินการ" + ประวัติ "รอตรวจ" (ตรงกับภาพ 211350/212703); **ฐานข้อมูลในจังหวะเดียวกัน** `reviewResult=approved`, `reviewedBy=owner@example.test`, `approvedSubmissionId` ตรง; **หลังรีเฟรช** "อนุมัติรับเรื่องโดย owner@example.test" + ประวัติ "อนุมัติ". **สรุป:** เป็นปัญหาแคชรายการส่งงานที่ไม่โหลดซ้ำหลังอนุมัติ **ไม่ใช่ข้อมูลที่ไม่ถูกบันทึก**. ข้อจำกัด: B24 ใช้บัญชี Owner สังเคราะห์ที่มีอีเมล — ถ้าบัญชีจริงไม่มีอีเมลที่หน้าอ่านได้ ควรเทียบกับภาพหลังรีเฟรชของเจ้าของเพื่อตัดความเป็นไปได้นี้. ข้อเสนอแก้ขั้นต่ำ (ยังไม่ทำ): โหลดรายการส่งงานซ้ำหลัง `decide`/ส่งงาน + เปลี่ยน B24 เป็นการยืนยัน (assert) หลังแก้. ตราผู้เผยแพร่ถูกต้องเพราะ server เขียน `approvedByEmail` (ไม่ผ่านแคชนี้).

**ผลทดสอบรอบนี้ (LOCAL; ไม่ใช่ Cloud):** test:browser-local **24/24 ผ่าน** ที่ HEAD ของรอบนี้ (เพิ่ม B24 แบบบันทึกผลสังเกต; source เว็บไม่เปลี่ยนจาก `958c877`); test:status-panel ผ่าน. test:listing/chat-live ไม่ได้รันซ้ำ (ไม่มีไฟล์ระบบเปลี่ยน; ผลล่าสุด 100 passing + 1 pending ST3 / 34 passing ที่ `958c877`). combined UNVERIFIED, D08 FAIL.

## 6. STATUS-REGISTRY — ข้อมูลเครื่องอ่านของแผงภายใน (แก้ที่นี่ที่เดียว แล้วรัน `npm run status-panel`)

ตาราง §1–§3 ด้านบนเป็นต้นทางของ Roadmap/ฐานระบบ/งานปัจจุบัน (แผงอ่านตรงจากตาราง). บล็อกนี้เก็บเฉพาะสิ่งที่ตารางไม่มี: ผู้รับผิดชอบ/ขอบเขต/วัน-commit ของแต่ละงาน (`taskMeta`), checklist ร่างสำหรับเปอร์เซ็นต์ (`scopes`, ทุกชุด `locked:false` จนกว่า Work lock), ทะเบียนค้าง (`issues`) และประวัติ. สถานะรายการใน checklist: `pass` / `fail` / `blocked` / `unverified` / `na` (N/A ต้องมีเหตุผลใน `ref`). ห้ามใส่รหัสผ่าน คีย์ อีเมล เบอร์ หรือ token.

<!-- STATUS-REGISTRY:BEGIN -->
```json
{
 "schema": 1,
 "package": {
  "id": "HP-HANDOFF-2026-10-03-v2",
  "date": "2026-10-03",
  "tz": "Asia/Bangkok",
  "docBaseSha": "a99aafdd07b473776db810ffdc9b46ea38c4e004",
  "deployedTestSha": "958c8770fed6bdd0265239cf030c3a43a2505dc3",
  "deployedProdSha": "ไม่ทราบ",
  "prState": "PR #8 OPEN / DRAFT / NOT MERGED · base claude/chat-live-01",
  "website": "RED / Public Hidden (ตามรายงาน ไม่ได้ตรวจสดรอบนี้)",
  "revision": "r9f (Code · Viewer v48 แก้การบรรจุ · TD7 แยกสองพฤติกรรม · แบบฟังก์ชันแปลฝั่ง server · ทำซ้ำอาการตราผู้อนุมัติ B24)",
  "set": "HP-HANDOFF-2026-10-03-v2 + CODE-V2-01 r9f",
  "sourceHeadSha": "958c8770fed6bdd0265239cf030c3a43a2505dc3"
 },
 "goal": "ให้เจ้าของและทีมลงประกาศพร้อมรูปจนเผยแพร่ได้จริงอย่างปลอดภัย (ส่งฟอร์ม → Staff เตรียม → Owner อนุมัติ/เผยแพร่ → หน้าสาธารณะ) บนเว็บ huahin.properties โดยยังไม่เปิดเว็บสาธารณะจนกว่าเจ้าของอนุมัติ",
 "current": {
  "task": "r9f: ส่ง Work ตรวจ — Viewer v48 แก้แล้ว, แบบฟังก์ชันแปลฝั่ง server (เกณฑ์ A รอเจ้าของยืนยัน), ผลทำซ้ำตราผู้อนุมัติ (แคช) — ยังไม่แก้ source เว็บ/ไม่ merge/ไม่ deploy",
  "phases": [
   "LISTING-E2E-01",
   "ชุดส่งต่อ"
  ],
  "environments": [
   "เอกสาร",
   "Cloud TEST (หลักฐานจากเจ้าของ)"
  ],
  "actor": "Claude Code → ส่ง ChatGPT Work ตรวจ"
 },
 "youDoNow": {
  "text": "ยังไม่ต้องทำอะไร — รอ ChatGPT Work ตรวจแผนระบบแปลและข้อพบตราผู้อนุมัติ; ถ้า Work ต้องการหลักฐานเพิ่ม (เช่น ล้างค่าที่ดิน/ภาษาอื่น/รีเฟรชหน้าอนุมัติ) จะแจ้งขั้นตอนสั้น ๆ",
  "where": "ไม่มีหน้าจอที่ต้องเปิด",
  "passWhen": "Work ตรวจและสั่งขั้นต่อไป",
  "next": "ห้าม merge/deploy production/เปิด GREEN จนกว่าจะมีมติ; production คง RED"
 },
 "actors": {
  "owner": "เจ้าของ (Product Owner)",
  "work": "ChatGPT Work (ผู้ตรวจ)",
  "code": "Claude Code (ผู้พัฒนา)",
  "ai": "Claude AI (ภาพรวมผลิตภัณฑ์)"
 },
 "scopes": [
  {
   "id": "S-DEV-CORE",
   "env": "dev",
   "name": "โมเดลข้อมูลและการเผยแพร่ (โค้ด/ในเครื่อง)",
   "locked": false,
   "lockNote": "ร่าง — รอ Work ตรวจและ lock ชุดนี้แยกจากชุดอื่น",
   "items": [
    {
     "id": "D01",
     "text": "Case record ทีมงานเท่านั้น + เอกสารสาธารณะจาก allow-list ตอน Owner เผยแพร่",
     "status": "pass",
     "level": "LOCAL",
     "ref": "test:listing (core/rules)"
    },
    {
     "id": "D02",
     "text": "เผยแพร่/ปิดประกาศผ่านฟังก์ชันฝั่ง server (Owner เท่านั้น)",
     "status": "pass",
     "level": "LOCAL",
     "ref": "core S-series, B6/B9"
    },
    {
     "id": "D04",
     "text": "Checklist การส่ง + Photo Standard v1 (server และฟอร์ม)",
     "status": "pass",
     "level": "LOCAL",
     "ref": "core, B1/B3"
    },
    {
     "id": "D07",
     "text": "หน้าสาธารณะรอ SDK แบบมีเพดานเวลา ไม่แสดงข้อมูลตัวอย่างแทนของจริงใน TEST",
     "status": "pass",
     "level": "LOCAL",
     "ref": "B7/B8, H9"
    },
    {
     "id": "D13",
     "text": "หน้า Details แยกสถานะ กำลังโหลด / ไม่พบหรือปิดแล้ว / โหลดไม่สำเร็จ ครบ 8 ภาษา ไม่เผยข้อมูลเคสส่วนตัว (FX-3, draft)",
     "status": "pass",
     "level": "LOCAL",
     "ref": "browser-local B12: retry = 1 navigation, direct read ล้ม = โหลดล้ม (ไม่ใช่ไม่พบ), ข้อความ 7 รายการ × 8 ภาษา + negative control ล้มเมื่อตัดการตรวจ direct read (หลักฐาน LOCAL) · Cloud TEST 2c89759: T16 PASS"
    },
    {
     "id": "D14",
     "text": "หน้าอนุมัติแสดงตราอนุมัติรับเรื่องกับตราอนุมัติเผยแพร่แยกกัน ตรงกับผู้ดำเนินการของเหตุการณ์นั้น ไม่ใช้บทบาทเป็นชื่อบุคคล ไม่เพิ่มข้อมูลผู้อนุมัติในข้อมูลสาธารณะ (FX-1, draft)",
     "status": "pass",
     "level": "LOCAL",
     "ref": "browser-local B6 + negative control ล้มเมื่อไม่มี FX-1 (หลักฐาน LOCAL) · Cloud TEST 2c89759: T14 (บัญชีเดียว) PASS"
    },
    {
     "id": "D15",
     "text": "หน้า Details/การ์ดค้นหา ซ่อนระยะและชื่อโซนที่ไม่มีหลักฐาน ไม่แสดง 0 กม. หรือ undefined แทน \"ไม่ทราบ\" และคงค่า 0 ที่เก็บไว้จริง (FX-2, draft)",
     "status": "pass",
     "level": "LOCAL",
     "ref": "browser-local B13 + negative control ล้มเมื่อไม่มี FX-2 (หลักฐาน LOCAL) · Cloud TEST 2c89759: T13 (เคสนี้) PASS"
    },
    {
     "id": "D16",
     "text": "บิลด์ TEST ไม่ห่อไฟล์ component ในเทมเพลต จึงรูปปกการ์ดค้นหาโหลดจริงทั้ง visitor และ Owner (FX-4, draft)",
     "status": "pass",
     "level": "LOCAL",
     "ref": "browser-local B7 (ล้มก่อนแก้ ทำซ้ำได้) + B17 + hosting-build · Cloud TEST 2c89759: T10 PASS"
    },
    {
     "id": "D17",
     "text": "component ที่เริ่มทำงานหลังเลิกห่อ template (ContactRail, LanguageSwitcher, PropertyCard, SearchFilters) ไม่สร้างเคส/บทสนทนา/ข้อความ/ลีด ไม่เรียก Function ฝั่งแชท/เคส ไม่เรียก endpoint production หรือ AI เพียงเพราะเปิดหน้า; ไฟล์ component ที่เปิด URL ตรงไม่รันอะไร (r7)",
     "status": "pass",
     "level": "LOCAL",
     "ref": "browser-local B14 + B15 + hosting-build (สคริปต์ที่รันได้ของไฟล์ component มีแค่ config + guard); พฤติกรรมเดิมที่ยังมี: ContactRail ล็อกอิน anonymous ให้ผู้เยี่ยมชมบางหน้า (ไม่เกิน 1 คน/การเปิดหน้า)"
    },
    {
     "id": "D18",
     "text": "Search (รูปปก ตัวกรอง เปลี่ยนภาษา) และ Details (รูป เปลี่ยนภาษา) ทำงานจากบิลด์จริงหลัง component เริ่มทำงาน; ผู้เยี่ยมชมที่ส่งข้อความในแชทเห็นข้อความขออภัย/ติดต่อเรา ไม่ใช่คำตอบ AI (r7)",
     "status": "pass",
     "level": "LOCAL",
     "ref": "browser-local B17 + B18 (B18: เรียก Functions ของโปรเจกต์ TEST ไม่ได้ในกล่องทดสอบ ไม่ได้ทดสอบ gate 401/403 — ส่วนนั้นอยู่ในชุด chat-live)"
    },
    {
     "id": "D19",
     "text": "ตราอนุมัติรับเรื่อง/เผยแพร่เมื่อผู้อนุมัติเป็นคนละบัญชี: แสดงถูกเหตุการณ์ ไม่สลับตรา เลือก submission ตาม approvedSubmissionId ไม่ใช้ submission ที่ถูกส่งกลับเป็นผู้อนุมัติ บทบาทอย่างเดียวแสดงเป็นบทบาท (FX-1, r7)",
     "status": "pass",
     "level": "LOCAL",
     "ref": "browser-local B16 (3 กรณี: สองบัญชี / ไม่มี approvedSubmissionId / บทบาทอย่างเดียว) — เป็นข้อมูลสังเคราะห์ที่เขียนตรงใน emulator"
    },
    {
     "id": "D20",
     "text": "โมเดลข้อมูลขนาดที่ดิน: เก็บค่าที่กรอก + หน่วย (sqwa|sqm) + ค่ามาตรฐาน ตร.ม. คำนวณครั้งเดียวจากค่าที่กรอก; 100 ตร.ว. = 400 ตร.ม.; 400 ตร.ม. = 100 ตร.ว.; หน่วยหายหรือผิด = ไม่มีค่า (ไม่เดา); server คำนวณใหม่ตอนฉายสาธารณะ ค่า landAreaSqm ที่แก้มือผ่านไปหน้าสาธารณะไม่ได้ (D2, draft)",
     "status": "pass",
     "level": "LOCAL",
     "ref": "tests/listing/land-area.test.js LA1–LA5 + core.test.js L1–L4 (ล้มเมื่อปิดการคำนวณใหม่ของ server) · ที่ source d7ee37e"
    },
    {
     "id": "D21",
     "text": "หน้า Case Data (Staff/Owner): กรอกขนาดที่ดิน + เลือกหน่วย; ไม่มีหน่วย = ปฏิเสธ; บันทึก → รีเฟรช → เปิดแก้ → บันทึกซ้ำ 3 ครั้ง ไม่แปลงซ้ำ (100 ตร.ว. คง 400 ตร.ม.); สลับเป็น 400 ตร.ม. ได้; ข้อมูลเก่าแสดงเป็นข้อมูลเฉย ๆ ไม่เติมค่า ไม่แปลง (D2, draft)",
     "status": "pass",
     "level": "LOCAL",
     "ref": "browser-local B11 + B20 (ผ่าน; negative control ล้มเมื่อใช้หน้าเดิม)"
    },
    {
     "id": "D22",
     "text": "Staff → Owner preview → เผยแพร่ แสดง \"100 ตร.ว. (400 ตร.ม.)\" ใน preview และหน้าสาธารณะครบ 8 ภาษา; ข้อมูลเก่าไม่ระบุหน่วยแสดงเลขโดยไม่ติดป้ายหน่วย + \"ไม่ระบุหน่วย\" ไม่แปลง; ขนาดที่มีหน่วยชนะค่าเก่า (D2, draft)",
     "status": "pass",
     "level": "LOCAL",
     "ref": "browser-local B19 (8 ภาษา) + B20 (th/en/ru/de/zh) — ไม่ใช่ Cloud"
    },
    {
     "id": "D23",
     "text": "ฟอร์มเอเจนต์ (Lister Dashboard): มีตัวเลือกหน่วย; ค่าเก่าไม่ระบุหน่วยแสดงพร้อมหมายเหตุ ไม่เดา และไม่บล็อกการบันทึกฟิลด์อื่น; แก้ค่าแล้วต้องเลือกหน่วย; 150 ตร.ว. เก็บเป็น 150 / sqwa / 600 ตร.ม. ค่า landSize เดิมไม่ถูกแตะ (D2, draft)",
     "status": "pass",
     "level": "LOCAL",
     "ref": "browser-local B21"
    },
    {
     "id": "D24",
     "text": "Case Data: ล้างพื้นที่ที่คนบันทึกไว้ → ล้างทั้งสามฟิลด์ใหม่และ landSize เดิมด้วย; legacy → กรอกค่า+หน่วย → บันทึก → ล้าง → บันทึก/เปิดใหม่ → record/หน้า Staff/แถว Owner preview/เอกสารสาธารณะไม่คืนค่าเก่า; แก้ข้อมูลอื่นของเคสเก่าที่ไม่แตะที่ดินยังเก็บ landSize (D2, draft, Work review r9)",
     "status": "pass",
     "level": "LOCAL",
     "ref": "browser-local B22 + core L5 (negative control: Case Data เดิม → B22 ล้ม) · source 958c877"
    },
    {
     "id": "D25",
     "text": "Lister Dashboard: ค่าที่ landAreaFields ปฏิเสธ (เช่น 5,000,000,000) หรือล้างหน่วยจากรายการที่มีหน่วยแล้ว → แจ้งข้อผิดพลาดและไม่เขียนข้อมูล; ล้างช่อง = ล้างทุกฟิลด์ที่ดินรวม landSize; legacy ที่ไม่ได้แก้ยังบันทึกฟิลด์อื่นได้ (D2, draft, Work review r9)",
     "status": "pass",
     "level": "LOCAL",
     "ref": "browser-local B23 + B21 (negative control: Lister เดิม → B23 ล้ม) · source 958c877"
    }
   ]
  },
  {
   "id": "S-DEV-PHOTOSTAFF",
   "env": "dev",
   "name": "รูปส่วนตัว และหน้า Staff (โค้ด/ในเครื่อง)",
   "locked": false,
   "lockNote": "ร่าง — รอ Work ตรวจและ lock ชุดนี้แยกจากชุดอื่น",
   "items": [
    {
     "id": "D03",
     "text": "รูปส่วนตัวไม่เปิดสาธารณะ ไม่มี token; ทีมงานเห็นผ่าน getCasePhoto",
     "status": "pass",
     "level": "LOCAL",
     "ref": "PP1, B5/B10"
    },
    {
     "id": "D05",
     "text": "หน้า Case Data ให้ Staff กรอกข้อมูลเคสโดยไม่แตะ guard เดิม",
     "status": "pass",
     "level": "LOCAL",
     "ref": "B11"
    }
   ]
  },
  {
   "id": "S-DEV-DEPLOY",
   "env": "dev",
   "name": "เครื่องมือ deploy TEST (โค้ด/ในเครื่อง)",
   "locked": false,
   "lockNote": "ร่าง — รอ Work ตรวจและ lock ชุดนี้แยกจากชุดอื่น",
   "items": [
    {
     "id": "D06",
     "text": "สคริปต์ deploy TEST แยก + โฟลเดอร์ฟังก์ชัน listing 10 ตัว + selector ผ่านโค้ดจริงของ CLI",
     "status": "pass",
     "level": "LOCAL",
     "ref": "L1–L4, F1–F3"
    }
   ]
  },
  {
   "id": "S-DEV-QUALITY",
   "env": "dev",
   "name": "คุณภาพ/ช่องโหว่ที่ยังเปิด (ทดสอบซ้ำ, rules, rate limit)",
   "locked": false,
   "lockNote": "ร่าง — รอ Work ตรวจและ lock ชุดนี้แยกจากชุดอื่น",
   "items": [
    {
     "id": "D08",
     "text": "ชุดทดสอบ browser นิ่ง (รันเต็มซ้ำแล้วผ่านสม่ำเสมอ)",
     "status": "fail",
     "level": "LOCAL",
     "ref": "LOCAL · ยังล้มเป็นพักๆ: head 4a49ea6 รัน 3 รอบ ผ่าน 2 ล้ม 1 (B2); ต้นเหตุยังไม่สรุป — ไม่ปรับเป็นผ่านจากรอบที่ผ่าน"
    },
    {
     "id": "D09",
     "text": "rules บังคับ 'Staff ผู้รับผิดชอบเท่านั้น' (ไม่ใช่แค่หน้าเว็บ)",
     "status": "fail",
     "level": "SOURCE",
     "ref": "rules ให้ Staff คนใดเขียนฟิลด์ที่ไม่ใช่ตราอนุมัติได้"
    },
    {
     "id": "D10",
     "text": "ตรวจใหม่: สิทธิ์เขียนรูปของ flow agent เก่าไม่ข้ามสมาชิก",
     "status": "unverified",
     "level": "SOURCE",
     "ref": "รายงาน Code ยังไม่ audit ซ้ำ"
    },
    {
     "id": "D11",
     "text": "จำกัดอัตราต่อ IP ที่ trackListingCase / ล้างไฟล์อัปโหลดค้าง",
     "status": "fail",
     "level": "SOURCE",
     "ref": "รายงาน Code: ยังไม่มี"
    },
    {
     "id": "D12a",
     "text": "test:listing ที่ head ปัจจุบัน",
     "status": "pass",
     "level": "LOCAL",
     "ref": "LOCAL · test:listing 100 ผ่าน ที่ source SHA 958c877 (รวม land-area LA1–LA5, L1–L5)"
    },
    {
     "id": "D12b",
     "text": "test:chat-live ที่ head ปัจจุบัน",
     "status": "pass",
     "level": "LOCAL",
     "ref": "LOCAL · test:chat-live 34 ผ่าน ที่ source SHA 958c877 (รันเพราะ r9 แตะ data.js)"
    },
    {
     "id": "D12c",
     "text": "test:combined ที่ head ปัจจุบัน",
     "status": "unverified",
     "level": "LOCAL",
     "ref": "ไม่ได้รันรอบนี้ — ผล combined 175 เป็นของรอบก่อน (คง UNVERIFIED)"
    },
    {
     "id": "D12d",
     "text": "test:browser-local ที่ head ปัจจุบัน",
     "status": "pass",
     "level": "LOCAL",
     "ref": "LOCAL · browser-local ที่ source SHA 958c877: รอบเต็ม 23/23 ผ่าน (รวม B19–B23); ก่อนหน้า head 4a49ea6 = 3 รอบ ผ่าน 2 / ล้ม 1 ที่ B2 (flake เดิม ดู D08) — ไม่ได้ลบรอบที่ล้ม; ระหว่างทำ r9b มีรอบที่ล้ม B22 สองครั้ง (ข้อมูลทดสอบ: description สั้นเกิน/คัดลอกเคสแล้วรูปไม่ครบ) แก้ที่ตัวทดสอบ ไม่ใช่โค้ด"
    }
   ]
  },
  {
   "id": "S-TEST-FLOW",
   "env": "test",
   "name": "Cloud TEST — เส้นทางหลัก ส่ง→Staff→Owner→เผยแพร่→ปิด (หนึ่งเคส)",
   "locked": true,
   "lockNote": "Work lock 3 ต.ค. 2569 — เฉพาะ \"หนึ่งเคสสังเคราะห์\" บน Cloud TEST ไม่ใช่ความพร้อม production และไม่รวมการลบ backend/สิทธิ์ทั้งหมด",
   "items": [
    {
     "id": "T01",
     "text": "Deploy TEST ที่ head d0fe617",
     "status": "pass",
     "level": "REAL-TEST",
     "ref": "ภาพ 010910"
    },
    {
     "id": "T02",
     "text": "ลูกค้าส่งฟอร์มพร้อม 7 รูป",
     "status": "pass",
     "level": "REAL-TEST",
     "ref": "ภาพ+คำยืนยัน"
    },
    {
     "id": "T03",
     "text": "Staff เห็นรูปส่วนตัวครบ 7 และเปิดภาพใหญ่ตรงกัน",
     "status": "pass",
     "level": "REAL-TEST",
     "ref": "คำยืนยัน 2 ต.ค. 23:41"
    },
    {
     "id": "T04",
     "text": "Staff กรอกข้อมูล บันทึก รีเฟรชแล้วค่าอยู่ครบ",
     "status": "pass",
     "level": "REAL-TEST",
     "ref": "011030–011249"
    },
    {
     "id": "T05",
     "text": "Staff ส่งตรวจ checklist 19/19",
     "status": "pass",
     "level": "REAL-TEST",
     "ref": "012115, 012206"
    },
    {
     "id": "T06",
     "text": "Owner อนุมัติรับเรื่องและออกรหัสประกาศ",
     "status": "pass",
     "level": "REAL-TEST",
     "ref": "014754"
    },
    {
     "id": "T07",
     "text": "Owner preview แสดงข้อมูลสาธารณะ + รูป 7 ก่อนยืนยัน",
     "status": "pass",
     "level": "REAL-TEST",
     "ref": "014857"
    },
    {
     "id": "T08",
     "text": "Owner เผยแพร่ (ขึ้นสถานะกำลังแสดง)",
     "status": "pass",
     "level": "REAL-TEST",
     "ref": "015012"
    },
    {
     "id": "T15",
     "text": "ปิดประกาศแล้ว Search = 0 รายการ",
     "status": "pass",
     "level": "REAL-TEST",
     "ref": "020034 · ยืนยันซ้ำที่ head 2c89759: หลังปิด Search เหลือ 0 listings (ภาพ 150315)"
    }
   ]
  },
  {
   "id": "S-TEST-PUBLIC",
   "env": "test",
   "name": "Cloud TEST — หน้าสาธารณะแสดงถูกต้อง (DOC-OBS)",
   "locked": true,
   "lockNote": "Work lock 3 ต.ค. 2569; อัปเดตผล Cloud TEST ที่ head 2c89759: T09/T10/T11/T13/T14/T16 PASS, T12 FAIL = 6/7 ≈ 86% — เฉพาะขอบเขตนี้ ไม่ใช่เปอร์เซ็นต์ทั้งโครงการ; T13 PASS เฉพาะเคสสังเคราะห์นี้; ไม่รับรองตำแหน่งแผนที่จริง",
   "items": [
    {
     "id": "T09",
     "text": "หน้า Search พบประกาศตั้งแต่เปิดครั้งแรก",
     "status": "pass",
     "level": "REAL-TEST",
     "ref": "015210"
    },
    {
     "id": "T10",
     "text": "หน้า Search แสดงรูปปก",
     "status": "pass",
     "level": "REAL-TEST",
     "ref": "ภาพเจ้าของ 145029, 145035, 145207, 145211: Search แสดงรูปปกตรงกับเคส; เปลี่ยนไทย → English ได้ เมนู ตัวกรอง และชื่อประกาศเปลี่ยนตาม (Work ตรวจภาพแล้ว) · เคสสังเคราะห์เดิม own-14a754ca222d54e405fe / HH-67680 · Cloud TEST huahin-chat-test-01 ที่ head 2c89759 · 3 ต.ค. 2569"
    },
    {
     "id": "T11",
     "text": "หน้า Details แสดงรูปครบ 7 และภาพใหญ่ตรงกัน",
     "status": "pass",
     "level": "REAL-TEST",
     "ref": "015318, 015323"
    },
    {
     "id": "T12",
     "text": "หน้า Details แสดงหน่วยพื้นที่ที่ดินถูกต้อง",
     "status": "fail",
     "level": "REAL-TEST",
     "ref": "DOC-OBS-02 · คงสถานะเดิม (FAIL จากเคสเก่าที่ 2c89759) · ที่ 958c877 (HH-24379) การแสดงหน่วยใน Owner preview และหน้าสาธารณะไทย/จีนผ่านบน Cloud แล้ว (TD1–TD4); การล้างค่าและการทดสอบส่วนที่เหลือยังไม่ครบ (TD5, TD6, TD7b) — รอ Work ตัดสิน"
    },
    {
     "id": "T13",
     "text": "แผนที่/ระยะทางไม่แสดง undefined หรือ 0 กม. ที่ไม่จริง (เฉพาะเคสนี้)",
     "status": "pass",
     "level": "REAL-TEST",
     "ref": "ภาพ 145317, 145322, 145325: Details ไม่แสดง undefined หรือระยะ 0 ที่ไม่มีข้อมูลรองรับ — PASS เฉพาะเคสนี้; แผนที่พื้นที่ทั่วไปยังไม่ยืนยันตำแหน่งจริง (ISS-MAP-LIMITS) · เคสสังเคราะห์เดิม own-14a754ca222d54e405fe / HH-67680 · Cloud TEST huahin-chat-test-01 ที่ head 2c89759 · 3 ต.ค. 2569"
    },
    {
     "id": "T14",
     "text": "หน้าอนุมัติแสดงผู้อนุมัติ",
     "status": "pass",
     "level": "REAL-TEST",
     "ref": "ภาพ 144101, 144107: แสดงผู้อนุมัติรับเรื่องและผู้เผยแพร่แยกกัน — กรณีบัญชี Owner เดียวกันเท่านั้น (กรณีคนละบัญชียังไม่ทดสอบบน Cloud; มีเฉพาะ B16 ในเครื่อง) · เคสสังเคราะห์เดิม own-14a754ca222d54e405fe / HH-67680 · Cloud TEST huahin-chat-test-01 ที่ head 2c89759 · 3 ต.ค. 2569"
    },
    {
     "id": "T16",
     "text": "หลังปิด หน้า Details แจ้งสถานะ 'ปิดแล้ว/ไม่พบ' ชัดเจน",
     "status": "pass",
     "level": "REAL-TEST",
     "ref": "ภาพ 143124 (ไทย), 150108 (อังกฤษ): หลังปิดประกาศแล้วรีเฟรช Details แสดงไม่พบประกาศ ไม่แสดงรูปหรือข้อมูลเดิม. คำชี้แจงเจ้าของ: ภาพ 150059 = ก่อน Ctrl+Shift+R, ภาพ 150108 = หลัง Ctrl+Shift+R; ไม่มีหลักฐานว่ารูปเดิมแสดงระหว่างโหลด · เคสสังเคราะห์เดิม own-14a754ca222d54e405fe / HH-67680 · Cloud TEST huahin-chat-test-01 ที่ head 2c89759 · 3 ต.ค. 2569"
    }
   ]
  },
  {
   "id": "S-TEST-NEG",
   "env": "test",
   "name": "Cloud TEST — ปฏิเสธ/ลบ/ซ้ำ/ช้า (Listing · ยังไม่ทดสอบ)",
   "locked": false,
   "lockNote": "ร่าง — รอ Work ตรวจและ lock ชุดนี้แยกจากชุดอื่น",
   "items": [
    {
     "id": "T17a",
     "text": "หลังปิด เอกสารสาธารณะ properties/{id} ถูกลบ (ตรวจบน Cloud)",
     "status": "unverified",
     "level": "REAL-TEST",
     "ref": "ยังไม่ได้ตรวจ Cloud"
    },
    {
     "id": "T17b",
     "text": "หลังปิด เอกสารรูปสาธารณะ propertyPhotos ถูกลบ (ตรวจบน Cloud)",
     "status": "unverified",
     "level": "REAL-TEST",
     "ref": "ยังไม่ได้ตรวจ Cloud"
    },
    {
     "id": "T17c",
     "text": "หลังปิด ไฟล์รูปสาธารณะใน Storage ถูกลบ (ตรวจบน Cloud)",
     "status": "unverified",
     "level": "REAL-TEST",
     "ref": "ยังไม่ได้ตรวจ Cloud"
    },
    {
     "id": "T18a",
     "text": "ลิงก์รูปสาธารณะเดิม \"ไฟล์ที่ตรวจ 1 ไฟล์\" ใช้ไม่ได้หลังปิด",
     "status": "pass",
     "level": "REAL-TEST",
     "ref": "ภาพ 145508 (ก่อนปิด โหลดได้), 145934 (หลังปิดและ hard refresh ตอบ 404 Not Found) · หลักฐานเฉพาะไฟล์นี้ — ห้ามสรุปว่าตรวจครบ 7 ไฟล์หรือผ่านเกณฑ์ลบทั้งหมด · เคสสังเคราะห์เดิม own-14a754ca222d54e405fe / HH-67680 · Cloud TEST huahin-chat-test-01 ที่ head 2c89759 · 3 ต.ค. 2569"
    },
    {
     "id": "T18b",
     "text": "ลิงก์รูปสาธารณะเดิม \"ไฟล์อื่นของเคสเดียวกัน (ที่เหลือ)\" ใช้ไม่ได้หลังปิด",
     "status": "unverified",
     "level": "REAL-TEST",
     "ref": "ยังไม่ได้ตรวจ (เก็บ URL ไว้เพียง 1 ไฟล์)"
    },
    {
     "id": "T19a",
     "text": "agent ถูกปฏิเสธบน Cloud",
     "status": "unverified",
     "level": "REAL-TEST",
     "ref": "ยังไม่ได้ทดสอบ"
    },
    {
     "id": "T19b",
     "text": "outsider / ผู้ไม่ได้ลงชื่อเข้าใช้ ถูกปฏิเสธบน Cloud",
     "status": "unverified",
     "level": "REAL-TEST",
     "ref": "ยังไม่ได้ทดสอบ"
    },
    {
     "id": "T19c",
     "text": "uid อื่น (Staff ที่ไม่ได้รับงาน) ถูกปฏิเสธบน Cloud",
     "status": "unverified",
     "level": "REAL-TEST",
     "ref": "ยังไม่ได้ทดสอบ"
    },
    {
     "id": "T20a",
     "text": "เส้นทาง agent ครบบน Cloud",
     "status": "unverified",
     "level": "REAL-TEST",
     "ref": "ทดสอบเฉพาะ local"
    },
    {
     "id": "T20b",
     "text": "เส้นทาง Owner-ส่งเองครบบน Cloud",
     "status": "unverified",
     "level": "REAL-TEST",
     "ref": "ทดสอบเฉพาะ local"
    },
    {
     "id": "T21a",
     "text": "retry หลังตอบกลับหาย บน Cloud",
     "status": "unverified",
     "level": "REAL-TEST",
     "ref": "ทดสอบเฉพาะ local"
    },
    {
     "id": "T21b",
     "text": "ส่งซ้ำ/ดับเบิลคลิก บน Cloud",
     "status": "unverified",
     "level": "REAL-TEST",
     "ref": "ทดสอบเฉพาะ local"
    },
    {
     "id": "T21c",
     "text": "เครือข่ายช้า บน Cloud",
     "status": "unverified",
     "level": "REAL-TEST",
     "ref": "ทดสอบเฉพาะ local"
    },
    {
     "id": "T23",
     "text": "ปิดประกาศ → เปิดใหม่ → ปิดอีกครั้ง ผ่าน UI ได้บน TEST (เคสสังเคราะห์เดิม)",
     "status": "pass",
     "level": "REAL-TEST",
     "ref": "ภาพ เปิดใหม่ 144321, 144507 · ปิด 145635, 145755 · เคสสังเคราะห์เดิม own-14a754ca222d54e405fe / HH-67680 · Cloud TEST huahin-chat-test-01 ที่ head 2c89759 · 3 ต.ค. 2569 · ไม่ได้ตรวจการลบไฟล์ backend ทั้งหมด (T17a–c ยัง UNVERIFIED)"
    }
   ]
  },
  {
   "id": "S-TEST-CHAT",
   "env": "test",
   "name": "Cloud TEST — แชท AI (แยกจาก Listing)",
   "locked": false,
   "lockNote": "ร่าง — แยกจาก checklist Listing ตาม Work; รอ Work lock แยก",
   "items": [
    {
     "id": "T22",
     "text": "แชท AI จริงบน TEST (ต้องมี allow-list/เพดาน/คีย์; ไม่ใช้สคริปต์ CHAT-LIVE เดิม)",
     "status": "blocked",
     "level": "REAL-TEST",
     "ref": "ยังไม่มีแผน/คีย์ ห้ามใช้สคริปต์เก่า"
    }
   ]
  },
  {
   "id": "S-PROD-SEC",
   "env": "prod",
   "name": "Production — ความปลอดภัยและข้อมูลเก่า",
   "locked": false,
   "lockNote": "ร่าง — ยังไม่มีมติขอบเขต production",
   "items": [
    {
     "id": "P01",
     "text": "ย้ายข้อมูลเก่าที่ยังมีเบอร์/trackToken ในเอกสารสาธารณะ",
     "status": "blocked",
     "level": "PROD",
     "ref": "LEGACY-DATA-PLAN.md (ห้ามรันจนอนุมัติ)"
    },
    {
     "id": "P02",
     "text": "แก้ค่าเริ่มต้นบัญชีแอดมินในไฟล์สาธารณะ (SEC-URGENT-01)",
     "status": "fail",
     "level": "SOURCE",
     "ref": "บันทึกแล้ว ยังไม่แก้"
    },
    {
     "id": "P04a",
     "text": "rules ที่ deploy บน production ตรงกับโค้ด",
     "status": "unverified",
     "level": "PROD",
     "ref": "ไม่มีสิทธิ์/ข้อมูล"
    },
    {
     "id": "P04b",
     "text": "functions ที่ deploy บน production ตรงกับโค้ด",
     "status": "unverified",
     "level": "PROD",
     "ref": "ไม่มีสิทธิ์/ข้อมูล"
    }
   ]
  },
  {
   "id": "S-PROD-REL",
   "env": "prod",
   "name": "Production — การ merge/release และสภาพแวดล้อม",
   "locked": false,
   "lockNote": "ร่าง — ยังไม่มีมติขอบเขต production",
   "items": [
    {
     "id": "P03",
     "text": "ตัดสินลำดับ merge chat-live-01 / PR #8 / main",
     "status": "unverified",
     "level": "SOURCE",
     "ref": "ยังไม่มีมติ"
    },
    {
     "id": "P05",
     "text": "ยืนยันโหมด Stripe (Live/Test)",
     "status": "unverified",
     "level": "PROD",
     "ref": "เอกสารขัดกัน"
    },
    {
     "id": "P06",
     "text": "ยืนยัน lifecycle ทางการของ Node.js 20 / Firebase Functions runtime แล้วตัดสินแผนอัปเกรด",
     "status": "unverified",
     "level": "SOURCE",
     "ref": "engines=20 (ใช้รุ่น 20 ไม่ใช่ความล้มเหลว); CLI เตือน 2026-10-30 ยังไม่เทียบเอกสาร lifecycle ทางการ"
    },
    {
     "id": "P08",
     "text": "มติเจ้าของอนุมัติ merge/deploy/เปิดเว็บ (GREEN)",
     "status": "blocked",
     "level": "PROD",
     "ref": "ยังไม่มี"
    }
   ]
  },
  {
   "id": "S-PROD-CHAT",
   "env": "prod",
   "name": "Production — งานแชท AI #14–#18 (แยกจาก Listing)",
   "locked": false,
   "lockNote": "ร่าง — ยังไม่มีมติขอบเขต production",
   "items": [
    {
     "id": "P07",
     "text": "ทดสอบ production ของงานแชท #14–#18 ที่ยังไม่ครบ",
     "status": "unverified",
     "level": "PROD",
     "ref": "ดูทะเบียนค้าง"
    }
   ]
  },
  {
   "id": "S-DOC",
   "env": "docs",
   "name": "รอบเอกสารชุดส่งต่อ v2 + แผงติดตาม",
   "locked": false,
   "lockNote": "ร่าง — Work ยังไม่ lock",
   "items": [
    {
     "id": "R01",
     "text": "รับชุด v2 ครบสามไฟล์และเก็บทุกบรรทัดเดิมของ repo",
     "status": "pass",
     "level": "DOCS",
     "ref": "ตรวจทีละบรรทัด 0 บรรทัดหาย"
    },
    {
     "id": "R02",
     "text": "ตรวจข้อขัดแย้ง X1–X10 / A5 กับ repository",
     "status": "pass",
     "level": "SOURCE",
     "ref": "บล็อก Code v2 ท้ายไฟล์"
    },
    {
     "id": "R03",
     "text": "สร้างแผงติดตามภายในจากทะเบียนเดียว",
     "status": "pass",
     "level": "DOCS",
     "ref": "docs/status-panel/index.html"
    },
    {
     "id": "R04",
     "text": "ทดสอบแผง: ตัวเลขตรงทะเบียน, เปิดจริงทั้งจอใหญ่/มือถือ",
     "status": "pass",
     "level": "LOCAL",
     "ref": "tests/status-panel + ภาพหน้าจอ"
    },
    {
     "id": "R05",
     "text": "ไม่แก้ source เว็บ/Functions/rules ในรอบนี้",
     "status": "pass",
     "level": "SOURCE",
     "ref": "git diff เทียบ d0fe617"
    },
    {
     "id": "R06",
     "text": "Work ตรวจชุด v2 + แผง",
     "status": "unverified",
     "level": "DOCS",
     "ref": "รอ"
    },
    {
     "id": "R07",
     "text": "ตัดสินคำถามเปิดที่ยังเหลือ (D1 lock %, D2 หน่วยที่ดิน, D5 ลำดับงาน)",
     "status": "unverified",
     "level": "DOCS",
     "ref": "รอ Work/เจ้าของ"
    },
    {
     "id": "R08",
     "text": "แยก checklist เป็นขอบเขตย่อยตามสภาพแวดล้อม (พัฒนา 4 · TEST 4 · production 3 · เอกสาร 1) และแยกแชท AI ออกจาก Listing",
     "status": "pass",
     "level": "DOCS",
     "ref": "แผง r3"
    },
    {
     "id": "R09",
     "text": "บันทึกข้อที่รอตัดสิน D1–D5 พร้อมตัวเลือกและข้อเสนอของ Code (ยังไม่ใช่มติ)",
     "status": "pass",
     "level": "DOCS",
     "ref": "ทะเบียน decisions"
    },
    {
     "id": "R10",
     "text": "Viewer/พรีวิวสเตตัสแสดงรุ่นเดียวกับชุดส่งต่อ (ชุด + commit เอกสาร)",
     "status": "unverified",
     "level": "DOCS",
     "ref": "อัปเดตหลัง commit รอบนี้"
    },
    {
     "id": "R11",
     "text": "Code เห็นการแสดงผลของ Artifact บน claude.ai ด้วยตนเอง",
     "status": "unverified",
     "level": "DOCS",
     "ref": "ข้อจำกัดของ Code: ไม่เห็นหน้าจอ claude.ai เอง — คง UNVERIFIED แยกจากหลักฐานภาพของเจ้าของ (R12)"
    },
    {
     "id": "R12",
     "text": "ภาพจากเจ้าของยืนยันการแสดงผลจริงของ Artifact แผง PROJECT-STATUS (รุ่น r3)",
     "status": "pass",
     "level": "REAL-TEST",
     "ref": "เจ้าของส่งภาพ 6 ภาพ 3 ต.ค. 2569 เวลา 11:08–11:09; Work เปิดดูแล้วยืนยันแสดงผลจริง · ไม่ใช่การรับรอง v4/v5 ทุกส่วน · ไม่ต้องขอภาพเดิมซ้ำ"
    },
    {
     "id": "R13",
     "text": "บันทึกแนวคิดของเจ้าของแยก ปัจจุบัน / จำเป็นต่อขั้นถัดไป / อนาคต และคงเส้นทาง รับข้อมูล → Staff → Owner → เผยแพร่/ปิด เป็นงานปัจจุบัน",
     "status": "pass",
     "level": "DOCS",
     "ref": "ทะเบียนแนวคิด I01–I08, F01–F08"
    },
    {
     "id": "R14",
     "text": "ตรวจ source DOC-OBS-01…05 พร้อมข้อเสนอแก้ขั้นต่ำ FX-1…FX-5 (Work สั่งลงมือ FX-3 แล้ว; FX-1/2/4/5 ยังรอ)",
     "status": "pass",
     "level": "SOURCE",
     "ref": "4 จาก 5 พบต้นเหตุ; DOC-OBS-01 ยังไม่พบ"
    },
    {
     "id": "R15",
     "text": "บันทึกข้อกำหนดเจ้าของ A1–A10 แยก ปัจจุบัน / เมื่อถึงขั้น / อนาคต พร้อมตรวจช่องว่างจาก source (ไม่สร้างฟังก์ชันเพิ่ม)",
     "status": "pass",
     "level": "SOURCE",
     "ref": "ทะเบียน reqs; ช่องว่างหลายข้อ = เปิดไว้ ไม่ใช่ PASS ของฟังก์ชัน"
    },
    {
     "id": "R16",
     "text": "ตรวจรุ่นเอกสาร/code SHA/TEST SHA/จำนวนขอบเขต/ประวัติให้สอดคล้อง ไม่แสดง commit เอกสารเก่าเป็นรุ่นปัจจุบัน",
     "status": "pass",
     "level": "DOCS",
     "ref": "tests/status-panel P14"
    },
    {
     "id": "R17",
     "text": "ซิงก์ผล Cloud TEST ที่ head 2c89759 ลงชุดส่งต่อ/แผง แยกจากผล emulator (T10/T13/T14/T16 PASS, T12 FAIL, S-TEST-PUBLIC 6/7)",
     "status": "pass",
     "level": "DOCS",
     "ref": "tests/status-panel P16"
    },
    {
     "id": "R18",
     "text": "บันทึกมติ D2 + ผลตรวจทุกเส้นทาง landSize + ข้อขัดแย้งที่รายงาน + ผลทดสอบ ลงชุดส่งต่อสามไฟล์/แผง (r9)",
     "status": "pass",
     "level": "DOCS",
     "ref": "tests/status-panel P17"
    },
    {
     "id": "R19",
     "text": "บันทึกผล Work review r9 (ล้างที่ดิน/Lister validation/ช่องทางที่รองรับ) ลงชุดส่งต่อสามไฟล์/แผง (r9b)",
     "status": "pass",
     "level": "DOCS",
     "ref": "tests/status-panel"
    }
   ]
  },
  {
   "id": "S-TEST-D2",
   "env": "test",
   "name": "Cloud TEST — หน่วยที่ดิน D2 (head 958c877)",
   "locked": false,
   "lockNote": "ร่าง — แยกจาก S-TEST-PUBLIC ที่ Work lock; T12 คงสถานะเดิมรอ Work ตัดสิน",
   "items": [
    {
     "id": "TD1",
     "text": "Owner preview แสดง 100 ตร.ว. (400 ตร.ม.)",
     "status": "pass",
     "level": "REAL-TEST",
     "ref": "ภาพ 211504 · ภาพเจ้าของที่ Work ตรวจ · เคสสังเคราะห์ HH-24379 · Cloud TEST huahin-chat-test-01 ที่ head 958c877 (เจ้าของ deploy สำเร็จ ตามที่ Work ยืนยัน) · 3 ต.ค. 2569"
    },
    {
     "id": "TD2",
     "text": "เผยแพร่สำเร็จ โดยบัญชี Owner (ตราผู้เผยแพร่แสดงถูกต้อง)",
     "status": "pass",
     "level": "REAL-TEST",
     "ref": "ภาพ 212703 · ภาพเจ้าของที่ Work ตรวจ · เคสสังเคราะห์ HH-24379 · Cloud TEST huahin-chat-test-01 ที่ head 958c877 (เจ้าของ deploy สำเร็จ ตามที่ Work ยืนยัน) · 3 ต.ค. 2569"
    },
    {
     "id": "TD3",
     "text": "หน้าสาธารณะภาษาไทยแสดงหน่วยถูกต้อง",
     "status": "pass",
     "level": "REAL-TEST",
     "ref": "ภาพ 212839 · ภาพเจ้าของที่ Work ตรวจ · เคสสังเคราะห์ HH-24379 · Cloud TEST huahin-chat-test-01 ที่ head 958c877 (เจ้าของ deploy สำเร็จ ตามที่ Work ยืนยัน) · 3 ต.ค. 2569"
    },
    {
     "id": "TD4",
     "text": "หน้าสาธารณะภาษาจีนแสดงค่าเทียบเท่าถูกต้อง",
     "status": "pass",
     "level": "REAL-TEST",
     "ref": "ภาพ 212903 · ภาพเจ้าของที่ Work ตรวจ · เคสสังเคราะห์ HH-24379 · Cloud TEST huahin-chat-test-01 ที่ head 958c877 (เจ้าของ deploy สำเร็จ ตามที่ Work ยืนยัน) · 3 ต.ค. 2569"
    },
    {
     "id": "TD5",
     "text": "ล้างค่าที่ดินแล้วค่าเก่าไม่กลับมา (preview + สาธารณะ) บน Cloud",
     "status": "unverified",
     "level": "REAL-TEST",
     "ref": "ยังไม่ได้ทดสอบบน Cloud (มีเฉพาะ LOCAL: B22, L5)"
    },
    {
     "id": "TD6",
     "text": "ภาษาอื่นอีก 6 ภาษา (en ru de no fr it) แสดงหน่วยบน Cloud",
     "status": "unverified",
     "level": "REAL-TEST",
     "ref": "เห็นเฉพาะไทยและจีน — ยังไม่รับรองครบ 8 ภาษา (LOCAL B19 ครบ 8 ภาษา แต่ไม่ใช่ Cloud)"
    },
    {
     "id": "TD7a",
     "text": "บันทึกครั้งแรก + รีเฟรช: ข้อมูลที่ดินครบถูกต้อง บน Cloud",
     "status": "pass",
     "level": "REAL-TEST",
     "ref": "คำยืนยันของเจ้าของ \"ข้อมูลครบถูกต้อง\" หลังบันทึกและรีเฟรชครั้งแรก (คำยืนยันจากเจ้าของ ไม่มีรหัสภาพ) · HH-24379 · Cloud TEST 958c877"
    },
    {
     "id": "TD7b",
     "text": "บันทึกซ้ำ (เนื้อหาเดิม) แล้วไม่แปลงซ้ำ บน Cloud",
     "status": "unverified",
     "level": "REAL-TEST",
     "ref": "ยังไม่มีคำยืนยันชัดเจนของเจ้าของว่าบันทึกซ้ำแล้วไม่แปลงซ้ำ (LOCAL: B11 บันทึกซ้ำ 3 ครั้งไม่แปลงซ้ำ — ไม่ใช่ Cloud)"
    }
   ]
  }
 ],
 "taskMeta": {
  "ชุดส่งต่อ v1": {
   "id": "W01",
   "env": "docs",
   "scope": "S-DOC",
   "actor": "work",
   "date": "2026-10-03",
   "commit": "34a0eb0 (v1.1)",
   "items": [
    "R01",
    "R02",
    "R03",
    "R04",
    "R05",
    "R06",
    "R07",
    "R08",
    "R09",
    "R10",
    "R11"
   ]
  },
  "CHAT-LIVE-01": {
   "id": "W02",
   "env": "dev",
   "scope": null,
   "actor": "code",
   "date": "2026-10-01",
   "commit": "beec235 (chat-live-01)",
   "items": []
  },
  "LISTING-E2E submit case/photos": {
   "id": "W03",
   "env": "test",
   "scope": "S-TEST-FLOW",
   "actor": "owner",
   "date": "2026-10-03",
   "commit": "d0fe617",
   "items": [
    "T01",
    "T02"
   ]
  },
  "Staff 7 photos/lightbox": {
   "id": "W04",
   "env": "test",
   "scope": "S-TEST-FLOW",
   "actor": "owner",
   "date": "2026-10-02",
   "commit": "e837d93→d0fe617",
   "items": [
    "T03"
   ]
  },
  "Staff data save/refresh": {
   "id": "W05",
   "env": "test",
   "scope": "S-TEST-FLOW",
   "actor": "owner",
   "date": "2026-10-03",
   "commit": "d0fe617",
   "items": [
    "T04"
   ]
  },
  "Staff submit review": {
   "id": "W06",
   "env": "test",
   "scope": "S-TEST-FLOW",
   "actor": "owner",
   "date": "2026-10-03",
   "commit": "d0fe617",
   "items": [
    "T05"
   ]
  },
  "Owner intake/preview/publish": {
   "id": "W07",
   "env": "test",
   "scope": "S-TEST-FLOW",
   "actor": "owner",
   "date": "2026-10-03",
   "commit": "d0fe617",
   "items": [
    "T06",
    "T07",
    "T08",
    "T14"
   ]
  },
  "Public details 7 photos": {
   "id": "W08",
   "env": "test",
   "scope": "S-TEST-PUBLIC",
   "actor": "owner",
   "date": "2026-10-03",
   "commit": "d0fe617",
   "items": [
    "T11"
   ]
  },
  "Public search cover/data labels/map": {
   "id": "W09",
   "env": "test",
   "scope": "S-TEST-PUBLIC",
   "actor": "code",
   "date": "2026-10-03",
   "commit": "d0fe617",
   "items": [
    "T09",
    "T10",
    "T12",
    "T13"
   ]
  },
  "Take-down search/details": {
   "id": "W10",
   "env": "test",
   "scope": "S-TEST-FLOW",
   "actor": "owner",
   "date": "2026-10-03",
   "commit": "d0fe617",
   "items": [
    "T15",
    "T16",
    "T17a",
    "T17b",
    "T17c",
    "T18a",
    "T18b",
    "T23"
   ]
  },
  "Full 3 submitter groups": {
   "id": "W11",
   "env": "test",
   "scope": "S-TEST-NEG",
   "actor": "owner",
   "date": "2026-10-03",
   "commit": "d0fe617",
   "items": [
    "T19a",
    "T19b",
    "T19c",
    "T20a",
    "T20b",
    "T21a",
    "T21b",
    "T21c"
   ]
  },
  "Privacy legacy migration": {
   "id": "W12",
   "env": "prod",
   "scope": "S-PROD-SEC",
   "actor": "owner",
   "date": "2026-10-01",
   "commit": "LEGACY-DATA-PLAN.md",
   "items": [
    "P01"
   ]
  },
  "Production release": {
   "id": "W13",
   "env": "prod",
   "scope": "S-PROD-REL",
   "actor": "owner",
   "date": "2026-10-03",
   "commit": "—",
   "items": [
    "P03",
    "P04a",
    "P04b",
    "P05",
    "P08"
   ]
  },
  "ตรวจ source DOC-OBS + ทะเบียนแนวคิด r4": {
   "id": "W14",
   "env": "docs",
   "scope": "S-DOC",
   "actor": "work",
   "date": "2026-10-03",
   "commit": "r4",
   "items": [
    "R13",
    "R14"
   ]
  },
  "ข้อกำหนดเจ้าของ A1–A10 + FX-3 (DOC-OBS-05) r5": {
   "id": "W15",
   "env": "dev",
   "scope": "S-DEV-CORE",
   "actor": "work",
   "date": "2026-10-03",
   "commit": "r5",
   "items": [
    "D13"
   ]
  },
  "FX-1/2/4 ใน draft + ทดสอบ FX-3 เพิ่ม + ทะเบียนรุ่น/ผลทดสอบ r6": {
   "id": "W16",
   "env": "dev",
   "scope": "S-DEV-CORE",
   "actor": "work",
   "date": "2026-10-03",
   "commit": "source 7c1ec6b",
   "items": [
    "D14",
    "D15",
    "D16"
   ]
  },
  "ตรวจผลกระทบ component + FX-1 สองบัญชี r7": {
   "id": "W17",
   "env": "dev",
   "scope": "S-DEV-CORE",
   "actor": "work",
   "date": "2026-10-03",
   "commit": "source 678a042",
   "items": [
    "D17",
    "D18",
    "D19"
   ]
  },
  "ซิงก์ผล Cloud TEST ที่ head 2c89759 (r8)": {
   "id": "W18",
   "env": "test",
   "scope": "S-TEST-PUBLIC",
   "actor": "work",
   "date": "2026-10-03",
   "commit": "Cloud TEST 2c89759",
   "items": [
    "T10",
    "T13",
    "T14",
    "T16"
   ]
  },
  "D2 หน่วยที่ดิน (FX-5) ใน draft r9": {
   "id": "W19",
   "env": "dev",
   "scope": "S-DEV-CORE",
   "actor": "work",
   "date": "2026-10-03",
   "commit": "source d7ee37e",
   "items": [
    "D20",
    "D21",
    "D22",
    "D23"
   ]
  },
  "D2 r9b แก้ข้อพบ Work review": {
   "id": "W20",
   "env": "dev",
   "scope": "S-DEV-CORE",
   "actor": "work",
   "date": "2026-10-03",
   "commit": "source 958c877",
   "items": [
    "D24",
    "D25"
   ]
  },
  "D2 ผลบน Cloud TEST ที่ head 958c877 (HH-24379)": {
   "id": "W21",
   "env": "test",
   "scope": "S-TEST-D2",
   "actor": "work",
   "date": "2026-10-03",
   "commit": "Cloud TEST 958c877",
   "items": [
    "TD1",
    "TD2",
    "TD3",
    "TD4",
    "TD5",
    "TD6",
    "TD7a",
    "TD7b"
   ]
  }
 },
 "issues": [
  {
   "id": "DOC-OBS-01",
   "title": "Search ไม่แสดงรูปปก — ยืนยันบน Cloud TEST ว่าแก้แล้ว (เคสสังเคราะห์เดียว)",
   "sev": "high",
   "status": "closed",
   "env": "test",
   "actor": "code",
   "next": "ปิดข้อสังเกต; ติดตามต่อเฉพาะ ISS-TESTBUILD",
   "source": "REAL-TEST (T10) ภาพ 145029–145211 ที่ head 2c89759; ต้นเหตุ = บิลด์ TEST ห่อ component (แก้แล้ว)"
  },
  {
   "id": "DOC-OBS-02",
   "title": "ขนาดที่ดิน ตร.ว./ตร.ม. — D2 อนุมัติ; deploy TEST แล้ว (958c877): เคส HH-24379 แสดงถูกต้องไทย/จีน; ยังไม่ทดสอบล้างค่า/ครบ 8 ภาษาบน Cloud; T12 รอ Work ตัดสิน",
   "sev": "high",
   "status": "open",
   "env": "test",
   "actor": "work",
   "next": "Work ตัดสินว่าจะเปลี่ยน T12 จากหลักฐาน TD1–TD4 หรือรอ TD5–TD7 ก่อน (Code ไม่เปลี่ยนเอง)",
   "source": "SOURCE (r6): ที่มาแต่ละ flow = ตร.ว./ตร.ม./sqwah/sqm ปนกัน (ดู FX-5); ไม่มีโค้ดแปลง · Cloud TEST 3 ต.ค.: T12 ยัง FAIL — กรอก 100 ตร.ว. แต่ Details แสดง 100 sqm · r9 LOCAL: B11/B19/B20/B21 + LA1–LA5 + L1–L4 ผ่านที่ source d7ee37e (ยังไม่ deploy; ยังไม่แก้/ไม่ migrate ข้อมูล Cloud) · Cloud TEST 958c877 (REAL-TEST): TD1–TD4 ผ่าน (HH-24379) — แยกจาก LOCAL"
  },
  {
   "id": "DOC-OBS-03",
   "title": "undefined / ระยะ 0 กม. ในหน้า Details — ยืนยันบน Cloud TEST ว่าไม่ปรากฏ (เฉพาะเคสสังเคราะห์นี้); ข้อจำกัดแผนที่ติดตามที่ ISS-MAP-LIMITS",
   "sev": "med",
   "status": "closed",
   "env": "test",
   "actor": "code",
   "next": "ปิดข้อสังเกตนี้; ห้ามอ้างว่าแผนที่/ตำแหน่งถูกต้อง",
   "source": "REAL-TEST (T13) ภาพ 145317, 145322, 145325"
  },
  {
   "id": "DOC-OBS-04",
   "title": "อนุมัติโดย \"-\" — ยืนยันบน Cloud TEST ว่าแสดงผู้อนุมัติรับเรื่อง/เผยแพร่แยกกัน (บัญชี Owner เดียวกัน)",
   "sev": "low",
   "status": "closed",
   "env": "test",
   "actor": "code",
   "next": "ปิดข้อสังเกต; กรณีคนละบัญชียังไม่ทดสอบบน Cloud (มี B16 ในเครื่อง)",
   "source": "REAL-TEST (T14) ภาพ 144101, 144107"
  },
  {
   "id": "DOC-OBS-05",
   "title": "หน้า Details ว่างหลังปิดประกาศ — ยืนยันบน Cloud TEST ว่าแสดงไม่พบประกาศ (ไทย/อังกฤษ)",
   "sev": "med",
   "status": "closed",
   "env": "test",
   "actor": "code",
   "next": "ปิดข้อสังเกต",
   "source": "REAL-TEST (T16) ภาพ 143124, 150108 (150059 = ก่อน Ctrl+Shift+R)"
  },
  {
   "id": "SEC-URGENT-01",
   "title": "ค่าเริ่มต้นบัญชีแอดมินอยู่ในไฟล์สาธารณะ (ไม่แสดงค่า)",
   "sev": "critical",
   "status": "open",
   "env": "prod",
   "actor": "owner",
   "next": "เจ้าของจัดลำดับ; ห้ามนำค่าไปแสดงซ้ำ",
   "source": "docs/security/SEC-URGENT-01 (บันทึกแล้ว ยังไม่แก้ ยังไม่ทดสอบ production)"
  },
  {
   "id": "ISS-LEGACY",
   "title": "เคสเก่าใน production ยังมีเบอร์/trackToken ในเอกสารที่ public อ่านได้",
   "sev": "critical",
   "status": "blocked",
   "env": "prod",
   "actor": "owner",
   "next": "ห้าม migrate/ลบ จนเจ้าของอนุมัติแยก",
   "source": "docs/listing-e2e/LEGACY-DATA-PLAN.md"
  },
  {
   "id": "ISS-ASSIGN",
   "title": "'Staff ผู้รับผิดชอบเท่านั้น' บังคับที่หน้าเว็บ ไม่ใช่ใน rules",
   "sev": "med",
   "status": "open",
   "env": "dev",
   "actor": "work",
   "next": "Work/เจ้าของตัดสินว่าจะ harden rules หรือไม่",
   "source": "SOURCE: firestore.rules caseInternal"
  },
  {
   "id": "ISS-FLAKE",
   "title": "ชุดทดสอบ browser ล้มเป็นพักๆ ราว 1 ใน 4 รอบเต็ม",
   "sev": "med",
   "status": "open",
   "env": "dev",
   "actor": "code",
   "next": "ตรวจสาเหตุแยกจากงานแก้ DOC-OBS",
   "source": "CODE-REPORT (B2, B5→B9 cascade, B11)"
  },
  {
   "id": "ISS-AGENTPHOTO",
   "title": "rules รูป flow agent เก่าเคยเขียนทับข้ามสมาชิกได้ — ต้อง re-audit",
   "sev": "high",
   "status": "open",
   "env": "prod",
   "actor": "code",
   "next": "audit ก่อน production",
   "source": "CODE-REPORT"
  },
  {
   "id": "ISS-RATE",
   "title": "ไม่มี rate limit ต่อ IP ที่ trackListingCase; ไฟล์อัปโหลดค้างยังไม่ล้างครบ; quota agent ยังไม่รวมเคสจากฟอร์ม",
   "sev": "low",
   "status": "open",
   "env": "dev",
   "actor": "code",
   "next": "ตรวจ source ล่าสุดก่อนเสนอ",
   "source": "CODE-REPORT"
  },
  {
   "id": "ISS-ADMINLINKS",
   "title": "ลิงก์ Admin Dashboard 10 หน้าไม่อยู่ใน TEST build (404 โดยตั้งใจ)",
   "sev": "info",
   "status": "open",
   "env": "test",
   "actor": "code",
   "next": "ไม่ขยายงานอัตโนมัติ",
   "source": "tools/build-listing-test.js (รายการชื่อ)"
  },
  {
   "id": "ISS-MERGE",
   "title": "ลำดับ merge: main ⊂ chat-live-01 (+18) ⊂ listing-e2e-01 (+32); PR #8 ชี้ chat-live-01",
   "sev": "high",
   "status": "open",
   "env": "prod",
   "actor": "owner",
   "next": "พักไว้ตามมติเจ้าของ (3 ต.ค.): ไม่ใช้เป็นเงื่อนไขบล็อกการปิดรอบเอกสาร; ยังห้าม merge จนมีมติ",
   "source": "SOURCE: git (ตรวจ 3 ต.ค.)"
  },
  {
   "id": "ISS-NODE20",
   "title": "Node.js 20: UNVERIFIED — Firebase CLI เตือนปิดรุ่น 2026-10-30 แต่ยังไม่ตรวจ lifecycle ทางการ (ไม่ใช่ FAIL เพียงเพราะใช้รุ่น 20)",
   "sev": "med",
   "status": "open",
   "env": "prod",
   "actor": "code",
   "next": "Code ตรวจเอกสาร lifecycle ทางการของ Node.js/Firebase Functions แล้วรายงาน; จึงจะตัดสินว่าต้องอัปเกรดหรือไม่",
   "source": "SOURCE: functions/package.json engines=20 · ข้อความจาก CLI ในภาพ deploy (ยังไม่ใช่เอกสารทางการ)"
  },
  {
   "id": "ISS-DOCS-SPLIT",
   "title": "CLAUDE.md สามสภาพ (repo/main/โปรเจกต์ Claude AI) และ Viewer สองที่",
   "sev": "low",
   "status": "open",
   "env": "docs",
   "actor": "owner",
   "next": "เจ้าของยืนยันแล้ว: แผง Code เป็นตัวหลัก + workflow Code → Work review → เจ้าของทดสอบ TEST; เหลือเฉพาะการเขียน CLAUDE.md ฉบับปัจจุบันใหม่ (งานเอกสารแยกรอบ ไม่บล็อก)",
   "source": "A3 X5/X6 · repo CLAUDE.md มีบล็อกชี้ชุดส่งต่อแล้ว"
  },
  {
   "id": "ISS-M17",
   "title": "โฟลเดอร์ m17/ บน main (มี service worker, sitemap ของตัวเอง) เจตนา/ผลกระทบไม่ทราบ",
   "sev": "med",
   "status": "open",
   "env": "prod",
   "actor": "owner",
   "next": "inventory อ่านอย่างเดียว ไม่ลบ/ปิดเอง",
   "source": "SOURCE: เพิ่ม 2026-09-26 (3a0d4db, 3eed793, 2192b0b)"
  },
  {
   "id": "ISS-STRIPE",
   "title": "โหมด Stripe และ rules/functions ที่ deploy บน production ไม่ทราบ",
   "sev": "high",
   "status": "open",
   "env": "prod",
   "actor": "owner",
   "next": "ต้องมีหลักฐานจาก console — ห้ามประกาศพร้อมจากเอกสาร",
   "source": "UNKNOWN"
  },
  {
   "id": "P-10",
   "title": "#10 AI ห้ามสัญญา 'ทีมงานจะติดต่อกลับ' — ยืนยัน production ค้าง",
   "sev": "med",
   "status": "open",
   "env": "prod",
   "actor": "work",
   "next": "R10-TRUTH (T-2..T-5 พร้อม, T-1 BLOCKED)",
   "source": "HANDOFF/BLUEPRINT §35.34"
  },
  {
   "id": "P-12",
   "title": "#12 CHAT_I18N ขาดคีย์หลายภาษา (จำนวนที่เหลือไม่ทราบ)",
   "sev": "low",
   "status": "open",
   "env": "prod",
   "actor": "work",
   "next": "backlog — ตรวจจำนวนคีย์ก่อนเสนอ",
   "source": "BLUEPRINT §35.29"
  },
  {
   "id": "P-13",
   "title": "#13 ภาษาไม่ถูกส่งต่อไปหน้า Owner Submission",
   "sev": "low",
   "status": "open",
   "env": "prod",
   "actor": "work",
   "next": "backlog — ยังไม่ audit",
   "source": "BLUEPRINT §35.32"
  },
  {
   "id": "P-14",
   "title": "#14 Viewing/handoff ยังไม่ CLOSED (S-3 ไม่ผ่าน, S-5 ไม่ทราบ)",
   "sev": "med",
   "status": "open",
   "env": "prod",
   "actor": "work",
   "next": "rerun S-3 หลัง #18 ตามมติ",
   "source": "HANDOFF/AI addendum A2"
  },
  {
   "id": "P-15-17",
   "title": "#15 และ #17 รายงาน PASS แต่ยังไม่ประกาศ CLOSED",
   "sev": "info",
   "status": "open",
   "env": "prod",
   "actor": "work",
   "next": "ตรวจขอบเขตก่อนปิด",
   "source": "HANDOFF (V STEP 102/111)"
  },
  {
   "id": "P-16",
   "title": "#16 persona หญิง: Home production ไม่ได้ยืนยัน, AI Concierge ผลทดสอบไม่ทราบ",
   "sev": "med",
   "status": "open",
   "env": "prod",
   "actor": "work",
   "next": "ต้องหลักฐาน production",
   "source": "AI addendum A4"
  },
  {
   "id": "P-18",
   "title": "#18 Firebase init race: ส่งขึ้น main ครบ 3 ไฟล์ แต่ยังไม่ทดสอบ production",
   "sev": "high",
   "status": "open",
   "env": "prod",
   "actor": "work",
   "next": "Code ยืนยันแล้วว่าอยู่ใน branch; รอทดสอบ production ตามมติ",
   "source": "SOURCE: 4e358a5 เป็น ancestor ของ listing-e2e-01; มี whenFirebaseReady ในไฟล์ปัจจุบัน"
  },
  {
   "id": "ISS-X1",
   "title": "H-2: Preview PASS vs Production BLOCKED/NOT VERIFIED (ต่างสภาพแวดล้อม)",
   "sev": "info",
   "status": "open",
   "env": "prod",
   "actor": "work",
   "next": "แนบหลักฐานก่อนเรียก Preview VERIFIED",
   "source": "HANDOFF X1"
  },
  {
   "id": "ISS-X2",
   "title": "FR fallback: แก้ภาษา (FIX F, 02230ae ผ่าน 23 ก.ย.) แต่ต้นเหตุ technical error ไม่ทราบ",
   "sev": "low",
   "status": "open",
   "env": "prod",
   "actor": "work",
   "next": "ตรวจหลักฐานเดิมก่อนปิด ห้าม retry FR",
   "source": "HANDOFF X2 · SOURCE: 02230ae เป็น ancestor"
  },
  {
   "id": "ISS-X3",
   "title": "Home submitWelcome: อยู่ใน template และผูกปุ่มส่งแล้ว แต่ยังไม่ได้รันจริง",
   "sev": "low",
   "status": "open",
   "env": "prod",
   "actor": "code",
   "next": "UNVERIFIED เชิงรันจริง — audit ตาม scope ภายหลัง",
   "source": "SOURCE: Home.dc.html บรรทัด 733, 121, 124"
  },
  {
   "id": "ISS-BLOCKED9",
   "title": "9 ข้อทดสอบ production BLOCKED (T-1 V-1 V-2 V-4 V-5 B-1 C-4 TX-1 TX-2) — ไม่มีทรัพย์เผยแพร่จริง",
   "sev": "med",
   "status": "blocked",
   "env": "prod",
   "actor": "owner",
   "next": "PD-12 ห้ามสร้างทรัพย์เพื่อให้ผ่าน; TEST ใช้แทนไม่ได้ถ้าไม่มีมติ",
   "source": "HANDOFF/AI addendum A4"
  },
  {
   "id": "ISS-TESTBUILD",
   "title": "บิลด์ TEST ห่อไฟล์ component (4 ตัว) ใน <template> → component ไม่มีตรรกะบน Cloud TEST d0fe617 (แก้ใน draft; ตรวจผลกระทบแล้ว)",
   "sev": "high",
   "status": "open",
   "env": "test",
   "actor": "work",
   "next": "Work ตรวจ + รับทราบ; เจ้าของ deploy TEST ตาม head ที่ Work ระบุ แล้วทดสอบเฉพาะจุดที่เปลี่ยน (ดูแผน r7)",
   "source": "SOURCE/LOCAL (r7): ผลกระทบจำกัดเฉพาะหน้าที่มี component — Home, Search, Details, About, Contact, index (ContactRail) · +Agent Profile, Lister Dashboard (LanguageSwitcher) · Search/Lister Dashboard (SearchFilters) · Home/Search/Details/index (PropertyCard). หน้าฟอร์ม/ทีมงาน (Owner Submission, Track, Case Data, Staff Workspace, Listing Approvals, Admin) ไม่มี component จึงไม่ได้รับผล. PASS เดิมของ Cloud TEST (T01–T08, T09, T11, T15) ไม่ถูกลบ แต่ถือเป็นหลักฐานที่มีข้อจำกัดของ build; ไม่อ้างว่า component ทุกตัวบน Cloud ทดสอบแล้ว · r8: ที่ head 2c89759 บน Cloud TEST ยืนยัน component ที่เกี่ยวกับ Search (รูปปก เมนู ตัวกรอง ชื่อตามภาษา) ทำงาน (T10); ContactRail/การเริ่ม conversation บน Cloud ยัง UNVERIFIED"
  },
  {
   "id": "ISS-RAIL-ANON",
   "title": "ContactRail บนบิลด์ TEST จะล็อกอิน anonymous ให้ผู้เยี่ยมชม (Search/Details/About/Contact) และอ่านข้อมูลเริ่มต้น เมื่อเปิดหน้า — พฤติกรรมเดิมของ production ที่เพิ่งเริ่มทำงานบน TEST",
   "sev": "low",
   "status": "open",
   "env": "test",
   "actor": "work",
   "next": "Work รับทราบ: Anonymous Auth ต้องเปิดอยู่ในโปรเจกต์ TEST (ลูกค้าสังเคราะห์ส่งฟอร์มได้บน Cloud ที่ T02 จึงน่าจะเปิดอยู่ — Cloud ยัง UNVERIFIED สำหรับแถบแชท; ถ้าปิด แถบแชทจะ fallback เป็นโหมดในเครื่อง); ฟังก์ชันแชทยังไม่ deploy บน TEST (ค้างที่ 6/8) → ผู้เยี่ยมชมที่ส่งข้อความเห็นข้อความขออภัย/ติดต่อเรา; ไม่แก้ด้วยการปิด gate หรือใช้ endpoint production",
   "source": "LOCAL (r7): B14 (ไม่สร้างเอกสาร ไม่เรียก Function) + B18; Cloud: UNVERIFIED"
  },
  {
   "id": "ISS-MAP-LIMITS",
   "title": "ข้อจำกัดแผนที่/ตำแหน่งสาธารณะ: พิกัดที่ Staff กรอกยังไม่ถูกนำไปแสดง; แผนที่อาจใช้จุดกลางเริ่มต้น; ระยะจากพิกัดเป็นเส้นตรงถึงจุดอ้างอิง ไม่ใช่ระยะเดินทาง",
   "sev": "med",
   "status": "open",
   "env": "test",
   "actor": "work",
   "next": "ห้ามประกาศว่าแผนที่/ตำแหน่งถูกต้องครบ; ต้องมีมติว่า \"พื้นที่ระดับใดเปิดสาธารณะได้\" ก่อนออกแบบ (ขึ้นกับ D2/ข้อกำหนดความเป็นส่วนตัว)",
   "source": "SOURCE (r7): coordsRaw เป็นฟิลด์ภายใน; Property Details ใช้ ZONE_COORDS หรือจุดกลาง 12.55,99.96 · Cloud TEST 3 ต.ค.: แผนที่พื้นที่ทั่วไปยังไม่ยืนยันตำแหน่งจริง (คงข้อจำกัด)"
  },
  {
   "id": "ISS-LAND-CONFLICTS",
   "title": "ช่องทางที่ D2 รองรับแล้ว: Case Data (Staff/Owner), Lister Dashboard (เอเจนต์, แก้/บันทึก), Owner preview, Property Details สาธารณะ, projection ฝั่ง server, Staff checklist. ยังไม่รองรับ (ห้ามสรุปว่าหน่วยที่ดินครบทั้งระบบ): Owner Submission (ไม่มีช่องที่ดิน), Admin Dashboard, AI Quick Add, AI draft ใน Functions (prompt \"ตารางวา\" + completeness), ข้อความบริบท AI ใน Home (sqwah) / ContactRail (sqm), ช่อง ไร่/งาน/ตร.ว. ของ Lister (อีกชุด)",
   "sev": "med",
   "status": "open",
   "env": "dev",
   "actor": "work",
   "next": "Work ตัดสินว่าจะให้ทำส่วนใดต่อ (ต้องแตะ Functions AI/Phase 2A หรือหน้า Admin) — Code ไม่ติดป้ายหน่วยให้ข้อมูลเก่าเองแม้รู้ที่มา (เช่นแหล่ง AI = ตร.ว.) จนกว่าจะมีมติ",
   "source": "SOURCE (r9): functions/index.js:387,455,698; functions/draft-completeness.js:56-58; Owner Submission.dc.html (ไม่มีช่อง); Admin Dashboard.dc.html; AI Quick Add.dc.html; Home.dc.html:828; ContactRail.dc.html:1729"
  },
  {
   "id": "ISS-LAND-LEGACY-DISPLAY",
   "title": "หน้าสาธารณะของรายการเก่าที่มีเลข landSize ไม่ระบุหน่วย: เดิมแสดง \"X ตร.ม.\" (เดาหน่วย) — หลังแก้แสดง \"X (ไม่ระบุหน่วย)\" และ Owner preview แสดงเช่นกัน",
   "sev": "med",
   "status": "open",
   "env": "prod",
   "actor": "work",
   "next": "Work รับทราบการเปลี่ยนพฤติกรรมก่อน merge (ตามมติห้ามเดา); ผู้ที่ทราบหน่วยแก้รายการทีละรายการผ่านฟอร์ม; ไม่มีการแปลงอัตโนมัติ",
   "source": "LOCAL (r9): B20; SOURCE: Property Details.dc.html landAreaSpec"
  },
  {
   "id": "ISS-LAND-DEPLOY",
   "title": "listing functions + hosting ต้อง deploy คู่กัน — เจ้าของ deploy TEST ที่ 958c877 สำเร็จแล้ว (ตามที่ Work ยืนยัน); หน้าสาธารณะของเคส HH-24379 แสดงหน่วยที่ดินถูกต้อง (TD1–TD4)",
   "sev": "low",
   "status": "closed",
   "env": "test",
   "actor": "work",
   "next": "ไม่มี (ปิดสำหรับ TEST); production ยังไม่ deploy — ต้องคู่กันเช่นเดิมเมื่อถึงเวลา",
   "source": "SOURCE (r9): functions/case-fields.js, functions/listing-case.js, functions/land-area.js เปลี่ยน · Cloud TEST (r9e): ภาพ 211504/212703/212839/212903"
  },
  {
   "id": "ISS-ST3-PENDING",
   "title": "test:listing \"1 pending\" = ST3 (tests/listing/rules.test.js): สิทธิ์ Storage ที่ใช้ lookup ข้าม service (สมาชิก/Staff เขียน propertyPhotos เดิม) — Storage emulator แก้ lookup นี้ไม่ได้ จึง skip โดยตั้งใจ (lister=false, staff=false); ไม่เกี่ยวกับ D2; ไม่นับเป็น PASS",
   "sev": "low",
   "status": "open",
   "env": "test",
   "actor": "work",
   "next": "ยืนยันบน Cloud TEST จริงเมื่อ Work ต้องการ (ไม่ใช่เงื่อนไขของ D2); ห้ามเปลี่ยนเป็น PASS จนกว่าจะทดสอบจริง",
   "source": "LOCAL log (r9c): NOT-TESTED (pending) lister=false staff=false · บันทึกเดิมใน docs/listing-e2e/LISTING-E2E-01.md (หัวข้อ pending ที่ตั้งใจ, ตั้งแต่ SEC-TEST-01)"
  },
  {
   "id": "ISS-TR-CASE",
   "title": "เส้นทาง Listing Case ไม่มีการแปล 8 ภาษา: Case Data เก็บ description เป็นข้อความเดียว (string), ไม่เรียกแปลตอน Save, buildPublicDoc ส่ง string นั้นขึ้นสาธารณะ (title สร้างจากแม่แบบ th/en เท่านั้น) → หน้า Details ภาษาอื่นไม่ได้คำแปล (อ่าน description[lang] ไม่ได้ จึงตกไปข้อความเดียวกันทุกภาษา) และ Owner preview ไม่แสดงฉบับแปลที่จะเผยแพร่",
   "sev": "high",
   "status": "open",
   "env": "dev",
   "actor": "work",
   "next": "แบบฟังก์ชันแปลฝั่ง server เสนอแล้ว (บล็อก r9f) — เกณฑ์ A รอเจ้าของยืนยัน; ยังไม่แก้ source",
   "source": "SOURCE (r9d, อ่านโค้ดเท่านั้น ยังไม่ทดสอบ/ไม่รัน): Case Data.dc.html:177 (description=string); functions/listing-case.js publicTitle/buildPublicDoc; Property Details.dc.html:896; public-preview.js (ไม่มีแถวคำแปล)"
  },
  {
   "id": "ISS-TR-RESAVE",
   "title": "กลไกเดิม (Lister Dashboard) เรียกแปลทุกครั้งที่กด Save แม้เนื้อหาไม่เปลี่ยน: 3 การเรียก AI ต่อครั้ง (description, zone, title) ไม่มี hash/เทียบกับค่าเดิม → เปลืองโทเคน และผลแปลอาจต่างจากเดิมโดยไม่มีใครแก้",
   "sev": "med",
   "status": "open",
   "env": "dev",
   "actor": "work",
   "next": "ถ้าต่อยอดกลไกเดิมให้เพิ่มการเทียบเนื้อหาต้นทาง (hash) ก่อนเรียกแปล — ยังไม่แก้",
   "source": "SOURCE (r9d, อ่านโค้ดเท่านั้น ยังไม่ทดสอบ/ไม่รัน): Lister Dashboard.dc.html:2164-2187 (translateDescriptionAll ×3 ใน saveProperty ไม่มีเงื่อนไขเนื้อหาเปลี่ยน); firebase-client.js:1424"
  },
  {
   "id": "ISS-TR-FAIL",
   "title": "การแปลไม่สำเร็จเงียบ: catch แค่ console.warn แล้วบันทึกข้อความต้นฉบับเป็น string (ไม่ใช่ object 8 ภาษา) โดยไม่มีสถานะ/ธง/retry/แจ้งผู้ใช้; ภาษาที่ AI ข้ามถูกเติมด้วยข้อความต้นฉบับโดยไม่บอก; คำแปลเก่าถูกเขียนทับทั้งก้อน (ไม่มี stale marker ไม่มีคำแปลที่เก็บไว้เทียบ)",
   "sev": "med",
   "status": "open",
   "env": "dev",
   "actor": "work",
   "next": "ออกแบบสถานะการแปลรายภาษา + ห้ามเผยแพร่ภาษาที่ยังไม่แปลโดยไม่แจ้ง Owner — ยังไม่แก้",
   "source": "SOURCE (r9d, อ่านโค้ดเท่านั้น ยังไม่ทดสอบ/ไม่รัน): firebase-client.js:1424-1451 (fallback ต้นฉบับ/ null เมื่อ parse พลาด); Lister Dashboard.dc.html:2169,2179,2186"
  },
  {
   "id": "ISS-TR-GATE",
   "title": "ข้อควรตรวจ: translateDescriptionAll ส่ง POST ไป claudeComplete โดยไม่มี Authorization — ถ้า gate ของโปรเจกต์เปิด (TEST) enforceHttp ตอบ 401 → ผลแปลว่าง → บันทึกต้นฉบับ; บน production gate ปิด (state off) พฤติกรรมเดิม. ยังไม่ได้ทดสอบ",
   "sev": "low",
   "status": "open",
   "env": "test",
   "actor": "work",
   "next": "ยืนยันด้วยการทดสอบก่อนอ้างอิง (UNVERIFIED) — ห้ามเปิด AI จริงโดยไม่มีมติ",
   "source": "SOURCE (r9d, อ่านโค้ดเท่านั้น ยังไม่ทดสอบ/ไม่รัน): functions/chat-test-gate.js:79-90; firebase-client.js:1424-1436"
  },
  {
   "id": "ISS-APPROVER-STALE",
   "title": "หน้าอนุมัติแสดง \"ไม่มีบันทึกผู้ดำเนินการ\" ที่ผู้อนุมัติรับเรื่อง และประวัติส่งงาน \"รอตรวจ\" หลังอนุมัติ (ภาพ 211350 / 212703) — ทำซ้ำใน browser แล้ว (B24): เป็นแคชรายการส่งงานที่ไม่โหลดซ้ำ ไม่ใช่ข้อมูลที่ไม่ถูกบันทึก (ฐานข้อมูลมีผลอนุมัติและชื่อผู้อนุมัติ; หลังรีเฟรชหน้าแสดงถูกต้อง)",
   "sev": "med",
   "status": "open",
   "env": "test",
   "actor": "work",
   "next": "Work ตัดสินแก้ขั้นต่ำ: โหลดรายการส่งงานซ้ำหลัง decide/ส่งงาน (ยังไม่แก้ source); ภาพจริง 211350/212703 ยังควรเทียบกับภาพหลังรีเฟรชของเจ้าของ เพื่อตัดความเป็นไปได้ว่าบัญชีจริงไม่มีอีเมล (B24 ใช้บัญชี Owner สังเคราะห์ที่มีอีเมล)",
   "source": "SOURCE (r9e, ยังไม่ reproduce): Listing Approvals.dc.html:1025,1040,1135-1142,1151-1156 (โหลดครั้งเดียว ไม่ invalidate); firebase-client.js:2666-2684 (decideSubmission เขียน reviewResult/reviewedBy ที่ submission; Case แบบแยกข้ามการเขียน approvedBy); ตรวจ B16 เป็นข้อมูลที่เขียนตรงลงฐาน จึงไม่ครอบคลุมลำดับ \"เปิดการ์ด → อนุมัติ → ดูต่อโดยไม่รีเฟรช\" · LOCAL B24 (ทำซ้ำ, ลำดับจริง: เปิดการ์ด → อนุมัติรับเรื่อง → ไม่รีเฟรช → รีเฟรช): ก่อน = ประวัติ \"รอตรวจ\"; หลังอนุมัติไม่รีเฟรช = \"อนุมัติรับเรื่องโดย ไม่มีบันทึกผู้ดำเนินการ\" + ประวัติ \"รอตรวจ\"; ฐานข้อมูล = reviewResult approved, reviewedBy = อีเมลของบัญชี Owner สังเคราะห์, approvedSubmissionId ตรง; หลังรีเฟรช = \"อนุมัติรับเรื่องโดย อีเมล Owner สังเคราะห์\" + ประวัติ \"อนุมัติ\""
  }
 ],
 "history": [
  {
   "date": "2026-09-21",
   "text": "บล็อกสถานะเอกสารเดิมสิ้นสุด (มติ PD-01…16, #6–#9, #11 ปิด)",
   "ref": "BLUEPRINT §36"
  },
  {
   "date": "2026-09-23",
   "text": "FIX F ภาษา FR ขึ้น main (02230ae)",
   "ref": "02230ae"
  },
  {
   "date": "2026-09-26",
   "text": "เพิ่มหน้า m17/ บน main",
   "ref": "3a0d4db…2192b0b"
  },
  {
   "date": "2026-10-01",
   "text": "PR #2–#7 (SEC/CHAT test, gate, CHAT-LIVE) ใน chat-live-01; เริ่ม LISTING-E2E-01",
   "ref": "beec235, be9250f"
  },
  {
   "date": "2026-10-01",
   "text": "รอบ 2–4: record-only, preview, local browser, deploy script",
   "ref": "8ff7f3e…e6a99b5"
  },
  {
   "date": "2026-10-02",
   "text": "deploy TEST: โฟลเดอร์ฟังก์ชันแยก, selector, getCasePhoto, รูปครบ, Case Data",
   "ref": "e7603b8…d0fe617"
  },
  {
   "date": "2026-10-03",
   "text": "เจ้าของลอง Cloud TEST หนึ่งเคสถึงปิดประกาศ; ชุดส่งต่อ v1 → v1.1",
   "ref": "34a0eb0"
  },
  {
   "date": "2026-10-03",
   "text": "ชุดส่งต่อ v2 + แผงติดตามภายใน (เอกสารเท่านั้น)",
   "ref": "รอ commit"
  },
  {
   "date": "2026-10-03",
   "text": "r4: ทะเบียนแนวคิด 3 ชั้น + ตรวจ source DOC-OBS + ข้อเสนอแก้ขั้นต่ำ (ยังไม่แก้ระบบ)",
   "ref": "รอ commit"
  },
  {
   "date": "2026-10-03",
   "text": "r5: Work lock S-TEST-FLOW (9/9) และ S-TEST-PUBLIC (2/7); R12 = PASS (ภาพเจ้าของ); ข้อกำหนดเจ้าของ 10 ข้อ; FX-3 ใน draft branch",
   "ref": "รอ commit"
  },
  {
   "date": "2026-10-03",
   "text": "r6: FX-1/FX-2/FX-4 ใน draft (พบต้นเหตุ DOC-OBS-01 = บิลด์ TEST ซ่อนสคริปต์ component), เพิ่มการตรวจ FX-3, FX-5 ตรวจที่มา, แยกฟิลด์รุ่น source/doc/TEST/prod",
   "ref": "source 7c1ec6b"
  },
  {
   "date": "2026-10-03",
   "text": "r7: ตรวจผลกระทบเลิกห่อ template (B14–B18), FX-1 สองบัญชี (B16), คงข้อจำกัดแผนที่, เสนอ head+แผนทดสอบ",
   "ref": "source 678a042"
  },
  {
   "date": "2026-10-03",
   "text": "เจ้าของ deploy Cloud TEST ที่ head 2c89759 และลองเคสสังเคราะห์เดิม: T10/T13/T14/T16 PASS, T12 FAIL; ปิด→เปิดใหม่→ปิดอีกครั้งผ่าน UI; รูปสาธารณะเดิม 1 ไฟล์ 404 หลังปิด",
   "ref": "Cloud TEST 2c89759"
  },
  {
   "date": "2026-10-03",
   "text": "r8: ซิงก์ผล Cloud TEST ลงชุดส่งต่อ/แผง (เอกสารและแผงเท่านั้น)",
   "ref": "source 678a042"
  },
  {
   "date": "2026-10-03",
   "text": "Work/เจ้าของอนุมัติ D2 (กรอกได้ทั้ง ตร.ว./ตร.ม., 1 ตร.ว. = 4 ตร.ม., ข้อมูลเก่าห้ามเดา/แปลง)",
   "ref": "มติ D2"
  },
  {
   "date": "2026-10-03",
   "text": "r9: แก้ขั้นต่ำหน่วยที่ดินใน draft (FX-5) + ผลตรวจทุกเส้นทาง + ข้อขัดแย้งที่รายงาน",
   "ref": "source d7ee37e"
  },
  {
   "date": "2026-10-03",
   "text": "r9b: แก้ข้อพบจาก Work review r9 (Case Data ล้างที่ดิน, Lister validation) + บันทึกช่องทางที่รองรับ/ไม่รองรับ",
   "ref": "source 958c877"
  },
  {
   "date": "2026-10-03",
   "text": "r9c: Work รับการแก้ r9b (source 958c877); ระบุ pending = ST3; Viewer v45; เตรียมคำสั่ง deploy TEST (ยังไม่รัน); ยืนยัน web/Functions/rules ไม่เปลี่ยนจาก 958c877",
   "ref": "doc head ดู PR"
  },
  {
   "date": "2026-10-03",
   "text": "r9d: เจ้าของแจ้งกลไกแปลเดิม 8 ภาษาตอน Save — Code ตรวจ source และแยกความทรงจำเจ้าของ/ข้อกำหนดผลิตภัณฑ์ ออกจากหลักฐานโค้ดปัจจุบัน; เส้นทาง Listing Case ยังไม่เชื่อม; ไม่แก้ source ไม่ deploy",
   "ref": "ISS-TR-CASE/RESAVE/FAIL/GATE"
  },
  {
   "date": "2026-10-03",
   "text": "r9e: แก้หัว Cloud TEST deployed = 958c877 (เจ้าของ deploy สำเร็จ); บันทึกหลักฐาน Cloud HH-24379 (211504/212703/212839/212903) แยกจาก LOCAL; เสนอแผนแก้ระบบแปลขั้นต่ำ; รายงานต้นเหตุตราผู้อนุมัติรับเรื่อง — ไม่แก้ source/ไม่ merge/ไม่ใช้ AI จริง",
   "ref": "TD1–TD7, ISS-APPROVER-STALE"
  },
  {
   "date": "2026-10-03",
   "text": "r9f: แก้การบรรจุ Viewer (v48); T12 คงเดิม + ระบุหลักฐาน Cloud; TD7 แยก TD7a (เจ้าของยืนยัน) / TD7b (ยังไม่ยืนยัน); ออกแบบฟังก์ชันแปลฝั่ง server (เกณฑ์ A รอเจ้าของยืนยัน); ทำซ้ำอาการตราผู้อนุมัติใน browser (B24) — ไม่แก้ source เว็บ",
   "ref": "TD7a/TD7b, B24, ISS-APPROVER-STALE"
  }
 ],
 "decisions": [
  {
   "id": "D1",
   "question": "ล็อก (lock) เปอร์เซ็นต์ — Work ตรวจ checklist ที่แยกขอบเขตแล้ว (ทั้ง 11 ชุดในแผง) และสั่ง lock/แก้ทีละชุด",
   "options": [
    "lock ทีละชุดหลังตรวจ (ชุดที่ lock จึงแสดง %)",
    "ให้ Code แก้รายการแล้วส่งตรวจใหม่",
    "ไม่ใช้ % จนกว่าจะมี scope production"
   ],
   "codeView": "ข้อเสนอของ Code (ไม่ใช่มติ): lock ทีละชุด เริ่มจากชุด Cloud TEST เพราะมีหลักฐานจากภาพ; ชุด production ยังไม่มีขอบเขตจึงควรคงร่าง",
   "decider": "work",
   "status": "open",
   "affects": "ทุกขอบเขต / ส่วน 3 ของแผง"
  },
  {
   "id": "D2",
   "question": "หน่วยหลักของขนาดที่ดิน (`landSize`) คือ ตร.ว. หรือ ตร.ม. และให้ฟอร์มกับหน้าแสดงสอดคล้องกันอย่างไร",
   "options": [
    "ตร.ว. เป็นหน่วยหลัก — หน้า Details แสดง ตร.ว. (หรือแปลงเป็น ตร.ม. พร้อมระบุ)",
    "ตร.ม. เป็นหน่วยหลัก — แก้ป้ายและค่าในฟอร์ม",
    "ใช้ฟิลด์ ไร่/งาน/ตร.ว. ที่มีอยู่แทน landSize"
   ],
   "codeView": "ข้อเสนอของ Code (ไม่ใช่มติ): ตัดสินหน่วยก่อน แล้วค่อยตั้งขอบเขตแก้ DOC-OBS-02; ห้ามแก้ค่าบน Cloud. หมายเหตุจาก source: ฟอร์มสมาชิกมีทั้ง landSize (ตร.ว.) และ ไร่/งาน/ตร.ว. แยกชุด",
   "decider": "owner",
   "status": "decided",
   "affects": "DOC-OBS-02, T12",
   "outcome": "เจ้าของเห็นด้วยกับข้อเสนอ (ผ่าน Work, 3 ต.ค.): กรอกขนาดที่ดินได้ทั้ง ตร.ว. และ ตร.ม. มีตัวเลือกหน่วยชัดเจนและแปลงถูกต้อง (1 ตร.ว. = 4 ตร.ม.); ข้อมูลเก่าที่ไม่ระบุหน่วย ห้ามเดาหรือแปลงอัตโนมัติ"
  },
  {
   "id": "D3",
   "question": "ลำดับ merge: chat-live-01 / PR #8 / main",
   "options": [
    "merge chat-live-01 เข้า main ก่อน แล้ว retarget #8",
    "รวม #8 เข้า chat-live-01 แล้ว merge ครั้งเดียว",
    "ยังไม่ merge จนผ่านเกณฑ์ production"
   ],
   "codeView": "ข้อเสนอของ Code (ไม่ใช่มติ): ทางกลไก branch เป็นเส้นตรง (main ไม่มี commit ที่ chat-live-01 ไม่มี) จึงชนกันได้ยาก แต่ประตู production (SEC-URGENT-01, ข้อมูลเก่า, rules) ยังไม่ผ่าน — คง 'ยังไม่ merge'",
   "decider": "owner",
   "status": "parked",
   "affects": "ISS-MERGE, P03",
   "outcome": "พักไว้ตามมติเจ้าของ (ผ่าน Work, 3 ต.ค.) — ไม่ใช้เป็นเงื่อนไขบล็อกการปิดรอบเอกสาร; ยังไม่ merge"
  },
  {
   "id": "D4",
   "question": "แผงหลักและ workflow ที่ใช้จริง (CLAUDE.md ฉบับเดียวแยกเป็นงานเอกสารต่างหาก)",
   "options": [
    "คงฉบับ repo + บล็อกชี้ชุดส่งต่อ (ตอนนี้)",
    "รวมสำเนาโปรเจกต์ออกแบบ (§29)",
    "เขียน CLAUDE.md ฉบับปัจจุบันใหม่ให้สะท้อน Case model และ workflow ปัจจุบัน"
   ],
   "codeView": "ข้อเสนอของ Code (ไม่ใช่มติ): ตัวเลือกสาม แต่เป็นงานเอกสารแยกรอบ; สำเนาโปรเจกต์ออกแบบเก่ากว่า workflow ปัจจุบัน ไม่ควรใช้ทับ",
   "decider": "owner",
   "status": "decided",
   "affects": "ISS-DOCS-SPLIT",
   "outcome": "เจ้าของยืนยันแล้ว (ผ่าน Work, 3 ต.ค.): แผง Code เป็นตัวหลัก · workflow Code → Work review → เจ้าของทดสอบ TEST ไม่ต้องถามเลือกซ้ำ"
  },
  {
   "id": "D5",
   "question": "ลำดับงานถัดไป: audit DOC-OBS ก่อน หรือเติม Cloud test ที่ขาดก่อน",
   "options": [
    "audit DOC-OBS-01/03/05 ก่อน (ยังไม่แก้) แล้วเสนอขอบเขตแก้",
    "เติม Cloud test: ลิงก์รูปเดิมหลังปิด, ปฏิเสธสิทธิ์, agent/outsider",
    "ทำสองอย่างแยกรอบ"
   ],
   "codeView": "ข้อเสนอของ Code (ไม่ใช่มติ): audit DOC-OBS ก่อน เพราะกระทบ T10/T13/T16 และเป็นงานอ่านอย่างเดียว; ชุด Cloud test ต้องให้เจ้าของลองจริงจึงค่อยตามหลัง",
   "decider": "owner",
   "status": "open",
   "affects": "S-TEST-PUBLIC, S-TEST-NEG"
  },
  {
   "id": "D6",
   "question": "ระยะเวลาเก็บข้อมูลและไฟล์แต่ละระดับ (พักเคส / ล้างรูปของร่าง / ลบเคส / หลังปิดประกาศ)",
   "options": [
    "กำหนดแยกตามระดับ (ร่าง / ส่งแล้ว / ปิดประกาศ / ลบถาวร)",
    "กำหนดค่าเดียวทุกระดับ",
    "เลื่อนไว้จนมีระบบล้างอัตโนมัติ"
   ],
   "codeView": "ข้อเสนอของ Code (ไม่ใช่มติ): ไม่เสนอจำนวนวัน — ข้อกำหนดเจ้าของบอกว่ายังไม่มีมติและห้ามกำหนดเอง; ระหว่างนี้ไม่เขียนโค้ดที่ลบอัตโนมัติ",
   "decider": "owner",
   "status": "open",
   "affects": "A9b, A9c"
  }
 ],
 "ideas": [
  {
   "id": "I01",
   "tier": "current",
   "title": "รับข้อมูลทรัพย์พร้อมรูป (ฟอร์ม/ลูกค้า/agent/Owner) ตาม Photo Standard",
   "detail": "ส่งแล้วได้เคสทีมงานเท่านั้น รูปส่วนตัวไม่เปิดสาธารณะ",
   "source": "BLUEPRINT §32/§35 · LISTING-E2E-01",
   "state": "REAL-TEST หนึ่งเคสผ่าน (T02/T03); agent / Owner-ส่งเอง บน Cloud ยังไม่ยืนยัน (T20)"
  },
  {
   "id": "I02",
   "tier": "current",
   "title": "Staff เตรียมข้อมูลกลาง (Case Data) แล้วส่งตรวจ checklist",
   "detail": "Staff ผู้รับผิดชอบเท่านั้น; ไม่แตะ guard เดิมของ Lister Dashboard",
   "source": "LISTING-E2E-01 · Case Data.dc.html",
   "state": "REAL-TEST ผ่าน (T04/T05); บังคับ \"Staff ผู้รับผิดชอบ\" ที่ rules ยังไม่ผ่าน (D09)"
  },
  {
   "id": "I03",
   "tier": "current",
   "title": "Owner preview → อนุมัติ → เผยแพร่ → ปิดประกาศ",
   "detail": "หน้าสาธารณะสร้างจาก allow-list ตอน Owner เผยแพร่เท่านั้น; ปิดแล้วเอกสารสาธารณะ+รูปสาธารณะถูกลบ",
   "source": "LISTING-E2E-01",
   "state": "REAL-TEST ผ่านหนึ่งเคส (T06–T08, T15); ลบ backend/ลิงก์รูปเดิมยังไม่ยืนยัน (T17/T18)"
  },
  {
   "id": "I04",
   "tier": "current",
   "title": "หน้าสาธารณะแสดงผลถูกต้อง (DOC-OBS-01…05)",
   "detail": "รูปปกใน Search · หน่วยที่ดิน · แผนที่/ระยะทางที่ไม่รู้ · ผู้อนุมัติ · สถานะหลังปิด",
   "source": "PROJECT-STATUS §5 DOC-OBS",
   "state": "พบข้อบกพร่อง 5 จุด; ตรวจ source แล้ว ดู \"ข้อเสนอแก้ขั้นต่ำ\" (ยังไม่แก้)"
  },
  {
   "id": "I05",
   "tier": "next",
   "title": "ตัดสินหน่วยที่ดินหลัก (ตร.ว. / ตร.ม. / ไร่-งาน-ตร.ว.)",
   "detail": "ต้องตัดสินก่อนแก้ DOC-OBS-02 เพราะฟอร์ม ป้าย และหน้า Details ใช้หน่วยไม่ตรงกัน",
   "source": "D2 · DOC-OBS-02",
   "state": "รอเจ้าของ"
  },
  {
   "id": "I06",
   "tier": "next",
   "title": "เติม Cloud TEST ฝั่งปฏิเสธ/ลบ/ซ้ำ/ช้า",
   "detail": "ผู้ไม่มีสิทธิ์ถูกปฏิเสธ · ลิงก์รูปเดิมใช้ไม่ได้หลังปิด · ไฟล์ backend ถูกลบ · agent/Owner-ส่งเอง · retry",
   "source": "S-TEST-NEG (T17–T21)",
   "state": "ยังไม่ทดสอบ; ต้องให้เจ้าของลองบน TEST"
  },
  {
   "id": "I07",
   "tier": "next",
   "title": "บังคับสิทธิ์ที่ rules + จำกัดอัตรา trackListingCase/ล้างไฟล์ค้าง",
   "detail": "ปิดช่องที่ \"Staff ผู้รับผิดชอบเท่านั้น\" บังคับแค่ในหน้า; rate limit ยังไม่มี",
   "source": "D09/D10/D11 (S-DEV-QUALITY)",
   "state": "ยังไม่ผ่าน/ยังไม่ audit — เสนอเป็นงานแยกรอบหลัง DOC-OBS"
  },
  {
   "id": "I08",
   "tier": "next",
   "title": "ย้ายข้อมูลเก่า (เบอร์/trackToken ในเอกสารสาธารณะ) ก่อน production",
   "detail": "จำเป็นก่อนเปิดเว็บสาธารณะจริง ไม่ใช่ก่อนทดสอบ TEST",
   "source": "LEGACY-DATA-PLAN.md · P01",
   "state": "BLOCKED — ห้ามรันจนเจ้าของอนุมัติแยก"
  },
  {
   "id": "F01",
   "tier": "future",
   "title": "Demand Profile / Qualification (C5, C5.1–C5.3)",
   "detail": "BUY/RENT demands/{demandId}; ถามทีละ 1–2 เรื่อง",
   "source": "BLUEPRINT §26.15 · Roadmap 10–13",
   "state": "ทิศทางอนาคต — ยังไม่สร้าง"
  },
  {
   "id": "F02",
   "tier": "future",
   "title": "Matching Engine และคอลเลกชัน (C6, C6.1–C6.6)",
   "detail": "Progressive/Smart Match, ลิงก์คอลเลกชัน, auto-match, Save/Hide/History",
   "source": "Roadmap 14–20 (PD-14)",
   "state": "ทิศทางอนาคต — ยังไม่สร้าง"
  },
  {
   "id": "F03",
   "tier": "future",
   "title": "Canonical Viewing Request · Human Handoff · Negotiation · Deal/Commission",
   "detail": "Customer ↔ Demand ↔ Property ↔ Match ↔ Viewing; ต่อด้วยเจรจา/คอมมิชชัน",
   "source": "Roadmap 21–24 (PD-05/06/07)",
   "state": "ทิศทางอนาคต — ยังไม่สร้าง"
  },
  {
   "id": "F04",
   "tier": "future",
   "title": "Phase 2B/2C/2D — Customer Workspace · AI↔Workspace Sync · Explicit Submit",
   "detail": "record เดียว ไม่ถามซ้ำ; ฟอร์ม TEST ไม่ใช่หลักฐานของ workspace",
   "source": "Roadmap 7–9 · BLUEPRINT §28",
   "state": "ยังไม่เริ่ม"
  },
  {
   "id": "F05",
   "tier": "future",
   "title": "แชท AI จริงบน TEST และ AI ช่วยกรอก",
   "detail": "ต้องมี allow-list/เพดาน/คีย์แยกงาน; ห้ามใช้สคริปต์ CHAT-LIVE เดิม",
   "source": "T22 · S-TEST-CHAT",
   "state": "BLOCKED — แยกงาน ไม่อยู่ในเส้นทางหลักรอบนี้"
  },
  {
   "id": "F06",
   "tier": "future",
   "title": "Supply/Demand umbrella และโมเดลรายได้ (pay-per-listing, Featured/แบนเนอร์, แพ็กเกจ Agent)",
   "detail": "แนวคิดธุรกิจ/สมาชิก ไม่แตะเส้นทางรับข้อมูลรอบนี้",
   "source": "BLUEPRINT §26.15.10 และหมวดโมเดลรายได้",
   "state": "แนวคิด — บางส่วน (Stripe) มีแล้วแยกเรื่อง"
  },
  {
   "id": "F07",
   "tier": "future",
   "title": "ช่องทางภายนอก: Facebook auto-post, LINE OA, TikTok (Priority-A)",
   "detail": "คุยแนวคิดแล้ว เจ้าของให้เลื่อนไว้",
   "source": "CLAUDE.md · BLUEPRINT (social roadmap)",
   "state": "แนวคิด — ยังไม่สร้าง"
  },
  {
   "id": "F08",
   "tier": "future",
   "title": "SEO: นำคำบรรยายรูปจาก AI ไปใส่ <img alt> จริง; guardrail ค่า API ของแชท",
   "detail": "ช่องว่างที่ BLUEPRINT §24.8 ระบุไว้; ยังไม่มีเพดานค่าใช้จ่าย",
   "source": "BLUEPRINT §24.8 · CLAUDE.md",
   "state": "ยังไม่ทำ"
  }
 ],
 "proposals": [
  {
   "id": "FX-1",
   "obs": "DOC-OBS-04",
   "title": "แยกตราอนุมัติรับเรื่อง / อนุมัติเผยแพร่ ให้แสดงผู้ดำเนินการตรงกับเหตุการณ์ (Work สั่งดำเนินการ — อยู่ใน draft)",
   "finding": "ตรวจเพิ่ม: การอนุมัติรับเรื่องของ Case แบบใหม่ ตั้งใจไม่เขียน approvedBy (เขียนที่ server ตอนเผยแพร่เท่านั้น) จึงบรรทัด \"อนุมัติโดย -\" คือตราของ \"รับเรื่อง\" ที่ไม่มีที่มาให้แสดง; ผู้อนุมัติรับเรื่องอยู่ที่ submissions/{id}.reviewedBy; ผู้อนุมัติเผยแพร่อยู่ที่ approvedByEmail/Uid/Role (ภายใน). แก้: แสดง 2 บรรทัดแยก — \"อนุมัติรับเรื่องโดย <reviewedBy>\" และ \"อนุมัติเผยแพร่โดย <approvedByEmail>\"; ไม่มีอีเมล → บอกว่าไม่มีบันทึก (บทบาทแสดงเป็น \"บทบาทที่บันทึก: owner\" เท่านั้น ไม่ใช่ชื่อคน); ไม่เพิ่มฟิลด์ ไม่แตะ server · r7: เพิ่ม test สองบัญชีต่างกัน (B16) — ผู้อนุมัติรับเรื่อง ≠ ผู้เผยแพร่, ใช้ approvedSubmissionId, ข้าม submission ที่ถูกส่งกลับ · r8: ยืนยันบน Cloud TEST ที่ head 2c89759 (T14 PASS, เคสสังเคราะห์เดียว); ยังไม่ merge",
   "evidence": "SOURCE (อ่านโค้ด 2 ฝั่ง) · ยังไม่เห็นข้อมูล Cloud (ไม่ได้ผูกกับภาพใดโดยเฉพาะ)",
   "minFix": "บรรทัดเดียวในหน้า Approvals: ใช้ p.approvedBy || p.approvedByEmail || p.approvedByRole || \"-\" (หน้าทีมงานเท่านั้น)",
   "reqCheck": [
    "อีเมลผู้อนุมัติอยู่ใน Case ภายในและไม่อยู่ใน allow-list สาธารณะ → ไม่รั่วหน้าเว็บสาธารณะ",
    "ไม่แตะ rules/Functions/ข้อมูลบน Cloud",
    "เจ้าของเป็นผู้เดียวที่เผยแพร่ได้ (approvedByRole=owner) — ไม่ขัด"
   ],
   "test": "component/page test: Case ที่เผยแพร่แล้วต้องแสดงอีเมลหรือบทบาท ไม่ใช่ \"-\"; negative control: ไม่มีฟิลด์ → \"-\"",
   "risk": "ต่ำ",
   "order": 1,
   "decider": "work",
   "status": "verified-test"
  },
  {
   "id": "FX-2",
   "obs": "DOC-OBS-03",
   "title": "ซ่อนระยะ/ชื่อโซนที่ไม่มีหลักฐาน แทน 0 กม. / undefined (Work สั่งดำเนินการ — อยู่ใน draft)",
   "finding": "ตรวจเส้นทางพิกัดที่ Staff บันทึก: Staff บันทึก coordsRaw ซึ่งเป็นฟิลด์ภายใน (ตำแหน่งแน่นอน) ตั้งใจไม่ถูกฉายเป็นข้อมูลสาธารณะ และไม่มีโค้ดใดสร้าง mapLink/ระยะ/โซนสาธารณะจากมัน — จึง \"ไม่ตกหล่น\" แต่ \"ไม่เคยมีทาง\" ให้ Case มีระยะ/โซนสาธารณะ (เป็นการออกแบบด้านความเป็นส่วนตัว). แก้: ซ่อนเฉพาะระยะ/ชื่อโซนที่ไม่มีหลักฐาน; คงค่า 0 ที่เป็นตัวเลขที่เก็บไว้จริง; data.js เลิกใส่ค่าเริ่ม 0; ไม่ผสมระยะที่เก็บไว้กับระยะที่คำนวณจากพิกัด. ยังไม่แก้ (รายงาน): แผนที่ยังตั้งจุดกลางเริ่มต้นเมื่อไม่มีโซน/พิกัด; ตัวเลขจากพิกัดคือระยะเส้นตรงถึงจุดอ้างอิงของพื้นที่ (เดิม) · r7 ข้อจำกัดที่ต้องคงไว้: พิกัดที่ Staff กรอก (coordsRaw) ยังไม่ถูกนำไปแสดงแผนที่สาธารณะ; แผนที่อาจใช้จุดกลางเริ่มต้น; ระยะจากพิกัดเป็นเส้นตรงถึงจุดอ้างอิงของพื้นที่ ไม่ใช่ระยะเดินทาง — ห้ามประกาศว่าแผนที่/ตำแหน่งถูกต้องครบแล้ว · r8: ยืนยันบน Cloud TEST ที่ head 2c89759 (T13 PASS, เคสสังเคราะห์เดียว); ยังไม่ merge",
   "evidence": "SOURCE (อ่านโค้ด) · ภาพ Cloud 015328 ตรงกัน · ยังไม่ได้ทดลองในเบราว์เซอร์",
   "minFix": "ถ้าไม่มีพิกัดและค่าระยะไม่ใช่ตัวเลขมากกว่า 0 ให้ซ่อนบรรทัดระยะนั้น (ไม่ต้องมีข้อความใหม่); ถ้าไม่มีชื่อโซนให้แสดงแค่ชื่ออำเภอ/พื้นที่ ไม่ใส่คำว่า undefined",
   "reqCheck": [
    "ห้ามอ้างว่าคำนวณระยะจริง (DOC-OBS-03) — ซ่อนดีกว่าแสดง 0",
    "ข้อมูลตัวอย่างเดิมที่มีค่าระยะจริงต้องแสดงเหมือนเดิม (ไม่ regress)",
    "ไม่เพิ่มข้อความใหม่ จึงไม่ติดกฎ 8 ภาษา",
    "Photo/ทะเบียนสาธารณะไม่เปลี่ยน"
   ],
   "test": "page test: Case ไม่มีพิกัด → ไม่มีคำว่า undefined และไม่มี \"0 กม.\"; ทรัพย์ตัวอย่างที่มีค่า → ยังแสดงค่าเดิม",
   "risk": "ต่ำ",
   "order": 2,
   "decider": "work",
   "status": "verified-test"
  },
  {
   "id": "FX-3",
   "obs": "DOC-OBS-05",
   "title": "แยก \"กำลังโหลด\" / \"ไม่พบ-ปิดแล้ว\" / \"โหลดไม่สำเร็จ\" แทนหน้าว่าง (Work สั่งดำเนินการ — อยู่ใน draft branch)",
   "finding": "Property Details.dc.html บรรทัด 802: ถ้าไม่พบรายการ คืน hasProperty:false และส่วนเนื้อหาทั้งหน้าอยู่ใต้ sc-if hasProperty ไม่มีทางเลือกอื่น → หน้าว่าง (ยืนยันจากโค้ด ไม่ใช่ข้อสันนิษฐานแล้ว). หลังปิด เอกสารสาธารณะถูกลบ จึงเข้ากรณีนี้; ส่วน data.js ตั้ง window.__hhDataLoad.state = \"failed\" เมื่อโหลดไม่ได้ ซึ่งใช้แยกสองกรณีได้ · เพิ่มการตรวจตามคำสั่ง Work: กดลองอีกครั้ง = นำทาง 1 ครั้ง; direct read ล้มขณะ collection โหลดได้ = โหลดล้ม; ข้อความ loading/not-found/failed/retry/back ครบ 8 ภาษา · r8: ยืนยันบน Cloud TEST ที่ head 2c89759 (T16 PASS, เคสสังเคราะห์เดียว); ยังไม่ merge",
   "evidence": "SOURCE (อ่านโค้ด) · ภาพ Cloud หลังปิด (หน้าว่าง) ตรงกัน",
   "minFix": "เพิ่มบล็อกข้อความเมื่อ hasProperty เป็นเท็จ: state \"ok\" → \"ไม่พบประกาศนี้หรือปิดประกาศแล้ว\" (ข้อความเดียวสำหรับทุกกรณี ไม่บอกว่าเคยมีหรือไม่) + ปุ่มกลับหน้าค้นหา; state \"failed\" → \"โหลดไม่สำเร็จ ลองรีเฟรช\"",
   "reqCheck": [
    "ต้องมีข้อความครบ 8 ภาษา (กติกาโปรเจกต์) — ต้องเพิ่มคีย์ใน data.js ทุกภาษา",
    "ข้อความเดียวกันสำหรับ \"ปิดแล้ว\" และ \"ไม่เคยมี\" เพื่อไม่เปิดเผยการมีอยู่ของ Case ส่วนตัว",
    "TEST build ไม่มี sample fallback (SAMPLE_FALLBACK_ON_ERROR=false) — ต้องไม่ถูกบิดเบือน",
    "ห้ามแสดงข้อมูลส่วนตัวหรือรูปใดๆ ในหน้านี้"
   ],
   "test": "page test: id ที่ไม่มี → ข้อความไม่พบ (ไม่ว่าง); จำลองโหลดล้ม → ข้อความโหลดไม่สำเร็จ; ทั้ง 8 ภาษามีคีย์ครบ",
   "risk": "ปานกลาง (แตะ data.js สี่–แปดภาษา)",
   "order": 3,
   "decider": "work",
   "status": "verified-test"
  },
  {
   "id": "FX-4",
   "obs": "DOC-OBS-01",
   "title": "Search ไม่มีรูปปก — พบต้นเหตุ: บิลด์ TEST ซ่อนสคริปต์ของ component (แก้ในเครื่องมือบิลด์ อยู่ใน draft)",
   "finding": "ทำซ้ำได้ในเครื่อง (visitor): การ์ดไม่มีรูปปก. ต้นเหตุ: tools/build-listing-test.js ห่อ \"ทุก\" ไฟล์ .html — รวมไฟล์ component (PropertyCard ฯลฯ) — ไว้ใน <template> เพื่อให้หน้า inert; แต่ runtime ดึง component เป็นข้อความแล้วหา <script data-dc-script> ซึ่งถูกซ่อนในเทมเพลต → component ทำงานโดยไม่มีตรรกะ ค่าที่คำนวณ (รูปปก, สไตล์ปก ฯลฯ) ขาดหมด. ข้อมูล/Firestore/rules ถูกต้องตลอด (ตรวจแล้ว). ไฟล์ production ไม่ผ่านตัวบิลด์นี้ จึงไม่กระทบ production · r8: ยืนยันบน Cloud TEST ที่ head 2c89759 (T10 PASS, เคสสังเคราะห์เดียว); ยังไม่ merge",
   "evidence": "SOURCE: ไม่พบต้นเหตุ · test ในเครื่องไม่ assert รูปปกใน Search (ช่องว่างของ test) · ภาพ Cloud 015210",
   "minFix": "บิลด์ห่อ template เฉพาะหน้าที่เบราว์เซอร์เปิด (ENTRIES) ไม่ห่อไฟล์ component; ทดสอบ: Search แสดงรูปปกที่ decode ได้จริงสำหรับ visitor และ Owner (B7) + hosting-build ไม่ห่อ component และสคริปต์ component มองเห็นได้",
   "reqCheck": [
    "ไม่เปลี่ยน rules ของ propertyPhotos / ไม่ให้ผู้เยี่ยมชมอ่านรูปส่วนตัว",
    "ไม่ใช้ข้อมูลตัวอย่างแทน และไม่แตะข้อมูล Cloud",
    "ผลข้างเคียง: component ทุกตัวใน TEST (LanguageSwitcher, SearchFilters, ContactRail ฯลฯ) จะ \"ทำงานจริง\" เหมือน production เป็นครั้งแรก — ชุดทดสอบเต็มผ่าน แต่ต้องให้ Work/เจ้าของรับทราบเมื่อลอง TEST",
    "หลักฐาน TEST d0fe617 ก่อนหน้านี้ทั้งหมดเกิดตอน component ไม่มีตรรกะ"
   ],
   "test": "B7 (visitor 3 รอบ + Owner) ต้องเห็นรูปปก decode ได้; negative control: ใช้บิลด์เดิม → B7 ล้ม",
   "risk": "ปานกลาง (เปลี่ยนพฤติกรรมของทุก component ใน TEST ให้เหมือน production)",
   "order": 4,
   "decider": "work",
   "status": "verified-test"
  },
  {
   "id": "FX-5",
   "obs": "DOC-OBS-02",
   "title": "หน่วยที่ดิน (D2 อนุมัติแล้ว) — แก้ขั้นต่ำใน draft: เก็บค่าที่กรอก + หน่วย + ค่ามาตรฐาน ตร.ม.; ข้อมูลเก่าไม่เดา",
   "finding": "ตรวจทุกเส้นทางอ่าน/เขียน landSize (ดูบล็อก r9): Case Data และ Lister Dashboard เขียน; Admin Dashboard/AI Quick Add เขียน (ป้าย ตร.ม.); AI draft ใน Functions เขียนตาม prompt \"ตารางวา\"; Owner Submission ไม่มีช่องที่ดิน; Details/Home/ContactRail อ่าน. แก้: ฟิลด์ใหม่ landAreaValue (ค่าที่กรอก) + landAreaUnit (sqwa|sqm) + landAreaSqm (ค่ามาตรฐาน ตร.ม. — คำนวณใหม่จากค่าที่กรอก+หน่วยทุกครั้ง ไม่แปลงซ้ำ และ server คำนวณใหม่ตอนฉายเป็นข้อมูลสาธารณะ); landSize เดิมไม่ถูกแตะ/ติดป้าย/แปลง; หน้าสาธารณะแสดง \"100 ตร.ว. (400 ตร.ม.)\" หรือเลขเดิม \"(ไม่ระบุหน่วย)\" · r9b (Work review): (1) Case Data — ล้างพื้นที่ที่คนบันทึกไว้แล้วล้าง landSize เดิมด้วย (ไม่ให้ preview/public fallback กลับมา); เคสเก่าที่ไม่แตะช่องที่ดินยังเก็บ landSize ไว้; (2) Lister — ตรวจด้วยกติกาเดียวกับ landAreaFields: ค่าที่ builder ปฏิเสธ/ล้างหน่วยจากรายการที่มีหน่วยแล้ว = แจ้งข้อผิดพลาดและไม่เขียนข้อมูล; legacy ที่ไม่ได้แก้จริงยังไม่ถูกบล็อก · r9e/r9f: deploy TEST ที่ 958c877 แล้ว (เจ้าของ deploy; Work ยืนยัน) — หลักฐาน Cloud: Owner preview, เผยแพร่ (Owner), ไทย, จีน ถูกต้อง (TD1–TD4); ล้างค่า/อีก 6 ภาษา/บันทึกซ้ำ ยังไม่ครบบน Cloud",
   "evidence": "SOURCE (อ่านโค้ด) · ภาพ Cloud ตรงกัน",
   "minFix": "ไฟล์ที่แก้: land-area.js (ใหม่), functions/land-area.js (ใหม่), case-fields.js ×2 (allow-list), functions/listing-case.js (คำนวณใหม่ตอนฉาย), tools/listing-test/build-functions.js, Case Data.dc.html, Lister Dashboard.dc.html, public-preview.js, Property Details.dc.html, intake-workflow.js, data.js (ข้อความ 8 ภาษา). ไม่แก้: พื้นที่ใช้สอย, ข้อมูล Cloud, Admin Dashboard, AI Quick Add, AI draft (Functions), Owner Submission",
   "reqCheck": [
    "ตามมติ D2: 1 ตร.ว. = 4 ตร.ม.; ข้อมูลเก่าห้ามเดา/แปลง",
    "ไม่เปลี่ยนหน่วยพื้นที่ใช้สอย",
    "ไม่แก้/ไม่ migrate ข้อมูล Cloud (รวมเคส TEST เดิม)",
    "ข้อความหน่วยครบ 8 ภาษาในระบบ i18n เดิม",
    "แตะ Functions เล็กน้อย (allow-list + คำนวณใหม่ตอนฉาย) — ต้อง deploy listing functions คู่กับ hosting เมื่อเจ้าของลอง"
   ],
   "test": "tests/listing/land-area.test.js (LA1–LA5) + core.test.js L1–L4 + browser-local B11/B19/B20/B21 + core L5 + browser-local B22/B23",
   "risk": "ปานกลาง (เปลี่ยนความหมายข้อมูลใหม่ + แตะ Functions เล็กน้อย; ข้อมูลเก่าไม่ถูกแตะ)",
   "order": 5,
   "decider": "work",
   "status": "in-draft"
  }
 ],
 "reqs": [
  {
   "id": "A1",
   "tier": "current",
   "title": "ผู้ส่งทรัพย์ 3 กลุ่ม — ทุกกลุ่มให้ Owner อนุมัติก่อนเผยแพร่",
   "detail": "บริษัทเอง: Staff รวบรวมข้อมูล+รูป → Owner · เอเจนต์: AI ช่วยหรือกรอกฟอร์มเอง → Staff · ลูกค้าทั่วไป: AI ต้อนรับ + ปุ่มเปิดฟอร์มเดียวกับเอเจนต์ → Staff",
   "gap": "ตรวจ source: role ของผู้ส่งถูกกำหนดที่ server (listing-case.js:257/273 `submittedByRole`); Owner เท่านั้นที่เผยแพร่. ยังไม่ตรวจ: ปุ่ม AI→ฟอร์มสำหรับลูกค้าทั่วไป; agent/Owner-ส่งเอง บน Cloud ยังไม่ทดสอบ (T20)",
   "state": "ทำแล้วบางส่วน (LOCAL ครบสามกลุ่ม; Cloud ลองกลุ่มเดียว)"
  },
  {
   "id": "A2a",
   "tier": "current",
   "title": "ส่งให้ Staff ต้อง \"ตรวจสรุปแล้วกดยืนยัน\" อย่างชัดเจน",
   "detail": "การกดติดต่อเรา/เริ่มคุย/กรอกข้อมูล ยังไม่ถือว่ายืนยันส่ง",
   "gap": "ตรวจ source: ฟอร์ม Owner Submission มีขั้นตรวจสรุป + ปุ่ม \"ส่งข้อมูล\" (B1 LOCAL; Cloud T02 ผ่าน). ทางแชท: การสร้างเคสจากแชทมีฟังก์ชันยืนยัน (createCaseFromConversation) — ยังไม่ตรวจว่าครบเงื่อนไขนี้",
   "state": "ทำแล้วสำหรับฟอร์ม; แชท UNVERIFIED"
  },
  {
   "id": "A2b",
   "tier": "when",
   "title": "หลายช่องทางเข้า (ฝากขาย/ฝากเช่า · แชท · ติดต่อเรา) เชื่อมสู่ร่างกลางเดียวกันเมื่อรู้ intent",
   "detail": "ช่องทางเข้าเป็นข้อมูลแยก ไม่ใช่ตัวกำหนดสิทธิ์",
   "gap": "ตรวจ source: caseSource มี owner_form/agent_form/staff_form/ai_assistant; ไม่พบฟิลด์ \"ช่องทางเข้า\" แยก (ฝากขาย/แชท/ติดต่อเรา) และ ไม่พบการเชื่อมจากหน้า ติดต่อเรา เข้าสู่ร่าง",
   "state": "ช่องว่าง — เป็นของ Phase 2C/2D ไม่ทำพร้อมเส้นทางหลักนี้"
  },
  {
   "id": "A3",
   "tier": "when",
   "title": "AI กับฟอร์มใช้ร่างเดียว กลับมาทำต่อได้ ไม่สร้างเคสซ้ำ ไม่ถามซ้ำ ไม่เขียนทับข้อมูลที่ผู้ใช้ยืนยันเงียบ ๆ ตรวจสิทธิ์ก่อนเชื่อมข้ามช่องทาง",
   "detail": "",
   "gap": "ตรวจ source: ฟอร์มเติมเคสที่แชทเปิดไว้ในเคสเดิม (listing-case.js:214–215 caseSource ai_assistant) และ (uid, submissionKey) ให้เคสเดียวเสมอ (B2/B3 LOCAL). ยังไม่ตรวจ: กติกาไม่เขียนทับค่าที่ยืนยัน, ไม่ถามซ้ำ, การเชื่อมประวัติข้ามช่องทาง",
   "state": "ทำแล้วบางส่วน — Phase 2C ยังไม่ปิด"
  },
  {
   "id": "A4",
   "tier": "current",
   "title": "แยกข้อมูลให้ชัด: บทบาทผู้ส่ง · ที่มาทรัพย์ · ช่องทางเข้า · ผู้แนะนำ · เจ้าของทรัพย์ · Staff ผู้รับผิดชอบ · ผู้อนุมัติ — บทบาท/สิทธิ์ตรวจจาก server; AI ห้ามเดาบทบาทแล้วมอบสิทธิ์",
   "detail": "",
   "gap": "ตรวจ source: มีแล้ว submittedBy*/caseSource/propertyOwnerRelation/ownerName/assignedTo*/approvedBy* (ฟิลด์ภายใน). ไม่พบ: ฟิลด์ \"ผู้แนะนำ\" และ \"ช่องทางเข้า\" แยก",
   "state": "ทำแล้วบางส่วน — ช่องว่าง 2 ฟิลด์"
  },
  {
   "id": "A5",
   "tier": "when",
   "title": "Dashboard ใช้ทะเบียนกลางเดียว กรองตามที่มา/สถานะ/ผู้รับผิดชอบ; Staff มีคิวกลาง; Owner รับงานแทนได้ตามสิทธิ์",
   "detail": "ไม่สร้างฐานข้อมูลหรือสำเนาเคสแยกตามแท็บ",
   "gap": "ตรวจ source: ทะเบียนเดียว caseInternal; Staff Workspace กรอง new/mine ตามผู้รับงาน. ยังไม่ตรวจ: กรองตามที่มา/สถานะครบ, Owner รับงานแทน",
   "state": "ทำแล้วบางส่วน"
  },
  {
   "id": "A6",
   "tier": "current",
   "title": "สถานะแยกกัน: เริ่มคุย / เตรียมร่าง / ยืนยันส่งรอ Staff / รอข้อมูลเพิ่มเติม / รอ Owner / เผยแพร่ / ปิด — และ พักไว้ · ไม่ตอบ · ยกเลิก · สแปม แยกต่างหาก; ความครบ ≠ ผ่านตรวจ ≠ พร้อมเผยแพร่; Staff ขอข้อมูลเพิ่มและผู้ส่งตอบในเคสเดิมได้",
   "detail": "",
   "gap": "ตรวจ source: มี pending / pending_owner / live / offline + reviewStatus และ infoRequest/needsReply (listing-case.js:705). ไม่พบสถานะ พักไว้/ไม่ตอบ/ยกเลิก/สแปม แยก",
   "state": "เส้นทางหลักมี; สถานะข้างเคียง 4 ตัว = ช่องว่าง (when)"
  },
  {
   "id": "A7",
   "tier": "when",
   "title": "ตรวจโมเดล identity เดิมก่อน: Person / Property / Case / Listing เชื่อมกันได้; คนเดียวหลายทรัพย์; ทรัพย์เดียวหลายเคส; ห้ามสร้างรหัสซ้ำซ้อน; ห้ามรวมคนจากชื่ออย่างเดียว",
   "detail": "",
   "gap": "ตรวจ source: ปัจจุบัน caseId = propertyId = รหัส Listing (1:1:1) และข้อมูลคนอยู่ในฟิลด์ติดต่อของเคส — ไม่มีเอนทิตี Person/Property แยก. ไม่รวมคนจากชื่อ (ไม่มีโค้ดรวมคน)",
   "state": "ตรวจแล้วเป็นช่องว่างสถาปัตยกรรม — ห้ามเพิ่มรหัสใหม่จนกว่าจะออกแบบและ Work ตรวจ"
  },
  {
   "id": "A8",
   "tier": "when",
   "title": "ตรวจการส่งซ้ำ: คำขอเดิมซ้ำใช้เคสเดิม; ผู้ส่ง/ทรัพย์ที่อาจซ้ำให้ Staff เปิดเปรียบเทียบ (บัญชี/ข้อมูลติดต่อที่ยืนยัน, ข้อมูลทรัพย์, รูป เป็นหลักฐาน; IP/เครื่องเดียวกันเป็นสัญญาณประกอบ); ห้ามรวมบัญชี/เคส/ลบอัตโนมัติ; ห้ามเปิดข้อมูลผู้ส่งอื่นให้ลูกค้า",
   "detail": "",
   "gap": "ตรวจ source: คำขอเดิมซ้ำ → เคสเดิม (submissionKey, B2/B3 LOCAL). ไม่พบการเปรียบเทียบผู้ส่ง/ทรัพย์ที่อาจซ้ำสำหรับ Staff และไม่มีการรวม/ลบอัตโนมัติ (ตรงตามข้อห้าม)",
   "state": "ส่วนซ้ำแบบเดียวกัน = ทำแล้ว; การเปรียบเทียบสำหรับ Staff = ช่องว่าง (when)"
  },
  {
   "id": "A9a",
   "tier": "current",
   "title": "ปิดประกาศ: Owner ปิดแล้วเอกสาร/รูปสาธารณะถูกลบ",
   "detail": "",
   "gap": "ทำแล้ว: B9 LOCAL + Cloud หนึ่งเคส (Search=0); ลบ backend/ลิงก์รูปเดิมยังไม่ยืนยันบน Cloud (T17/T18)",
   "state": "ทำแล้วบางส่วน"
  },
  {
   "id": "A9b",
   "tier": "when",
   "title": "จัดการข้อมูลและไฟล์ตามสถานะ แยก พักเคส / ล้างรูปของร่าง / ลบเคส / ปิดประกาศ — ก่อนลบแสดงขอบเขต จำนวนไฟล์ ขนาด สิ่งที่ยังอยู่; ตรวจสถานะล่าสุดและไฟล์ที่ยังถูกอ้างอิง; ห้ามตัวล้างร่างกระทบเคสส่งตรวจ/ประกาศที่ใช้งาน; Staff เสนอ Owner ยืนยันลบถาวร",
   "detail": "ระยะเวลาเก็บแต่ละระดับ = ยังไม่มีมติ (D6) ห้ามกำหนดเอง",
   "gap": "ตรวจ source: มี take-down และ reconcileListingFiles; ไม่พบ พักเคส/ลบเคส/ล้างรูปร่าง และกลไก Staff เสนอ→Owner ยืนยัน",
   "state": "ช่องว่าง — ทำเมื่อถึงขั้นนี้ ไม่ทำรอบนี้"
  },
  {
   "id": "A9c",
   "tier": "future",
   "title": "ระบบล้างข้อมูลอัตโนมัติตามระยะเวลาเก็บ",
   "detail": "ต้องมีมติ D6 ก่อน",
   "gap": "ไม่มีในระบบ (ตรงตามข้อกำหนด: งานภายหลัง)",
   "state": "งานอนาคต"
  },
  {
   "id": "A10a",
   "tier": "current",
   "title": "เก็บที่มาและประวัติเพื่อรองรับ attribution/การแบ่งงานในอนาคต",
   "detail": "",
   "gap": "ตรวจ source: เก็บ caseSource, submittedBy*, assignedTo*, approvedBy*, ประวัติข้อความ — ไม่แก้เพิ่มรอบนี้",
   "state": "มีฟิลด์พื้นฐานแล้ว (ช่องว่าง: ผู้แนะนำ = A4)"
  },
  {
   "id": "A10b",
   "tier": "future",
   "title": "สูตรค่าคอมและสิทธิ์รับเงิน",
   "detail": "ยังไม่สร้าง ห้ามสร้างรอบนี้",
   "gap": "ไม่มีในระบบ (ตรงตามข้อกำหนด)",
   "state": "งานอนาคต"
  }
 ]
}
```
<!-- STATUS-REGISTRY:END -->

