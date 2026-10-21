#!/usr/bin/env bash
set -euo pipefail

# Basic smoke checks for this static website.
test -s index.html
test -s style.css
test -s script.js
grep -qi '<html' index.html
grep -qi 'id="contact-form"' index.html
grep -q 'style.css' index.html
grep -q 'script.js' index.html
node --check script.js
echo "Static website smoke checks passed."
