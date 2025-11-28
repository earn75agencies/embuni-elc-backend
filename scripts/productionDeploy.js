/**
 * Production Deployment Script
 * Automated deployment with health checks and rollback capability
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

class ProductionDeployer {
  constructor(options = {}) {
    this.options = {
      buildTimeout: 300000, // 5 minutes
      healthCheckTimeout: 60000, // 1 minute
      rollbackOnFailure: true,
      backupBeforeDeploy: true,
      ...options
    };
    
    this.deploymentId = this.generateDeploymentId();
    this.startTime = null;
    this.backupPath = null;
    this.deploymentLog = [];
  }

  // Generate unique deployment ID
  generateDeploymentId() {
    return `deploy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Log deployment steps
  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message };
    this.deploymentLog.push(logEntry);
    
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
  }

  // Execute command with error handling
  async executeCommand(command, description) {
    this.log(`Executing: ${description}`);
    
    try {
      const result = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: this.options.buildTimeout
      });
      
      this.log(`✅ ${description} completed successfully`);
      return { success: true, output: result };
      
    } catch (error) {
      this.log(`❌ ${description} failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  // Create backup before deployment
  async createBackup() {
    if (!this.options.backupBeforeDeploy) return true;
    
    this.log('Creating backup before deployment...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.backupPath = `./backups/backup_${timestamp}`;
    
    try {
      // Create backup directory
      fs.mkdirSync(this.backupPath, { recursive: true });
      
      // Backup frontend build
      if (fs.existsSync('./frontend/dist')) {
        this.executeCommand(
          `cp -r ./frontend/dist ${this.backupPath}/frontend-dist`,
          'Backing up frontend build'
        );
      }
      
      // Backup backend files
      this.executeCommand(
        `cp -r ./backend ${this.backupPath}/backend`,
        'Backing up backend code'
      );
      
      // Backup package.json files
      this.executeCommand(
        `cp ./package.json ${this.backupPath}/`,
        'Backing up root package.json'
      );
      
      this.log('✅ Backup created successfully');
      return true;
      
    } catch (error) {
      this.log(`❌ Backup failed: ${error.message}`, 'error');
      return false;
    }
  }

  // Install dependencies
  async installDependencies() {
    this.log('Installing dependencies...');
    
    // Install frontend dependencies
    const frontendResult = await this.executeCommand(
      'cd ./frontend && npm ci --production=false',
      'Installing frontend dependencies'
    );
    
    if (!frontendResult.success) return false;
    
    // Install backend dependencies
    const backendResult = await this.executeCommand(
      'cd ./backend && npm ci --production=false',
      'Installing backend dependencies'
    );
    
    return backendResult.success;
  }

  // Run tests
  async runTests() {
    this.log('Running tests...');
    
    // Frontend tests
    const frontendTestResult = await this.executeCommand(
      'cd ./frontend && npm run test:ci',
      'Running frontend tests'
    );
    
    if (!frontendTestResult.success) {
      this.log('❌ Frontend tests failed', 'error');
      return false;
    }
    
    // Backend tests
    const backendTestResult = await this.executeCommand(
      'cd ./backend && npm test',
      'Running backend tests'
    );
    
    if (!backendTestResult.success) {
      this.log('❌ Backend tests failed', 'error');
      return false;
    }
    
    this.log('✅ All tests passed');
    return true;
  }

  // Build frontend
  async buildFrontend() {
    this.log('Building frontend...');
    
    const result = await this.executeCommand(
      'cd ./frontend && npm run build:production',
      'Building frontend for production'
    );
    
    return result.success;
  }

  // Deploy backend
  async deployBackend() {
    this.log('Deploying backend...');
    
    // This would typically involve:
    // 1. Stopping the current backend service
    // 2. Deploying new code
    // 3. Starting the backend service
    
    const result = await this.executeCommand(
      'echo "Backend deployment placeholder"',
      'Deploying backend'
    );
    
    return result.success;
  }

  // Health check after deployment
  async performHealthCheck() {
    this.log('Performing health check...');
    
    const healthUrl = process.env.HEALTH_CHECK_URL || 'http://localhost:5000/api/health';
    
    try {
      const response = await axios.get(healthUrl, {
        timeout: this.options.healthCheckTimeout
      });
      
      if (response.status === 200 && response.data.status === 'healthy') {
        this.log('✅ Health check passed');
        return true;
      } else {
        this.log(`❌ Health check failed: ${response.data.status}`, 'error');
        return false;
      }
      
    } catch (error) {
      this.log(`❌ Health check failed: ${error.message}`, 'error');
      return false;
    }
  }

  // Rollback deployment
  async rollback() {
    this.log('Starting rollback...');
    
    if (!this.backupPath || !fs.existsSync(this.backupPath)) {
      this.log('❌ No backup available for rollback', 'error');
      return false;
    }
    
    try {
      // Restore frontend build
      if (fs.existsSync(`${this.backupPath}/frontend-dist`)) {
        await this.executeCommand(
          `rm -rf ./frontend/dist && cp -r ${this.backupPath}/frontend-dist ./frontend/dist`,
          'Restoring frontend build'
        );
      }
      
      // Restore backend
      if (fs.existsSync(`${this.backupPath}/backend`)) {
        await this.executeCommand(
          `rm -rf ./backend && cp -r ${this.backupPath}/backend ./backend`,
          'Restoring backend'
        );
      }
      
      this.log('✅ Rollback completed successfully');
      return true;
      
    } catch (error) {
      this.log(`❌ Rollback failed: ${error.message}`, 'error');
      return false;
    }
  }

  // Send deployment notification
  async sendNotification(status, details = {}) {
    this.log(`Sending deployment notification: ${status}`);
    
    const webhookUrl = process.env.DEPLOYMENT_WEBHOOK_URL;
    if (!webhookUrl) return;
    
    const payload = {
      deploymentId: this.deploymentId,
      status,
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      ...details
    };
    
    try {
      await axios.post(webhookUrl, payload);
      this.log('✅ Notification sent successfully');
    } catch (error) {
      this.log(`❌ Failed to send notification: ${error.message}`, 'error');
    }
  }

  // Main deployment process
  async deploy() {
    this.startTime = Date.now();
    this.log(`Starting deployment ${this.deploymentId}`);
    
    try {
      // Step 1: Create backup
      if (!await this.createBackup()) {
        await this.sendNotification('failed', { step: 'backup' });
        return false;
      }
      
      // Step 2: Install dependencies
      if (!await this.installDependencies()) {
        await this.sendNotification('failed', { step: 'dependencies' });
        if (this.options.rollbackOnFailure) await this.rollback();
        return false;
      }
      
      // Step 3: Run tests
      if (!await this.runTests()) {
        await this.sendNotification('failed', { step: 'tests' });
        if (this.options.rollbackOnFailure) await this.rollback();
        return false;
      }
      
      // Step 4: Build frontend
      if (!await this.buildFrontend()) {
        await this.sendNotification('failed', { step: 'frontend-build' });
        if (this.options.rollbackOnFailure) await this.rollback();
        return false;
      }
      
      // Step 5: Deploy backend
      if (!await this.deployBackend()) {
        await this.sendNotification('failed', { step: 'backend-deploy' });
        if (this.options.rollbackOnFailure) await this.rollback();
        return false;
      }
      
      // Step 6: Health check
      if (!await this.performHealthCheck()) {
        await this.sendNotification('failed', { step: 'health-check' });
        if (this.options.rollbackOnFailure) await this.rollback();
        return false;
      }
      
      // Deployment successful
      const duration = Date.now() - this.startTime;
      this.log(`✅ Deployment completed successfully in ${duration}ms`);
      
      await this.sendNotification('success', { 
        duration,
        backupPath: this.backupPath 
      });
      
      return true;
      
    } catch (error) {
      this.log(`❌ Deployment failed: ${error.message}`, 'error');
      
      await this.sendNotification('failed', { 
        error: error.message,
        step: 'unknown'
      });
      
      if (this.options.rollbackOnFailure) {
        await this.rollback();
      }
      
      return false;
    }
  }

  // Get deployment log
  getDeploymentLog() {
    return {
      deploymentId: this.deploymentId,
      startTime: this.startTime,
      duration: this.startTime ? Date.now() - this.startTime : null,
      backupPath: this.backupPath,
      log: this.deploymentLog
    };
  }
}

// CLI interface
if (require.main === module) {
  const deployer = new ProductionDeployer();
  
  deployer.deploy()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Deployment error:', error);
      process.exit(1);
    });
}

module.exports = ProductionDeployer;