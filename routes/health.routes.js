/**
 * Health Check Routes
 * Comprehensive health monitoring endpoints
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const os = require('os');
const logger = require('../utils/logger');

/**
 * Basic health check
 * GET /api/health
 * This endpoint is used by Render and other platforms for health checks
 */
router.get('/', (req, res) => {
  try {
    // Quick response for health checks
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'ELP Backend API',
      version: '1.0.0',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

/**
 * Detailed health check
 * GET /api/health/detailed
 */
router.get('/detailed', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'ELP Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {}
  };

  // Database check
  try {
    const dbState = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    health.checks.database = {
      status: dbState === 1 ? 'healthy' : 'unhealthy',
      state: dbStates[dbState] || 'unknown',
      host: mongoose.connection.host || 'unknown',
      name: mongoose.connection.name || 'unknown'
    };

    if (dbState !== 1) {
      health.status = 'degraded';
    }
  } catch (error) {
    health.checks.database = {
      status: 'unhealthy',
      error: error.message
    };
    health.status = 'unhealthy';
  }

  // Memory check
  const memoryUsage = process.memoryUsage();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const memoryUsagePercent = ((totalMemory - freeMemory) / totalMemory * 100).toFixed(2);

  health.checks.memory = {
    status: memoryUsagePercent < 90 ? 'healthy' : 'warning',
    usage: {
      rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`
    },
    system: {
      total: `${(totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
      free: `${(freeMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
      usagePercent: `${memoryUsagePercent}%`
    }
  };

  if (memoryUsagePercent > 90) {
    health.status = health.status === 'healthy' ? 'warning' : health.status;
  }

  // CPU check
  const cpus = os.cpus();
  const loadAvg = os.loadavg();

  health.checks.cpu = {
    status: 'healthy',
    cores: cpus.length,
    loadAverage: {
      '1min': loadAvg[0].toFixed(2),
      '5min': loadAvg[1].toFixed(2),
      '15min': loadAvg[2].toFixed(2)
    },
    model: cpus[0]?.model || 'unknown'
  };

  // Disk space check (if available)
  try {
    // This is a simplified check - in production, use a proper disk space library
    health.checks.disk = {
      status: 'healthy',
      note: 'Disk space check requires additional library'
    };
  } catch (error) {
    health.checks.disk = {
      status: 'unknown',
      error: error.message
    };
  }

  // Environment check
  health.checks.environment = {
    status: 'healthy',
    nodeVersion: process.version,
    platform: os.platform(),
    arch: os.arch(),
    env: process.env.NODE_ENV || 'development'
  };

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'warning' ? 200 : 503;
  res.status(statusCode).json(health);
});

/**
 * Readiness check (for Kubernetes/Docker)
 * GET /api/health/ready
 */
router.get('/ready', async (req, res) => {
  try {
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'not ready',
        reason: 'Database not connected'
      });
    }

    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not ready',
      error: error.message
    });
  }
});

/**
 * Liveness check (for Kubernetes/Docker)
 * GET /api/health/live
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;

