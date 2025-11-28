# How to Seed Super Admin on Render Production

## Quick Method (Recommended)

### Option 1: Using Render Shell (Easiest)

1. **Go to Render Dashboard**
   - Navigate to: https://dashboard.render.com
   - Select your backend service: `embuni-elc-backend`

2. **Open Shell**
   - Click on your service
   - Go to the "Shell" tab (or "Logs" → "Shell")
   - This opens a terminal connected to your production server

3. **Run the Seed Script**
   ```bash
   node scripts/seed-production.js
   ```

4. **Verify**
   - The script will output the Super Admin credentials
   - Test login at: https://embuni-elc-frontend.vercel.app/login

---

### Option 2: Using Environment Variables + One-Time Command

1. **Set Environment Variables in Render**
   - Go to your backend service settings
   - Navigate to "Environment" section
   - Add/Update these variables:
     ```
     SUPER_ADMIN_EMAIL=superadmin@elp.com
     SUPER_ADMIN_PASSWORD=SuperAdmin@2024!
     ```
   - Save changes

2. **Add One-Time Command**
   - In Render dashboard, go to your service
   - Click "Manual Deploy" or add a "One-Time Command"
   - Command: `node scripts/seed-production.js`
   - Deploy/Execute

---

### Option 3: Using MongoDB Compass/Atlas (Direct Database)

If you have direct MongoDB access:

1. **Connect to MongoDB**
   - Use MongoDB Compass or Atlas UI
   - Connect to: `ac-iq7ig0t-shard-00-02.zzigobx.mongodb.net` (from logs)

2. **Create User Document**
   ```javascript
   // In MongoDB shell or Compass
   use test; // or your database name
   
   db.users.insertOne({
     firstName: "Super",
     lastName: "Administrator",
     email: "superadmin@elp.com",
     password: "$2a$10$...", // You'll need to hash this
     role: "admin",
     isActive: true,
     createdAt: new Date(),
     updatedAt: new Date()
   });
   ```

3. **Create Admin Document**
   ```javascript
   // Get the user ID from above
   const userId = ObjectId("..."); // Replace with actual user ID
   
   db.admins.insertOne({
     user: userId,
     adminRole: "super_admin",
     department: "Executive",
     permissions: [], // Will be populated by system
     isActive: true,
     createdAt: new Date(),
     updatedAt: new Date()
   });
   ```

**Note:** This method requires password hashing. Use Option 1 or 2 instead.

---

## Verification Steps

After seeding, verify it works:

1. **Test Login via API**
   ```bash
   curl -X POST https://embuni-elc-backend.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"superadmin@elp.com","password":"SuperAdmin@2024!"}'
   ```

2. **Test Login via Frontend**
   - Go to: https://embuni-elc-frontend.vercel.app/login
   - Email: `superadmin@elp.com`
   - Password: `SuperAdmin@2024!`
   - Should redirect to `/superadmin` dashboard

3. **Re-run QA Tests**
   ```bash
   cd backend
   node qa-test-script.js
   ```

---

## Troubleshooting

### Issue: "Cannot find module" errors
**Solution:** Make sure you're in the correct directory:
```bash
cd /opt/render/project/src  # Render's default path
# or
cd /app  # Alternative path
node scripts/seed-production.js
```

### Issue: "MONGO_URI not set"
**Solution:** Check environment variables in Render dashboard:
- Go to Service → Environment
- Ensure `MONGO_URI` is set correctly

### Issue: "User already exists but can't login"
**Solution:** The password might be different. Reset it:
```bash
# In Render shell, run:
node -e "
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const user = await User.findOne({email: 'superadmin@elp.com'});
  if (user) {
    user.password = 'SuperAdmin@2024!';
    await user.save();
    console.log('Password updated');
  }
  process.exit(0);
});
"
```

### Issue: "Admin record doesn't exist"
**Solution:** Run the seed script again - it will create the Admin record:
```bash
node scripts/seed-production.js
```

---

## Security Notes

⚠️ **IMPORTANT:** After seeding, consider:
1. Changing the default password
2. Enabling 2FA if available
3. Restricting Super Admin creation to specific IPs
4. Rotating credentials periodically

---

## Quick Reference

**Default Credentials:**
- Email: `superadmin@elp.com`
- Password: `SuperAdmin@2024!`

**Login URLs:**
- Frontend: https://embuni-elc-frontend.vercel.app/login
- Admin Portal: https://embuni-elc-frontend.vercel.app/superadmin

**Script Location:**
- `backend/scripts/seed-production.js`

**Environment Variables Needed:**
- `MONGO_URI` (required)
- `SUPER_ADMIN_EMAIL` (optional, defaults to superadmin@elp.com)
- `SUPER_ADMIN_PASSWORD` (optional, defaults to SuperAdmin@2024!)

---

## Next Steps After Seeding

1. ✅ Verify Super Admin login works
2. ✅ Re-run QA tests: `node qa-test-script.js`
3. ✅ Test admin creation for all 10 roles
4. ✅ Test CRUD operations
5. ✅ Verify admin portal access

---

**Need Help?** Check the logs in Render dashboard or run the seed script with verbose output.

