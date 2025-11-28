/**
 * CDN Configuration and Management
 * Handles CDN integration, fallbacks, and optimization
 */

class CDNManager {
  constructor() {
    this.cdnEndpoints = [
      'https://cdn1.example.com',
      'https://cdn2.example.com',
      'https://cdn3.example.com'
    ];
    this.currentCDN = 0;
    this.failedCDNs = new Set();
    this.performanceMetrics = new Map();
  }

  /**
   * Get optimal CDN endpoint
   */
  getCDNEndpoint() {
    // Try healthy CDNs first
    const healthyCDNs = this.cdnEndpoints.filter(
      endpoint => !this.failedCDNs.has(endpoint)
    );
    
    if (healthyCDNs.length === 0) {
      // All CDNs failed, reset and try again
      this.failedCDNs.clear();
      return this.cdnEndpoints[0];
    }
    
    // Use round-robin for healthy CDNs
    const endpoint = healthyCDNs[this.currentCDN % healthyCDNs.length];
    this.currentCDN++;
    return endpoint;
  }

  /**
   * Build CDN URL for asset
   */
  buildCDNUrl(assetPath, options = {}) {
    const cdnEndpoint = this.getCDNEndpoint();
    const url = new URL(assetPath, cdnEndpoint);
    
    // Add optimization parameters
    if (options.quality) {
      url.searchParams.set('q', options.quality);
    }
    
    if (options.width) {
      url.searchParams.set('w', options.width);
    }
    
    if (options.height) {
      url.searchParams.set('h', options.height);
    }
    
    if (options.format) {
      url.searchParams.set('f', options.format);
    }
    
    if (options.crop) {
      url.searchParams.set('c', options.crop);
    }
    
    return url.toString();
  }

  /**
   * Load asset from CDN with fallback
   */
  async loadAsset(assetPath, options = {}) {
    const cdnUrl = this.buildCDNUrl(assetPath, options);
    
    try {
      const startTime = performance.now();
      const response = await fetch(cdnUrl);
      const endTime = performance.now();
      
      if (response.ok) {
        this.recordPerformance(cdnUrl, endTime - startTime, true);
        return response;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      this.recordFailure(cdnUrl);
      return this.loadWithFallback(assetPath, options);
    }
  }

  /**
   * Fallback to origin or next CDN
   */
  async loadWithFallback(assetPath, options = {}) {
    // Try next CDN
    if (this.failedCDNs.size < this.cdnEndpoints.length - 1) {
      return this.loadAsset(assetPath, options);
    }
    
    // Fallback to origin
    try {
      const originUrl = new URL(assetPath, window.location.origin);
      return await fetch(originUrl.toString());
    } catch (error) {
      console.error('All CDN and origin failed:', error);
      throw error;
    }
  }

  /**
   * Record CDN performance
   */
  recordPerformance(url, loadTime, success) {
    const cdnEndpoint = new URL(url).origin;
    
    if (!this.performanceMetrics.has(cdnEndpoint)) {
      this.performanceMetrics.set(cdnEndpoint, {
        totalRequests: 0,
        successfulRequests: 0,
        totalLoadTime: 0,
        averageLoadTime: 0
      });
    }
    
    const metrics = this.performanceMetrics.get(cdnEndpoint);
    metrics.totalRequests++;
    
    if (success) {
      metrics.successfulRequests++;
      metrics.totalLoadTime += loadTime;
      metrics.averageLoadTime = metrics.totalLoadTime / metrics.successfulRequests;
    }
  }

  /**
   * Record CDN failure
   */
  recordFailure(url) {
    const cdnEndpoint = new URL(url).origin;
    this.failedCDNs.add(cdnEndpoint);
    
    console.warn(`CDN endpoint failed: ${cdnEndpoint}`);
    
    // Reset failure after timeout
    setTimeout(() => {
      this.failedCDNs.delete(cdnEndpoint);
    }, 60000); // 1 minute
  }

  /**
   * Preload critical assets from CDN
   */
  async preloadCriticalAssets(assets) {
    const preloadPromises = assets.map(async asset => {
      try {
        await this.loadAsset(asset.path, asset.options);
      } catch (error) {
        console.warn(`Failed to preload ${asset.path}:`, error);
      }
    });
    
    await Promise.allSettled(preloadPromises);
  }

  /**
   * Get CDN performance report
   */
  getPerformanceReport() {
    const report = {};
    
    this.performanceMetrics.forEach((metrics, endpoint) => {
      report[endpoint] = {
        ...metrics,
        successRate: (metrics.successfulRequests / metrics.totalRequests) * 100,
        status: this.getCDNStatus(metrics)
      };
    });
    
    return report;
  }

  /**
   * Get CDN status based on metrics
   */
  getCDNStatus(metrics) {
    if (metrics.successRate < 90) return 'poor';
    if (metrics.successRate < 95) return 'warning';
    if (metrics.averageLoadTime > 1000) return 'slow';
    return 'healthy';
  }

  /**
   * Optimize image URL for CDN
   */
  optimizeImageUrl(src, options = {}) {
    if (!src || src.startsWith('data:')) {
      return src;
    }
    
    const defaultOptions = {
      quality: 80,
      format: 'auto', // auto, webp, avif
      width: null,
      height: null,
      crop: false
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    return this.buildCDNUrl(src, mergedOptions);
  }

  /**
   * Initialize CDN system
   */
  init() {
    // Test CDN endpoints on startup
    this.testCDNEndpoints();
    
    // Monitor CDN performance
    this.startPerformanceMonitoring();
    
    // Setup error handling
    this.setupErrorHandling();
  }

  /**
   * Test all CDN endpoints
   */
  async testCDNEndpoints() {
    const testPromises = this.cdnEndpoints.map(async endpoint => {
      try {
        const startTime = performance.now();
        const response = await fetch(`${endpoint}/health`, {
          method: 'HEAD',
          cache: 'no-cache'
        });
        const endTime = performance.now();
        
        if (response.ok) {
          this.recordPerformance(endpoint, endTime - startTime, true);
        } else {
          this.recordFailure(endpoint);
        }
      } catch (error) {
        this.recordFailure(endpoint);
      }
    });
    
    await Promise.allSettled(testPromises);
  }

  /**
   * Start performance monitoring
   */
  startPerformanceMonitoring() {
    setInterval(() => {
      const report = this.getPerformanceReport();
      console.log('CDN Performance Report:', report);
    }, 300000); // Every 5 minutes
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    window.addEventListener('error', (event) => {
      if (event.target && event.target.tagName === 'IMG') {
        const src = event.target.src;
        if (this.cdnEndpoints.some(endpoint => src.includes(endpoint))) {
          this.recordFailure(src);
          // Try to reload from different CDN
          event.target.src = this.buildCDNUrl(src);
        }
      }
    });
  }
}

export const cdnManager = new CDNManager();

// Auto-initialize
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      cdnManager.init();
    });
  } else {
    cdnManager.init();
  }
}

export default cdnManager;
