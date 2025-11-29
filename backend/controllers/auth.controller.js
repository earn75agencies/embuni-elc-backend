const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Member = require("../models/Member");
const Admin = require("../models/Admin");
const authValidator = require("../validators/authValidator");
const { asyncHandler, APIError } = require("../middleware/errorMiddleware");
const { ROLE_PERMISSIONS } = require("../constants/adminRoles");
const logger = require("../utils/logger");

/**
 * Generate JWT Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Department mapping - must use valid enum values from Admin model:
// ['Executive', 'Leadership', 'Communications', 'Events', 'Membership', 'Administration']
const roleDepartmentMap = {
  super_admin: "Executive",
  design_admin: "Administration", // Home page
  about_admin: "Administration", // About page
  programs_admin: "Administration", // Programs page
  events_admin: "Events", // Events page
  content_admin: "Administration", // News page
  gallery_admin: "Administration", // Gallery page
  resources_admin: "Administration", // Resources page
  contact_admin: "Communications", // Contact page
};

const resolveDepartment = (role, fallback) => {
  if (fallback) {
    return fallback;
  }
  return roleDepartmentMap[role] || "Administration";
};

/**
 * Register new user
 * POST /api/auth/register
 */
exports.register = asyncHandler(async (req, res) => {
  // Clean up request body: remove empty strings for optional fields
  // IMPORTANT: Do NOT remove confirmPassword - it's required for validation
  const cleanedBody = { ...req.body };

  // Ensure confirmPassword is a string (not undefined/null)
  if (!cleanedBody.confirmPassword && cleanedBody.password) {
    // If confirmPassword is missing but password exists, copy password
    // This handles cases where frontend might have removed it
    cleanedBody.confirmPassword = cleanedBody.password;
  }

  // Clean optional fields
  if (cleanedBody.phone && cleanedBody.phone.trim() === "") {
    delete cleanedBody.phone;
  }
  if (cleanedBody.studentId && cleanedBody.studentId.trim() === "") {
    delete cleanedBody.studentId;
  }
  if (cleanedBody.course && cleanedBody.course.trim() === "") {
    delete cleanedBody.course;
  }
  if (
    cleanedBody.yearOfStudy === "" ||
    cleanedBody.yearOfStudy === null ||
    cleanedBody.yearOfStudy === undefined
  ) {
    delete cleanedBody.yearOfStudy;
  } else if (cleanedBody.yearOfStudy) {
    // Convert to number if it's a string
    const yearNum = parseInt(cleanedBody.yearOfStudy);
    if (!isNaN(yearNum)) {
      cleanedBody.yearOfStudy = yearNum;
    } else {
      delete cleanedBody.yearOfStudy;
    }
  }

  // Validate input
  const errors = authValidator.validateRegister(cleanedBody);
  if (errors) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    studentId,
    course,
    yearOfStudy,
  } = cleanedBody;

  // Check if user exists
  let user = await User.findOne({ email });
  if (user) {
    throw new APIError("Email already in use", 400);
  }

  // Create user with optional fields
  const userData = {
    firstName,
    lastName,
    email,
    password,
  };

  // Add optional fields only if they exist
  if (phone) {
    userData.phone = phone;
  }
  if (studentId) {
    userData.studentId = studentId;
  }
  if (course) {
    userData.course = course;
  }
  if (yearOfStudy) {
    userData.yearOfStudy = yearOfStudy;
  }

  user = await User.create(userData);

  // Create member profile
  const memberCount = await Member.countDocuments();
  const membershipNumber = `ELP${new Date().getFullYear()}${String(memberCount + 1).padStart(4, "0")}`;

  const member = await Member.create({
    user: user._id,
    membershipNumber,
    membershipStatus: "active",
    membershipTier: "basic",
  });

  // Generate token
  const token = generateToken(user._id);

  // Return response
  res.status(201).json({
    success: true,
    message: "User registered successfully",
    token,
    user: user.getProfileInfo(),
  });
});

/**
 * Login user
 * POST /api/auth/login
 */
exports.login = asyncHandler(async (req, res) => {
  // Validate input
  const errors = authValidator.validateLogin(req.body);
  if (errors) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  const { email, password } = req.body;

  // Optimize query with lean() and index hint
  const user = await User.findOne({ email }).select("+password").lean().exec();

  if (!user) {
    throw new APIError("Invalid credentials", 401);
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new APIError("Invalid credentials", 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new APIError("Account is deactivated", 403);
  }

  // Update last login asynchronously (non-blocking)
  setImmediate(async () => {
    try {
      await User.updateOne({ _id: user._id }, { lastLogin: new Date() });
    } catch (error) {
      logger.warn("Failed to update last login:", error);
    }
  });

  // Generate token
  const token = generateToken(user._id);

  // Return response without sensitive data
  const { password: _, ...userProfile } = user;

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: userProfile,
  });
});

