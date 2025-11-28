/**
 * Cypress Configuration
 * End-to-end testing setup with Cypress
 */

const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // Base URL for the application
    baseUrl: 'http://localhost:5173',
    
    // Support file
    supportFile: 'cypress/support/e2e.js',
    
    // Spec files
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    
    // Viewport size
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Default command timeout
    defaultCommandTimeout: 10000,
    
    // Request timeout
    requestTimeout: 10000,
    
    // Response timeout
    responseTimeout: 10000,
    
    // Video recording
    video: true,
    videoCompression: 32,
    
    // Screenshots
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    
    // Videos folder
    videosFolder: 'cypress/videos',
    
    // Downloads folder
    downloadsFolder: 'cypress/downloads',
    
    // Trash assets before each run
    trashAssetsBeforeRuns: true,
    
    // Reporter
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      reportDir: 'cypress/reports',
      charts: true,
      reportPageTitle: 'Equity Leaders E2E Test Report',
      embeddedScreenshots: true,
      inlineAssets: true,
      saveAllAttempts: false
    },
    
    // Environment variables
    env: {
      // API URL for mocking
      apiUrl: 'http://localhost:3000/api',
      
      // Test credentials
      testUser: {
        email: 'test@example.com',
        password: 'password'
      },
      
      // Feature flags
      enableAnalytics: false,
      enableErrorReporting: false
    },
    
    // Setup node events
    setupNodeEvents(on, config) {
      // Task for database operations
      on('task', {
        // Clear test data
        clearTestData() {
          // Implementation for clearing test data
          return null;
        },
        
        // Seed test data
        seedTestData() {
          // Implementation for seeding test data
          return null;
        },
        
        // Get test user
        getTestUser() {
          return {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'member'
          };
        },
        
        // Log message to console
        log(message) {
          console.log(message);
          return null;
        }
      });
      
      return config;
    }
  },
  
  // Component testing configuration
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite'
    },
    supportFile: 'cypress/support/component.js',
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}'
  }
});