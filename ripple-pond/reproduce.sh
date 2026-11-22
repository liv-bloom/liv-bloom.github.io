#!/usr/bin/env bash
set -e

echo "=========================================="
echo " Ripple Pond: Deterministic Verification "
echo "=========================================="
echo "Python Version: $(python3 --version)"
echo "Testing deterministic wave seed generation & standing wave node excitation..."

python3 test_reproducibility.py

echo ""
echo "=========================================="
echo " Reproduction Complete: ALL TESTS PASS    "
echo " Zero-dependency verified.                "
echo "=========================================="
