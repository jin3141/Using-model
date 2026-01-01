import React, { useState, useEffect, useCallback, useRef } from 'react';
import SpinGrid from './SpinGrid';
import HeisenbergGrid from './HeisenbergGrid';
import {
  initializeGrid,
  initializeOrderedGrid,
  monteCarloStep,
  calculateMagnetization,
  calculateEnergy,
  type SpinGrid as SpinGridType,
} from '../isingSimulation';
import {
  initializeHeisenbergGrid,
  initializeOrderedHeisenbergGrid,
  heisenbergMonteCarloStep,
  calculateHeisenbergMagnetizationMagnitude,
  calculateHeisenbergEnergy,
  type HeisenbergGrid as HeisenbergGridType,
} from '../heisenbergSimulation';

type ModelType = 'ising' | 'heisenberg';

const SpinModelSimulator: React.FC = () => {
  // Model selection
  const [modelType, setModelType] = useState<ModelType>('ising');

  // Simulation parameters
  const [gridSize, setGridSize] = useState(50);
  const [temperature, setTemperature] = useState(2.5);
  const [J] = useState(1.0);

  // Ising model state
  const [isingGrid, setIsingGrid] = useState<SpinGridType>(() => initializeGrid(gridSize));

  // Heisenberg model state
  const [heisenbergGrid, setHeisenbergGrid] = useState<HeisenbergGridType>(() =>
    initializeHeisenbergGrid(gridSize)
  );

  // Simulation state
  const [isRunning, setIsRunning] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [speed, setSpeed] = useState(10);

  // Statistics
  const [magnetization, setMagnetization] = useState(0);
  const [energy, setEnergy] = useState(0);

  const animationRef = useRef<number | undefined>(undefined);
  const lastUpdateRef = useRef<number>(0);

  // Responsive cell size
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 800);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getResponsiveCellSize = () => {
    const isMobile = windowWidth < 768;
    const maxCanvasSize = isMobile ? Math.min(windowWidth - 40, 400) : 500;
    const cellSize = Math.floor(maxCanvasSize / gridSize);
    return Math.max(2, Math.min(cellSize, gridSize <= 50 ? 10 : 6));
  };

  const cellSize = getResponsiveCellSize();

  // Update statistics
  const updateStats = useCallback(() => {
    if (modelType === 'ising') {
      const mag = calculateMagnetization(isingGrid);
      const eng = calculateEnergy(isingGrid, J);
      setMagnetization(mag);
      setEnergy(eng);
    } else {
      const mag = calculateHeisenbergMagnetizationMagnitude(heisenbergGrid);
      const eng = calculateHeisenbergEnergy(heisenbergGrid, J);
      setMagnetization(mag);
      setEnergy(eng);
    }
  }, [modelType, isingGrid, heisenbergGrid, J]);

  // Initialize grid
  const handleInitializeRandom = () => {
    if (modelType === 'ising') {
      const newGrid = initializeGrid(gridSize);
      setIsingGrid(newGrid);
    } else {
      const newGrid = initializeHeisenbergGrid(gridSize);
      setHeisenbergGrid(newGrid);
    }
    setStepCount(0);
    setIsRunning(false);
    updateStats();
  };

  const handleInitializeOrdered = () => {
    if (modelType === 'ising') {
      const newGrid = initializeOrderedGrid(gridSize);
      setIsingGrid(newGrid);
    } else {
      const newGrid = initializeOrderedHeisenbergGrid(gridSize);
      setHeisenbergGrid(newGrid);
    }
    setStepCount(0);
    setIsRunning(false);
    updateStats();
  };

  // Simulation loop
  const simulate = useCallback(
    (timestamp: number) => {
      if (!lastUpdateRef.current) {
        lastUpdateRef.current = timestamp;
      }

      const elapsed = timestamp - lastUpdateRef.current;
      const interval = 1000 / speed;

      if (elapsed >= interval) {
        if (modelType === 'ising') {
          setIsingGrid((prevGrid) => {
            const newGrid = monteCarloStep(prevGrid, temperature, J);
            return newGrid;
          });
        } else {
          setHeisenbergGrid((prevGrid) => {
            const newGrid = heisenbergMonteCarloStep(prevGrid, temperature, J);
            return newGrid;
          });
        }
        setStepCount((prev) => prev + 1);
        lastUpdateRef.current = timestamp;
      }

      if (isRunning) {
        animationRef.current = requestAnimationFrame(simulate);
      }
    },
    [isRunning, speed, temperature, J, modelType]
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

  // Update statistics
  useEffect(() => {
    updateStats();
  }, [isingGrid, heisenbergGrid, updateStats]);

  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };

  const handleSingleStep = () => {
    if (modelType === 'ising') {
      setIsingGrid((prevGrid) => monteCarloStep(prevGrid, temperature, J));
    } else {
      setHeisenbergGrid((prevGrid) => heisenbergMonteCarloStep(prevGrid, temperature, J));
    }
    setStepCount((prev) => prev + 1);
  };

  const handleGridSizeChange = (newSize: number) => {
    setGridSize(newSize);
    if (modelType === 'ising') {
      const newGrid = initializeGrid(newSize);
      setIsingGrid(newGrid);
    } else {
      const newGrid = initializeHeisenbergGrid(newSize);
      setHeisenbergGrid(newGrid);
    }
    setStepCount(0);
    setIsRunning(false);
  };

  const handleModelChange = (newModel: ModelType) => {
    setModelType(newModel);
    setStepCount(0);
    setIsRunning(false);
  };

  const totalSpins = gridSize * gridSize;
  const magnetizationPerSpin = magnetization / totalSpins;

  const isMobile = windowWidth < 768;

  return (
    <div style={{
      padding: isMobile ? '10px' : '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontSize: isMobile ? '14px' : '16px'
    }}>
      <h1 style={{ fontSize: isMobile ? '1.8em' : '2.5em' }}>
        2D Spin Model Simulator
      </h1>

      <div style={{
        display: 'flex',
        gap: isMobile ? '15px' : '30px',
        flexWrap: 'wrap'
      }}>
        {/* Visualization */}
        <div style={{ flex: isMobile ? '1 1 100%' : '0 0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '1.3em' : '1.5em' }}>Grid Visualization</h2>
          {modelType === 'ising' ? (
            <SpinGrid grid={isingGrid} cellSize={cellSize} />
          ) : (
            <HeisenbergGrid grid={heisenbergGrid} cellSize={cellSize} />
          )}
          <div style={{
            marginTop: '10px',
            fontSize: isMobile ? '12px' : '14px',
            color: '#666'
          }}>
            {modelType === 'ising' ? (
              <>
                <div>Black: Spin up (+1)</div>
                <div>White: Spin down (-1)</div>
              </>
            ) : (
              <>
                <div>Color: Spin direction (hue = XY angle)</div>
                <div>Brightness: Z component</div>
                <div>Arrows: In-plane component</div>
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        <div style={{ flex: 1, minWidth: isMobile ? '100%' : '300px' }}>
          <h2 style={{ fontSize: isMobile ? '1.3em' : '1.5em' }}>Controls</h2>

          {/* Model Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Model Type
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleModelChange('ising')}
                disabled={isRunning}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: modelType === 'ising' ? '#4CAF50' : '#fff',
                  color: modelType === 'ising' ? '#fff' : '#000',
                  border: '2px solid #4CAF50',
                  fontWeight: 'bold',
                }}
              >
                Ising Model
              </button>
              <button
                onClick={() => handleModelChange('heisenberg')}
                disabled={isRunning}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: modelType === 'heisenberg' ? '#2196F3' : '#fff',
                  color: modelType === 'heisenberg' ? '#fff' : '#000',
                  border: '2px solid #2196F3',
                  fontWeight: 'bold',
                }}
              >
                Heisenberg Model
              </button>
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              {modelType === 'ising'
                ? 'Discrete spins: ±1'
                : '3D vector spins on unit sphere'}
            </div>
          </div>

          {/* Grid Size */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Grid Size: {gridSize} × {gridSize}
            </label>
            <input
              type="range"
              min="10"
              max={isMobile ? "100" : "200"}
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
              Temperature: {temperature.toFixed(2)}
              {modelType === 'ising' && ' (Critical: ~2.27)'}
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
              Low T: ordered | High T: disordered
            </div>
          </div>

          {/* Speed */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Speed: {speed} steps/sec
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
                  padding: '12px 24px',
                  fontSize: isMobile ? '14px' : '16px',
                  cursor: 'pointer',
                  backgroundColor: isRunning ? '#ff4444' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  flex: isMobile ? '1 1 100%' : '0 0 auto',
                }}
              >
                {isRunning ? 'Stop' : 'Start'}
              </button>
              <button
                onClick={handleSingleStep}
                disabled={isRunning}
                style={{
                  padding: '12px 24px',
                  fontSize: isMobile ? '14px' : '16px',
                  flex: isMobile ? '1 1 100%' : '0 0 auto',
                }}
              >
                Single Step
              </button>
            </div>
          </div>

          {/* Initialize Controls */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: isMobile ? '1.1em' : '1.2em' }}>Initialize Grid</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={handleInitializeRandom}
                disabled={isRunning}
                style={{
                  padding: '8px 16px',
                  flex: isMobile ? '1 1 100%' : '0 0 auto',
                }}
              >
                Random
              </button>
              <button
                onClick={handleInitializeOrdered}
                disabled={isRunning}
                style={{
                  padding: '8px 16px',
                  flex: isMobile ? '1 1 100%' : '0 0 auto',
                }}
              >
                All {modelType === 'ising' ? 'Spin Up' : 'Spins Up (Z)'}
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div>
            <h3 style={{ fontSize: isMobile ? '1.1em' : '1.2em' }}>Statistics</h3>
            <div style={{ fontSize: isMobile ? '13px' : '14px', lineHeight: '1.8' }}>
              <div>
                <strong>Steps:</strong> {stepCount}
              </div>
              <div>
                <strong>{modelType === 'ising' ? 'Total Magnetization:' : 'Magnetization Magnitude:'}</strong> {magnetization.toFixed(2)}
              </div>
              <div>
                <strong>|M|/N:</strong> {magnetizationPerSpin.toFixed(4)}
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
          {!isMobile && (
            <div style={{ marginTop: '20px', fontSize: '13px', color: '#666' }}>
              <h3>About {modelType === 'ising' ? 'Ising' : 'Heisenberg'} Model</h3>
              {modelType === 'ising' ? (
                <p>
                  The 2D Ising model has discrete spins (±1).
                  At T<sub>c</sub> ≈ 2.27, it undergoes a phase transition from
                  ferromagnetic (ordered) to paramagnetic (disordered).
                </p>
              ) : (
                <p>
                  The 2D Heisenberg model has continuous 3D spins on a unit sphere.
                  Unlike Ising, it shows no finite-temperature phase transition in 2D
                  (Mermin-Wagner theorem), but exhibits quasi-long-range order at low T.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpinModelSimulator;
