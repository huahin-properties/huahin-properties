// SEC-TEST-01 (C) — call-site guard. Reads SOURCE FILES ONLY; no Firebase, no network.
//
// Purpose: pin the CURRENT list of pages/files that read the sensitive
// collections, so a later package that tightens rules knows exactly which
// call sites it can break, and so a NEW reader cannot appear unnoticed.
// If this test fails, a reader was added/removed: update EXPECTED below and
// docs/security/SEC-TEST-01.md in the same change.
//
// It is an inventory check, not a security check. It says nothing about
// whether the rules are safe.

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const ROOT = path.join(__dirname, "..");
const files = fs.readdirSync(ROOT).filter((f) => /\.(html|js)$/.test(f)).sort();
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");

function filesMatching(re) {
  return files.filter((f) => re.test(read(f)));
}

const EXPECTED = {
  // Readers of owners / tenants (all admin pages; each calls requireAdminAuth/isAdminAuthed,
  // which is "any team member" — Staff included; there is no Owner-only split in these pages).
  ownersReaders: ["AI Quick Add.dc.html", "Admin Dashboard.dc.html", "Member Management.dc.html", "Owners.dc.html"],
  tenantsReaders: ["Admin Dashboard.dc.html", "Member Management.dc.html", "Owners.dc.html"],
  // buyerRegistrations: one page + the registerBuyer() helper (duplicate-buyer check done CLIENT-side
  // by reading all registrations of a property; called from Lister Dashboard).
  buyerRegPageReaders: ["Member Management.dc.html"],
  buyerRegHelperFiles: ["firebase-client.js"],
  buyerRegCallers: ["Lister Dashboard.dc.html", "firebase-client.js"],
  // Unfiltered whole-collection reads of properties.
  propertiesFetchAll: [
    "AI Quick Add.dc.html", "Admin Dashboard.dc.html", "Developer Maintenance Center.dc.html",
    "Listing Approvals.dc.html", "Member Management.dc.html", "Owners.dc.html", "Property Map.dc.html",
    "Staff Workspace.dc.html", "data.js", "firebase-client.js", "seed-package-demo.js",
  ],
  // Files that call getEffectiveProperties() (-> data.js:fetchCollection("properties")): PUBLIC pages.
  publicPropertyReaders: [
    "AI Concierge.dc.html", "ContactRail.dc.html", "Home.dc.html", "Property Details.dc.html",
    "Search Results.dc.html", "Site Content.dc.html",
    "baan-3-hongnon-hua-hin.html", "baan-4-hongnon-hua-hin.html", "baan-cha-am.html", "baan-chao-hua-hin.html",
    "baan-hin-lek-fai.html", "baan-hua-hin-mai-kern-10-lan.html", "baan-hua-hin-mai-kern-5-lan.html",
    "baan-hua-hin.html", "baan-pranburi.html", "baan-thap-tai.html", "cha-am-property.html",
    "condo-hua-hin.html", "condo-tid-talay-hua-hin.html", "hua-hin-condo.html", "hua-hin-house-for-sale.html",
    "hua-hin-pool-villa.html", "index.html", "pool-villa-hua-hin.html", "pool-villa-khao-takiab.html",
    "pranburi-property.html", "thidin-hua-hin.html",
  ],
};

describe("SEC-TEST-01 C: call-site inventory (source only)", function () {
  const reg = (name, re, expected) =>
    it(name, () => assert.deepStrictEqual(filesMatching(re), expected.slice().sort(), name + " — reader list changed"));

  reg("owners readers", /fetchCollection\(\s*["']owners["']\s*\)/, EXPECTED.ownersReaders);
  reg("tenants readers", /fetchCollection\(\s*["']tenants["']\s*\)/, EXPECTED.tenantsReaders);
  reg("buyerRegistrations page readers", /fetchCollection\(\s*["']buyerRegistrations["']\s*\)/, EXPECTED.buyerRegPageReaders);
  reg("buyerRegistrations direct collection() users", /collection\(\s*["']buyerRegistrations["']\s*\)/, EXPECTED.buyerRegHelperFiles);
  reg("registerBuyer() callers/definers", /registerBuyer/, EXPECTED.buyerRegCallers);
  reg("unfiltered properties reads", /(fetchCollection|collection)\(\s*["']properties["']\s*\)/, EXPECTED.propertiesFetchAll);
  reg("public pages calling getEffectiveProperties()", /await\s+[A-Za-z_.]*getEffectiveProperties\(/, EXPECTED.publicPropertyReaders);

  it("admin readers of owners/tenants all gate on requireAdminAuth/isAdminAuthed (any team member)", () => {
    for (const f of new Set([...EXPECTED.ownersReaders, ...EXPECTED.tenantsReaders])) {
      assert.ok(/requireAdminAuth\(|isAdminAuthed\(/.test(read(f)), f + " has no admin gate");
    }
  });

  it("data.js getEffectiveProperties reads the WHOLE properties collection unfiltered", () => {
    const src = read("data.js");
    const i = src.indexOf("export async function getEffectiveProperties");
    assert.ok(i >= 0);
    const body = src.slice(i, i + 2500);
    assert.ok(/fetchCollection\(\s*["']properties["']\s*\)/.test(body), "expected unfiltered fetch");
    assert.ok(!/where\(/.test(body), "a where() filter appeared; the public read is no longer unfiltered");
  });

  it("Track Submission no longer downloads the whole properties collection (LISTING-E2E-01): server-checked token for new Cases, read-by-id for legacy Cases", () => {
    const src = read("Track Submission.dc.html");
    assert.ok(!/fetchCollection\(\s*["']properties["']\s*\)/.test(src), "whole-collection fetch is back");
    assert.ok(/trackListingCase\(/.test(src) && !/fetchDocById\(/.test(src) && !/fetchCaseMessages\(|watchCaseMessages\(|addCaseMessage\(/.test(src), "the customer page must use only the server-checked function");
  });
});
