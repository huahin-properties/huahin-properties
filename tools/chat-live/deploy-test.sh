#!/usr/bin/env bash
# CHAT-LIVE-01 — one script that puts the chat TEST site on the TEST Firebase project. Run it in the owner's Codespace terminal.
#   bash tools/chat-live/deploy-test.sh            (project huahin-chat-test-01)
# It refuses anything that is not huahin-chat-test-*, puts --project on every Firebase call (never relies on the default in
# .firebaserc, which is production), asks you to type DEPLOY-TEST before the first deploy, and deploys ONLY:
# Firestore rules+indexes, 5 functions, and the test web page. It never reads or prints a key: the AI key is typed into the
# Firebase CLI's own hidden prompt in THIS terminal.
set -euo pipefail
PROJECT="${1:-huahin-chat-test-01}"
PROD="huahin-properties-5f1b5"
say() { printf '\n== %s\n' "$*"; }
die() { printf '\nSTOP: %s\n' "$*" >&2; exit 1; }

[[ "$PROJECT" != "$PROD" ]] || die "that is the PRODUCTION project. This script only works on a huahin-chat-test-* project."
[[ "$PROJECT" =~ ^huahin-chat-test-[a-z0-9]+(-[a-z0-9]+)*$ && ${#PROJECT} -le 30 ]] || die "project id must look like huahin-chat-test-<suffix> (got: $PROJECT)."
cd "$(dirname "$0")/../.."
[[ -f tools/build-chat-live.js && -f functions/chat-test-gate.js && -f firebase.json ]] || die "run this from the repo (branch claude/chat-live-01). Files are missing."
FB="${FIREBASE_CMD:-npx --yes firebase-tools@15.32.1}"
NPM="${NPM_CMD:-npm}"
fb() { $FB "$@" --project "$PROJECT"; }   # every call below carries --project

say "1/8 Firebase login check"
if ! $FB projects:list >/dev/null 2>&1; then
  echo "Not logged in. Follow the link it prints, sign in with the Google account that owns $PROJECT, then paste the code back HERE (the black terminal)."
  $FB login --no-localhost
fi
PROJECTS="$( $FB projects:list --json )" || die "could not list projects"
printf '%s' "$PROJECTS" | node -e 'const fs=require("fs"); const j=JSON.parse(fs.readFileSync(0,"utf8")); const a=Array.isArray(j.result)?j.result:j.result?.projects; if(!Array.isArray(a)||!a.some(x=>x.projectId===process.argv[1])) process.exit(1)' "$PROJECT" || die "this Google account cannot see project $PROJECT."

say "2/8 Firestore database exists?"
fb firestore:databases:list >/dev/null 2>&1 || echo "WARNING: could not list Firestore databases (checking is optional). Make sure Firestore was created in the Firebase console."

say "3/8 Web app config (public identifiers, not secrets)"
APPS="$(fb apps:list WEB --json)" || die "could not list web apps; no app was created"
APPID="$(printf '%s' "$APPS" | node -e 'const fs=require("fs");const j=JSON.parse(fs.readFileSync(0,"utf8"));const a=Array.isArray(j.result)?j.result:j.result?.apps;if(!Array.isArray(a)||!a.length||!a[0].appId)process.exit(1);process.stdout.write(a[0].appId)')" || die "an existing web app is required; no app was created"
TMPDIR_CHAT="$(mktemp -d)"; trap 'rm -rf "$TMPDIR_CHAT"' EXIT
fb apps:sdkconfig WEB "$APPID" >"$TMPDIR_CHAT/sdk.txt"
node tools/chat-live/make-config.js "$PROJECT" "$TMPDIR_CHAT/config.json" <"$TMPDIR_CHAT/sdk.txt" || die "could not read the web app config."

say "4/8 Build the test site (refuses anything that could reach production)"
node tools/build-chat-live.js --config "$TMPDIR_CHAT/config.json" --out build/chat-live || die "build refused — nothing was deployed."

say "5/8 Plan"
cat <<PLAN
Project : $PROJECT   (NOT production)
Deploys : Firestore rules + indexes   (runs npm ci in functions/ first)
          5 functions: receptionTurn, getPropertyDraft, updatePropertyDraft, createCaseFromConversation, claudeComplete
          test web page (build/chat-live) -> https://$PROJECT.web.app
Never   : other functions, Storage, Stripe, e-mail, LINE, production.
PLAN
ANS="${CHAT_LIVE_CONFIRM:-}"
if [[ -z "$ANS" ]]; then read -r -p "Type DEPLOY-TEST and press Enter to continue (anything else stops): " ANS; fi
[[ "$ANS" == "DEPLOY-TEST" ]] || die "not confirmed — nothing was deployed."

say "6/8 AI key for the TEST project (typed here, never in chat)"
SET="${CHAT_LIVE_SET_SECRET:-}"
if [[ -z "$SET" ]]; then read -r -p "Set (or replace) the TEST project's AI key now? Use a NEW key made only for this test. [y/N] " SET; fi
if [[ "$SET" == "y" || "$SET" == "Y" ]]; then fb functions:secrets:set ANTHROPIC_API_KEY; else echo "Skipped. The chat will not answer until ANTHROPIC_API_KEY exists in $PROJECT."; fi

say "7/8 Install the functions' libraries (the Firebase CLI needs them to read the function list), then deploy rules + indexes and the 5 functions"
( cd functions && $NPM ci --no-audit --no-fund ) || die "npm ci in functions/ failed — nothing was deployed."
fb deploy --only firestore:rules,firestore:indexes
fb deploy --only functions:receptionTurn,functions:getPropertyDraft,functions:updatePropertyDraft,functions:createCaseFromConversation,functions:claudeComplete

say "8/8 Deploy the test web page"
( cd build/chat-live && $FB deploy --only hosting --project "$PROJECT" )

cat <<DONE

DONE. Test page: https://$PROJECT.web.app
Next (Firebase console, project $PROJECT, Firestore): 1) open the page, copy the UID shown in the yellow bar; 2) add document chatTestAllow/<UID> with enabled = true (boolean); 3) add document chatTestConfig/limits with globalCap and perUidCap (whole numbers, e.g. 50 and 20).
DONE
