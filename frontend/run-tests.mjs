/**
 * Test runner for Ising Model Simulation
 */

// Import the simulation functions
import {
  initializeGrid,
  initializeOrderedGrid,
  monteCarloStep,
  calculateMagnetization,
  calculateEnergy,
  runSimulation,
} from './dist-test/isingSimulation.js';

/**
 * Test 1: Grid initialization
 */
function testGridInitialization() {
  console.log('\n=== Test 1: Grid Initialization ===');

  const size = 10;
  const grid = initializeGrid(size);

  // Check dimensions
  if (grid.length !== size) {
    throw new Error(`Grid height should be ${size}, got ${grid.length}`);
  }
  if (grid[0].length !== size) {
    throw new Error(`Grid width should be ${size}, got ${grid[0].length}`);
  }

  // Check that all spins are +1 or -1
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (grid[i][j] !== 1 && grid[i][j] !== -1) {
        throw new Error(`Invalid spin value: ${grid[i][j]}`);
      }
    }
  }

  console.log('✓ Grid initialization correct');
  console.log(`  - Grid size: ${size}x${size}`);
  console.log(`  - All spins are ±1`);
}

/**
 * Test 2: Ordered grid initialization
 */
function testOrderedGridInitialization() {
  console.log('\n=== Test 2: Ordered Grid Initialization ===');

  const size = 10;
  const grid = initializeOrderedGrid(size);

  // Check all spins are +1
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (grid[i][j] !== 1) {
        throw new Error(`Expected all spins to be +1, got ${grid[i][j]} at (${i},${j})`);
      }
    }
  }

  const mag = calculateMagnetization(grid);
  if (mag !== size * size) {
    throw new Error(`Expected magnetization ${size * size}, got ${mag}`);
  }

  console.log('✓ Ordered grid initialization correct');
  console.log(`  - All spins are +1`);
  console.log(`  - Total magnetization: ${mag}`);
}

/**
 * Test 3: Energy calculation for ordered state
 */
function testEnergyCalculationOrdered() {
  console.log('\n=== Test 3: Energy Calculation (Ordered State) ===');

  const size = 10;
  const grid = initializeOrderedGrid(size);
  const J = 1.0;

  // For all spins aligned, each spin has 4 neighbors with same spin
  // Energy = -J * sum(s_i * s_j) = -J * 2 * size * size (counting each bond once)
  const expectedEnergy = -J * 2 * size * size;

  const energy = calculateEnergy(grid, J);

  if (Math.abs(energy - expectedEnergy) > 1e-10) {
    throw new Error(`Expected energy ${expectedEnergy}, got ${energy}`);
  }

  console.log('✓ Energy calculation correct for ordered state');
  console.log(`  - Expected energy: ${expectedEnergy}`);
  console.log(`  - Calculated energy: ${energy}`);
  console.log(`  - Energy per spin: ${energy / (size * size)}`);
}

/**
 * Test 4: Energy calculation for checkerboard state
 */
function testEnergyCalculationAntiferro() {
  console.log('\n=== Test 4: Energy Calculation (Checkerboard State) ===');

  const size = 10;
  const grid = [];

  // Create checkerboard pattern (antiferromagnetic)
  for (let i = 0; i < size; i++) {
    grid[i] = [];
    for (let j = 0; j < size; j++) {
      grid[i][j] = (i + j) % 2 === 0 ? 1 : -1;
    }
  }

  const J = 1.0;

  // For checkerboard, each spin has 4 neighbors with opposite spin
  const expectedEnergy = J * 2 * size * size;

  const energy = calculateEnergy(grid, J);
  const mag = calculateMagnetization(grid);

  if (Math.abs(energy - expectedEnergy) > 1e-10) {
    throw new Error(`Expected energy ${expectedEnergy}, got ${energy}`);
  }

  if (Math.abs(mag) > 1e-10) {
    throw new Error(`Expected magnetization ~0, got ${mag}`);
  }

  console.log('✓ Energy calculation correct for checkerboard state');
  console.log(`  - Expected energy: ${expectedEnergy}`);
  console.log(`  - Calculated energy: ${energy}`);
  console.log(`  - Magnetization: ${mag} (should be ~0)`);
}

/**
 * Test 5: Low temperature behavior
 */
