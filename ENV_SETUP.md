# Backend Environment Variables Setup

## Overview
The backend uses `.env` file for environment configuration. This file should **NEVER** be committed to version control.

## Setup Instructions

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** with your actual values

## Required Environment Variables

### Database Configuration
```env
MONGO_URI=mongodb://localhost:27017/elp-db
# For production: mongodb+srv://username:password@cluster.mongodb.net/dbname
```

### Server Configuration
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=https://embuni-elc-frontend.vercel.app
```

### Super Admin Default Credentials
```env
# IMPORTANT: Change these in production!
# These are default credentials for initial setup
# Run: node scripts/seed.js to create the super admin account
SUPER_ADMIN_EMAIL=superadmin@elp.com
SUPER_ADMIN_PASSWORD=SuperAdmin@2024!
```

### JWT & Session Configuration
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
SESSION_SECRET=your-session-secret-key-change-this-in-production
```

### Email Configuration (Optional)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@elp.com
```

### reCAPTCHA Configuration (Optional)
```env
RECAPTCHA_ENABLED=false
RECAPTCHA_VERSION=v3
RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
RECAPTCHA_SCORE_THRESHOLD=0.5
```

### CORS Configuration
```env
ALLOWED_ORIGINS=https://embuni-elc-frontend.vercel.app
```

### Cookie Configuration
```env
COOKIE_DOMAIN=.vercel.app
```

## Creating Super Admin

After setting up your `.env` file, run the seed script to create the super admin account:

```bash
node scripts/seed.js
```

This will create a super admin user with the credentials specified in your `.env` file.

## Security Notes

- **NEVER** commit `.env` file to version control
- Change default super admin credentials immediately after first deployment
- Use strong, unique secrets for JWT_SECRET and SESSION_SECRET
- Rotate secrets regularly in production

