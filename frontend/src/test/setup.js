/**
 * Test Setup Configuration
 * Sets up the testing environment with mocks and global utilities
 */

// Setup global mocks first before any imports
import { vi } from 'vitest';

// Mock localStorage before any other imports that might use it
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';

// Temporarily disable MSW to fix localStorage issues
// import { server } from './mocks/server';

// Setup MSW server
// beforeAll(() => {
//   server.listen({
//     onUnhandledRequest: 'error'
//   });
// });

// Reset handlers after each test
afterEach(() => {
  // server.resetHandlers();
  cleanup();
});

// Close server after all tests
// afterAll(() => {
//   server.close();
// });

// Mock IntersectionObserver
globalThis.IntersectionObserver = class IntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
  }
  
  observe(element) {
    // Simulate intersection immediately
    setTimeout(() => {
      this.callback([{
        target: element,
        isIntersecting: true,
        intersectionRatio: 1,
        boundingClientRect: element.getBoundingClientRect(),
        intersectionRect: element.getBoundingClientRect(),
        rootBounds: null,
        time: Date.now()
      }]);
    }, 100);
  }
  
  unobserve() {}
  disconnect() {}
};

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {}
  })
});

// Mock scrollTo
window.scrollTo = vi.fn();

// Mock fetch globally
globalThis.fetch = vi.fn();

// Mock URL.createObjectURL
globalThis.URL.createObjectURL = vi.fn(() => 'mock-url');
globalThis.URL.revokeObjectURL = vi.fn();

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    getEntriesByType: vi.fn(() => []),
    mark: vi.fn(),
    measure: vi.fn(),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn()
  }
});

// Mock crypto API
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'mock-uuid'),
    getRandomValues: vi.fn(() => new Uint32Array(1))
  }
});

// Mock environment variables
vi.mock('../src/config/api', () => ({
  API_ENDPOINTS: {
    BASE_URL: 'http://localhost:3000/api',
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout'
    },
    EVENTS: {
      LIST: '/events',
      CREATE: '/events'
    },
    CONTACT: {
      SUBMIT_MESSAGE: '/contact/message'
    }
  },
  buildUrl: (endpoint, params = {}) => {
    const url = `http://localhost:3000/api${endpoint}`;
    const searchParams = new URLSearchParams(params);
    return searchParams.toString() ? `${url}?${searchParams.toString()}` : url;
  }
}));

// Mock React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null, key: 'test' }),
    useParams: () => ({}),
    useSearchParams: () => [new URLSearchParams(), vi.fn()]
  };
});

// Mock toast notifications
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    loading: vi.fn()
  },
  ToastContainer: () => null
}));

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn()
    }
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn()
  }
}));

// Mock analytics
vi.mock('../src/utils/analytics', () => ({
  analyticsManager: {
    trackEvent: vi.fn(),
    trackPageView: vi.fn(),
    setUserId: vi.fn(),
    setUserProperties: vi.fn()
  },
  useAnalytics: () => ({
    trackEvent: vi.fn(),
    trackPageView: vi.fn(),
    setUserId: vi.fn(),
    setUserProperties: vi.fn()
  })
}));

// Mock error logger
vi.mock('../src/utils/errorLogger', () => ({
  errorLogger: {
    log: vi.fn(),
    getErrorStats: vi.fn()
  },
  handleApiError: vi.fn(),
  handleAuthError: vi.fn(),
  handleValidationError: vi.fn()
}));

// Mock performance monitor
vi.mock('../src/utils/performanceMonitor', () => ({
  performanceMonitor: {
    recordMetric: vi.fn(),
    getPerformanceSummary: vi.fn()
  },
  performanceUtils: {
    measureFunction: vi.fn(),
    measureComponent: vi.fn()
  }
}));

// Global test utilities
export const createMockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'member',
  isActive: true,
  createdAt: new Date().toISOString(),
  ...overrides
});

export const createMockEvent = (overrides = {}) => ({
  id: '1',
  title: 'Test Event',
  description: 'Test event description',
  date: new Date().toISOString(),
  location: 'Test Location',
  isUpcoming: true,
  attendees: [],
  ...overrides
});

export const createMockPost = (overrides = {}) => ({
  id: '1',
  title: 'Test Post',
  content: 'Test post content',
  excerpt: 'Test post excerpt',
  author: createMockUser(),
  publishedAt: new Date().toISOString(),
  isPublished: true,
  ...overrides
});

export const waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApiResponse = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data)
});

export const mockApiError = (message, status = 400) => ({
  ok: false,
  status,
  json: async () => ({ error: { message } }),
  text: async () => JSON.stringify({ error: { message } })
});
