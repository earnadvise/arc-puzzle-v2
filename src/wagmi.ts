// Updated: 2026-05-16
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { defineChain } from 'viem';

// Arc Testnet Definition
export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'USDC',
    symbol: 'USDC',
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
  testnet: true,
});

// Replace this with your DEPLOYED contract address from Remix
export const LEADERBOARD_ADDRESS = '0x7069faF8220313a0FB3380b115e854A90460446c';

export const LEADERBOARD_ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "username", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "score", "type": "uint256" }
    ],
    "name": "ScoreSubmitted",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "getScoresCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTopScores",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "user", "type": "address" },
          { "internalType": "string", "name": "username", "type": "string" },
          { "internalType": "uint256", "name": "score", "type": "uint256" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "internalType": "struct Leaderboard.ScoreEntry[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_username", "type": "string" },
      { "internalType": "uint256", "name": "_score", "type": "uint256" }
    ],
    "name": "submitScore",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const config = getDefaultConfig({
  appName: 'Arc Match-3 Puzzle',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: [arcTestnet],
  transports: {
    [arcTestnet.id]: http(),
  },
});
