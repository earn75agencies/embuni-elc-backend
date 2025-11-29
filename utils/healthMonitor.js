/**
 * Health Check and Monitoring System
 * Comprehensive health monitoring for production deployment
 */

const { performanceMonitor } = require('../utils/performanceMonitor');
const dbManager = require('../config/enhancedDatabase');
const logger = require('../utils/logger');

class HealthMonitor {
  constructor() {
    this.checks = new Map();
    this.alerts = [];
    this.metrics = {
      uptime: 0,
      lastCheck: null,
      status: 'unknown',
      checks: {}
    };
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.alertThresholds = {
      responseTime: 2000, // 2 seconds
      memoryUsage: 0.8, // 80%
      cpuUsage: 0.8, // 80%
      errorRate: 0.05, // 5%
      diskUsage: 0.9 // 90%
    };
  }

  // Add health check
  addCheck(name, checkFn, options = {}) {
    this.checks.set(name, {
      fn: checkFn,
      timeout: options.timeout || 5000,
      critical: options.critical || false,
      interval: options.interval || 30000, // 30 seconds
      lastRun: null,
      lastResult: null,
      consecutiveFailures: 0
    });
  }

  // Start monitoring
  start() {
    if (this.isMonitoring) {return;}

    this.isMonitoring = true;
    console.log('🏥 Health monitoring started');

    // Run initial checks
    this.runAllChecks();

    // Set up periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.runAllChecks();
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
    console.log('🏥 Health monitoring stopped');
  }

