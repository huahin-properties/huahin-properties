// LISTING-E2E-01 — how a signed-in TEAM member's browser shows a PRIVATE (pending-review) photo.
// The file has no download token (nothing to leak or reuse), so a plain <img src="…"> can not load it. The page asks the getCasePhoto function (team members only),
// turns the returned bytes into an in-memory object URL, and uses that. The URL exists only in this page; it is not stored anywhere and is useless to anyone else.
// (used by the tests only: they prove the bare Storage URL of a private photo shows nothing. The app never requests this URL from a page.)
export function storageMediaUrl(bucket, path, host) {
  return (host || "https://firebasestorage.googleapis.com") + "/v0/b/" + bucket + "/o/" + encodeURIComponent(path) + "?alt=media";
}
// The bytes come from the getCasePhoto Cloud Function (team members only; the path must be a recorded private photo of that Case). A direct request from the page
// to firebasestorage.googleapis.com is a cross-origin request that the browser blocks unless the bucket has a CORS policy (it did not on the TEST project), and a
// download token would make the photo shareable — neither is used.
export function caseIdOfPrivatePath(path) { const m = /^casePhotos\/([^/]+)\//.exec(path || ""); return m ? m[1] : ""; }
export function base64ToBlob(base64, contentType) {
  const bin = atob(base64); const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: contentType || "image/webp" });
}
export async function fetchPrivatePhotoBlob({ path, callFn }) {
  const propertyId = caseIdOfPrivatePath(path);
  if (!propertyId) throw Object.assign(new Error("private_photo_bad_path"), { status: 400 });
  let res;
  try { res = await callFn("getCasePhoto", { propertyId, path }); }
  catch (e) { throw Object.assign(new Error("private_photo_" + ((e && e.code) || "error")), { status: (e && e.code) === "functions/permission-denied" ? 403 : (e && e.code) === "functions/unauthenticated" ? 401 : 500 }); }
  if (!res || typeof res.base64 !== "string") throw Object.assign(new Error("private_photo_empty"), { status: 500 });
  return base64ToBlob(res.base64, res.contentType);
}
// A small cache (one object URL per path) so a list or a re-render does not fetch the same photo twice.
export function createPrivatePhotoLoader(deps) {
  const cache = new Map();
  const make = deps.createObjectURL || ((b) => URL.createObjectURL(b));
  return {
    load(path) {
      if (!cache.has(path)) cache.set(path, fetchPrivatePhotoBlob({ ...deps, path }).then(make).catch((e) => { cache.delete(path); throw e; }));
      return cache.get(path);
    },
    clear() { const revoke = deps.revokeObjectURL || ((u) => URL.revokeObjectURL(u)); cache.forEach((p) => p.then(revoke).catch(() => {})); cache.clear(); },
  };
}
