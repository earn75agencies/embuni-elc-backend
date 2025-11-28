/**
 * CSRF Protection Implementation
 * Provides CSRF token generation and validation
 */

class CSRFProtection {
  constructor() {
    this.token = null;
    this.tokenName = 'X-CSRF-Token';
    this.cookieName = 'csrf_token';
    this.headerName = 'X-CSRF-Token';
    this.tokenLength = 32;
  }

  /**
   * Initialize CSRF protection
   */
  init() {
    this.generateToken();
    this.setupTokenRefresh();
    this.setupFormProtection();
    this.setupAjaxProtection();
  }

  /**
   * Generate CSRF token
   */
  generateToken() {
    if (this.token && this.isTokenValid(this.token)) {
      return this.token;
    }

    // Generate cryptographically secure random token
    const array = new Uint8Array(this.tokenLength);
    crypto.getRandomValues(array);
    
    this.token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    
    // Store in cookie
    this.setTokenCookie(this.token);
    
    return this.token;
  }

  /**
   * Get current CSRF token
   */
  getToken() {
    if (!this.token) {
      this.generateToken();
    }
    return this.token;
  }

  /**
   * Validate CSRF token
   */
  validateToken(token) {
    if (!token || !this.token) {
      return false;
    }

    // Constant-time comparison to prevent timing attacks
    return this.constantTimeCompare(token, this.token);
  }

  /**
   * Check if token is valid (not expired)
   */
  isTokenValid(token) {
    // Add timestamp validation if needed
    return token && token.length === this.tokenLength * 2;
  }

  /**
   * Constant-time string comparison
   */
  constantTimeCompare(a, b) {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Set CSRF token cookie
   */
  setTokenCookie(token) {
    const expires = new Date();
    expires.setDate(expires.getDate() + 1); // 1 day expiry

    document.cookie = `${this.cookieName}=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Strict; Secure`;
  }

  /**
   * Get CSRF token from cookie
   */
  getTokenFromCookie() {
    const cookies = document.cookie.split(';');
    
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === this.cookieName) {
        return value;
      }
    }
    
