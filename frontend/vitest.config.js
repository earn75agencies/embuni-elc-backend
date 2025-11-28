/**
 * Vitest Configuration
 * Configures the testing environment with proper setup for React components
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Test environment
    environment: 'jsdom',
    
    // Setup files
    setupFiles: ['./src/test/setup.js'],
    
    // Global setup
    globals: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.config.js',
        '**/*.config.jsx',
        'src/main.jsx',
        'src/vite-env.d.ts'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    
    // Test matching patterns
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}'
    ],
    
    // Exclude patterns
    exclude: [
      'node_modules/',
      'dist/',
      '**/*.config.js',
      '**/*.config.jsx'
    ],
    
    // Test timeout
    testTimeout: 10000,
    
    // Hook timeout
    hookTimeout: 10000,
    
    // Concurrency
    threads: true,
    
    // Watch mode
    watchExclude: [
      'node_modules/',
      'dist/'
    ]
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@test': path.resolve(__dirname, './src/test')
    }
  },
  
  // Define global constants
  define: {
    'import.meta.env': {
      NODE_ENV: 'test',
      VITE_API_URL: 'http://localhost:3000/api',
      VITE_APP_NAME: 'Equity Leaders Chapter - Test'
    },
    'global.localStorage': {
      getItem: () => {},
      setItem: () => {},
      removeItem: () => {},
      clear: () => {}
    }
  }
});