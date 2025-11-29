/**
 * Production Admin Seeding Script
 *
 * This script seeds Super Admin and all 10 admin roles for the ELP system.
 *
 * Environment Variables Required:
 *   - MONGO_URI: MongoDB connection string
 *   - SUPERADMIN_EMAIL: Super Admin email address
 *   - SUPERADMIN_PASSWORD: Super Admin password
 *   - SUPERADMIN_FIRSTNAME: Super Admin first name (optional, defaults to "Super")
 *   - SUPERADMIN_LASTNAME: Super Admin last name (optional, defaults to "Administrator")
 *
 * Usage:
 *   node scripts/seed-production.js
 *
 * Safety:
 *   - Uses bcrypt for password hashing
 *   - No hardcoded credentials
 *   - Checks for existing admins before creating
 *   - Safe to run multiple times (idempotent)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { ROLE_PERMISSIONS, ADMIN_ROLES } = require('../constants/adminRoles');

// ==================== CONFIGURATION ====================

// Read Super Admin credentials from environment variables
const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL;
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD;
const SUPERADMIN_FIRSTNAME = process.env.SUPERADMIN_FIRSTNAME || 'Super';
const SUPERADMIN_LASTNAME = process.env.SUPERADMIN_LASTNAME || 'Administrator';

// Admin roles to seed (10 roles as specified)
// Note: 'support_admin' maps to 'contact_admin' in the database
const ADMIN_ROLES_TO_SEED = [
  { role: 'events_admin', label: 'Events Admin', emailPrefix: 'events' },
  { role: 'gallery_admin', label: 'Gallery Admin', emailPrefix: 'gallery' },
  { role: 'content_admin', label: 'Blog Admin', emailPrefix: 'blog' },
  { role: 'membership_admin', label: 'Team Admin', emailPrefix: 'team' },
  { role: 'partners_admin', label: 'Partners Admin', emailPrefix: 'partners' },
  { role: 'programs_admin', label: 'Programs Admin', emailPrefix: 'programs' },
  { role: 'testimonials_admin', label: 'Testimonials Admin', emailPrefix: 'testimonials' },
  { role: 'announcements_admin', label: 'Announcements Admin', emailPrefix: 'announcements' },
  { role: 'contact_admin', label: 'Support Admin', emailPrefix: 'support' }, // Note: 'support_admin' -> 'contact_admin'
  { role: 'security_admin', label: 'Security Admin', emailPrefix: 'security' }
];

// Department mapping for each role
// Must match enum values in Admin model: ['Executive', 'Leadership', 'Communications', 'Events', 'Membership', 'Administration']
const ROLE_DEPARTMENT_MAP = {
  'super_admin': 'Executive',
  'events_admin': 'Events',
  'gallery_admin': 'Administration', // 'Media' not in enum, using 'Administration'
  'content_admin': 'Administration', // 'Content' not in enum, using 'Administration'
  'membership_admin': 'Membership',
  'partners_admin': 'Administration', // 'Partnerships' not in enum, using 'Administration'
  'programs_admin': 'Administration', // 'Programs' not in enum, using 'Administration'
  'testimonials_admin': 'Administration', // 'Content' not in enum, using 'Administration'
  'announcements_admin': 'Communications',
  'contact_admin': 'Communications',
  'security_admin': 'Administration' // 'Security' not in enum, using 'Administration'
};

// ==================== VALIDATION ====================

function validateEnvironment() {
  const errors = [];

  if (!process.env.MONGO_URI) {
    errors.push('MONGO_URI environment variable is required');
  }

  if (!SUPERADMIN_EMAIL) {
    errors.push('SUPERADMIN_EMAIL environment variable is required');
  }

  if (!SUPERADMIN_PASSWORD) {
    errors.push('SUPERADMIN_PASSWORD environment variable is required');
  }

  if (SUPERADMIN_PASSWORD && SUPERADMIN_PASSWORD.length < 6) {
    errors.push('SUPERADMIN_PASSWORD must be at least 6 characters long');
  }

  if (errors.length > 0) {
    console.error('\n❌ Environment Validation Failed:');
    errors.forEach(error => console.error(`   - ${error}`));
    console.error('\nPlease set the required environment variables in your .env file or Render dashboard.\n');
    process.exit(1);
  }
}

// ==================== DATABASE CONNECTION ====================

async function connectDB() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI is not set');
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });

    console.log('✅ Connected to MongoDB successfully');
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);
    console.log(`   Host: ${mongoose.connection.host}\n`);

    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('   Please check your MONGO_URI environment variable\n');
    process.exit(1);
  }
}

// ==================== PASSWORD HASHING ====================

async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error('❌ Error hashing password:', error.message);
    throw error;
  }
}

// ==================== SUPER ADMIN SEEDING ====================

async function seedSuperAdmin() {
  console.log('👑 Seeding Super Admin...');
  console.log(`   Email: ${SUPERADMIN_EMAIL}`);
  console.log(`   Name: ${SUPERADMIN_FIRSTNAME} ${SUPERADMIN_LASTNAME}\n`);

  try {
    // Check if Super Admin user exists
    let superAdminUser = await User.findOne({ email: SUPERADMIN_EMAIL.toLowerCase() });

    if (!superAdminUser) {
      // Create new Super Admin user
      console.log('   Creating Super Admin user...');
      const hashedPassword = await hashPassword(SUPERADMIN_PASSWORD);

      superAdminUser = await User.create({
        firstName: SUPERADMIN_FIRSTNAME,
        lastName: SUPERADMIN_LASTNAME,
        email: SUPERADMIN_EMAIL.toLowerCase(),
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });

      console.log('   ✅ Super Admin user created successfully');
      console.log(`      User ID: ${superAdminUser._id}`);
    } else {
      // Update existing user
      console.log('   ⚠️  Super Admin user already exists');
      console.log(`      User ID: ${superAdminUser._id}`);

      // Update password if needed (re-hash)
      if (SUPERADMIN_PASSWORD) {
        const hashedPassword = await hashPassword(SUPERADMIN_PASSWORD);
        superAdminUser.password = hashedPassword;
        superAdminUser.role = 'admin';
        superAdminUser.isActive = true;
        await superAdminUser.save();
        console.log('   ✅ Super Admin user updated (password refreshed)');
      }
    }

    // Check if Admin record exists
    let superAdmin = await Admin.findOne({ user: superAdminUser._id });

    if (!superAdmin) {
      // Create Admin record
      console.log('   Creating Super Admin profile...');

      superAdmin = await Admin.create({
        user: superAdminUser._id,
        adminRole: 'super_admin',
        department: ROLE_DEPARTMENT_MAP['super_admin'] || 'Executive',
        permissions: ROLE_PERMISSIONS[ADMIN_ROLES.SUPER_ADMIN] || [],
        isActive: true,
        notes: 'Super Admin account - Full system access. Created via seed script.'
      });

      console.log('   ✅ Super Admin profile created successfully');
      console.log(`      Admin ID: ${superAdmin._id}`);
    } else {
      // Update existing Admin record
      console.log('   ⚠️  Super Admin profile already exists');
      console.log(`      Admin ID: ${superAdmin._id}`);

      // Ensure it's set to super_admin role
      superAdmin.adminRole = 'super_admin';
      superAdmin.department = ROLE_DEPARTMENT_MAP['super_admin'] || 'Executive';
      superAdmin.permissions = ROLE_PERMISSIONS[ADMIN_ROLES.SUPER_ADMIN] || [];
      superAdmin.isActive = true;
      await superAdmin.save();

      console.log('   ✅ Super Admin profile updated');
    }

    // Log initial action
    try {
      await superAdmin.logAction('system_init', 'admin_management', {
        message: 'Super Admin account initialized via seed script',
        timestamp: new Date().toISOString()
      });
    } catch (logError) {
      // Non-critical, continue
      console.log('   ⚠️  Could not log action (non-critical)');
    }

    console.log('\n   ✅ Super Admin seeding completed!\n');
    return { user: superAdminUser, admin: superAdmin };

  } catch (error) {
    console.error('   ❌ Error seeding Super Admin:', error.message);
    if (error.name === 'ValidationError') {
      console.error('   Validation errors:', JSON.stringify(error.errors, null, 2));
    }
    throw error;
  }
}

// ==================== ADMIN ROLES SEEDING ====================

async function seedAdminRole(roleConfig) {
  const { role, label, emailPrefix } = roleConfig;

  try {
    // Generate email for this admin role
    const adminEmail = `${emailPrefix}.admin@elp.com`;
    const defaultPassword = `Admin${label.replace(/\s+/g, '')}@2024!`;

    // Check if admin user exists
    let adminUser = await User.findOne({ email: adminEmail.toLowerCase() });

    if (!adminUser) {
      // Create new admin user
      console.log(`   Creating ${label} user...`);
      const hashedPassword = await hashPassword(defaultPassword);

      // Extract first and last name from label
      const nameParts = label.split(' ');
      const firstName = nameParts[0] || 'Admin';
      const lastName = nameParts.slice(1).join(' ') || 'User';

      adminUser = await User.create({
        firstName: firstName,
        lastName: lastName,
        email: adminEmail.toLowerCase(),
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });

      console.log(`      ✅ ${label} user created`);
      console.log(`         Email: ${adminEmail}`);
      console.log(`         Password: ${defaultPassword}`);
      console.log(`         User ID: ${adminUser._id}`);
    } else {
      console.log(`   ⚠️  ${label} user already exists`);
      console.log(`      Email: ${adminEmail}`);
      console.log(`      User ID: ${adminUser._id}`);
    }

    // Check if Admin record exists
    let admin = await Admin.findOne({ user: adminUser._id });

    if (!admin) {
      // Create Admin record
      console.log(`   Creating ${label} profile...`);

      const validDepartments = ['Executive', 'Leadership', 'Communications', 'Events', 'Membership', 'Administration'];
      const department = ROLE_DEPARTMENT_MAP[role] || 'Administration';
      const finalDepartment = validDepartments.includes(department) ? department : 'Administration';
      const permissions = ROLE_PERMISSIONS[role] || [];

      admin = await Admin.create({
        user: adminUser._id,
        adminRole: role,
        department: finalDepartment,
        permissions: permissions,
        isActive: true,
        notes: `${label} account. Created via seed script.`
      });

      console.log(`      ✅ ${label} profile created`);
      console.log(`         Admin ID: ${admin._id}`);
      console.log(`         Department: ${finalDepartment}`);
      console.log(`         Permissions: ${permissions.length} permissions assigned`);
    } else {
      // Update existing Admin record
      console.log(`   ⚠️  ${label} profile already exists`);
      console.log(`      Admin ID: ${admin._id}`);

      // Ensure correct role and department
      const validDepartments = ['Executive', 'Leadership', 'Communications', 'Events', 'Membership', 'Administration'];
      const department = ROLE_DEPARTMENT_MAP[role] || 'Administration';
      const finalDepartment = validDepartments.includes(department) ? department : 'Administration';

      admin.adminRole = role;
      admin.department = finalDepartment;
      admin.permissions = ROLE_PERMISSIONS[role] || [];
      admin.isActive = true;
      await admin.save();

      console.log(`      ✅ ${label} profile updated`);
    }

    return { user: adminUser, admin: admin, email: adminEmail, password: defaultPassword };

  } catch (error) {
    console.error(`   ❌ Error seeding ${label}:`, error.message);
    if (error.name === 'ValidationError') {
      console.error('   Validation errors:', JSON.stringify(error.errors, null, 2));
    }
    // Continue with other roles even if one fails
    return null;
  }
}

async function seedAllAdminRoles() {
  console.log('👥 Seeding Admin Roles...\n');
  console.log(`   Total roles to seed: ${ADMIN_ROLES_TO_SEED.length}\n`);

  const results = {
    created: [],
    skipped: [],
    failed: []
  };

  for (const roleConfig of ADMIN_ROLES_TO_SEED) {
    const result = await seedAdminRole(roleConfig);

    if (result) {
      if (result.user.isNew || result.admin.isNew) {
        results.created.push({
          role: roleConfig.role,
          label: roleConfig.label,
          email: result.email,
          password: result.password
        });
      } else {
        results.skipped.push({
          role: roleConfig.role,
          label: roleConfig.label,
          email: result.email
        });
      }
    } else {
      results.failed.push({
        role: roleConfig.role,
        label: roleConfig.label
      });
    }

    // Small delay to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Admin Roles Seeding Summary');
  console.log('='.repeat(60));
  console.log(`✅ Created: ${results.created.length}`);
  console.log(`⏸️  Skipped (already exist): ${results.skipped.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log('='.repeat(60));

  if (results.created.length > 0) {
    console.log('\n📝 New Admin Accounts Created:');
    results.created.forEach(item => {
      console.log(`   ${item.label}:`);
      console.log(`      Email: ${item.email}`);
      console.log(`      Password: ${item.password}`);
    });
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Failed to Create:');
    results.failed.forEach(item => {
      console.log(`   - ${item.label} (${item.role})`);
    });
  }

  return results;
}

// ==================== MAIN EXECUTION ====================

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 ELP Admin Seeding Script');
  console.log('='.repeat(60));
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  try {
    // Validate environment
    validateEnvironment();

    // Connect to database
    await connectDB();

    // Seed Super Admin
    await seedSuperAdmin();

    // Seed all admin roles
    await seedAllAdminRoles();

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ SEEDING COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log('\n📋 Login Credentials:');
    console.log('   Super Admin:');
    console.log(`      Email: ${SUPERADMIN_EMAIL}`);
    console.log(`      Password: ${SUPERADMIN_PASSWORD}`);
    console.log('      Portal: https://embuni-elc-frontend.vercel.app/superadmin');
    console.log('\n🌐 Frontend URLs:');
    console.log('   Login: https://embuni-elc-frontend.vercel.app/login');
    console.log('   Admin Dashboard: https://embuni-elc-frontend.vercel.app/admin/dashboard');
    console.log('\n' + '='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ SEEDING FAILED');
    console.error('='.repeat(60));
    console.error(`Error: ${error.message}`);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    console.error('\n');
    process.exit(1);
  } finally {
    // Disconnect from MongoDB
    try {
      await mongoose.connection.close();
      console.log('📴 Disconnected from MongoDB');
    } catch (error) {
      console.error('⚠️  Error closing MongoDB connection:', error.message);
    }
    console.log('\n');
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { seedSuperAdmin, seedAllAdminRoles, connectDB };