/**
 * Get current user profile
 * GET /api/auth/profile
 */
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new APIError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    user: user.getProfileInfo(),
  });
});

/**
 * Update user profile
 * PUT /api/auth/profile
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  // Validate input
  const errors = authValidator.validateProfileUpdate(req.body);
  if (errors) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new APIError("User not found", 404);
  }

  // Update allowed fields
  const allowedFields = ["firstName", "lastName", "phone", "bio", "avatar"];
  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      user[key] = req.body[key];
    }
  });

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: user.getProfileInfo(),
  });
});

/**
 * Change password
 * POST /api/auth/change-password
 */
exports.changePassword = asyncHandler(async (req, res) => {
  // Validate input
  const errors = authValidator.validatePasswordChange(req.body);
  if (errors) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    throw new APIError("User not found", 404);
  }

  // Check current password
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new APIError("Current password is incorrect", 401);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

/**
 * Logout user
 * POST /api/auth/logout
 */
exports.logout = asyncHandler(async (req, res) => {
  // On client side, token should be removed from localStorage
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

/**
 * Google OAuth callback
 * GET /api/auth/google/callback
 */
exports.googleCallback = asyncHandler(async (req, res) => {
  // This is handled by Passport middleware
  // After authentication, user is attached to req.user

  const user = req.user;

  if (!user) {
    throw new APIError("Authentication failed", 401);
  }

  // Check if member profile exists
  const member = await Member.findOne({ user: user._id });
  if (!member) {
    const memberCount = await Member.countDocuments();
    const membershipNumber = `ELP${new Date().getFullYear()}${String(memberCount + 1).padStart(4, "0")}`;

    await Member.create({
      user: user._id,
      membershipNumber,
      membershipStatus: "active",
      membershipTier: "basic",
    });
  }

  // Generate token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Google authentication successful",
    token,
    user: user.getProfileInfo(),
  });
});

/**
 * Get all users (admin only)
 * GET /api/auth/users
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Use lean() and parallel queries for better performance
  const [users, total] = await Promise.all([
    User.find()
      .select("-password") // Exclude password field
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .lean(),
    User.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    pages: Math.ceil(total / limit),
    page,
    users,
  });
});

/**
 * Get user by ID (admin or self)
 * GET /api/auth/users/:id
 */
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new APIError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    user: user.getProfileInfo(),
  });
});

/**
 * Update user role (admin only)
 * PUT /api/auth/users/:id/role
 */
exports.updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const validRoles = ["member", "leader", "moderator", "admin"];

  if (!role || !validRoles.includes(role)) {
    throw new APIError("Invalid role", 400);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true },
  );

  if (!user) {
    throw new APIError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "User role updated successfully",
    user: user.getProfileInfo(),
  });
});

/**
 * Delete user (admin only)
 * Permanently deletes user and all associated records from database
 * DELETE /api/auth/users/:id
 */
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new APIError("User not found", 404);
  }

  const userId = user._id;

  // Delete admin record if exists
  await Admin.deleteOne({ user: userId });

  // Delete member profile
  await Member.deleteOne({ user: userId });

  // Delete all posts by this user
  const Post = require("../models/Post");
  await Post.deleteMany({ author: userId });

  // Delete all events by this user
  const Event = require("../models/Event");
  await Event.deleteMany({ organizer: userId });

  // Delete all gallery items by this user
  const GalleryItem = require("../models/GalleryItem");
  await GalleryItem.deleteMany({ uploadedBy: userId });

  // Delete comments by this user in posts
  await Post.updateMany(
    { "comments.user": userId },
    { $pull: { comments: { user: userId } } },
  );

  // Delete other related records
  const Notification = require("../models/Notification");
  await Notification.deleteMany({ user: userId });

  const TwoFactorAuth = require("../models/TwoFactorAuth");
  await TwoFactorAuth.deleteOne({ user: userId });

  // Delete the user
  await User.findByIdAndDelete(userId);

  res.status(200).json({
    success: true,
    message:
      "User and all associated records deleted successfully from database",
  });
});

/**
 * Deactivate user account
 * POST /api/auth/deactivate
 */
exports.deactivateAccount = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { isActive: false },
    { new: true },
  );

  res.status(200).json({
    success: true,
    message: "Account deactivated successfully",
  });
});

