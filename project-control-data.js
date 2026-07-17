// Central data source for CEO Dashboard's "Project Control Center" tab.
// Edit MODULES here — the page renders straight from this array, nothing
// module-related is hardcoded in the .dc.html template. Add/remove/reorder
// by editing this array; each module's fields map directly to the UI.
export const MODULES = [
  {
    num: "00", th: "กติกาและวิธีทำงานของโครงการ", en: "Project Rules & Workflow",
    lastUpdated: "17/07/2569",
    currentState: "Chat ใช้สำหรับสนทนา วิเคราะห์ ตรวจงาน และตัดสินใจ\nProject Control เป็นแหล่งเก็บข้อมูลและข้อสรุปหลักของโครงการ\nเมื่อมีข้อสรุปสำคัญ ต้องอัปเดต Module ที่เกี่ยวข้อง\nหนึ่งการตัดสินใจสำคัญ ต้องมีหนึ่งการบันทึก\nข้อมูลเก่าสามารถแก้ ลบ หรือแทนที่ได้ เมื่อมีแนวทางใหม่ที่ดีกว่า",
    completed: "Workflow ตกลงร่วมกัน:\n1. CEO กำหนดทิศทางและอนุมัติ\n2. ChatGPT วางแผน ตรวจงาน และกำหนด Module ที่ต้องอัปเดต\n3. Development AI พัฒนา ทดสอบ และรายงาน\n4. อัปเดต Project Control\n5. CEO ตรวจ\n6. จึง Deploy เมื่อได้รับอนุมัติ",
    openItems: "",
    decisions: "",
    nextStep: "",
  },
  {
    num: "01", th: "ตรวจงานและรายงานการพัฒนา", en: "Development Review & Reports",
    lastUpdated: "17/07/2569",
    currentState: "Core Feature Audit กำลังดำเนินไปทีละโมดูล",
    completed: "Admin Dashboard ตรวจและปิดงานแล้ว\nOwners Management ตรวจและปิดงานแล้ว\nพบ P0 จาก global setDoc overwrite\nเปลี่ยนแนวทาง partial update เป็น merge semantics\nตรวจผลกระทบของ call sites และเพิ่ม helper naming สำหรับ create/update/replace",
    openItems: "Listing Approvals Responsive Testing ยังไม่เสร็จ\nต้องกลับมาตรวจต่อหลัง Project Control พร้อมใช้งาน",
    decisions: "",
    nextStep: "กลับไปทำ Listing Approvals Responsive Testing",
  },
  {
    num: "02", th: "ธุรกิจและรายได้", en: "Business & Revenue",
    lastUpdated: "17/07/2569",
    currentState: "Placeholder — ยังไม่มีข้อมูลบันทึกในโมดูลนี้",
    completed: "", openItems: "", decisions: "", nextStep: "",
  },
  {
    num: "03", th: "ประสบการณ์ผู้ใช้และหน้าตาเว็บไซต์", en: "UX/UI",
    lastUpdated: "17/07/2569",
    currentState: "Placeholder — ยังไม่มีข้อมูลบันทึกในโมดูลนี้",
    completed: "", openItems: "", decisions: "", nextStep: "",
  },
  {
    num: "04", th: "การตลาดและ SEO", en: "Marketing & SEO",
    lastUpdated: "17/07/2569",
    currentState: "Placeholder — ยังไม่มีข้อมูลบันทึกในโมดูลนี้",
    completed: "", openItems: "", decisions: "", nextStep: "",
  },
  {
    num: "05", th: "ปัญหา ความเสี่ยง และความปลอดภัย", en: "Bugs, Risks & Security",
    lastUpdated: "17/07/2569",
    currentState: "P0 data-loss bug แก้แล้ว, รอ cleanup งานทดสอบค้าง",
    completed: "P0: global setDoc overwrite สามารถล้างข้อมูล property document ได้\nมีการแก้ wrapper ให้ partial update ใช้ merge\nมีการตรวจ call sites ที่เสี่ยง",
    openItems: "ตรวจ regression จากการเปลี่ยน global merge semantics\nQA test leftovers ต้อง Cleanup\nQA Auth accounts ต้อง Cleanup ผ่าน Firebase Console",
    decisions: "HH-58538 เป็นข้อมูล QA/Test แบบสุ่ม ไม่ใช่ทรัพย์จริง — การตัดสินใจล่าสุดคือ \"ลบทั้งหมด\" ไม่ต้อง Restore/Archive/Hidden/Recovery Note การลบต้องครอบคลุม property document, propertyPhotos และ Storage files ที่เกี่ยวข้อง — ยังห้ามลบจนกว่าจะได้รับคำสั่ง Production Write แยกต่างหาก",
    nextStep: "รอคำสั่ง Production Write เพื่อลบ HH-58538",
  },
  {
    num: "06", th: "คลังคำสั่งสำหรับ AI", en: "AI Prompt Library",
    lastUpdated: "17/07/2569",
    currentState: "Placeholder — ยังไม่มีข้อมูลบันทึกในโมดูลนี้",
    completed: "", openItems: "", decisions: "", nextStep: "",
  },
  {
    num: "07", th: "แผนงานและ Sprint ปัจจุบัน", en: "Roadmap & Current Sprint",
    lastUpdated: "17/07/2569",
    currentState: "Current Priority: Project Control Center — Initial Structure\nPaused temporarily: Listing Approvals Responsive Testing",
    completed: "",
    openItems: "Open Items หลัง Project Control พร้อม:\n1. กลับไปทำ Listing Approvals Responsive Testing\n2. ลบ HH-58538 เมื่อ CEO อนุมัติ Production Write โดยตรง\n3. ยืนยันรหัส Demo Listings จำนวน 22 รายการ\n4. Cleanup QA test documents/accounts\n5. ตรวจผลกระทบของ setDoc merge semantics รอบสุดท้าย",
    decisions: "", nextStep: "",
  },
  {
    num: "08", th: "บันทึกการตัดสินใจ", en: "Decision Log",
    lastUpdated: "17/07/2569",
    currentState: "",
    completed: "",
    openItems: "",
    decisions: "อนุมัติให้สร้าง Project Control Center ภายใน CEO Dashboard\nอนุมัติ Module เริ่มต้น 00–08 และ 99\nอนุมัติระบบ Copy Module และ Copy All Modules\nอนุมัติให้ใช้ Project Control เป็นแหล่งข้อมูลหลักของโครงการ\nอนุมัติให้ค่อยๆ เติม แก้ ลบ และปรับข้อมูลภายหลังได้\nอนุมัติให้ ChatGPT เสนอการเพิ่ม ลด รวม หรือเปลี่ยน Module ตามความจำเป็น โดยแจ้ง CEO ก่อนการเปลี่ยนโครงสร้างสำคัญ\nHH-58538 เป็น QA/Test Data และต้องลบ ไม่ใช่ซ่อนหรือกู้คืน\nงาน Listing Approvals ถูกพักชั่วคราว เพื่อสร้าง Project Control ก่อน",
    nextStep: "",
  },
  {
    num: "99", th: "คู่มือการทำงานร่วมกับ AI", en: "AI Collaboration Guide",
    lastUpdated: "17/07/2569",
    currentState: "CEO: กำหนดวิสัยทัศน์ / ตัดสินใจ / อนุมัติการเปลี่ยนแปลง / อนุมัติ Production Write และ Deploy\n\nChatGPT: วางแผนโครงการ / ตรวจงาน Development AI / ตรวจ UX, Business, Cost, SEO, Security และความเสี่ยง / กำหนดว่าเรื่องใดต้องอัปเดต Module ไหน / ดูแล Documentation และความต่อเนื่องของโครงการ\n\nDevelopment AI: พัฒนาและแก้ไขโค้ด / ทดสอบ / Backup / รายงานไฟล์ที่เปลี่ยน / อัปเดต Project Control ตามข้อสรุปที่ได้รับอนุมัติ / ห้าม Production Write หรือ Deploy โดยไม่มีคำสั่งชัดเจน",
    completed: "", openItems: "", decisions: "", nextStep: "",
  },
];
