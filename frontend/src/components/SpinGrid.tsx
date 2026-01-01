import React from 'react';
import { type SpinGrid as SpinGridType } from '../isingSimulation';

interface SpinGridProps {
  grid: SpinGridType;
  cellSize?: number;
}

const SpinGrid: React.FC<SpinGridProps> = ({ grid, cellSize = 10 }) => {
  const size = grid.length;
  const canvasSize = size * cellSize;

  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Draw spins
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const spin = grid[i][j];

        // Color: black for spin up (+1), white for spin down (-1)
        ctx.fillStyle = spin > 0 ? '#000000' : '#ffffff';
        ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
      }
    }

    // Draw grid lines for small grids
    if (size <= 50 && cellSize >= 8) {
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 0.5;

      for (let i = 0; i <= size; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvasSize, i * cellSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvasSize);
        ctx.stroke();
      }
    }
  }, [grid, cellSize, size, canvasSize]);

  return (
    <div style={{ border: '1px solid #333', display: 'inline-block' }}>
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default SpinGrid;
