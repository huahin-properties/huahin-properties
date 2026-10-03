// Internal status panel — the numbers in the HTML must be the numbers in PROJECT-STATUS.md. No network; the Playwright part is skipped when no browser is installed.
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { build, parse, validate, pct } = require("../../tools/status-panel/build");
const ROOT = path.resolve(__dirname, "..", "..");
const MD = fs.readFileSync(path.join(ROOT, "PROJECT-STATUS.md"), "utf8");
const STAMP = "TEST-STAMP";
const count = (html, re) => (html.match(re) || []).length;

describe("status panel (docs-only, built from PROJECT-STATUS.md)", function () {
  this.timeout(60000);
  let out, d;
  before(() => { out = build({ stamp: STAMP }); d = out.data; });

  it("P1 the registry in PROJECT-STATUS.md is valid: 25 roadmap rows 0-24, every task has meta, unique ids, valid enums, no secret/e-mail/phone", () => {
    assert.deepStrictEqual(validate(parse(MD)), []);
    assert.strictEqual(d.roadmap.length, 25); assert.strictEqual(d.tasks.length, Object.keys(d.reg.taskMeta).length);
  });

  it("P2 negative controls: the validator refuses a broken registry (bad status, duplicate id, secret-looking value, missing meta)", () => {
    const bad = (mut) => { const x = parse(MD); mut(x); return validate(x); };
    assert.ok(bad((x) => { x.reg.scopes[0].items[0].status = "great"; }).some((e) => /bad status/.test(e)));
    assert.ok(bad((x) => { x.reg.scopes[0].items[1].id = x.reg.scopes[0].items[0].id; }).some((e) => /duplicate item/.test(e)));
    assert.ok(bad((x) => { x.reg.issues[0].title = "contact someone@example.com"; }).some((e) => /secret|e-mail/.test(e)));
    assert.ok(bad((x) => { delete x.reg.taskMeta["CHAT-LIVE-01"]; }).some((e) => /without taskMeta/.test(e)));
    assert.ok(bad((x) => { x.roadmap.pop(); }).some((e) => /25 rows/.test(e)));
  });

  it("P3 the HTML shows exactly the markdown rows: 25 roadmap, foundation, every task, every issue; same status colour as the markdown cell", () => {
    const html = out.document;
    const sect = (id) => { const a = html.indexOf('id="' + id + '"'); const b = html.indexOf("<section", a + 10); return html.slice(a, b < 0 ? undefined : b); };
    assert.strictEqual(count(sect("road").split("<details")[0], /<tr data-st=/g), 25);
    assert.strictEqual(count(sect("tasks"), /<tr data-st=/g), d.tasks.length);
    assert.strictEqual(count(sect("issues"), /<tr id="iss-/g), d.reg.issues.length);
    d.roadmap.forEach((r) => assert.ok(sect("road").includes('<td data-l="ลำดับ" class="mono">' + r.no + "</td>")));
    // the emoji of every §1-§3 table row maps to the pill used (re-read independently of the parser)
    const emo = { "🟢": "ok", "🟡": "part", "🔴": "bad", "⚪": "none", "🔵": "dir" };
    const rows = MD.split("\n").filter((l) => /^\| \d+ \|/.test(l)).slice(0, 25);
    rows.forEach((l, i) => { const cell = l.split("|")[3].trim(); assert.strictEqual(d.roadmap[i].status.key, emo[[...cell][0]], "row " + i); });
  });

  it("P4 percentages: ONLY the scopes Work locked (S-TEST-FLOW 9/9, S-TEST-PUBLIC 2/7) show a percentage; every other scope says 'ยังคำนวณไม่ได้' with a draft marked 'ไม่ใช่ความคืบหน้า'", () => {
    const html = out.document; const LOCKED = ["S-TEST-FLOW", "S-TEST-PUBLIC"];
    assert.deepStrictEqual(d.reg.scopes.filter((s) => s.locked).map((s) => s.id).sort(), LOCKED.slice().sort());
    d.reg.scopes.forEach((s) => {
      const p = pct(s); const card = html.slice(html.indexOf('id="scope-' + s.id + '"'), html.indexOf("</article>", html.indexOf('id="scope-' + s.id + '"')));
      if (LOCKED.includes(s.id)) { assert.strictEqual(p.computable, true, s.id); assert.ok(card.includes(p.pass + "/" + p.n + " ") && card.includes("= " + p.percent + "%") && !card.includes("ยังคำนวณไม่ได้"), s.id); }
      else { assert.strictEqual(p.computable, false, s.id + " must not show a percentage while unlocked"); assert.ok(card.includes("ยังคำนวณไม่ได้") && card.includes("ไม่ใช่ความคืบหน้า") && card.includes(p.pass + "/" + p.n), s.id); }
      assert.strictEqual(s.items.filter((i) => i.status === "pass").length, p.pass);
      assert.strictEqual(p.count.pass + p.count.fail + p.count.blocked + p.count.unverified + p.count.na, s.items.length);
    });
    const f = pct(d.reg.scopes.find((x) => x.id === "S-TEST-FLOW")), u = pct(d.reg.scopes.find((x) => x.id === "S-TEST-PUBLIC"));
    assert.deepStrictEqual([f.pass, f.n, f.percent, u.pass, u.n, u.percent], [9, 9, 100, 6, 7, 86], "Work's locked figures (S-TEST-PUBLIC updated with the Cloud TEST results of head 2c89759)");
  });
  it("P5 percentage rules: a LOCKED scope shows pass/applicable = percent; N/A is removed from the divisor, BLOCKED/FAIL/UNVERIFIED stay; empty scope is not computable", () => {
    const mk = (items, locked) => ({ locked, items: items.map((st, i) => ({ id: "x" + i, status: st })) });
    let p = pct(mk(["pass", "pass", "fail", "blocked", "unverified"], true)); assert.deepStrictEqual([p.pass, p.n, p.percent, p.computable], [2, 5, 40, true]);
    p = pct(mk(["pass", "na", "na", "fail"], true)); assert.deepStrictEqual([p.pass, p.n, p.percent], [1, 2, 50]);
    p = pct(mk(["na"], true)); assert.strictEqual(p.computable, false); p = pct(mk([], true)); assert.strictEqual(p.computable, false);
    const x = parse(MD); x.reg.scopes[3].locked = true;
    assert.strictEqual(pct(x.reg.scopes[3]).computable, true);
  });

  it("P6 environments are kept apart: dev, TEST and production are separate scopes with their own divisor; the panel never shows one combined percentage", () => {
    const envs = Array.from(new Set(d.reg.scopes.map((s) => s.env))).sort(); assert.deepStrictEqual(envs, ["dev", "docs", "prod", "test"]);
    const per = (e) => d.reg.scopes.filter((s) => s.env === e).length; assert.ok(per("dev") >= 2 && per("test") >= 2 && per("prod") >= 2, "dev/TEST/production are split into separate checklists");
    d.reg.scopes.filter((s) => s.env !== "docs").forEach((s) => s.items.forEach((i) => assert.strictEqual(i.id[0], { dev: "D", test: "T", prod: "P" }[s.env], i.id + " is in a " + s.env + " scope but belongs to another environment")));
    assert.ok(!/รวมทั้งโครงการ|ภาพรวม\s*\d+%|overall/i.test(out.document));
    assert.ok(/ห้ามเฉลี่ยรวม/.test(out.document));
  });

  it("P7 deterministic and self-contained: same input → same bytes; no external script, no network call in the page; no secret-looking text; the committed file equals a fresh build", () => {
    assert.strictEqual(build({ stamp: STAMP }).document, out.document);
    assert.ok(!/<script[^>]+src=/i.test(out.document) && !/fetch\(|XMLHttpRequest|WebSocket/.test(out.document));
    assert.ok(!/[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(out.document.replace(/fonts\.googleapis/g, "")));
    const committed = path.join(ROOT, "docs", "status-panel", "index.html");
    if (fs.existsSync(committed)) {
      const f = fs.readFileSync(committed, "utf8"); const norm = (h) => h.replace(/<dd>PROJECT-STATUS\.md · [^<]*<\/dd>/, "<dd>STAMP</dd>");
      assert.strictEqual(norm(f), norm(out.document), "docs/status-panel/index.html is stale — run: npm run status-panel");
    }
  });

  it("P8 scope guard: against the CLOUD-TEST-deployed SHA, the ONLY non-document files that differ are the five Work-approved fixes (FX-1…FX-4 + their tests/build tool); and after the recorded source head only documents/panel files change", function () {
    const P = d.reg.package; let names, after;
    try { names = execSync("git diff --name-only " + P.deployedTestSha + " -- . ':!docs' ':!tools/status-panel' ':!tests/status-panel' ':!*.md' ':!package.json'", { cwd: ROOT, encoding: "utf8" }).trim(); } catch (e) { return this.skip(); }
    const ALLOWED = ["Property Details.dc.html", "Listing Approvals.dc.html", "PropertyCard.dc.html", "data.js", "tools/build-listing-test.js", "tests/browser-local/scenarios.test.js", "tests/listing/hosting-build.test.js", "Case Data.dc.html", "Lister Dashboard.dc.html", "case-fields.js", "functions/case-fields.js", "functions/land-area.js", "functions/listing-case.js", "intake-workflow.js", "land-area.js", "public-preview.js", "tests/listing/core.test.js", "tests/listing/functions-build.test.js", "tests/listing/land-area.test.js", "tools/listing-test/build-functions.js"];
    const extra = names.split("\n").filter(Boolean).filter((f) => !ALLOWED.includes(f)); assert.deepStrictEqual(extra, [], "unexpected non-doc files differ from the deployed TEST sha:\n" + extra.join("\n"));
    if (/^[0-9a-f]{40}$/.test(P.sourceHeadSha)) { try { after = execSync("git diff --name-only " + P.sourceHeadSha + " HEAD -- . ':!docs' ':!tools/status-panel' ':!tests/status-panel' ':!*.md' ':!package.json'", { cwd: ROOT, encoding: "utf8" }).trim(); } catch (e) { return; } assert.strictEqual(after, "", "after the recorded source head only documents/panel files may change:\n" + after); }
  });
  it("P9 real browser: loads with no script error, no sideways scroll at desktop and phone width, filters and search change the rows, section 2 'YOU DO NOW' is visible at rest", async function () {
    let chromium; for (const m of ["playwright", "/opt/node22/lib/node_modules/playwright"]) { try { chromium = require(m).chromium; break; } catch (e) { /* next */ } }
    if (!chromium) return this.skip();
    const tmp = path.join(require("os").tmpdir(), "status-panel-test-" + process.pid + ".html"); fs.writeFileSync(tmp, out.document);
    const b = await chromium.launch({ args: ["--no-sandbox"] });
    try {
      for (const w of [1280, 400]) {
        const c = await b.newContext({ viewport: { width: w, height: 860 } }); const p = await c.newPage(); const errs = [];
        p.on("pageerror", (e) => errs.push(e.message)); await c.route("**/*", (r) => (r.request().url().startsWith("file:") ? r.continue() : r.abort()));
        await p.goto("file://" + tmp);
        const m = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, you: document.querySelector("#you h2").getBoundingClientRect().height > 0, hiddenAtRest: document.querySelectorAll("[hidden]").length }));
        assert.deepStrictEqual(errs, []); assert.ok(m.sw <= m.cw, "horizontal overflow at " + w + ": " + m.sw + " > " + m.cw); assert.ok(m.you); assert.strictEqual(m.hiddenAtRest, 0, "nothing is hidden before a filter is used");
        if (w === 1280) {
          const total = await p.evaluate(() => document.querySelectorAll("table[data-filter=rows] tbody tr").length);
          await p.fill("#q", "DOC-OBS"); const n = await p.evaluate(() => document.querySelectorAll("table[data-filter=rows] tbody tr:not([hidden])").length); assert.ok(n > 0 && n < total, "search narrows the rows");
          await p.fill("#q", ""); await p.click('[data-f-env="prod"]'); const sc = await p.evaluate(() => document.querySelectorAll(".scope:not([hidden])").length); assert.strictEqual(sc, d.reg.scopes.filter((x) => x.env === "prod").length, "env filter shows the production scopes only");
          await p.click('[data-f-env="all"]'); await p.click('[data-f-st="bad"]'); const bad = await p.evaluate(() => Array.from(document.querySelectorAll("#road tbody tr:not([hidden])")).every((r) => r.getAttribute("data-st") === "bad")); assert.ok(bad);
        }
        await c.close();
      }
    } finally { await b.close(); fs.rmSync(tmp, { force: true }); }
  });

  it("P10 decisions are listed with options, the Code proposal marked 'ไม่ใช่มติ', a decider; only an owner-confirmed decision may be 'decided' or 'parked' and it must carry an outcome naming that source", () => {
    const html = out.document; assert.strictEqual(d.reg.decisions.length, 6);
    d.reg.decisions.forEach((x) => { assert.ok(html.includes('id="decisions"') && html.includes(">" + x.id + " · ผู้ตัดสิน")); assert.ok(/ไม่ใช่มติ/.test(x.codeView)); if (x.status !== "open") assert.ok(x.outcome && /เจ้าของ/.test(x.outcome), x.id + " non-open needs an owner-sourced outcome"); });
    const by = (st) => d.reg.decisions.filter((x) => x.status === st).map((x) => x.id);
    assert.deepStrictEqual([by("open"), by("decided"), by("parked")], [["D1", "D5", "D6"], ["D2", "D4"], ["D3"]]);
    assert.ok(!/วัน|เดือน|ปี/.test(d.reg.decisions.find((x) => x.id === "D6").codeView.replace(/ไม่เสนอจำนวนวัน/, "")), "D6: Code must not propose a retention period");
    assert.strictEqual(count(html, /รอตัดสิน<\/div><h3>/g), 3); assert.strictEqual(count(html, /พักไว้<\/div><h3>/g), 1); assert.strictEqual(count(html, /ตัดสินแล้ว<\/div><h3>/g), 2);
    const bad = parse(MD); bad.reg.decisions[0].codeView = "ควร lock เลย"; assert.ok(validate(bad).some((e) => /not a decision/.test(e)));
  });
  it("P12 round r3: AI chat is a separate checklist from Listing, Node.js 20 is UNVERIFIED not FAIL, and the owner-screenshot check R12 is separate from R11", () => {
    const sc = (id) => d.reg.scopes.find((x) => x.id === id), it = (id) => d.reg.scopes.flatMap((x) => x.items).find((x) => x.id === id);
    assert.ok(sc("S-TEST-CHAT") && sc("S-TEST-CHAT").items.map((x) => x.id).join() === "T22" && sc("S-PROD-CHAT"));
    ["S-DEV-CORE", "S-TEST-FLOW", "S-TEST-PUBLIC", "S-TEST-NEG"].forEach((id) => assert.ok(!sc(id).items.some((x) => x.id === "T22" || x.id === "P07"), id + " must not hold chat items"));
    assert.strictEqual(it("P06").status, "unverified"); assert.strictEqual(it("R11").status, "unverified"); assert.strictEqual(it("R12").status, "pass"); assert.strictEqual(d.reg.scopes.filter((x) => x.locked).length, 2);
  });
  it("P13 round r4: owner ideas are kept in three separate tiers, the proposals are only 'proposed' (nothing fixed), every DOC-OBS has a proposal, and the proposals show a requirement check", () => {
    const html = out.document; const tier = (t) => d.reg.ideas.filter((x) => x.tier === t).length;
    assert.ok(tier("current") >= 3 && tier("next") >= 3 && tier("future") >= 3, "ideas are split into current / next / future");
    assert.strictEqual(count(html, /<section id="ideas">/g), 1); assert.strictEqual(count(html, /<section id="props">/g), 1);
    d.reg.ideas.forEach((x) => assert.ok(html.includes(">" + x.id + "</div>")));
    ["DOC-OBS-01", "DOC-OBS-02", "DOC-OBS-03", "DOC-OBS-04", "DOC-OBS-05"].forEach((o) => assert.ok(d.reg.proposals.some((x) => x.obs === o), o + " has a proposal"));
    d.reg.proposals.forEach((x) => { assert.ok(["proposed", "blocked-decision", "in-draft", "verified-test"].includes(x.status)); assert.ok(x.reqCheck.length >= 2 && x.test.length > 10, x.id); assert.ok(html.includes(">" + x.id + " · " + x.obs)); });
    assert.ok(d.reg.proposals.find((x) => x.obs === "DOC-OBS-02").status === "in-draft" && d.reg.decisions.find((x) => x.id === "D2").status === "decided", "D2 is decided; the land-unit fix is only in the draft (not verified on TEST)");
    const bad = parse(MD); bad.reg.proposals[0].status = "done"; assert.ok(validate(bad).some((e) => /bad status/.test(e)));
    const bad2 = parse(MD); bad2.reg.ideas[0].tier = "later"; assert.ok(validate(bad2).some((e) => /bad tier/.test(e)));
  });
  it("P14 round r5: the 10 owner requirements are registered in three tiers; splitting criteria adds NO pass; R12 passes with the owner's screenshots while R11 stays UNVERIFIED; no stale document head is shown as current", () => {
    const html = out.document; const tier = (t) => d.reg.reqs.filter((x) => x.tier === t).length;
    assert.ok(tier("current") >= 4 && tier("when") >= 4 && tier("future") >= 2); ["A1", "A2a", "A2b", "A3", "A4", "A5", "A6", "A7", "A8", "A9a", "A9b", "A9c", "A10a", "A10b"].forEach((id) => assert.ok(d.reg.reqs.some((x) => x.id === id), id));
    assert.strictEqual(count(html, /<section id="reqs">/g), 1); d.reg.reqs.forEach((x) => assert.ok(html.includes(">" + x.id + "</div>")));
    const all = d.reg.scopes.flatMap((x) => x.items), it = (id) => all.find((x) => x.id === id);
    assert.strictEqual(it("R12").status, "pass"); assert.ok(/11:08/.test(it("R12").ref) && /6 ภาพ/.test(it("R12").ref)); assert.strictEqual(it("R11").status, "unverified");
    ["T17", "T19", "T20", "T21", "P04", "D12"].forEach((id) => { assert.ok(!all.some((x) => x.id === id), id + " was split"); const kids = all.filter((x) => new RegExp("^" + id + "[a-z]$").test(x.id)); assert.ok(kids.length >= 2, id + " has sub-items"); if (id !== "D12") assert.ok(kids.every((x) => x.status !== "pass"), id + " sub-items add no pass (splitting never creates a PASS; D12's results come from real runs — see P15)"); });
    assert.strictEqual(d.reg.scopes.length, 12);
    const P = d.reg.package; assert.ok(/^[0-9a-f]{40}$/.test(P.docBaseSha) && P.docBaseSha !== "34a0eb0ee27bddfa72003958dd7e0546a9b490b2", "the document head shown is not the old v1.1 commit"); assert.ok(html.includes(P.docBaseSha.slice(0, 7)) && !/เอกสารล่าสุดใน GitHub \(v1\.1\)/.test(html));
    ["BLUEPRINT.md", "HANDOFF-NEXT-CHAT.md", "PROJECT-STATUS.md"].forEach((f) => { const t = fs.readFileSync(path.join(ROOT, f), "utf8"); const head = t.slice(0, 9000); assert.ok(head.includes(P.docBaseSha) && head.includes(P.sourceHeadSha) && head.includes(P.deployedTestSha) && /สถานะปัจจุบัน \(r\d+[a-z]?\)/.test(head), f + " names source head, document base and the deployed TEST head at the top"); assert.ok(/\[ประวัติ ณ v2\] Code baseline/.test(head), f + " marks the old PR-head line as history"); });
  });
  it("P15 round r6: the four heads are separate fields (source / document base / Cloud TEST / production), the old ambiguous codeSha is gone, and D12 follows the real results (combined stays UNVERIFIED, D12d keeps the failed round, D08 stays FAIL)", () => {
    const P = d.reg.package, all = d.reg.scopes.flatMap((x) => x.items), it = (id) => all.find((x) => x.id === id);
    assert.ok(!("codeSha" in P), "no ambiguous 'codeSha'"); assert.ok(/^[0-9a-f]{40}$/.test(P.sourceHeadSha) && /^[0-9a-f]{40}$/.test(P.docBaseSha) && /^[0-9a-f]{40}$/.test(P.deployedTestSha) && P.deployedProdSha === "ไม่ทราบ");
    assert.notStrictEqual(P.sourceHeadSha, P.deployedTestSha, "source head and the deployed TEST head are different fields (the deployed head is a documentation commit on top of the source head)"); assert.ok(out.document.includes(P.sourceHeadSha.slice(0, 7)) && out.document.includes("Source / code head ปัจจุบัน"));
    assert.strictEqual(it("D12a").status, "pass"); assert.ok(/100/.test(it("D12a").ref) && it("D12a").ref.includes(P.sourceHeadSha.slice(0, 7)));
    assert.strictEqual(it("D12b").status, "pass"); assert.ok(/34/.test(it("D12b").ref) && /[0-9a-f]{7}/.test(it("D12b").ref) && /data\.js/.test(it("D12b").ref), "D12b names the SHA it was run at and why it was rerun (r9 touched data.js)");
    assert.strictEqual(it("D12c").status, "unverified"); assert.ok(/ไม่ได้รัน/.test(it("D12c").ref));
    assert.ok(/ล้ม 1/.test(it("D12d").ref) && /B2/.test(it("D12d").ref), "D12d keeps the round that failed on B2"); assert.strictEqual(it("D08").status, "fail", "the flake is never hidden");
    ["FX-1", "FX-2", "FX-3", "FX-4"].forEach((id) => assert.strictEqual(d.reg.proposals.find((x) => x.id === id).status, "verified-test", id));
    ["ISS-TESTBUILD", "ISS-RAIL-ANON", "ISS-MAP-LIMITS"].forEach((id) => assert.ok(d.reg.issues.some((x) => x.id === id && x.status === "open"), id + " is registered and open")); ["D17", "D18", "D19"].forEach((id) => assert.strictEqual(it(id).status, "pass", id)); assert.ok(/ไม่ลบ PASS|PASS เดิม/.test(d.reg.issues.find((x) => x.id === "ISS-TESTBUILD").source), "the earlier Cloud PASS results are kept, with the build limitation"); assert.strictEqual(d.reg.proposals.find((x) => x.id === "FX-5").status, "in-draft");
    assert.strictEqual(it("T12").status, "fail", "T12 stays FAIL");
  });
  it("P16 round r8 (Cloud TEST results of head 2c89759): T10/T13/T14/T16 PASS as REAL-TEST with the owner's screenshot ids, T12 FAIL, S-TEST-PUBLIC = 6/7 ≈ 86% for that scope only; the one-file photo result is not generalised; the earlier local results stay separate; source unchanged", () => {
    const P = d.reg.package, all = d.reg.scopes.flatMap((x) => x.items), it = (id) => all.find((x) => x.id === id);
    assert.strictEqual(P.deployedTestSha, "2c897593321713783d0ba81c7167962e1793be9a"); assert.ok(/^[0-9a-f]{40}$/.test(P.sourceHeadSha), "source head is a full SHA (r9: d7ee37e)"); assert.strictEqual(P.deployedProdSha, "ไม่ทราบ");
    const want = { T10: /145029/, T13: /145317/, T14: /144101/, T16: /143124/ };
    Object.keys(want).forEach((id) => { assert.strictEqual(it(id).status, "pass", id); assert.strictEqual(it(id).level, "REAL-TEST", id + " is Cloud evidence, not emulator"); assert.ok(want[id].test(it(id).ref) && /own-14a754ca222d54e405fe/.test(it(id).ref), id + " cites the owner's screenshot ids and the case"); });
    assert.ok(/เฉพาะเคสนี้/.test(it("T13").ref + it("T13").text) && /บัญชี Owner เดียวกัน/.test(it("T14").ref), "T13 / T14 limits kept"); assert.ok(/150059/.test(it("T16").ref) && /ก่อน Ctrl\+Shift\+R/.test(it("T16").ref) && /ไม่มีหลักฐานว่ารูปเดิมแสดงระหว่างโหลด/.test(it("T16").ref), "owner's clarification kept");
    assert.strictEqual(it("T12").status, "fail"); assert.ok(/100 ตร\.ว\./.test(d.reg.issues.find((x) => x.id === "DOC-OBS-02").source), "T12 reason kept");
    assert.strictEqual(it("T18a").status, "pass"); assert.ok(/1 ไฟล์/.test(it("T18a").text) && /ห้ามสรุปว่าตรวจครบ 7 ไฟล์/.test(it("T18a").ref), "one file only"); assert.strictEqual(it("T18b").status, "unverified"); ["T17a", "T17b", "T17c"].forEach((id) => assert.strictEqual(it(id).status, "unverified", id)); assert.strictEqual(it("T23").status, "pass");
    const sp = d.reg.scopes.find((x) => x.id === "S-TEST-PUBLIC"); assert.deepStrictEqual(["T09", "T10", "T11", "T12", "T13", "T14", "T16"], sp.items.map((x) => x.id), "the locked S-TEST-PUBLIC checklist is unchanged (no items added or removed)"); assert.ok(/ไม่ใช่เปอร์เซ็นต์ทั้งโครงการ/.test(sp.lockNote));
    const flow = d.reg.scopes.find((x) => x.id === "S-TEST-FLOW"); assert.strictEqual(flow.items.length, 9, "the locked S-TEST-FLOW checklist is unchanged"); assert.ok(out.document.includes("6/7") && out.document.includes("= 86%"));
    ["ISS-MAP-LIMITS", "ISS-TESTBUILD", "ISS-RAIL-ANON"].forEach((id) => assert.ok(d.reg.issues.some((x) => x.id === id && x.status === "open"), id + " stays open")); ["DOC-OBS-01", "DOC-OBS-03", "DOC-OBS-04", "DOC-OBS-05"].forEach((id) => assert.strictEqual(d.reg.issues.find((x) => x.id === id).status, "closed", id)); assert.strictEqual(d.reg.issues.find((x) => x.id === "DOC-OBS-02").status, "open");
    assert.ok(it("D08").status === "fail" && it("D12c").status === "unverified" && it("D12d").ref.includes("ล้ม 1"), "local-test facts untouched: D08 FAIL, combined UNVERIFIED, the failed B2 round kept");
    ["BLUEPRINT.md", "HANDOFF-NEXT-CHAT.md", "PROJECT-STATUS.md"].forEach((f) => { const t = fs.readFileSync(path.join(ROOT, f), "utf8"); assert.ok(t.includes("ผลปรับรอบ r8") && /Cloud TEST[^\n]{0,80}2c897593321713783d0ba81c7167962e1793be9a/.test(t.slice(0, 3000)), f + " carries the r8 block and the deployed head at the top"); });
  });
  it("P11 the package set shown in the panel is the one in the handoff files (same id and revision in the registry, the three files' CODE-V2-01 block and the page header)", () => {
    assert.ok(out.document.includes(d.reg.package.set));
    for (const f of ["BLUEPRINT.md", "HANDOFF-NEXT-CHAT.md", "PROJECT-STATUS.md"]) { const t = fs.readFileSync(path.join(ROOT, f), "utf8"); assert.ok(t.includes(d.reg.package.set.replace(/^.*\+ /, "")) && t.includes(d.reg.package.id), f + " must carry the current revision block"); }
  });
});
