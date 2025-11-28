# Frontend Environment Variables Setup

## Overview
The frontend uses `.env.deployment` file for production environment configuration. This file should **NEVER** be committed to version control.

## Setup Instructions

1. **Create `.env.deployment` file** in the frontend root directory

2. **Add the following variables:**

```env
# ============================================
# Frontend Deployment Environment Variables
# ============================================
# This file is used for production deployments

# ============================================
# API Configuration
# ============================================
# Backend API URL
VITE_API_URL=https://embuni-elc-backend.onrender.com

# ============================================
# Application Configuration
# ============================================
# Frontend URL (for reference)
VITE_FRONTEND_URL=https://embuni-elc-frontend.vercel.app
```

## Environment Variable Priority

Vite loads environment variables in the following order (highest priority first):

1. **`.env.deployment`** - Production deployment configuration (highest priority)
2. **`.env.[mode]`** - Mode-specific (e.g., `.env.production`, `.env.development`)
3. **`.env`** - Base environment file (lowest priority)

## How It Works

The `vite.config.js` is configured to:
- First check for `.env.deployment` file
- Then load mode-specific environment files
- Finally load base `.env` file
- Variables from higher priority files override lower priority ones

## For Vercel Deployment

When deploying to Vercel:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the variables from `.env.deployment`:
   - `VITE_API_URL` = `https://embuni-elc-backend.onrender.com`
   - `VITE_FRONTEND_URL` = `https://embuni-elc-frontend.vercel.app`

Vercel will automatically use these during the build process.

## Security Notes

- **NEVER** commit `.env.deployment` file to version control
- Keep API URLs and secrets secure
- Use environment variables in your deployment platform (Vercel, Netlify, etc.)

