# Complete Project Debugging Guide

## 🔑 Default Admin Login Credentials

### Super Admin Default Credentials

Based on the codebase, the default Super Admin credentials are:

```
Email: superadmin@elp.com
Password: SuperAdmin@2024!
```

**Note:** These are the default credentials from `backend/scripts/seed.js` and `backend/ENV_SETUP.md`.

### Environment Variable Configuration

The project uses **two different naming conventions** for Super Admin credentials:

#### Option 1: With Underscores (seed.js)
```env
SUPER_ADMIN_EMAIL=superadmin@elp.com
SUPER_ADMIN_PASSWORD=SuperAdmin@2024!
```

#### Option 2: Without Underscores (seed-production.js)
```env
SUPERADMIN_EMAIL=superadmin@elp.com
SUPERADMIN_PASSWORD=SuperAdmin@2024!
```

**⚠️ IMPORTANT:** The production seed script (`seed-production.js`) uses **SUPERADMIN_EMAIL** and **SUPERADMIN_PASSWORD** (no underscores).

### Complete .env File Template

```env
# ==================== DATABASE ====================
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# ==================== SERVER ====================
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://embuni-elc-frontend.vercel.app

# ==================== SUPER ADMIN CREDENTIALS ====================
# For seed.js (development)
SUPER_ADMIN_EMAIL=superadmin@elp.com
SUPER_ADMIN_PASSWORD=SuperAdmin@2024!

# For seed-production.js (production)
SUPERADMIN_EMAIL=superadmin@elp.com
SUPERADMIN_PASSWORD=SuperAdmin@2024!

# Optional: Admin name customization
SUPERADMIN_FIRSTNAME=Super
SUPERADMIN_LASTNAME=Administrator

# ==================== JWT & SESSION ====================
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-change-this
JWT_EXPIRE=7d
SESSION_SECRET=your-session-secret-key-minimum-32-characters-long-change-this

# ==================== OPTIONAL SERVICES ====================
# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@elp.com

# Cloudinary (Optional)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# reCAPTCHA (Optional)
RECAPTCHA_ENABLED=false
RECAPTCHA_VERSION=v3
RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
RECAPTCHA_SCORE_THRESHOLD=0.5

# Voting System (Optional)
VOTE_LINK_SECRET=your-hmac-secret-for-voting-links-minimum-32-characters
```

---

## 🐛 Common Issues and Fixes

### Issue 1: Super Admin Login Fails

**Symptoms:**
- 401 Unauthorized when trying to login
- "Invalid credentials" error

**Possible Causes:**
1. Super Admin account not seeded
2. Wrong credentials
3. Password was changed
4. Account is inactive

**Solutions:**

#### Solution A: Seed Super Admin (Development)
```bash
cd backend
node scripts/seed.js
```

#### Solution B: Seed Super Admin (Production)
```bash
cd backend
node scripts/seed-production.js
```

**Make sure these environment variables are set:**
- For `seed.js`: `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD`
- For `seed-production.js`: `SUPERADMIN_EMAIL` and `SUPERADMIN_PASSWORD`

#### Solution C: Check Database
1. Connect to MongoDB
2. Check `users` collection for email: `superadmin@elp.com`
3. Check `admins` collection for `adminRole: 'super_admin'`
4. Verify `isActive: true`

---

### Issue 2: Registration Validation Errors

**Symptoms:**
- "Validation failed" error
- Specific field errors

**Fixes Applied:**
✅ Frontend now cleans empty optional fields
✅ Backend validates and converts data types
✅ Better error messages displayed

**Test Registration:**
```json
POST /api/auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "Test123",
  "confirmPassword": "Test123"
}
```

---

### Issue 3: Admin Creation Fails - Department Validation Error

**Symptoms:**
- "Media is not a valid enum value for path department"
- Similar errors for other invalid departments

**Fix Applied:**
✅ All `roleDepartmentMap` entries now use valid enum values:
- `['Executive', 'Leadership', 'Communications', 'Events', 'Membership', 'Administration']`

**Valid Department Mappings:**
- `super_admin` → `Executive`
- `events_admin` → `Events`
- `gallery_admin` → `Administration`
- `content_admin` → `Administration`
- `membership_admin` → `Membership`
- `partners_admin` → `Administration`
- `programs_admin` → `Administration`
- `testimonials_admin` → `Administration`
- `announcements_admin` → `Communications`
- `contact_admin` → `Communications`
- `security_admin` → `Administration`

---

### Issue 4: Mongoose Shutdown Error

**Symptoms:**
```
Connection.prototype.close() no longer accepts a callback
```

**Fix Applied:**
✅ Updated graceful shutdown to use Promise-based `mongoose.connection.close()`
✅ Added proper error handling in signal handlers

---

### Issue 5: Route Not Found (404)

**Symptoms:**
- `/api/api/register` not found
- Double `/api` in URL

**Solution:**
- Use correct URL: `https://embuni-elc-backend.onrender.com/api/auth/register`
- Remove any trailing spaces or newlines from URL
- Check Postman URL field for hidden characters

---

### Issue 6: Environment Variable Inconsistencies

**Problem:**
- `seed.js` uses `SUPER_ADMIN_EMAIL` (with underscores)
- `seed-production.js` uses `SUPERADMIN_EMAIL` (without underscores)

