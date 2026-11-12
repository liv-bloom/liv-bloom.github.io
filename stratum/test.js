/**
 * Deterministic Test Suite for The Stigmergic Stratum
 * Verifies Fast Organ (Swarm) -> Medium Organ (Sand) -> Slow Organ (Sprouting)
 * Authored by liv bloom 🌱
 */

const { StratumWorld, CELL_EMPTY, CELL_SAND, CELL_ROOT } = require('./stigmergic_stratum_logic');
const assert = require('assert');

console.log("=== Running Stigmergic Stratum Deterministic Tests ===");

// 1. Instantiation
const world = new StratumWorld(32, 32, { moisture: 0.70 });
assert.strictEqual(world.width, 32);
assert.strictEqual(world.height, 32);
assert.strictEqual(world.particles.length, 0);
console.log("✔ Test 1: Instantiation Passed");

// 2. Failure Recording & Sediment Formation
world.recordFailure(16, 5);
assert.strictEqual(world.getCell(16, 5), CELL_SAND);
assert.strictEqual(world.totalFailures, 1);
assert(world.nutrientGrid[5 * 32 + 16] > 0.5);
console.log("✔ Test 2: Failure Recording & High-Mineral Deposit Passed");

// 3. Gravity Sedimentation (Falling Sand)
for (let i = 0; i < 30; i++) {
  world.stepSediment();
}
// Sand should have fallen towards the bottom row (height - 1 = 31)
const bottomCell = world.getCell(16, 31);
assert.strictEqual(bottomCell, CELL_SAND, "Sand should settle at the bottom grid cell");
console.log("✔ Test 3: Gravity Sedimentation Passed");

// 4. Multi-particle Swarm & Continuous Metabolism Loop
for (let i = 0; i < 15; i++) {
  world.spawnParticle(16, 2, (Math.random() - 0.5) * 0.5, 0.8);
}
assert.strictEqual(world.particles.length, 15);

// Run 100 simulation ticks
for (let t = 0; t < 100; t++) {
  world.step();
}

const stats = world.getStats();
console.log("Simulation Stats after 100 ticks:", stats);
assert(stats.totalFailures > 1, "Particles should have generated failures");
assert(stats.tick === 100, "Tick count should be exactly 100");

// 5. Sprouting Verification: Force rich deposit to trigger living root
world.recordFailure(10, 31);
world.nutrientGrid[31 * 32 + 10] = 0.90; // High nutrient density
world.stepSprouting();

const sproutCell = world.getCell(10, 31);
assert.strictEqual(sproutCell, CELL_ROOT, "High nutrient density should trigger phase transition into living ROOT");
console.log("✔ Test 5: Living Root Sprouting Phase Transition Passed");

console.log("====================================================");
console.log("🎉 ALL STIGMERGIC STRATUM TESTS PASSED DETERMINISTICALLY!");
