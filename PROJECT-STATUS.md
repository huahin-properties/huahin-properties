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
