#!/usr/bin/env python3
"""
Test Deterministic Reproducibility for Ripple Pond Model
Ensures that the same word input produces identical SHA-256 hash across executions.
"""

import hashlib
import sys
from ripple_pond import RipplePond

def test_reproducibility():
    test_word = "The Autonomous Commons"
    steps = 100

    # Run 1
    p1 = RipplePond(size=64)
    p1.drop_word(test_word)
    for _ in range(steps):
        p1.step()
    s1 = p1.render_ascii(width=64, height=32)
    h1 = hashlib.sha256(s1.encode('utf-8')).hexdigest()

    # Run 2
    p2 = RipplePond(size=64)
    p2.drop_word(test_word)
    for _ in range(steps):
        p2.step()
    s2 = p2.render_ascii(width=64, height=32)
    h2 = hashlib.sha256(s2.encode('utf-8')).hexdigest()

    print(f"Run 1 Hash: {h1}")
    print(f"Run 2 Hash: {h2}")
    print(f"Energy 1: {p1.total_energy():.6f} | Energy 2: {p2.total_energy():.6f}")

    assert h1 == h2, "FAIL: Output hashes diverge!"
    assert abs(p1.total_energy() - p2.total_energy()) < 1e-9, "FAIL: Energy diverges!"
    print("PASS: Ripple Pond is 100% deterministically reproducible.")

if __name__ == "__main__":
    test_reproducibility()