/**
 * Create admin login credentials (Super Admin only)
 * POST /api/auth/admin/create-login
 */
exports.createAdminLogin = asyncHandler(async (req, res) => {
  const { email, firstName, lastName, password, adminRole } = req.body;

  // Validate required fields
  if (!email || !email.trim()) {
    throw new APIError("Email is required", 400);
  }
  if (!firstName || !firstName.trim()) {
    throw new APIError("First name is required", 400);
  }
  if (!lastName || !lastName.trim()) {
    throw new APIError("Last name is required", 400);
  }
  if (!password || password.trim() === "") {
    throw new APIError("Password is required", 400);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    throw new APIError("Invalid email format", 400);
  }

  // Validate password strength
  if (password.length < 8) {
    throw new APIError("Password must be at least 8 characters", 400);
  }

  // Check if email already exists
  const existingUser = await User.findOne({
    email: email.trim().toLowerCase(),
  });
  if (existingUser) {
    throw new APIError("Email already in use", 400);
  }

  // Create new admin user (trim all string fields)
  // NOTE: Setting role to 'admin' is for reference only. Actual admin access
  // is determined by the Admin model. Authorization checks use Admin model, not User.role.
  const user = await User.create({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim().toLowerCase(),
    password,
    role: "admin", // For reference only - actual admin access comes from Admin model
    isActive: true,
  });

  // If adminRole is provided, create Admin record
  let admin = null;
  if (adminRole) {
    const validRoles = Object.keys(ROLE_PERMISSIONS);
    if (!validRoles.includes(adminRole)) {
      throw new APIError(
        `Invalid admin role: ${adminRole}. Valid roles: ${validRoles.join(", ")}`,
        400,
      );
    }

    // Check for active admins - allow creation if all existing admins are inactive
    const activeAdmins = await Admin.countDocuments({ isActive: true });
    if (activeAdmins >= 1) {
      // If there's an active admin, delete the user we just created and throw error
      await User.findByIdAndDelete(user._id);
      const activeAdminList = await Admin.find({ isActive: true })
        .select("_id adminRole")
        .populate("user", "email");
      throw new APIError(
        `Only one active admin can exist in the system. Found ${activeAdmins} active admin(s). Please delete or deactivate the existing active admin(s) before creating a new one.`,
        400,
      );
    }

    // Validate and resolve department (must be valid enum value)
    const validDepartments = [
      "Executive",
      "Leadership",
      "Communications",
      "Events",
      "Membership",
      "Administration",
    ];
    let department = resolveDepartment(adminRole);
    if (!validDepartments.includes(department)) {
      department = "Administration"; // Fallback to valid enum value
    }

    const permissions = ROLE_PERMISSIONS[adminRole];
    if (!permissions || !Array.isArray(permissions)) {
      throw new APIError(`Invalid permissions for role: ${adminRole}`, 400);
    }

    try {
      // Double-check for active admins before creating
      const finalCheck = await Admin.countDocuments({ isActive: true });
      if (finalCheck >= 1) {
        await User.findByIdAndDelete(user._id);
        const activeAdminList = await Admin.find({ isActive: true })
          .select("_id adminRole")
          .populate("user", "email");
        throw new APIError(
          `Only one active admin can exist in the system. Found ${finalCheck} active admin(s). Please delete or deactivate the existing active admin(s) before creating a new one.`,
          400,
        );
      }

      admin = await Admin.create({
        user: user._id,
        adminRole,
        permissions,
        department: department,
        isActive: true,
        notes: `Admin account created by ${req.user?.email || "system"}`,
      });
    } catch (dbError) {
      // If Admin creation fails, delete the user to maintain consistency
      await User.findByIdAndDelete(user._id);

      // Handle unique index constraint errors
      if (
        dbError.code === 11000 ||
        (dbError.name === "MongoServerError" &&
          dbError.message &&
          dbError.message.includes("isActive"))
      ) {
        const activeAdmins = await Admin.find({ isActive: true })
          .select("_id adminRole")
          .populate("user", "email");
        throw new APIError(
          "Cannot create admin: Unique constraint violation. There is already an active admin in the system. Please delete or deactivate existing active admin(s) first.",
          400,
        );
      }

      // Provide detailed error message
      if (dbError.name === "ValidationError") {
        const validationErrors = Object.values(dbError.errors)
          .map((err) => err.message)
          .join(", ");
        throw new APIError(`Admin validation failed: ${validationErrors}`, 400);
      } else if (dbError.code === 11000) {
        throw new APIError("Admin record already exists for this user", 400);
      } else {
        throw new APIError(
          `Failed to create admin record: ${dbError.message}`,
          500,
        );
      }
    }

    // Log the action if super admin is creating this
    const superAdmin = await Admin.findOne({ user: req.user._id });
    if (superAdmin) {
      await superAdmin.logAction("create_admin_login", "admin_management", {
        targetUserId: user._id,
        adminRole: adminRole,
        userName: `${user.firstName} ${user.lastName}`,
      });
    }
  }

  // Generate token for immediate use if needed
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: "Admin login credentials created successfully",
    data: {
      userId: user._id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      createdAt: user.createdAt,
      adminRole: admin?.adminRole || null,
      adminId: admin?._id || null,
      token, // Temporary token for first setup
    },
  });
});

