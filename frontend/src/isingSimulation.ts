/**
 * 2D Ising Model Simulation
 * Uses Metropolis algorithm for Monte Carlo simulation
 */

export type SpinGrid = number[][];

export interface SimulationParams {
  size: number;
  temperature: number;
  J: number; // coupling constant
}

/**
 * Initialize a random spin grid
 * Each spin is randomly +1 or -1
 */
export function initializeGrid(size: number): SpinGrid {
  const grid: SpinGrid = [];
  for (let i = 0; i < size; i++) {
    grid[i] = [];
    for (let j = 0; j < size; j++) {
      grid[i][j] = Math.random() < 0.5 ? 1 : -1;
    }
  }
  return grid;
}

/**
 * Initialize all spins to +1
 */
export function initializeOrderedGrid(size: number): SpinGrid {
  const grid: SpinGrid = [];
  for (let i = 0; i < size; i++) {
    grid[i] = [];
    for (let j = 0; j < size; j++) {
      grid[i][j] = 1;
    }
  }
  return grid;
}

/**
 * Calculate energy change if we flip spin at (i, j)
 * Using periodic boundary conditions
 */
function calculateEnergyChange(
  grid: SpinGrid,
  i: number,
  j: number,
  J: number
): number {
  const size = grid.length;
  const spin = grid[i][j];

  // Get neighbors with periodic boundary conditions
  const up = grid[(i - 1 + size) % size][j];
  const down = grid[(i + 1) % size][j];
  const left = grid[i][(j - 1 + size) % size];
  const right = grid[i][(j + 1) % size];

  const neighborSum = up + down + left + right;

  // Energy change = 2 * J * spin * sum of neighbors
  return 2 * J * spin * neighborSum;
}

/**
 * Perform one Monte Carlo step (one sweep through the lattice)
 * Returns the updated grid
 */
export function monteCarloStep(
  grid: SpinGrid,
  temperature: number,
  J: number = 1.0
): SpinGrid {
  const size = grid.length;
  const newGrid = grid.map(row => [...row]);

  // Sweep through entire lattice
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const deltaE = calculateEnergyChange(newGrid, i, j, J);

      // Metropolis criterion
      if (deltaE <= 0 || Math.random() < Math.exp(-deltaE / temperature)) {
        newGrid[i][j] *= -1; // Flip the spin
      }
    }
  }

  return newGrid;
}

/**
 * Calculate total magnetization (sum of all spins)
 */
export function calculateMagnetization(grid: SpinGrid): number {
  let sum = 0;
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      sum += grid[i][j];
    }
  }
  return sum;
}

/**
 * Calculate total energy of the system
 */
export function calculateEnergy(grid: SpinGrid, J: number = 1.0): number {
  const size = grid.length;
  let energy = 0;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const spin = grid[i][j];
      const right = grid[i][(j + 1) % size];
      const down = grid[(i + 1) % size][j];

      // Count each pair only once
      energy -= J * spin * right;
      energy -= J * spin * down;
    }
  }

  return energy;
}

/**
 * Run simulation for a number of steps
 */
export function runSimulation(
  initialGrid: SpinGrid,
  steps: number,
  temperature: number,
  J: number = 1.0
): SpinGrid {
  let grid = initialGrid;
  for (let step = 0; step < steps; step++) {
    grid = monteCarloStep(grid, temperature, J);
  }
  return grid;
}
