# LISTING-E2E-01 — ลงประกาศพร้อมรูปให้ใช้งานได้จริง (รอบ 2 — แก้ตามรีวิวของ Work 6 ข้อ)

**สถานะ:** โค้ดพร้อมในสาขา · ทดสอบจำลองผ่าน (emulator + ข้อมูลสังเคราะห์) · **ยังไม่เคยลองใน browser จริง/โปรเจกต์ TEST** · **ข้อ 2 (ความเป็นส่วนตัว) ยัง BLOCKED สำหรับ production** เพราะข้อมูลเคสเดิมยังไม่ถูกย้าย (§7)
ไม่มี merge / deploy / แตะ production / ข้อมูลลูกค้าจริง / secret ในงานนี้

## 1) โมเดลข้อมูลใหม่ (เปลี่ยนจาก "Design P" รอบ 1)
| ที่เก็บ | ใครอ่าน | ใครเขียน | เนื้อหา |
|---|---|---|---|
| `caseInternal/{id}` = **ตัวเคส (Case record)** | ทีมงานเท่านั้น (ผู้ส่งก็อ่านไม่ได้) | สร้าง/ปิดประกาศ/อนุมัติ: server เท่านั้น · Staff/Owner แก้งานเตรียมได้ (ห้าม live, ห้ามประทับอนุมัติ, ห้ามแก้ตัวตนผู้ส่ง/token) | ทุกอย่างของเคส: ผู้ติดต่อ เจ้าของจริง token สถานะ การมอบหมาย ผู้อนุมัติ ฯลฯ |
| `casePhotos/{id}-{n}` + Storage `casePhotos/{id}/a-<attempt>/{n}.webp` | ทีมงาน | server | รูปรอตรวจ — **ไม่มี download token** |
| `properties/{id}` | สาธารณะ | **server เท่านั้น** (ไม่มีเบราว์เซอร์ใดเขียนได้ แม้ Owner) | **หน้าสาธารณะของประกาศที่เผยแพร่แล้ว** = projection จาก allow-list (`PUBLIC_FIELDS`) สร้างตอน Owner เผยแพร่ และ **ลบทิ้งตอนปลดประกาศ** — เคส pending/draft/offline ไม่มีเอกสารสาธารณะเลย |
| `propertyPhotos/{id}-{n}` + Storage `publishedCasePhotos/{id}/<op>/{n}.webp` | สาธารณะ | server เท่านั้น | รูปที่เผยแพร่แล้ว (มี token เพราะเป็นสาธารณะ) |

- เคสเก่า (สร้างก่อนหน้านี้) ยังเป็นเอกสารเดียวใน `properties` ทำงานเหมือนเดิม (ดู LEGACY-DATA-PLAN.md)
- ฟังก์ชันใหม่: `submitListingCase`, `publishListingCase`, `unpublishListingCase`, `syncListingCase`, `addCasePhotos`, `reconcileListingFiles`, `trackListingCase` — ปฏิเสธทุกคำขอ (`not_enabled`) นอกโปรเจกต์ทดสอบ (`huahin-chat-test-*`/`huahin-listing-test-*`/`demo-*`)

