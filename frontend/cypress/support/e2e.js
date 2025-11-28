/**
 * Cypress E2E Support File
 * Global commands and setup for end-to-end testing
 */

// Import commands
import './commands';

// Import custom assertions
import './assertions';

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing on certain errors
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  
  if (err.message.includes('Non-Error promise rejection captured')) {
    return false;
  }
  
  // Return false to prevent Cypress from failing the test
  return true;
});

// Global before each hook
beforeEach(() => {
  // Clear local storage
  cy.clearLocalStorage();
  
  // Clear cookies
  cy.clearCookies();
  
  // Mock analytics and error reporting
  cy.window().then((win) => {
    win.gtag = cy.stub();
    win.Sentry = {
      captureException: cy.stub(),
      captureMessage: cy.stub(),
      setUser: cy.stub()
    };
  });
});

// Global after each hook
afterEach(() => {
  // Take screenshot on test failure
  cy.screenshot({ capture: 'viewport' });
});

// Add custom matchers
chai.use((chai, utils) => {
  // Custom assertion for checking if element is visible in viewport
  chai.Assertion.addMethod('visibleInViewport', function() {
    const obj = this._obj;
    
    const $el = Cypress.$(obj);
    const rect = $el[0].getBoundingClientRect();
    
    const isInViewport = (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
    
    this.assert(
      isInViewport,
      `expected ${utils.inspect(obj)} to be visible in viewport`,
      `expected ${utils.inspect(obj)} not to be visible in viewport`
    );
  });
  
  // Custom assertion for checking if element has correct CSS
  chai.Assertion.addMethod('haveCss', function(property, value) {
    const obj = this._obj;
    
    cy.wrap(obj).should('have.css', property, value);
  });
  
  // Custom assertion for checking if element is accessible
  chai.Assertion.addMethod('beAccessible', function() {
    const obj = this._obj;
    
    // Basic accessibility checks
    cy.wrap(obj).should('have.attr', 'aria-label').or('have.attr', 'aria-labelledby').or('have.attr', 'title');
  });
});