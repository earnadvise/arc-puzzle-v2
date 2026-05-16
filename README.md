# Arc Match-3 Puzzle Game

A fully functional match-3 puzzle game built with React, TypeScript, and Vite, featuring deep integration with the **Arc Network**.

## Key Features
- **Match-3 Engine**: Smooth 8x8 grid gameplay with gravity and matching logic.
- **Wallet Connection**: Integrated with RainbowKit, supporting all EVM wallets.
- **Arc Network Enforcement**: Automatically detects and prompts users to switch to Arc Testnet.
- **Daily Check-in**: On-chain transaction on Arc to record daily activity.
- **Score Submission**: Final score submission via Arc transactions.

## Technical Stack
- **Frontend**: React 18, Vite, TypeScript
- **Web3**: Wagmi, Viem, RainbowKit, TanStack Query
- **Network**: Arc Testnet (Chain ID: 5042002)
- **Currency**: USDC (Native Gas Token)

## Setup and Running

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to the provided local URL (usually `http://localhost:5173`).
