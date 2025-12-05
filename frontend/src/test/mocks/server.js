/**
 * MSW Server Configuration
 * Mock Service Worker setup for API mocking in tests
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Create MSW server
export const server = setupServer(...handlers);
