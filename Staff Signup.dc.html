<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600&family=Work+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
  <title>Staff Signup — huahin.properties</title>
  <style>
    body { margin: 0; background: oklch(96% 0.015 75); font-family: 'Work Sans', sans-serif; }
  </style>
</helmet>

<div style="min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; box-sizing:border-box;">
  <div style="width:100%; max-width:400px; background:white; border-radius:10px; padding:clamp(28px,5vw,40px); box-shadow:0 20px 50px -30px rgba(30,20,10,0.25);">
    <div style="text-align:center; margin-bottom:24px;">
      <img src="logo.png" style="height:48px; width:48px; border-radius:50%; object-fit:contain; margin-bottom:10px;" />
      <div style="font-family:'Playfair Display',serif; font-size:20px; color:oklch(20% 0.02 60);">สมัครบัญชี Staff</div>
      <div style="font-size:13px; color:oklch(50% 0.02 60); margin-top:4px;">ใช้อีเมลเดียวกับที่ Owner เชิญไว้เท่านั้น</div>
    </div>

    <sc-if value="{{ done }}">
      <div style="text-align:center; padding:20px 0;">
        <div style="font-size:32px; margin-bottom:10px;">✅</div>
        <div style="font-size:15px; color:oklch(25% 0.02 60);">สมัครสำเร็จ! เข้าใช้งานได้แล้ว</div>
        <a href="Admin Dashboard.dc.html" style="display:inline-block; margin-top:16px; background:oklch(22% 0.02 60); color:white; padding:10px 24px; border-radius:6px; font-size:14px; text-decoration:none;">ไปที่แดชบอร์ด</a>
      </div>
    </sc-if>

    <sc-if value="{{ notDone }}" hint-placeholder-val="{{ true }}">
      <div style="display:flex; flex-direction:column; gap:12px;">
        <input type="email" value="{{ email }}" onChange="{{ onEmail }}" placeholder="อีเมลที่ Owner เชิญ" style="border:1px solid oklch(85% 0.01 70); border-radius:4px; padding:11px 13px; font-size:14px; font-family:inherit;" />
        <input type="text" value="{{ password }}" onChange="{{ onPassword }}" placeholder="ตั้งรหัสผ่าน (อย่างน้อย 6 ตัว)" style="border:1px solid oklch(85% 0.01 70); border-radius:4px; padding:11px 13px; font-size:14px; font-family:inherit;" />
        <div onClick="{{ onSubmit }}" style="background:oklch(22% 0.02 60); color:white; text-align:center; padding:13px; border-radius:6px; font-size:14px; font-weight:600; cursor:pointer;">{{ submitLabel }}</div>
        <sc-if value="{{ error }}"><div style="font-size:13px; color:oklch(50% 0.18 30); text-align:center;">{{ error }}</div></sc-if>
      </div>
    </sc-if>
  </div>
</div>

</x-dc>
<script type="text/x-dc" data-dc-script>
class Component extends DCLogic {
  state = { email: "", password: "", error: "", submitting: false, done: false };

  async submit() {
    const email = this.state.email.trim().toLowerCase();
    if (!email.includes("@") || this.state.password.length < 6) {
      this.setState({ error: "กรอกอีเมล+รหัสผ่านให้ครบ (รหัสผ่านอย่างน้อย 6 ตัว)" });
      return;
    }
    this.setState({ submitting: true, error: "" });
    try {
      const fb = await import("./firebase-client.js");
      await fb.createListerAccount(email, this.state.password); // reuses the same createUserWithEmailAndPassword helper
      await fb.completeStaffSignup(email);
      this.setState({ done: true, submitting: false });
    } catch (e) {
      const msg = (e && e.code === "auth/email-already-in-use")
        ? "อีเมลนี้มีบัญชีอยู่แล้ว ลองเข้าสู่ระบบที่ Admin Login แทน"
        : "สมัครไม่สำเร็จ — ตรวจสอบว่า Owner เชิญอีเมลนี้ไว้แล้วหรือยัง";
      this.setState({ error: msg, submitting: false });
    }
  }

  renderVals() {
    return {
      email: this.state.email, onEmail: (e) => this.setState({ email: e.target.value }),
      password: this.state.password, onPassword: (e) => this.setState({ password: e.target.value }),
      onSubmit: () => this.submit(), submitLabel: this.state.submitting ? "กำลังสมัคร…" : "สมัครเลย",
      error: this.state.error, done: this.state.done, notDone: !this.state.done,
    };
  }
}

</script>
</body>
</html>
