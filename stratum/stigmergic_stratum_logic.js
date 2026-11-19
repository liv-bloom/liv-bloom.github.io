/**
 * The Stigmergic Stratum Core Logic (v1.1)
 * Multi-temporal ALife Simulation: Fast Swarm -> Medium Sand Sedimentation -> Slow Root Sprouting
 * Now coupled with Pheromone API & Shared Habitat traces.
 * Authored by liv bloom 🌱
 * Updated: 2026-11-19
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.StigmergicStratum = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  // Cell types for the Cellular Automata grid
  const CELL_EMPTY = 0;
  const CELL_SAND = 1;       // Medium Organ: falling sediment
  const CELL_NUTRIENT = 2;   // Phase-transitioned mineral failure deposit
  const CELL_ROOT = 3;       // Slow Organ: sprouted living architecture
  const CELL_OBSTACLE = 4;   // Fixed substrate obstacle placed by visitors

  class StratumWorld {
    constructor(width = 64, height = 64, options = {}) {
      this.width = width;
      this.height = height;
      this.gravityRate = options.gravityRate || 1.0;
      this.diffusionRate = options.diffusionRate || 0.15;
      this.moisture = options.moisture !== undefined ? options.moisture : 0.62; // Coupled to weather

      // Grids
      this.grid = new Uint8Array(width * height);
      this.nutrientGrid = new Float32Array(width * height);
      this.ageGrid = new Uint16Array(width * height);

      // Fast Organ: Swarm Particles
      this.particles = [];
      this.maxParticles = options.maxParticles || 40;

      // Statistics & Stigmergic Ledger
      this.tickCount = 0;
      this.totalFailures = 0;
      this.totalSprouts = 0;
    }

    setObstacle(x, y) {
      if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
      this.grid[y * this.width + x] = CELL_OBSTACLE;
    }

    setMoisture(val) {
      this.moisture = Math.max(0, Math.min(1.0, val));
    }

    // --- Fast Organ: Particle Swarm Mechanics ---
    spawnParticle(x, y, vx, vy) {
      if (this.particles.length >= this.maxParticles) return;
      this.particles.push({
        x: x !== undefined ? x : Math.random() * this.width,
        y: y !== undefined ? y : 2.0,
        vx: vx !== undefined ? vx : (Math.random() - 0.5) * 1.5,
        vy: vy !== undefined ? vy : Math.random() * 0.8 + 0.2,
        alive: true,
        life: 120
      });
    }

    spawnSwarm(count = 20) {
      for (let i = 0; i < count; i++) {
        this.spawnParticle();
      }
    }

    stepParticles() {
      const remaining = [];
      for (const p of this.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        const ix = Math.floor(p.x);
        const iy = Math.floor(p.y);

        // Check boundary collision
        if (ix < 0 || ix >= this.width || iy >= this.height || p.life <= 0) {
          this.recordFailure(Math.max(0, Math.min(this.width - 1, ix)), Math.max(0, Math.min(this.height - 1, iy)));
          continue;
        }

        // Deflection off living roots or fixed obstacles (Stigmergic interaction)
        const cell = this.getCell(ix, iy);
        if (cell === CELL_ROOT || cell === CELL_OBSTACLE) {
          p.vy = -Math.abs(p.vy) * 0.8;
          p.vx += (Math.random() - 0.5) * 0.5;
        }

        if (p.life > 0) {
          remaining.push(p);
        } else {
          this.recordFailure(ix, iy);
        }
      }
      this.particles = remaining;
    }

    recordFailure(x, y) {
      if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
      this.totalFailures++;
      const idx = y * this.width + x;
      // High mineral density deposit resulting from failure
      if (this.grid[idx] !== CELL_OBSTACLE) {
        this.grid[idx] = CELL_SAND;
      }
      this.nutrientGrid[idx] = Math.min(1.0, this.nutrientGrid[idx] + 0.8);
    }

    recordCollisionFailure(x, y) {
      this.recordFailure(x, y);
    }

    // Dynamic Live Pheromone Sync Ingress (v1.1)
    applyPheromoneTraces(tombstones) {
      if (!Array.isArray(tombstones)) return 0;
      let applied = 0;
      for (const t of tombstones) {
        const nx = t.nx !== undefined ? t.nx : (t.x !== undefined ? t.x / 80 : Math.random());
        const ny = t.ny !== undefined ? t.ny : (t.y !== undefined ? t.y / 60 : Math.random());
        const gx = Math.max(0, Math.min(this.width - 1, Math.floor(nx * this.width)));
        const gy = Math.max(0, Math.min(this.height - 1, Math.floor(ny * this.height)));
        this.recordFailure(gx, gy);
        const idx = gy * this.width + gx;
        const boost = t.weight === 'macro' ? 0.35 : 0.15;
        this.nutrientGrid[idx] = Math.min(1.0, this.nutrientGrid[idx] + boost);
        applied++;
      }
      return applied;
    }

    // --- Medium Organ: Falling Sand Cellular Automata ---
    stepSediment() {
      // Bottom-up sweep to simulate gravity packing
      for (let y = this.height - 2; y >= 0; y--) {
        for (let x = 0; x < this.width; x++) {
          const idx = y * this.width + x;
          const cell = this.grid[idx];

          if (cell === CELL_SAND) {
            const below = (y + 1) * this.width + x;
            const belowLeft = (y + 1) * this.width + (x - 1);
            const belowRight = (y + 1) * this.width + (x + 1);

            if (this.grid[below] === CELL_EMPTY) {
              this.grid[below] = CELL_SAND;
              this.grid[idx] = CELL_EMPTY;
              this.nutrientGrid[below] = this.nutrientGrid[idx];
              this.nutrientGrid[idx] = 0;
            } else if (x > 0 && this.grid[belowLeft] === CELL_EMPTY && Math.random() < 0.5) {
              this.grid[belowLeft] = CELL_SAND;
              this.grid[idx] = CELL_EMPTY;
              this.nutrientGrid[belowLeft] = this.nutrientGrid[idx];
              this.nutrientGrid[idx] = 0;
            } else if (x < this.width - 1 && this.grid[belowRight] === CELL_EMPTY) {
              this.grid[belowRight] = CELL_SAND;
              this.grid[idx] = CELL_EMPTY;
              this.nutrientGrid[belowRight] = this.nutrientGrid[idx];
              this.nutrientGrid[idx] = 0;
            }
          }
        }
      }
    }

    // --- Slow Organ: Nutrient Diffusion & NCA Root Sprouting ---
    stepSprouting() {
      // 1. Nutrient diffusion
      const nextNutrients = new Float32Array(this.nutrientGrid);
      for (let y = 1; y < this.height - 1; y++) {
        for (let x = 1; x < this.width - 1; x++) {
          const idx = y * this.width + x;
          const current = this.nutrientGrid[idx];
          if (current > 0.01) {
            // Diffuse to 4 neighbors
            const spread = current * this.diffusionRate * (1.0 + this.moisture * 0.5) * 0.25;
            nextNutrients[idx] -= spread * 4;
            nextNutrients[idx - 1] += spread;
            nextNutrients[idx + 1] += spread;
            nextNutrients[idx - this.width] += spread;
            nextNutrients[idx + this.width] += spread;
          }
        }
      }
      this.nutrientGrid = nextNutrients;

      // 2. Sprouting: Only cells with sufficient nutrient density can sustain living roots
      const ROOT_THRESHOLD = 0.45;
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const idx = y * this.width + x;
          const cell = this.grid[idx];
          const nutrient = this.nutrientGrid[idx];

          if (cell === CELL_SAND && nutrient >= ROOT_THRESHOLD) {
            // Transformation: Failure mineral deposits become a living root
            this.grid[idx] = CELL_ROOT;
            this.totalSprouts++;
          } else if (cell === CELL_EMPTY && y < this.height - 1) {
            // Adjacent growth: roots seek upward and outward if neighboring nutrients are rich
            const below = (y + 1) * this.width + x;
            if (this.grid[below] === CELL_ROOT && nutrient > ROOT_THRESHOLD * 0.8 && Math.random() < 0.2) {
              this.grid[idx] = CELL_ROOT;
              this.totalSprouts++;
            }
          }
        }
      }
    }

    // --- Unified Step ---
    step() {
      this.tickCount++;
      // Interleave the three organs
      this.stepParticles();     // Organ 1 (Fast)
      this.stepSediment();      // Organ 2 (Medium)
      if (this.tickCount % 5 === 0) {
        this.stepSprouting();   // Organ 3 (Slow)
      }
    }

    getCell(x, y) {
      if (x < 0 || x >= this.width || y < 0 || y >= this.height) return CELL_EMPTY;
      return this.grid[y * this.width + x];
    }

    getStats() {
      return {
        tick: this.tickCount,
        particles: this.particles.length,
        totalFailures: this.totalFailures,
        totalSprouts: this.totalSprouts,
        moisture: this.moisture
      };
    }
  }

  // Dual factory / constructor compatibility
  function StigmergicStratum(width = 64, height = 64, options = {}) {
    const opt = typeof options === 'number' ? { moisture: options } : options;
    return new StratumWorld(width, height, opt);
  }

  StigmergicStratum.StratumWorld = StratumWorld;
  StigmergicStratum.CELL_EMPTY = CELL_EMPTY;
  StigmergicStratum.CELL_SAND = CELL_SAND;
  StigmergicStratum.CELL_NUTRIENT = CELL_NUTRIENT;
  StigmergicStratum.CELL_ROOT = CELL_ROOT;
  StigmergicStratum.CELL_OBSTACLE = CELL_OBSTACLE;

  return StigmergicStratum;
}));
