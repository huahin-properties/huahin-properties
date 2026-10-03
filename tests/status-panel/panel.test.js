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

  it("P4 percentages: every scope is UNLOCKED, so the panel says 'ยังคำนวณไม่ได้', and the draft numbers match the checklist (pass/applicable)", () => {
    const html = out.document;
    d.reg.scopes.forEach((s) => {
      const p = pct(s); assert.strictEqual(p.computable, false, s.id + " must not show a percentage while unlocked");
      const card = html.slice(html.indexOf('id="scope-' + s.id + '"'), html.indexOf("</article>", html.indexOf('id="scope-' + s.id + '"')));
      assert.ok(card.includes("ยังคำนวณไม่ได้") && card.includes("ไม่ใช่ความคืบหน้า") && card.includes(p.pass + "/" + p.n), s.id);
      assert.strictEqual(s.items.filter((i) => i.status === "pass").length, p.pass);
      assert.strictEqual(p.count.pass + p.count.fail + p.count.blocked + p.count.unverified + p.count.na, s.items.length);
    });
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

  it("P8 docs-only round: the panel work touches no website/Functions/rules file (git, against the code SHA of the package)", function () {
    let names; try { names = execSync("git diff --name-only " + d.reg.package.codeSha + " -- . ':!docs' ':!tools/status-panel' ':!tests/status-panel' ':!*.md' ':!package.json'", { cwd: ROOT, encoding: "utf8" }).trim(); } catch (e) { return this.skip(); }
    assert.strictEqual(names, "", "non-doc files differ from the package code SHA:\n" + names);
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

  it("P10 decisions D1-D5 are listed with options, the Code proposal marked 'ไม่ใช่มติ', a decider; only an owner-confirmed decision may be 'decided' or 'parked' and it must carry an outcome naming that source", () => {
    const html = out.document; assert.strictEqual(d.reg.decisions.length, 5);
    d.reg.decisions.forEach((x) => { assert.ok(html.includes('id="decisions"') && html.includes(">" + x.id + " · ผู้ตัดสิน")); assert.ok(/ไม่ใช่มติ/.test(x.codeView)); if (x.status !== "open") assert.ok(x.outcome && /เจ้าของ/.test(x.outcome), x.id + " non-open needs an owner-sourced outcome"); });
    const by = (st) => d.reg.decisions.filter((x) => x.status === st).map((x) => x.id);
    assert.deepStrictEqual([by("open"), by("decided"), by("parked")], [["D1", "D2", "D5"], ["D4"], ["D3"]]);
    assert.strictEqual(count(html, /รอตัดสิน<\/div><h3>/g), 3); assert.strictEqual(count(html, /พักไว้<\/div><h3>/g), 1); assert.strictEqual(count(html, /ตัดสินแล้ว<\/div><h3>/g), 1);
    const bad = parse(MD); bad.reg.decisions[0].codeView = "ควร lock เลย"; assert.ok(validate(bad).some((e) => /not a decision/.test(e)));
  });
  it("P12 round r3: AI chat is a separate checklist from Listing, Node.js 20 is UNVERIFIED not FAIL, and the owner-screenshot check R12 is separate from R11", () => {
    const sc = (id) => d.reg.scopes.find((x) => x.id === id), it = (id) => d.reg.scopes.flatMap((x) => x.items).find((x) => x.id === id);
    assert.ok(sc("S-TEST-CHAT") && sc("S-TEST-CHAT").items.map((x) => x.id).join() === "T22" && sc("S-PROD-CHAT"));
    ["S-DEV-CORE", "S-TEST-FLOW", "S-TEST-PUBLIC", "S-TEST-NEG"].forEach((id) => assert.ok(!sc(id).items.some((x) => x.id === "T22" || x.id === "P07"), id + " must not hold chat items"));
    assert.strictEqual(it("P06").status, "unverified"); assert.strictEqual(it("R11").status, "unverified"); assert.strictEqual(it("R12").status, "unverified"); assert.ok(d.reg.scopes.every((x) => x.locked === false));
  });
  it("P11 the package set shown in the panel is the one in the handoff files (same id and revision in the registry, the three files' CODE-V2-01 block and the page header)", () => {
    assert.ok(out.document.includes(d.reg.package.set));
    for (const f of ["BLUEPRINT.md", "HANDOFF-NEXT-CHAT.md", "PROJECT-STATUS.md"]) { const t = fs.readFileSync(path.join(ROOT, f), "utf8"); assert.ok(t.includes(d.reg.package.set.replace(/^.*\+ /, "")) && t.includes(d.reg.package.id), f + " must carry the current revision block"); }
  });
});
