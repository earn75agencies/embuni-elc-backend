# Render.com Environment Variables Setup

## Required Environment Variables for Backend

Add these environment variables in your Render.com dashboard for the backend service:

### reCAPTCHA Configuration
```
RECAPTCHA_SECRET_KEY=6LeHOBssAAAAAAbTDLIc672DD2rj5vZJPj8qsFu0
RECAPTCHA_SITE_KEY=6LeHOBssAAAAAIT8-zDZ-iF4S7YMJLNFeixfH1ig
RECAPTCHA_VERSION=v2
RECAPTCHA_MIN_SCORE=0.5
```

### Other Missing Variables (Required for Full Functionality)
```
VOTE_LINK_SECRET=vote-link-secret-key-12345678901234567890
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CLOUDINARY_URL=cloudinary://372613873139171:nswkHPL5ztVaGZrQGiVtzcWpJ1w@dllgsojfm
```

## Frontend Environment Variables

Add these to your frontend service on Render.com:

```
VITE_RECAPTCHA_SITE_KEY=6LeHOBssAAAAAIT8-zDZ-iF4S7YMJLNFeixfH1ig
```

## Steps to Add Environment Variables in Render.com

1. Go to your Render.com dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Add each environment variable from the list above
5. Click "Save Changes"
6. Trigger a new deployment

## Notes

- The reCAPTCHA keys are already configured in your local .env files
- Render.com uses its own environment variable system, not .env files
- Make sure to restart the service after adding environment variables
- The syntax error in Internship.js has been fixed and committed