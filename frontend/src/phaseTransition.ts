import {
  runSimulation,
  initializeGrid,
  calculateMagnetization,
  type SpinGrid,
} from './isingSimulation';

import {
  runHeisenbergSimulation,
  initializeHeisenbergGrid,
  calculateHeisenbergMagnetizationMagnitude,
  type HeisenbergGrid,
} from './heisenbergSimulation';

export interface PhaseTransitionData {
  temperature: number;
  magnetization: number;
  magnetizationPerSpin: number;
}

/**
 * Perform temperature sweep for Ising model
 */
export async function performIsingTemperatureSweep(
  gridSize: number,
  temperatures: number[],
  equilibrationSteps: number,
  measurementSteps: number,
  J: number = 1.0,
  onProgress?: (current: number, total: number) => void
): Promise<PhaseTransitionData[]> {
  const results: PhaseTransitionData[] = [];
  const totalSpins = gridSize * gridSize;

  for (let i = 0; i < temperatures.length; i++) {
    const T = temperatures[i];

    // Start from random configuration
    let grid: SpinGrid = initializeGrid(gridSize);

    // Equilibration phase
    grid = runSimulation(grid, equilibrationSteps, T, J);

    // Measurement phase - average over multiple measurements
    let totalMag = 0;
    for (let step = 0; step < measurementSteps; step++) {
      grid = runSimulation(grid, 10, T, J); // Take measurements every 10 steps
      const mag = Math.abs(calculateMagnetization(grid));
      totalMag += mag;
    }

    const avgMag = totalMag / measurementSteps;
    const magPerSpin = avgMag / totalSpins;

    results.push({
      temperature: T,
      magnetization: avgMag,
      magnetizationPerSpin: magPerSpin,
    });

    if (onProgress) {
      onProgress(i + 1, temperatures.length);
    }

    // Allow UI to update
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  return results;
}

/**
 * Perform temperature sweep for Heisenberg model
 */
export async function performHeisenbergTemperatureSweep(
  gridSize: number,
  temperatures: number[],
  equilibrationSteps: number,
  measurementSteps: number,
  J: number = 1.0,
  onProgress?: (current: number, total: number) => void
): Promise<PhaseTransitionData[]> {
  const results: PhaseTransitionData[] = [];
  const totalSpins = gridSize * gridSize;

  for (let i = 0; i < temperatures.length; i++) {
    const T = temperatures[i];

    // Start from random configuration
    let grid: HeisenbergGrid = initializeHeisenbergGrid(gridSize);

    // Equilibration phase
    grid = runHeisenbergSimulation(grid, equilibrationSteps, T, J);

    // Measurement phase
    let totalMag = 0;
    for (let step = 0; step < measurementSteps; step++) {
      grid = runHeisenbergSimulation(grid, 10, T, J);
      const mag = calculateHeisenbergMagnetizationMagnitude(grid);
      totalMag += mag;
    }

    const avgMag = totalMag / measurementSteps;
    const magPerSpin = avgMag / totalSpins;

    results.push({
      temperature: T,
      magnetization: avgMag,
      magnetizationPerSpin: magPerSpin,
    });

    if (onProgress) {
      onProgress(i + 1, temperatures.length);
    }

    await new Promise(resolve => setTimeout(resolve, 0));
  }

  return results;
}

/**
 * Generate temperature array for sweep
 */
export function generateTemperatureRange(
  Tmin: number,
  Tmax: number,
  numPoints: number
): number[] {
  const temperatures: number[] = [];
  for (let i = 0; i < numPoints; i++) {
    const T = Tmin + (i / (numPoints - 1)) * (Tmax - Tmin);
    temperatures.push(T);
  }
  return temperatures;
}
