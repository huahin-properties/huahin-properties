// LISTING-E2E-01 — how a signed-in TEAM member's browser shows a PRIVATE (pending-review) photo.
// The file has no download token (nothing to leak or reuse), so a plain <img src="…"> can not load it. The browser fetches it with the
// member's own Firebase ID token (Storage REST accepts "Authorization: Firebase <id token>", and storage.rules decide), turns the bytes into
// an in-memory object URL, and uses that. The URL exists only in this page; it is not stored anywhere and is useless to anyone else.
export function storageMediaUrl(bucket, path, host) {
  return (host || "https://firebasestorage.googleapis.com") + "/v0/b/" + bucket + "/o/" + encodeURIComponent(path) + "?alt=media";
}
export async function fetchPrivatePhotoBlob({ bucket, path, getIdToken, fetchImpl, host }) {
  const token = await getIdToken();
  if (!token) throw Object.assign(new Error("private_photo_not_signed_in"), { status: 401 });
  const res = await (fetchImpl || fetch)(storageMediaUrl(bucket, path, host), { headers: { Authorization: "Firebase " + token } });
  if (!res.ok) throw Object.assign(new Error("private_photo_" + res.status), { status: res.status });
  return res.blob();
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
