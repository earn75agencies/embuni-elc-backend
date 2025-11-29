const Member = require('../models/Member');
const { asyncHandler, APIError } = require('../middleware/errorMiddleware');
const cache = require('../config/cache');

/**
 * Get all members with filtering
 * GET /api/members
 */
exports.getAllMembers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const query = { membershipStatus: 'active' };

  if (req.query.role) {
    query.leadershipRole = req.query.role;
  }

  if (req.query.tier) {
    query.membershipTier = req.query.tier;
  }

  // Create cache key for public queries
  const cacheKey = `members:${JSON.stringify(query)}:${page}:${limit}`;

  // Check cache for public queries (active members, no filters)
  if (query.membershipStatus === 'active' && !req.query.role && !req.query.tier) {
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }
  }

  // Use lean() and parallel queries for better performance
  const [members, total] = await Promise.all([
    Member.find(query)
      .populate('user', 'firstName lastName avatar bio')
      .limit(limit)
      .skip(skip)
      .sort({ totalPoints: -1, joinedDate: -1 })
      .lean(),
    Member.countDocuments(query)
  ]);

  const response = {
    success: true,
    count: members.length,
    total,
    pages: Math.ceil(total / limit),
    page,
    members
  };

  // Cache public queries for 2 minutes
  if (query.membershipStatus === 'active' && !req.query.role && !req.query.tier) {
    cache.set(cacheKey, response, 120000);
  }

  res.status(200).json(response);
});

/**
 * Get member profile
 * GET /api/members/:id
 */
exports.getMemberById = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id)
    .populate('user', 'firstName lastName avatar email bio phone');

  if (!member) {
    throw new APIError('Member not found', 404);
  }

  res.status(200).json({
    success: true,
    member
  });
});

/**
 * Get member by user ID
 * GET /api/members/user/:userId
 */
exports.getMemberByUserId = asyncHandler(async (req, res) => {
  const member = await Member.findOne({ user: req.params.userId })
    .populate('user', 'firstName lastName avatar email bio phone');

  if (!member) {
    throw new APIError('Member profile not found', 404);
  }

  res.status(200).json({
    success: true,
    member
  });
});

/**
 * Update member profile
 * PUT /api/members/:id
 */
exports.updateMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);

  if (!member) {
    throw new APIError('Member not found', 404);
  }

  // Check authorization
  // NEW ADMIN STRUCTURE: Admin access is determined by Admin model via req.isAdmin
  if (member.user.toString() !== req.user._id.toString() && !req.isAdmin) {
    throw new APIError('Not authorized to update this profile', 403);
  }

  // Update allowed fields
  const allowedFields = [
    'skills',
    'interests',
    'bio',
    'portfolio',
    'emailNotifications',
    'eventNotifications'
  ];

  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      member[key] = req.body[key];
    }
  });

  await member.save();

  res.status(200).json({
    success: true,
    message: 'Member profile updated successfully',
    member
  });
});

/**
 * Get member statistics
 * GET /api/members/stats/:id
 */
exports.getMemberStats = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);

  if (!member) {
    throw new APIError('Member not found', 404);
  }

  const stats = {
    volunteerHours: member.volunteerHours,
    eventsAttended: member.eventsAttended,
    eventsOrganized: member.eventsOrganized,
    postsCreated: member.postsCreated,
    badgesEarned: member.badges.length,
    totalPoints: member.totalPoints,
    rank: member.rank,
    membershipTier: member.membershipTier,
    joinedDate: member.joinedDate,
    lastActivityDate: member.lastActivityDate
  };

  res.status(200).json({
    success: true,
    stats
  });
});

/**
 * Get leadership team
 * GET /api/members/leadership/team
 */
exports.getLeadershipTeam = asyncHandler(async (req, res) => {
  const leaders = await Member.find({
    leadershipRole: { $ne: 'none' },
    membershipStatus: 'active'
  })
    .populate('user', 'firstName lastName avatar bio')
    .sort({ leadershipStartDate: 1 });

  res.status(200).json({
    success: true,
    count: leaders.length,
    leaders
  });
});

/**
 * Promote member to leadership (admin only)
 * PUT /api/members/:id/promote
 */
exports.promoteToLeadership = asyncHandler(async (req, res) => {
  const { role, department } = req.body;

  if (!role || !department) {
    throw new APIError('Role and department are required', 400);
  }

  const member = await Member.findById(req.params.id);

  if (!member) {
    throw new APIError('Member not found', 404);
  }

  await member.promoteToLeadership(role, department);

  res.status(200).json({
    success: true,
    message: `Member promoted to ${role}`,
    member
  });
});

/**
 * Remove leadership (admin only)
 * PUT /api/members/:id/demote
 */
exports.demoteFromLeadership = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);

  if (!member) {
    throw new APIError('Member not found', 404);
  }

  member.leadershipRole = 'none';
  member.leadershipDepartment = null;
  member.leadershipEndDate = new Date();
  await member.save();

  res.status(200).json({
    success: true,
    message: 'Member removed from leadership',
    member
  });
});

/**
 * Add volunteer hours (admin only)
 * PUT /api/members/:id/volunteer-hours
 */
exports.addVolunteerHours = asyncHandler(async (req, res) => {
  const { hours } = req.body;

  if (!hours || hours <= 0) {
    throw new APIError('Valid hours value is required', 400);
  }

  const member = await Member.findById(req.params.id);

  if (!member) {
    throw new APIError('Member not found', 404);
  }

  await member.addVolunteerHours(hours);

  res.status(200).json({
    success: true,
    message: `${hours} volunteer hours added`,
    volunteerHours: member.volunteerHours,
    totalPoints: member.totalPoints
  });
});

/**
 * Award badge to member (admin only)
 * POST /api/members/:id/badge
 */
exports.awardBadge = asyncHandler(async (req, res) => {
  const { name, description, icon } = req.body;

  if (!name || !description) {
    throw new APIError('Badge name and description are required', 400);
  }

  const member = await Member.findById(req.params.id);

  if (!member) {
    throw new APIError('Member not found', 404);
  }

  const badge = { name, description, icon: icon || null };
  await member.awardBadge(badge);

  res.status(200).json({
    success: true,
    message: 'Badge awarded successfully',
    badges: member.badges,
    totalPoints: member.totalPoints
  });
});

/**
 * Get member leaderboard
 * GET /api/members/leaderboard
 */
exports.getLeaderboard = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;

  const members = await Member.find({ membershipStatus: 'active' })
    .populate('user', 'firstName lastName avatar')
    .limit(limit)
    .sort({ totalPoints: -1 });

  const leaderboard = members.map((member, index) => ({
    rank: index + 1,
    ...member.toObject()
  }));

  res.status(200).json({
    success: true,
    count: leaderboard.length,
    leaderboard
  });
});

/**
 * Search members
 * GET /api/members/search/:query
 */
exports.searchMembers = asyncHandler(async (req, res) => {
  const { query } = req.params;

  const members = await Member.find({
    $or: [
      { 'user.firstName': { $regex: query, $options: 'i' } },
      { 'user.lastName': { $regex: query, $options: 'i' } },
      { membershipNumber: { $regex: query, $options: 'i' } },
      { skills: { $regex: query, $options: 'i' } }
    ]
  })
    .populate('user', 'firstName lastName avatar')
    .limit(20);

  res.status(200).json({
    success: true,
    count: members.length,
    members
  });
});
