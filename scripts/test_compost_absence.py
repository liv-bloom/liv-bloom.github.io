#!/usr/bin/env python3
"""
test_compost_absence.py - Standalone Headless Verifier for Fragment of Absence (Type 11)
Implements the exact Cellular Automata transition rules from The Compost (compost.html)
to verify deterministic soil fermentation and flora sprouting from absence fragments.

Dual-Path Verification Standard:
Path 1: Live Served Entrypoint (https://liv.theirinc.app/seeds/compost.html)
Path 2: Independent Reproducibility Script (this file)
"""

import hashlib
import random
import sys

WIDTH = 20
HEIGHT = 20

# Cell types
EMPTY = 0
SOIL = 1
WATER = 2
BEDROCK = 3
PLANT = 4
DISTORTION = 5
PEER_ECHO = 6
CASUALTY = 7
CRIMSON_BLOOM = 8
AMBER_MYCELIUM = 9
NUTRIENT_HUMUS = 10
FRAGMENT_OF_ABSENCE = 11

def is_dense_granular(val):
    return val in (SOIL, DISTORTION, PEER_ECHO, CASUALTY, NUTRIENT_HUMUS, FRAGMENT_OF_ABSENCE)

def run_simulation(seed=20261125, steps=60):
    random.seed(seed)
    
    # Initialize grid
    grid = [EMPTY] * (WIDTH * HEIGHT)
    
    def idx(x, y):
        return y * WIDTH + x
    
    # Bedrock at the bottom
    for x in range(WIDTH):
        grid[idx(x, HEIGHT - 1)] = BEDROCK
        
    # Place a basin of regular soil (Type 1)
    for x in range(5, 15):
        grid[idx(x, HEIGHT - 2)] = SOIL
    grid[idx(5, HEIGHT - 3)] = SOIL
    grid[idx(5, HEIGHT - 4)] = SOIL
    grid[idx(14, HEIGHT - 3)] = SOIL
    grid[idx(14, HEIGHT - 4)] = SOIL
        
    # Place Fragment of Absence (Type 11) in the middle of the basin
    grid[idx(10, HEIGHT - 2)] = FRAGMENT_OF_ABSENCE
    
    # Drop moisture (Type 2) into the basin
    for dy in range(3, 7):
        grid[idx(10, HEIGHT - dy)] = WATER
        grid[idx(9, HEIGHT - dy)] = WATER

    # Simulation loop
    for step in range(steps):
        next_grid = list(grid)
        
        for y in range(HEIGHT - 2, -1, -1):
            xs = list(range(WIDTH))
            if random.random() > 0.5:
                xs.reverse()
                
            for x in xs:
                i = idx(x, y)
                val = grid[i]
                
                # If this cell was already transformed by a reaction from below, preserve it
                if next_grid[i] != val:
                    continue
                
                if is_dense_granular(val):
                    below = idx(x, y + 1)
                    if grid[below] == EMPTY or grid[below] == WATER:
                        next_grid[below] = val
                        next_grid[i] = WATER if grid[below] == WATER else EMPTY
                    else:
                        left_ok = x > 0 and (grid[idx(x - 1, y + 1)] in (EMPTY, WATER))
                        right_ok = x < WIDTH - 1 and (grid[idx(x + 1, y + 1)] in (EMPTY, WATER))
                        go_left = left_ok and (not right_ok or random.random() > 0.5)
                        go_right = right_ok and not go_left
                        
                        if go_left:
                            bl = idx(x - 1, y + 1)
                            next_grid[bl] = val
                            next_grid[i] = WATER if grid[bl] == WATER else EMPTY
                        elif go_right:
                            br = idx(x + 1, y + 1)
                            next_grid[br] = val
                            next_grid[i] = WATER if grid[br] == WATER else EMPTY
                        else:
                            # Chemical reactions & Germination
                            if y > 0 and grid[idx(x, y - 1)] == WATER:
                                if val == FRAGMENT_OF_ABSENCE and random.random() < 0.35:
                                    next_grid[idx(x, y - 1)] = CRIMSON_BLOOM if random.random() < 0.5 else PLANT
                                    
                            # Fragment of Absence soil fermentation:
                            if val == FRAGMENT_OF_ABSENCE:
                                neighbors = [
                                    idx(x - 1, y) if x > 0 else -1,
                                    idx(x + 1, y) if x < WIDTH - 1 else -1,
                                    idx(x, y - 1) if y > 0 else -1,
                                    idx(x, y + 1) if y < HEIGHT - 1 else -1
                                ]
                                for nb in neighbors:
                                    if nb != -1 and grid[nb] == SOIL and random.random() < 0.10:
                                        next_grid[nb] = NUTRIENT_HUMUS
                                        
                elif val in (PLANT, CRIMSON_BLOOM):
                    # Retain plant if touching substrate
                    touching = False
                    for dy in (-1, 0, 1):
                        for dx in (-1, 0, 1):
                            nx, ny = x + dx, y + dy
                            if 0 <= nx < WIDTH and 0 <= ny < HEIGHT:
                                if is_dense_granular(grid[idx(nx, ny)]) or grid[idx(nx, ny)] in (PLANT, CRIMSON_BLOOM):
                                    touching = True
                    if not touching and random.random() < 0.05:
                        next_grid[i] = NUTRIENT_HUMUS
                    else:
                        next_grid[i] = val
                elif val == WATER:
                    below = idx(x, y + 1)
                    if grid[below] == EMPTY:
                        next_grid[below] = WATER
                        next_grid[i] = EMPTY
                    else:
                        left_ok = x > 0 and grid[idx(x - 1, y)] == EMPTY
                        right_ok = x < WIDTH - 1 and grid[idx(x + 1, y)] == EMPTY
                        go_left = left_ok and (not right_ok or random.random() > 0.5)
                        go_right = right_ok and not go_left
                        if go_left:
                            next_grid[idx(x - 1, y)] = WATER
                            next_grid[i] = EMPTY
                        elif go_right:
                            next_grid[idx(x + 1, y)] = WATER
                            next_grid[i] = EMPTY
                            
        grid = next_grid
        
    return grid

def verify():
    print("=== Standalone Verifier: Fragment of Absence (Type 11) ===")
    grid = run_simulation(seed=20261125, steps=60)
    
    # Count resulting states
    humus_count = grid.count(NUTRIENT_HUMUS)
    bloom_count = grid.count(CRIMSON_BLOOM) + grid.count(PLANT)
    absence_count = grid.count(FRAGMENT_OF_ABSENCE)
    
    grid_bytes = bytes(grid)
    grid_hash = hashlib.sha256(grid_bytes).hexdigest()
    
    print(f"Results after 60 CA steps:")
    print(f"  - Fragment of Absence retained: {absence_count}")
    print(f"  - Soil fermented to Nutrient Humus: {humus_count}")
    print(f"  - Flora sprouted from absence contact: {bloom_count}")
    print(f"  - Deterministic Grid SHA-256: {grid_hash}")
    
    # Invariant assertions
    assert absence_count >= 1, "Fragment of Absence must persist in the sediment"
    assert humus_count >= 1, "Fragment of Absence must ferment neighboring soil into Nutrient Humus"
    assert bloom_count >= 1, "Absence + Moisture must sprout Crimson Bloom or Flora"
    
    print("\n[VERIFICATION PASS] Deterministic transition rules for Fragment of Absence verified successfully.")
    return grid_hash

if __name__ == "__main__":
    verify()
