# 2D Spin Model Simulator

An interactive web-based simulator for 2D spin models using Monte Carlo methods (Metropolis algorithm). Supports both the **Ising model** (discrete spins) and the **Heisenberg model** (continuous vector spins).

## Features

- **Two Model Types**:
  - **Ising Model**: Discrete spins (±1)
  - **Heisenberg Model**: 3D vector spins on unit sphere
- **Interactive Visualization**: Real-time visualization of spin configurations
  - Ising: Black/white for up/down spins
  - Heisenberg: Color-coded by direction with arrows
- **Adjustable Parameters**:
  - Grid size (10×10 to 200×200)
  - Temperature (0.1 to 5.0)
  - Simulation speed (1-60 steps/second)
- **Multiple Initialization Modes**:
  - Random spin configuration
  - All spins aligned (ordered state)
- **Statistics Display**:
  - Total magnetization
  - Magnetization per spin
  - Total energy
  - Energy per spin
  - Step count
- **Mobile Responsive**: Optimized for smartphones and tablets

## Physics Background

### Ising Model

The 2D Ising model is a mathematical model of ferromagnetism with discrete spins (±1). The system exhibits a phase transition at the critical temperature.

**Key Phenomena**:
- **Low Temperature (T < 2.27)**: Spins align → ferromagnetic phase
- **High Temperature (T > 2.27)**: Spins random → paramagnetic phase
- **Critical Temperature**: T_c ≈ 2.27 (exact: 2/ln(1+√2) ≈ 2.269)

### Heisenberg Model

The 2D Heisenberg model has continuous 3D spins on a unit sphere. Unlike the Ising model, it shows different behavior:

**Key Phenomena**:
- **No finite-T phase transition in 2D** (Mermin-Wagner theorem)
- **Low Temperature**: Quasi-long-range order with power-law correlations
- **High Temperature**: Disordered paramagnetic phase
- Exhibits continuous symmetry breaking at T=0

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Visualization**: HTML5 Canvas
- **Algorithm**: Metropolis Monte Carlo simulation

## Development

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
cd frontend
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

## Deployment

This project is configured for GitHub Pages deployment. Push to the main branch to trigger automatic deployment via GitHub Actions.

## How It Works

The simulation uses the **Metropolis algorithm**:

### Ising Model
1. Select a random spin on the lattice
2. Calculate the energy change (ΔE) if the spin were flipped
3. If ΔE ≤ 0, flip the spin
4. If ΔE > 0, flip with probability exp(-ΔE/T)
5. Repeat for all spins in the lattice (one Monte Carlo step)

Energy formula:
```
E = -J Σ s_i · s_j
```
where s_i ∈ {-1, +1} are discrete spins.

### Heisenberg Model
1. Select a random spin on the lattice
2. Propose a new random direction (unit vector)
3. Calculate the energy change (ΔE) for the new direction
4. Accept with Metropolis criterion: min(1, exp(-ΔE/T))
5. Repeat for all spins in the lattice

Energy formula:
```
E = -J Σ S_i · S_j
```
where S_i are 3D unit vectors and · denotes dot product.

## License

MIT
