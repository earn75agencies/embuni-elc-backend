/**
 * JWT Token Management with Refresh Mechanism
 * Handles token refresh, rotation, and secure storage
 */

class TokenManager {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.refreshPromise = null;
    this.listeners = new Set();
    this.storageKey = 'elp_tokens';
  }

  /**
   * Initialize token manager
   */
  init() {
    this.loadTokensFromStorage();
    this.setupTokenRefresh();
    this.setupVisibilityChange();
  }

  /**
   * Set tokens after successful authentication
   */
  setTokens(accessToken, refreshToken, expiresIn) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.tokenExpiry = Date.now() + (expiresIn * 1000);
    
    this.saveTokensToStorage();
    this.notifyListeners('tokensUpdated', { accessToken, refreshToken });
  }

  /**
   * Get current access token
   */
  async getAccessToken() {
    // Check if token is expired
    if (this.isTokenExpired()) {
      await this.refreshAccessToken();
    }
    
    return this.accessToken;
  }

  /**
   * Check if access token is expired
   */
  isTokenExpired() {
    if (!this.accessToken || !this.tokenExpiry) {
      return true;
    }
    
    // Add 5-minute buffer
    return Date.now() >= (this.tokenExpiry - 5 * 60 * 1000);
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken() {
    // Prevent multiple refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const result = await this.refreshPromise;
      this.setTokens(result.accessToken, result.refreshToken, result.expiresIn);
      this.notifyListeners('tokenRefreshed', result);
      return result.accessToken;
    } catch (error) {
      this.handleRefreshFailure(error);
      throw error;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Perform actual token refresh
   */
  async performTokenRefresh() {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refreshToken: this.refreshToken
      })
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Token refresh failed');
    }

    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken || this.refreshToken,
      expiresIn: data.expiresIn
    };
  }

  /**
   * Handle refresh failure
   */
  handleRefreshFailure(error) {
    console.error('Token refresh failed:', error);
    
    // Clear invalid tokens
    this.clearTokens();
    
    // Notify listeners
    this.notifyListeners('refreshFailed', error);
    
    // Redirect to login if needed
    if (error.message.includes('invalid') || error.message.includes('expired')) {
      this.redirectToLogin();
    }
  }

  /**
   * Setup automatic token refresh
   */
  setupTokenRefresh() {
    // Check token expiry every minute
    setInterval(() => {
      if (this.isTokenExpired() && this.refreshToken) {
        this.refreshAccessToken().catch(error => {
          console.error('Auto refresh failed:', error);
        });
      }
    }, 60000);
  }

  /**
   * Setup visibility change handler
   */
  setupVisibilityChange() {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isTokenExpired()) {
        this.refreshAccessToken().catch(error => {
          console.error('Visibility refresh failed:', error);
        });
      }
    });
  }

  /**
   * Save tokens to secure storage
   */
  saveTokensToStorage() {
    const tokenData = {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      tokenExpiry: this.tokenExpiry
    };

    try {
      // Use secure storage if available
      if (this.isSecureStorageAvailable()) {
        sessionStorage.setItem(this.storageKey, JSON.stringify(tokenData));
      } else {
        // Fallback to regular storage with encryption
        localStorage.setItem(this.storageKey, this.encryptData(tokenData));
      }
    } catch (error) {
      console.error('Failed to save tokens:', error);
    }
  }

  /**
   * Load tokens from storage
   */
  loadTokensFromStorage() {
    try {
      let tokenData;
      
      // Try secure storage first
      if (this.isSecureStorageAvailable()) {
        const stored = sessionStorage.getItem(this.storageKey);
        if (stored) {
          tokenData = JSON.parse(stored);
        }
      } else {
        // Try encrypted storage
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          tokenData = this.decryptData(stored);
        }
      }

      if (tokenData) {
        this.accessToken = tokenData.accessToken;
        this.refreshToken = tokenData.refreshToken;
        this.tokenExpiry = tokenData.tokenExpiry;
      }
    } catch (error) {
      console.error('Failed to load tokens:', error);
      this.clearTokens();
    }
  }

  /**
   * Check if secure storage is available
   */
  isSecureStorageAvailable() {
    try {
      sessionStorage.setItem('test', 'test');
      sessionStorage.removeItem('test');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Encrypt data for storage
   */
  encryptData(data) {
    // Simple encryption - in production, use proper encryption
    const encoded = JSON.stringify(data);
    return btoa(encoded);
  }

  /**
   * Decrypt data from storage
   */
  decryptData(encryptedData) {
    try {
      const decoded = atob(encryptedData);
      return JSON.parse(decoded);
    } catch (error) {
      return null;
    }
  }

  /**
   * Clear all tokens
   */
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    
    try {
      sessionStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
    
    this.notifyListeners('tokensCleared');
  }

  /**
   * Redirect to login
   */
  redirectToLogin() {
    const currentUrl = window.location.pathname + window.location.search;
    window.location.href = `/login?redirect=${encodeURIComponent(currentUrl)}`;
  }

  /**
   * Add event listener
   */
  addListener(event, callback) {
    this.listeners.add({ event, callback });
  }

  /**
   * Remove event listener
   */
  removeListener(event, callback) {
    this.listeners.forEach(listener => {
      if (listener.event === event && listener.callback === callback) {
        this.listeners.delete(listener);
      }
    });
  }

  /**
   * Notify all listeners
   */
  notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      if (listener.event === event) {
        try {
          listener.callback(data);
        } catch (error) {
          console.error('Listener error:', error);
        }
      }
    });
  }

  /**
   * Get token info
   */
  getTokenInfo() {
    if (!this.accessToken) {
      return null;
    }

    try {
      const payload = this.accessToken.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      
      return {
        userId: decoded.sub,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions,
        issuedAt: decoded.iat,
        expiresAt: decoded.exp
      };
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  /**
   * Validate token structure
   */
  validateToken(token) {
    if (!token || typeof token !== 'string') {
      return false;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    try {
      // Validate header
      const header = JSON.parse(atob(parts[0]));
      if (!header.alg || !header.typ) {
        return false;
      }

      // Validate payload
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp || !payload.iat) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Setup token rotation for enhanced security
   */
  setupTokenRotation() {
    // Rotate tokens every 30 minutes
    setInterval(async () => {
      if (this.accessToken && this.refreshToken) {
        try {
          await this.refreshAccessToken();
          console.log('Token rotated successfully');
        } catch (error) {
          console.error('Token rotation failed:', error);
        }
      }
    }, 30 * 60 * 1000);
  }
}

export const tokenManager = new TokenManager();

// Auto-initialize
if (typeof window !== 'undefined') {
  tokenManager.init();
}

export default tokenManager;
