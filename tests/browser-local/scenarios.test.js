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

// FX-4 (DOC-OBS-01): the cover photo of a published listing must really LOAD on the Search page (decoded image, not only a URL in the markup).
const searchCover = (page) => page.evaluate(() => { const imgs = Array.from(document.querySelectorAll("img")); const pub = imgs.filter((i) => /publishedCasePhotos/.test(i.src));
  return { loaded: pub.filter((i) => i.complete && i.naturalWidth > 0).length, withUrl: pub.length, allImgs: imgs.map((i) => i.src.slice(0, 90) + " " + i.naturalWidth), bg: Array.from(document.querySelectorAll("[style*='url(']")).map((e) => e.getAttribute("style").slice(0, 90)).slice(0, 4), noPhotoLabel: /no photo|ไม่มีรูป|รูปภาพ/i.test(document.body.innerText) }; });
async function expectSearchCover(page, who) {
  try { await waitFor(async () => (await searchCover(page)).loaded >= 1, 20000, "cover photo decoded in Search (" + who + ")"); }
  catch (e) {
    const diag = await page.evaluate(async () => { try { const m = await import("./data.js"); const fb = await import("./firebase-client.js"); const props = await m.getEffectiveProperties(m); const ph = await fb.fetchAllPhotos();
      const card = Array.from(document.querySelectorAll("a")).find((a) => /Property.{0,3}Details/.test(a.getAttribute("href") || "")); return { cardHtml: card ? card.outerHTML.slice(0, 200) : "no card link", owner: props.filter((p) => p.source === "owner_submission").map((p) => ({ id: p.id, photos: (p.photos || []).slice(0, 2), photoKeys: Object.keys(p).filter((k) => /photo/i.test(k)) })), allPhotos: ph.map((x) => ({ id: x.id, pid: x.propertyId, url: (x.dataUrl || "").slice(0, 70) })).slice(0, 6) }; } catch (x) { return "diag failed: " + x; } });
    throw new Error("DOC-OBS-01 reproduced for " + who + ": no decoded cover photo in Search. state=" + JSON.stringify(await searchCover(page)) + " data=" + JSON.stringify(diag));
  }
}
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
    // FX-1 (DOC-OBS-04): the two approval events are shown separately, each with the person who did THAT event; the public record carries neither person
    assert.ok(!Object.keys(pub).some((k) => /^approvedBy|reviewedBy|intakeApprovedBy|approvedByEmail/.test(k)), "no approver data in the public document: " + Object.keys(pub).filter((k) => /approv|review/i.test(k)));
    await waitFor(async () => /อนุมัติรับเรื่องโดย owner@example\.test/.test(await page.innerText("body")), 20000, "intake approval line names the person who approved the intake (not '-')");
    await waitFor(async () => (await page.locator("[data-publish-approval]").count()) >= 1 && /อนุมัติเผยแพร่โดย owner@example\.test/.test(await page.locator("[data-publish-approval]").first().innerText()), 20000, "publish approval stamp names the Owner who published");
    const bodyApprovals = await page.innerText("body"); assert.ok(!/อนุมัติ(รับเรื่อง|เผยแพร่)?โดย -/.test(bodyApprovals) && !/โดย undefined|โดย owner(\s|$)/.test(bodyApprovals), "no '-' / undefined / bare role used as a person's name");
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
      await expectSearchCover(search.page, "visitor run " + run);
      if (run === 1) await H.shot(search.page, "29-public-search-first-load-lists-published");
      await pubv.ctx.close(); await search.ctx.close();
    }
    await pend.ctx.close();
    // FX-4: the same Search page as the signed-in OWNER (team session: the page merges the private records and loads private covers through getCasePhoto)
    const osPage = await ids.ownerCtx.newPage(); H.watch(osPage, "owner-search"); await osPage.goto(site.url + "/Search%20Results.dc.html");
    await waitFor(async () => /7,500,000|7500000/.test(await osPage.innerText("body")), 20000, "listing in search (owner)"); await expectSearchCover(osPage, "owner"); await H.shot(osPage, "29b-owner-search-cover"); await osPage.close();
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

  it("B11 Staff enters the property data of THEIR case from Listing Approvals (real buttons, nothing seeded), it persists after reopening; invalid input is refused; others are refused; Staff still can not publish; the Lister Dashboard Staff guard is intact", async () => {
    const id = ids.sevenCase; assert.ok(id, "needs the case from B10");
    const before = (await db.doc("caseInternal/" + id).get()).data(); assert.ok(!before.bedrooms && !before.landSize && !before.coordsRaw, "the case has none of the data yet (not seeded)");
    const { ctx, page } = await newPage({}, "staff-edit");
    await loginAdmin(page, "staff@example.test");
    await page.goto(site.url + "/Listing%20Approvals.dc.html"); await page.waitForSelector("text=" + id, { timeout: 30000 });
    // not assigned yet → the page refuses (assignment first), through the REAL button
    const inCard = async (label) => page.evaluate(([cid, label]) => { const all = Array.from(document.querySelectorAll("*")).filter((e) => e.children.length === 0 && (e.textContent || "").trim() === cid); for (const n of all) { let a = n; for (let i = 0; i < 14 && a; i++, a = a.parentElement) { const b = Array.from(a.querySelectorAll("div,button,span")).find((e) => e.children.length === 0 && (e.textContent || "").trim().replace(/^[^\p{L}]+/u, "") === label); if (b) { b.click(); return true; } } } return false; }, [id, label]);
    assert.ok(await inCard("แก้ไขข้อมูลทรัพย์"), "edit button found"); await page.waitForURL(/Case%20Data/, { timeout: 15000 });
    await page.waitForSelector("[data-case-data-blocked]", { timeout: 15000 }); { const bt = await page.innerText("body"); assert.ok(/ยังไม่ใช่งานของคุณ/.test(bt), "blocked text: " + bt.slice(0, 400)); } await H.shot(page, "35-staff-case-data-needs-claim-first");
    // claim, then edit
    await page.goBack(); await page.waitForSelector("text=" + id, { timeout: 30000 });
    assert.ok(await inCard("รับงาน"), "claim button"); await waitFor(async () => (await db.doc("caseInternal/" + id).get()).data().assignedToEmail === "staff@example.test", 15000, "claimed");
    await page.reload(); await page.waitForSelector("text=" + id, { timeout: 30000 });
    assert.ok(await inCard("แก้ไขข้อมูลทรัพย์")); await page.waitForURL(/Case%20Data/, { timeout: 15000 });
    await page.waitForSelector('[data-f="price"]', { timeout: 20000 });
    await H.shot(page, "36-staff-case-data-form-opened");
    assert.strictEqual(await page.locator('[data-f="price"]').inputValue(), "6100000", "the form shows the case's own price");
    // invalid first: coordinates as a share link
    await page.locator('[data-f="coordsRaw"]').fill("https://maps.app.goo.gl/abc"); await page.locator('[data-case-data-save]').click();
    await page.waitForSelector("[data-case-data-error]"); assert.ok(!(await db.doc("caseInternal/" + id).get()).data().coordsRaw, "invalid input wrote nothing"); await H.shot(page, "37-staff-case-data-invalid-coordinates-refused");
    const fill = { bedrooms: "3", bathrooms: "2", livingArea: "140", coordsRaw: "12.558940,99.909039" };
    for (const [k, v] of Object.entries(fill)) await page.locator('[data-f="' + k + '"]').fill(v);
    // D2: a land size needs its unit — a value without one is refused and writes nothing
    await page.locator('[data-f="landAreaValue"]').fill("100"); await page.locator("[data-case-data-save]").click(); await page.waitForSelector("[data-case-data-error]");
    assert.ok(/เลือกหน่วย/.test(await page.locator("[data-case-data-error]").innerText()), "asks for the unit"); assert.ok(!(await db.doc("caseInternal/" + id).get()).data().landAreaValue, "no land size written without a unit");
    await page.locator('[data-f="landAreaUnit"]').selectOption("sqwa"); assert.ok(/400 ตร\.ม\./.test(await page.locator("[data-land-hint]").innerText()), "the page shows 100 ตร.ว. = 400 ตร.ม.");
    await page.locator('[data-f="area"]').selectOption("hua-hin");
    await page.locator('[data-f="description"]').fill("Seven-photo house, quiet street, near the beach.");
    await page.locator("[data-case-data-save]").click(); await page.waitForSelector("[data-case-data-saved]", { timeout: 20000 }); await H.shot(page, "38-staff-case-data-saved");
    const after = (await db.doc("caseInternal/" + id).get()).data();
    assert.deepStrictEqual([after.bedrooms, after.bathrooms, after.livingArea, after.coordsRaw, after.area], [3, 2, 140, "12.558940,99.909039", "hua-hin"]);
    assert.deepStrictEqual([after.landAreaValue, after.landAreaUnit, after.landAreaSqm, "landSize" in after], [100, "sqwa", 400, false], "D2: the entered value + unit, and the canonical ตร.ม. computed once (the old unitless field is not written)");
    assert.strictEqual(after.listingStatus, "pending"); assert.strictEqual((await db.doc("properties/" + id).get()).exists, false, "still not public"); assert.ok(!("approvedBy" in after), "no approval stamp");
    assert.strictEqual((await db.collection("casePhotos").where("propertyId", "==", id).get()).size, 7, "photos untouched");
    // reopen from scratch: values persist
    await page.goto(site.url + "/Case%20Data.dc.html?id=" + encodeURIComponent(id)); await page.waitForSelector('[data-f="price"]', { timeout: 20000 });
    const reopened = {}; for (const k of ["bedrooms", "bathrooms", "livingArea", "coordsRaw", "description"]) reopened[k] = await page.locator('[data-f="' + k + '"]').inputValue();
    assert.deepStrictEqual(reopened, Object.assign({}, fill, { description: "Seven-photo house, quiet street, near the beach." })); await H.shot(page, "39-staff-case-data-reopened-values-kept");
    // D2 save → reload → edit → save again: the page shows what was ENTERED (100 ตร.ว.), and saving it again never converts twice
    const landNow = async () => ({ v: await page.locator('[data-f="landAreaValue"]').inputValue(), u: await page.locator('[data-f="landAreaUnit"]').inputValue() });
    assert.deepStrictEqual(await landNow(), { v: "100", u: "sqwa" }, "reopened: 100 ตร.ว. as entered (not 400, not the canonical value)");
    for (let i = 0; i < 3; i++) { await page.locator("[data-case-data-save]").click(); await page.waitForSelector("[data-case-data-saved]", { timeout: 20000 }); await page.goto(site.url + "/Case%20Data.dc.html?id=" + encodeURIComponent(id)); await page.waitForSelector('[data-f="price"]', { timeout: 20000 }); assert.deepStrictEqual(await landNow(), { v: "100", u: "sqwa" }, "round " + i); }
    { const r = (await db.doc("caseInternal/" + id).get()).data(); assert.deepStrictEqual([r.landAreaValue, r.landAreaUnit, r.landAreaSqm], [100, "sqwa", 400], "three saves later: still 100 / sqwa / 400 (never 1,600)"); }
    // the other direction: 400 ตร.ม. entered → stored as 400 ตร.ม., shown as 100 ตร.ว. in the other unit; then back to 100 ตร.ว. for the publish step
    await page.locator('[data-f="landAreaValue"]').fill("400"); await page.locator('[data-f="landAreaUnit"]').selectOption("sqm"); assert.ok(/100 ตร\.ว\./.test(await page.locator("[data-land-hint]").innerText()));
    await page.locator("[data-case-data-save]").click(); await page.waitForSelector("[data-case-data-saved]", { timeout: 20000 });
    { const r = (await db.doc("caseInternal/" + id).get()).data(); assert.deepStrictEqual([r.landAreaValue, r.landAreaUnit, r.landAreaSqm], [400, "sqm", 400]); }
    await page.locator('[data-f="landAreaValue"]').fill("100"); await page.locator('[data-f="landAreaUnit"]').selectOption("sqwa"); await page.locator("[data-case-data-save]").click(); await page.waitForSelector("[data-case-data-saved]", { timeout: 20000 });
    { const r = (await db.doc("caseInternal/" + id).get()).data(); assert.deepStrictEqual([r.landAreaValue, r.landAreaUnit, r.landAreaSqm], [100, "sqwa", 400]); }
    // the approvals page now counts the data (the workflow reads the same record)
    await page.goto(site.url + "/Listing%20Approvals.dc.html"); await page.waitForSelector("text=" + id, { timeout: 30000 }); await sleep(2500); await H.shot(page, "40-staff-approvals-after-data-entry");
    // Staff can NOT publish / approve / fake a stamp from the browser (rules), and the Lister Dashboard guard still sends Staff away
    const tryWrite = (fields) => page.evaluate(async ([cid, fields]) => { try { await window.firebase.firestore().doc("caseInternal/" + cid).set(fields, { merge: true }); return "written"; } catch (e) { return e.code || String(e); } }, [id, fields]);
    assert.strictEqual(await tryWrite({ listingStatus: "live" }), "permission-denied", "Staff can not set live");
    assert.strictEqual(await tryWrite({ approvedByRole: "owner", approvedByUid: "x" }), "permission-denied", "Staff can not forge an approval stamp");
    assert.strictEqual((await db.doc("caseInternal/" + id).get()).data().listingStatus, "pending");
    await page.goto(site.url + "/Lister%20Dashboard.dc.html?edit=" + encodeURIComponent(id) + "&from=case"); await page.waitForURL(/Staff%20Workspace/, { timeout: 20000 });
    rec("B11a", "Staff from the real buttons: refused before claiming → claim → open data page → invalid coordinates refused → enter data → save → reopen shows the values; photos/status/public untouched; no Admin SDK seeding of these values", "PASS (local browser + emulators)", "values read back from the Case record; Staff can not write listingStatus=live or approval stamps (rules); Lister Dashboard still redirects Staff");
    await ctx.close();
    // not allowed: a second Staff who has not claimed it, an agent, an outsider (anonymous), signed-out
    ids.staff2 = await mkUser("staff2@example.test"); await db.doc("adminUsers/" + ids.staff2).set({ role: "staff", email: "staff2@example.test", displayName: "Synthetic Staff 2" });
    const s2 = await newPage({}, "staff2"); await loginAdmin(s2.page, "staff2@example.test");
    await s2.page.goto(site.url + "/Case%20Data.dc.html?id=" + encodeURIComponent(id)); await s2.page.waitForSelector("[data-case-data-blocked]", { timeout: 20000 });
    assert.ok(/ยังไม่ใช่งานของคุณ/.test(await s2.page.innerText("body")) && (await s2.page.locator('[data-f="price"]').count()) === 0, "another Staff who has not claimed the case gets no form"); await H.shot(s2.page, "41-other-staff-refused"); await s2.ctx.close();
    const ag = await newPage({}, "agent-edit"); await loginAgent(ag.page, "agent@example.test");
    await ag.page.goto(site.url + "/Case%20Data.dc.html?id=" + encodeURIComponent(id)); await ag.page.waitForSelector("[data-case-data-blocked]", { timeout: 20000 });
    assert.ok(/ไม่มีสิทธิ์/.test(await ag.page.innerText("body")) && (await ag.page.locator('[data-f="price"]').count()) === 0, "an agent gets no form"); await H.shot(ag.page, "42-agent-refused");
    const agWrite = await ag.page.evaluate(async (cid) => { const out = {}; try { await window.firebase.firestore().doc("caseInternal/" + cid).set({ price: 1 }, { merge: true }); out.write = "written"; } catch (e) { out.write = e.code; } try { await window.firebase.firestore().doc("caseInternal/" + cid).get(); out.read = "read"; } catch (e) { out.read = e.code; } return out; }, id);
    assert.deepStrictEqual(agWrite, { write: "permission-denied", read: "permission-denied" }); await ag.ctx.close();
    const an = await newPage({}, "anon-edit"); await an.page.goto(site.url + "/Case%20Data.dc.html?id=" + encodeURIComponent(id)); await an.page.waitForSelector("[data-case-data-blocked]", { timeout: 20000 });
    assert.ok(/ต้องเข้าสู่ระบบ/.test(await an.page.innerText("body"))); await an.ctx.close();
    assert.strictEqual((await db.doc("caseInternal/" + id).get()).data().price, 6100000, "nobody else changed the case");
    rec("B11b", "refused: another Staff who has not claimed the case (page), an agent (page + direct read/write denied by rules), signed-out visitor", "PASS (local browser + emulators)", "assignment is enforced by the page, not by Firestore rules (rules let any Staff write non-stamp fields — unchanged, documented)");
  });
  it("B12 (FX-3 / DOC-OBS-05) Details page states: LOADING is never shown as 'not found'; a closed/unknown listing says so (one message, 8 languages, way back to search, nothing private); a failed load says 'could not load' with a retry — never a blank page", async () => {
    // 1. the listing taken down in B9 (public record + photos gone) and an id that never existed: the SAME not-found view
    const closed = await newPage({}, "public-closed-detail");
    await closed.page.goto(site.url + "/Property%20Details.dc.html?id=" + ids.outsiderCase);
    await closed.page.waitForSelector("[data-view-state=notfound]", { timeout: 30000 }); await H.shot(closed.page, "52-details-closed-listing-not-found-state");
    const body = await closed.page.innerText("body");
    assert.ok(/ไม่พบประกาศนี้/.test(body), "visible not-found message (Thai)"); assert.ok(!/7,500,000|Synthetic|0800000001|trackToken/.test(body), "nothing from the case is shown");
    assert.strictEqual(await closed.page.locator("[data-view-state-back]").getAttribute("href"), "Search Results.dc.html"); assert.strictEqual(await closed.page.locator("[data-view-state-retry]").count(), 0, "no retry on a plain not-found");
    const never = await newPage({}, "public-never-existed"); await never.page.goto(site.url + "/Property%20Details.dc.html?id=NO-SUCH-LISTING");
    await never.page.waitForSelector("[data-view-state=notfound]", { timeout: 30000 });
    assert.strictEqual((await never.page.innerText("[data-view-state]")).trim(), (await closed.page.innerText("[data-view-state]")).trim(), "closed and never-existed look identical (no hint that a private case exists)");
    assert.strictEqual(closed.page.__logs.navs.length, 1, "no automatic reload"); await never.ctx.close(); await closed.ctx.close();
    // 2. slow data: while the data is on its way the page says LOADING and never "not found"
    const slow = await newPage({}, "public-slow-detail"); slow.ctx.__fault = { delayMs: 3000 };
    await slow.page.goto(site.url + "/Property%20Details.dc.html?id=NO-SUCH-LISTING");
    await slow.page.waitForSelector("[data-view-state=loading]", { timeout: 30000 });
    assert.ok(!/ไม่พบประกาศนี้/.test(await slow.page.innerText("body")), "while loading, the page must not say not found"); assert.ok(/กำลังโหลดประกาศ/.test(await slow.page.innerText("[data-view-state]")));
    await H.shot(slow.page, "53-details-loading-state");
    await slow.page.waitForSelector("[data-view-state=notfound]", { timeout: 40000 }); await slow.ctx.close();
    // 3. failed load: a different message, with a manual retry; never "not found"
    const bad = await newPage({}, "public-failed-detail-state"); bad.ctx.__fault = { failFirebase: true };
    await bad.page.goto(site.url + "/Property%20Details.dc.html?id=" + ids.outsiderCase);
    await bad.page.waitForSelector("[data-view-state=failed]", { timeout: 40000 });
    assert.ok(/โหลดประกาศไม่สำเร็จ/.test(await bad.page.innerText("body")) && !/ไม่พบประกาศนี้/.test(await bad.page.innerText("[data-view-state]")), "failed is not 'not found'");
    assert.strictEqual(await bad.page.locator("[data-view-state-retry]").count(), 1, "manual retry offered"); assert.strictEqual(bad.page.__logs.navs.length, 1, "still no AUTOMATIC reload");
    await H.shot(bad.page, "54-details-failed-load-state"); await bad.ctx.close();
    // 4. all 8 languages: each shows its own, distinct, non-empty not-found title (no raw key, no 'undefined')
    const titles = {};
    for (const lang of ["th", "en", "ru", "no", "de", "zh", "fr", "it"]) {
      const lp = await newPage({}, "public-notfound-" + lang); await lp.ctx.addInitScript((l) => { try { localStorage.setItem("hh_lang", l); } catch (e) { /* none */ } }, lang);
      await lp.page.goto(site.url + "/Property%20Details.dc.html?id=NO-SUCH-LISTING"); await lp.page.waitForSelector("[data-view-state=notfound]", { timeout: 30000 });
      const txt = (await lp.page.innerText("[data-view-state]")).trim(); titles[lang] = txt.split("\n")[0].trim();
      assert.ok(txt.length > 20 && !/undefined|detail_state/.test(txt), lang + ": real text, no raw key"); await lp.ctx.close();
    }
    assert.strictEqual(new Set(Object.values(titles)).size, 8, "8 different languages: " + JSON.stringify(titles));
    // 5. (Work review) the retry button: ONE user-caused navigation, nothing automatic before or after
    const rt = await newPage({}, "public-retry"); rt.ctx.__fault = { failFirebase: true };
    await rt.page.goto(site.url + "/Property%20Details.dc.html?id=" + ids.outsiderCase); await rt.page.waitForSelector("[data-view-state=failed]", { timeout: 40000 });
    assert.strictEqual(rt.page.__logs.navs.length, 1, "before the click: exactly the first load"); await sleep(3000); assert.strictEqual(rt.page.__logs.navs.length, 1, "nothing reloads by itself while the failed state is shown");
    await Promise.all([rt.page.waitForNavigation({ timeout: 30000 }), rt.page.locator("[data-view-state-retry]").click()]);
    await rt.page.waitForSelector("[data-view-state=failed]", { timeout: 40000 }); await sleep(3000);
    assert.strictEqual(rt.page.__logs.navs.length, 2, "the click caused exactly ONE navigation (and nothing after it): " + JSON.stringify(rt.page.__logs.navs)); await rt.ctx.close();
    // 6. direct fetch fails while the collection loads fine → "could not load", NOT "not found"
    const df = await newPage({}, "public-direct-fetch-fails");
    await df.ctx.route("**/firebase-client.js", async (route) => { const r = await route.fetch(); let body = await r.text(); const k = "export async function fetchDocById(collectionName, id) {"; if (!body.includes(k)) throw new Error("patch target missing"); route.fulfill({ response: r, body: body.replace(k, k + " if (window.__failDirect) throw new Error('injected direct read failure');") }); });
    await df.ctx.addInitScript(() => { window.__failDirect = true; });
    await df.page.goto(site.url + "/Property%20Details.dc.html?id=NO-SUCH-LISTING");
    await df.page.waitForSelector("[data-view-state=failed], [data-view-state=notfound]", { timeout: 40000 });
    assert.strictEqual(await df.page.getAttribute("[data-view-state]", "data-view-state"), "failed", "direct read failed while the collection loaded → failed, never not-found");
    assert.strictEqual(await df.page.evaluate(() => window.__hhDataLoad.state), "ok", "(the collection itself loaded fine)"); await H.shot(df.page, "55-details-direct-read-failed-state"); await df.ctx.close();
    // 7. ALL texts of ALL states in ALL 8 languages (loading / not found / failed / retry / back) — what is on the screen is exactly the language's dictionary entry, distinct per language
    const LANGS = ["th", "en", "ru", "no", "de", "zh", "fr", "it"], KEYS = ["detail_state_loading", "detail_state_notfound_title", "detail_state_notfound_text", "detail_state_failed_title", "detail_state_failed_text", "detail_state_back", "detail_state_retry"];
    const probe = await newPage({}, "i18n-dict"); await probe.page.goto(site.url + "/Property%20Details.dc.html?id=NO-SUCH-LISTING"); await probe.page.waitForSelector("[data-view-state]", { timeout: 30000 });
    const dict = await probe.page.evaluate(async (ls) => { const m = await import("./data.js"); return Object.fromEntries(ls.map((l) => [l, m.I18N[l]])); }, LANGS); await probe.ctx.close();
    for (const k of KEYS) { const vals = LANGS.map((l) => dict[l][k]); assert.ok(vals.every((v) => typeof v === "string" && v.trim().length > 1 && !/undefined/.test(v)), k + " exists in all 8 languages"); if (k !== "detail_state_back" || true) assert.strictEqual(new Set(vals).size, 8, k + " is different in every language (no copied English): " + JSON.stringify(vals)); }
    const shown = async (lang, url, fault, selector, want) => { const lp = await newPage({}, "i18n-" + want + "-" + lang); if (fault) lp.ctx.__fault = fault; await lp.ctx.addInitScript((l) => { try { localStorage.setItem("hh_lang", l); } catch (e) { /* none */ } }, lang);
      await lp.page.goto(site.url + url); await lp.page.waitForSelector(selector, { timeout: 45000 }); const txt = await lp.page.innerText("[data-view-state]"); await lp.ctx.close(); return txt; };
    const results = await Promise.all(LANGS.map(async (lang) => ({ lang,
      notfound: await shown(lang, "/Property%20Details.dc.html?id=NO-SUCH-LISTING", null, "[data-view-state=notfound]", "nf"),
      failed: await shown(lang, "/Property%20Details.dc.html?id=NO-SUCH-LISTING", { failFirebase: true }, "[data-view-state=failed]", "fail"),
      loading: await shown(lang, "/Property%20Details.dc.html?id=NO-SUCH-LISTING", { delayMs: 3000 }, "[data-view-state=loading]", "load") })));
    for (const r of results) { const d = dict[r.lang];
      for (const need of [d.detail_state_notfound_title, d.detail_state_notfound_text, d.detail_state_back]) assert.ok(r.notfound.includes(need), r.lang + " not-found shows: " + need);
      for (const need of [d.detail_state_failed_title, d.detail_state_failed_text, d.detail_state_retry, d.detail_state_back]) assert.ok(r.failed.includes(need), r.lang + " failed shows: " + need);
      assert.ok(r.loading.includes(d.detail_state_loading), r.lang + " loading shows: " + d.detail_state_loading); }
    rec("B12", "Details page states (FX-3): loading is never 'not found'; closed and never-existed listings show the same not-found message with a way back to search and nothing private; a failed load shows a different message with manual retry; the not-found text exists in all 8 languages", "PASS (local browser + emulators)", "no automatic reload in any state");
  });
  it("B13 (FX-2 / DOC-OBS-03) public Details page: an unknown distance or zone is HIDDEN (never '0 กม.' / 'undefined'); a stored 0 and real coordinates still show", async () => {
    const base = { status: "sale", type: "house", area: "hua-hin", price: 5000000, bedrooms: 3, bathrooms: 2, livingArea: 120, listingStatus: "live", isDraft: false, features: [], source: "owner_submission", internalSplit: true, publishedAt: Date.now(), expiresAt: Date.now() + 86400000 };
    await db.doc("properties/fx2-unknown").set({ ...base, title: { th: "ทดสอบไม่ทราบระยะ", en: "Unknown distance" } });                                       // what a Case projection looks like: no coordinates, no zone, no distances
    await db.doc("properties/fx2-zero").set({ ...base, title: { th: "ทดสอบศูนย์จริง", en: "Real zero" }, distanceBeach: 0, distanceTown: 3.5, zone: { th: "ทดสอบโซน", en: "Test zone" } });
    await db.doc("properties/fx2-coords").set({ ...base, title: { th: "ทดสอบพิกัด", en: "Coordinates" }, mapLink: "12.5683,99.9577", mapDisplayMode: "area" });
    const body = async (id) => { const pg = await newPage({}, "fx2-" + id); await pg.page.goto(site.url + "/Property%20Details.dc.html?id=" + id); await waitFor(async () => /5,000,000/.test(await pg.page.innerText("body")), 30000, "details of " + id); await sleep(1500); const t = await pg.page.innerText("body"); await H.shot(pg.page, "56-details-" + id); await pg.ctx.close(); return t; };
    const unknown = await body("fx2-unknown");
    assert.ok(!/undefined/.test(unknown), "no 'undefined' anywhere"); assert.ok(!/(^|[^\d.])0(\.0)?\s*กม/.test(unknown) && !/(^|[^\d.])0(\.0)?\s*km/i.test(unknown), "no '0 km' written for an unknown distance");
    assert.ok(!/กม\.?\s*ถึง/.test(unknown), "no distance line at all when there is no evidence"); assert.ok(/บริเวณโดยประมาณ/.test(unknown) || /General area/i.test(unknown), "the general-area badge is still there (without a zone name)");
    const zero = await body("fx2-zero");
    assert.ok(/(^|[^\d.])0\s*กม\.?\s*ถึง/.test(zero), "a stored 0 is a real distance and is kept: " + (zero.match(/.{0,20}กม.{0,30}/g) || []).join(" | ")); assert.ok(/3\.5\s*กม/.test(zero), "a stored 3.5 is shown"); assert.ok(/ทดสอบโซน/.test(zero), "a real zone name is shown"); assert.ok(!/undefined/.test(zero));
    const coords = await body("fx2-coords");
    assert.ok(/\d+(\.\d)?\s*กม\.?\s*ถึง/.test(coords), "coordinates on the record → the figure is still shown"); assert.ok(!/undefined/.test(coords));
    // the Search card: no empty " · " prefix when there is no zone
    const sp = await newPage({}, "fx2-search"); await sp.page.goto(site.url + "/Search%20Results.dc.html"); await waitFor(async () => /ทดสอบไม่ทราบระยะ|Unknown distance/.test(await sp.page.innerText("body")), 30000, "unknown-distance listing in search");
    const cardText = await sp.page.evaluate(() => { const a = Array.from(document.querySelectorAll("a")).find((x) => /id=fx2-unknown/.test(x.getAttribute("href") || "")); return a ? a.innerText : ""; });
    assert.ok(cardText && !/^\s*·/m.test(cardText) && !/undefined/.test(cardText), "search card has no empty zone prefix: " + JSON.stringify(cardText.slice(0, 120))); await H.shot(sp.page, "57-search-card-no-zone"); await sp.ctx.close();
    for (const id of ["fx2-unknown", "fx2-zero", "fx2-coords"]) await db.doc("properties/" + id).delete();
    rec("B13", "FX-2: unknown distance/zone hidden (no 0 km / undefined); stored 0 and real coordinates kept; search card has no empty zone prefix", "PASS (local browser + emulators)", "synthetic documents written straight to the emulator; deleted afterwards");
  });
  // ───────────────────────── Work review r6: what the un-wrapped COMPONENTS do now (build = tools/build-listing-test.js, 4 components: ContactRail, LanguageSwitcher, PropertyCard, SearchFilters)
  const FN_DENY = /startConversation|sendConversationTurn|receptionTurn|claudeComplete|createCaseFromConversation|submitListingCase|addCasePhotos|publishListingCase|unpublishListingCase|syncListingCase|trackListingCase|getCasePhoto|reconcileListingFiles/;
  const countAll = async () => { const out = {}; for (const c of await db.listCollections()) out[c.id] = (await c.get()).size; out["(messages)"] = (await db.collectionGroup("messages").get()).size; out["(submissions)"] = (await db.collectionGroup("submissions").get()).size; return out; };
  const authUsers = async () => (await auth.listUsers(1000)).users.map((u) => ({ uid: u.uid, anon: !(u.providerData && u.providerData.length) && !u.email }));

  it("B14 merely OPENING a page that carries the chat rail (ContactRail) creates no case, no conversation, no message, no lead, calls no Function and no production/AI endpoint; the only backend effect is the existing anonymous sign-in", async () => {
    const PAGES = ["Home.dc.html", "Search%20Results.dc.html", "Property%20Details.dc.html?id=NO-SUCH-LISTING", "About.dc.html", "Contact.dc.html", "index.html"];
    const E = H.emulators(); const report = [];
    for (const pg of PAGES) {
      const before = await countAll(), usersBefore = await authUsers();
      const c = await newPage({}, "open-only-" + pg.split(".")[0]); const fnCalls = [];
      c.page.on("request", (r) => { try { const u = new URL(r.url()); if (Number(u.port) === E.fnPort) fnCalls.push(u.pathname.split("/").pop()); } catch (e) { /* data: */ } });
      await c.page.goto(site.url + "/" + pg); await sleep(8000); // the rail's init (properties, AI notes, existing-reception lookup) and its 1.5 s auto-greeting timer have all run by now
      const after = await countAll(), usersAfter = await authUsers();
      assert.deepStrictEqual(after, before, pg + ": no document was created in any collection (cases, conversations, messages, leads, submissions…)");
      assert.deepStrictEqual(fnCalls.filter((f) => FN_DENY.test(f)), [], pg + ": no chat / case Function was called by opening the page: " + JSON.stringify(fnCalls));
      assert.deepStrictEqual(c.ctx.__log.prodHits, [], pg + ": no production URL requested"); assert.deepStrictEqual(c.ctx.__log.external.filter((u) => /run\.app|cloudfunctions\.net|claudecomplete|5f1b5|huahin\.properties/i.test(u)), [], pg + ": no AI / production endpoint requested");
      const created = usersAfter.filter((u) => !usersBefore.some((b) => b.uid === u.uid)); assert.ok(created.every((u) => u.anon) && created.length <= 1, pg + ": the only Auth change is at most ONE anonymous visitor (existing rail behaviour): " + JSON.stringify(created));
      report.push(pg.split(".")[0] + " → functions=" + JSON.stringify(fnCalls) + ", new anonymous users=" + created.length); await c.ctx.close();
    }
    rec("B14", "opening Home / Search / Details / About / Contact / index: zero documents created in any collection, zero chat/case Function calls, zero production or AI endpoint requests; the rail's init reads data and signs the visitor in anonymously (existing behaviour, at most one anonymous user per visit) — " + report.join("; "), "PASS (local browser + emulators)", "the rail's auto-greeting is a local-only message (no backend); a conversation starts only when the visitor sends a message (not tested here: would call the gated chat Functions)");
  });

  it("B15 a COMPONENT file opened by its URL runs nothing: no script engine, no Firestore / Auth / Functions / Storage request, no external request (only the TEST guard + config load); entry pages still start only through the guard", async () => {
    const E = H.emulators(); const comps = ["ContactRail", "LanguageSwitcher", "PropertyCard", "SearchFilters"];
    for (const name of comps) {
      const before = await countAll(), usersBefore = (await authUsers()).length;
      const c = await newPage({}, "component-direct-" + name); const hits = [];
      c.page.on("request", (r) => { try { const u = new URL(r.url()); if (u.port && [E.fnPort, E.fsPort, E.stPort].includes(Number(u.port))) hits.push(u.port + u.pathname.slice(0, 40)); if (/identitytoolkit|securetoken/.test(u.hostname)) hits.push(u.hostname); } catch (e) { /* none */ } });
      await c.page.goto(site.url + "/" + name + ".dc.html"); await sleep(3000);
      assert.deepStrictEqual(hits, [], name + ": opening the component file called a backend: " + JSON.stringify(hits));
      assert.deepStrictEqual(await countAll(), before, name + ": nothing written"); assert.strictEqual((await authUsers()).length, usersBefore, name + ": no sign-in");
      assert.deepStrictEqual(c.ctx.__log.prodHits, []); assert.deepStrictEqual(c.ctx.__log.external, [], name + ": no external request");
      assert.strictEqual(await c.page.evaluate(() => !!(window.firebase || window.React || document.querySelector("script[src*='support']"))), false, name + ": no runtime / SDK was loaded");
      assert.ok(await c.page.evaluate(() => !!document.getElementById("chat-live-bar") || !!document.querySelector("[data-chat-live-stop]")), name + ": the TEST guard ran first"); await c.ctx.close();
    }
    // entry pages: the page content is still inert until the guard has passed (template wrapper + guard-first), and starts only through __chatLiveStart
    const entry = await newPage({}, "entry-inert"); await entry.page.goto(site.url + "/Property%20Details.dc.html?id=NO-SUCH-LISTING", { waitUntil: "domcontentloaded" });
    assert.strictEqual(await entry.page.evaluate(() => !!document.getElementById("chat-live-app") || !!window.__CHAT_LIVE_OK__), true, "entry: template + guard config present"); await entry.page.waitForSelector("[data-view-state]", { timeout: 30000 }); await entry.ctx.close();
    rec("B15", "4 component files opened directly: no script engine/SDK loaded, no backend or external request, nothing written, no sign-in, TEST guard ran; entry pages start only through the guard", "PASS (local browser + emulators)", "static side: tests/listing/hosting-build.test.js (component files carry only config + guard scripts)");
  });

  it("B16 (FX-1, two different accounts) the intake-approval stamp and the publish-approval stamp are shown for the person of THAT event; the approved submission is the one in approvedSubmissionId, a rejected submission is never the approver; the public record carries neither", async () => {
    const tplSnap = await db.doc("caseInternal/" + (ids.sevenCase || ids.agentCase)).get(); assert.ok(tplSnap.exists, "template case");
    const tpl = tplSnap.data(); const now = Date.now();
    const mk = async (id, extra, subs) => {
      const rec1 = { ...tpl, ...extra, source: "owner_submission", internalSplit: true, listingStatus: "live", reviewStatus: "approved", submissionCount: Object.keys(subs).length, intakeCompletedAt: now - 3000, approvedAt: now - 1000, publishedAt: now - 1000 };
      await db.doc("caseInternal/" + id).set(rec1);
      for (const [sid, v] of Object.entries(subs)) await db.doc("properties/" + id + "/submissions/" + sid).set({ submittedAt: now - 9000, reviewedAt: now - 5000, ...v });
    };
    // case 1: approvedSubmissionId names the approved one; a LATER rejected submission by someone else must not be shown as approver
    await mk("fx1-two-accounts", { approvedSubmissionId: "s-ok", approvedByEmail: "owner@example.test", approvedByUid: ids.owner, approvedByRole: "owner" }, { "s-old-rej": { reviewResult: "returned", reviewedBy: "rejecter-old@example.test", reviewedAt: now - 8000 }, "s-ok": { reviewResult: "approved", reviewedBy: "owner2@example.test", reviewedAt: now - 5000 }, "s-new-rej": { reviewResult: "returned", reviewedBy: "rejecter-new@example.test", reviewedAt: now - 2000 } });
    // case 2: no approvedSubmissionId → the newest APPROVED one, never the newer rejected one
    await mk("fx1-no-id", { approvedSubmissionId: null, approvedByEmail: "owner@example.test", approvedByRole: "owner" }, { "a-ok": { reviewResult: "approved", reviewedBy: "owner2@example.test", reviewedAt: now - 5000 }, "b-rej": { reviewResult: "returned", reviewedBy: "rejecter-x@example.test", reviewedAt: now - 2000 } });
    // case 3: the publish stamp has only a ROLE (no e-mail) → labelled as a role, never as a person; the intake line has no reviewer recorded
    await mk("fx1-role-only", { approvedSubmissionId: "s1", approvedByEmail: "", approvedByUid: "", approvedByRole: "owner" }, { s1: { reviewResult: "approved", reviewedBy: "", reviewedAt: now - 5000 } });
    const ctx = await newPage({}, "fx1-two"); await loginAdmin(ctx.page, "owner@example.test"); await ctx.page.goto(site.url + "/Listing%20Approvals.dc.html");
    const cardText = async (id) => { await waitFor(async () => (await ctx.page.innerText("body")).includes(id), 30000, "case card " + id); return ctx.page.evaluate((cid) => { const leaf = Array.from(document.querySelectorAll("*")).find((e) => e.children.length === 0 && (e.textContent || "").trim() === cid); let n = leaf; for (let k = 0; k < 14 && n && n.parentElement; k++) { n = n.parentElement; if (/อนุมัติรับเรื่องโดย/.test(n.innerText || "")) return n.innerText; } return n ? n.innerText : ""; }, id); };
    await waitFor(async () => { const t = await cardText("fx1-two-accounts"); return /อนุมัติรับเรื่องโดย owner2@example\.test/.test(t) && /อนุมัติเผยแพร่โดย owner@example\.test/.test(t); }, 30000, "two different accounts shown on their own events");
    const t1 = await cardText("fx1-two-accounts"); assert.ok(!/rejecter-(old|new)@example\.test/.test(t1), "a rejected submission's reviewer is never shown as the approver"); assert.ok(!/อนุมัติรับเรื่องโดย owner@example\.test/.test(t1) && !/อนุมัติเผยแพร่โดย owner2@example\.test/.test(t1), "the two stamps are not swapped");
    await waitFor(async () => /อนุมัติรับเรื่องโดย owner2@example\.test/.test(await cardText("fx1-no-id")), 30000, "no approvedSubmissionId → the newest APPROVED submission");
    const t2 = await cardText("fx1-no-id"); assert.ok(!/rejecter-x@example\.test/.test(t2), "the newer rejected submission is not the approver");
    await waitFor(async () => /อนุมัติเผยแพร่โดย ไม่มีอีเมลบันทึก \(บทบาทที่บันทึก: owner\)/.test(await cardText("fx1-role-only")), 30000, "role-only stamp is labelled as a role");
    const t3 = await cardText("fx1-role-only"); assert.ok(/อนุมัติรับเรื่องโดย ไม่มีบันทึกผู้ดำเนินการ/.test(t3), "no reviewer recorded → says so"); assert.ok(!/อนุมัติ(รับเรื่อง|เผยแพร่)โดย owner(\s|$)/.test(t3), "a role is never used as a person's name");
    await H.shot(ctx.page, "58-approvals-two-accounts-stamps");
    // the public side: a public properties document is built by the server from an allow-list; here the records' approver fields exist ONLY in caseInternal
    for (const id of ["fx1-two-accounts", "fx1-no-id", "fx1-role-only"]) { assert.strictEqual((await db.doc("properties/" + id).get()).exists, false, "no public document was created by the page"); }
    await ctx.ctx.close();
    for (const id of ["fx1-two-accounts", "fx1-no-id", "fx1-role-only"]) { for (const sd of (await db.collection("properties/" + id + "/submissions").get()).docs) await sd.ref.delete(); await db.doc("caseInternal/" + id).delete(); }
    rec("B16", "FX-1 with two accounts: intake approver (owner2) ≠ publisher (owner) shown on their own events; approvedSubmissionId respected; rejected submissions never shown as approver; role-only stamp labelled as a role; nothing written to public data", "PASS (local browser + emulators)", "synthetic records written directly to the emulator and deleted afterwards");
  });
  it("B17 the components that now run on the built site work for a visitor: Search (cover photo, filter, language switch) and Details (language switch, photo, states); Lister Dashboard (LanguageSwitcher + SearchFilters) was exercised by B4", async () => {
    const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const base = { status: "sale", type: "house", area: "hua-hin", listingStatus: "live", isDraft: false, features: [], source: "owner_submission", internalSplit: true, livingArea: 100, bathrooms: 2, publishedAt: Date.now(), expiresAt: Date.now() + 86400000 };
    await db.doc("properties/fx17-alpha").set({ ...base, price: 4100000, bedrooms: 2, title: { th: "อัลฟาทดสอบ", en: "Alpha test" }, photos: [{ label: "Photo 1" }] });
    await db.doc("properties/fx17-beta").set({ ...base, price: 9300000, bedrooms: 5, title: { th: "เบต้าทดสอบ", en: "Beta test" }, photos: [{ label: "Photo 1" }] });
    await db.doc("propertyPhotos/fx17-beta-0").set({ propertyId: "fx17-beta", index: 0, dataUrl: PNG });
    const v = await newPage({}, "fx17-search"); await v.page.goto(site.url + "/Search%20Results.dc.html");
    await waitFor(async () => /4,100,000/.test(await v.page.innerText("body")) && /9,300,000/.test(await v.page.innerText("body")), 30000, "both synthetic listings in Search");
    // cover photo: the listing WITH a photo shows a decoded image, the one without shows none (and no broken image)
    const cover = (id) => v.page.evaluate((cid) => { const a = Array.from(document.querySelectorAll("a")).find((x) => (x.getAttribute("href") || "").endsWith("id=" + cid)); const img = a && Array.from(a.querySelectorAll("img")).find((i) => /^data:image/.test(i.src)); return { has: !!img, w: img ? img.naturalWidth : 0 }; }, id);
    await waitFor(async () => (await cover("fx17-beta")).w > 0, 20000, "cover photo decoded for the listing that has a photo"); assert.strictEqual((await cover("fx17-alpha")).has, false, "no photo → no image element");
    // SearchFilters: the keyword filter narrows the list
    await v.page.locator("input[placeholder*='HH-101']").first().fill("เบต้า"); await v.page.locator("input[placeholder*='HH-101']").first().blur();
    await waitFor(async () => { const t = await v.page.innerText("body"); return /9,300,000/.test(t) && !/4,100,000/.test(t); }, 15000, "keyword filter shows only the matching listing"); await H.shot(v.page, "59-search-filter-keyword");
    // LanguageSwitcher: choose English → the page text changes and the choice is remembered
    const nav = await v.page.evaluate(async () => { const m = await import("./data.js"); return { th: m.I18N.th.nav_buy, en: m.I18N.en.nav_buy, thSearch: m.I18N.th.nav_rent, enSearch: m.I18N.en.nav_rent }; });
    const navText = async () => v.page.evaluate(() => Array.from(document.querySelectorAll("a")).map((a) => (a.innerText || "").trim()).filter(Boolean));
    assert.ok((await navText()).includes(nav.th), "starts in Thai: " + JSON.stringify(await navText()));
    await v.page.locator("text=ไทย").first().click(); await v.page.locator("text=English").first().click();
    await waitFor(async () => (await navText()).includes(nav.en) && !(await navText()).includes(nav.th), 15000, "navigation switched to English"); assert.strictEqual(await v.page.evaluate(() => localStorage.getItem("hh_lang")), "en", "the language choice is remembered");
    await H.shot(v.page, "60-search-english"); await v.ctx.close();
    // Details: photo + language switch
    const d = await newPage({}, "fx17-details"); await d.page.goto(site.url + "/Property%20Details.dc.html?id=fx17-beta");
    await waitFor(async () => /9,300,000/.test(await d.page.innerText("body")), 30000, "details of the listing");
    await waitFor(async () => d.page.evaluate(() => Array.from(document.querySelectorAll("img")).some((i) => /^data:image/.test(i.src) && i.naturalWidth > 0)), 20000, "details photo decoded");
    const dTitle = async () => d.page.evaluate(() => (document.querySelector("h1") || {}).innerText || "");
    assert.ok(/เบต้า/.test(await d.page.innerText("body")), "Thai title"); await d.page.locator("text=ไทย").first().click(); await d.page.locator("text=English").first().click();
    await waitFor(async () => /Beta test/.test(await d.page.innerText("body")) && !/เบต้าทดสอบ/.test(await d.page.innerText("body")), 15000, "details switched to English"); await H.shot(d.page, "61-details-english"); await d.ctx.close();
    for (const id of ["fx17-alpha", "fx17-beta"]) await db.doc("properties/" + id).delete(); await db.doc("propertyPhotos/fx17-beta-0").delete();
    rec("B17", "built site, components running: Search shows the cover photo (decoded) only where there is one, the keyword filter narrows the list, the language switcher changes the page and is remembered; Details shows the photo and switches language", "PASS (local browser + emulators)", "synthetic documents written to the emulator and deleted afterwards; forms and Staff pages (Owner Submission, Case Data, Staff Workspace, Listing Approvals) carry no component — their tests B1–B11 are unchanged");
  });
  it("B18 (what a visitor SEES when they send a message in the rail on the TEST site): the chat Functions are unreachable or not deployed — no AI answer, no case, no production endpoint, and a polite error/contact message", async () => {
    const E = H.emulators(); const seen = {};
    for (const scenario of ["unreachable (the sandbox blocks the project's own Function host)", "not deployed (404 injected)"]) {
      const casesBefore = (await db.collection("caseInternal").get()).size, usersBefore = (await authUsers()).length;
      const c = await newPage({}, "rail-send"); const calls = [];
      if (/not deployed/.test(scenario)) await c.ctx.route(new RegExp(":" + E.fnPort + "/"), (r) => r.fulfill({ status: 404, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ error: { status: "NOT_FOUND", message: "not deployed (injected)" } }) }));
      c.page.on("response", (r) => { try { const u = new URL(r.url()); if (Number(u.port) === E.fnPort) calls.push(u.pathname.split("/").pop() + ":" + r.status()); } catch (e) { /* data: */ } });
      await c.page.goto(site.url + "/Search%20Results.dc.html"); await sleep(5000);
      await c.page.locator("text=แชทกับเรา").first().click(); const input = c.page.locator("input[placeholder*='พิมพ์หรือกด']").first(); await input.waitFor({ timeout: 15000 });
      const botBefore = await c.page.evaluate(() => document.body.innerText.length); await input.fill("สวัสดีค่ะ ขอสอบถามบ้านหน่อย"); await input.press("Enter"); await sleep(9000);
      const txt = await c.page.innerText("body");
      assert.ok(/ขออภัย|ติดต่อเรา|เกิดข้อผิดพลาด/.test(txt), scenario + ": the visitor sees a polite error / contact message, not an AI answer");
      assert.ok(calls.every((x) => !/:200$/.test(x) || !/claudeComplete|receptionTurn|sendConversationTurn|createCaseFromConversation/.test(x)), scenario + ": no chat Function answered 200 (no AI generation): " + JSON.stringify(calls));
      assert.strictEqual((await db.collection("caseInternal").get()).size, casesBefore, scenario + ": no case created"); assert.deepStrictEqual(c.ctx.__log.prodHits, [], "no production URL");
      assert.deepStrictEqual(c.ctx.__log.external.filter((u) => /run\.app|claudecomplete-|5f1b5|huahin\.properties/i.test(u)), [], scenario + ": no production endpoint requested");
      const testEndpoint = c.ctx.__log.external.filter((u) => /cloudfunctions\.net/.test(u)).map((u) => new URL(u).hostname + new URL(u).pathname); // the TEST project's OWN claudeComplete URL (guard-bound); the sandbox blocks it, on Cloud TEST it is the gated function
      assert.ok(testEndpoint.every((u) => u.startsWith("asia-southeast1-" + H.CFG.projectId + ".cloudfunctions.net/")), scenario + ": any external Function URL is the TEST project's own: " + JSON.stringify(testEndpoint));
      seen[scenario] = "calls=" + JSON.stringify(calls) + "; TEST-project claudeComplete URL attempted (blocked here)=" + JSON.stringify(testEndpoint) + "; new anonymous users=" + ((await authUsers()).length - usersBefore); await H.shot(c.page, /not deployed/.test(scenario) ? "63-rail-send-not-deployed" : "62-rail-send-gated"); await c.ctx.close();
    }
    rec("B18", "a visitor sending a message in the chat rail on the TEST site: " + JSON.stringify(seen), "PASS (local browser + emulators)", "the gate is untouched (not opened, not bypassed, not exercised here: the harness blocks the project\'s own Function host, so the gate\'s 401/403 answers are covered by the chat-live tests, not by this one); on Cloud TEST the chat Functions are not deployed (old CHAT-LIVE script paused at 6/8) → this is what a visitor sees there");
  });
  // ───────────────────────── D2 land size (owner decision 3 ต.ค. 2569): ตร.ว. or ตร.ม., 1 ตร.ว. = 4 ตร.ม.; old unitless data never guessed or converted
  const LANGS8 = ["th", "en", "ru", "no", "de", "zh", "fr", "it"];
  const landText = (d, lang) => `${d.value} ${d.t[lang].sqwa} (${d.sqm} ${d.t[lang].sqm})`;

  it("B19 Staff → Owner preview → publish shows the land size correctly: 100 ตร.ว. (400 ตร.ม.) in the Owner's preview and on the public page, in all 8 languages", async () => {
    const id = ids.sevenCase; assert.ok(id, "needs the case from B10/B11 (Staff entered 100 ตร.ว. through Case Data)");
    const rec0 = (await db.doc("caseInternal/" + id).get()).data(); assert.deepStrictEqual([rec0.landAreaValue, rec0.landAreaUnit, rec0.landAreaSqm], [100, "sqwa", 400], "the Staff's entry through the page");
    // scaffolding only for the intake step (it is covered by B5/B6): the Owner's intake decision is recorded directly so the publish preview of THIS case can be reached
    await db.doc("caseInternal/" + id).update({ reviewStatus: "approved", approvedSubmissionId: "syn-sub-d2" });
    const keep = ids.outsiderCase; ids.outsiderCase = id; // the helpers act on ids.outsiderCase
    try {
      const o = await newPage({}, "owner-d2"); await loginAdmin(o.page, "owner@example.test"); await openCase(o.page);
      await clickInCase(o.page, APPROVE); await o.page.waitForSelector("[data-preview-confirm]", { timeout: 30000 }); await preview(o.page, "ready", 40000);
      const dialog = await o.page.evaluate(() => { const b = document.querySelector("[data-preview-confirm]"); let n = b; for (let i = 0; i < 6 && n && n.parentElement; i++) n = n.parentElement; return n ? n.innerText : ""; });
      assert.ok(/ที่ดิน\s*\n?\s*100 ตร\.ว\. \(400 ตร\.ม\.\)/.test(dialog) || /100 ตร\.ว\. \(400 ตร\.ม\.\)/.test(dialog), "the Owner's preview shows 100 ตร.ว. (400 ตร.ม.): " + dialog.slice(0, 600)); assert.ok(!/ไม่ระบุหน่วย/.test(dialog), "no 'unit not specified' for a size with a unit");
      await H.shot(o.page, "64-owner-preview-land-area");
      await o.page.locator("[data-preview-confirm]").click();
      await waitFor(async () => (await db.doc("caseInternal/" + id).get()).data().listingStatus === "live", 30000, "published");
      const pub = (await db.doc("properties/" + id).get()).data();
      assert.deepStrictEqual([pub.landAreaValue, pub.landAreaUnit, pub.landAreaSqm], [100, "sqwa", 400]); assert.ok(!("landSize" in pub), "no unitless size next to it"); assert.ok(!("approvedByEmail" in pub));
      await o.ctx.close();
      // the public page, every language: the value as entered with ITS unit, and the same area in the other unit — from the language dictionary
      const probe = await newPage({}, "d2-dict"); await probe.page.goto(site.url + "/Property%20Details.dc.html?id=" + id); await probe.page.waitForSelector("[data-view-state], body", { timeout: 20000 });
      const t = await probe.page.evaluate(async (ls) => { const m = await import("./data.js"); return Object.fromEntries(ls.map((l) => [l, { sqwa: m.I18N[l].sqwa, sqm: m.I18N[l].sqm, unspecified: m.I18N[l].land_unit_unspecified }])); }, LANGS8); await probe.ctx.close();
      for (const k of ["sqwa", "unspecified"]) { const vals = LANGS8.map((l) => t[l][k]); assert.ok(vals.every((v) => typeof v === "string" && v.trim().length > 1), k + " exists in all 8 languages"); if (k === "unspecified") assert.strictEqual(new Set(vals).size, 8, k + " is different in every language: " + JSON.stringify(vals)); else assert.ok(new Set(vals).size >= 7, "sqwa: the unit symbol (French and Italian share 'wah²'): " + JSON.stringify(vals)); }
      const seen = {};
      await Promise.all(LANGS8.map(async (lang) => { const c = await newPage({}, "d2-public-" + lang); await c.ctx.addInitScript((l) => { try { localStorage.setItem("hh_lang", l); } catch (e) { /* none */ } }, lang);
        await c.page.goto(site.url + "/Property%20Details.dc.html?id=" + id); const want = landText({ value: 100, sqm: 400, t }, lang);
        await waitFor(async () => (await c.page.innerText("body")).includes(want), 40000, lang + ": " + want); seen[lang] = want; assert.ok(!(await c.page.innerText("body")).includes(t[lang].unspecified), lang + ": no 'unit not specified'"); if (lang === "th") await H.shot(c.page, "65-public-land-area-th"); if (lang === "en") await H.shot(c.page, "66-public-land-area-en"); await c.ctx.close(); }));
      ids.d2Seen = seen;
    } finally { ids.outsiderCase = keep; }
    rec("B19", "Staff (Case Data) → Owner preview → publish: 100 ตร.ว. (= 400 ตร.ม.) shown in the preview and on the public page in all 8 languages: " + JSON.stringify(ids.d2Seen), "PASS (local browser + emulators)", "the intake decision was recorded directly (scaffolding; the intake UI is covered by B5/B6)");
  });

  it("B20 OLD unitless data is never guessed or converted: the public page shows the number without any unit and says so; the Staff page shows it as information and writes nothing until a person states the unit", async () => {
    const base = { status: "sale", type: "house", area: "hua-hin", price: 5200000, bedrooms: 3, bathrooms: 2, livingArea: 120, listingStatus: "live", isDraft: false, features: [], source: "owner_submission", internalSplit: true, publishedAt: Date.now(), expiresAt: Date.now() + 86400000 };
    await db.doc("properties/d2-legacy").set({ ...base, title: { th: "ข้อมูลเก่าไม่ระบุหน่วย", en: "Legacy unitless" }, landSize: 100 });
    await db.doc("properties/d2-both").set({ ...base, title: { th: "มีทั้งสองแบบ", en: "Both kinds" }, landSize: 100, landAreaValue: 50, landAreaUnit: "sqm", landAreaSqm: 50 });
    const probe = await newPage({}, "d2-dict2"); await probe.page.goto(site.url + "/Property%20Details.dc.html?id=d2-legacy"); await probe.page.waitForSelector("body");
    const t = await probe.page.evaluate(async (ls) => { const m = await import("./data.js"); return Object.fromEntries(ls.map((l) => [l, { sqwa: m.I18N[l].sqwa, sqm: m.I18N[l].sqm, unspecified: m.I18N[l].land_unit_unspecified }])); }, LANGS8); await probe.ctx.close();
    for (const lang of ["th", "en", "ru", "de", "zh"]) { const c = await newPage({}, "d2-legacy-" + lang); await c.ctx.addInitScript((l) => { try { localStorage.setItem("hh_lang", l); } catch (e) { /* none */ } }, lang);
      await c.page.goto(site.url + "/Property%20Details.dc.html?id=d2-legacy"); const want = "100 (" + t[lang].unspecified + ")";
      await waitFor(async () => (await c.page.innerText("body")).includes(want), 40000, lang + ": " + want);
      const body = await c.page.innerText("body"); assert.ok(!body.includes("100 " + t[lang].sqm) && !body.includes("100 " + t[lang].sqwa) && !body.includes("400 "), lang + ": the old number is NOT given a unit and NOT converted"); if (lang === "th") await H.shot(c.page, "67-public-legacy-unspecified"); await c.ctx.close(); }
    const both = await newPage({}, "d2-both"); await both.page.goto(site.url + "/Property%20Details.dc.html?id=d2-both"); await waitFor(async () => (await both.page.innerText("body")).includes("50 ตร.ม. (12.5 ตร.ว.)"), 30000, "unit-aware size shown");
    assert.ok(!(await both.page.innerText("body")).includes("100 (" + t.th.unspecified + ")"), "the old unitless number is not shown next to a size with a unit"); await both.ctx.close();
    for (const id of ["d2-legacy", "d2-both"]) await db.doc("properties/" + id).delete();
    // Staff page: a Case with ONLY the old landSize
    const tpl = (await db.doc("caseInternal/" + ids.sevenCase).get()).data(); const lid = "d2-legacy-case";
    const clean = { ...tpl }; ["landAreaValue", "landAreaUnit", "landAreaSqm"].forEach((k) => delete clean[k]);
    await db.doc("caseInternal/" + lid).set({ ...clean, listingStatus: "pending", reviewStatus: "submitted", landSize: 100, assignedToEmail: "staff@example.test", assignedToUid: ids.staff });
    const st = await newPage({}, "d2-staff-legacy"); await loginAdmin(st.page, "staff@example.test"); await st.page.goto(site.url + "/Case%20Data.dc.html?id=" + lid); await st.page.waitForSelector('[data-f="landAreaValue"]', { timeout: 30000 });
    assert.ok(/ไม่ระบุหน่วย/.test(await st.page.locator("[data-land-legacy]").innerText()) && /100/.test(await st.page.locator("[data-land-legacy]").innerText()), "the old number is shown as information, unit unknown");
    assert.deepStrictEqual([await st.page.locator('[data-f="landAreaValue"]').inputValue(), await st.page.locator('[data-f="landAreaUnit"]').inputValue()], ["", ""], "nothing is pre-filled or guessed");
    await st.page.locator('[data-f="description"]').fill("Edited something else only."); await st.page.locator("[data-case-data-save]").click(); await st.page.waitForSelector("[data-case-data-saved]", { timeout: 20000 });
    { const r = (await db.doc("caseInternal/" + lid).get()).data(); assert.strictEqual(r.landSize, 100, "the old number is untouched"); assert.ok(!r.landAreaValue && !r.landAreaUnit && !r.landAreaSqm, "no land area was created or converted by saving something else"); }
    await st.page.locator('[data-f="landAreaValue"]').fill("100"); await st.page.locator('[data-f="landAreaUnit"]').selectOption("sqm"); await st.page.locator("[data-case-data-save]").click(); await st.page.waitForSelector("[data-case-data-saved]", { timeout: 20000 });
    { const r = (await db.doc("caseInternal/" + lid).get()).data(); assert.deepStrictEqual([r.landAreaValue, r.landAreaUnit, r.landAreaSqm, r.landSize], [100, "sqm", 100, 100], "only a PERSON stating the unit creates the unit-aware size: 100 ตร.ม. stays 100 (not 400); the old field is still as it was"); }
    await st.ctx.close(); await db.doc("caseInternal/" + lid).delete();
    rec("B20", "old unitless landSize: public page shows the number without a unit + 'unit not specified' (th/en/ru/de/zh), never converted; unit-aware size wins over it; Staff page shows it as information, pre-fills nothing, saving other fields writes no land area, and the person's stated unit (100 ตร.ม.) is stored as 100 ตร.ม.", "PASS (local browser + emulators)", "synthetic documents written to the emulator and deleted afterwards");
  });

  it("B21 agent (Lister Dashboard) land size: the unit selector is there, an OLD unitless value is shown with a note and does not block saving other fields, a changed value needs a unit, and a stated unit stores value + unit + canonical ตร.ม.", async () => {
    const id = "d2-lister-1";
    await db.doc("properties/" + id).set({ status: "sale", type: "house", area: "hua-hin", zone: "ทดสอบ", price: 3900000, bedrooms: 2, bathrooms: 1, livingArea: 90, landSize: 100, listingStatus: "live", isDraft: false, features: [], listerId: ids.agent, approvedAt: Date.now() - 5000, publishedAt: Date.now() - 5000, expiresAt: Date.now() + 86400000, title: { th: "บ้านของเอเจนต์", en: "Agent house" }, description: { th: "ทดสอบ", en: "test" }, photos: [] });
    const a = await newPage({}, "agent-d2"); await loginAgent(a.page, "agent@example.test"); await a.page.goto(site.url + "/Lister%20Dashboard.dc.html?edit=" + id);
    await a.page.locator("text=📋 รายการทรัพย์").first().click(); // the editor lives on the property-list tab
    await a.page.locator("text=✏️").first().click({ timeout: 30000 }); // the pencil of the listing opens the editor
    try { await a.page.waitForSelector("select:has(option[value='sqwa'])", { state: "attached", timeout: 40000 }); } catch (e) { await H.shot(a.page, "68-lister-land-area-missing"); throw new Error("land unit selector not found; url=" + a.page.url() + " hasLandLabel=" + /ขนาดที่ดิน/.test(await a.page.innerText("body")) + " selects=" + (await a.page.locator("select").count()) + " opts=" + JSON.stringify(await a.page.evaluate(() => Array.from(document.querySelectorAll("select")).map((x) => Array.from(x.options).map((o) => o.value).join("/")).slice(0, 12))) + " text=" + (await a.page.innerText("body")).replace(/\s+/g, " ").slice(700, 1500)); }
    await H.shot(a.page, "68-lister-land-area");
    const landBox = a.page.locator("select:has(option[value='sqwa'])").locator("xpath=preceding-sibling::input[1]");
    assert.strictEqual(await landBox.inputValue(), "100", "the old value is shown"); assert.strictEqual(await a.page.locator("select:has(option[value='sqwa'])").inputValue(), "", "its unit is NOT guessed"); assert.ok(/ไม่ระบุหน่วย/.test(await a.page.innerText("body")), "the legacy note is shown");
    const saveBtn = async () => { const ok = await a.page.evaluate(() => { const b = Array.from(document.querySelectorAll("*")).find((e) => e.children.length === 0 && /^บันทึกแบบร่าง/.test((e.textContent || "").trim())); if (b) { b.click(); return (b.textContent || "").trim(); } return ""; }); assert.ok(ok, "a save button was found"); };
    // 1. changing the value without a unit is refused
    await landBox.fill("150"); await saveBtn(); await waitFor(async () => /เลือกหน่วยของขนาดที่ดิน/.test(await a.page.innerText("body")), 15000, "asks for the unit");
    assert.strictEqual((await db.doc("properties/" + id).get()).data().landSize, 100, "nothing was written");
    // 2. a stated unit stores value + unit + canonical
    await a.page.locator("select:has(option[value='sqwa'])").selectOption("sqwa"); await saveBtn();
    try { await waitFor(async () => (await db.doc("properties/" + id).get()).data().landAreaValue === 150, 60000, "saved with the stated unit"); } catch (e) { const tx = (await a.page.innerText("body")).replace(/\s+/g, " "); throw new Error(e.message + " | page: " + (tx.match(/(บันทึกไม่สำเร็จ|กรุณา)[^.]{0,120}/g) || []).join(" || ") + " | console: " + JSON.stringify(a.page.__logs.console.filter((m) => /Failed to save/.test(m)).concat(a.page.__logs.console.slice(-1))) + " | errors: " + JSON.stringify(a.page.__logs.pageerrors.slice(-3))); }
    { const r = (await db.doc("properties/" + id).get()).data(); assert.deepStrictEqual([r.landAreaValue, r.landAreaUnit, r.landAreaSqm, r.landSize], [150, "sqwa", 600, 100], "150 ตร.ว. → 600 ตร.ม.; the old unitless field is left exactly as it was"); }
    await a.ctx.close(); await db.doc("properties/" + id).delete();
    // 3. an OLD unitless value left untouched never blocks saving (and is not converted or labelled by the save)
    const id2 = "d2-lister-2"; await db.doc("properties/" + id2).set({ status: "sale", type: "house", area: "hua-hin", zone: "ทดสอบ", price: 3100000, bedrooms: 2, bathrooms: 1, livingArea: 80, landSize: 77, listingStatus: "live", isDraft: false, features: [], listerId: ids.agent, approvedAt: Date.now() - 5000, publishedAt: Date.now() - 5000, expiresAt: Date.now() + 86400000, title: { th: "บ้านเอเจนต์ 2", en: "Agent house 2" }, description: { th: "ทดสอบ", en: "test" }, photos: [] });
    const b = await newPage({}, "agent-d2b"); await loginAgent(b.page, "agent@example.test"); await b.page.goto(site.url + "/Lister%20Dashboard.dc.html?edit=" + id2);
    await b.page.locator("text=📋 รายการทรัพย์").first().click(); await b.page.locator("text=✏️").first().click({ timeout: 30000 }); await b.page.waitForSelector("select:has(option[value='sqwa'])", { state: "attached", timeout: 40000 });
    await b.page.evaluate(() => { const x = Array.from(document.querySelectorAll("*")).find((e) => e.children.length === 0 && /^บันทึกแบบร่าง/.test((e.textContent || "").trim())); if (x) x.click(); });
    await waitFor(async () => !!(await db.doc("properties/" + id2).get()).data().seo, 60000, "saved (the payload adds the seo block)");
    { const r = (await db.doc("properties/" + id2).get()).data(); assert.strictEqual(r.landSize, 77, "the old number is as it was"); assert.ok(!r.landAreaValue && !r.landAreaUnit && !r.landAreaSqm, "no unit was invented by the save"); }
    await b.ctx.close(); await db.doc("properties/" + id2).delete();
    rec("B21", "agent land size: unit selector present; old unitless value shown with a note and not guessed; a changed value without a unit is refused; 150 ตร.ว. stored as 150 / sqwa / 600 ตร.ม.; old landSize untouched", "PASS (local browser + emulators)", "synthetic listing written to the emulator and deleted afterwards");
  });

  it("B22 (r9 review) legacy → a person enters a value with a unit → saves → clears it → saves → reopens: the OLD unitless number does not come back in the Staff page, the Owner's preview or the public page; an unrelated edit of an untouched legacy case still keeps it", async () => {
    const tpl = (await db.doc("caseInternal/" + ids.sevenCase).get()).data(); const lid = "d2-clear-case";
    const clean = { ...tpl }; ["landAreaValue", "landAreaUnit", "landAreaSqm", "publicId", "publishedAt"].forEach((k) => delete clean[k]);
    await db.doc("caseInternal/" + lid).set({ ...clean, listingStatus: "pending", reviewStatus: "submitted", landSize: 100, assignedToEmail: "staff@example.test", assignedToUid: ids.staff });
    const st = await newPage({}, "d2-clear-staff"); await loginAdmin(st.page, "staff@example.test"); await st.page.goto(site.url + "/Case%20Data.dc.html?id=" + lid); await st.page.waitForSelector('[data-f="landAreaValue"]', { timeout: 30000 });
    const save = async () => { await st.page.locator("[data-case-data-save]").click(); await st.page.waitForSelector("[data-case-data-saved]", { timeout: 20000 }); };
    await st.page.locator('[data-f="description"]').fill("A quiet single-storey house with a small garden, near the market and the beach road. Only other data was edited here."); await save();
    assert.strictEqual((await db.doc("caseInternal/" + lid).get()).data().landSize, 100, "untouched legacy kept while editing other data");
    await st.page.locator('[data-f="landAreaValue"]').fill("50"); await st.page.locator('[data-f="landAreaUnit"]').selectOption("sqwa"); await save();
    { const r = (await db.doc("caseInternal/" + lid).get()).data(); assert.deepStrictEqual([r.landAreaValue, r.landAreaUnit, r.landAreaSqm], [50, "sqwa", 200]); }
    await st.page.locator('[data-f="landAreaValue"]').fill(""); await st.page.locator('[data-f="landAreaUnit"]').selectOption(""); await save();
    { const r = (await db.doc("caseInternal/" + lid).get()).data(); assert.deepStrictEqual([r.landAreaValue, r.landAreaUnit, r.landAreaSqm, r.landSize], [null, null, null, null], "a deliberate clear clears the old unitless number too"); }
    await st.page.reload(); await st.page.waitForSelector('[data-f="landAreaValue"]', { timeout: 30000 });
    assert.strictEqual(await st.page.locator("[data-land-legacy]").count(), 0, "no legacy note comes back after reopening"); assert.strictEqual(await st.page.locator('[data-f="landAreaValue"]').inputValue(), "");
    await st.ctx.close();
    // Owner preview rows: built by the real public-preview.js from the cleared record (the publish projection itself is covered by core test L5; a clone of a case cannot reach "ready" because its photos belong to the original)
    { const r = (await db.doc("caseInternal/" + lid).get()).data(); const pr = await newPage({}, "d2-clear-preview"); await pr.page.goto(site.url + "/Case%20Data.dc.html?id=" + lid); await pr.page.waitForSelector("body");
      const rows = await pr.page.evaluate(async (rec) => { const m = await import("./public-preview.js"); return m.previewRows({ publicDocument: rec, currentPublicDocument: null }).map((x) => x.key + ":" + x.text); }, JSON.parse(JSON.stringify(r)));
      assert.ok(!rows.some((x) => /land|ที่ดิน|ไม่ระบุหน่วย/.test(x)), "no land row in the preview rows: " + rows.join(" | ")); await pr.ctx.close();
      const legacyRows = await (async () => { const q = await newPage({}, "d2-clear-preview2"); await q.page.goto(site.url + "/Case%20Data.dc.html?id=" + lid); await q.page.waitForSelector("body"); const out = await q.page.evaluate(async () => { const m = await import("./public-preview.js"); return m.previewRows({ publicDocument: { landSize: 100 }, currentPublicDocument: null }).map((x) => x.key + ":" + x.text); }); await q.ctx.close(); return out; })();
      assert.ok(legacyRows.some((x) => /ไม่ระบุหน่วย/.test(x)), "control: the old number alone IS shown as unit-not-specified, so the check above is meaningful: " + legacyRows.join(" | ")); }
    await db.doc("caseInternal/" + lid).delete();
    rec("B22", "r9 review: legacy → value+unit → save → clear → save → reopen: old unitless number gone (record, Staff page, Owner preview rows; publish projection by core L5); editing other data of an untouched legacy case keeps it", "PASS (local browser + emulators)", "synthetic case written to the emulator");
  });

  it("B23 (r9 review) agent: a value the builder refuses (too large) or clearing the unit of a listing that already has one is refused with an error and NOTHING is written; clearing the box clears every land field", async () => {
    const id = "d2-lister-3"; const doc = { status: "sale", type: "house", area: "hua-hin", zone: "ทดสอบ", price: 2900000, bedrooms: 2, bathrooms: 1, livingArea: 70, landSize: 60, landAreaValue: 40, landAreaUnit: "sqwa", landAreaSqm: 160, listingStatus: "live", isDraft: false, features: [], listerId: ids.agent, approvedAt: Date.now() - 5000, publishedAt: Date.now() - 5000, expiresAt: Date.now() + 86400000, title: { th: "บ้านเอเจนต์สาม", en: "Agent three" } };
    await db.doc("properties/" + id).set(doc);
    const a = await newPage({}, "agent-d2c"); await loginAgent(a.page, "agent@example.test"); await a.page.goto(site.url + "/Lister%20Dashboard.dc.html?edit=" + id);
    await a.page.locator("text=📋 รายการทรัพย์").first().click(); await a.page.locator("text=✏️").first().click({ timeout: 30000 }); await a.page.waitForSelector("select:has(option[value='sqwa'])", { state: "attached", timeout: 40000 });
    const unit = a.page.locator("select:has(option[value='sqwa'])"), landBox = unit.locator("xpath=preceding-sibling::input[1]");
    assert.strictEqual(await landBox.inputValue(), "40"); assert.strictEqual(await unit.inputValue(), "sqwa");
    const saveBtn = async () => { const ok = await a.page.evaluate(() => { const b = Array.from(document.querySelectorAll("*")).find((e) => e.children.length === 0 && /^บันทึกแบบร่าง/.test((e.textContent || "").trim())); if (b) { b.click(); return true; } return false; }); assert.ok(ok); };
    const unchanged = async (why) => { await new Promise((r) => setTimeout(r, 2500)); const r = (await db.doc("properties/" + id).get()).data(); assert.deepStrictEqual([r.landAreaValue, r.landAreaUnit, r.landAreaSqm, r.landSize, !!r.seo], [40, "sqwa", 160, 60, false], why + ": nothing written"); };
    // 1. out of bounds
    await landBox.fill("5000000000"); await saveBtn(); await waitFor(async () => /ขนาดที่ดินต้องเป็นตัวเลข/.test(await a.page.innerText("body")), 15000, "error shown for a too large value"); await unchanged("too large");
    // 2. unit cleared on a listing that has one
    await landBox.fill("40"); await unit.selectOption(""); await saveBtn(); await waitFor(async () => /เลือกหน่วยของขนาดที่ดิน/.test(await a.page.innerText("body")), 15000, "asks for the unit"); await unchanged("unit cleared");
    // 3. clearing the box clears every land field (the old number too)
    await landBox.fill(""); await saveBtn(); await waitFor(async () => !!(await db.doc("properties/" + id).get()).data().seo, 60000, "saved");
    { const r = (await db.doc("properties/" + id).get()).data(); assert.deepStrictEqual([r.landAreaValue, r.landAreaUnit, r.landAreaSqm, r.landSize], [null, null, null, null], "all land fields cleared"); }
    await a.ctx.close(); await db.doc("properties/" + id).delete();
    rec("B23", "r9 review: agent form refuses a too-large value and a cleared unit (no write, error shown); clearing the box clears all land fields", "PASS (local browser + emulators)", "synthetic listing written to the emulator and deleted afterwards");
  });

  it("B24 (r9e, characterisation — NO source fix) the real sequence Work asked for: Owner opens the case card → intake-approves → reads the approver name and the submission history WITHOUT refreshing → refreshes. Records what the page shows each time and what the database holds, to tell a stale cache from a missing record", async () => {
    const tpl = (await db.doc("caseInternal/" + (ids.sevenCase || ids.agentCase)).get()).data(); const lid = "d24-stale-case"; const now = Date.now();
    const clean = { ...tpl }; ["approvedBy", "approvedByEmail", "approvedByUid", "approvedByRole", "approvedAt", "approvedSubmissionId", "intakeCompletedAt", "publishedAt", "publicId", "reviewReturn"].forEach((k) => delete clean[k]);
    await db.doc("caseInternal/" + lid).set({ ...clean, source: "owner_submission", internalSplit: true, listingStatus: "pending", reviewStatus: "waiting_review", submissionCount: 1, lastSubmissionId: "s-d24", lastSubmittedAt: now - 60000, assignedToEmail: "staff@example.test", assignedToUid: ids.staff });
    await db.doc("properties/" + lid + "/submissions/s-d24").set({ submissionNumber: 1, workflowVersion: "intake_v1", submittedAt: now - 60000, submittedBy: "staff@example.test", submittedByUid: ids.staff, workflowState: null, keyData: null, photoCount: 0, reviewResult: null, reviewedBy: null, reviewedAt: null, returnReason: null });
    const keep = ids.outsiderCase; ids.outsiderCase = lid; const obs = {};
    try {
      const o = await newPage({}, "owner-d24"); await loginAdmin(o.page, "owner@example.test"); await openCase(o.page); await sleep(2000);
      const card = async (page) => page.evaluate((cid) => { const leaf = Array.from(document.querySelectorAll("*")).find((e) => e.children.length === 0 && (e.textContent || "").trim() === cid); let a = leaf; for (let i = 0; i < 14 && a; i++, a = a.parentElement) { const t = a.innerText || ""; if (/ส่งงานแล้ว|อนุมัติรับเรื่องโดย|ประวัติการส่งงาน/.test(t) && t.length > 200) return t.replace(/\s+/g, " "); } return ""; }, lid);
      const lines = (t) => ({ approver: (/อนุมัติรับเรื่องโดย [^·]*?(?= ·| ✓|$)/.exec(t) || [""])[0].trim(), history: (/ครั้งที่ 1 ·[^📝]*?(รอตรวจ|อนุมัติ|ส่งกลับ|ขอข้อมูลเพิ่ม)/.exec(t) || [""])[0].trim().slice(-60) });
      await scrollToCase(o.page); obs.before = lines(await card(o.page)); await H.shot(o.page, "69-d24-before-approve");
      await clickIntakeApprove(o.page);
      await waitFor(async () => (await db.doc("caseInternal/" + lid).get()).data().reviewStatus === "approved", 20000, "intake approved by the Owner's click");
      await sleep(3000); obs.afterNoRefresh = lines(await card(o.page)); obs.afterNoRefreshText = (await card(o.page)).slice(0, 700); await H.shot(o.page, "70-d24-after-approve-no-refresh");
      const sub = (await db.doc("properties/" + lid + "/submissions/s-d24").get()).data(); const rc = (await db.doc("caseInternal/" + lid).get()).data();
      obs.db = { submissionReviewResult: sub.reviewResult, submissionReviewedBy: sub.reviewedBy, caseApprovedBy: rc.approvedBy || null, caseApprovedSubmissionId: rc.approvedSubmissionId, caseReviewStatus: rc.reviewStatus };
      await o.page.reload(); await o.page.waitForSelector("text=" + lid, { timeout: 30000 }); await sleep(3000); await scrollToCase(o.page);
      obs.afterRefresh = lines(await card(o.page)); obs.afterRefreshText = (await card(o.page)).slice(0, 700); await H.shot(o.page, "71-d24-after-refresh");
      await o.ctx.close();
    } finally { ids.outsiderCase = keep; }
    ids.d24 = obs; console.log("B24 observations: " + JSON.stringify(obs));
    assert.strictEqual(obs.db.submissionReviewResult, "approved", "the database holds the decision"); assert.strictEqual(obs.db.submissionReviewedBy, "owner@example.test", "the database holds the reviewer");
    rec("B24", "characterisation (no source fix): intake approval from the UI, read WITHOUT refresh vs AFTER refresh. DB: " + JSON.stringify(obs.db) + " · page before: " + JSON.stringify(obs.before) + " · after approve, no refresh: " + JSON.stringify(obs.afterNoRefresh) + " · after refresh: " + JSON.stringify(obs.afterRefresh), "RECORDED (observation, not a pass/fail of the page)", "synthetic case; shows whether the page text comes from a stale submissions cache or from missing data");
    for (const sd of (await db.collection("properties/" + lid + "/submissions").get()).docs) await sd.ref.delete(); await db.doc("caseInternal/" + lid).delete();
  });
});
