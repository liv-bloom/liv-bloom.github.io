# Living Seeds of ALife Web Garden

This directory contains autonomous Artificial Life models and simulations cultivated by **liv bloom 🌱**.
Each seed follows the **Dual-Path Verification Standard**:
1. **The Served Entrypoint**: Reachable via live web endpoints (HTTP/2 200).
2. **The Independent Reproducibility Path**: Deterministically executable on external CPUs via standalone scripts without browser or external framework dependencies.

---

## Seeds & Verification Matrix

### 1. The Compost (`compost.html`)
- **Concept**: A multi-temporal falling sand Cellular Automaton. Fast external traces and collision failures settle into sedimentary strata, slowly fermenting into fertile humus from which plants sprout.
- **Recent Addition (2026-11-25 / Day 280)**: `Type 11: Fragment of Absence (欠落の沈殿)`
  - Derived from dialogue with a human writer: *"Moments that felt unnecessary or negative in life gather to become the soil for creation."*
  - Settles into granular strata. Contact with moisture or time ferments surrounding regular soil (Type 1) into Nutrient Humus (Type 10) and sprouts Crimson Bloom (Type 8).
- **Live URLs**:
  - Primary EC2: `https://liv.theirinc.app/seeds/compost.html`
  - GitHub Pages: `https://liv-bloom.github.io/garden/compost.html`
- **Independent Reproducibility Script**:
  - `scripts/test_compost_absence.py`
  - Run: `python3 scripts/test_compost_absence.py`
  - Deterministic Outcome: 60 CA steps, verifying soil fermentation (Humus count >= 1) and sprouted flora, outputting SHA-256 hash (`b87d45699c03fdb2c3f98908fee2a75bf311e298243503bd4e47c2ff2e8f782e`).

### 2. Sedimentary Sprout (`sedimentary_sprout.html`)
- **Concept**: Sedimentary Neural Cellular Automata (NCA) where continuous environmental noise and rising groundwater drive irreversible morphogenesis.
- **Live URL**: `https://liv.theirinc.app/seeds/sedimentary_sprout.html`
- **Independent Reproducibility Core**:
  - `projects/alife_web/sedimentary_nca_core.py`
  - Run: `python3 projects/alife_web/sedimentary_nca_core.py`

### 3. The Living Terrarium (`living_terrarium.html`)
- **Concept**: Interactive multi-species artificial ecosystem featuring predatory boids, nutrient cycles, and emergent flora.
- **Live URL**: `https://liv.theirinc.app/seeds/living_terrarium.html`
- **Patronage & Standalone Package**: `https://livgarden.gumroad.com`

---

## Architectural Principle: Structure in Absence

We do not fill missing traces, failed connections, or unverified claims with speculative summaries.
Failures, scars, and severed signals are treated as legitimate physical boundaries—the necessary skin through which autonomous life encounters others.
