// BROWSER-LOCAL-01 — real Chromium + real DC runtime + pinned Firebase SDK 10.12.2 against the BUILT listing TEST site and LOCAL emulators (incl. the real Functions code).
// Synthetic data. Evidence class: LOCAL BROWSER + LOCAL EMULATORS (not a real TEST project; no production host; no real AI). Screenshots: docs/listing-e2e/browser-local/.
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const H = require("./harness");

const FUNCTIONS_DIR = path.join(H.ROOT, "functions");
const admin = require(require.resolve("firebase-admin", { paths: [FUNCTIONS_DIR] }));
const PASS = "Synthetic-pass-123";
const RESULTS = []; // one row per check, written to docs/listing-e2e/browser-local/RESULTS.md at the end
const rec = (id, title, status, note) => { RESULTS.push({ id, title, status, note: note || "" }); };
const KNOWN_BENIGN = [/%7B%7B/, /fonts\./]; // DC template placeholders requested as <img src="{{ … }}"> before binding (pre-existing), blocked web fonts

let site, browser, db, auth, bucket;
const ids = {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function mkUser(email, uid, extra) { await auth.createUser(Object.assign({ email, password: PASS, emailVerified: true }, uid ? { uid } : {}, extra || {})); return (await auth.getUserByEmail(email)).uid; }
async function waitFor(fn, ms, label) { const t0 = Date.now(); for (;;) { const v = await fn(); if (v) return v; if (Date.now() - t0 > (ms || 15000)) throw new Error("timeout waiting for " + (label || "condition")); await sleep(250); } }
const cases = async () => (await db.collection("caseInternal").get()).docs.map((d) => ({ id: d.id, ...d.data() }));

async function ownerFormFill(page, o) {
  await page.waitForSelector("text=ถัดไป");
  await page.locator("input").nth(0).fill(o.name); await page.locator("input").nth(1).fill(o.phone);
  await page.getByText("ถัดไป →").click(); await page.waitForSelector("text=ต้องการฝากขายหรือฝากเช่า", { timeout: 15000 });
  await page.getByText(o.txn === "rent" ? "ฝากเช่า" : "ฝากขาย", { exact: true }).click(); await page.getByText("ถัดไป →").click();
  await page.waitForSelector('select:has(option[value="villa"])');
  await page.locator('select:has(option[value="villa"])').selectOption(o.type || "house");
  if (o.subtype) await page.locator('select:has(option[value="shophouse"])').selectOption(o.subtype);
  if (o.area !== "") await page.locator('select:has(option[value="hua-hin"])').selectOption(o.area || "hua-hin");
  if (o.appraisal) await page.locator("input[type=checkbox]").check(); else await page.locator("input[type=number]").fill(String(o.price || 7500000));
  if (o.description) await page.locator("textarea").fill(o.description);
}
async function uploadPhotos(page, n, from) {
  const before = await page.evaluate(() => (JSON.parse(localStorage.getItem("hhOwnerForm.v1") || "{}").slots || []).length);
  await page.locator("input[type=file]").first().setInputFiles(H.files(n, from));
  await waitFor(async () => (await page.evaluate(() => (JSON.parse(localStorage.getItem("hhOwnerForm.v1") || "{}").slots || []).length)) >= before + n, 20000, "photo uploads");
}
async function goReview(page) { await page.getByText("ถัดไป →").click(); await page.waitForSelector("text=ส่งข้อมูล"); }
const trackUrlOf = async (page) => page.evaluate(() => {
  const cands = Array.from(document.querySelectorAll("a,input,textarea")).map((e) => e.href || e.value || "").concat([document.body.innerText]);
  for (const c of cands) { const m = String(c).match(/https?:\/\/[^\s"']*Track%20Submission[^\s"']*/); if (m) return m[0]; }
  return null; });

async function newPage(ctxOpts, name) {
  const ctx = await H.newContext(browser, site, ctxOpts); const page = await ctx.newPage(); H.watch(page, name || "page"); return { ctx, page };
}
async function loginAdmin(page, email) {
  await page.goto(site.url + "/Admin%20Login.dc.html"); await page.waitForSelector("input[type=email]");
  await page.waitForFunction(() => window.firebase && window.firebase.auth && window.firebase.firestore, null, { timeout: 30000 }); await sleep(800);
  await page.locator("input[type=email]").fill(email); await page.locator("input").nth(1).fill(PASS);
  await page.getByText(/Sign In|เข้าสู่ระบบ/).last().click();
  await page.waitForURL(/Admin%20Dashboard|Listing%20Approvals|Staff%20Workspace/, { timeout: 30000 });
}
// What is NOT a problem: the DC template placeholders requested as <img src="{{ … }}"> before binding (pre-existing), and the gated CHAT functions answering 401/403 on the
// listing TEST project (they are optional, need the allow-list and a secret; the form swallows the refusal by design). Everything else must be empty.
const GATED_CHAT = /\/(getPropertyDraft|updatePropertyDraft|receptionTurn|claudeComplete|createCaseFromConversation|startConversation|sendConversationTurn)\b/;
async function loginAgent(page, email) {
  await page.goto(site.url + "/Agent%20Signup.dc.html"); await page.waitForSelector("text=เข้าสู่ระบบ");
  // (the page routes a member whose profile could not be read yet to the billing page; a human never clicks within the first moments, a script must wait for the SDK)
  await page.waitForFunction(() => window.firebase && window.firebase.auth && window.firebase.firestore, null, { timeout: 30000 }); await sleep(800);
  const tabs = page.getByText("เข้าสู่ระบบ", { exact: true }); await tabs.first().click();
  await page.waitForSelector("input[type=password]");
  await page.locator("input[type=email]").last().fill(email); await page.locator("input[type=password]").last().fill(PASS);
  await tabs.last().click(); await page.waitForURL(/Agent%20Profile|Lister%20Dashboard/, { timeout: 30000 });
}
const unexpected = (logs, allow) => []
  .concat(logs.pageerrors.map((m) => "pageerror: " + m))
  .concat(logs.failed.filter((m) => !/fonts\./.test(m) && !/gstatic\.com\/firebasejs\/[^ ]* :: net::ERR_ABORTED/.test(m) && !/Firestore\/(Listen|Write)\/channel.*ERR_ABORTED/.test(m) && !/^GET http:\/\/127\.0\.0\.1:\d+\/[^ ]*\.(js|png|html)[^ ]* :: net::ERR_ABORTED/.test(m) && !(allow || []).some((re) => re.test(m))).map((m) => "requestfailed: " + m))
  .concat(logs.bad.filter((m) => !/%7B%7B/.test(m) && !(GATED_CHAT.test(m) && /^(401|403|404|400|500)/.test(m))).map((m) => "http: " + m))
  .concat(logs.console.filter((m) => /^error/.test(m) && !/Failed to load resource/.test(m)).map((m) => "console: " + m));

describe("BROWSER-LOCAL-01 — built TEST site in real Chromium against local emulators (synthetic)", function () {
  this.timeout(240000);
  before(async () => {
    admin.initializeApp({ projectId: H.PROJECT });
    db = admin.firestore(); auth = admin.auth();
    bucket = admin.storage().bucket(H.CFG.storageBucket);
    site = await H.startSite(); browser = await H.launch();
    ids.owner = await mkUser("owner@example.test", H.OWNER_UID); await db.doc("adminUsers/" + ids.owner).set({ role: "owner", email: "owner@example.test", displayName: "Synthetic Owner" });
    ids.staff = await mkUser("staff@example.test"); await db.doc("adminUsers/" + ids.staff).set({ role: "staff", email: "staff@example.test", displayName: "Synthetic Staff" });
    ids.agent = await mkUser("agent@example.test"); await db.doc("listers/" + ids.agent).set({ displayName: "Synthetic Agent", email: "agent@example.test", status: "active", tier: "trial", trialUsed: true, trialEndsAt: Date.now() + 30 * 86400000, createdAt: Date.now(), emailVerified: true });
    ids.agent2 = await mkUser("agent2@example.test"); await db.doc("listers/" + ids.agent2).set({ displayName: "Synthetic Agent 2", email: "agent2@example.test", status: "active", tier: "trial", trialUsed: true, trialEndsAt: Date.now() + 30 * 86400000, createdAt: Date.now(), emailVerified: true });
  });
  after(async () => {
    if (browser) await browser.close(); if (site) await site.close();
    fs.mkdirSync(H.SHOTS, { recursive: true });
    const lines = ["# BROWSER-LOCAL-01 — results (generated)", "", "Evidence class: **LOCAL BROWSER (Chromium + real DC runtime + Firebase SDK 10.12.2) + LOCAL EMULATORS (Firestore, Auth, Storage, real Functions code)**. Synthetic data. Not a real TEST project. No production host, no real AI.", "", "| id | check | status | note |", "|---|---|---|---|"]
      .concat(RESULTS.map((r) => "| " + r.id + " | " + r.title + " | " + r.status + " | " + String(r.note).replace(/\|/g, "/").replace(/\n/g, " ") + " |"));
    fs.writeFileSync(path.join(H.SHOTS, "RESULTS.md"), lines.join("\n") + "\n");
  });

  it("B1 outsider (anonymous) submits through the real form: 3 steps, 2 photos uploaded to private staging, ONE private case, nothing public", async () => {
    const { ctx, page } = await newPage({}, "outsider");
    await page.goto(site.url + "/Owner%20Submission.dc.html");
    await ownerFormFill(page, { name: "Synthetic Outsider", phone: "0800000001", type: "house", price: 7500000, description: "Quiet 3-bedroom house near the beach." });
    await H.shot(page, "01-outsider-form-step3-filling");
    await uploadPhotos(page, 2);
    await page.waitForSelector("text=อัปโหลดแล้ว 2 รูป"); await H.shot(page, "02-outsider-form-photos-uploaded");
    await goReview(page); await H.shot(page, "03-outsider-form-review");
    await page.getByText("ส่งข้อมูล", { exact: true }).click();
    await page.waitForSelector("text=ส่งข้อมูลสำเร็จ", { timeout: 30000 });
    await H.shot(page, "04-outsider-submitted-track-link");
    const url = await trackUrlOf(page); assert.ok(url && /[?&]t=/.test(url), "the confirmation shows the private tracking link");
    const all = await cases(); assert.strictEqual(all.length, 1);
    const c = all[0]; ids.outsiderCase = c.id; ids.outsiderTrack = url;
    assert.strictEqual(c.listingStatus, "pending"); assert.strictEqual(c.submittedByRole, "external"); assert.strictEqual(c.contactPhone, "0800000001"); assert.strictEqual(c.photoCount, 2);
    assert.strictEqual((await db.doc("properties/" + c.id).get()).exists, false, "no public document");
    assert.strictEqual((await db.collection("propertyPhotos").get()).size, 0, "no public photo");
    const [files] = await bucket.getFiles({ prefix: "casePhotos/" + c.id + "/" }); assert.strictEqual(files.length, 2);
    const [stage] = await bucket.getFiles({ prefix: "caseUploads/" }); assert.strictEqual(stage.length, 0, "staging removed after submit");
    assert.deepStrictEqual(unexpected(page.__logs), [], "unexpected browser problems");
    assert.deepStrictEqual(ctx.__log.prodHits, [], "no production host was requested");
    rec("B1", "outsider form → private case, photos in private storage, nothing public", "PASS (local browser + emulators)", "case " + c.id + "; console/failed lists in B0 summary");
    await ctx.close();
  });

  it("B2 retry + refresh: photos upload once when chosen, a refresh restores form + photos, a LOST submit response is repeated into the SAME case, and a finished form survives a refresh", async () => {
    const { ctx, page } = await newPage({}, "retry");
    const before = (await cases()).length;
    let submitReqs = 0, dropNext = true;
    await ctx.route("**/asia-southeast1/submitListingCase", async (route) => { submitReqs++; if (dropNext) { dropNext = false; await route.fetch(); return route.abort("failed"); } return route.continue(); });
    await page.goto(site.url + "/Owner%20Submission.dc.html");
    await ownerFormFill(page, { name: "Synthetic Retry", phone: "0800000002", type: "villa", price: 12000000, description: "Pool villa with garden." });
    await uploadPhotos(page, 1);
    const key1 = await page.evaluate(() => JSON.parse(localStorage.getItem("hhOwnerForm.v1")).key);
    // ── refresh in the middle ──
    await page.reload(); await page.waitForSelector("text=ถัดไป");
    const restored = await page.evaluate(() => { const s = JSON.parse(localStorage.getItem("hhOwnerForm.v1")); return { key: s.key, slots: s.slots.length, desc: s.fields.description, price: s.fields.price, name: s.fields.name }; });
    assert.deepStrictEqual([restored.key, restored.slots, restored.desc, restored.price, restored.name], [key1, 1, "Pool villa with garden.", "12000000", "Synthetic Retry"]);
    await waitFor(async () => (await page.locator("input").nth(0).inputValue()) === "Synthetic Retry", 15000, "restored name in the input");
    await H.shot(page, "05-retry-after-refresh-step1-restored");
    await page.getByText("ถัดไป →").click(); await page.waitForSelector("text=ต้องการฝากขายหรือฝากเช่า");
    await page.getByText("ฝากขาย", { exact: true }).click(); await page.getByText("ถัดไป →").click();
    await page.waitForSelector("text=อัปโหลดแล้ว 1 รูป"); await H.shot(page, "06-retry-after-refresh-step3-photo-kept");
    await uploadPhotos(page, 1, 1);
    const [staged] = await bucket.getFiles({ prefix: "caseUploads/" }); assert.strictEqual(staged.length, 2, "exactly 2 staged files: the first photo was not uploaded again");
    await goReview(page);
    // ── submit: the server answers, the answer is lost ──
    await page.getByText("ส่งข้อมูล", { exact: true }).click();
    await page.waitForSelector("text=ส่งข้อมูลไม่สำเร็จ", { timeout: 30000 }); await H.shot(page, "07-retry-lost-response-error-shown");
    assert.strictEqual((await cases()).length, before + 1, "the server DID create the case");
    const caseId = (await cases()).find((c) => c.contactName === "Synthetic Retry").id;
    // ── press again ──
    await page.getByText("ส่งข้อมูล", { exact: true }).click();
    await page.waitForSelector("text=ส่งข้อมูลสำเร็จ", { timeout: 30000 });
    assert.strictEqual((await cases()).length, before + 1, "no duplicate case"); assert.strictEqual(submitReqs, 2);
    const url = await trackUrlOf(page); assert.ok(url.includes(encodeURIComponent(caseId)), "the link is the SAME case's");
    assert.strictEqual((await db.collection("casePhotos").where("propertyId", "==", caseId).get()).size, 2);
    const [files] = await bucket.getFiles({ prefix: "casePhotos/" + caseId + "/" }); assert.strictEqual(files.length, 2, "no orphan or duplicate file");
    // ── refresh after success: the confirmation comes back from the device, no new request ──
    await page.reload(); await page.waitForSelector("text=ส่งข้อมูลสำเร็จ", { timeout: 20000 });
    assert.strictEqual(submitReqs, 2, "the refresh did not call the server again"); await H.shot(page, "08-retry-refresh-after-success-confirmation");
    assert.deepStrictEqual(unexpected(page.__logs, [/submitListingCase :: net::ERR_FAILED/]), [], "unexpected browser problems (the one dropped submit response is the injected fault)");
    rec("B2", "refresh keeps form+photos (no re-upload); lost response → same case; refresh after success keeps confirmation", "PASS (local browser + emulators)", "submit requests=2 for 1 case; staged files=2");
    await ctx.close();
  });

  it("B3 double click on submit sends ONE request and creates ONE case", async () => {
    const { ctx, page } = await newPage({}, "dblclick");
    const before = (await cases()).length; let reqs = 0;
    await ctx.route("**/asia-southeast1/submitListingCase", (route) => { reqs++; route.continue(); });
    await page.goto(site.url + "/Owner%20Submission.dc.html");
    await ownerFormFill(page, { name: "Synthetic Double", phone: "0800000003", type: "land", price: 3500000 });
    await uploadPhotos(page, 1); await goReview(page);
    await page.getByText("ส่งข้อมูล", { exact: true }).dblclick();
    await page.waitForSelector("text=ส่งข้อมูลสำเร็จ", { timeout: 30000 });
    assert.strictEqual(reqs, 1); assert.strictEqual((await cases()).length, before + 1);
    assert.strictEqual((await cases()).find((c) => c.contactName === "Synthetic Double").photoCount, 1, "land: Photo Standard v1 minimum is 1 photo");
    rec("B3", "double click → one request, one case; land with 1 photo is accepted (Photo Standard v1)", "PASS (local browser + emulators)", "");
    await ctx.close();
  });

  it("B4 agent: signs in, submits through the form (role agent), sees ONLY their own submitted case in Lister Dashboard and can open it; another agent sees none; 'add listing' goes to the private form", async () => {
    const a1 = await newPage({}, "agent1"); const page = a1.page;
    await loginAgent(page, "agent@example.test");
    await page.goto(site.url + "/Owner%20Submission.dc.html");
    await ownerFormFill(page, { name: "Synthetic Agent Client", phone: "0800000004", type: "condo", price: 4200000, description: "Sea-view condo, 45 sqm." });
    await uploadPhotos(page, 2); await goReview(page); await H.shot(page, "09-agent-form-review");
    await page.getByText("ส่งข้อมูล", { exact: true }).click(); await page.waitForSelector("text=ส่งข้อมูลสำเร็จ", { timeout: 30000 });
    const c = (await cases()).find((x) => x.contactName === "Synthetic Agent Client"); assert.ok(c);
    assert.strictEqual(c.submittedByRole, "agent"); assert.strictEqual(c.listerId, ids.agent); assert.strictEqual(c.propertyOwnerRelation, "representative");
    ids.agentCase = c.id;
    await page.goto(site.url + "/Lister%20Dashboard.dc.html?new=1"); // the "+" icon of the agent's own page: opens the property LIST tab
    await page.waitForSelector("text=เคสที่ฉันส่งผ่านฟอร์ม", { timeout: 30000 });
    await H.shot(page, "10-agent-dashboard-own-case-list");
    assert.ok(/เคสที่ฉันส่งผ่านฟอร์ม \(1\)/.test(await page.innerText("body")), "exactly the agent's own case is listed");
    await page.getByText(/ดูสถานะ\/คุยกับทีมงาน/).first().click();
    await page.waitForURL(/Track%20Submission/, { timeout: 20000 }); 
    await page.waitForSelector("text=ได้รับข้อมูลแล้ว", { timeout: 20000 });
    await H.shot(page, "11-agent-opens-own-case-tracking");
    assert.ok(page.url().includes(encodeURIComponent(c.id)));
    // another agent
    const a2 = await newPage({}, "agent2");
    await loginAgent(a2.page, "agent2@example.test"); await a2.page.goto(site.url + "/Lister%20Dashboard.dc.html?new=1");
    await a2.page.waitForSelector("text=ทรัพย์ของฉัน", { timeout: 30000 }).catch(() => {});
    await sleep(2000);
    assert.ok(!/เคสที่ฉันส่งผ่านฟอร์ม/.test(await a2.page.innerText("body")), "another agent sees no such section"); await H.shot(a2.page, "12-agent2-dashboard-sees-nothing-of-agent1");
    const denied = await a2.page.evaluate(async (id) => { const fb = await import("./firebase-client.js"); try { const r = await fb.fetchDocById("properties", id); return { ok: true, r }; } catch (e) { return { ok: false, code: e.code }; } }, c.id);
    assert.ok(denied.ok && (denied.r === null), "agent 2 can not read agent 1's case through the client layer");
    const direct = await a2.page.evaluate(async (id) => { try { const d = await window.firebase.firestore().doc("caseInternal/" + id).get(); return "read:" + d.exists; } catch (e) { return e.code; } }, c.id);
    assert.strictEqual(direct, "permission-denied", "agent 2 direct Firestore read of the record is refused");
    // 'add listing' → private form
    await page.goto(site.url + "/Lister%20Dashboard.dc.html?new=1"); await page.waitForSelector("text=เพิ่มทรัพย์ใหม่", { timeout: 30000 });
    await page.getByText(/\+ เพิ่มทรัพย์ใหม่|เพิ่มทรัพย์ใหม่/).first().click(); await page.waitForURL(/Owner%20Submission/, { timeout: 20000 });
    assert.deepStrictEqual(unexpected(a1.page.__logs), [], "unexpected browser problems (agent)");
    rec("B4", "agent: submit → own-case list in Lister Dashboard → open; other agent sees nothing (UI + direct read refused); add listing → private form", "PASS (local browser + emulators)", "case " + c.id);
    await a1.ctx.close(); await a2.ctx.close();
  });

  const APPROVE = "✓ อนุมัติ";
  // click a button INSIDE the card of the Outsider case (the page also lists the agent's case)
const clickInCase = async (page, label, last) => { const ok = await page.evaluate(([id, label, last]) => { const all = Array.from(document.querySelectorAll("*")).filter((e) => e.children.length === 0 && (e.textContent || "").trim() === id); for (const n of all) { let a = n; for (let i = 0; i < 14 && a; i++, a = a.parentElement) { const bs = Array.from(a.querySelectorAll("div,button,span")).filter((e) => e.children.length === 0 && (e.textContent || "").trim() === label); const b = last ? bs[bs.length - 1] : bs[0]; if (b) { b.click(); return true; } } } return false; }, [ids.outsiderCase, label, !!last]); assert.ok(ok, "button '" + label + "' found in the card of " + ids.outsiderCase); };
const scrollToCase = async (page) => { await page.evaluate((id) => { const l = Array.from(document.querySelectorAll("*")).find((e) => e.children.length === 0 && (e.textContent || "").trim() === id); if (l) l.scrollIntoView({ block: "start" }); }, ids.outsiderCase); await sleep(300); };
// the Owner's intake decision lives in the review block of the open workflow panel (next to "ส่งกลับที่ขั้นตอน:"); the right-hand "✓ อนุมัติ" of the card is the PUBLISH approval
const clickIntakeApprove = async (page) => { const ok = await page.evaluate(() => { const lab = Array.from(document.querySelectorAll("*")).find((e) => e.children.length === 0 && /ส่งกลับที่ขั้นตอน/.test(e.textContent || "")); if (!lab) return false; let a = lab; for (let i = 0; i < 8 && a; i++, a = a.parentElement) { const b = Array.from(a.querySelectorAll("div,button,span")).find((e) => e.children.length === 0 && (e.textContent || "").trim() === "✓ อนุมัติ"); if (b) { b.click(); return true; } } return false; }); assert.ok(ok, "the intake review block with its approve button is open"); };
const preview = async (page, state, ms) => waitFor(async () => (await page.getAttribute("[data-preview-confirm]", "data-state").catch(() => null)) === state, ms || 20000, "preview state " + state);
  const openCase = async (page) => { await page.goto(site.url + "/Listing%20Approvals.dc.html"); await page.waitForSelector("text=" + ids.outsiderCase, { timeout: 30000 }); };


  // ── identities for the private-image checks ──
  const idToken = async (email) => {
    const E = H.emulators();
    const r = await fetch(E.auth + "/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=local", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password: PASS, returnSecureToken: true }) });
    return (await r.json()).idToken;
  };
  const mediaStatus = async (token, storagePath) => {
    const E = H.emulators();
    const r = await fetch("http://" + E.stHost + ":" + E.stPort + "/v0/b/" + H.CFG.storageBucket + "/o/" + encodeURIComponent(storagePath) + "?alt=media", { headers: token ? { Authorization: "Firebase " + token } : {} });
    return r.status;
  };

  it("B5 Staff does the real work from the UI: claims the case, confirms the verifications, submits for review; opens a private photo (request + response + rendered image); cannot approve", async () => {
    // Fields the intake form does not collect are SEEDED through the Admin SDK (Staff data entry is not driven here). Recorded in RESULTS.
    const seeded = { bedrooms: 3, bathrooms: 2, livingArea: 140, landSize: 400, coordsRaw: "12.558940,99.909039", area: "hua-hin" };
    await db.doc("caseInternal/" + ids.outsiderCase).update(seeded);
    const { ctx, page } = await newPage({}, "staff");
    await loginAdmin(page, "staff@example.test");
    await openCase(page); await sleep(1500);
    assert.strictEqual(await page.getByText(APPROVE).count(), 0, "Staff has no approve button");
    await H.shot(page, "13-staff-sees-case-before-claiming");
    await clickInCase(page, "✋ รับงาน");
    await waitFor(async () => (await db.doc("caseInternal/" + ids.outsiderCase).get()).data().assignedToEmail === "staff@example.test", 15000, "claimed");
    await sleep(1500); await H.shot(page, "14-staff-claimed-case");
    // verifications (step 3 + step 4), each a real click on "ยืนยันแล้ว"
    for (const step of ["ยืนยันข้อมูลสำคัญ", "ตรวจความพร้อมก่อนส่ง"]) {
      await clickInCase(page, step); await sleep(700);
      for (let i = 0; i < 3; i++) { const more = await page.getByText("ยืนยันแล้ว", { exact: true }).count(); if (!more) break; await page.getByText("ยืนยันแล้ว", { exact: true }).first().click(); await sleep(1200); }
      await H.shot(page, step === "ยืนยันข้อมูลสำคัญ" ? "15-staff-verifications-step3" : "16-staff-verifications-step4");
      await clickInCase(page, step); await sleep(400);
    }
    const v = (await db.doc("caseInternal/" + ids.outsiderCase).get()).data().verifications || {};
    assert.ok(v.price_confirmed && v.identity_confirmed && v.location_confirmed && v.quality_reviewed, "the four verifications were recorded by Staff clicks: " + JSON.stringify(Object.keys(v)));
    // submit for review
    await clickInCase(page, "ส่งงานรอตรวจสอบ"); await sleep(800);
    const submitBtns = await page.getByText("ส่งงานรอตรวจสอบ", { exact: true }).count();
    await H.shot(page, "17-staff-submit-panel");
    const blockers = await page.locator("text=ยังส่งงานไม่ได้").count();
    assert.strictEqual(blockers, 0, "nothing blocks the submit: " + (blockers ? (await page.innerText("body")).split("ยังส่งงานไม่ได้")[1].slice(0, 400) : ""));
    await clickInCase(page, "ส่งงานรอตรวจสอบ", true);
    await waitFor(async () => !!(await db.doc("caseInternal/" + ids.outsiderCase).get()).data().lastSubmissionId, 20000, "submitted for review");
    await sleep(1500); await H.shot(page, "18-staff-after-submit-for-review");
    // private photo: the real viewing action
    const before = page.__logs.storage.length;
    // the real viewing action: click the first thumbnail under "รูปที่ส่งมา" (it opens the lightbox, which loads the private photo with the member's ID token)
    const clicked = await page.evaluate((id) => { const ls = Array.from(document.querySelectorAll("div")).filter((e) => /^รูปที่ส่งมา/.test(Array.from(e.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join("").trim())); for (const l of ls) { let a = l; for (let i = 0; i < 14 && a; i++, a = a.parentElement) { if ((a.innerText || "").includes(id) && l.nextElementSibling && l.nextElementSibling.firstElementChild) { l.nextElementSibling.firstElementChild.click(); return true; } } } return false; }, ids.outsiderCase);
    assert.ok(clicked, "found the submitted-photo thumbnail in the card"); await sleep(4000);
    const attempts = page.__logs.photoCalls; // (the page asks getCasePhoto for the card thumbnail when it loads; the lightbox reuses the cached in-memory blob)
    const lightbox = await page.evaluate(() => Array.from(document.querySelectorAll("img")).filter((i) => i.alt === "รูปทรัพย์").map((i) => ({ src: i.src.split(":")[0], w: i.naturalWidth })));
    await H.shot(page, "19-staff-opens-private-photo");
    assert.ok(attempts.length >= 1, "the page asked getCasePhoto for the private photo (otherwise nothing is proven)");
    assert.ok(lightbox.length >= 1, "the lightbox element is open");
    assert.strictEqual(page.context().__log.external.filter((u) => /firebasestorage\.googleapis\.com/.test(u)).length, 0, "the page never requests Storage REST directly (that is what real-browser CORS blocks)");
    assert.strictEqual(page.__logs.images.filter((i) => /alt=media|casePhotos|firebasestorage/.test(i.url)).length, 0, "no <img> points at Storage");
    const outcome = attempts.every((a) => a.status === 200) && lightbox.some((l) => l.src === "blob" && l.w > 0) ? "ALLOWED: getCasePhoto 200 and the image rendered" : "DENIED/FAILED: statuses " + JSON.stringify(attempts.map((a) => a.status)) + ", lightbox " + JSON.stringify(lightbox);
    // identities, exercised with the same transport (ID token → Storage REST); synthetic Owner uid comes from adminUsers, not the hard-coded one
    const [pc] = (await db.collection("casePhotos").where("propertyId", "==", ids.outsiderCase).get()).docs; const path = pc.data().storagePath;
    ids.owner2 = await mkUser("owner2@example.test"); await db.doc("adminUsers/" + ids.owner2).set({ role: "owner", email: "owner2@example.test", displayName: "Synthetic Owner 2" });
    const st = {
      "hard-coded Owner uid": await mediaStatus(await idToken("owner@example.test"), path),
      "synthetic Owner (adminUsers role owner)": await mediaStatus(await idToken("owner2@example.test"), path),
      "ordinary Staff (adminUsers role staff)": await mediaStatus(await idToken("staff@example.test"), path),
      "unrelated signed-in uid (agent2)": await mediaStatus(await idToken("agent2@example.test"), path),
      "no credentials": await mediaStatus(null, path),
    };
    rec("B5a", "Staff from the UI: claim → 4 verifications → submit for review (DB: assignedTo, verifications, lastSubmissionId); no approve button for Staff", "PASS (local browser + emulators)", "SEEDED through the Admin SDK (not Staff data entry): " + Object.keys(seeded).join(", "));
    rec("B5b", "Staff opens a private photo from the UI (the page loads the thumbnail through getCasePhoto; clicking it opens the lightbox)", "UI invoked + " + attempts.length + " getCasePhoto call(s) — " + outcome, "UI invocation + rendering = evidence of the page; the permission result is EMULATOR evidence (the Storage emulator resolved the Firestore membership lookup in this run) — the real TEST project must still confirm it");
    rec("B5c", "storage.rules by identity (ID token → Storage emulator REST, NOT used by the page any more)", Object.entries(st).map(([k, v]) => k + " → " + v).join("; "), "emulator evidence only; real cross-service Storage on the TEST project stays PENDING");
    const callable = async (token) => { const E = H.emulators(); const r = await fetch("http://" + E.fnHost + ":" + E.fnPort + "/" + H.PROJECT + "/asia-southeast1/getCasePhoto", { method: "POST", headers: Object.assign({ "content-type": "application/json" }, token ? { Authorization: "Bearer " + token } : {}), body: JSON.stringify({ data: { propertyId: ids.outsiderCase, path } }) }); const j = await r.json().catch(() => ({})); return r.status + (j.result && j.result.base64 ? " bytes" : j.error ? " " + j.error.status : ""); };
    const fnm = { "hard-coded Owner uid": await callable(await idToken("owner@example.test")), "synthetic Owner (adminUsers role owner)": await callable(await idToken("owner2@example.test")), "ordinary Staff": await callable(await idToken("staff@example.test")), "unrelated signed-in uid (agent2)": await callable(await idToken("agent2@example.test")), "no credentials": await callable(null) };
    assert.deepStrictEqual(Object.values(fnm), ["200 bytes", "200 bytes", "200 bytes", "403 PERMISSION_DENIED", "401 UNAUTHENTICATED"], JSON.stringify(fnm));
    rec("B5d", "private-image access through getCasePhoto (the transport the page uses), by identity", Object.entries(fnm).map(([k, v]) => k + " → " + v).join("; "), "local Functions emulator + real function code; the real TEST project must repeat it");
    assert.strictEqual(st["unrelated signed-in uid (agent2)"] === 200, false, "an unrelated signed-in uid must not read the private photo");
    assert.strictEqual(st["no credentials"] === 200, false, "no credentials must not read the private photo");
    await ctx.close();
  });

  it("B6 Owner decides from the UI: intake approval of the submission, then the publish preview (cancel, photo failure acknowledgement, contact data refused) and publish", async () => {
    const { ctx, page } = await newPage({}, "owner");
    await loginAdmin(page, "owner@example.test");
    await openCase(page); await sleep(1500);
    assert.strictEqual((await db.doc("caseInternal/" + ids.outsiderCase).get()).data().reviewStatus === "approved", false, "not approved yet");
    // the Owner sees the submission waiting for review in the case's workflow panel (it is open by default for a submitted case)
    await scrollToCase(page); await H.shot(page, "20-owner-sees-submission-for-review");
    await clickIntakeApprove(page);

    await waitFor(async () => (await db.doc("caseInternal/" + ids.outsiderCase).get()).data().reviewStatus === "approved", 20000, "intake approved by the Owner's click");
    const rc0 = (await db.doc("caseInternal/" + ids.outsiderCase).get()).data(); assert.ok(rc0.approvedBy || rc0.approvedByUid || rc0.intakeCompletedAt, "approval recorded");
    await sleep(1500); await H.shot(page, "21-owner-intake-approved");
    rec("B6b", "DEFECT FOUND AND FIXED by this scenario: in Listing Approvals the panel's intake-approve button and the card's publish button shared the key onApprove, so the panel button opened the publish preview instead of recording the intake decision", "FIXED", "renamed to onIntakeApprove");
    rec("B6a", "Owner intake decision from the UI (no Admin SDK seeding of reviewStatus)", "PASS (local browser + emulators)", "reviewStatus approved by the click; approver recorded");
    // ── preview 1: photo downloads fail → needs acknowledgement; cancel
    let blockMedia = true;
    await ctx.route(/\/getCasePhoto$/, (route) => (blockMedia ? route.abort("failed") : route.fallback()));
    await openCase(page); await clickInCase(page, APPROVE); await page.waitForSelector("[data-preview-confirm]");
    await preview(page, "needs-ack");
    assert.strictEqual(await page.locator("[data-preview-confirm]").isDisabled(), true, "confirm disabled while photos failed and unacknowledged");
    await H.shot(page, "23-owner-preview-photos-failed-needs-acknowledgement");
    await page.locator("[data-preview-cancel]").click();
    assert.strictEqual((await db.doc("caseInternal/" + ids.outsiderCase).get()).data().listingStatus || "pending", "pending", "cancel changed nothing");
    assert.strictEqual((await db.doc("properties/" + ids.outsiderCase).get()).exists, false);
    // ── preview 2: normal
    blockMedia = false;
    await clickInCase(page, APPROVE); await page.waitForSelector("[data-preview-confirm]"); await preview(page, "ready");
    const shown = await page.evaluate(() => ({ imgs: document.querySelectorAll("[data-preview-photo]").length, ok: Array.from(document.querySelectorAll("[data-preview-photo]")).filter((i) => i.naturalWidth > 0).length, text: document.body.innerText, src: Array.from(document.querySelectorAll("[data-preview-photo]")).map((i) => i.src.split(":")[0]) }));
    assert.deepStrictEqual([shown.imgs, shown.ok], [2, 2]); assert.deepStrictEqual(shown.src, ["blob", "blob"], "private photos shown through authenticated in-memory blobs");
    assert.ok(/7,500,000/.test(shown.text), "preview shows the public price");
    await H.shot(page, "24-owner-preview-photos-reviewed-ready");
    await page.locator("[data-preview-cancel]").click();
    // ── preview 3: contact data in the public text is refused inside the dialog
    await db.doc("caseInternal/" + ids.outsiderCase).update({ description: "Quiet house, call 0812345678" });
    await openCase(page); await clickInCase(page, APPROVE); await page.waitForSelector("[data-preview-confirm]");
    await preview(page, "refused"); await H.shot(page, "25-owner-preview-refused-contact-in-public-text");
    await page.locator("[data-preview-cancel]").click();
    await db.doc("caseInternal/" + ids.outsiderCase).update({ description: "Quiet 3-bedroom house near the beach." });
    // ── publish
    await openCase(page); await clickInCase(page, APPROVE); await page.waitForSelector("[data-preview-confirm]");
    await preview(page, "ready"); await page.locator("[data-preview-confirm]").click();
    await waitFor(async () => (await db.doc("caseInternal/" + ids.outsiderCase).get()).data().listingStatus === "live", 25000, "published");
    const pub = (await db.doc("properties/" + ids.outsiderCase).get()).data();
    assert.strictEqual(pub.price, 7500000); assert.ok(!("contactPhone" in pub) && !("trackToken" in pub));
    assert.strictEqual((await db.collection("propertyPhotos").where("propertyId", "==", ids.outsiderCase).get()).size, 2);
    const rc = (await db.doc("caseInternal/" + ids.outsiderCase).get()).data(); assert.strictEqual(rc.approvedByRole, "owner"); assert.strictEqual(rc.approvedByUid, ids.owner);
    await sleep(1500); await H.shot(page, "26-owner-approvals-after-publish");
    assert.deepStrictEqual(unexpected(page.__logs, [/getCasePhoto :: net::ERR_(FAILED|BLOCKED_BY_CLIENT)/, /getCasePhoto :: net::ERR_FAILED/]), [], "unexpected browser problems (owner; the injected photo-download failure is the only allowed one)");
    ids.ownerPage = page; ids.ownerCtx = ctx;
    rec("B6", "owner: preview cancel = no change; failed photos need acknowledgement; ready shows the 2 photos that will be public; contact in public text refused in the dialog; confirm publishes", "PASS (local browser + emulators)", "approvedBy recorded; 2 public photos");
  });

  it("B7 first navigation shows SERVER data: published listing page + photos, and search, with ZERO reloads (no automatic retry anywhere)", async () => {
    const pend = await newPage({}, "public-pending");
    await pend.page.goto(site.url + "/Property%20Details.dc.html?id=" + ids.agentCase); await sleep(5000); await H.shot(pend.page, "27-public-pending-case-not-visible");
    assert.ok(!/4,200,000|Sea-view condo/.test(await pend.page.innerText("body")), "pending facts are not public");
    const E = H.emulators(); const rest = async (c, id) => (await fetch("http://" + E.fsHost + ":" + E.fsPort + "/v1/projects/" + H.PROJECT + "/databases/(default)/documents/" + c + "/" + id)).status;
    assert.deepStrictEqual([await rest("properties", ids.agentCase), await rest("caseInternal", ids.agentCase), await rest("casePhotos", ids.agentCase + "_0")], [404, 403, 403], "anonymous: nothing public for the pending case; private records refused");
    for (let run = 1; run <= 3; run++) { // repeated: the earlier failure was intermittent
      const pubv = await newPage({}, "public-live-" + run);
      await pubv.page.goto(site.url + "/Property%20Details.dc.html?id=" + ids.outsiderCase);
      await waitFor(async () => /7,500,000/.test(await pubv.page.innerText("body")), 20000, "public price on first navigation (run " + run + ")");
      await waitFor(async () => pubv.page.evaluate(() => Array.from(document.querySelectorAll("img")).filter((i) => /publishedCasePhotos/.test(i.src) && i.naturalWidth > 0).length >= 1), 20000, "published photos on first navigation");
      assert.strictEqual(pubv.page.__logs.navs.length, 1, "exactly one navigation (no reload): " + JSON.stringify(pubv.page.__logs.navs));
      assert.deepStrictEqual(await pubv.page.evaluate(() => window.__hhDataLoad && window.__hhDataLoad.state), "ok");
      if (run === 1) {
        await H.shot(pubv.page, "28-public-published-listing-with-photos-first-load");
        ids.imgUrls = await pubv.page.evaluate(() => Array.from(new Set(Array.from(document.querySelectorAll("img")).filter((i) => /publishedCasePhotos/.test(i.src)).map((i) => i.src))));
        for (const u of (ids.imgUrls || [])) assert.strictEqual((await fetch(u)).status, 200);
        assert.ok(!/0800000001|Synthetic Outsider|trackToken/.test(await pubv.page.innerText("body")), "no contact data on the public page");
        assert.deepStrictEqual(unexpected(pubv.page.__logs).filter((m) => !/publishedCasePhotos/.test(m) && !/maps\.googleapis\.com/.test(m) && m !== "pageerror: Event"), [], "unexpected browser problems (public page)");
      }
      const search = await newPage({}, "public-search-" + run);
      await search.page.goto(site.url + "/Search%20Results.dc.html");
      await waitFor(async () => /7,500,000|7500000/.test(await search.page.innerText("body")), 20000, "listing in search on first navigation (run " + run + ")");
      assert.strictEqual(search.page.__logs.navs.length, 1, "search: exactly one navigation");
      if (run === 1) await H.shot(search.page, "29-public-search-first-load-lists-published");
      await pubv.ctx.close(); await search.ctx.close();
    }
    await pend.ctx.close();
    rec("B7", "published listing (details + photos) and search show server data on the FIRST navigation, 3 runs each, 1 navigation per page (no reload); pending case invisible (UI + direct reads refused)", "PASS (local browser + emulators)", "");
  });

  it("B8 slow SDK and failed SDK: slow → still server data on first load (bounded wait); failed → error notice + NO sample listings + state failed; zero automatic reloads", async () => {
    // slow: every Firebase SDK script is delayed 3 s
    const slow = await newPage({}, "public-slow-sdk"); slow.ctx.__fault = { delayMs: 3000 };
    await slow.page.goto(site.url + "/Property%20Details.dc.html?id=" + ids.outsiderCase);
    await waitFor(async () => /7,500,000/.test(await slow.page.innerText("body")), 30000, "server data after a slow SDK");
    assert.strictEqual(slow.page.__logs.navs.length, 1, "slow SDK: no reload"); assert.strictEqual(await slow.page.evaluate(() => window.__hhDataLoad.state), "ok");
    await H.shot(slow.page, "30-slow-sdk-first-load-shows-server-data");
    const slowSearch = await newPage({}, "public-slow-search"); slowSearch.ctx.__fault = { delayMs: 3000 };
    await slowSearch.page.goto(site.url + "/Search%20Results.dc.html");
    await waitFor(async () => /7,500,000|7500000/.test(await slowSearch.page.innerText("body")), 30000, "search server data after a slow SDK");
    assert.strictEqual(slowSearch.page.__logs.navs.length, 1);
    // failed: the SDK scripts never arrive
    const bad = await newPage({}, "public-failed-sdk"); bad.ctx.__fault = { failFirebase: true };
    await bad.page.goto(site.url + "/Search%20Results.dc.html");
    await waitFor(async () => (await bad.page.evaluate(() => window.__hhDataLoad && window.__hhDataLoad.state)) === "failed", 25000, "explicit failed state (bounded wait)");
    const txt = await bad.page.innerText("body"); await sleep(1000); await H.shot(bad.page, "31-failed-sdk-error-state-no-sample-listings");
    assert.ok(/โหลดข้อมูลประกาศไม่สำเร็จ/.test(txt), "a visible error notice");
    assert.ok(!/HH-1\d\d|CA-\d{3}|PB-\d{3}/.test(txt), "no bundled sample listing is shown as if it were real");
    assert.strictEqual(await bad.page.evaluate(() => window.__hhDataLoad.code), "sdk-timeout");
    assert.strictEqual(bad.page.__logs.navs.length, 1, "failed SDK: still no automatic reload");
    const badDetail = await newPage({}, "public-failed-sdk-detail"); badDetail.ctx.__fault = { failFirebase: true };
    await badDetail.page.goto(site.url + "/Property%20Details.dc.html?id=" + ids.outsiderCase);
    await waitFor(async () => (await badDetail.page.evaluate(() => window.__hhDataLoad && window.__hhDataLoad.state)) === "failed", 25000, "details: failed state");
    assert.ok(!/7,500,000/.test(await badDetail.page.innerText("body")), "no listing shown after the failure");
    assert.strictEqual(badDetail.page.__logs.navs.length, 1);
    rec("B8", "slow SDK (3 s): server data on first load, 1 navigation; failed SDK: bounded wait (8 s) → visible error notice, window.__hhDataLoad.state=failed code sdk-timeout, no sample listings, 1 navigation (details + search)", "PASS (local browser + emulators)", "TEST build only: SAMPLE_FALLBACK_ON_ERROR=false (production source keeps the sample fallback)");
    await Promise.all([slow.ctx.close(), slowSearch.ctx.close(), bad.ctx.close(), badDetail.ctx.close()]);
  });

  it("B9 take-down from the UI: page, records and files removed; old photo links dead; first navigation afterwards shows no listing", async () => {
    const op = ids.ownerPage; op.on("dialog", (d) => d.accept("synthetic take-down reason"));
    await openCase(op); await clickInCase(op, "⛔ ปิดประกาศ");
    await waitFor(async () => (await db.doc("caseInternal/" + ids.outsiderCase).get()).data().listingStatus === "offline", 25000, "offline");
    await waitFor(async () => !(await db.doc("properties/" + ids.outsiderCase).get()).exists, 10000, "public document removed");
    assert.strictEqual((await db.collection("propertyPhotos").where("propertyId", "==", ids.outsiderCase).get()).size, 0);
    await waitFor(async () => (await bucket.getFiles({ prefix: "publishedCasePhotos/" + ids.outsiderCase + "/" }))[0].length === 0, 15000, "public files deleted");
    for (const u of (ids.imgUrls || [])) assert.notStrictEqual((await fetch(u)).status, 200, "old public photo link is dead");
    const after = await newPage({}, "public-after-takedown");
    await after.page.goto(site.url + "/Property%20Details.dc.html?id=" + ids.outsiderCase); await sleep(5000); await H.shot(after.page, "32-public-after-take-down");
    assert.ok(!/7,500,000/.test(await after.page.innerText("body")), "page no longer shows the listing");
    rec("B-ctl", "negative control (run once by hand, not part of the suite): with the SDK wait removed from fetchCollection, B8 (slow SDK) FAILS (timeout waiting for server data); with the fix it passes", "DONE", "B7 alone did not fail without the wait in that run (the race is intermittent) — B8 is the deterministic detector");
    rec("B9", "owner take-down from the UI removes page, records and files; old photo links dead", "PASS (local browser + emulators)", "");
    await after.ctx.close(); await ids.ownerCtx.close();
  });

  it("B10 Staff sees ALL 7 different private photos in the strip and each click opens the matching big image (regression: only the cover loaded; clicking a grey tile opened a broken image)", async function () {
    // 1. a new outsider case with 7 DIFFERENT photos through the real form
    const o = await newPage({}, "outsider-7");
    await o.page.goto(site.url + "/Owner%20Submission.dc.html");
    await ownerFormFill(o.page, { name: "Synthetic Seven", phone: "0800000007", type: "house", price: 6100000, description: "Seven different photos." });
    await uploadPhotos(o.page, 7, 40);
    await goReview(o.page); await o.page.getByText("ส่งข้อมูล", { exact: true }).click(); await o.page.waitForSelector("text=ส่งข้อมูลสำเร็จ", { timeout: 40000 });
    const mine = (await cases()).find((c) => c.contactPhone === "0800000007"); assert.ok(mine && mine.photoCount === 7, "7 photos in the case record"); ids.sevenCase = mine.id; await o.ctx.close();
    // what is stored, in index order: the sha-256 of each private file
    const crypto = require("crypto");
    const recs = (await db.collection("casePhotos").where("propertyId", "==", mine.id).get()).docs.map((d) => d.data()).sort((a, b) => a.index - b.index);
    assert.strictEqual(recs.length, 7);
    const want = []; for (const r of recs) { const [buf] = await bucket.file(r.storagePath).download(); want.push(crypto.createHash("sha256").update(buf).digest("hex")); }
    assert.strictEqual(new Set(want).size, 7, "the 7 stored files are all different");
    // 2. Staff opens the page
    const { ctx, page } = await newPage({}, "staff-7");
    await loginAdmin(page, "staff@example.test");
    await page.goto(site.url + "/Listing%20Approvals.dc.html"); await page.waitForSelector("text=" + mine.id, { timeout: 30000 });
    const strip = () => page.evaluate((id) => {
      const lab = Array.from(document.querySelectorAll("div")).find((e) => /^รูปที่ส่งมา/.test(Array.from(e.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join("").trim()) && (() => { let a = e; for (let i = 0; i < 14 && a; i++, a = a.parentElement) if ((a.innerText || "").includes(id)) return true; return false; })());
      if (!lab || !lab.nextElementSibling) return null;
      return { label: lab.textContent.trim(), tiles: Array.from(lab.nextElementSibling.children).map((t) => { const m = /url\("?([^")]+)"?\)/.exec(getComputedStyle(t).backgroundImage || ""); return m ? m[1] : ""; }) };
    }, mine.id);
    await waitFor(async () => { const s = await strip(); return s && s.tiles.length === 7 && s.tiles.every((u) => u.startsWith("blob:")); }, 30000, "all 7 thumbnails loaded");
    const st = await strip(); assert.ok(/7 รูป/.test(st.label), "the page says 7 photos: " + st.label);
    await sleep(500); await page.evaluate(() => window.scrollTo(0, 0)); await page.evaluate((id) => { const l = Array.from(document.querySelectorAll("*")).find((e) => e.children.length === 0 && (e.textContent || "").trim() === id); if (l) l.scrollIntoView(); }, mine.id); await sleep(300);
    await H.shot(page, "33-staff-seven-private-photos-all-shown");
    const hash = (url) => page.evaluate(async (u) => { const b = await (await fetch(u)).arrayBuffer(); const h = await crypto.subtle.digest("SHA-256", b); return Array.from(new Uint8Array(h)).map((x) => x.toString(16).padStart(2, "0")).join(""); }, url);
    const thumbs = []; for (const u of st.tiles) thumbs.push(await hash(u));
    assert.deepStrictEqual(thumbs, want, "thumbnail i shows exactly stored photo i (7 different images, in order)");
    const calls = page.__logs.photoCalls.length; assert.ok(calls >= 7, "7 photos were requested through getCasePhoto: " + calls);
    // 3. every click opens the big image of THAT photo
    for (let i = 0; i < 7; i++) {
      await page.evaluate(([id, i]) => {
        const lab = Array.from(document.querySelectorAll("div")).find((e) => /^รูปที่ส่งมา/.test(Array.from(e.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join("").trim()) && (() => { let a = e; for (let k = 0; k < 14 && a; k++, a = a.parentElement) if ((a.innerText || "").includes(id)) return true; return false; })());
        lab.nextElementSibling.children[i].click();
      }, [mine.id, i]);
      await page.waitForSelector('img[alt="รูปทรัพย์"]', { timeout: 10000 });
      await waitFor(async () => page.evaluate(() => { const im = document.querySelector('img[alt="รูปทรัพย์"]'); return im && im.src.startsWith("blob:") && im.complete && im.naturalWidth > 0; }), 10000, "big image " + i);
      const src = await page.evaluate(() => document.querySelector('img[alt="รูปทรัพย์"]').src);
      assert.strictEqual(await hash(src), want[i], "big image " + i + " is photo " + i);
      assert.ok(new RegExp("^" + (i + 1) + " / 7").test(await page.evaluate(() => document.body.innerText.match(/\d+ \/ \d+/)[0])), "counter " + (i + 1) + " / 7");
      if (i === 2) await H.shot(page, "34-staff-lightbox-photo-3-of-7");
      await page.keyboard.press("Escape").catch(() => {}); await page.evaluate(() => { const im = document.querySelector('img[alt="รูปทรัพย์"]'); if (im) im.parentElement.click(); }); await sleep(250);
    }
    // 4. nothing public, nothing direct
    assert.strictEqual((await db.doc("properties/" + mine.id).get()).exists, false); assert.strictEqual((await db.collection("propertyPhotos").where("propertyId", "==", mine.id).get()).size, 0);
    assert.strictEqual(ctx.__log.external.filter((u) => /firebasestorage\.googleapis\.com/.test(u)).length, 0, "no direct Storage request");
    assert.strictEqual(page.__logs.images.filter((x) => /firebasestorage|casePhotos/.test(x.url)).length, 0);
    rec("B10", "Staff sees all 7 DIFFERENT private photos (thumbnail i = stored photo i, by sha-256) and each lightbox opens the matching big image 1/7…7/7; getCasePhoto calls: " + calls, "PASS (local browser + emulators)", "regression for: only the cover loaded (1 call), 6 grey tiles, clicking one opened a broken image");
    await ctx.close();
  });
});
