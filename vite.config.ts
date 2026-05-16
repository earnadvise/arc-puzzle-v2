import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-web3': ['wagmi', 'viem', '@rainbow-me/rainbowkit', '@tanstack/react-query'],
          'vendor-react': ['react', 'react-dom'],
        }
      }
    }
  }
})
