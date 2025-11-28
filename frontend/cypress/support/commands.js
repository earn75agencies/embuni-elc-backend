/**
 * Cypress Custom Commands
 * Reusable commands for E2E testing
 */

// Login command
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password') => {
  cy.session([email, password], () => {
    cy.visit('/login');
    
    cy.get('[data-cy=email-input]').type(email);
    cy.get('[data-cy=password-input]').type(password);
    cy.get('[data-cy=login-button]').click();
    
    // Wait for successful login
    cy.url().should('not.include', '/login');
    cy.get('[data-cy=user-menu]').should('be.visible');
  });
});

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('[data-cy=user-menu]').click();
  cy.get('[data-cy=logout-button]').click();
  
  // Wait for logout
  cy.url().should('include', '/login');
});

// Register command
Cypress.Commands.add('register', (userData) => {
  const {
    name = 'Test User',
    email = 'test@example.com',
    password = 'password',
    confirmPassword = 'password'
  } = userData;
  
  cy.visit('/register');
  
  cy.get('[data-cy=name-input]').type(name);
  cy.get('[data-cy=email-input]').type(email);
  cy.get('[data-cy=password-input]').type(password);
  cy.get('[data-cy=confirm-password-input]').type(confirmPassword);
  cy.get('[data-cy=register-button]').click();
  
  // Wait for successful registration
  cy.url().should('not.include', '/register');
});

// Fill contact form command
Cypress.Commands.add('fillContactForm', (formData) => {
  const {
    name = 'Test User',
    email = 'test@example.com',
    message = 'This is a test message'
  } = formData;
  
  cy.get('[data-cy=contact-name]').type(name);
  cy.get('[data-cy=contact-email]').type(email);
  cy.get('[data-cy=contact-message]').type(message);
});

// Submit contact form command
Cypress.Commands.add('submitContactForm', (formData) => {
  cy.fillContactForm(formData);
  cy.get('[data-cy=contact-submit]').click();
});

// Navigate to page command
Cypress.Commands.add('navigateTo', (page) => {
  const routes = {
    home: '/',
    about: '/about',
    contact: '/contact',
    events: '/events',
    news: '/news',
    gallery: '/gallery',
    programs: '/programs',
    resources: '/resources',
    login: '/login',
    register: '/register',
    dashboard: '/dashboard',
    admin: '/admin'
  };
  
  const route = routes[page] || page;
  cy.visit(route);
});

// Check accessibility command
Cypress.Commands.add('checkA11y', (context, options, violationCallback) => {
  cy.injectAxe();
  cy.checkA11y(context, options, violationCallback);
});

// Wait for API command
Cypress.Commands.add('waitForApi', (alias, timeout = 10000) => {
  cy.wait(`@${alias}`, { timeout });
});

// Mock API response command
Cypress.Commands.add('mockApiResponse', (method, url, response, status = 200) => {
  cy.intercept(method, url, {
    statusCode: status,
    body: response
  }).as(`mock-${method}-${url}`);
});

// Check loading state command
Cypress.Commands.add('checkLoadingState', (selector = '[data-cy=loading]') => {
  cy.get(selector).should('be.visible');
  cy.get(selector).should('not.exist');
});

// Check toast notification command
Cypress.Commands.add('checkToast', (message, type = 'success') => {
  const toastSelector = `[data-cy=toast-${type}]`;
  cy.get(toastSelector).should('be.visible');
  cy.get(toastSelector).should('contain', message);
});

// Upload file command
Cypress.Commands.add('uploadFile', (selector, fileName, mimeType = 'application/octet-stream') => {
  cy.get(selector).selectFile({
    contents: `cypress/fixtures/${fileName}`,
    mimeType
  });
});

// Check responsive design command
Cypress.Commands.add('checkResponsive', (breakpoints = ['iphone-x', 'ipad-2', 'macbook-13']) => {
  breakpoints.forEach(viewport => {
    cy.viewport(viewport);
    cy.get('body').should('be.visible');
    // Add more specific checks based on your layout
  });
});

