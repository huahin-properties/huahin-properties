# ชุดส่งต่อโครงการ — สถานะปัจจุบัน (อ่านก่อนประวัติ)

**รุ่นหลัก: HP-HANDOFF-2026-10-03-v2 · 3 ตุลาคม 2569 · Asia/Bangkok**

- รวม Work v1 + Claude Code v1.1 ที่ document commit `34a0eb0ee27bddfa72003958dd7e0546a9b490b2` + Claude AI ADDENDUM-CLAUDE-AI-01 + มติแผง PROJECT-STATUS ที่เจ้าของยืนยัน 3 ต.ค. 10:19
- Code baseline/TEST ที่เจ้าของทดลอง: `d0fe6173ed2aa49fa92337b8519ca3eefb5fe7a5`; PR #8 ตรวจรอบนี้ OPEN/DRAFT/NOT MERGED, head เอกสาร `34a0eb0`, base `claude/chat-live-01`
- v1/v1.1 และข้อความ "ยังไม่ commit" ด้านล่างเป็น snapshot ประวัติ; v1.1 อยู่ GitHub แล้ว ส่วน **v2 ฉบับนี้ยังไม่ commit**. ห้ามเอา code SHA/document SHA/deployed SHA ปนกัน
- สถานะ: DOCUMENTATION RECONCILIATION; TEST หนึ่งเคสผ่าน UI ถึงปิดประกาศ; production NOT READY; ไม่ deploy/merge/GREEN ในรอบนี้
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
| Owner intake/preview/publish | 🟢 REAL-TEST | 014754/014857/015012 | approval display mapping ค้าง |
| Public details 7 photos | 🟢 REAL-TEST photos | user + 015323 | ไม่ถือว่า fields ทั้งหมดถูก |
| Public search cover/data labels/map | 🔴 observed defects | 015210/015323/015328 | Code audit → เสนอ targeted fix หลัง scope อนุมัติ |
| Take-down search/details | 🟢 REAL-TEST UI หลัง refresh | 020034/020932 | ลิงก์รูปเก่ายัง UNVERIFIED |
| Full 3 submitter groups | 🟡 LOCAL reported; REAL-TEST ไม่ครบ | CODE-REPORT | agent flow และ negative Cloud ต้องเติม |
| Privacy legacy migration | 🔴 BLOCKED production | CODE-REPORT plan | ห้าม migrate/delete จนอนุมัติแยก |
| Production release | 🔴 NOT READY | draft/unmerged + blockers | ห้าม merge/deploy/GREEN |
| ตรวจ source DOC-OBS + ทะเบียนแนวคิด r4 | 🟡 ข้อค้นพบพร้อมส่ง Work; ยังไม่แก้ระบบเว็บ | SOURCE · CODE-V2-01 r4 | Work ตรวจข้อเสนอแก้ขั้นต่ำ FX-1…FX-5 ก่อนแก้ |

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
  "codeSha": "d0fe6173ed2aa49fa92337b8519ca3eefb5fe7a5",
  "docBaseSha": "34a0eb0ee27bddfa72003958dd7e0546a9b490b2",
  "deployedTestSha": "d0fe6173ed2aa49fa92337b8519ca3eefb5fe7a5",
  "deployedProdSha": "ไม่ทราบ",
  "prState": "PR #8 OPEN / DRAFT / NOT MERGED · base claude/chat-live-01",
  "website": "RED / Public Hidden (ตามรายงาน ไม่ได้ตรวจสดรอบนี้)",
  "revision": "r4 (Code · ทะเบียนแนวคิด + ตรวจ source DOC-OBS)",
  "set": "HP-HANDOFF-2026-10-03-v2 + CODE-V2-01 r4"
 },
 "goal": "ให้เจ้าของและทีมลงประกาศพร้อมรูปจนเผยแพร่ได้จริงอย่างปลอดภัย (ส่งฟอร์ม → Staff เตรียม → Owner อนุมัติ/เผยแพร่ → หน้าสาธารณะ) บนเว็บ huahin.properties โดยยังไม่เปิดเว็บสาธารณะจนกว่าเจ้าของอนุมัติ",
 "current": {
  "task": "ตรวจ source DOC-OBS + ทะเบียนแนวคิดของเจ้าของ (แยก ปัจจุบัน / จำเป็นต่อขั้นถัดไป / อนาคต) — ยังไม่แก้ระบบเว็บ",
  "phases": [
   "LISTING-E2E-01",
   "ชุดส่งต่อ"
  ],
  "environments": [
   "เอกสาร",
   "TEST (ผลเดิม)"
  ],
  "actor": "Claude Code → ส่ง ChatGPT Work ตรวจข้อเสนอแก้ขั้นต่ำก่อนแก้"
 },
 "youDoNow": {
  "text": "ยังไม่ต้องทำอะไร — รอ ChatGPT Work ตรวจข้อค้นพบและข้อเสนอแก้ขั้นต่ำ (FX-1…FX-5)",
  "where": "ไม่มีหน้าจอที่ต้องเปิด",
  "passWhen": "Work แจ้งผลตรวจและเลือกข้อที่ให้แก้ก่อน",
  "next": "เจ้าของตัดสินหน่วยที่ดิน (D2) เมื่อ Work พร้อม · ไม่มีคำสั่งแก้เว็บ, merge หรือ deploy"
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
     "ref": "ล้มเป็นพักๆ ราว 1 ใน 4 รอบ"
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
     "id": "D12",
     "text": "ทดสอบชุดเต็มที่ head ปัจจุบัน (listing/chat-live/combined/browser-local) ซ้ำ",
     "status": "unverified",
     "level": "LOCAL",
     "ref": "รอบเอกสารไม่ได้รัน; combined 175 เป็นผลรอบก่อน"
    }
   ]
  },
  {
   "id": "S-TEST-FLOW",
   "env": "test",
   "name": "Cloud TEST — เส้นทางหลัก ส่ง→Staff→Owner→เผยแพร่→ปิด (หนึ่งเคส)",
   "locked": false,
   "lockNote": "ร่าง — รอ Work ตรวจและ lock ชุดนี้แยกจากชุดอื่น",
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
     "ref": "020034"
    }
   ]
  },
  {
   "id": "S-TEST-PUBLIC",
   "env": "test",
   "name": "Cloud TEST — หน้าสาธารณะแสดงถูกต้อง (DOC-OBS)",
   "locked": false,
   "lockNote": "ร่าง — รอ Work ตรวจและ lock ชุดนี้แยกจากชุดอื่น",
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
     "status": "fail",
     "level": "REAL-TEST",
     "ref": "DOC-OBS-01"
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
     "ref": "DOC-OBS-02"
    },
    {
     "id": "T13",
     "text": "แผนที่/ระยะทางไม่แสดง undefined หรือ 0 กม. ที่ไม่จริง",
     "status": "fail",
     "level": "REAL-TEST",
     "ref": "DOC-OBS-03"
    },
    {
     "id": "T14",
     "text": "หน้าอนุมัติแสดงผู้อนุมัติ",
     "status": "fail",
     "level": "REAL-TEST",
     "ref": "DOC-OBS-04"
    },
    {
     "id": "T16",
     "text": "หลังปิด หน้า Details แจ้งสถานะ 'ปิดแล้ว/ไม่พบ' ชัดเจน",
     "status": "fail",
     "level": "REAL-TEST",
     "ref": "DOC-OBS-05 (ว่างเปล่า)"
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
     "id": "T17",
     "text": "หลังปิด ไฟล์/เอกสารฝั่ง backend ถูกลบครบ",
     "status": "unverified",
     "level": "REAL-TEST",
     "ref": "ยังไม่ได้ตรวจ Cloud"
    },
    {
     "id": "T18",
     "text": "ลิงก์รูปสาธารณะเดิมใช้ไม่ได้หลังปิด",
     "status": "unverified",
     "level": "REAL-TEST",
     "ref": "ต้องเก็บ URL ก่อนปิดรอบหน้า"
    },
    {
     "id": "T19",
     "text": "ผู้ไม่มีสิทธิ์ถูกปฏิเสธบน Cloud (agent / outsider / uid อื่น)",
     "status": "unverified",
     "level": "REAL-TEST",
     "ref": "ยังไม่ได้ทดสอบ"
    },
    {
     "id": "T20",
     "text": "เส้นทาง agent และ Owner-ส่งเองครบบน Cloud",
     "status": "unverified",
     "level": "REAL-TEST",
     "ref": "ทดสอบเฉพาะ local"
    },
    {
     "id": "T21",
     "text": "retry / ส่งซ้ำ / เครือข่ายช้าบน Cloud",
     "status": "unverified",
     "level": "REAL-TEST",
     "ref": "ทดสอบเฉพาะ local"
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
     "id": "P04",
     "text": "ยืนยัน rules และ functions ที่ deploy บน production ตรงกับโค้ด",
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
     "text": "ยืนยันการแสดงผลของ Artifact บน claude.ai จริง",
     "status": "unverified",
     "level": "DOCS",
     "ref": "Code ตรวจภาพบน claude.ai เองไม่ได้ จึงคง UNVERIFIED; ต้องใช้ภาพจากเจ้าของยืนยัน (R12). ไฟล์เดียวกันตรวจใน Chromium ในเครื่องแล้ว"
    },
    {
     "id": "R12",
     "text": "ภาพจากเจ้าของยืนยันการเปิด Artifact แผง PROJECT-STATUS จริง (แยกจาก R11)",
     "status": "unverified",
     "level": "DOCS",
     "ref": "รอภาพหน้าจอจากเจ้าของ"
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
     "text": "ตรวจ source DOC-OBS-01…05 พร้อมข้อเสนอแก้ขั้นต่ำ FX-1…FX-5 ให้ Work ตรวจก่อนแก้",
     "status": "pass",
     "level": "SOURCE",
     "ref": "4 จาก 5 พบต้นเหตุ; DOC-OBS-01 ยังไม่พบ"
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
    "T17",
    "T18"
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
    "T19",
    "T20",
    "T21"
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
    "P04",
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
  }
 },
 "issues": [
  {
   "id": "DOC-OBS-01",
   "title": "Search ไม่แสดงรูปปกของประกาศที่เผยแพร่",
   "sev": "high",
   "status": "open",
   "env": "test",
   "actor": "code",
   "next": "Code ทำตาม FX-4: test ในเครื่องก่อน → หลักฐาน Network 1 ครั้ง → แก้",
   "source": "SOURCE (r4): เส้นทางอ่านโค้ดถูกต้องตามทฤษฎี ยังไม่พบต้นเหตุ; test ไม่ assert รูปปก"
  },
  {
   "id": "DOC-OBS-02",
   "title": "ขนาดที่ดินกรอกเป็น ตร.ว. แต่หน้า Details แสดง ตร.ม.",
   "sev": "high",
   "status": "open",
   "env": "test",
   "actor": "owner",
   "next": "เจ้าของตัดสิน D2 → จึงเสนอ FX-5",
   "source": "SOURCE (r4): Details ต่อ \"ตร.ม.\" กับ landSize ที่ฟอร์มเก็บเป็น \"ตร.ว.\" ไม่มีการแปลง (property-adapter.js:66, Property Details:881)"
  },
  {
   "id": "DOC-OBS-03",
   "title": "แผนที่แสดง undefined และระยะทาง 0 กม.",
   "sev": "med",
   "status": "open",
   "env": "test",
   "actor": "code",
   "next": "Work ตรวจ FX-2 (ซ่อนระยะที่ไม่รู้) ก่อนแก้",
   "source": "SOURCE (r4): พบต้นเหตุ — Details:856–867 ตกไปใช้ raw.distance* เมื่อไม่มีพิกัด → 0 / undefined"
  },
  {
   "id": "DOC-OBS-04",
   "title": "หน้าอนุมัติแสดง 'อนุมัติโดย -'",
   "sev": "low",
   "status": "open",
   "env": "test",
   "actor": "code",
   "next": "Work ตรวจ FX-1 (แก้บรรทัดเดียว) ก่อนแก้",
   "source": "SOURCE (r4): ยืนยัน — UI อ่าน approvedBy ส่วน server เขียน approvedByEmail/Uid/Role"
  },
  {
   "id": "DOC-OBS-05",
   "title": "หลังปิดประกาศ หน้า Details ว่างเปล่า ไม่บอกสถานะ (ต้นเหตุจาก source ยืนยันแล้ว)",
   "sev": "med",
   "status": "open",
   "env": "test",
   "actor": "code",
   "next": "Work ตรวจ FX-3 (ข้อความไม่พบ/โหลดล้ม 8 ภาษา) ก่อนแก้",
   "source": "SOURCE (r4): ยืนยัน — Details:802 hasProperty:false ไม่มีมุมมองทดแทน → หน้าว่าง"
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
   "status": "open",
   "affects": "DOC-OBS-02, T12"
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
   "title": "แสดง \"อนุมัติโดย\" ให้ตรงกับฟิลด์ที่ server เขียน",
   "finding": "Listing Approvals.dc.html บรรทัด 1091 แสดง p.approvedBy แต่ตอนเผยแพร่ server เขียน approvedByEmail / approvedByUid / approvedByRole ลงเอกสาร Case ภายใน (listing-case.js บรรทัด 517) และไม่เขียน approvedBy — \"-\" จึงเกิดจากชื่อฟิลด์ไม่ตรง ไม่ใช่ประวัติหาย",
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
   "status": "proposed"
  },
  {
   "id": "FX-2",
   "obs": "DOC-OBS-03",
   "title": "ระยะทางและชื่อโซนที่ไม่ทราบต้องไม่แสดง undefined / 0 กม.",
   "finding": "Property Details.dc.html บรรทัด 856–867: ถ้าไม่มีพิกัดที่อ่านได้จาก mapLink ใช้ raw.distanceBeach / distanceTown ซึ่งเอกสารสาธารณะของ Case ไม่มี → data.js ใส่ค่าเริ่ม 0 (\"0 กม.\") หรือ undefined (\"undefined กม.\"); บรรทัด 872–874 ใช้ zoneText ที่อาจว่างเป็น \"undefined\"",
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
   "status": "proposed"
  },
  {
   "id": "FX-3",
   "obs": "DOC-OBS-05",
   "title": "แยก \"ไม่พบ/ปิดแล้ว\" ออกจาก \"โหลดไม่สำเร็จ\" แทนหน้าว่าง",
   "finding": "Property Details.dc.html บรรทัด 802: ถ้าไม่พบรายการ คืน hasProperty:false และส่วนเนื้อหาทั้งหน้าอยู่ใต้ sc-if hasProperty ไม่มีทางเลือกอื่น → หน้าว่าง (ยืนยันจากโค้ด ไม่ใช่ข้อสันนิษฐานแล้ว). หลังปิด เอกสารสาธารณะถูกลบ จึงเข้ากรณีนี้; ส่วน data.js ตั้ง window.__hhDataLoad.state = \"failed\" เมื่อโหลดไม่ได้ ซึ่งใช้แยกสองกรณีได้",
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
   "status": "proposed"
  },
  {
   "id": "FX-4",
   "obs": "DOC-OBS-01",
   "title": "Search ไม่มีรูปปก — ยังหาต้นเหตุจาก source ไม่ได้ ต้องมีหลักฐานก่อนแก้",
   "finding": "เส้นทางอ่านโค้ด: Search → getEffectiveProperties (data.js 846–) → fetchCollection(\"properties\") + fetchAllPhotos → photosById[id-index] → p.photos[0].url → PropertyCard. อ่านตามแล้วถูกต้องตามทฤษฎี (รูปสาธารณะชนะรูปส่วนตัว id ซ้ำกัน) จึง **ไม่พบต้นเหตุ**; ทฤษฎีที่ยังเหลือ: (ก) ผู้ดูเป็นทีมงาน/Owner ทำให้ผสมรายการรูปส่วนตัว (ข) ลำดับ/จังหวะโหลด (ค) ฟิลด์ photos ของ Case แบบรวมเรคคอร์ดทับ — ไม่มีข้อใดยืนยัน",
   "evidence": "SOURCE: ไม่พบต้นเหตุ · test ในเครื่องไม่ assert รูปปกใน Search (ช่องว่างของ test) · ภาพ Cloud 015210",
   "minFix": "ขั้น 1 (ไม่แก้เว็บ): เพิ่ม test ในเครื่องที่เผยแพร่เคสแล้วเปิด Search จริงสองแบบ (ผู้เยี่ยมชม / Owner) และ assert รูปปก — ถ้า fail ในเครื่องจะได้ต้นเหตุ; ถ้า pass ให้เจ้าของเก็บภาพ Network (จำนวน propertyPhotos ที่ Search โหลด) หนึ่งครั้งบน TEST. ขั้น 2: แก้เฉพาะจุดที่พิสูจน์ได้",
   "reqCheck": [
    "รูปส่วนตัวห้ามเปิดสาธารณะ — ห้าม \"แก้\" โดยให้ผู้เยี่ยมชมอ่าน casePhotos",
    "ต้องไม่ใช้ข้อมูลตัวอย่างแทน (PD-12) และไม่สร้างทรัพย์เพื่อให้ผ่าน",
    "ไม่เปลี่ยน rules ของ propertyPhotos (read: true เดิม)"
   ],
   "test": "test ใหม่ B-search-cover (ผู้เยี่ยมชม + Owner) ต้อง fail ก่อนแก้ถ้าปัญหาเกิดในเครื่อง; negative control ลบรูป → ต้อง \"ไม่มีรูป\"",
   "risk": "ยังประเมินไม่ได้ (ไม่รู้ต้นเหตุ)",
   "order": 4,
   "decider": "work",
   "status": "proposed"
  },
  {
   "id": "FX-5",
   "obs": "DOC-OBS-02",
   "title": "หน่วยที่ดิน — รอมติเจ้าของ (D2) ก่อนเสนอโค้ด",
   "finding": "Lister Dashboard / Case Data ติดป้าย landSize เป็น \"ตร.ว.\" (และมีช่องไร่/งาน/ตร.ว. แยกอีกชุด) แต่ Property Details.dc.html บรรทัด 881 ต่อ t.sqm (ตร.ม.) ทุกภาษา และ property-adapter.js เก็บ landSize เป็นตัวเลขเฉยๆ ไม่มีการแปลง; 100 ตร.ว. = 400 ตร.ม. จึงแสดงเป็นตัวเลขเดิมกับหน่วยผิด",
   "evidence": "SOURCE (อ่านโค้ด) · ภาพ Cloud ตรงกัน",
   "minFix": "หลังเจ้าของเลือกหน่วย: แก้ \"ป้ายหน่วย\" หน้า Details ให้ตรงกับที่ฟอร์มเก็บ หรือแปลงหน่วยแบบมีป้าย — ห้ามแก้ค่าข้อมูลบน Cloud และห้ามเปลี่ยนความหมายของข้อมูลเดิมเงียบๆ",
   "reqCheck": [
    "ต้องตัดสิน D2 ก่อน",
    "ข้อมูลที่บันทึกไปแล้ว (เช่น 100) ต้องไม่ถูกคูณ/แปลงย้อนหลังโดยอัตโนมัติ",
    "ต้องมีคำแปลหน่วยครบ 8 ภาษา"
   ],
   "test": "page test ตามหน่วยที่เลือก (100 ตร.ว. ต้องแสดงตรงกับหน่วยที่ประกาศ)",
   "risk": "ปานกลาง (เกี่ยวข้องความหมายข้อมูล)",
   "order": 5,
   "decider": "owner",
   "status": "blocked-decision"
  }
 ]
}
```
<!-- STATUS-REGISTRY:END -->

