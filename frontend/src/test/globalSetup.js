/**
 * Global Test Setup
 * Runs before the test environment is created
 */

import { vi } from 'vitest';

// Mock localStorage before any tests run
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

// Define globals before environment setup
globalThis.localStorage = localStorageMock;
globalThis.sessionStorage = sessionStorageMock;

export default function setup() {
  // Global setup logic
}
