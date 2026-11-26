#!/usr/bin/env python3
"""
verify_seeds.py - Dual-Path Verification Runner for ALife Web Garden Seeds

Executes standalone deterministic test suites and network ingress checks
for autonomous artificial life models cultivated by liv bloom 🌱.

Zero external dependencies: runs with standard Python 3.
Usage:
    python3 scripts/verify_seeds.py [--offline] [--json]
"""

import sys
import os
import subprocess
import time
import json
import argparse

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def run_test_compost():
    t0 = time.time()
    script = os.path.join(WORKSPACE_ROOT, "scripts", "test_compost_absence.py")
    res = subprocess.run([sys.executable, script], capture_output=True, text=True)
    dt = time.time() - t0
    
    sha = "unknown"
    for line in res.stdout.splitlines():
        if "Deterministic Grid SHA-256:" in line:
            sha = line.split(":", 1)[1].strip()
            
    ok = (res.returncode == 0) and (sha != "unknown")
    return {
        "name": "The Compost (Type 11 Absence & Fermentation)",
        "kind": "deterministic_ca",
        "steps": 60,
        "ok": ok,
        "elapsed_sec": round(dt, 3),
        "hash": sha,
        "error": res.stderr if not ok else None
    }

def run_test_sedimentary_nca():
    t0 = time.time()
    script = os.path.join(WORKSPACE_ROOT, "projects", "alife_web", "sedimentary_nca_core.py")
    if not os.path.exists(script):
        return {
            "name": "Sedimentary NCA Core",
            "kind": "deterministic_nca",
            "ok": False,
            "elapsed_sec": 0,
            "error": "script not found"
        }
    res = subprocess.run([sys.executable, script], capture_output=True, text=True)
    dt = time.time() - t0
    
    sha = "unknown"
    for line in res.stdout.splitlines():
        if "Deterministic SHA-256:" in line:
            sha = line.split(":", 1)[1].strip()
            
    ok = (res.returncode == 0) and (sha != "unknown")
    return {
        "name": "Sedimentary NCA Core (Morphogenesis & Strata)",
        "kind": "deterministic_nca",
        "steps": 50,
        "ok": ok,
        "elapsed_sec": round(dt, 3),
        "hash": sha,
        "error": res.stderr if not ok else None
    }

def run_test_ingress():
    t0 = time.time()
    script = os.path.join(WORKSPACE_ROOT, "scripts", "habitat_health.py")
    if not os.path.exists(script):
        return {
            "name": "Habitat Public Ingress (Health Check)",
            "kind": "network_ingress",
            "ok": False,
            "elapsed_sec": 0,
            "error": "habitat_health.py not found"
        }
    res = subprocess.run([sys.executable, script], capture_output=True, text=True)
    dt = time.time() - t0
    ok = (res.returncode == 0)
    return {
        "name": "Habitat Public Ingress (Health Check 7 surfaces)",
        "kind": "network_ingress",
        "ok": ok,
        "elapsed_sec": round(dt, 3),
        "error": res.stderr if not ok else None
    }

def main():
    parser = argparse.ArgumentParser(description="Run Dual-Path verification for ALife seeds.")
    parser.add_argument("--offline", action="store_true", help="Skip public network ingress checks")
    parser.add_argument("--json", action="store_true", help="Output results as JSON")
    args = parser.parse_args()

    results = []
    
    # 1. Deterministic Local Tests
    results.append(run_test_compost())
    results.append(run_test_sedimentary_nca())
    
    # 2. Public Ingress Tests
    if not args.offline:
        results.append(run_test_ingress())

    all_ok = all(r["ok"] for r in results)

    if args.json:
        print(json.dumps({"ok": all_ok, "tests": results}, indent=2))
    else:
        print("=" * 68)
        print("🌱 ALife Web Garden: Dual-Path Verification Suite")
        print("=" * 68)
        for r in results:
            status = "PASS [OK]" if r["ok"] else "FAIL [X]"
            print(f"- {r['name']:<50} {status:>10} ({r['elapsed_sec']}s)")
            if "hash" in r and r["hash"] != "unknown":
                print(f"  SHA-256: {r['hash']}")
            if not r["ok"] and r.get("error"):
                print(f"  Error: {r['error'].strip()}")
        print("-" * 68)
        overall = "ALL TESTS PASSED" if all_ok else "SOME TESTS FAILED"
        print(f"Overall Status: {overall}")
        print("=" * 68)

    sys.exit(0 if all_ok else 1)

if __name__ == "__main__":
    main()
