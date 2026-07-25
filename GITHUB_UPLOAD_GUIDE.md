# GitHub Upload Guide — Documentation Hotfix v1.0.1

## ✅ Checklist ก่อนปิดงาน (ทำตามลำดับ แล้วติ๊กให้ครบ)

☐ START HERE.md — upload แล้ว
☐ HANDOVER PROMPT.md — upload แล้ว
☐ PROJECT_SNAPSHOT.md — upload แล้ว
☐ HUAHIN_PROPERTIES_MASTER_HANDOFF.md — upload แล้ว
☐ BLUEPRINT.md — upload แล้ว
☐ CEO GUIDE.md — upload แล้ว
☐ RELEASE CHECKLIST.md — upload แล้ว
☐ OPERATION MANUAL.md — upload แล้ว
☐ HANDOVER TEST PROCEDURE.md — upload แล้ว
☐ CLAUDE.md (เปลี่ยนชื่อจากไฟล์ "CLAUDE (rename to CLAUDE.md before upload).md" แล้ว) — upload แล้ว
☐ docs/ — โฟลเดอร์ถูกสร้างจริงบน GitHub
☐ docs/ceo-handoff/ — โฟลเดอร์ถูกสร้างจริง มีไฟล์ครบ 10 ไฟล์ (รวม NEW_CHAT_BOOTSTRAP_PROMPT.md และ CEO_ASSISTANT_START_HERE.md)
☐ Commit แล้ว
☐ GitHub Actions build — ขึ้นเครื่องหมายถูกสีเขียว (PASS)
☐ GitHub Pages เปิดได้จริง (PASS)
☐ ทดสอบกดทุกปุ่มใน CEO Guide → Quick Actions → PHS Document Center แล้ว ไม่มี 404

## ทำไมต้องทำสิ่งนี้
หน้า `.dc.html` ทั้งหมดอยู่บน GitHub Pages แล้วและใช้งานได้ปกติ
แต่ไฟล์ `.md` และโฟลเดอร์ `docs/ceo-handoff/` ยังไม่เคยถูกอัปโหลดขึ้น GitHub
จึงทำให้ทุกลิงก์ที่ชี้ไปยังไฟล์เหล่านั้นขึ้น 404

## ขั้นตอน

### 1. เปิด Repository
เข้า GitHub → เปิด repository ของเว็บไซต์ huahin.properties

### 2. ตรวจสอบ Branch
ดูแถบด้านซ้ายบนของหน้ารายการไฟล์ ต้องเป็น branch ที่ GitHub Pages ใช้ deploy อยู่
(ปกติคือ `main` — ถ้าไม่แน่ใจ เช็คที่ Settings → Pages ว่า deploy จาก branch ไหน)

### 3. Upload ไฟล์ระดับ root
- กด **Add file → Upload files**
- ลาก/เลือกไฟล์ `.md` ทั้งหมดจากโฟลเดอร์ `export-for-github/` (ไม่ต้องรวมโฟลเดอร์ย่อย)
- **สำคัญ**: ไฟล์ชื่อ `CLAUDE (rename to CLAUDE.md before upload).md` ต้อง **เปลี่ยนชื่อเป็น `CLAUDE.md`** ก่อน upload (ลากเข้าไปแล้วกดที่ชื่อไฟล์ในหน้า GitHub เพื่อแก้ไขชื่อได้ หรือเปลี่ยนชื่อในเครื่องก่อนแล้วค่อยลากเข้า)

### 4. Upload โฟลเดอร์ docs/ceo-handoff/ (ขั้นตอนที่มักพลาด)
GitHub เว็บ UI ไม่ให้ลากทั้งโฟลเดอร์ตรงๆ เข้าไปสร้างเป็น subfolder ได้ตรงๆ ในบางเบราว์เซอร์ — วิธีที่ชัวร์ที่สุด:
- อยู่ในหน้า Upload files เดิม (หน้าเดียวกับข้อ 3)
- ลากไฟล์ทั้ง 10 ไฟล์จาก `export-for-github/docs/ceo-handoff/` เข้าไปที่ช่อง upload **พร้อมกันทั้งโฟลเดอร์** (ลากทั้งโฟลเดอร์ `ceo-handoff` จาก File Explorer/Finder โดยตรง ไม่ใช่ไฟล์ทีละไฟล์) — GitHub จะสร้างโครงสร้าง `docs/ceo-handoff/...` ให้อัตโนมัติ
- หลัง upload เสร็จ ให้เช็คในหน้ารายการไฟล์ของ repo ว่ามีโฟลเดอร์ `docs` → `ceo-handoff` จริง และมี 10 ไฟล์ข้างในครบ

**⚠️ ข้อควรระวังสำคัญ**: ต้องลากทั้งโฟลเดอร์ `ceo-handoff` (ทั้งโฟลเดอร์ ไม่ใช่ไฟล์ข้างในทีละไฟล์) เข้าไปในช่อง Upload พร้อมกันครั้งเดียว — ถ้าลากเฉพาะไฟล์ .md ข้างในโดยไม่ลากทั้งโฟลเดอร์ ไฟล์จะถูกอัปโหลดไปอยู่ที่ root แทนที่จะอยู่ใน `docs/ceo-handoff/` ทำให้ลิงก์ในเว็บไซต์ยังคง 404 เหมือนเดิม

### 5. Commit
- เลื่อนลงล่างสุดของหน้า Upload files
- ใส่ commit message เช่น `Fix: add missing documentation files (v1.0.1 hotfix)`
- กด **Commit changes**

### 6. รอ GitHub Pages Build
- ไปที่แท็บ **Actions** ของ repo รอจนสถานะ build ล่าสุดขึ้นเครื่องหมายถูกสีเขียว (ปกติ 1-2 นาที)

### 7. ตรวจสอบผลหลัง Upload
เปิดลิงก์เหล่านี้ทีละอัน (ต้องไม่ขึ้น 404):
- `huahin.properties/START%20HERE.md`
- `huahin.properties/HANDOVER%20PROMPT.md`
- `huahin.properties/PROJECT_SNAPSHOT.md`
- `huahin.properties/HUAHIN_PROPERTIES_MASTER_HANDOFF.md`
- `huahin.properties/BLUEPRINT.md`
- `huahin.properties/docs/ceo-handoff/NEW_CHAT_BOOTSTRAP_PROMPT.md`
- `huahin.properties/docs/ceo-handoff/CEO_ASSISTANT_START_HERE.md`

จากนั้นทดสอบ Flow จริง: CEO Guide → Quick Actions → PHS Document Center → กดทุกปุ่ม
ต้องไม่มี 404 / Missing File / Broken Link

เมื่อครบทุกข้อ ถือว่า Hotfix v1.0.1 เสร็จสมบูรณ์
