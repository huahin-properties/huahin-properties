#!/usr/bin/env bash
# BROWSER-LOCAL-01 — fetches the browser libraries the built TEST pages load from CDNs (pinned versions) into ./.browser-vendor (git-ignored),
# so the local browser test never needs the internet at run time. Firebase 10.12.2 = the version the pages pin in production.
set -euo pipefail
cd "$(dirname "$0")/../.."
V=".browser-vendor"; mkdir -p "$V/tmp" && cd "$V/tmp"
npm pack firebase@10.12.2 react@18.3.1 react-dom@18.3.1 @babel/standalone@7.29.0 --silent
for t in firebase-10.12.2 react-18.3.1 react-dom-18.3.1 babel-standalone-7.29.0; do mkdir -p "$t" && tar xzf "$t.tgz" -C "$t" --strip-components=1; done
cd ..; rm -rf firebase && mkdir firebase && cp tmp/firebase-10.12.2/firebase-*-compat.js firebase/
cp tmp/react-18.3.1/umd/react.production.min.js react.production.min.js
cp tmp/react-dom-18.3.1/umd/react-dom.production.min.js react-dom.production.min.js
cp tmp/babel-standalone-7.29.0/babel.min.js babel.min.js
echo "vendor ready: $(pwd)"; node -e "console.log('firebase', require('./tmp/firebase-10.12.2/package.json').version)"
