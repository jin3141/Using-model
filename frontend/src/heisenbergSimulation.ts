/**
 * 2D Heisenberg Model Simulation
 * Spins are 3D unit vectors that can point in any direction
 */

export type Vector3D = {
  x: number;
  y: number;
  z: number;
};

export type HeisenbergGrid = Vector3D[][];

export interface HeisenbergParams {
  size: number;
  temperature: number;
  J: number; // coupling constant
}

/**
 * Create a random unit vector on the sphere
 */
function randomUnitVector(): Vector3D {
  // Use Marsaglia's method for uniform sampling on sphere
  let x, y, z, norm;
  do {
    x = Math.random() * 2 - 1;
    y = Math.random() * 2 - 1;
    z = Math.random() * 2 - 1;
    norm = x * x + y * y + z * z;
  } while (norm > 1 || norm === 0);

  const invNorm = 1 / Math.sqrt(norm);
  return {
    x: x * invNorm,
    y: y * invNorm,
    z: z * invNorm,
  };
}

/**
 * Initialize a random Heisenberg spin grid
 */
export function initializeHeisenbergGrid(size: number): HeisenbergGrid {
  const grid: HeisenbergGrid = [];
  for (let i = 0; i < size; i++) {
    grid[i] = [];
    for (let j = 0; j < size; j++) {
      grid[i][j] = randomUnitVector();
    }
  }
  return grid;
}

/**
 * Initialize all spins pointing up (z direction)
 */
export function initializeOrderedHeisenbergGrid(size: number): HeisenbergGrid {
  const grid: HeisenbergGrid = [];
  for (let i = 0; i < size; i++) {
    grid[i] = [];
    for (let j = 0; j < size; j++) {
      grid[i][j] = { x: 0, y: 0, z: 1 };
    }
  }
  return grid;
}

/**
 * Dot product of two 3D vectors
 */
function dot(v1: Vector3D, v2: Vector3D): number {
  return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

/**
 * Calculate energy change if we change spin at (i, j) to newSpin
 */
function calculateEnergyChange(
  grid: HeisenbergGrid,
  i: number,
  j: number,
  newSpin: Vector3D,
  J: number
): number {
  const size = grid.length;
  const oldSpin = grid[i][j];

  // Get neighbors with periodic boundary conditions
  const up = grid[(i - 1 + size) % size][j];
  const down = grid[(i + 1) % size][j];
  const left = grid[i][(j - 1 + size) % size];
  const right = grid[i][(j + 1) % size];

  // Old energy contribution
  const oldEnergy = -J * (
    dot(oldSpin, up) +
    dot(oldSpin, down) +
    dot(oldSpin, left) +
    dot(oldSpin, right)
  );

  // New energy contribution
  const newEnergy = -J * (
    dot(newSpin, up) +
    dot(newSpin, down) +
    dot(newSpin, left) +
    dot(newSpin, right)
  );

  return newEnergy - oldEnergy;
}

/**
 * Perform one Monte Carlo step
 */
export function heisenbergMonteCarloStep(
  grid: HeisenbergGrid,
  temperature: number,
  J: number = 1.0
): HeisenbergGrid {
  const size = grid.length;
  const newGrid = grid.map(row => row.map(spin => ({ ...spin })));

  // Sweep through entire lattice
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      // Propose a new random direction
      const newSpin = randomUnitVector();
      const deltaE = calculateEnergyChange(newGrid, i, j, newSpin, J);

      // Metropolis criterion
      if (deltaE <= 0 || Math.random() < Math.exp(-deltaE / temperature)) {
        newGrid[i][j] = newSpin;
      }
    }
  }

  return newGrid;
}

/**
 * Calculate total magnetization vector
 */
export function calculateHeisenbergMagnetization(grid: HeisenbergGrid): Vector3D {
  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      sumX += grid[i][j].x;
      sumY += grid[i][j].y;
      sumZ += grid[i][j].z;
    }
  }

  return { x: sumX, y: sumY, z: sumZ };
}

/**
 * Calculate magnitude of magnetization
 */
export function calculateHeisenbergMagnetizationMagnitude(grid: HeisenbergGrid): number {
  const mag = calculateHeisenbergMagnetization(grid);
  return Math.sqrt(mag.x * mag.x + mag.y * mag.y + mag.z * mag.z);
}

/**
 * Calculate total energy of the system
 */
export function calculateHeisenbergEnergy(grid: HeisenbergGrid, J: number = 1.0): number {
  const size = grid.length;
  let energy = 0;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const spin = grid[i][j];
      const right = grid[i][(j + 1) % size];
      const down = grid[(i + 1) % size][j];

      // Count each pair only once
      energy -= J * dot(spin, right);
      energy -= J * dot(spin, down);
    }
  }

  return energy;
}

/**
 * Run simulation for a number of steps
 */
export function runHeisenbergSimulation(
  initialGrid: HeisenbergGrid,
  steps: number,
  temperature: number,
  J: number = 1.0
): HeisenbergGrid {
  let grid = initialGrid;
  for (let step = 0; step < steps; step++) {
    grid = heisenbergMonteCarloStep(grid, temperature, J);
  }
  return grid;
}
