// D2 (owner decision 3 ต.ค. 2569) — land size in ตร.ว. or ตร.ม., 1 ตร.ว. = 4 ตร.ม.; old unitless data is never guessed or converted. Pure logic: browser copy == server copy, same vectors.
"use strict";
const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");
const ROOT = path.join(__dirname, "..", "..");
const esm = (f) => import(pathToFileURL(path.join(ROOT, f)).href);

describe("D2 land area (ตร.ว. / ตร.ม.)", () => {
  const impls = {};
  before(async () => { impls.browser = await esm("land-area.js"); impls.server = require("../../functions/land-area.js"); });
  const each = (fn) => Object.keys(impls).forEach((k) => fn(impls[k], k));

  it("LA1 100 ตร.ว. = 400 ตร.ม. and 400 ตร.ม. = 100 ตร.ว. (both copies)", () => each((L, k) => {
    assert.strictEqual(L.SQM_PER_SQWA, 4, k);
    assert.strictEqual(L.toSqm(100, "sqwa"), 400, k); assert.strictEqual(L.toSqm(400, "sqm"), 400, k);
    assert.strictEqual(L.fromSqm(400, "sqwa"), 100, k); assert.strictEqual(L.fromSqm(400, "sqm"), 400, k);
    assert.strictEqual(L.toSqm(12.5, "sqwa"), 50, k); assert.strictEqual(L.toSqm(0.25, "sqwa"), 1, k); assert.strictEqual(L.fromSqm(1, "sqwa"), 0.25, k);
    assert.deepStrictEqual(L.landAreaFields(100, "sqwa"), { landAreaValue: 100, landAreaUnit: "sqwa", landAreaSqm: 400 }, k);
    assert.deepStrictEqual(L.landAreaFields("400", "sqm"), { landAreaValue: 400, landAreaUnit: "sqm", landAreaSqm: 400 }, k);
  }));

  it("LA2 nothing is guessed: a missing/invalid unit or value gives NO fields (never a default unit)", () => each((L, k) => {
    for (const [v, u] of [[100, ""], [100, undefined], [100, null], [100, "rai"], [100, "SQM"], [0, "sqm"], [-5, "sqwa"], [NaN, "sqm"], ["abc", "sqm"], [Infinity, "sqm"], [null, "sqm"], ["", "sqm"]]) assert.strictEqual(L.landAreaFields(v, u), null, k + " " + JSON.stringify([v, u]));
  }));

  it("LA3 convert ONCE: the canonical value is always recomputed from the ENTERED value + unit, so save → reload → edit → save never converts twice", () => each((L, k) => {
    let rec = Object.assign({}, L.landAreaFields(100, "sqwa"));
    for (let i = 0; i < 5; i++) { // what a page does: show landAreaValue/landAreaUnit, save them again
      const again = L.landAreaFields(String(rec.landAreaValue), rec.landAreaUnit); assert.deepStrictEqual(again, rec, k + " round " + i); rec = again;
    }
    assert.strictEqual(rec.landAreaSqm, 400, k);
    // a stale / hand-edited canonical value can not survive normalisation
    assert.strictEqual(L.normalizeLandArea({ landAreaValue: 100, landAreaUnit: "sqwa", landAreaSqm: 9999 }).landAreaSqm, 400, k);
    // switching the unit is a NEW entry: 400 ตร.ม. is 400 (not 1,600 and not 100)
    assert.deepStrictEqual(L.landAreaFields(400, "sqm"), { landAreaValue: 400, landAreaUnit: "sqm", landAreaSqm: 400 }, k);
  }));

  it("LA4 the view: known = value as entered + its unit + the other unit; an OLD unitless landSize is shown WITHOUT a unit (kind legacy) and is never converted; unit-aware wins over the old field", () => each((L, k) => {
    assert.deepStrictEqual(L.landAreaView({ landAreaValue: 100, landAreaUnit: "sqwa", landAreaSqm: 400 }), { kind: "known", value: 100, unit: "sqwa", sqm: 400, otherUnit: "sqm", otherValue: 400 }, k);
    assert.deepStrictEqual(L.landAreaView({ landAreaValue: 400, landAreaUnit: "sqm" }), { kind: "known", value: 400, unit: "sqm", sqm: 400, otherUnit: "sqwa", otherValue: 100 }, k);
    assert.deepStrictEqual(L.landAreaView({ landSize: 100 }), { kind: "legacy", value: 100 }, k);
    assert.deepStrictEqual(L.landAreaView({ landSize: 100, landAreaValue: 50, landAreaUnit: "sqm" }).kind, "known", k);
    assert.deepStrictEqual(L.landAreaView({ landSize: 100, landAreaValue: 50, landAreaUnit: "wah" }), { kind: "legacy", value: 100 }, k + " an invalid unit never produces a converted value");
    for (const rec of [null, undefined, {}, { landSize: 0 }, { landSize: "abc" }, { landSize: -1 }]) assert.strictEqual(L.landAreaView(rec), null, k);
  }));

  it("LA5 the browser copy and the server copy behave identically on every vector", () => {
    const vectors = [[100, "sqwa"], [400, "sqm"], [12.5, "sqwa"], [0.333, "sqwa"], [1e9, "sqm"], [0, "sqm"], [5, "x"], ["7.5", "sqwa"], [undefined, "sqm"]];
    for (const [v, u] of vectors) { assert.deepStrictEqual(impls.browser.landAreaFields(v, u), impls.server.landAreaFields(v, u), JSON.stringify([v, u])); assert.strictEqual(impls.browser.toSqm(v, u), impls.server.toSqm(v, u)); assert.strictEqual(impls.browser.fromSqm(v, u), impls.server.fromSqm(v, u)); }
    for (const rec of [{ landSize: 3 }, { landAreaValue: 2, landAreaUnit: "sqwa" }, {}, null, { landSize: 3, landAreaValue: 9, landAreaUnit: "q" }]) assert.deepStrictEqual(impls.browser.landAreaView(rec), impls.server.landAreaView(rec), JSON.stringify(rec));
  });
});
