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
let sdkRaces = 0; // see O1
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
    for (let i = 0; i < 3; i++) { try { await page.waitForSelector("text=ได้รับข้อมูลแล้ว", { timeout: 8000 }); break; } catch (e) { if (i === 2) throw e; sdkRaces++; await page.reload(); } } // (see O1)
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
const clickInCase = async (page, label) => { const ok = await page.evaluate(([id, label]) => { const all = Array.from(document.querySelectorAll("*")).filter((e) => e.children.length === 0 && (e.textContent || "").trim() === id); for (const n of all) { let a = n; for (let i = 0; i < 14 && a; i++, a = a.parentElement) { const b = Array.from(a.querySelectorAll("div,button,span")).find((e) => e.children.length === 0 && (e.textContent || "").trim() === label); if (b) { b.click(); return true; } } } return false; }, [ids.outsiderCase, label]); assert.ok(ok, "button '" + label + "' found in the card of " + ids.outsiderCase); };
// OBSERVATION (not hidden): a public page sometimes runs its first Firestore read before the helmet-injected Firebase SDK scripts have executed ("Firebase SDK not loaded" →
// the page falls back to its bundled sample data). Reloading once fixes it. Counted here and reported in RESULTS.md.
const gotoWithSdk = async (page, url, ready) => {
  for (let i = 0; i < 4; i++) {
    await page.goto(url);
    try { await waitFor(() => page.evaluate(() => !!(window.firebase && window.firebase.firestore)), 6000, "sdk"); await waitFor(ready, 12000, "page content"); return; } catch (e) { sdkRaces++; }
  }
  await waitFor(ready, 20000, "page content (after retries)");
};
const preview = async (page, state, ms) => waitFor(async () => (await page.getAttribute("[data-preview-confirm]", "data-state").catch(() => null)) === state, ms || 20000, "preview state " + state);
  const openCase = async (page) => { await page.goto(site.url + "/Listing%20Approvals.dc.html"); await page.waitForSelector("text=" + ids.outsiderCase, { timeout: 30000 }); };

  it("B5 Staff: sees the private case in Listing Approvals but has NO approve button; private-image outcome observed (emulator cannot resolve Staff cross-service Storage lookups)", async () => {
    await db.doc("caseInternal/" + ids.outsiderCase).update({ reviewStatus: "approved", approvedSubmissionId: "syn-1" });
    const { ctx, page } = await newPage({}, "staff");
    await loginAdmin(page, "staff@example.test");
    await openCase(page); await sleep(3000); await H.shot(page, "13-staff-listing-approvals-no-approve-button");
    assert.strictEqual(await page.getByText(APPROVE).count(), 0, "Staff has no approve button");
    const rendered = await page.evaluate(() => Array.from(document.querySelectorAll("img")).filter((i) => i.src.startsWith("blob:") && i.naturalWidth > 0).length);
    // (this page loads photos only on demand — in the approve preview and the lightbox — so nothing is expected in the list itself)
    const denied = page.__logs.bad.filter((m) => /alt=media/.test(m)).slice(0, 3);
    rec("B5", "Staff: case visible (merged private record), no approve button; private image in emulator: " + (rendered ? "RENDERED" : "NOT rendered"), "OBSERVED (local emulator limit)", "Storage requests for Staff: " + JSON.stringify(denied) + ". The rules need a cross-service Firestore lookup the Storage emulator does not resolve; real Staff Storage access stays PENDING for the real TEST project.");
    await ctx.close();
  });

  it("B6 Owner: private photos render through an authenticated blob, the approve PREVIEW can be cancelled, blocks confirm while photos fail, refuses contact data in public text, then publishes", async () => {
    const { ctx, page } = await newPage({}, "owner");
    await loginAdmin(page, "owner@example.test");
    await openCase(page);
    // preview 1 — photo downloads fail → confirm needs an explicit acknowledgement, then cancel
    let blockMedia = true;
    await ctx.route(/casePhotos[^?]*\?[^ ]*alt=media/, (route) => (blockMedia ? route.abort("failed") : route.fallback()));
    await clickInCase(page, APPROVE); await page.waitForSelector("[data-preview-confirm]");
    await preview(page, "needs-ack");
    assert.strictEqual(await page.locator("[data-preview-confirm]").isDisabled(), true, "confirm disabled while photos failed and unacknowledged");
    await H.shot(page, "15-owner-preview-photos-failed-needs-acknowledgement");
    await page.locator("[data-preview-cancel]").click();
    assert.strictEqual((await db.doc("caseInternal/" + ids.outsiderCase).get()).data().listingStatus || "pending", "pending", "cancel changed nothing");
    assert.strictEqual((await db.doc("properties/" + ids.outsiderCase).get()).exists, false);
    // preview 2 — normal: loading → ready, shows the public facts only
    blockMedia = false;
    await clickInCase(page, APPROVE); await page.waitForSelector("[data-preview-confirm]");
    await preview(page, "ready");
    const shown = await page.evaluate(() => ({ imgs: document.querySelectorAll("[data-preview-photo]").length, ok: Array.from(document.querySelectorAll("[data-preview-photo]")).filter((i) => i.naturalWidth > 0).length, text: document.body.innerText }));
    assert.deepStrictEqual([shown.imgs, shown.ok], [2, 2]);
    assert.ok(/7,500,000/.test(shown.text), "preview shows the public price");
    assert.ok(!/0800000001/.test(shown.text.split("ยืนยันเผยแพร่")[0].slice(shown.text.indexOf("ตรวจก่อนเผยแพร่"))), "preview shows no contact phone");
    const previewSrc = await page.evaluate(() => Array.from(document.querySelectorAll("[data-preview-photo]")).map((i) => i.src.split(":")[0]));
    assert.deepStrictEqual(previewSrc, ["blob", "blob"], "private photos shown through authenticated in-memory blobs (no token URL)");
    assert.strictEqual(page.__logs.images.filter((i) => /alt=media|casePhotos/.test(i.url)).length, 0, "no <img> ever pointed at a Storage URL");
    await H.shot(page, "16-owner-preview-photos-reviewed-ready");
    await page.locator("[data-preview-cancel]").click();
    // preview 3 — contact data in the public text is refused inside the dialog
    await db.doc("caseInternal/" + ids.outsiderCase).update({ description: "Quiet house, call 0812345678" });
    await openCase(page); await clickInCase(page, APPROVE); await page.waitForSelector("[data-preview-confirm]");
    await preview(page, "refused"); await H.shot(page, "17-owner-preview-refused-contact-in-public-text");
    await page.locator("[data-preview-cancel]").click();
    await db.doc("caseInternal/" + ids.outsiderCase).update({ description: "Quiet 3-bedroom house near the beach." });
    // publish
    await openCase(page); await clickInCase(page, APPROVE); await page.waitForSelector("[data-preview-confirm]");
    await preview(page, "ready"); await page.locator("[data-preview-confirm]").click();
    await waitFor(async () => (await db.doc("caseInternal/" + ids.outsiderCase).get()).data().listingStatus === "live", 25000, "published");
    const pub = (await db.doc("properties/" + ids.outsiderCase).get()).data();
    assert.strictEqual(pub.price, 7500000); assert.ok(!("contactPhone" in pub) && !("trackToken" in pub));
    assert.strictEqual((await db.collection("propertyPhotos").where("propertyId", "==", ids.outsiderCase).get()).size, 2);
    const rc = (await db.doc("caseInternal/" + ids.outsiderCase).get()).data(); assert.strictEqual(rc.approvedByRole, "owner"); assert.strictEqual(rc.approvedByUid, ids.owner);
    await sleep(1500); await H.shot(page, "18-owner-approvals-after-publish");
    assert.deepStrictEqual(unexpected(page.__logs, [/casePhotos[^ ]*alt=media[^ ]* :: net::ERR_(FAILED|BLOCKED_BY_CLIENT)/]), [], "unexpected browser problems (owner; the injected photo-download failure is the only allowed one)");
    ids.ownerPage = page; ids.ownerCtx = ctx;
    rec("B6", "owner: private photo via authenticated blob (no token URL); preview cancel = no change; failed photos need acknowledgement; contact in public text refused in the dialog; confirm publishes", "PASS (local browser + emulators)", "approvedBy recorded; 2 public photos");
  });

  it("B7 public view: pending case invisible; published listing shows its photos and is searchable; take-down removes page, records, files and the old photo links die", async () => {
    const pend = await newPage({}, "public-pending");
    await pend.page.goto(site.url + "/Property%20Details.dc.html?id=" + ids.agentCase); await sleep(5000); await H.shot(pend.page, "19-public-pending-case-not-visible");
    assert.ok(!/4,200,000|Sea-view condo/.test(await pend.page.innerText("body")), "pending facts are not public");
    // direct reads WITHOUT credentials (no Authorization header → the emulator applies firestore.rules to an anonymous visitor)
    const E = H.emulators(); const rest = async (c, id) => (await fetch("http://" + E.fsHost + ":" + E.fsPort + "/v1/projects/" + H.PROJECT + "/databases/(default)/documents/" + c + "/" + id)).status;
    assert.deepStrictEqual([await rest("properties", ids.agentCase), await rest("caseInternal", ids.agentCase), await rest("casePhotos", ids.agentCase + "_0")], [404, 403, 403], "anonymous: nothing public for the pending case; private records refused");
    const pubv = await newPage({}, "public-live");
    await gotoWithSdk(pubv.page, site.url + "/Property%20Details.dc.html?id=" + ids.outsiderCase, async () => /7,500,000/.test(await pubv.page.innerText("body")));
    await waitFor(async () => pubv.page.evaluate(() => Array.from(document.querySelectorAll("img")).filter((i) => /publishedCasePhotos/.test(i.src) && i.naturalWidth > 0).length >= 1), 30000, "published photos displayed");
    await H.shot(pubv.page, "20-public-published-listing-with-photos");
    const imgUrls = await pubv.page.evaluate(() => Array.from(new Set(Array.from(document.querySelectorAll("img")).filter((i) => /publishedCasePhotos/.test(i.src)).map((i) => i.src))));
    for (const u of imgUrls) assert.strictEqual((await fetch(u)).status, 200);
    assert.ok(!/0800000001|Synthetic Outsider|trackToken/.test(await pubv.page.innerText("body")), "no contact data on the public page");
    const search = await newPage({}, "public-search");
    await gotoWithSdk(search.page, site.url + "/Search%20Results.dc.html", async () => /7,500,000|7500000/.test(await search.page.innerText("body")));
    const op = ids.ownerPage; op.on("dialog", (d) => d.accept("synthetic take-down reason"));
    await openCase(op); await clickInCase(op, "⛔ ปิดประกาศ");
    await waitFor(async () => (await db.doc("caseInternal/" + ids.outsiderCase).get()).data().listingStatus === "offline", 25000, "offline");
    await waitFor(async () => !(await db.doc("properties/" + ids.outsiderCase).get()).exists, 10000, "public document removed");
    assert.strictEqual((await db.collection("propertyPhotos").where("propertyId", "==", ids.outsiderCase).get()).size, 0);
    await waitFor(async () => (await bucket.getFiles({ prefix: "publishedCasePhotos/" + ids.outsiderCase + "/" }))[0].length === 0, 15000, "public files deleted (the function deletes them right after the transaction)");
    for (const u of imgUrls) assert.notStrictEqual((await fetch(u)).status, 200, "old public photo link is dead");
    await pubv.page.reload(); await sleep(4000); await H.shot(pubv.page, "22-public-after-take-down");
    assert.ok(!/7,500,000/.test(await pubv.page.innerText("body")), "page no longer shows the listing");
    assert.deepStrictEqual(unexpected(pubv.page.__logs).concat(unexpected(search.page.__logs)).concat(unexpected(pend.page.__logs)).filter((m) => !/publishedCasePhotos/.test(m) && !/maps\.googleapis\.com/.test(m) && m !== "pageerror: Event"), [], "unexpected browser problems (public pages; the only allowed noise is the Google Maps script that the no-external-traffic policy blocks, and the error event it raises)");
    rec("B7", "pending invisible (UI + direct reads refused); published listing + photos shown and searchable; owner take-down removes page, records, files; old photo links dead", "PASS (local browser + emulators)", "");
    rec("O1", "OBSERVATION: first Firestore read of a public page can run before the Firebase SDK scripts executed (page then shows bundled sample data until reload)", "OBSERVED", "retries needed in this run: " + sdkRaces + ". Pre-existing page-load race; not caused by this change; to be checked on the real TEST site.");
    await Promise.all([pend.ctx.close(), pubv.ctx.close(), search.ctx.close(), ids.ownerCtx.close()]);
  });
});
