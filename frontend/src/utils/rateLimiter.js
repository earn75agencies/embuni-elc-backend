/**
 * API Rate Limiting
 * Implements client-side rate limiting for API calls
 */

class RateLimiter {
  constructor(options = {}) {
    this.config = {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100,       // 100 requests per window
      ...options
    };
    
    this.requests = new Map();
    this.blockedEndpoints = new Map();
    this.retryAfter = new Map();
  }

  /**
   * Check if request is allowed
   */
  async checkLimit(endpoint, options = {}) {
    const key = this.getKey(endpoint, options);
    const now = Date.now();
    
    // Check if endpoint is currently blocked
    if (this.isBlocked(endpoint)) {
      const blockInfo = this.blockedEndpoints.get(endpoint);
      throw new RateLimitError(
        `Endpoint ${endpoint} is rate limited`,
        blockInfo.retryAfter,
        blockInfo.limit
      );
    }

    // Clean old requests
    this.cleanOldRequests(key, now);
    
    // Get current request count
    const requestCount = this.getRequestCount(key, now);
    
    if (requestCount >= this.config.maxRequests) {
      // Block the endpoint
      this.blockEndpoint(endpoint, now);
      
      const blockInfo = this.blockedEndpoints.get(endpoint);
      throw new RateLimitError(
        `Rate limit exceeded for ${endpoint}`,
        blockInfo.retryAfter,
        blockInfo.limit
      );
    }

    // Record this request
    this.recordRequest(key, now);
    
    return true;
  }

  /**
   * Get rate limit key for endpoint
   */
  getKey(endpoint, options) {
    const { userId = null, ip = null } = options;
    
    let key = endpoint;
    
    if (userId) {
      key += `:user:${userId}`;
    } else if (ip) {
      key += `:ip:${ip}`;
    }
    
    return key;
  }

  /**
   * Clean old requests outside the window
   */
  cleanOldRequests(key, now) {
    if (!this.requests.has(key)) {
      return;
    }

    const requests = this.requests.get(key);
    const windowStart = now - this.config.windowMs;
    
    // Filter requests within the window
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    
    if (validRequests.length === 0) {
      this.requests.delete(key);
    } else {
      this.requests.set(key, validRequests);
    }
  }

  /**
   * Get current request count
   */
  getRequestCount(key, now) {
    if (!this.requests.has(key)) {
      return 0;
    }

    const requests = this.requests.get(key);
    const windowStart = now - this.config.windowMs;
    
    return requests.filter(timestamp => timestamp > windowStart).length;
  }

  /**
   * Record a request
   */
  recordRequest(key, timestamp) {
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    this.requests.get(key).push(timestamp);
  }

  /**
   * Block an endpoint
   */
  blockEndpoint(endpoint, now) {
    const blockDuration = this.config.windowMs;
    const retryAfter = now + blockDuration;
    
    this.blockedEndpoints.set(endpoint, {
      blockedAt: now,
      retryAfter: retryAfter,
      limit: this.config.maxRequests,
      duration: blockDuration
    });

    // Auto-unblock after duration
    setTimeout(() => {
      this.unblockEndpoint(endpoint);
    }, blockDuration);
  }

  /**
   * Unblock an endpoint
   */
  unblockEndpoint(endpoint) {
    this.blockedEndpoints.delete(endpoint);
    console.log(`Endpoint unblocked: ${endpoint}`);
  }

  /**
   * Check if endpoint is blocked
   */
  isBlocked(endpoint) {
    const blockInfo = this.blockedEndpoints.get(endpoint);
    
    if (!blockInfo) {
      return false;
    }

    const now = Date.now();
    return now < blockInfo.retryAfter;
  }

  /**
   * Get remaining requests
   */
  getRemainingRequests(endpoint, options = {}) {
    const key = this.getKey(endpoint, options);
    const now = Date.now();
    
    this.cleanOldRequests(key, now);
    const currentCount = this.getRequestCount(key, now);
    
    return Math.max(0, this.config.maxRequests - currentCount);
  }

