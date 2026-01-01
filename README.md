# 2D Ising Model Simulator

An interactive web-based simulator for the 2D Ising model using Monte Carlo methods (Metropolis algorithm).

## Features

- **Interactive Visualization**: Real-time visualization of spin configurations
- **Adjustable Parameters**:
  - Grid size (10×10 to 200×200)
  - Temperature (0.1 to 5.0)
  - Simulation speed (1-60 steps/second)
- **Multiple Initialization Modes**:
  - Random spin configuration
  - All spins up (ordered state)
- **Statistics Display**:
  - Total magnetization
  - Magnetization per spin
  - Total energy
  - Energy per spin
  - Step count

## Physics Background

The 2D Ising model is a mathematical model of ferromagnetism in statistical mechanics. Each site on a square lattice has a spin that can be either +1 (up) or -1 (down). The system evolves using the Metropolis algorithm to reach thermal equilibrium.

**Key Phenomena**:
- **Low Temperature (T < 2.27)**: Spins tend to align, forming a ferromagnetic phase
- **High Temperature (T > 2.27)**: Spins are random, forming a paramagnetic phase
- **Critical Temperature**: T_c ≈ 2.27 (exact value: 2/ln(1+√2) ≈ 2.269)

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

1. Select a random spin on the lattice
2. Calculate the energy change (ΔE) if the spin were flipped
3. If ΔE ≤ 0, flip the spin
4. If ΔE > 0, flip with probability exp(-ΔE/T)
5. Repeat for all spins in the lattice (one Monte Carlo step)

The energy is calculated using:
```
E = -J Σ s_i s_j
```
where the sum is over nearest-neighbor pairs, J is the coupling constant (J=1), and s_i are the spins.

## License

MIT
