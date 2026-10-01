// SEC-TEST-01 — self-test of the probe helper. No emulator calls, no network.
// Proves that isAllowed()/attempt() treat ONLY the specific rules-denial codes as
// "denied" and let every other failure surface (so it fails the probe that hit it).

const assert = require("assert");
const { isAllowed, attempt, isPermissionDenied } = require("./helpers/synthetic");

const err = (code, message) => Object.assign(new Error(message || code), code ? { code } : {});

describe("SEC-TEST-01 helper self-test (isAllowed / attempt)", () => {
  it("success => allowed", async () => {
    assert.strictEqual(await isAllowed(Promise.resolve("ok")), true);
  });
  it("Firestore permission-denied => denied", async () => {
    assert.strictEqual(await isAllowed(Promise.reject(err("permission-denied"))), false);
  });
  it("Storage storage/unauthorized => denied", async () => {
    assert.strictEqual(await isAllowed(Promise.reject(err("storage/unauthorized"))), false);
  });
  const mustThrow = [
    ["network / unavailable", err("unavailable", "14 UNAVAILABLE: connect ECONNREFUSED")],
    ["storage/unauthenticated (not the rules-denial code)", err("storage/unauthenticated")],
    ["message mentions 403 but no denial code", err("", "Request failed with status code 403")],
    ["message mentions unauthorized but no denial code", err("", "unauthorized proxy response")],
    ["message mentions PERMISSION_DENIED but code is something else", err("internal", "7 PERMISSION_DENIED (from a log line)")],
    ["plain Error without code", new Error("boom")],
    ["non-Error rejection", "permission-denied"],
  ];
  for (const [name, e] of mustThrow) {
    it("re-throws: " + name, async () => {
      await assert.rejects(() => isAllowed(Promise.reject(e)));
      await assert.rejects(() => attempt(Promise.reject(e)));
    });
  }
  it("isPermissionDenied accepts exactly the two codes", () => {
    assert.strictEqual(isPermissionDenied(err("permission-denied")), true);
    assert.strictEqual(isPermissionDenied(err("storage/unauthorized")), true);
    assert.strictEqual(isPermissionDenied(err("storage/unauthenticated")), false);
    assert.strictEqual(isPermissionDenied(null), false);
  });
});
