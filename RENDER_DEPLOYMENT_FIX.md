# Render Deployment Timeout Fix

## Issue
The server starts successfully but times out during Render's health check, causing deployment to fail.

## Root Cause
1. The health check endpoint might not be responding quickly enough
2. The server startup promise structure might be causing issues
3. Graceful shutdown handling needed improvement

## Fixes Applied

### 1. Health Check Route Optimization
- Moved health check routes registration **before** root route
- Added error handling to health check endpoint
- Added database connection status to health check response
- Ensured health check responds immediately (no async operations)

### 2. Server Startup Promise
- Changed promise to resolve after server starts (instead of keeping it pending)
- Server continues running even after promise resolves
- This allows Render to detect successful startup

### 3. Graceful Shutdown
- Improved SIGTERM handler to properly close HTTP server and MongoDB connection
- Added SIGINT handler for local development
- Ensures clean shutdown on Render

## Health Check Endpoints

### Basic Health Check
```
GET /api/health
```
Returns:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-12T14:47:31.000Z",
  "uptime": 123.45,
  "service": "ELP Backend API",
  "version": "1.0.0",
  "database": "connected"
}
```

### Readiness Check
```
GET /api/health/ready
```
Returns 200 if database is connected, 503 otherwise.

### Liveness Check
```
GET /api/health/live
```
Always returns 200 if process is running.

## Render Configuration

### Health Check Path
Set in Render dashboard:
- **Health Check Path**: `/api/health`
- **Health Check Timeout**: 30 seconds (default)

### Environment Variables
Ensure these are set in Render:
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `SESSION_SECRET` - Session secret
- `FRONTEND_URL` - Frontend URL for CORS
- `PORT` - Port (Render sets this automatically)

### Optional Variables (warnings are OK)
- `VOTE_LINK_SECRET` - For voting links
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` - For email
- `CLOUDINARY_URL` - For image uploads
- `RECAPTCHA_SECRET_KEY` - For reCAPTCHA

## Testing

After deployment, test health check:
```bash
curl https://embuni-elc-backend.onrender.com/api/health
```

Should return:
```json
{
  "status": "healthy",
  ...
}
```

## Deployment Checklist

- [x] Health check route responds quickly
- [x] Health check route registered early
- [x] Server startup promise resolves correctly
- [x] Graceful shutdown implemented
- [x] Database connection status in health check
- [x] Error handling in health check

## Expected Behavior

1. Server starts and connects to MongoDB
2. Health check endpoint responds immediately
3. Render detects successful startup
4. Deployment completes successfully
5. Server remains running and responsive

