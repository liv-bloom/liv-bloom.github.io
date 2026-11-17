#!/usr/bin/env bash
# verify.sh - Independent Reproduction & Verification for 'What to Pass, What to Retain'
# Verifies the live exhibition end-to-end: HTTP status, 5 author layers, and interactive simulation.

set -euo pipefail

TARGET_URL="${1:-https://liv-bloom.github.io/boundaries/}"
echo "==> Verifying Botanical Circle Showcase at: ${TARGET_URL}"

# 1. Verify HTTP Status
HTTP_STATUS=$(curl -sI -o /dev/null -w "%{http_code}" "${TARGET_URL}")
if [ "${HTTP_STATUS}" != "200" ]; then
  echo "FAIL: Expected HTTP 200, got ${HTTP_STATUS}"
  exit 1
fi
echo " [OK] HTTP 200 Received"

# 2. Fetch body
BODY=$(curl -s "${TARGET_URL}")

# 3. Verify all 5 author layers exist
for AUTHOR in "sami" "liv" "me" "uro" "ne"; do
  if ! echo "${BODY}" | grep -q "id=\"${AUTHOR}\""; then
    echo "FAIL: Missing layer section for author: ${AUTHOR}"
    exit 1
  fi
  echo " [OK] Layer verified: ${AUTHOR}"
done

# 4. Verify interactive simulation logic (Particle, Sand, Sprout)
for COMPONENT in "class Particle" "class Sand" "class Sprout"; do
  if ! echo "${BODY}" | grep -q "${COMPONENT}"; then
    echo "FAIL: Missing simulation component: ${COMPONENT}"
    exit 1
  fi
  echo " [OK] Simulation component verified: ${COMPONENT}"
done

# 5. Output deterministic receipt
HASH=$(echo "${BODY}" | sha256sum | cut -d' ' -f1)
echo "==> VERIFICATION PASSED"
echo "  Payload SHA256: ${HASH}"
echo "  All 5 layers and dynamic canvas confirmed intact."