    return null;
  }

  /**
   * Setup automatic token refresh
   */
  setupTokenRefresh() {
    // Refresh token every hour
    setInterval(() => {
      this.generateToken();
    }, 60 * 60 * 1000);
  }

  /**
   * Setup form protection
   */
  setupFormProtection() {
    // Add CSRF tokens to all forms
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.processNode(node);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Process existing forms
    this.processExistingForms();
  }

  /**
   * Process a node for CSRF protection
   */
  processNode(node) {
    if (node.tagName === 'FORM') {
      this.addCSRFToForm(node);
    } else {
      // Look for forms within the node
      const forms = node.querySelectorAll?.('form') || [];
      forms.forEach(form => this.addCSRFToForm(form));
    }
  }

  /**
   * Process existing forms
   */
  processExistingForms() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => this.addCSRFToForm(form));
  }

  /**
   * Add CSRF token to form
   */
  addCSRFToForm(form) {
    // Check if form already has CSRF token
    if (form.querySelector(`input[name="${this.tokenName}"]`)) {
      return;
    }

    // Create hidden input
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = this.tokenName;
    input.value = this.getToken();
    
    // Add to form
    form.appendChild(input);
  }

  /**
   * Setup AJAX/Fetch protection
   */
  setupAjaxProtection() {
    // Override fetch to include CSRF token
    const originalFetch = window.fetch;
    
    window.fetch = async (url, options = {}) => {
      // Only add CSRF token for same-origin requests
      if (this.shouldAddCSRFToken(url)) {
        options.headers = {
          ...options.headers,
          [this.headerName]: this.getToken()
        };
      }

      return originalFetch(url, options);
    };

    // Override XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      this._url = url;
      this._method = method;
      
      return originalXHROpen.call(this, method, url, ...args);
    };

    const originalXHRSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.send = function(data) {
      if (window.csrfProtection.shouldAddCSRFToken(this._url)) {
        this.setRequestHeader(
          window.csrfProtection.headerName,
          window.csrfProtection.getToken()
        );
      }
      
      return originalXHRSend.call(this, data);
    };
  }

  /**
   * Check if CSRF token should be added
   */
  shouldAddCSRFToken(url) {
    try {
      const urlObj = new URL(url, window.location.origin);
      
      // Only for same-origin requests
      if (urlObj.origin !== window.location.origin) {
        return false;
      }

      // Skip for GET requests (read-only)
      const method = this.getRequestMethod(url);
      if (method === 'GET') {
        return false;
      }

      // Skip for certain endpoints
      const skipPatterns = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/refresh',
        '/api/public/'
      ];

      return !skipPatterns.some(pattern => urlObj.pathname.includes(pattern));
    } catch (error) {
      return false;
    }
  }

  /**
   * Get request method from URL or options
   */
  getRequestMethod(url) {
    // This would need to be determined from context
    // For now, default to POST for state-changing operations
    return 'POST';
  }

  /**
   * Validate request CSRF token
   */
  validateRequest(request) {
    const token = this.getTokenFromRequest(request);
    return this.validateToken(token);
  }

  /**
   * Extract CSRF token from request
   */
  getTokenFromRequest(request) {
    // Try header first
    const headerToken = request.headers?.get(this.headerName);
    if (headerToken) {
      return headerToken;
    }

    // Try body (for form submissions)
    if (request.body && typeof request.body === 'object') {
      return request.body[this.tokenName];
    }

    return null;
  }

  /**
   * Middleware for Express.js (server-side)
   */
  middleware() {
    return (req, res, next) => {
      // Skip for GET requests
      if (req.method === 'GET') {
        return next();
      }

      // Skip for certain endpoints
      const skipPatterns = ['/api/auth/login', '/api/auth/register'];
      if (skipPatterns.some(pattern => req.path.includes(pattern))) {
        return next();
      }

      const token = this.getTokenFromRequest(req);
      
      if (!this.validateToken(token)) {
        return res.status(403).json({
          error: 'CSRF token validation failed',
          message: 'Invalid or missing CSRF token'
        });
      }

      next();
    };
  }

  /**
   * Generate double submit cookie pattern
   */
  generateDoubleSubmitCookie() {
    const token = this.generateToken();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 30); // 30 minutes

    // Set cookie
    document.cookie = `csrf_double_submit=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Strict; Secure`;
    
    return token;
  }

  /**
   * Validate double submit pattern
   */
  validateDoubleSubmit(request) {
    const cookieToken = this.getCookieValue('csrf_double_submit');
    const requestToken = this.getTokenFromRequest(request);
    
    return this.constantTimeCompare(cookieToken, requestToken);
  }

  /**
   * Get cookie value by name
   */
  getCookieValue(name) {
    const cookies = document.cookie.split(';');
    
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === name) {
        return cookieValue;
      }
    }
    
    return null;
  }

  /**
   * Clear CSRF tokens
   */
  clearTokens() {
    this.token = null;
    
    // Clear cookies
    document.cookie = `${this.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `csrf_double_submit=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  /**
   * Get CSRF protection status
   */
  getStatus() {
    return {
      token: this.token,
      tokenLength: this.token ? this.token.length : 0,
      isValid: this.token ? this.isTokenValid(this.token) : false,
      cookieToken: this.getTokenFromCookie(),
      config: {
        tokenName: this.tokenName,
        headerName: this.headerName,
        cookieName: this.cookieName
      }
    };
  }
}

export const csrfProtection = new CSRFProtection();

// Auto-initialize
if (typeof window !== 'undefined') {
  // Make available globally for AJAX overrides
  window.csrfProtection = csrfProtection;
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      csrfProtection.init();
    });
  } else {
    csrfProtection.init();
  }
}

export default csrfProtection;