/**
 * Assign admin role to existing user (Super Admin only)
 * POST /api/auth/admin/assign-role
 */
exports.assignAdminRole = asyncHandler(async (req, res) => {
  const { userId, adminRole } = req.body;

  if (!userId || !adminRole) {
    throw new APIError("User ID and admin role are required", 400);
  }

  const validRoles = Object.keys(ROLE_PERMISSIONS);
  if (!validRoles.includes(adminRole)) {
    throw new APIError("Invalid admin role", 400);
  }

  const permissions = ROLE_PERMISSIONS[adminRole];

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new APIError("User not found", 404);
  }

  // Update user role (for reference only - actual admin access comes from Admin model)
  // NOTE: Authorization checks use Admin model, not User.role
  user.role = "admin";
  await user.save();

  // Validate and resolve department (must be valid enum value)
  const validDepartments = [
    "Executive",
    "Leadership",
    "Communications",
    "Events",
    "Membership",
    "Administration",
  ];
  let department = resolveDepartment(adminRole);
  if (!validDepartments.includes(department)) {
    department = "Administration"; // Fallback to valid enum value
  }

  // Check for active admins - allow creation if all existing admins are inactive
  const activeAdmins = await Admin.countDocuments({ isActive: true });
  if (activeAdmins >= 1) {
    // Check if this user is the existing active admin
    const existingAdmin = await Admin.findOne({ user: userId, isActive: true });
    if (!existingAdmin) {
      throw new APIError(
        "Only one active admin can exist in the system. Please deactivate the existing active admin before assigning a new one.",
        400,
      );
    }
    // If this user is already the active admin, allow update
  }

  // Create or update admin record
  let admin = await Admin.findOne({ user: userId });

  if (!admin) {
    // Double-check for active admins before creating
    const finalCheck = await Admin.countDocuments({ isActive: true });
    if (finalCheck >= 1) {
      throw new APIError(
        "Only one active admin can exist in the system. Please deactivate the existing active admin before creating a new one.",
        400,
      );
    }

    admin = await Admin.create({
      user: userId,
      adminRole,
      permissions,
      department: department,
      isActive: true,
    });
  } else {
    // Ensure department is valid enum value
    let updatedDepartment = resolveDepartment(adminRole, admin.department);
    if (!validDepartments.includes(updatedDepartment)) {
      updatedDepartment = "Administration";
    }

    admin.adminRole = adminRole;
    admin.permissions = permissions;
    admin.department = updatedDepartment;
    admin.isActive = true;
    await admin.save();
  }

  await admin.populate("user", "firstName lastName email");

  // Log the action
  const superAdmin = await Admin.findOne({ user: req.user._id });
  if (superAdmin) {
    await superAdmin.logAction("assign_admin_role", "admin_management", {
      targetUserId: userId,
      adminRole: adminRole,
      userName: `${user.firstName} ${user.lastName}`,
    });
  }

  res.status(200).json({
    success: true,
    message: `Admin role '${adminRole}' assigned successfully`,
    data: admin,
  });
});

/**
 * Generate temporary admin password (Super Admin only)
 * POST /api/auth/admin/reset-password
 */
