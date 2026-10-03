# ชุดส่งต่อโครงการ — สถานะปัจจุบัน (อ่านก่อนประวัติ)

**รุ่นหลัก: HP-HANDOFF-2026-10-03-v2 · 3 ตุลาคม 2569 · Asia/Bangkok**

- **สถานะปัจจุบัน (r9):** source/code head `d7ee37e9323115168e8d0179372e9c2015ec42c4` (โค้ดเว็บ+Functions เปลี่ยน: หน่วยที่ดิน D2) · เอกสาร/build base ที่ Work ตรวจ `d0ffd49b56c5303e69c8c82ddb9b8db374442915` · **Cloud TEST deployed ยังเป็น `2c897593321713783d0ba81c7167962e1793be9a`** (ยังไม่ deploy r9) · production deployed ไม่ทราบ (RED) · T12 คง FAIL จนกว่า Work ตรวจและเจ้าของลอง Cloud TEST · S-TEST-FLOW 9/9 · S-TEST-PUBLIC 6/7 ≈ 86% (ผล Cloud ที่ 2c89759 ไม่เปลี่ยน) · ดูบล็อก "ผลปรับรอบ r9" ท้ายเอกสาร; บรรทัด r8 ด้านล่างเป็น **ประวัติ**
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

# HANDOFF — สถานะล่าสุดสำหรับรับช่วง

**CURRENT ACTION: จัดทำ/ตรวจ/sync ชุดส่งต่อก่อนเริ่ม source ต่อจากเมื่อคืน.** เจ้าของอนุมัติรอบเอกสาร ไม่ได้อนุมัติแก้ DOC-OBS ทั้งหมดโดยอัตโนมัติ

## ผู้รับต้องทำก่อนเริ่ม

1. อ่าน HANDOFF ส่วนปัจจุบันนี้ → PROJECT-STATUS → BLUEPRINT มติที่เกี่ยวข้องและภาคต่อ; ถ้าเห็นบล็อกล่าสุด 21 ก.ย. ด้านล่าง นั่นคือประวัติ
2. ตรวจ GitHub head ปัจจุบันเทียบ d0fe617; หากเปลี่ยนให้บอกความต่างก่อนสืบทอด PASS
3. สรุปความเข้าใจ/ข้อขัดแย้ง/งานถัดไป; Code รับ coding, Work review, Claude AI product context; ไม่แก้ source พร้อมกันหลายหน้าต่าง
4. Code ต้องตรวจเอกสาร repo ล่าสุดก่อนคัดลอก: ไม่เขียนทับส่วนใหม่ที่มีหลังฐาน 21 ก.ย.; ชุดนี้รักษา attachment เดิมครบ แต่ไม่ได้ merge กับทุกเวอร์ชัน repo โดยอัตโนมัติ

## จุดหยุดเมื่อคืน

TEST listing เคสเดิมผ่าน user submit → Staff 7 photos → edit/save/refresh → review 19/19 → Owner intake → preview/publish → public 7 photos → take-down; Search 0 และ Details ว่างหลัง refresh. ไม่ต้อง resubmit ไม่ต้องสร้าง Firebase project/account ใหม่. ขั้นต่อไปคือ docs reconciliation แล้วค่อย scope defect audit

## หน้าที่ของสามระบบ

Claude AI รับภาพรวม/มติ/ช่วยตรวจเอกสาร; Claude Code อ่านชุด+repo แล้วแก้เอกสาร/source เฉพาะงานที่มอบหมาย ทดสอบ ส่ง head; Work ตรวจหลักฐาน/โค้ดและพาเจ้าของลองทีละ action. ไม่มีระบบใด self-approve production release


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

## ลำดับการพัฒนาหลังเอกสารเดิม — ต้องแยกประเภทหลักฐาน

