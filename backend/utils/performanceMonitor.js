/**
 * Enhanced Performance Monitoring
 * Comprehensive performance tracking and optimization for backend
 */

const { performance } = require('perf_hooks');
const { EventEmitter } = require('events');

class PerformanceMonitor extends EventEmitter {
  constructor() {
    super();
    this.metrics = new Map();
    this.slowQueries = [];
    this.memoryUsage = [];
    this.requestTimes = [];
    this.errorCounts = new Map();
    this.alertThresholds = {
      responseTime: 2000, // 2 seconds
      memoryUsage: 0.8, // 80% of available memory
      errorRate: 0.05, // 5% error rate
      cpuUsage: 0.8 // 80% CPU usage
    };
    this.isMonitoring = false;
    this.monitoringInterval = null;
  }

  // Start monitoring
  start() {
    if (this.isMonitoring) {return;}

    this.isMonitoring = true;
    console.log('🚀 Performance monitoring started');

    // Start periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.collectSystemMetrics();
      this.checkAlerts();
    }, 30000); // Every 30 seconds

    // Handle process exit
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
  }

  // Stop monitoring
  stop() {
    if (!this.isMonitoring) {return;}

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    console.log('⏹️ Performance monitoring stopped');
  }

  // Record request metrics
  recordRequest(req, res, responseTime) {
    const metric = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime,
      timestamp: Date.now(),
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      contentLength: res.get('Content-Length') || 0
    };

    // Store request time
    this.requestTimes.push(metric);

    // Keep only last 1000 requests
    if (this.requestTimes.length > 1000) {
      this.requestTimes = this.requestTimes.slice(-1000);
    }

    // Track errors
    if (res.statusCode >= 400) {
      const errorKey = `${req.method} ${req.path}`;
      this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);
    }

    // Log slow requests
    if (responseTime > this.alertThresholds.responseTime) {
      console.warn(`🐌 Slow request: ${req.method} ${req.path} - ${responseTime}ms`);
      this.emit('slowRequest', metric);
    }

    // Update path-specific metrics
    const pathKey = `${req.method} ${req.path}`;
    if (!this.metrics.has(pathKey)) {
      this.metrics.set(pathKey, {
        count: 0,
        totalTime: 0,
        minTime: Infinity,
        maxTime: 0,
        errors: 0
      });
    }

    const pathMetric = this.metrics.get(pathKey);
    pathMetric.count++;
    pathMetric.totalTime += responseTime;
    pathMetric.minTime = Math.min(pathMetric.minTime, responseTime);
    pathMetric.maxTime = Math.max(pathMetric.maxTime, responseTime);

    if (res.statusCode >= 400) {
      pathMetric.errors++;
    }
  }

  // Record database query
  recordQuery(query, duration, error = null) {
    const queryMetric = {
      query: query.substring(0, 200), // Truncate long queries
      duration,
      timestamp: Date.now(),
      error: error ? error.message : null
    };

    // Track slow queries
    if (duration > 1000) { // Queries over 1 second
      this.slowQueries.push(queryMetric);
      console.warn(`🐌 Slow query (${duration}ms): ${query.substring(0, 100)}...`);
      this.emit('slowQuery', queryMetric);
    }

    // Keep only last 100 slow queries
    if (this.slowQueries.length > 100) {
      this.slowQueries = this.slowQueries.slice(-100);
    }
  }

  // Record custom metric
  recordMetric(name, value, tags = {}) {
    const metric = {
      name,
      value,
      tags,
      timestamp: Date.now()
    };

    this.emit('metric', metric);

    // Log significant metrics
    if (name.includes('error') || name.includes('slow')) {
      console.log(`📊 Metric: ${name} = ${value}`, tags);
    }
  }

  // Collect system metrics
  collectSystemMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const systemMetric = {
      timestamp: Date.now(),
      memory: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      uptime: process.uptime(),
      loadAverage: require('os').loadavg()
    };

    this.memoryUsage.push(systemMetric);

    // Keep only last 100 entries
    if (this.memoryUsage.length > 100) {
      this.memoryUsage = this.memoryUsage.slice(-100);
    }

    this.emit('systemMetrics', systemMetric);
  }

  // Check for alerts
  checkAlerts() {
    // Check memory usage
    const memUsage = process.memoryUsage();
    const memoryUsagePercent = memUsage.heapUsed / memUsage.heapTotal;

    if (memoryUsagePercent > this.alertThresholds.memoryUsage) {
      this.emit('alert', {
        type: 'memory',
        message: `High memory usage: ${(memoryUsagePercent * 100).toFixed(2)}%`,
        value: memoryUsagePercent,
        threshold: this.alertThresholds.memoryUsage
      });
    }

    // Check error rate
    const recentRequests = this.requestTimes.slice(-100); // Last 100 requests
    if (recentRequests.length > 0) {
      const errorRate = recentRequests.filter(r => r.statusCode >= 400).length / recentRequests.length;

      if (errorRate > this.alertThresholds.errorRate) {
        this.emit('alert', {
          type: 'errorRate',
          message: `High error rate: ${(errorRate * 100).toFixed(2)}%`,
          value: errorRate,
          threshold: this.alertThresholds.errorRate
        });
      }
    }

    // Check average response time
    if (recentRequests.length > 10) {
      const avgResponseTime = recentRequests.reduce((sum, r) => sum + r.responseTime, 0) / recentRequests.length;

      if (avgResponseTime > this.alertThresholds.responseTime) {
        this.emit('alert', {
          type: 'responseTime',
          message: `High average response time: ${avgResponseTime.toFixed(2)}ms`,
          value: avgResponseTime,
          threshold: this.alertThresholds.responseTime
        });
      }
    }
  }

  // Get performance summary
  getSummary() {
    const summary = {
      timestamp: Date.now(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      requests: {
        total: this.requestTimes.length,
        averageResponseTime: this.requestTimes.length > 0
          ? this.requestTimes.reduce((sum, r) => sum + r.responseTime, 0) / this.requestTimes.length
          : 0,
        errorRate: this.requestTimes.length > 0
          ? this.requestTimes.filter(r => r.statusCode >= 400).length / this.requestTimes.length
          : 0
      },
      slowQueries: this.slowQueries.length,
      topEndpoints: this.getTopEndpoints(),
      recentErrors: this.getRecentErrors()
    };

    return summary;
  }

  // Get top endpoints by request count
  getTopEndpoints(limit = 10) {
    const endpointCounts = new Map();

    this.requestTimes.forEach(req => {
      const key = `${req.method} ${req.path}`;
      endpointCounts.set(key, (endpointCounts.get(key) || 0) + 1);
    });

    return Array.from(endpointCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([endpoint, count]) => ({ endpoint, count }));
  }

  // Get recent errors
  getRecentErrors(limit = 10) {
    return this.requestTimes
      .filter(req => req.statusCode >= 400)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
      .map(req => ({
        method: req.method,
        path: req.path,
        statusCode: req.statusCode,
        timestamp: req.timestamp,
        responseTime: req.responseTime
      }));
  }

  // Get detailed metrics for a specific endpoint
  getEndpointMetrics(method, path) {
    const key = `${method} ${path}`;
    return this.metrics.get(key) || null;
  }

  // Export metrics for external monitoring
  exportMetrics() {
    return {
      summary: this.getSummary(),
      requests: this.requestTimes.slice(-100), // Last 100 requests
      slowQueries: this.slowQueries,
      systemMetrics: this.memoryUsage.slice(-10), // Last 10 system metrics
      endpointMetrics: Object.fromEntries(this.metrics)
    };
  }

  // Reset metrics
  reset() {
    this.metrics.clear();
    this.slowQueries = [];
    this.memoryUsage = [];
    this.requestTimes = [];
    this.errorCounts.clear();
    console.log('📊 Performance metrics reset');
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Express middleware for automatic request tracking
const requestTracker = (req, res, next) => {
  const startTime = performance.now();

  // Track response
  res.on('finish', () => {
    const responseTime = performance.now() - startTime;
    performanceMonitor.recordRequest(req, res, responseTime);
  });

  next();
};

// Database query tracker
const queryTracker = (queryFn) => {
  return async (...args) => {
    const startTime = performance.now();
    try {
      const result = await queryFn(...args);
      const duration = performance.now() - startTime;
      performanceMonitor.recordQuery(args[0], duration);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      performanceMonitor.recordQuery(args[0], duration, error);
      throw error;
    }
  };
};

// Start monitoring in production
if (process.env.NODE_ENV === 'production') {
  performanceMonitor.start();

  // Set up alert handlers
  performanceMonitor.on('alert', (alert) => {
    console.error(`🚨 PERFORMANCE ALERT: ${alert.message}`, alert);

    // Here you could send alerts to external services
    // like Slack, PagerDuty, etc.
  });

  performanceMonitor.on('slowRequest', (metric) => {
    console.warn('🐌 Slow request detected:', metric);
  });

  performanceMonitor.on('slowQuery', (metric) => {
    console.warn('🐌 Slow query detected:', metric);
  });
}

module.exports = {
  performanceMonitor,
  requestTracker,
  queryTracker
};
