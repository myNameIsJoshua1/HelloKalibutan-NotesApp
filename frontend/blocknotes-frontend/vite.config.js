import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(), 
    nodePolyfills({
      include: ['buffer', 'process', 'stream'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    })
  ],
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    },
    exclude: ['lucid-cardano']
  },
  resolve: {
    alias: {
      'node:stream/web': 'stream-browserify'
    }
  }
});
