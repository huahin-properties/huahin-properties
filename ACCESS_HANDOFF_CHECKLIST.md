> 🔒 **PHS-CLOSE-1 — 8 สิงหาคม 2569 (2026-08-08)** — ปิดงานรอบสุดท้าย: ไฟล์นี้ตรวจสอบแล้วว่าเป็นเวอร์ชันล่าสุดที่ใช้งานจริง ณ รอบส่งมอบนี้ ไม่มีเนื้อหาล้าสมัยหรือขัดแย้งกับไฟล์อื่นในชุดส่งมอบ (ตรวจสอบพร้อมกันทั้ง 23 ไฟล์ในชุด Handoff Package)

---

# ACCESS HANDOFF CHECKLIST — huahin.properties

ไฟล์นี้แยกจากเอกสารอธิบายโครงการ (22 ไฟล์อื่น) — ใช้เป็น checklist สิทธิ์เข้าถึงระบบจริงที่ต้องมอบให้ผู้พัฒนาใหม่/ทีมใหม่ ก่อนเขาจะลงมือทำงานได้จริง อ่านเอกสารอย่างเดียวไม่พอ ต้องได้สิทธิ์เข้าระบบเหล่านี้ด้วย

## ☐ GitHub Repository
- Repo: `huahin-properties/huahin-properties`
- สิ่งที่ต้องทำ: Settings → Collaborators and teams → Add people → ใส่อีเมล/username ผู้พัฒนาใหม่ → เลือกสิทธิ์ Write หรือ Admin
- ผู้ให้สิทธิ์ได้: เจ้าของ repo (CEO)

## ☐ Firebase Console
- โปรเจกต์: `huahin-properties-5f1b5`
- สิ่งที่ต้องทำ: Firebase Console → ⚙️ Project settings → Users and permissions → Add member → ใส่อีเมล → เลือก Role (Editor สำหรับนักพัฒนาทั่วไป, Owner เฉพาะกรณีจำเป็น)
- ครอบคลุม: Firestore, Authentication, Storage, Cloud Functions, Hosting

## ☐ Stripe Dashboard
- สิ่งที่ต้องทำ: Stripe Dashboard → Settings → Team → Invite member → ใส่อีเมล → เลือกสิทธิ์ (Developer หรือ Administrator ตามความเหมาะสม)
- ครอบคลุม: Subscriptions, Checkout, Webhook, Customer Portal settings

## ☐ Anthropic API Key
- **ไม่ต้องส่งกุญแจตรงๆ** — เก็บเป็น Firebase Secret อยู่แล้ว ไม่ปรากฏในโค้ด
- สิ่งที่ผู้พัฒนาใหม่ต้องรู้แค่: กุญแจอยู่ใน Firebase Functions secret (`firebase functions:secrets:set`), หากต้อง rotate ต้องขอกุญแจใหม่จาก CEO แล้ว set ใหม่ + deploy ซ้ำ

## ☐ Domain / DNS (huahin.properties)
- ผู้ดูแล domain ปัจจุบัน: _________________ (ระบุชื่อ/บริษัทผู้จด domain)
- สิ่งที่ต้องทำถ้าต้องแก้ DNS: ติดต่อผู้ดูแล domain ตรงนี้ ไม่ใช่ผ่าน GitHub

## ☐ GitHub Codespaces (สำหรับ deploy Cloud Functions)
- สิ่งที่ต้องทำ: ไม่ต้องตั้งค่าเพิ่ม — ถ้ามีสิทธิ์ Write/Admin บน repo แล้ว เปิด Codespace ได้เอง จาก repo → Code → Codespaces → Create codespace
- คำสั่งที่ต้องรันหลังเปิด Codespace: `firebase login` แล้ว `firebase deploy --only functions`

## หลังมอบสิทธิ์ครบ
ติ๊กครบทุกข้อด้านบนแล้ว = ผู้พัฒนาใหม่พร้อมทำงานจริง ไม่ใช่แค่ "เข้าใจโครงการ" แต่ "ลงมือแก้ไข/deploy ได้จริง" ด้วย
