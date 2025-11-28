# Production Deployment Guide

## Overview
This guide covers deploying the Equity Leaders Website to production environment with proper security, performance, and monitoring configurations.

## Prerequisites

### Infrastructure Requirements
- **Server**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: Minimum 20GB SSD, Recommended 50GB+
- **CPU**: Minimum 2 cores, Recommended 4+ cores
- **Network**: Stable internet connection with static IP

### Software Requirements
- **Node.js**: 18.x LTS or higher
- **MongoDB**: 5.0+ or MongoDB Atlas
- **Redis**: 6.0+ (for rate limiting and caching)
- **Nginx**: 1.18+ (as reverse proxy)
- **SSL Certificate**: Let's Encrypt or commercial certificate
- **Domain**: Custom domain with DNS configuration

### External Services
- **Email Service**: SMTP server (Gmail, SendGrid, etc.)
- **reCAPTCHA**: Google reCAPTCHA v3 keys
- **CDN**: CloudFlare or AWS CloudFront (optional)
- **Monitoring**: Sentry for error tracking (recommended)

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/equity-leaders-website.git
cd equity-leaders-website
```

### 2. Install Dependencies
```bash
# Backend dependencies
cd backend
npm ci --production

# Frontend dependencies
cd ../frontend
npm ci --production
```

### 3. Environment Configuration

#### Backend Environment
```bash
# Copy production template
cp .env.production.template .env.production

# Edit with your values
nano .env.production
```

**Critical Security Settings:**
- Generate strong JWT secrets (minimum 32 characters)
- Set secure MongoDB connection string
- Configure proper CORS origins
- Enable SSL and secure cookies
- Set up reCAPTCHA keys

#### Frontend Environment
```bash
# Copy production template
cp .env.production.template .env.production

# Edit with your values
nano .env.production
```

### 4. Database Setup

#### MongoDB Configuration
```bash
# If using self-hosted MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database user
mongo
> use equity_leaders_prod
> db.createUser({
    user: "elp_admin",
    pwd: "secure_password",
    roles: ["readWrite"]
  })
```

#### Redis Configuration
```bash
# Install and start Redis
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
# Set: requirepass your_redis_password
sudo systemctl restart redis-server
```

## Application Build

### 1. Build Frontend
```bash
cd frontend
npm run build
```

### 2. Verify Build
```bash
# Check build output
ls -la dist/
# Should contain index.html and assets
```

## Web Server Configuration

### 1. Nginx Setup
```nginx
# /etc/nginx/sites-available/equity-leaders
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend Static Files
    location / {
        root /var/www/equity-leaders/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API Proxy
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket Proxy
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # File Uploads
    location /uploads/ {
        alias /var/www/equity-leaders/uploads/;
        expires 1M;
        add_header Cache-Control "public";
    }
}
```

### 2. Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/equity-leaders /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Process Management

### 1. PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'equity-leaders-api',
      script: './backend/server.js',
      cwd: '/var/www/equity-leaders',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 'max',
      exec_mode: 'cluster',
      max_memory_restart: '1G',
      error_file: '/var/log/equity-leaders/api-error.log',
      out_file: '/var/log/equity-leaders/api-out.log',
      log_file: '/var/log/equity-leaders/api-combined.log',
      time: true
    }
  ]
};
```

### 2. Start Application
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u www-data --hp /var/www/equity-leaders
```

## SSL Certificate Setup

### 1. Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Setup auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Security Hardening

### 1. Firewall Configuration
```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. System Updates
```bash
# Setup automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 3. File Permissions
```bash
# Set proper ownership
sudo chown -R www-data:www-data /var/www/equity-leaders
sudo chmod -R 755 /var/www/equity-leaders
sudo chmod -R 777 /var/www/equity-leaders/uploads
```

## Monitoring and Logging

### 1. Log Rotation
```bash
# /etc/logrotate.d/equity-leaders
/var/log/equity-leaders/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reload equity-leaders-api
    endscript
}
```

### 2. Monitoring Setup
```bash
# Install monitoring tools
npm install -g pm2-logrotate
pm2 install pm2-server-monit

# Configure monitoring
pm2 set pm2-server-monit:email admin@your-domain.com
```

## Backup Strategy

### 1. Database Backup
```bash
#!/bin/bash
# /usr/local/bin/backup-mongodb.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/mongodb"
mkdir -p $BACKUP_DIR

mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/backup_$DATE"
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" -C "$BACKUP_DIR" "backup_$DATE"
rm -rf "$BACKUP_DIR/backup_$DATE"

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete
```

### 2. File Backup
```bash
#!/bin/bash
# /usr/local/bin/backup-files.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/equity-leaders"
mkdir -p $BACKUP_DIR

tar -czf "$BACKUP_DIR/files_$DATE.tar.gz" /var/www/equity-leaders/uploads

# Keep only last 30 days
find $BACKUP_DIR -name "files_*.tar.gz" -mtime +30 -delete
```

### 3. Schedule Backups
```bash
# Add to crontab
sudo crontab -e
# Add:
# 0 2 * * * /usr/local/bin/backup-mongodb.sh
# 0 3 * * 0 /usr/local/bin/backup-files.sh
```

## Performance Optimization

### 1. Nginx Optimization
```nginx
# Add to nginx configuration
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

# Enable HTTP/2
listen 443 ssl http2;

# Worker processes
worker_processes auto;
worker_connections 1024;
```

### 2. Node.js Optimization
```bash
# Environment variables
export NODE_OPTIONS="--max-old-space-size=2048"
export UV_THREADPOOL_SIZE=128
```

## Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] SSL certificates obtained
- [ ] Database created and configured
- [ ] Redis server running
- [ ] Nginx configuration tested
- [ ] Backup scripts created
- [ ] Monitoring tools installed

### Post-Deployment
- [ ] Application running correctly
- [ ] SSL certificate valid
- [ ] Database connections working
- [ ] File uploads functional
- [ ] Email sending working
- [ ] Rate limiting active
- [ ] Security headers present
- [ ] Monitoring alerts configured
- [ ] Backup schedule active
- [ ] Performance metrics collected

## Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check logs
pm2 logs equity-leaders-api
tail -f /var/log/equity-leaders/api-error.log

# Check configuration
node -c backend/server.js
```

#### Database Connection Issues
```bash
# Test MongoDB connection
mongo "$MONGODB_URI" --eval "db.adminCommand('ismaster')"

# Check MongoDB status
sudo systemctl status mongod
```

#### SSL Certificate Issues
```bash
# Test certificate
sudo certbot certificates
sudo nginx -t

# Renew certificate
sudo certbot renew --dry-run
```

#### Performance Issues
```bash
# Check system resources
htop
df -h
free -h

# Monitor application
pm2 monit
```

## Maintenance

### Regular Tasks
- **Weekly**: Check logs, update packages, review security alerts
- **Monthly**: Review backup integrity, update SSL certificates, performance audit
- **Quarterly**: Security audit, dependency updates, capacity planning

### Emergency Procedures
1. **Application Down**: Check PM2 status, restart if needed
2. **Database Issues**: Check MongoDB logs, restore from backup if necessary
3. **Security Incident**: Review access logs, rotate secrets, update passwords

## Support

For deployment issues:
1. Check application logs
2. Review this troubleshooting guide
3. Consult the project documentation
4. Contact the development team

Remember to keep your production environment secure and regularly updated!