# ทำไมต้องมีชุดนี้

จากภาพหน้าจอที่คุณส่งมา: ปุ่มดาวน์โหลดของไฟล์เหล่านี้บนเว็บไซต์จริง (huahin.properties) ขึ้น
"File wasn't available on site" — เพราะไฟล์เหล่านี้ **ยังไม่เคยถูกอัปโหลดขึ้น GitHub จริง**
(ไม่ใช่โค้ดลิงก์ผิด) ไฟล์ .md อื่นๆ ที่เคยอัปโหลดไปแล้วก่อนหน้านี้ (เช่น BLUEPRINT.md, CLAUDE.md,
START HERE.md ฯลฯ) ดาวน์โหลดได้ปกติ

ชุดนี้คือเฉพาะ **12 ไฟล์ที่ยังขาดอยู่บนเว็บไซต์จริง** เท่านั้น (ไม่ต้องอัปโหลดไฟล์อื่นซ้ำ):

## ไฟล์ระดับ root (2 ไฟล์) — ลากไปวางที่หน้าแรกของ repo
- PROJECT_SNAPSHOT.md
- HUAHIN_PROPERTIES_MASTER_HANDOFF.md

## โฟลเดอร์ docs/ceo-handoff/ (10 ไฟล์) — ลากทั้งโฟลเดอร์ `docs` เข้าไปพร้อมกันทีเดียว
(อยู่ในชุดนี้ที่ path `docs/ceo-handoff/...` แล้ว ลากทั้งโฟลเดอร์ `docs` ทั้งก้อนเข้า GitHub)
- CEO_ASSISTANT_START_HERE.md
- CEO_WORKING_GUIDE.md
- CLAUDE_WORKING_GUIDE.md
- CURRENT_PHASE_STATUS.md
- DOCUMENT_INDEX.md
- HANDOFF_CHECKLIST.md
- KNOWN_ISSUES.md
- NEW_CHAT_BOOTSTRAP_PROMPT.md
- PROJECT_CONTEXT_SNAPSHOT.md
- PROJECT_OPERATING_STANDARD.md

## ขั้นตอน
1. เปิด GitHub → Add file → Upload files
2. ลากไฟล์ `PROJECT_SNAPSHOT.md` และ `HUAHIN_PROPERTIES_MASTER_HANDOFF.md` วางที่ root
3. ลากทั้งโฟลเดอร์ `docs` (ที่มี `ceo-handoff` อยู่ข้างใน) วางพร้อมกันในหน้าเดียวกัน — GitHub จะสร้าง `docs/ceo-handoff/...` ให้เอง
4. Commit changes
5. รอ GitHub Actions/Pages build เขียว แล้วกดปุ่มดาวน์โหลดแต่ละไฟล์ในหน้า CEO Guide อีกครั้ง ต้องไม่ขึ้น "File wasn't available on site" อีก
6. กด "ดาวน์โหลดทั้งหมด (ZIP)" อีกครั้ง — ต้องสำเร็จไม่มี error แล้ว (ก่อนหน้านี้ error ที่ PROJECT_SNAPSHOT.md เพราะไฟล์นี้ขาดอยู่)
