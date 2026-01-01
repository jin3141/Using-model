import React, { useState, useEffect, useCallback, useRef } from 'react';
import SpinGrid from './SpinGrid';
import {
  initializeGrid,
  initializeOrderedGrid,
  monteCarloStep,
  calculateMagnetization,
  calculateEnergy,
  type SpinGrid as SpinGridType,
} from '../isingSimulation';

const IsingModel: React.FC = () => {
  // Simulation parameters
  const [gridSize, setGridSize] = useState(50);
  const [temperature, setTemperature] = useState(2.5);
  const [J] = useState(1.0); // Coupling constant

  // Simulation state
  const [grid, setGrid] = useState<SpinGridType>(() => initializeGrid(gridSize));
  const [isRunning, setIsRunning] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [speed, setSpeed] = useState(10); // Steps per second

  // Statistics
  const [magnetization, setMagnetization] = useState(0);
  const [energy, setEnergy] = useState(0);

  const animationRef = useRef<number | undefined>(undefined);
  const lastUpdateRef = useRef<number>(0);

  // Calculate cell size based on grid size
  const cellSize = gridSize <= 50 ? 10 : gridSize <= 100 ? 6 : 4;

  // Update statistics
  const updateStats = useCallback((currentGrid: SpinGridType) => {
    const mag = calculateMagnetization(currentGrid);
    const eng = calculateEnergy(currentGrid, J);
    setMagnetization(mag);
    setEnergy(eng);
  }, [J]);

  // Initialize grid
  const handleInitializeRandom = () => {
    const newGrid = initializeGrid(gridSize);
    setGrid(newGrid);
    setStepCount(0);
    setIsRunning(false);
    updateStats(newGrid);
  };

  const handleInitializeOrdered = () => {
    const newGrid = initializeOrderedGrid(gridSize);
    setGrid(newGrid);
    setStepCount(0);
    setIsRunning(false);
    updateStats(newGrid);
  };

  // Simulation loop
  const simulate = useCallback(
    (timestamp: number) => {
      if (!lastUpdateRef.current) {
        lastUpdateRef.current = timestamp;
      }

      const elapsed = timestamp - lastUpdateRef.current;
      const interval = 1000 / speed; // milliseconds per step

      if (elapsed >= interval) {
        setGrid((prevGrid) => {
          const newGrid = monteCarloStep(prevGrid, temperature, J);
          updateStats(newGrid);
          return newGrid;
        });
        setStepCount((prev) => prev + 1);
        lastUpdateRef.current = timestamp;
      }

      if (isRunning) {
        animationRef.current = requestAnimationFrame(simulate);
      }
    },
    [isRunning, speed, temperature, J, updateStats]
  );

  // Start/stop simulation
  useEffect(() => {
    if (isRunning) {
      lastUpdateRef.current = 0;
      animationRef.current = requestAnimationFrame(simulate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, simulate]);

  // Initialize statistics on mount
  useEffect(() => {
    updateStats(grid);
  }, [grid, updateStats]);

  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };

  const handleSingleStep = () => {
    setGrid((prevGrid) => {
      const newGrid = monteCarloStep(prevGrid, temperature, J);
      updateStats(newGrid);
      return newGrid;
    });
    setStepCount((prev) => prev + 1);
  };

  const handleGridSizeChange = (newSize: number) => {
    setGridSize(newSize);
    const newGrid = initializeGrid(newSize);
    setGrid(newGrid);
    setStepCount(0);
    setIsRunning(false);
    updateStats(newGrid);
  };

  const totalSpins = gridSize * gridSize;
  const magnetizationPerSpin = magnetization / totalSpins;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>2D Ising Model Simulator</h1>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {/* Visualization */}
        <div>
          <h2>Grid Visualization</h2>
          <SpinGrid grid={grid} cellSize={cellSize} />
          <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            <div>Black: Spin up (+1)</div>
            <div>White: Spin down (-1)</div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h2>Controls</h2>

          {/* Grid Size */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Grid Size: {gridSize} × {gridSize}
            </label>
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={gridSize}
              onChange={(e) => handleGridSizeChange(Number(e.target.value))}
              disabled={isRunning}
              style={{ width: '100%' }}
            />
            <div style={{ fontSize: '12px', color: '#666' }}>
              Total spins: {totalSpins}
            </div>
          </div>

          {/* Temperature */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Temperature: {temperature.toFixed(2)} (Critical: ~2.27)
            </label>
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ fontSize: '12px', color: '#666' }}>
              Low T: ordered phase | High T: disordered phase
            </div>
          </div>

          {/* Speed */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Simulation Speed: {speed} steps/sec
            </label>
            <input
              type="range"
              min="1"
              max="60"
              step="1"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Simulation Controls */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={toggleSimulation}
                style={{
                  padding: '10px 20px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  backgroundColor: isRunning ? '#ff4444' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                }}
              >
                {isRunning ? 'Stop' : 'Start'}
              </button>
              <button
                onClick={handleSingleStep}
                disabled={isRunning}
                style={{
                  padding: '10px 20px',
                  fontSize: '16px',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  opacity: isRunning ? 0.5 : 1,
                }}
              >
                Single Step
              </button>
            </div>
          </div>

          {/* Initialize Controls */}
          <div style={{ marginBottom: '20px' }}>
            <h3>Initialize Grid</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={handleInitializeRandom}
                disabled={isRunning}
                style={{
                  padding: '8px 16px',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  opacity: isRunning ? 0.5 : 1,
                }}
              >
                Random
              </button>
              <button
                onClick={handleInitializeOrdered}
                disabled={isRunning}
                style={{
                  padding: '8px 16px',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  opacity: isRunning ? 0.5 : 1,
                }}
              >
                All Spin Up
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div>
            <h3>Statistics</h3>
            <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <div>
                <strong>Steps:</strong> {stepCount}
              </div>
              <div>
                <strong>Total Magnetization:</strong> {magnetization}
              </div>
              <div>
                <strong>Magnetization per spin:</strong>{' '}
                {magnetizationPerSpin.toFixed(4)}
              </div>
              <div>
                <strong>Total Energy:</strong> {energy.toFixed(2)}
              </div>
              <div>
                <strong>Energy per spin:</strong> {(energy / totalSpins).toFixed(4)}
              </div>
            </div>
          </div>

          {/* Information */}
          <div style={{ marginTop: '20px', fontSize: '13px', color: '#666' }}>
            <h3>About</h3>
            <p>
              The 2D Ising model is a mathematical model of ferromagnetism.
              Each site on a lattice has a spin (+1 or -1). The system evolves
              using the Metropolis algorithm to reach thermal equilibrium.
            </p>
            <p>
              At low temperatures (T &lt; 2.27), spins tend to align
              (ferromagnetic phase). At high temperatures, spins are random
              (paramagnetic phase). The critical temperature for the 2D square
              lattice is T<sub>c</sub> ≈ 2.27.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IsingModel;
