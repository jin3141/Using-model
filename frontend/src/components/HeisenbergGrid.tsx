import React from 'react';
import { type HeisenbergGrid as HeisenbergGridType } from '../heisenbergSimulation';

interface HeisenbergGridProps {
  grid: HeisenbergGridType;
  cellSize?: number;
}

/**
 * Convert a 3D spin vector to HSL color
 * - Hue: angle in XY plane (0-360)
 * - Lightness: z component (-1 to 1 mapped to dark to light)
 * - Saturation: magnitude in XY plane
 */
function spinToColor(spin: { x: number; y: number; z: number }): string {
  // Angle in XY plane for hue (0-360 degrees)
  const angle = Math.atan2(spin.y, spin.x);
  const hue = ((angle * 180 / Math.PI) + 360) % 360;

  // Z component for lightness (map -1..1 to 20%..80%)
  const lightness = 50 + spin.z * 30;

  // Magnitude in XY plane for saturation
  const xyMagnitude = Math.sqrt(spin.x * spin.x + spin.y * spin.y);
  const saturation = xyMagnitude * 100;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

const HeisenbergGrid: React.FC<HeisenbergGridProps> = ({ grid, cellSize = 10 }) => {
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

    // Draw spins as colored cells
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const spin = grid[i][j];
        ctx.fillStyle = spinToColor(spin);
        ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
      }
    }

    // Draw arrows for larger cells
    if (cellSize >= 12) {
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const spin = grid[i][j];
          const cx = j * cellSize + cellSize / 2;
          const cy = i * cellSize + cellSize / 2;

          // Draw arrow showing XY component
          const arrowLength = cellSize * 0.35;
          const dx = spin.x * arrowLength;
          const dy = spin.y * arrowLength;

          ctx.strokeStyle = spin.z > 0 ? '#ffffff' : '#000000';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx - dx, cy - dy);
          ctx.lineTo(cx + dx, cy + dy);
          ctx.stroke();

          // Arrow head
          const headLen = cellSize * 0.15;
          const angle = Math.atan2(dy, dx);
          ctx.beginPath();
          ctx.moveTo(cx + dx, cy + dy);
          ctx.lineTo(
            cx + dx - headLen * Math.cos(angle - Math.PI / 6),
            cy + dy - headLen * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(cx + dx, cy + dy);
          ctx.lineTo(
            cx + dx - headLen * Math.cos(angle + Math.PI / 6),
            cy + dy - headLen * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
        }
      }
    }

    // Draw grid lines for small grids
    if (size <= 50 && cellSize >= 8) {
      ctx.strokeStyle = '#cccccc44';
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

export default HeisenbergGrid;