| จุดอ้างอิง | สิ่งที่รายงานว่าเปลี่ยน | หลักฐาน/สถานะ |
|---|---|---|
| PR #2–#7 → beec235 | chat gates/persona/tests อยู่ใน claude/chat-live-01 | อิงรายงานที่เจ้าของนำมา + base SHA ที่ตรวจ GitHub วันนี้; ยังไม่ได้ re-audit PR ทั้งหมดรอบนี้ |
| be9250f | listing chain/private photos/owner publish รอบแรก | Code report; draft ไม่ production |
| 9f1f9b6 | case messages/token authority, retry, public projection, TEST build | Code report; emulator |
| 2443183 | publish races, preview approval signature, agent case access, shared checklist | Code report; emulator |
| 4a18c22 | TEST gate/deploy scope, preview photo failure; local browser | Code report; Chromium+emulator |
| 9b0341b | bounded SDK wait, no test reload, Staff/Owner UI; local 9 tests | Code report; ไม่รับรอง Cloud จากจุดนี้ |
| e6a99b5 | build รับ huahin-chat-test-*; listing deploy script | Code report |
| e7603b8 | isolate listing functions เพื่อหลีก secret discovery ของทั้งระบบ | Code report/CLI source audit reported |
| 1b1c3fc | functions:listing:name selectors | Code report/CLI test reported |
| 3c9a73f | getCasePhoto callable แทน Storage REST cross-origin ที่ CORS บล็อก | Code report + ปัญหา Cloud จากเจ้าของ; กลไกตรวจ source ก่อนแก้เพิ่มเติม |
| e837d93 | โหลด private photo ครบและ lightbox index ตรง; B10 negative control | Code report + Cloud user ยืนยัน 7 รูป |
| d0fe617 | Case Data ทีมงาน แทน Staff link ไป guarded Lister Dashboard | head GitHub ตรวจสด + Cloud user save/refresh ผ่าน |

ผล local ล่าสุดที่ Code รายงาน: test:listing 90, test:chat-live 34, test:browser-local 11 ผ่านในรอบสุดท้าย; มี browser flakes ที่ยังไม่สรุป root cause. combined 175 เป็นผลที่รายงานในรอบก่อนหน้า ไม่อ้างว่ารันซ้ำทุก commit. ไม่ได้ rerun tests ในรอบเอกสารนี้

PR description ยังเขียน head 9b0341b และ not verified TEST; OWNER-TEST-GUIDE.md ที่ head d0fe617 ยังมีข้อความ not deployed/not tried Cloud. ตรวจ GitHub วันนี้แล้ว ยืนยันเอกสาร stale; ต้อง sync เมื่อ Code รับงานเอกสาร ไม่แก้ย้อนหลังผล local ให้เป็น Cloud PASS

### สถานะแชทที่เจ้าของส่งมาก่อนเริ่ม LISTING-E2E

#14 PASS; #15 KEY FIX PRODUCTION PASS / P6 HISTORY PASS; #16 ContactRail normal path PASS; #17 F-2 PASS; EN PASS; H-2 BLOCKED/NOT TESTABLE; Website RED/Public Hidden. ที่มา: ข้อความ handoff ที่เจ้าของวางต้นแชท ไม่ใช่การตรวจ production ใหม่ในรอบนี้
FR technical-error fallback ได้ EN + Contact และ Home submitWelcome UI reachability ยังต้องตรวจผล audit/commit ที่อ้างอิง; ห้าม retry FR หรือเริ่ม scope เก่าเอง ไม่มีหลักฐานปิดทั้งหมดในแชทนี้. #10/#12/#13 และทะเบียน issue อื่นต้อง reconcile ไม่เดาปิดหรือออกเลขชน

## ชุดเอกสารและการส่งกลับ

ส่ง BLUEPRINT.md + HANDOFF-NEXT-CHAT.md + PROJECT-STATUS.md ฉบับเต็มในรอบเดียวกัน; ระบุ code SHA ที่ตรวจและ document commit SHA หลัง commit ไม่แต่ง self-referential SHA ก่อนเกิด commit; ตรวจว่าเนื้อหาเดิมครบ/ไม่ถูกตัด; Viewer และ PR description เป็นหน้ารายงาน ไม่แทนชุดส่งต่อ

## เส้นทางอ้างอิง TEST (ไม่ใช่คำสั่งให้ทดสอบตอนนี้)