// Check form validation command
Cypress.Commands.add('checkFormValidation', (fieldSelector, errorMessage) => {
  cy.get(fieldSelector).focus().blur();
  cy.get('[data-cy=error-message]').should('contain', errorMessage);
});

// Search command
Cypress.Commands.add('search', (query, searchSelector = '[data-cy=search-input]') => {
  cy.get(searchSelector).type(query);
  cy.get('[data-cy=search-button]').click();
});

// Filter command
Cypress.Commands.add('filter', (filterType, filterValue) => {
  cy.get(`[data-cy=filter-${filterType}]`).select(filterValue);
  cy.get('[data-cy=apply-filters]').click();
});

// Sort command
Cypress.Commands.add('sort', (sortBy, sortOrder = 'asc') => {
  cy.get('[data-cy=sort-select]').select(sortBy);
  if (sortOrder !== 'asc') {
    cy.get('[data-cy=sort-order]').click();
  }
});

// Check pagination command
Cypress.Commands.add('checkPagination', (currentPage, totalPages) => {
  cy.get('[data-cy=current-page]').should('contain', currentPage);
  cy.get('[data-cy=total-pages]').should('contain', totalPages);
  
  if (currentPage > 1) {
    cy.get('[data-cy=prev-page]').should('not.be.disabled');
  } else {
    cy.get('[data-cy=prev-page]').should('be.disabled');
  }
  
  if (currentPage < totalPages) {
    cy.get('[data-cy=next-page]').should('not.be.disabled');
  } else {
    cy.get('[data-cy=next-page]').should('be.disabled');
  }
});

// Navigate pagination command
Cypress.Commands.add('navigatePagination', (direction) => {
  cy.get(`[data-cy=${direction}-page]`).click();
});

// Check empty state command
Cypress.Commands.add('checkEmptyState', (message) => {
  cy.get('[data-cy=empty-state]').should('be.visible');
  if (message) {
    cy.get('[data-cy=empty-state]').should('contain', message);
  }
});

// Check error state command
Cypress.Commands.add('checkErrorState', (message) => {
  cy.get('[data-cy=error-state]').should('be.visible');
  if (message) {
    cy.get('[data-cy=error-state]').should('contain', message);
  }
});

// Retry command
Cypress.Commands.add('retry', (fn, retries = 3, delay = 1000) => {
  const attempt = (attemptNumber) => {
    return fn().catch((error) => {
      if (attemptNumber < retries) {
        cy.wait(delay);
        return attempt(attemptNumber + 1);
      }
      throw error;
    });
  };
  
  return attempt(0);
});

// Check dark mode command
Cypress.Commands.add('checkDarkMode', () => {
  cy.get('[data-cy=theme-toggle]').click();
  cy.get('body').should('have.class', 'dark');
});

// Check light mode command
Cypress.Commands.add('checkLightMode', () => {
  cy.get('[data-cy=theme-toggle]').click();
  cy.get('body').should('not.have.class', 'dark');
});

// Check language switch command
Cypress.Commands.add('switchLanguage', (language) => {
  cy.get('[data-cy=language-selector]').click();
  cy.get(`[data-cy=language-${language}]`).click();
  cy.get('[data-cy=language-selector]').should('contain', language.toUpperCase());
});

// Check mobile menu command
Cypress.Commands.add('checkMobileMenu', () => {
  cy.viewport('iphone-x');
  cy.get('[data-cy=mobile-menu-toggle]').should('be.visible');
  cy.get('[data-cy=mobile-menu-toggle]').click();
  cy.get('[data-cy=mobile-menu]').should('be.visible');
});

// Check scroll to top command
Cypress.Commands.add('scrollToTop', () => {
  cy.scrollTo('top');
  cy.get('[data-cy=scroll-to-top]').should('be.visible');
  cy.get('[data-cy=scroll-to-top]').click();
  cy.window().its('scrollY').should('equal', 0);
});