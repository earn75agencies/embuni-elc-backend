# Production Deployment Guide

## Overview
This guide covers the complete production deployment process for the University of Embu Equity Leaders Program application.

## Prerequisites

### Backend Requirements
- Node.js 18+ 
- MongoDB database
- Redis (for rate limiting and sessions)
- SSL certificate
- Domain name

### Frontend Requirements
- Vercel account (recommended) or any static hosting
- Custom domain configuration
- SSL certificate

## Environment Configuration

### Backend Environment Variables
Create `.env` file in backend root:

```bash
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/elp_production
REDIS_URL=redis://username:password@host:port

# JWT & Security
JWT_SECRET=your-super-secure-jwt-secret-key-here
SESSION_SECRET=your-super-secure-session-secret-key-here
VOTE_LINK_SECRET=your-voting-link-hmac-secret

# API Configuration
PORT=443
NODE_ENV=production
FRONTEND_URL=https://embuni-elc.com

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Cloud Storage (Optional)
CLOUDINARY_URL=cloudinary://your-cloudinary-url

# reCAPTCHA (Optional)
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
```

### Frontend Environment Variables
Create `.env.deployment` file in frontend root:

```bash
# API Configuration
VITE_API_URL=https://api.embuni-elc.com
VITE_API_BASE_URL=https://api.embuni-elc.com/api
VITE_WS_URL=wss://api.embuni-elc.com

# Application
VITE_APP_NAME=University of Embu Equity Leaders Program
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Empowering next generation of leaders at University of Embu

# Security
VITE_ENABLE_CSP=true
VITE_ENABLE_HSTS=true
VITE_ENABLE_XSS_PROTECTION=true

# Analytics (Optional)
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXX-X
VITE_SENTRY_DSN=your-sentry-dsn

# reCAPTCHA
VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
VITE_RECAPTCHA_ENABLED=true
```

## Deployment Steps

### 1. Backend Deployment (Render.com)

1. **Create Render Account**
   - Sign up at https://render.com
   - Connect your GitHub repository

2. **Create Web Service**
   - Choose "Web Service"
   - Connect your backend repository
   - Set root directory: `backend`
   - Runtime: Node.js
   - Build Command: `npm install`
   - Start Command: `node server.js`

3. **Configure Environment Variables**
   - Add all backend environment variables
   - Enable auto-deploy from main branch

4. **Database Setup**
   - Create MongoDB Atlas cluster
   - Add connection string to environment variables
   - Create Redis instance (Render Redis or Redis Labs)

5. **SSL Configuration**
   - Render provides automatic SSL
   - Custom domain can be configured in dashboard

### 2. Frontend Deployment (Vercel)

1. **Create Vercel Account**
   - Sign up at https://vercel.com
   - Connect your GitHub repository

2. **Configure Project**
   - Framework: Vite
   - Root directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Environment Variables**
   - Add all frontend environment variables
   - Vercel will automatically use `.env.deployment`

4. **Custom Domain**
   - Add custom domain in Vercel dashboard
   - Update DNS records as instructed

### 3. DNS Configuration

1. **Backend DNS**
   ```
   A    api    75.2.60.5    ; Render IP
   ```

2. **Frontend DNS**
   ```
   CNAME @    cname.vercel-dns.com    ; Vercel
   ```

## Security Configuration

### 1. Backend Security
- Rate limiting enabled
- CORS configured for production domain
- Security headers implemented
- Input validation and sanitization
- File upload restrictions
- Session security with HTTP-only cookies

### 2. Frontend Security
- Content Security Policy headers
- XSS protection
- HTTPS enforcement
- Secure cookie handling
- Input validation

## Monitoring and Maintenance

### 1. Error Monitoring
- Sentry integration for error tracking
- Custom error reporting to backend
- Performance monitoring

### 2. Health Checks
- `/api/health` endpoint for monitoring
- Database connection monitoring
- Redis connection monitoring

### 3. Backup Strategy
- Daily MongoDB backups
- Redis persistence enabled
- File storage backups (Cloudinary)

## Performance Optimization

### 1. Backend
- Database indexing
- Redis caching
- Image optimization
- API response compression

### 2. Frontend
- Code splitting and lazy loading
- Image optimization
- CDN usage
- Service worker implementation

## Testing Before Going Live

### 1. Functionality Testing
- User registration and login
- Admin panel functionality
- Voting system
- File uploads
- Email notifications

### 2. Security Testing
- Input validation
- Rate limiting
- Authentication flows
- Authorization checks

### 3. Performance Testing
- Load testing
- Database query performance
- API response times
- Frontend loading times

## Go-Live Checklist

- [ ] All environment variables configured
- [ ] SSL certificates installed
- [ ] DNS records updated
- [ ] Database connected and seeded
- [ ] Redis connected
- [ ] Email service configured
- [ ] File storage configured
- [ ] Security headers verified
- [ ] Rate limiting tested
- [ ] Error monitoring active
- [ ] Backup strategy implemented
- [ ] Performance monitoring active
- [ ] User testing completed
- [ ] Security testing completed

## Post-Deployment

### 1. Monitoring
- Monitor error rates
- Track performance metrics
- Check user feedback
- Monitor security logs

### 2. Maintenance
- Regular security updates
- Database optimization
- Log rotation
- Backup verification

### 3. Scaling
- Monitor resource usage
- Plan for traffic spikes
- Database scaling strategy
- CDN optimization

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check MongoDB URI format
   - Verify IP whitelist
   - Check network connectivity

2. **CORS Errors**
   - Verify FRONTEND_URL environment variable
   - Check CORS configuration
   - Ensure HTTPS usage

3. **Authentication Issues**
   - Verify JWT_SECRET
   - Check session configuration
   - Verify cookie settings

4. **File Upload Issues**
   - Check file size limits
   - Verify allowed file types
   - Check storage configuration

### Emergency Procedures

1. **Site Down**
   - Check Render dashboard
   - Review deployment logs
   - Verify database connectivity

2. **Security Incident**
   - Rotate all secrets
   - Review access logs
   - Implement additional security measures

## Support

For deployment issues:
1. Check this guide first
2. Review platform documentation (Render/Vercel)
3. Check application logs
4. Contact development team

---

**Note**: This deployment guide assumes you have administrative access to all required services and domains.