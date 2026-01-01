import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { type PhaseTransitionData } from '../phaseTransition';

interface PhaseTransitionPlotProps {
  data: PhaseTransitionData[];
  modelType: 'ising' | 'heisenberg';
  windowWidth?: number;
}

const PhaseTransitionPlot: React.FC<PhaseTransitionPlotProps> = ({
  data,
  modelType,
  windowWidth = 800,
}) => {
  const isMobile = windowWidth < 768;

  if (data.length === 0) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          border: '2px dashed #ccc',
          borderRadius: '8px',
          color: '#666',
        }}
      >
        <p>No data yet. Run a temperature sweep to see the phase transition!</p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ marginBottom: '10px' }}>
        Magnetization vs Temperature
      </h3>
      <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: isMobile ? 5 : 30,
            left: isMobile ? -10 : 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="temperature"
            label={{
              value: 'Temperature (T)',
              position: 'insideBottom',
              offset: -5,
            }}
            domain={['dataMin', 'dataMax']}
          />
          <YAxis
            label={{
              value: '|M| / N',
              angle: -90,
              position: 'insideLeft',
            }}
            domain={[0, 1]}
          />
          <Tooltip
            formatter={(value: number | undefined) => value?.toFixed(4) ?? 'N/A'}
            labelFormatter={(label) => `T = ${Number(label).toFixed(2)}`}
          />
          <Legend />
          {modelType === 'ising' && (
            <ReferenceLine
              x={2.269}
              stroke="red"
              strokeDasharray="5 5"
              label={{
                value: 'Tc ≈ 2.27',
                position: 'top',
                fill: 'red',
                fontSize: 12,
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="magnetizationPerSpin"
            stroke={modelType === 'ising' ? '#4CAF50' : '#2196F3'}
            strokeWidth={2}
            dot={{ r: isMobile ? 2 : 4 }}
            name="|M|/N"
            animationDuration={500}
          />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        {modelType === 'ising' ? (
          <p>
            The Ising model shows a sharp phase transition at T<sub>c</sub> ≈
            2.27. Below T<sub>c</sub>, the system is in the ferromagnetic phase
            (high magnetization). Above T<sub>c</sub>, it transitions to the
            paramagnetic phase (low magnetization).
          </p>
        ) : (
          <p>
            The Heisenberg model in 2D does not have a finite-temperature phase
            transition (Mermin-Wagner theorem). The magnetization decreases
            smoothly with temperature, showing quasi-long-range order at low
            temperatures.
          </p>
        )}
      </div>
    </div>
  );
};

export default PhaseTransitionPlot;
