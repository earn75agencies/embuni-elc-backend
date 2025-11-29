require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { ROLE_PERMISSIONS, ADMIN_ROLES } = require('../constants/adminRoles');

// IMPORTANT: Change these credentials in production!
// These are default development credentials only.
// NEVER use these in production - change immediately after first deployment.
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'superadmin@elp.com';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@2024!';
const SUPER_ADMIN_ROLE = ADMIN_ROLES.SUPER_ADMIN || 'super_admin';

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
}

async function seedSuperAdmin() {
  console.log('Creating super admin...');

  let superAdminUser = await User.findOne({ email: SUPER_ADMIN_EMAIL });

  if (!superAdminUser) {
    superAdminUser = await User.create({
      firstName: 'Super',
      lastName: 'Administrator',
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD,
      role: 'admin',
      isActive: true
    });
    console.log('Super Admin user created');
  } else {
    console.log('Super Admin user already exists');
  }

  let superAdmin = await Admin.findOne({ user: superAdminUser._id });

  if (!superAdmin) {
    superAdmin = await Admin.create({
      user: superAdminUser._id,
      adminRole: SUPER_ADMIN_ROLE,
      department: 'Executive',
      permissions: ROLE_PERMISSIONS[SUPER_ADMIN_ROLE] || [],
      isActive: true,
      notes: 'Initial super admin created by seed script'
    });
    console.log('Super Admin record created');
    await superAdmin.logAction('system_init', 'admin_management', {
      action: 'System initialized with super admin account'
    });
  } else {
    console.log('Super Admin record already exists');
  }

  return superAdminUser;
}

async function seedDatabase() {
  console.log('');
  console.log('====================================');
  console.log('  Starting Database Seeding');
  console.log('====================================');
  console.log('');

  try {
    await connectDB();
    await seedSuperAdmin();

    console.log('');
    console.log('====================================');
    console.log('  Seeding Completed Successfully!');
    console.log('====================================');
    console.log('');
    console.log('Default Super Admin Credentials:');
    console.log('');
    console.log('  Email:    ' + SUPER_ADMIN_EMAIL);
    console.log('  Password: ' + SUPER_ADMIN_PASSWORD);
    console.log('');
    console.log('Security Warning:');
    console.log('  - Change password after first login');
    console.log('  - Do NOT share these credentials');
    console.log('');
    console.log('Next Steps:');
    console.log('  1. Login: https://embuni-elc-frontend.vercel.app/login');
    console.log('  2. Dashboard: https://embuni-elc-frontend.vercel.app/admin/dashboard');
    console.log('  3. Manage Admins: https://embuni-elc-frontend.vercel.app/admin/logins');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
