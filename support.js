rules_version = '2';

// huahin.properties — Firebase Storage Security Rules
//
// Replaces the temporary open rule used to unblock the one-time photo
// migration. Only the signed-in admin can upload/delete files; anyone can
// view photos (needed for the public site to display them).
service firebase.storage {
  match /b/{bucket}/o {
    function isAdmin() {
      return request.auth != null && request.auth.uid == "n7TZKSBscPXE1kRU8WzYpsqJh2g2";
    }

    match /propertyPhotos/{fileName} {
      allow read: if true;
      // Any signed-in lister can upload/replace a property-photo file (the
      // Firestore doc that actually links it to a listing is still gated by
      // firestore.rules' listerId check) — needed for self-serve photo
      // upload in Lister Dashboard. Storage rules can't easily parse the
      // propertyId back out of the filename to check ownership precisely,
      // so this is intentionally a bit looser than the Firestore rule.
      allow write: if isAdmin() || request.auth != null;
    }
    match /profilePhotos/{fileName} {
      allow read: if true;
      // Any signed-in lister can upload their own avatar/cover photo (used
      // by Lister Dashboard profile settings → Agent Profile public page).
      allow write: if isAdmin() || request.auth != null;
    }
    match /{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