exports.resetAdminPassword = asyncHandler(async (req, res) => {
  const { adminId } = req.body;

  if (!adminId) {
    throw new APIError("Admin ID is required", 400);
  }

  // Generate random password
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let temporaryPassword = "";
  for (let i = 0; i < 12; i++) {
    temporaryPassword += characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
  }

  // Find admin and update password
  const admin = await Admin.findById(adminId).populate("user");

  if (!admin) {
    throw new APIError("Admin not found", 404);
  }

  // Update user password
  const user = admin.user;
  user.password = temporaryPassword;
  await user.save();

  // Log the action
  const superAdmin = await Admin.findOne({ user: req.user._id });
  if (superAdmin) {
    await superAdmin.logAction("reset_admin_password", "admin_management", {
      targetAdminId: adminId,
      targetEmail: user.email,
    });
  }

  res.status(200).json({
    success: true,
    message: "Admin password reset successfully",
    data: {
      adminEmail: user.email,
      temporaryPassword: temporaryPassword,
      adminName: `${user.firstName} ${user.lastName}`,
      note: "Share this temporary password with the admin. They should change it on first login.",
    },
  });
});

/**
 * Get all admin credentials (Super Admin only)
 * GET /api/auth/admin/all-logins
 */
exports.getAllAdminLogins = asyncHandler(async (req, res) => {
  const admins = await Admin.find({ isActive: true })
    .populate("user", "firstName lastName email role createdAt")
    .sort({ createdAt: -1 });

  const adminLogins = admins.map((admin) => ({
    adminId: admin._id,
    userId: admin.user._id,
    name: `${admin.user.firstName} ${admin.user.lastName}`,
    email: admin.user.email,
    adminRole: admin.adminRole,
    department: admin.department,
    lastLogin: admin.lastLogin,
    createdAt: admin.user.createdAt,
    isActive: admin.isActive,
    status: admin.lastLogin ? "Active" : "Never Logged In",
  }));

  res.status(200).json({
    success: true,
    count: adminLogins.length,
    data: adminLogins,
  });
});

/**
 * Deactivate admin credentials (Super Admin only)
 * Deletes admin and user details from database but preserves their uploads (posts, events, gallery items)
 * PUT /api/auth/admin/:adminId/deactivate
 */
exports.deactivateAdminCredentials = asyncHandler(async (req, res) => {
  const { adminId } = req.params;

  if (!adminId) {
    throw new APIError("Admin ID is required", 400);
  }

  const admin = await Admin.findById(adminId).populate(
    "user",
    "firstName lastName email",
  );

  if (!admin) {
    throw new APIError("Admin not found", 404);
  }

  const userId = admin.user._id;
  const userEmail = admin.user.email;

  // Delete admin record
  await Admin.findByIdAndDelete(adminId);

  // Delete user account (this also deletes the email, making it available for reuse)
  await User.findByIdAndDelete(userId);

  // Delete member profile if exists
  await Member.deleteOne({ user: userId });

  // Delete comments by this user in posts (but keep posts)
  const Post = require("../models/Post");
  await Post.updateMany(
    { "comments.user": userId },
    { $pull: { comments: { user: userId } } },
  );

  // Delete other related records
  const Notification = require("../models/Notification");
  await Notification.deleteMany({ user: userId });

  const TwoFactorAuth = require("../models/TwoFactorAuth");
  await TwoFactorAuth.deleteOne({ user: userId });

  // Log the action (before deleting superAdmin record if it's the same)
  const superAdmin = await Admin.findOne({ user: req.user._id });
  if (superAdmin && superAdmin._id.toString() !== adminId) {
    await superAdmin.logAction("deactivate_admin", "admin_management", {
      targetAdminId: adminId,
      targetEmail: userEmail,
    });
  }

  // NOTE: Posts, Events, and Gallery items are preserved (not deleted)

  res.status(200).json({
    success: true,
    message:
      "Admin credentials deactivated and details deleted from database. Email is now available for reuse. Uploads (posts, events, gallery items) have been preserved.",
  });
});

/**
 * Reactivate admin credentials (Super Admin only)
 * PUT /api/auth/admin/:adminId/reactivate
 */
exports.reactivateAdminCredentials = asyncHandler(async (req, res) => {
  const { adminId } = req.params;

  if (!adminId) {
    throw new APIError("Admin ID is required", 400);
  }

  const admin = await Admin.findByIdAndUpdate(
    adminId,
    { isActive: true },
    { new: true },
  ).populate("user", "firstName lastName email");

  if (!admin) {
    throw new APIError("Admin not found", 404);
  }

  // Also reactivate the user account
  await User.findByIdAndUpdate(admin.user._id, { isActive: true });

  // Log the action
  const superAdmin = await Admin.findOne({ user: req.user._id });
  if (superAdmin) {
    await superAdmin.logAction("reactivate_admin", "admin_management", {
      targetAdminId: adminId,
      targetEmail: admin.user.email,
    });
  }

  res.status(200).json({
    success: true,
    message: "Admin credentials reactivated successfully",
    data: admin,
  });
});
b;
