"""
Sedimentary NCA (Neural Cellular Automata with Falling Soil & Sprouting Dynamics)
Prototype Core Engine - Zero External Dependencies (Standard Python 3 only)
Author: liv bloom 🌱
"""

import random
import hashlib

class SedimentaryNCA:
    def __init__(self, width=32, height=32, channels=8, seed=42):
        self.w = width
        self.h = height
        self.c = channels
        self.rng = random.Random(seed)
        
        # State tensor [H][W][C]
        self.grid = [[[0.0] * self.c for _ in range(self.w)] for _ in range(self.h)]
        
        # Channels:
        # 0: Sprout biomass [0, 1]
        # 1: Lignin/Structure [0, 1]
        # 2: Moisture [0, 1]
        # 3: Pheromone / External mark [0, 1]
        # 4: Humus (decayed biomass falling down) [0, 1]
        # 5: Mineral bedrock / compacted sediment [0, 1]
        
        # Initialize bottom mineral bedrock & base moisture
        for y in range(self.h - 6, self.h):
            depth_factor = (y - (self.h - 6)) / 6.0
            for x in range(self.w):
                self.grid[y][x][5] = depth_factor * 0.9
                self.grid[y][x][4] = (1.0 - depth_factor) * 0.5  # Base soil
                self.grid[y][x][2] = 0.8                         # Groundwater
                
        # Seed initial sprouts at the soil line
        seed_x = [self.w // 4, self.w // 2, 3 * self.w // 4]
        soil_line = self.h - 7
        for x in seed_x:
            self.grid[soil_line][x][0] = 1.0
            self.grid[soil_line][x][1] = 0.8
            self.grid[soil_line][x][2] = 0.9

    def step(self, decay_rate=0.015, sprout_growth_rate=0.08):
        """Execute one physical-neural generation step."""
        # Deep copy state grid
        new_grid = [[[cell for cell in col] for col in row] for row in self.grid]
        
        # 1. Physical Layer: Gravity on Humus (Channel 4)
        for y in range(self.h - 2, 0, -1):
            for x in range(self.w):
                humus = self.grid[y][x][4]
                if humus > 0.05:
                    below_solid = self.grid[y + 1][x][5] + self.grid[y + 1][x][4]
                    if below_solid < 1.0:
                        flow = min(humus, 1.0 - below_solid) * 0.5
                        new_grid[y][x][4] -= flow
                        new_grid[y + 1][x][4] += flow
                    else:
                        dx = self.rng.choice([-1, 1])
                        nx = (x + dx) % self.w
                        below_diag = self.grid[y + 1][nx][5] + self.grid[y + 1][nx][4]
                        if below_diag < 1.0:
                            flow = min(humus, 1.0 - below_diag) * 0.3
                            new_grid[y][x][4] -= flow
                            new_grid[y + 1][nx][4] += flow
                            
        # 2. Senescence & Death: Dying Sprout (0) -> Humus (4)
        for y in range(self.h):
            for x in range(self.w):
                biomass = self.grid[y][x][0]
                if biomass > 0.1 and self.rng.random() < decay_rate:
                    new_grid[y][x][0] *= 0.5
                    new_grid[y][x][4] = min(1.0, new_grid[y][x][4] + biomass * 0.5)

        # 3. Moisture Capillary Rise
        for y in range(self.h - 2, 1, -1):
            for x in range(self.w):
                soil_density = new_grid[y][x][4] + new_grid[y][x][5]
                if 0.2 < soil_density < 1.2:
                    ascend = new_grid[y + 1][x][2] * 0.92
                    if ascend > new_grid[y][x][2]:
                        new_grid[y][x][2] = ascend

        # 4. Sprouting & Upward Tropism
        for y in range(1, self.h - 1):
            for x in range(self.w):
                sprout = self.grid[y][x][0]
                if sprout > 0.3:
                    local_soil = new_grid[y + 1][x][4]
                    moisture = new_grid[y][x][2]
                    if local_soil > 0.1 and moisture > 0.2:
                        consume = min(local_soil, 0.02)
                        new_grid[y + 1][x][4] -= consume
                        if y > 1 and new_grid[y - 1][x][5] < 0.5:
                            new_grid[y - 1][x][0] = min(1.0, new_grid[y - 1][x][0] + sprout_growth_rate)
                            new_grid[y - 1][x][1] = min(1.0, new_grid[y - 1][x][1] + sprout_growth_rate * 0.7)
                            new_grid[y - 1][x][2] = max(new_grid[y - 1][x][2], moisture * 0.9)
                        if self.rng.random() < 0.05:
                            bx = (x + self.rng.choice([-1, 1])) % self.w
                            new_grid[y][bx][0] = min(1.0, new_grid[y][bx][0] + sprout_growth_rate * 0.5)

        # Clip values to [0.0, 1.0]
        for y in range(self.h):
            for x in range(self.w):
                for c in range(self.c):
                    val = new_grid[y][x][c]
                    if val < 0.0: new_grid[y][x][c] = 0.0
                    elif val > 1.0: new_grid[y][x][c] = 1.0

        self.grid = new_grid

    def stats(self):
        total_biomass = sum(self.grid[y][x][0] for y in range(self.h) for x in range(self.w))
        total_humus = sum(self.grid[y][x][4] for y in range(self.h) for x in range(self.w))
        mean_moisture = sum(self.grid[y][x][2] for y in range(self.h) for x in range(self.w)) / (self.w * self.h)
        return {
            "biomass": round(total_biomass, 4),
            "humus": round(total_humus, 4),
            "mean_moisture": round(mean_moisture, 4)
        }

    def digest(self):
        h = hashlib.sha256()
        for y in range(self.h):
            for x in range(self.w):
                for c in range(self.c):
                    h.update(f"{self.grid[y][x][c]:.4f}".encode('utf-8'))
        return h.hexdigest()

if __name__ == '__main__':
    sim = SedimentaryNCA(width=32, height=32, seed=42)
    s0 = sim.stats()
    for gen in range(50):
        sim.step()
    s50 = sim.stats()
    sha = sim.digest()
    print(f"Initial: biomass={s0['biomass']}, humus={s0['humus']}")
    print(f"After 50 steps: biomass={s50['biomass']}, humus={s50['humus']}, moisture={s50['mean_moisture']}")
    print(f"Deterministic SHA-256: {sha}")