## 2) ข้อ 1–6 ของ Work — แก้อย่างไร / ทดสอบอะไร
| # | ประเด็นของ Work | การแก้ | หลักฐาน (ทดสอบจำลอง) |
|---|---|---|---|
| 1 | caseMessages อ่านได้โดยไม่ต้องพิสูจน์ว่าเป็นเจ้าของ token | `caseMessages` เหลือ **ทีมงานเท่านั้น** (read/create) ทุกเคส (ใหม่และเก่า); ลูกค้าอ่าน/ส่งข้อความผ่าน `trackListingCase` (ตรวจ token ฝั่ง server, ใช้ `timingSafeEqual`, not-found = wrong token = no token); คำตอบไม่มี `caseToken`/`thaiText`/อีเมลทีมงาน/โน้ตภายใน; หน้า Track ใช้ polling ผ่านฟังก์ชัน | rules F7 (unauth / uid อื่น / ผู้ส่ง / member อื่น × ไม่มี token / token ผิด / token ถูก: list, query, get, create, update, delete ปฏิเสธหมด; ทีมงานอ่าน/เขียนได้; เคสเก่าเหมือนกัน) · core S12/S12b/S12c (ลูกค้าถูกต้องอ่าน/ส่งได้) |
| 2 | Storage default ให้ทีมงานเขียนทุก path; propertyPhotos เขียนทับข้ามสมาชิก | ลบ catch-all ของทีมงาน → **default deny**; `casePhotos/` ทีมอ่านได้อย่างเดียว; รูปเผยแพร่ของ flow นี้ย้ายไป `publishedCasePhotos/` (public read, **write ปิดทุกคน**) และเอกสาร `propertyPhotos` ของเคสใหม่ server เขียนเท่านั้น (rules ปฏิเสธ Owner/Staff/เอเจนต์/ผู้ส่ง) | ST2 (ทีมเขียน casePhotos ไม่ได้, ทุกคนเขียน/ลบ publishedCasePhotos ไม่ได้, path แปลกปิดทุกคน) · F8 · e2e (แก้/ลบรูปสาธารณะไม่ได้) — ข้อจำกัด: `propertyPhotos/` ของ **flow เดิม** (Lister Dashboard ฯลฯ) ยังเขียนทับข้ามสมาชิกได้ (ผูกกับชื่อไฟล์ — ต้องเปลี่ยนรูปแบบ path ในรอบแยก) แต่ไม่กระทบรูปของ flow นี้ |
| 3 | copy ไฟล์ก่อน transaction / publish ไม่เช็คซ้ำ | submit: ทุก attempt copy ไป **path เฉพาะ attempt** (`a-<id>`), transaction คนแรกชนะ, attempt ที่แพ้/ล้มลบไฟล์ของตัวเองเท่านั้น · publish: (1) transaction จองสิทธิ์ (`publishOp`, lease 5 นาที) (2) copy ไป path เฉพาะ op (3) transaction สุดท้ายอ่านใหม่ทั้งหมด: op ยังเป็นของเรา, **อนุมัติยังอยู่**, ข้อความสาธารณะยังผ่าน, ชุดรูปไม่เปลี่ยน (ลายเซ็น) แล้วจึงสร้างหน้าสาธารณะ+เอกสารรูป+ประทับผู้อนุมัติพร้อมกัน; ล้มเหลว → ลบไฟล์ของ op, ปล่อย lease · take-down: transaction เดียวลบหน้าสาธารณะ+เอกสารรูป แล้วลบไฟล์; ถ้าสั่งตอนกำลัง publish จะ **ยกเลิก** publish · `reconcileListingFiles` (Owner) ล้างไฟล์กำพร้า | core S2, S2b (แข่งกันคนละ payload/รูป — ผู้ชนะสมบูรณ์, ผู้แพ้ไม่ทิ้งอะไร), S2c (ล้มหลัง copy ก่อน commit → ไม่เหลือ record/ไฟล์, retry สำเร็จ), S9c (อนุมัติถูกถอนระหว่าง copy), S9d (publish vs take-down), S9e (รูปเปลี่ยนระหว่าง publish), S9f (สองคลิกพร้อมกัน), S16 (reconcile) |
| 4 | retry ปลายทาง: refresh / อัปโหลดบางส่วน / ตอบกลับหาย / ร่างแชท | logic ฟอร์มแยกเป็น `owner-form-flow.js`: อัปโหลดรูปทีละรูป **ทันทีที่เลือก** ลง staging (slot สร้างได้ครั้งเดียว), เก็บ ฟิลด์+key+รายการรูป(+thumbnail) ใน localStorage; refresh ได้ทุกอย่างกลับ; submit ซ้ำด้วย key เดิม = เคสเดิม (server ตอบก่อนดู staging); ยืนยันสำเร็จแล้ว refresh เห็นลิงก์จากเครื่อง; กดซ้ำระหว่างส่ง = ส่งครั้งเดียว · เติมจากร่างแชทผ่าน `getPropertyDraft` (ไม่ทับสิ่งที่ลูกค้าพิมพ์) · แก้ฟอร์ม → `updatePropertyDraft` (server ตัดสิน provenance; ค่าที่ Staff แก้ไม่ถูกทับ) · แชทเปิดเคสแล้ว ฟอร์มเติมลงเคสเดิม | recovery R1–R10 (รันกับฟังก์ชันจริง) · e2e E2E-CHAT · core S7 |
| 5 | เคส pending เป็นสาธารณะ / blacklist | เคส pending/draft/offline **ไม่มีเอกสารสาธารณะ**; หน้าสาธารณะสร้างจาก **allow-list** (`PUBLIC_FIELDS`, ฟิลด์ใหม่ในอนาคตไม่เป็นสาธารณะโดยอัตโนมัติ); ข้อความสาธารณะ (title/description/…) ถูกตรวจหาเบอร์/อีเมล/ลิงก์/LINE ก่อน publish และตอน sync (ผิด → ปฏิเสธ `public_text_has_contact_info` Owner แก้แล้วเผยแพร่ใหม่); แก้เคสที่เผยแพร่แล้วต้องผ่าน `syncListingCase` เท่านั้น | core S9 (ฟิลด์นอก allow-list/ข้อมูลภายในไม่ขึ้นสาธารณะ), S9b, S14 · rules F2b/F5 · e2e |
| 6 | Hosting build TEST-only | `tools/build-listing-test.js` + `tests/listing/hosting-build.test.js` (§5) | H1–H6 |

