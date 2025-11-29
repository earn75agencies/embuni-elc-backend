# Production Environment Variables Validator
# Validates that all required environment variables are set and properly formatted

const crypto = require('crypto');
const validator = require('validator');

class EnvironmentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Validate required environment variable
   */
  validateRequired(key, options = {}) {
    const value = process.env[key];
    
    if (!value) {
      this.errors.push(`❌ ${key}: Required environment variable is missing`);
      return false;
    }

    if (options.type === 'url' && !validator.isURL(value)) {
      this.errors.push(`❌ ${key}: Must be a valid URL`);
      return false;
    }

    if (options.type === 'email' && !validator.isEmail(value)) {
      this.errors.push(`❌ ${key}: Must be a valid email address`);
      return false;
    }

    if (options.minLength && value.length < options.minLength) {
      this.errors.push(`❌ ${key}: Must be at least ${options.minLength} characters long`);
      return false;
    }

    if (options.maxLength && value.length > options.maxLength) {
      this.errors.push(`❌ ${key}: Must be no more than ${options.maxLength} characters long`);
      return false;
    }

    if (options.pattern && !options.pattern.test(value)) {
      this.errors.push(`❌ ${key}: Format is invalid`);
      return false;
    }

    console.log(`✅ ${key}: Valid`);
    return true;
  }

  /**
   * Validate optional environment variable
   */
  validateOptional(key, options = {}) {
    const value = process.env[key];
    
    if (!value) {
      console.log(`⚠️  ${key}: Optional (not set)`);
      return true;
    }

    return this.validateRequired(key, options);
  }

  /**
   * Validate port number
   */
  validatePort(key, defaultValue = null) {
    const value = process.env[key];
    const port = parseInt(value, 10);
    
    if (!value) {
      if (defaultValue !== null) {
        console.log(`⚠️  ${key}: Using default value ${defaultValue}`);
        return true;
      }
      this.errors.push(`❌ ${key}: Port number is required`);
      return false;
    }

    if (isNaN(port) || port < 1 || port > 65535) {
      this.errors.push(`❌ ${key}: Must be a valid port number (1-65535)`);
      return false;
    }

    console.log(`✅ ${key}: Valid port (${port})`);
    return true;
  }

  /**
   * Validate boolean environment variable
   */
  validateBoolean(key, defaultValue = false) {
    const value = process.env[key];
    
    if (!value) {
      console.log(`⚠️  ${key}: Using default value ${defaultValue}`);
      return true;
    }

    const validValues = ['true', 'false', '1', '0', 'yes', 'no'];
    if (!validValues.includes(value.toLowerCase())) {
      this.errors.push(`❌ ${key}: Must be true, false, 1, 0, yes, or no`);
      return false;
    }

    console.log(`✅ ${key}: Valid boolean (${value})`);
    return true;
  }

  /**
   * Validate MongoDB URI
   */
  validateMongoURI(key = 'MONGODB_URI') {
    const value = process.env[key];
    
    if (!value) {
      this.errors.push(`❌ ${key}: MongoDB URI is required`);
      return false;
    }

    if (!value.startsWith('mongodb://') && !value.startsWith('mongodb+srv://')) {
      this.errors.push(`❌ ${key}: Must start with mongodb:// or mongodb+srv://`);
      return false;
    }

    console.log(`✅ ${key}: Valid MongoDB URI`);
    return true;
  }

  /**
   * Validate JWT secret
   */
  validateJWTSecret(key = 'JWT_SECRET') {
    const value = process.env[key];
    
    if (!value) {
      this.errors.push(`❌ ${key}: JWT secret is required`);
      return false;
    }

    if (value.length < 32) {
      this.errors.push(`❌ ${key}: Must be at least 32 characters long for security`);
      return false;
    }

    // Check if it's a common/weak secret
    const weakSecrets = ['secret', 'password', 'jwt-secret', 'your-secret-key'];
    if (weakSecrets.includes(value.toLowerCase())) {
      this.errors.push(`❌ ${key}: Using a weak/placeholder secret. Please generate a secure random secret.`);
      return false;
    }

    console.log(`✅ ${key}: Valid JWT secret (${value.length} characters)`);
    return true;
  }

  /**
   * Validate email configuration
   */
  validateEmailConfig() {
    const required = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL'];
    let allValid = true;

    required.forEach(key => {
      if (!this.validateRequired(key)) {
        allValid = false;
      }
    });

    if (allValid) {
      const port = process.env.SMTP_PORT;
      if (port && (isNaN(port) || parseInt(port) < 1 || parseInt(port) > 65535)) {
        this.errors.push(`❌ SMTP_PORT: Must be a valid port number`);
        allValid = false;
      }
    }

    return allValid;
  }

  /**
   * Validate security configuration
   */
  validateSecurityConfig() {
    let allValid = true;

    // JWT secret
    if (!this.validateJWTSecret()) {
      allValid = false;
    }

    // Session secret
    if (!this.validateRequired('SESSION_SECRET', { minLength: 32 })) {
      allValid = false;
    }

    // CORS origins
    const origins = process.env.ALLOWED_ORIGINS;
    if (origins) {
      const originList = origins.split(',').map(o => o.trim());
      originList.forEach(origin => {
        if (origin !== '*' && !validator.isURL(origin)) {
          this.errors.push(`❌ ALLOWED_ORIGINS: Invalid URL "${origin}"`);
          allValid = false;
        }
      });
    }

    // Bcrypt rounds
    const rounds = process.env.BCRYPT_ROUNDS;
    if (rounds) {
      const numRounds = parseInt(rounds, 10);
      if (isNaN(numRounds) || numRounds < 10 || numRounds > 15) {
        this.warnings.push(`⚠️  BCRYPT_ROUNDS: Recommended value is 10-12 (current: ${rounds})`);
      }
    }

    return allValid;
  }

  /**
   * Validate production-specific settings
   */
  validateProductionSettings() {
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️  Not in production mode, skipping production validations');
      return true;
    }

    let allValid = true;

    // Check for development URLs
    const devUrls = ['localhost', '127.0.0.1', '0.0.0.0', 'staging'];
    const frontendUrl = process.env.FRONTEND_URL;
    const apiUrl = process.env.VITE_API_URL || process.env.API_URL;

    [frontendUrl, apiUrl].forEach((url, index) => {
      if (url && devUrls.some(devUrl => url.includes(devUrl))) {
        this.errors.push(`❌ Production environment cannot use development URLs (${url})`);
        allValid = false;
      }
    });

    // Check for secure cookies
    const secureCookies = process.env.COOKIE_SECURE;
    if (secureCookies !== 'true') {
      this.warnings.push(`⚠️  Production should use secure cookies (COOKIE_SECURE=true)`);
    }

    // Check for HTTPS
    if (frontendUrl && !frontendUrl.startsWith('https://')) {
      this.warnings.push(`⚠️  Production should use HTTPS URLs`);
    }

    return allValid;
  }

  /**
   * Validate file upload configuration
   */
  validateUploadConfig() {
    let allValid = true;

    const maxSize = process.env.UPLOAD_MAX_SIZE;
    if (maxSize) {
      const size = parseInt(maxSize, 10);
      if (isNaN(size) || size < 0) {
        this.errors.push(`❌ UPLOAD_MAX_SIZE: Must be a positive number`);
        allValid = false;
      } else if (size > 50 * 1024 * 1024) { // 50MB
        this.warnings.push(`⚠️  UPLOAD_MAX_SIZE: Large upload size may impact performance (${(size / 1024 / 1024).toFixed(1)}MB)`);
      }
    }

    return allValid;
  }

  /**
   * Run all validations
   */
  validateAll() {
    console.log('🔍 Validating environment configuration...\n');

    // Basic configuration
    this.validateRequired('NODE_ENV');
    this.validatePort('PORT', 3000);
    this.validateMongoURI();
    this.validateSecurityConfig();
    this.validateProductionSettings();
    this.validateEmailConfig();
    this.validateUploadConfig();

    // Optional but recommended
    this.validateOptional('REDIS_URL', { type: 'url' });
    this.validateOptional('RECAPTCHA_SITE_KEY');
    this.validateOptional('RECAPTCHA_SECRET_KEY');
    this.validateBoolean('RECAPTCHA_ENABLED', false);

    console.log('\n📊 Validation Results:');
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors found:');
      this.errors.forEach(error => console.log(`  ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`  ${warning}`));
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n✅ All environment variables are valid!');
    }

    return this.errors.length === 0;
  }

  /**
   * Generate secure random secret
   */
  static generateSecret(length = 64) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate environment file template
   */
  static generateTemplate() {
    return `
# Generated Environment Configuration
# Generated on: ${new Date().toISOString()}

# Security Secrets (generate new ones for production)
JWT_SECRET=${this.generateSecret()}
SESSION_SECRET=${this.generateSecret()}

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/equity_leaders_prod

# Server Configuration
NODE_ENV=production
PORT=3000

# CORS Configuration
FRONTEND_URL=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@your-domain.com

# Security Configuration
BCRYPT_ROUNDS=12
COOKIE_SECURE=true

# File Upload Configuration
UPLOAD_MAX_SIZE=10485760

# Optional Services
REDIS_URL=redis://username:password@your-redis-host:6379
RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
RECAPTCHA_ENABLED=true
    `.trim();
  }
}

// Run validation if this file is executed directly
if (require.main === module) {
  const validator = new EnvironmentValidator();
  const isValid = validator.validateAll();
  
  if (!isValid) {
    console.log('\n💡 To generate a new template:');
    console.log('node scripts/validate-env.js --template > .env.production');
    process.exit(1);
  }
}

module.exports = EnvironmentValidator;