**Solution:**
Set **both** in your `.env` file:
```env
SUPER_ADMIN_EMAIL=superadmin@elp.com
SUPER_ADMIN_PASSWORD=SuperAdmin@2024!
SUPERADMIN_EMAIL=superadmin@elp.com
SUPERADMIN_PASSWORD=SuperAdmin@2024!
```

---

## 🧪 Testing Guide

### 1. Test Super Admin Login

**Postman Request:**
```
POST https://embuni-elc-backend.onrender.com/api/auth/login
Content-Type: application/json

{
  "email": "superadmin@elp.com",
  "password": "SuperAdmin@2024!"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "email": "superadmin@elp.com",
    "role": "admin"
  }
}
```

### 2. Test User Registration

**Postman Request:**
```
POST https://embuni-elc-backend.onrender.com/api/auth/register
Content-Type: application/json

{
  "firstName": "Test",
  "lastName": "User",
  "email": "testuser@example.com",
  "password": "Test123",
  "confirmPassword": "Test123"
}
```

### 3. Test Admin Creation

**Postman Request:**
```
POST https://embuni-elc-backend.onrender.com/api/auth/admin/create-login
Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN
Content-Type: application/json

{
  "email": "events.admin@elp.com",
  "firstName": "Events",
  "lastName": "Admin",
  "password": "Admin123!",
  "adminRole": "events_admin"
}
```

---

## 📋 Quick Debug Checklist

### Before Testing:
- [ ] MongoDB connection is working
- [ ] All environment variables are set
- [ ] Super Admin account is seeded
- [ ] Server is running without errors
- [ ] CORS is configured correctly

### Common Checks:
- [ ] Check server logs for errors
- [ ] Verify database connection
- [ ] Test health endpoint: `GET /api/health`
- [ ] Verify JWT_SECRET is set and valid
- [ ] Check FRONTEND_URL matches your frontend

### If Super Admin Login Fails:
1. Run seed script: `node scripts/seed-production.js`
2. Check environment variables
3. Verify account exists in database
4. Check if account is active
5. Try resetting password

---

## 🔧 Environment Variable Validation

The system validates these on startup:

### Required:
- ✅ `MONGO_URI` - MongoDB connection string
- ✅ `JWT_SECRET` - Must be at least 32 characters
- ✅ `SESSION_SECRET` - Must be at least 32 characters

### Optional (with defaults):
- `FRONTEND_URL` - Default: `https://embuni-elc-frontend.vercel.app`
- `PORT` - Default: `5000`
- `NODE_ENV` - Default: `development`

### Optional (no defaults):
- `SUPERADMIN_EMAIL` / `SUPER_ADMIN_EMAIL`
- `SUPERADMIN_PASSWORD` / `SUPER_ADMIN_PASSWORD`
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`
- `CLOUDINARY_URL`
- `RECAPTCHA_SECRET_KEY`
- `VOTE_LINK_SECRET`

---

## 🚀 Quick Start Commands

### 1. Seed Super Admin (Development)
```bash
cd backend
node scripts/seed.js
```

### 2. Seed Super Admin + All Admin Roles (Production)
```bash
cd backend
node scripts/seed-production.js
```

### 3. Run Full Test Suite
```bash
cd backend
node qa-test-script.js
```

### 4. Test Registration Flow
```bash
cd backend
node test-full-flow.js
```

---

## 📝 Default Admin Roles

When you seed all admin roles, these accounts are created:

1. **Events Admin**: `events.admin@elp.com`
2. **Gallery Admin**: `gallery.admin@elp.com`
3. **Blog Admin**: `blog.admin@elp.com`
4. **Team Admin**: `team.admin@elp.com`
5. **Partners Admin**: `partners.admin@elp.com`
6. **Programs Admin**: `programs.admin@elp.com`
7. **Testimonials Admin**: `testimonials.admin@elp.com`
8. **Announcements Admin**: `announcements.admin@elp.com`
9. **Support Admin**: `support.admin@elp.com`
10. **Security Admin**: `security.admin@elp.com`

**Default Password for all:** `Admin123!` (can be customized in seed script)

---

## 🔒 Security Notes

1. **Change default passwords immediately** after first deployment
2. **Never commit `.env` file** to version control
3. **Use strong JWT_SECRET** (minimum 32 characters)
4. **Rotate secrets regularly** in production
5. **Use environment-specific credentials** (dev vs production)

---

## 📞 Support

If you encounter issues:
1. Check server logs
2. Verify environment variables
3. Test with Postman using credentials above
4. Run seed scripts to ensure accounts exist
5. Check database for account status

---

## ✅ Summary

**Default Super Admin Credentials:**
- Email: `superadmin@elp.com`
- Password: `SuperAdmin@2024!`

**Environment Variables to Set:**
```env
SUPER_ADMIN_EMAIL=superadmin@elp.com
SUPER_ADMIN_PASSWORD=SuperAdmin@2024!
SUPERADMIN_EMAIL=superadmin@elp.com
SUPERADMIN_PASSWORD=SuperAdmin@2024!
```

**To Create Super Admin:**
```bash
node scripts/seed-production.js
```

