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
  await page.locator("input[type=email]").fill(email); await page.locator("input").nth(1).fill(PASS);
  await page.getByText(/^(Sign In|เข้าสู่ระบบ)/).first().click();
}
// What is NOT a problem: the DC template placeholders requested as <img src="{{ … }}"> before binding (pre-existing), and the gated CHAT functions answering 401/403 on the
// listing TEST project (they are optional, need the allow-list and a secret; the form swallows the refusal by design). Everything else must be empty.
const GATED_CHAT = /\/(getPropertyDraft|updatePropertyDraft|receptionTurn|claudeComplete|createCaseFromConversation|startConversation|sendConversationTurn)\b/;
const unexpected = (logs, allow) => []
  .concat(logs.pageerrors.map((m) => "pageerror: " + m))
  .concat(logs.failed.filter((m) => !/fonts\./.test(m) && !/Firestore\/(Listen|Write)\/channel.*ERR_ABORTED/.test(m) && !(allow || []).some((re) => re.test(m))).map((m) => "requestfailed: " + m))
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
    await page.waitForSelector("text=ส่งข้อมูลสำเร็จ", { timeout: 30000 }).catch(async (e) => { console.log("PAGE TEXT:", (await page.innerText("body")).slice(0, 1200)); console.log("LOGS:", JSON.stringify(page.__logs).slice(0, 2500)); await H.shot(page, "debug-b1"); throw e; });
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
    await page.getByText("ถัดไป →").click(); await page.waitForSelector("text=ต้องการฝากขายหรือฝากเช่า").catch(async (e) => { console.log("DBG", JSON.stringify(await page.evaluate(() => Array.from(document.querySelectorAll("input")).map((x) => x.value))), (await page.innerText("body")).slice(150, 500)); await H.shot(page, "debug-b2"); throw e; });
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
    await page.reload(); await page.waitForSelector("text=ส่งข้อมูลสำเร็จ", { timeout: 20000 }).catch(async (e) => { console.log("DBG2", await page.evaluate(() => localStorage.getItem("hhOwnerForm.v1")), (await page.innerText("body")).slice(150, 1500)); await H.shot(page, "debug-b2b"); throw e; });
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
});
