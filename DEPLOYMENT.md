# วิธีอัปโหลดขึ้น GitHub และเปิดใช้งานผ่าน GitHub Pages (Final Package)

## ขั้นตอนที่ 1 — สร้าง Repository
1. เข้า https://github.com → New repository → ตั้งชื่อ เช่น `huahin-properties-demo` → Public → Create

## ขั้นตอนที่ 2 — อัปโหลดไฟล์
1. "Add file" → "Upload files"
2. ลากไฟล์และโฟลเดอร์ทั้งหมดจาก ZIP ที่แตกแล้ว (รวมถึงโฟลเดอร์ `assets/` ทั้งโฟลเดอร์) เข้าไป — สำคัญ: ต้องอัปโหลดโฟลเดอร์ `assets` ไปด้วย ไม่ใช่แค่ไฟล์ .html
3. Commit changes

## ขั้นตอนที่ 3 — เปิด GitHub Pages
1. Settings → Pages → Source: "Deploy from a branch" → Branch: `main` / `(root)` → Save
2. รอ 1-2 นาที จะได้ลิงก์ เช่น `https://<บัญชี>.github.io/huahin-properties-demo/`

## ทดสอบภายใต้ Subdirectory (สำคัญสำหรับ Final Fix 1)
ทุก path ในไฟล์นี้เป็น relative path (`./assets/...`) จึงใช้งานได้ทั้งที่ root domain และที่ subdirectory ของ GitHub Pages (`username.github.io/repo-name/`) — ทดสอบแล้วว่า index.html, workspace.html และ packages.html โหลด asset ได้ถูกต้องจาก path สัมพัทธ์ (ดู RESPONSIVE-QA.md สำหรับขอบเขตที่ตรวจสอบจริง)

## อัปเดตเว็บไซต์ภายหลัง
Upload ไฟล์ที่เปลี่ยนแปลงซ้ำ → Commit → GitHub Pages อัปเดตอัตโนมัติภายในไม่กี่นาที

## แก้ปัญหาเบื้องต้น
- **หน้าเว็บว่างเปล่า**: ตรวจว่าโฟลเดอร์ `assets/` (css, js) ถูกอัปโหลดครบและอยู่ตำแหน่งเดียวกับไฟล์ .html
- **ภาษาไม่เปลี่ยน**: ตรวจว่า `assets/js/i18n.js` โหลดก่อน `assets/js/app.js` (ลำดับใน `<head>` ต้องไม่ถูกสลับ)
- **ลิงก์ favorites.html/addons.html เปิดแล้วเด้งไปหน้าอื่น**: เป็นพฤติกรรมที่ตั้งใจ — หน้าเหล่านี้ redirect ไปยัง tab ที่ถูกต้องใน workspace.html/resources.html (ดู README.md หัวข้อ "Pages")

## หมายเหตุสำคัญ
เว็บไซต์นี้เป็น **Frontend Demo** เท่านั้น ไม่เชื่อมต่อ Firebase, ฐานข้อมูลจริง, ระบบชำระเงินจริง หรือ AI จริง