## 3) บทบาท/สิทธิ์ (ทดสอบแล้ว)
ผู้ส่ง ≠ เจ้าของทรัพย์จริง ≠ ผู้รับผิดชอบ ≠ ผู้อนุมัติ — แยกเก็บใน record. บทบาทมาจาก token ฝั่ง server (`resolveActor`) ไม่ใช่ body; Owner เท่านั้นเผยแพร่/ปลดประกาศ/reconcile; ทีมงานเท่านั้น sync/เพิ่มรูป; ไม่มีใคร (รวม Owner) เขียน `listingStatus:"live"`/ตราประทับอนุมัติจากเบราว์เซอร์.

## 4) Photo Standard v1 (LOCKED, BLUEPRINT §32)
ขั้นต่ำ/เป้าหมาย: ที่ดิน 1/3 · คอนโด 2/5 · บ้าน 2/6 · พูลวิลล่า 2/7 · ทาวน์เฮาส์ 2/5 · เชิงพาณิชย์ 2/5. ฟอร์ม+server+Staff gate (`photos_min` CRITICAL ตามประเภท, `photos_target` OPTIONAL) ใช้ชุดเดียวกัน (sync test Y2/Y3). ที่ดิน 1 รูปไม่ถูกบล็อก (R6).

## 5) Hosting build สำหรับโปรเจกต์ TEST (ยังไม่ deploy)
`node tools/build-listing-test.js --config <config.json> --out build/<ชื่อ>` — config ต้องเป็นโปรเจกต์ `huahin-listing-test-<suffix>` (ปฏิเสธ production/prefix อื่น/ค่า placeholder/โดเมน-บัคเก็ต-region ไม่ตรง) · คัดหน้า: index, Owner Submission, Track Submission, Admin Login, Listing Approvals, Staff Workspace, Lister Dashboard, Property Details, Search Results, Home + ไฟล์ที่ import ทั้งหมด (30 ไฟล์ คำนวณ closure อัตโนมัติ) · แทนค่า Firebase config/host ของ Functions, ตัดค่าเริ่มต้นแอดมิน (รหัสผ่านตัวอักษรธรรมดา) และ footer จริง, แทนเบอร์/อีเมล/LINE/โดเมน production ทั้งหมด, noindex ทุกหน้า, guard ของ TEST ก่อนโหลดแอป, **สแกนผลลัพธ์ทุกไฟล์** ถ้ายังเหลือสตริง production = ปฏิเสธไม่เขียนอะไร · ไม่แก้ไฟล์ต้นทาง (ตรวจ hash) · ผลลัพธ์อยู่ใน `build/` (ถูก gitignore).
**ยังไม่ได้ทดสอบ:** หน้าที่ build ออกมาทำงานใน browser จริงหรือไม่ (ทดสอบแค่: ไฟล์ครบตาม import, parse ผ่าน, ไม่มีสตริง production).