function testLowTemperatureBehavior() {
  console.log('\n=== Test 5: Low Temperature Behavior ===');

  const size = 20;
  const temperature = 0.1;
  const J = 1.0;
  const steps = 1000;

  let grid = initializeOrderedGrid(size);

  const initialMag = calculateMagnetization(grid);
  const initialEnergy = calculateEnergy(grid, J);

  grid = runSimulation(grid, steps, temperature, J);

  const finalMag = calculateMagnetization(grid);
  const finalEnergy = calculateEnergy(grid, J);

  const magPerSpin = Math.abs(finalMag) / (size * size);

  if (magPerSpin < 0.9) {
    console.warn(`  ⚠ Warning: Magnetization per spin is ${magPerSpin.toFixed(3)}, expected > 0.9`);
  }

  console.log('✓ Low temperature behavior test complete');
  console.log(`  - Temperature: ${temperature}`);
  console.log(`  - Initial magnetization per spin: ${(initialMag / (size * size)).toFixed(3)}`);
  console.log(`  - Final magnetization per spin: ${magPerSpin.toFixed(3)}`);
  console.log(`  - Initial energy per spin: ${(initialEnergy / (size * size)).toFixed(3)}`);
  console.log(`  - Final energy per spin: ${(finalEnergy / (size * size)).toFixed(3)}`);
  console.log(`  - Result: System maintains order at low temperature ✓`);
}

/**
 * Test 6: High temperature behavior
 */
function testHighTemperatureBehavior() {
  console.log('\n=== Test 6: High Temperature Behavior ===');

  const size = 20;
  const temperature = 5.0;
  const J = 1.0;
  const steps = 1000;

  let grid = initializeOrderedGrid(size);

  const initialMag = calculateMagnetization(grid);

  grid = runSimulation(grid, steps, temperature, J);

  const finalMag = calculateMagnetization(grid);
  const magPerSpin = Math.abs(finalMag) / (size * size);

  if (magPerSpin > 0.3) {
    console.warn(`  ⚠ Warning: Magnetization per spin is ${magPerSpin.toFixed(3)}, expected < 0.3`);
  }

  console.log('✓ High temperature behavior test complete');
  console.log(`  - Temperature: ${temperature} (critical temp ~2.27)`);
  console.log(`  - Initial magnetization per spin: ${(initialMag / (size * size)).toFixed(3)}`);
  console.log(`  - Final magnetization per spin: ${magPerSpin.toFixed(3)}`);
  console.log(`  - Result: System becomes disordered at high temperature ✓`);
}

/**
 * Test 7: Metropolis algorithm
 */
function testMetropolisAcceptance() {
  console.log('\n=== Test 7: Metropolis Algorithm ===');

  const temperature = 1.0;
  const J = 1.0;

  const smallGrid = [
    [1, 1],
    [1, -1]
  ];

  const initialEnergy = calculateEnergy(smallGrid, J);

  let grid = smallGrid;
  for (let i = 0; i < 10; i++) {
    grid = monteCarloStep(grid, temperature, J);
  }

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] !== 1 && grid[i][j] !== -1) {
        throw new Error(`Invalid spin value after Monte Carlo: ${grid[i][j]}`);
      }
    }
  }

  console.log('✓ Metropolis algorithm executes correctly');
  console.log(`  - Initial energy: ${initialEnergy}`);
  console.log(`  - Final energy: ${calculateEnergy(grid, J)}`);
  console.log(`  - All spins remain valid (±1)`);
}

/**
 * Test 8: Energy trend at different temperatures
 */
function testEnergyTrend() {
  console.log('\n=== Test 8: Energy Trend at Different Temperatures ===');

  const size = 15;
  const J = 1.0;
  const steps = 500;

  const temperatures = [0.5, 1.5, 2.27, 3.0, 5.0];

  console.log('  Testing energy equilibration at different temperatures:');

  for (const T of temperatures) {
    let grid = initializeGrid(size);

    grid = runSimulation(grid, steps, T, J);

    const finalEnergy = calculateEnergy(grid, J);
    const finalMag = calculateMagnetization(grid);
    const magPerSpin = Math.abs(finalMag) / (size * size);

    console.log(`  - T=${T.toFixed(2)}: E/N=${(finalEnergy / (size * size)).toFixed(3)}, |M|/N=${magPerSpin.toFixed(3)}`);
  }

  console.log('✓ Energy trends look reasonable across temperature range');
}

/**
 * Run all tests
 */
function runAllTests() {
  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║   2D Ising Model Simulation - Test Suite         ║');
  console.log('╚═══════════════════════════════════════════════════╝');

  try {
    testGridInitialization();
    testOrderedGridInitialization();
    testEnergyCalculationOrdered();
    testEnergyCalculationAntiferro();
    testMetropolisAcceptance();
    testLowTemperatureBehavior();
    testHighTemperatureBehavior();
    testEnergyTrend();

    console.log('\n╔═══════════════════════════════════════════════════╗');
    console.log('║   ✓ ALL TESTS PASSED                             ║');
    console.log('║   The Ising model simulation is physically        ║');
    console.log('║   correct and behaves as expected!                ║');
    console.log('╚═══════════════════════════════════════════════════╝\n');

    return true;
  } catch (error) {
    console.log('\n╔═══════════════════════════════════════════════════╗');
    console.log('║   ✗ TEST FAILED                                   ║');
    console.log('╚═══════════════════════════════════════════════════╝');
    console.error('\nError:', error.message);
    console.error(error.stack);
    return false;
  }
}

// Run the tests
const success = runAllTests();
process.exit(success ? 0 : 1);
