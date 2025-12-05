/**
 * Advanced Performance Monitoring and Optimization Utilities
 * Provides comprehensive performance tracking and optimization features
 */

import { handlePerformanceError } from './errorLogger';

// Performance metrics configuration
export const PERFORMANCE_CONFIG = {
  // Core Web Vitals thresholds
  thresholds: {
    LCP: 2500, // Largest Contentful Paint (ms)
    FID: 100,  // First Input Delay (ms)
    CLS: 0.1,  // Cumulative Layout Shift
    FCP: 1800, // First Contentful Paint (ms)
    TTFB: 800, // Time to First Byte (ms)
    INP: 200   // Interaction to Next Paint (ms)
  },
  
  // Custom performance metrics
  customMetrics: {
    apiResponseTime: 1000, // API response time (ms)
    imageLoadTime: 2000,   // Image load time (ms)
    componentRenderTime: 100, // Component render time (ms)
    routeChangeTime: 500   // Route change time (ms)
  },
  
  // Sampling configuration
  sampling: {
    coreWebVitals: 1.0,    // 100% sampling
    customMetrics: 0.1,    // 10% sampling
    userTiming: 0.01       // 1% sampling
  }
};

// Performance monitoring class
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.isInitialized = false;
    this.sessionId = this.generateSessionId();
    
    // Initialize monitoring
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }
  
  // Initialize performance monitoring
  initialize() {
    if (this.isInitialized) return;
    
    // Monitor Core Web Vitals
    this.observeCoreWebVitals();
    
    // Monitor resource loading
    this.observeResourceTiming();
    
    // Monitor long tasks
    this.observeLongTasks();
    
    // Monitor route changes
    this.observeRouteChanges();
    
    // Monitor API calls
    this.observeApiCalls();
    
    this.isInitialized = true;
  }
  
  // Generate unique session ID
  generateSessionId() {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Observe Core Web Vitals
  observeCoreWebVitals() {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('LCP', lastEntry.startTime, {
          element: lastEntry.element?.tagName,
          url: lastEntry.url
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', lcpObserver);
      
      // First Input Delay (FID) / Interaction to Next Paint (INP)
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === 'first-input') {
            this.recordMetric('FID', entry.processingStart - entry.startTime, {
              inputType: entry.name,
              startTime: entry.startTime
            });
          } else {
            this.recordMetric('INP', entry.processingStart - entry.startTime, {
              inputType: entry.name,
              startTime: entry.startTime
            });
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input', 'event'] });
      this.observers.set('fid', fidObserver);
      
      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.recordMetric('CLS', clsValue, {
              entry: entry.value,
              total: clsValue
            });
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('cls', clsObserver);
      
      // First Contentful Paint (FCP)
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          this.recordMetric('FCP', fcpEntry.startTime);
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
      this.observers.set('fcp', fcpObserver);
      
    } catch (error) {
      console.warn('Failed to observe Core Web Vitals:', error);
    }
  }
  
  // Observe resource loading performance
  observeResourceTiming() {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const resourceType = this.getResourceType(entry.name);
          const loadTime = entry.responseEnd - entry.startTime;
          
          this.recordMetric(`resource_${resourceType}`, loadTime, {
            name: entry.name,
            size: entry.transferSize,
            cached: entry.transferSize === 0 && entry.decodedBodySize > 0
          });
          
          // Track slow resources
          if (loadTime > PERFORMANCE_CONFIG.customMetrics.imageLoadTime && resourceType === 'image') {
            handlePerformanceError(`image_load_time`, loadTime, PERFORMANCE_CONFIG.customMetrics.imageLoadTime);
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
    } catch (error) {
      console.warn('Failed to observe resource timing:', error);
    }
  }
  
  // Observe long tasks
  observeLongTasks() {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.recordMetric('long_task', entry.duration, {
            startTime: entry.startTime,
            attribution: entry.attribution
          });
          
          // Report long tasks
          if (entry.duration > 50) {
            handlePerformanceError('long_task', entry.duration, 50);
          }
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.set('longtask', longTaskObserver);
    } catch (error) {
      console.warn('Failed to observe long tasks:', error);
    }
  }
  
  // Observe route changes
  observeRouteChanges() {
    // Monitor navigation timing
    const observeNavigation = () => {
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const navEntry = navigationEntries[navigationEntries.length - 1];
        
        this.recordMetric('page_load', navEntry.loadEventEnd - navEntry.startTime, {
          domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.startTime,
          domInteractive: navEntry.domInteractive - navEntry.startTime,
          domComplete: navEntry.domComplete - navEntry.startTime
        });
      }
    };
    
    // Initial page load
    if (document.readyState === 'complete') {
      observeNavigation();
    } else {
      window.addEventListener('load', observeNavigation);
    }
    
    // Monitor soft navigation (SPA route changes)
    let lastNavigationTime = performance.now();
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      const startTime = performance.now();
      const result = originalPushState.apply(this, args);
      
      setTimeout(() => {
        const navigationTime = performance.now() - startTime;
        this.recordMetric('route_change', navigationTime, {
          from: lastNavigationTime,
          to: startTime
        });
        lastNavigationTime = startTime;
      }, 0);
      
      return result;
    }.bind(this);
    
    history.replaceState = function(...args) {
      const startTime = performance.now();
      const result = originalReplaceState.apply(this, args);
      
      setTimeout(() => {
        const navigationTime = performance.now() - startTime;
        this.recordMetric('route_change', navigationTime, {
          from: lastNavigationTime,
          to: startTime
        });
        lastNavigationTime = startTime;
      }, 0);
      
      return result;
    }.bind(this);
  }
  
  // Observe API calls
  observeApiCalls() {
    // Override fetch to monitor API calls
    const originalFetch = window.fetch;
    
    window.fetch = async function(...args) {
      const startTime = performance.now();
      const url = args[0];
      
      try {
        const response = await originalFetch.apply(this, args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Only track API calls
        if (typeof url === 'string' && url.includes('/api/')) {
          performanceMonitor.recordMetric('api_call', duration, {
            url: url,
            method: args[1]?.method || 'GET',
            status: response.status,
            success: response.ok
          });
          
          // Track slow API calls
          if (duration > PERFORMANCE_CONFIG.customMetrics.apiResponseTime) {
            handlePerformanceError('api_response_time', duration, PERFORMANCE_CONFIG.customMetrics.apiResponseTime);
          }
        }
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (typeof url === 'string' && url.includes('/api/')) {
          performanceMonitor.recordMetric('api_call_error', duration, {
            url: url,
            method: args[1]?.method || 'GET',
            error: error.message
          });
        }
        
        throw error;
      }
    };
  }
  
  // Record performance metric
  recordMetric(name, value, metadata = {}) {
    const metric = {
      name,
      value,
      timestamp: performance.now(),
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      metadata
    };
    
    // Store metric
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name).push(metric);
    
    // Check thresholds
    const threshold = PERFORMANCE_CONFIG.thresholds[name];
    if (threshold && value > threshold) {
      handlePerformanceError(name, value, threshold);
    }
    
    // Emit metric for external monitoring
    this.emitMetric(metric);
  }
  
  // Get resource type from URL
  getResourceType(url) {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (/\.(png|jpe?g|gif|webp|avif)/.test(url)) return 'image';
    if (/\.(woff2?|ttf|eot)/.test(url)) return 'font';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }
  
  // Emit metric to external services
  emitMetric(metric) {
    // Send to analytics service
    if (window.gtag && Math.random() < PERFORMANCE_CONFIG.sampling.coreWebVitals) {
      window.gtag('event', 'web_vital', {
        event_category: 'Performance',
        event_label: metric.name,
        value: Math.round(metric.value),
        custom_map: { sessionId: metric.sessionId }
      });
    }
    
    // Send to custom monitoring endpoint
    if (import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true') {
      this.sendToMonitoringService(metric);
    }
  }
  
  // Send metric to monitoring service
  async sendToMonitoringService(metric) {
    const endpoint = import.meta.env.VITE_ERROR_REPORTING_ENDPOINT;
    if (!endpoint) return;
    
    try {
      await fetch(`${endpoint}/performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metric)
      });
    } catch (error) {
      console.warn('Failed to send performance metric:', error);
    }
  }
  
  // Get performance summary
  getPerformanceSummary() {
    const summary = {};
    
    this.metrics.forEach((metrics, name) => {
      const values = metrics.map(m => m.value);
      summary[name] = {
        count: values.length,
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        p50: this.percentile(values, 50),
        p75: this.percentile(values, 75),
        p90: this.percentile(values, 90),
        p95: this.percentile(values, 95)
      };
    });
    
    return summary;
  }
  
  // Calculate percentile
  percentile(values, p) {
    const sorted = values.slice().sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index];
  }
  
  // Clear metrics
  clearMetrics() {
    this.metrics.clear();
  }
  
  // Disconnect all observers
  disconnect() {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
    this.isInitialized = false;
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Performance utilities
export const performanceUtils = {
  // Measure function execution time
  measureFunction: (fn, name) => {
    return async (...args) => {
      const startTime = performance.now();
      try {
        const result = await fn(...args);
        const endTime = performance.now();
        performanceMonitor.recordMetric(`function_${name}`, endTime - startTime);
        return result;
      } catch (error) {
        const endTime = performance.now();
        performanceMonitor.recordMetric(`function_${name}_error`, endTime - startTime);
        throw error;
      }
    };
  },
  
  // Measure component render time
  measureComponent: (componentName) => {
    const startTime = performance.now();
    
    return {
      end: () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        performanceMonitor.recordMetric('component_render', renderTime, {
          component: componentName
        });
        
        if (renderTime > PERFORMANCE_CONFIG.customMetrics.componentRenderTime) {
          handlePerformanceError(`component_render_${componentName}`, renderTime, PERFORMANCE_CONFIG.customMetrics.componentRenderTime);
        }
        
        return renderTime;
      }
    };
  },
  
  // Mark performance milestones
  mark: (name) => {
    if ('performance' in window && 'mark' in performance) {
      performance.mark(name);
    }
  },
  
  // Measure time between marks
  measure: (name, startMark, endMark) => {
    if ('performance' in window && 'measure' in performance) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name, 'measure')[0];
        if (measure) {
          performanceMonitor.recordMetric(name, measure.duration);
        }
      } catch (error) {
        console.warn('Failed to measure performance:', error);
      }
    }
  },
  
  // Get memory usage (if available)
  getMemoryUsage: () => {
    if ('memory' in performance) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  },
  
  // Monitor memory usage
  monitorMemoryUsage: () => {
    const memory = performanceUtils.getMemoryUsage();
    if (memory) {
      const usageRatio = memory.used / memory.limit;
      performanceMonitor.recordMetric('memory_usage', usageRatio * 100, {
        used: memory.used,
        total: memory.total,
        limit: memory.limit
      });
      
      // Alert if memory usage is high
      if (usageRatio > 0.8) {
        handlePerformanceError('memory_usage', usageRatio * 100, 80);
      }
    }
  }
};

// React performance hooks
export const usePerformance = () => {
  const measureRender = (componentName) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      performanceMonitor.recordMetric('react_render', renderTime, {
        component: componentName
      });
    };
  };
  
  const measureEffect = (effectName, fn) => {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    
    performanceMonitor.recordMetric('react_effect', endTime - startTime, {
      effect: effectName
    });
    
    return result;
  };
  
  return {
    measureRender,
    measureEffect
  };
};

export default {
  performanceMonitor,
  performanceUtils,
  usePerformance,
  PERFORMANCE_CONFIG
};
