// LISTING-E2E-01 — the browser mirrors must equal the server copies; the Staff gate must follow Photo Standard v1.
"use strict";
const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");
const ROOT = path.join(__dirname, "..", "..");
const esm = (f) => import(pathToFileURL(path.join(ROOT, f)).href);

describe("LISTING-E2E-01 sync + Staff photo gate", () => {
  it("Y1 case-fields.js (browser) == functions/case-fields.js (server): same list, same order, same split", async () => {
    const b = await esm("case-fields.js"), s = require("../../functions/case-fields.js");
    assert.deepStrictEqual(b.PRIVATE_FIELDS, s.PRIVATE_FIELDS);
    const sample = { type: "house", price: 1, contactPhone: "x", trackToken: "t", approvedByUid: "u", title: "t" };
    assert.deepStrictEqual(b.splitCaseFields(sample), s.splitCaseFields(sample));
  });
  it("Y2 photo-standard.js (browser) == functions/photo-standard.js (server) == BLUEPRINT §32 numbers", async () => {
    const b = await esm("photo-standard.js"), s = require("../../functions/photo-standard.js");
    assert.deepStrictEqual(b.PHOTO_STANDARD, s.PHOTO_STANDARD);
    assert.deepStrictEqual(b.PHOTO_STANDARD, { land: { min: 1, target: 3 }, condo: { min: 2, target: 5 }, house: { min: 2, target: 6 }, villa: { min: 2, target: 7 }, townhouse: { min: 2, target: 5 }, commercial: { min: 2, target: 5 } });
  });
  it("Y3 Staff gate: a land plot with 1 photo is NOT blocked; 1 photo of a house IS; the target is only a recommendation", async () => {
    const w = await esm("intake-workflow.js");
    const def = w.defFor({ workflowVersion: "intake_v1", source: "owner_submission" });
    const step = def.steps.find((x) => x.requirements.some((r) => r.key === "photos_min"));
    const req = (k) => step.requirements.find((r) => r.key === k);
    const ctx = (type, n) => ({ prop: { type }, photoCount: n });
    assert.ok(req("photos_min").get(ctx("land", 1)) !== null, "land 1 photo passes the minimum");
    assert.strictEqual(req("photos_min").get(ctx("land", 0)), null);
    assert.strictEqual(req("photos_min").get(ctx("house", 1)), null, "house needs 2");
    assert.ok(req("photos_min").get(ctx("house", 2)) !== null);
    assert.strictEqual(req("photos_target").get(ctx("house", 2)), null);
    assert.ok(req("photos_target").get(ctx("house", 6)) !== null);
    assert.strictEqual(req("photos_target").level, w.LEVEL.OPTIONAL);
    assert.strictEqual(req("photos_min").level, w.LEVEL.CRITICAL);
    assert.ok(!step.requirements.some((r) => r.key === "photos_5"), "the flat 5-photo gate is gone");
  });
  it("Y4 public builder: toPublicProperty strips every private field of an intake Case and leaves other listings untouched", async () => {
    const d = await esm("data.js"), f = await esm("case-fields.js");
    const leaked = { id: "own-1", source: "owner_submission", listingStatus: "live", price: 1, title: "x" };
    f.PRIVATE_FIELDS.forEach((k) => { leaked[k] = "SECRET"; });
    const out = d.toPublicProperty(leaked);
    f.PRIVATE_FIELDS.forEach((k) => assert.ok(!(k in out), k + " leaked"));
    assert.strictEqual(out.price, 1);
    const lister = { id: "L1", listerId: "u", contactPhone: "0800000000", listingStatus: "live" };
    assert.strictEqual(d.toPublicProperty(lister), lister, "lister listings keep their public contact (unchanged behavior)");
  });
});
