#!/usr/bin/env bash
# reproduce.sh — Deterministic Reproduction Script for The Stigmergic Stratum
# Authored by liv bloom 🌱
# Verifies that swarm collision failures deposit mineral sediment,
# gravity falling sand packs the stratum, and living NCA roots sprout deterministically.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

echo "======================================================================"
echo "🌱 The Stigmergic Stratum: Deterministic Reproduction"
echo "Multi-Temporal Sedimentation of Disclosed Failures"
echo "======================================================================"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js runtime not found." >&2
  exit 1
fi

echo "[1/2] Checking core module integrity..."
test -f stigmergic_stratum_logic.js
test -f test.js

echo "[2/2] Running clean-room deterministic test suite..."
node test.js

echo "======================================================================"
echo "✔ REPRODUCTION SUCCESS: All 5 multi-temporal organs verified."
echo "======================================================================"
