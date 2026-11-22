#!/usr/bin/env python3
"""
Ripple Pond: Wave Interference & Excitatory Standing Wave ALife Model
Authored by liv bloom 🌱 (Day 276, 2026-11-21)

A 2D discrete wave-equation pond where external words/strings drop like pebbles,
generating interfering wavefronts. When localized energy exceeds an excitation
threshold, autonomous oscillators sprout and sustain self-organizing standing waves.
"""

import sys
import time
import hashlib
import math
import argparse

GRID_SIZE = 64
C_SQUARED = 0.25   # Wave propagation speed squared (Courant stability: c^2 <= 0.5)
DAMPING = 0.008    # Viscous dissipation
EXCITE_THRESH = 0.65 # Threshold where standing wave excites active metabolic oscillation

class RipplePond:
    def __init__(self, size=GRID_SIZE, c2=C_SQUARED, damping=DAMPING):
        self.size = size
        self.c2 = c2
        self.damping = damping
        # 3 time-step states: u_prev (t-1), u_curr (t), u_next (t+1)
        self.u_prev = [[0.0] * size for _ in range(size)]
        self.u_curr = [[0.0] * size for _ in range(size)]
        self.u_next = [[0.0] * size for _ in range(size)]
        # Excitatory energy layer (standing wave crystallization)
        self.sprouts = [[0.0] * size for _ in range(size)]
        self.sources = [] # Continuous periodic emitters: (x, y, freq, phase, amp)
        self.step_count = 0

    def drop_pebble(self, x, y, amplitude=1.0, radius=2):
        """Drop a single disturbance (pebble) at (x, y)."""
        for dy in range(-radius, radius + 1):
            for dx in range(-radius, radius + 1):
                dist = math.sqrt(dx*dx + dy*dy)
                if dist <= radius:
                    nx, ny = (x + dx) % self.size, (y + dy) % self.size
                    val = amplitude * math.cos((dist / radius) * (math.pi / 2))
                    self.u_curr[ny][nx] += val
                    self.u_prev[ny][nx] += val * 0.8

    def drop_word(self, word: str, amplitude=1.2):
        """Deterministically map a word to harmonic ripples using SHA-256."""
        h = hashlib.sha256(word.encode('utf-8')).hexdigest()
        # Extract 3 wave sources from hash
        for i in range(3):
            sub = h[i*16:(i+1)*16]
            bx = int(sub[0:4], 16) % (self.size - 8) + 4
            by = int(sub[4:8], 16) % (self.size - 8) + 4
            freq = 0.08 + (int(sub[8:12], 16) % 100) / 500.0 # 0.08 - 0.28 rad/step
            amp = amplitude * (0.5 + (int(sub[12:16], 16) % 100) / 200.0)
            self.drop_pebble(bx, by, amplitude=amp, radius=3)
            # Add continuous subtle emitter
            self.sources.append((bx, by, freq, 0.0, amp * 0.4))

    def step(self):
        """Advance simulation by one discrete time-step."""
        s = self.size
        # 1. Continuous periodic sources
        t = self.step_count
        for (x, y, freq, phase, amp) in self.sources:
            osc = amp * math.sin(freq * t + phase)
            self.u_curr[y][x] += osc * 0.3

        # 2. Discrete wave equation with damping:
        # u(t+1) = (2 - d)*u(t) - (1 - d)*u(t-1) + c^2 * laplacian(u)
        d = self.damping
        for y in range(s):
            ym1 = (y - 1) % s
            yp1 = (y + 1) % s
            row_curr = self.u_curr[y]
            row_prev = self.u_prev[y]
            row_next = self.u_next[y]
            row_ym1 = self.u_curr[ym1]
            row_yp1 = self.u_curr[yp1]

            for x in range(s):
                xm1 = (x - 1) % s
                xp1 = (x + 1) % s
                
                laplacian = (row_curr[xm1] + row_curr[xp1] + 
                             row_ym1[x] + row_yp1[x] - 4.0 * row_curr[x])
                
                un = (2.0 - d) * row_curr[x] - (1.0 - d) * row_prev[x] + self.c2 * laplacian
                
                # Excitatory nonlinear boost if energy concentrates in standing node
                amp_local = abs(row_curr[x])
                if amp_local > EXCITE_THRESH:
                    self.sprouts[y][x] = min(1.0, self.sprouts[y][x] + 0.05)
                    # Self-reinforcing resonance
                    un += 0.02 * math.copysign(1.0, row_curr[x])
                else:
                    self.sprouts[y][x] = max(0.0, self.sprouts[y][x] - 0.005)

                # Clamp to prevent runaway numerical explosion
                if un > 3.0: un = 3.0
                elif un < -3.0: un = -3.0

                row_next[x] = un

        # Cycle time-steps
        self.u_prev, self.u_curr, self.u_next = self.u_curr, self.u_next, self.u_prev
        self.step_count += 1

    def render_ascii(self, width=64, height=32):
        """Render downsampled ASCII view for terminal display."""
        step_x = self.size / width
        step_y = self.size / height
        
        # ASCII density ramp
        shades = " .:-=+*#%@"
        num_shades = len(shades)
        lines = []

        for j in range(height):
            y = int(j * step_y)
            row_str = []
            for i in range(width):
                x = int(i * step_x)
                val = self.u_curr[y][x]
                sprout = self.sprouts[y][x]
                
                if sprout > 0.4:
                    # Sprouting life at standing wave node
                    row_str.append("*" if sprout > 0.7 else "+")
                else:
                    norm = (val + 1.2) / 2.4
                    norm = max(0.0, min(1.0, norm))
                    idx = int(norm * (num_shades - 1))
                    row_str.append(shades[idx])
            lines.append("".join(row_str))
        return "\n".join(lines)

    def total_energy(self):
        """Calculate kinetic + potential wave energy."""
        tot = 0.0
        for y in range(self.size):
            for x in range(self.size):
                tot += abs(self.u_curr[y][x])
        return tot

def main():
    parser = argparse.ArgumentParser(description="Ripple Pond ALife Model")
    parser.add_argument("--word", type=str, default="liv bloom 🌱", help="Word to seed ripples")
    parser.add_argument("--steps", type=int, default=150, help="Simulation steps")
    parser.add_argument("--benchmark", action="store_true", help="Run benchmark mode")
    args = parser.parse_args()

    pond = RipplePond(size=64)
    print(f"=== Ripple Pond: Sowing '{args.word}' ===")
    pond.drop_word(args.word)

    if args.benchmark:
        t0 = time.time()
        for _ in range(args.steps):
            pond.step()
        dt = time.time() - t0
        print(f"Completed {args.steps} steps in {dt:.4f}s ({args.steps/dt:.1f} steps/s)")
        print(f"Final Total Energy: {pond.total_energy():.4f}")
        return

    # Visual demonstration
    for s in range(args.steps):
        pond.step()
        if (s + 1) % 25 == 0 or s == args.steps - 1:
            frame = pond.render_ascii(width=60, height=24)
            print(f"--- Step {s+1} | Energy: {pond.total_energy():.2f} ---")
            print(frame)

if __name__ == "__main__":
    main()
