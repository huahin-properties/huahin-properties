#!/usr/bin/env bash
# LISTING-E2E-01 — puts the LISTING TEST site on a TEST Firebase project. Run it in the owner's Codespace terminal (the black screen).
#   bash tools/listing-test/deploy-test.sh [project-id]        default: huahin-chat-test-01
# Refuses anything that is not huahin-chat-test-* / huahin-listing-test-*; puts --project on EVERY Firebase call (never relies on .firebaserc, which is
# production); asks you to type DEPLOY-TEST before the first deploy; deploys ONLY: Firestore rules, Storage rules, 9 NAMED functions, the test web page.
# No AI key, no secret, no Stripe/LINE/e-mail functions. This is NOT the old CHAT-LIVE script (tools/chat-live/deploy-test.sh) and does not touch it.
set -euo pipefail
PROJECT="${1:-huahin-chat-test-01}"
PROD="huahin-properties-5f1b5"
FUNCS="submitListingCase,previewListingCase,publishListingCase,unpublishListingCase,syncListingCase,addCasePhotos,reconcileListingFiles,listMyCases,trackListingCase"
say() { printf '\n== %s\n' "$*"; }
die() { printf '\nSTOP: %s\n' "$*" >&2; exit 1; }
[[ "$PROJECT" != "$PROD" ]] || die "that is the PRODUCTION project. This script only works on a TEST project."
[[ "$PROJECT" =~ ^huahin-(listing|chat)-test-[a-z0-9]+(-[a-z0-9]+)*$ && ${#PROJECT} -le 30 ]] || die "project id must look like huahin-chat-test-<suffix> or huahin-listing-test-<suffix> (got: $PROJECT)."
cd "$(dirname "$0")/../.."
[[ -f tools/build-listing-test.js && -f functions/listing-case.js && -f firebase.json ]] || die "run this from the repo (branch claude/listing-e2e-01). Files are missing."
FB="${FIREBASE_CMD:-npx --yes firebase-tools@15.32.1}"
NPM="${NPM_CMD:-npm}"
fb() { $FB "$@" --project "$PROJECT"; }

say "1/7 Firebase login check"
if ! $FB projects:list >/dev/null 2>&1; then
  echo "Not logged in. Follow the link it prints, sign in with the Google account that owns $PROJECT, then paste the code back HERE (the black terminal)."
  $FB login --no-localhost
fi
PROJECTS="$( $FB projects:list --json )" || die "could not list projects"
printf '%s' "$PROJECTS" | node -e 'const fs=require("fs"); const p=process.argv[1]; const j=JSON.parse(fs.readFileSync(0,"utf8")); const a=Array.isArray(j.result)?j.result:j.result?.projects; if(!Array.isArray(a)||!a.some(x=>(x.projectId||x.projectid||x.id)===p)) process.exit(1)' "$PROJECT" || die "this login can not see project $PROJECT. Log in with the right Google account. Nothing was deployed."

say "2/7 Web app config (public identifiers, not secrets)"
APPS="$(fb apps:list WEB --json)" || die "could not list web apps; no app was created"
APPID="$(printf '%s' "$APPS" | node -e 'const fs=require("fs");const j=JSON.parse(fs.readFileSync(0,"utf8"));const a=Array.isArray(j.result)?j.result:j.result?.apps;if(!Array.isArray(a)||!a.length||!a[0].appId)process.exit(1);console.log(a[0].appId)')" || die "the project has no web app. Create one in the Firebase console (Project settings > Your apps > Web), then run this again."
TMPDIR_L="$(mktemp -d)"; trap 'rm -rf "$TMPDIR_L"' EXIT
fb apps:sdkconfig WEB "$APPID" >"$TMPDIR_L/sdk.txt"
node tools/chat-live/make-config.js "$PROJECT" "$TMPDIR_L/config.json" <"$TMPDIR_L/sdk.txt" || die "could not read the web app config."

say "3/7 Build the listing test site (refuses anything that could reach production)"
node tools/build-listing-test.js --config "$TMPDIR_L/config.json" --out build/listing-test || die "build refused — nothing was deployed."

say "4/7 Plan"
cat <<PLAN
Project : $PROJECT   (NOT production)
Deploys : Firestore rules, Storage rules,
          9 functions: ${FUNCS//,/, }
          test web page (build/listing-test) -> https://$PROJECT.web.app
Never   : other functions, Stripe, e-mail, LINE, any AI key, production.
NOTE    : this replaces the test web page and the Firestore/Storage rules of $PROJECT.
PLAN
ANS="${LISTING_TEST_CONFIRM:-}"
if [[ -z "$ANS" ]]; then read -r -p "Type DEPLOY-TEST and press Enter to continue (anything else stops): " ANS; fi
[[ "$ANS" == "DEPLOY-TEST" ]] || die "not confirmed — nothing was deployed."

say "5/7 Build the listing-only functions folder (no secrets), install its libraries, deploy the 9 functions from it"
# WHY a separate folder: the Firebase CLI loads ALL of functions/index.js and asks Secret Manager about EVERY secret declared there (AI, Stripe, e-mail, LINE)
# before it applies --only — so deploying from functions/ fails on a project with no such secrets. The listing functions need none.
node tools/listing-test/build-functions.js --out build/listing-functions || die "listing functions build refused — nothing was deployed."
( cd build/listing-functions && $NPM install --no-audit --no-fund ) || die "npm install in build/listing-functions failed — nothing was deployed."
( cd build/listing-functions && $FB deploy --only "$(printf 'functions:listing:%s,' ${FUNCS//,/ } | sed 's/,$//')" --project "$PROJECT" )

say "6/7 Deploy Firestore + Storage rules"
fb deploy --only firestore:rules
fb deploy --only storage

say "7/7 Deploy the test web page (from inside the build folder, never from the repo root)"
( cd build/listing-test && $FB deploy --only hosting --project "$PROJECT" )

cat <<DONE

DONE. Test site: https://$PROJECT.web.app
Next (owner): follow docs/listing-e2e/OWNER-TEST-GUIDE.md — create the 2 test users and their adminUsers documents, then try the form.
DONE