  /**
   * Get reset time
   */
  getResetTime(endpoint, options = {}) {
    const key = this.getKey(endpoint, options);
    
    if (!this.requests.has(key)) {
      return Date.now();
    }

    const requests = this.requests.get(key);
    if (requests.length === 0) {
      return Date.now();
    }

    const oldestRequest = Math.min(...requests);
    return oldestRequest + this.config.windowMs;
  }

  /**
   * Handle rate limit response from server
   */
  handleRateLimitResponse(endpoint, response) {
    const limit = response.headers.get('X-RateLimit-Limit');
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');
    const retryAfter = response.headers.get('Retry-After');

    if (response.status === 429 || limit) {
      const retryAfterTime = retryAfter ? 
        parseInt(retryAfter) * 1000 : 
        (reset ? parseInt(reset) * 1000 : Date.now() + this.config.windowMs);

      this.blockedEndpoints.set(endpoint, {
        blockedAt: Date.now(),
        retryAfter: retryAfterTime,
        limit: limit ? parseInt(limit) : this.config.maxRequests,
        remaining: remaining ? parseInt(remaining) : 0,
        serverSide: true
      });

      // Auto-unblock
      setTimeout(() => {
        this.unblockEndpoint(endpoint);
      }, retryAfterTime - Date.now());
    }
  }

  /**
   * Create rate limited fetch wrapper
   */
  createRateLimitedFetch() {
    return async (url, options = {}) => {
      const endpoint = new URL(url).pathname;
      
      try {
        await this.checkLimit(endpoint, {
          userId: options.userId,
          ip: options.ip
        });
      } catch (error) {
        if (error instanceof RateLimitError) {
          // Return rate limit response
          return new Response(
            JSON.stringify({
              error: 'Rate limit exceeded',
              message: error.message,
              retryAfter: error.retryAfter,
              limit: error.limit
            }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': Math.ceil((error.retryAfter - Date.now()) / 1000).toString()
              }
            }
          );
        }
        throw error;
      }

      // Make the actual request
      const response = await fetch(url, options);
      
      // Handle server-side rate limiting
      this.handleRateLimitResponse(endpoint, response);
      
      return response;
    };
  }

  /**
   * Get rate limit status
   */
  getStatus(endpoint, options = {}) {
    const key = this.getKey(endpoint, options);
    const now = Date.now();
    
    this.cleanOldRequests(key, now);
    
    return {
      limit: this.config.maxRequests,
      remaining: this.getRemainingRequests(endpoint, options),
      resetTime: this.getResetTime(endpoint, options),
      isBlocked: this.isBlocked(endpoint),
      blockInfo: this.blockedEndpoints.get(endpoint)
    };
  }

  /**
   * Reset rate limiter
   */
  reset(endpoint = null) {
    if (endpoint) {
      // Reset specific endpoint
      this.requests.delete(endpoint);
      this.unblockEndpoint(endpoint);
    } else {
      // Reset all
      this.requests.clear();
      this.blockedEndpoints.clear();
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    const now = Date.now();
    let totalRequests = 0;
    let activeEndpoints = 0;
    
    for (const [key, requests] of this.requests) {
      this.cleanOldRequests(key, now);
      totalRequests += requests.length;
      if (requests.length > 0) {
        activeEndpoints++;
      }
    }

    return {
      totalRequests,
      activeEndpoints,
      blockedEndpoints: this.blockedEndpoints.size,
      config: this.config
    };
  }
}

/**
 * Rate Limit Error
 */
class RateLimitError extends Error {
  constructor(message, retryAfter, limit) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    this.limit = limit;
  }
}

// Create global rate limiter instance
export const rateLimiter = new RateLimiter();

// Create rate limited fetch
export const rateLimitedFetch = rateLimiter.createRateLimitedFetch();

export { RateLimitError };
export default rateLimiter;