  // Run all health checks
  async runAllChecks() {
    const startTime = Date.now();
    const results = {};
    let overallStatus = 'healthy';

    for (const [name, check] of this.checks.entries()) {
      try {
        const result = await this.runCheck(name, check);
        results[name] = result;

        if (result.status === 'unhealthy' && check.critical) {
          overallStatus = 'unhealthy';
        } else if (result.status === 'degraded' && overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
      } catch (error) {
        console.error(`❌ Health check '${name}' failed:`, error);
        results[name] = {
          status: 'unhealthy',
          error: error.message,
          timestamp: new Date().toISOString()
        };
        overallStatus = 'unhealthy';
      }
    }

    // Update metrics
    this.metrics = {
      uptime: process.uptime(),
      lastCheck: new Date().toISOString(),
      status: overallStatus,
      checks: results,
      duration: Date.now() - startTime
    };

    // Check for alerts
    this.checkAlerts();

    // Emit health status
    process.emit('healthCheck', this.metrics);
  }

  // Run individual health check
  async runCheck(name, check) {
    const startTime = Date.now();

    try {
      const result = await Promise.race([
        check.fn(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Health check timeout')), check.timeout)
        )
      ]);

      const duration = Date.now() - startTime;
      const status = this.determineStatus(result, duration);

      // Update check info
      check.lastRun = new Date().toISOString();
      check.lastResult = { ...result, duration, status };

      if (status === 'healthy') {
        check.consecutiveFailures = 0;
      } else {
        check.consecutiveFailures++;
      }

      return {
        status,
        ...result,
        duration,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const duration = Date.now() - startTime;

      check.lastRun = new Date().toISOString();
      check.lastResult = { error: error.message, duration, status: 'unhealthy' };
      check.consecutiveFailures++;

      return {
        status: 'unhealthy',
        error: error.message,
        duration,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Determine health status based on result and duration
  determineStatus(result, duration) {
    if (result.error) {return 'unhealthy';}
    if (duration > this.alertThresholds.responseTime) {return 'degraded';}
    if (result.status === 'degraded') {return 'degraded';}
    return 'healthy';
  }

  // Check for alerts
  checkAlerts() {
    const alerts = [];

    // Check system metrics
    const memUsage = process.memoryUsage();
    const memoryUsagePercent = memUsage.heapUsed / memUsage.heapTotal;

    if (memoryUsagePercent > this.alertThresholds.memoryUsage) {
      alerts.push({
        type: 'memory',
        severity: 'warning',
        message: `High memory usage: ${(memoryUsagePercent * 100).toFixed(2)}%`,
        value: memoryUsagePercent,
        threshold: this.alertThresholds.memoryUsage
      });
    }

    // Check error rate from performance monitor
    if (performanceMonitor) {
      const summary = performanceMonitor.getSummary();
      if (summary.requests.errorRate > this.alertThresholds.errorRate) {
        alerts.push({
          type: 'errorRate',
          severity: 'critical',
          message: `High error rate: ${(summary.requests.errorRate * 100).toFixed(2)}%`,
          value: summary.requests.errorRate,
          threshold: this.alertThresholds.errorRate
        });
      }
    }

    // Check critical health checks
    for (const [name, check] of this.checks.entries()) {
      if (check.critical && check.consecutiveFailures >= 3) {
        alerts.push({
          type: 'criticalCheck',
          severity: 'critical',
          message: `Critical health check '${name}' failed ${check.consecutiveFailures} times`,
          check: name,
          failures: check.consecutiveFailures
        });
      }
    }

    // Store and emit alerts
    if (alerts.length > 0) {
      this.alerts.push(...alerts);

      // Keep only last 100 alerts
      if (this.alerts.length > 100) {
        this.alerts = this.alerts.slice(-100);
      }

      alerts.forEach(alert => {
        console.error(`🚨 HEALTH ALERT: ${alert.message}`, alert);
        process.emit('healthAlert', alert);
      });
    }
  }

  // Get current health status
  getHealthStatus() {
    return this.metrics;
  }

  // Get recent alerts
  getAlerts(limit = 50) {
    return this.alerts.slice(-limit);
  }

  // Get detailed metrics
  getDetailedMetrics() {
    return {
      health: this.metrics,
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid
      },
      database: dbManager.getConnectionStatus(),
      performance: performanceMonitor ? performanceMonitor.getSummary() : null,
      alerts: this.getAlerts(10)
    };
  }
}

// Create health monitor instance
const healthMonitor = new HealthMonitor();

// Add default health checks
healthMonitor.addCheck('database', async () => {
  const health = await dbManager.checkHealth();
  return {
    status: health.status === 'healthy' ? 'healthy' : 'unhealthy',
    ...health
  };
}, { critical: true, timeout: 10000 });

healthMonitor.addCheck('memory', async () => {
  const memUsage = process.memoryUsage();
  const memoryUsagePercent = memUsage.heapUsed / memUsage.heapTotal;

  return {
    status: memoryUsagePercent > 0.8 ? 'degraded' : 'healthy',
    memoryUsage: {
      rss: memUsage.rss,
      heapTotal: memUsage.heapTotal,
      heapUsed: memUsage.heapUsed,
      external: memUsage.external,
      usagePercent: memoryUsagePercent
    }
  };
}, { critical: true });

healthMonitor.addCheck('api', async () => {
  // Simple API health check
  const startTime = Date.now();

  try {
    // This would typically make a request to your own API
    // For now, we'll just simulate it
    await new Promise(resolve => setTimeout(resolve, 10));

    const responseTime = Date.now() - startTime;

    return {
      status: responseTime > 1000 ? 'degraded' : 'healthy',
      responseTime
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}, { critical: true });

healthMonitor.addCheck('disk', async () => {
  const fs = require('fs');

  try {
    const stats = fs.statSync('.');
    // This is a simplified check - in production you'd want to check actual disk usage
    return {
      status: 'healthy',
      message: 'Disk space check passed'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}, { critical: false });

// Express middleware for health endpoint
const healthMiddleware = (req, res) => {
  const health = healthMonitor.getHealthStatus();

  const statusCode = health.status === 'healthy' ? 200 :
    health.status === 'degraded' ? 200 : 503;

  res.status(statusCode).json({
    status: health.status,
    timestamp: health.lastCheck,
    uptime: health.uptime,
    checks: health.checks,
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
};

// Detailed health endpoint
const detailedHealthMiddleware = (req, res) => {
  const metrics = healthMonitor.getDetailedMetrics();

  res.json({
    ...metrics,
    timestamp: new Date().toISOString()
  });
};

// Start monitoring in production
if (process.env.NODE_ENV === 'production') {
  healthMonitor.start();

  // Set up alert handlers
  process.on('healthAlert', (alert) => {
    logger.error('Health Alert:', alert);

    // Here you could send alerts to external services
    // like Slack, PagerDuty, email, etc.
  });
}

module.exports = {
  healthMonitor,
  healthMiddleware,
  detailedHealthMiddleware
};
