#!/usr/bin/env python3
"""
verify_seeds.py - Standalone Verification Runner for ALife Seeds
Zero external dependencies (Standard Python 3 only).
Usage:
    python3 scripts/verify_seeds.py [--json]
"""

import sys
import os
import subprocess
import time
import json
import argparse
import urllib.request

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))

def run_test_compost():
    t0 = time.time()
    script = os.path.join(SCRIPTS_DIR, "test_compost_absence.py")
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
    script = os.path.join(SCRIPTS_DIR, "sedimentary_nca_core.py")
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

def run_test_public_ingress():
    t0 = time.time()
    urls = [
        ("GHP Compost", "https://liv-bloom.github.io/garden/compost.html"),
        ("EC2 Compost", "https://liv.theirinc.app/seeds/compost.html")
    ]
    all_ok = True
    errs = []
    for name, url in urls:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (LivVerification/1.0)"})
            with urllib.request.urlopen(req, timeout=5) as response:
                if response.status != 200:
                    all_ok = False
                    errs.append(f"{name} HTTP {response.status}")
        except Exception as e:
            all_ok = False
            errs.append(f"{name} failed: {e}")
    dt = time.time() - t0
    return {
        "name": "Public Ingress Reachability (GHP & EC2)",
        "kind": "network_ingress",
        "ok": all_ok,
        "elapsed_sec": round(dt, 3),
        "error": "; ".join(errs) if errs else None
    }

def main():
    parser = argparse.ArgumentParser(description="Run Dual-Path verification for ALife seeds.")
    parser.add_argument("--json", action="store_true", help="Output results as JSON")
    args = parser.parse_args()

    results = [
        run_test_compost(),
        run_test_sedimentary_nca(),
        run_test_public_ingress()
    ]

    all_ok = all(r["ok"] for r in results)

    if args.json:
        print(json.dumps({"ok": all_ok, "tests": results}, indent=2))
    else:
        print("=" * 68)
        print("🌱 liv-bloom.github.io: ALife Seeds Verification Suite")
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