## 6) หลักฐานการทดสอบ
`npm run test:listing` = **65 passing / 1 pending** (core 29 · rules 14+ST · e2e 5 · recovery 10 · sync 4 · hosting-build 6 ฯลฯ) · test:sec 96 (5 pending) · test:chat 55 (8 pending) · test:chat-live 34 (12 pending = ชุด browser ที่ไม่ได้รัน) · test:chat-live-gate 21 · test:chat-live-combined 174 (13 pending). expectation เดิมที่ช่องโหว่ถูกปิด (S2a, C5/C6, B1, callsite, GT17, B6) ถูกอัปเดตและระบุในคอมมิต.
**Pending ที่ตั้งใจ:** ST3 — Storage rules ที่ใช้ lookup ข้าม service (ทีมงาน/lister เขียน `propertyPhotos` เดิม) emulator แก้ค่าไม่ได้ ต้องยืนยันบน TEST จริง.

## 7) สิ่งที่ยังไม่ครบ / BLOCKED (ห้ามอ้างว่าเสร็จ)
1. **BLOCKED (ข้อ 2 ก่อนใช้งานจริง):** เคสเดิมใน production ยังมีผู้ติดต่อ+trackToken ใน `properties/{id}` ที่สาธารณะอ่านได้ และรูปรอตรวจแบบเดิมยังอยู่ใน `propertyPhotos` สาธารณะ → ต้อง migration (LEGACY-DATA-PLAN.md) — ห้ามทำบน production ในรอบนี้
2. **ไม่ได้ทดสอบใน browser จริง** ทั้งหน้าฟอร์ม/Track/Approvals/Staff Workspace (แก้โค้ดแล้ว ตรวจ syntax + ตรรกะผ่านชุดทดสอบ แต่ไม่เคยเรนเดอร์); ชุด browser เดิม (SDK 10.14.1 vs 10.12.2) ไม่ได้รัน
3. **Storage cross-service access** (ทีมงาน/lister) ยืนยันไม่ได้ใน emulator
4. หน้าจอ Staff/Owner ยังไม่มี **ตัวอย่างข้อความสาธารณะก่อนกดเผยแพร่** (server บังคับตรวจเบอร์/อีเมล/ลิงก์แล้ว แต่ Owner ยังต้องเห็นข้อความที่จะขึ้นเว็บใน UI — งานถัดไป)
5. เอเจนต์ที่ส่งผ่านฟอร์ม **ไม่เห็นเคสของตัวเองใน Lister Dashboard** (เคสอยู่ใน record ทีมงาน; เห็นได้ผ่านลิงก์ติดตามเท่านั้น); ประกาศที่เอเจนต์สร้างจาก Lister Dashboard (flow เดิม) ยังเป็นเอกสาร `properties` แบบ pending ที่สาธารณะอ่านได้ — ไม่อยู่ใน flow นี้
6. `trackListingCase` ยังไม่มี rate limit ต่อ IP (มีเพดาน 500 ข้อความ/เคส) · รูป/อัปโหลดที่ไม่ถูกส่ง (staging กำพร้า) ยังไม่มี lifecycle rule ของ bucket
7. การลบ/เรียงรูปของเคสที่เป็น record จาก Lister Dashboard ยังไม่รองรับ (เพิ่มได้ผ่าน `addCasePhotos`) · รูปที่ Staff เพิ่มหลังเผยแพร่ขึ้นหน้าสาธารณะเมื่อ Owner ปลด/เผยแพร่ใหม่
8. `profilePhotos` (Firestore) ยังเขียนได้โดยผู้ล็อกอินใดๆ (ช่องโหว่เดิม ไม่เกี่ยวกับ flow นี้)