- Login: https://huahin-chat-test-01.web.app/Admin%20Login.dc.html
- Staff/Owner queue: https://huahin-chat-test-01.web.app/Listing%20Approvals.dc.html
- Case editor: https://huahin-chat-test-01.web.app/Case%20Data.dc.html?id=own-14a754ca222d54e405fe
- Public search: https://huahin-chat-test-01.web.app/Search%20Results.dc.html
- Details เดิมซึ่งปิดแล้ว: https://huahin-chat-test-01.web.app/Property%20Details.dc.html?id=own-14a754ca222d54e405fe
- Customer submit: https://huahin-chat-test-01.web.app/Owner%20Submission.dc.html
- Private tracking token/link ไม่อยู่เอกสารนี้

## รายการอ่านใน repository เมื่อ Code รับช่วง

`docs/listing-e2e/LISTING-E2E-01.md`, `LEGACY-DATA-PLAN.md`, `DEPLOY-TEST-PROJECT.md`, `OWNER-TEST-GUIDE.md`, `browser-local/RESULTS.md`, `browser-local/README.md`; chat docs ใน `docs/testing/`; CLAUDE.md/AGENTS.md หากมี. ต้องอ่านตัวปัจจุบัน ไม่อ้างทั้งหมดว่าตรวจแล้วจากชุดนี้

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

# ประวัติ HANDOFF เดิม — เก็บครบจาก attachment (ไม่ใช่ latest วันนี้)

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
> | PENDING #10 | **TRUTHFULNESS FIX EXISTS IN SOURCE / DOCUMENTATION STALE / VERIFICATION PENDING** — ขอบเขตเหลือเฉพาะ "AI ห้ามกล่าวอ้าง authoritative action ที่ไม่ได้เกิด" · ปิดได้เมื่อ R10-TRUTH ผ่าน · เรื่อง Product Flow ย้ายไป #14 (BLUEPRINT §35.34 · §36) |
> | PENDING #14 | **SOURCE ON MAIN / REGRESSION PAUSED / S-6 FAIL** — S-1 · S-2 · S-4 PASS แต่ S-6 ยังมีปุ่มติดต่อขึ้นในบทสนทนาฝากขายก่อนส่ง (BLUEPRINT §36.9) · **blocker = #15 ต้องแก้ก่อน** |
> | PENDING #15 | 🆕 **OPEN / NOT FIXED** — Contact CTA เกิดจาก regex ใน `_replyLinks()` ไม่ใช่โทเคน → bypass PD-02 ได้ (BLUEPRINT §36.10) · **AUDIT ONLY ก่อน** |
> | PENDING #16 | 🆕 **OPEN / NOT FIXED** — Female persona only (ไทย): ห้าม "ผม/ครับ" เป็นเสียง AI · พบผิด 4 ครั้งใน 4 เทิร์น (BLUEPRINT §36.11 · PD-16) |
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
> **ลำดับงานที่ล็อกไว้ (BLUEPRINT §36.12 — ห้ามข้ามลำดับ)**: #15 Contact CTA audit →
> #16 Female persona → รัน #14 regression ใหม่ → sync เอกสาร · **แต่ละขั้นต้องรอเจ้าของอนุมัติก่อนเริ่ม**
>
> **งานอื่นที่ยังไม่ได้เลือก**: PENDING #12 · PENDING #13 · Phase 2A-4 — **ห้ามเริ่มเอง**
>
> **PENDING #10 ไม่ต้องเลือกเป็นรอบแก้แล้ว** — fix อยู่ใน source แล้ว เหลือเพียง verification
> ด้วย R10-TRUTH · ส่วน R10 ที่ต้องใช้ทรัพย์เผยแพร่จริงยัง NOT TESTABLE (ไม่ใช่ FAIL)
>
> **มติผลิตภัณฑ์ทั้งหมดอยู่ที่ BLUEPRINT §36 PRODUCT DECISION REGISTRY (PD-01…PD-14)**
> ห้ามตัดสินใจเรื่อง journey / viewing / handoff ขัดกับ PD ใด ๆ โดยไม่ได้รับอนุมัติใหม่

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
