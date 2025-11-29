const GalleryItem = require('../models/GalleryItem');
const { asyncHandler, APIError } = require('../middleware/errorMiddleware');
const cache = require('../config/cache');

/**
 * Get all gallery items with filtering
 * GET /api/gallery
 */
exports.getAllGalleryItems = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const query = { status: 'approved' };

  if (req.query.category) {
    query.category = req.query.category;
  }

  if (req.query.featured === 'true') {
    query.isFeatured = true;
  }

  // Create cache key for public queries
  const cacheKey = `gallery:${JSON.stringify(query)}:${page}:${limit}`;

  // Check cache for public queries
  if (query.status === 'approved' && !req.query.category && !req.query.featured) {
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }
  }

  // Use lean() and parallel queries for better performance
  const [items, total] = await Promise.all([
    GalleryItem.find(query)
      .populate('uploadedBy', 'firstName lastName avatar')
      .populate('eventReference', 'title startDate')
      .limit(limit)
      .skip(skip)
      .sort({ dateTaken: -1 })
      .lean(),
    GalleryItem.countDocuments(query)
  ]);

  const response = {
    success: true,
    count: items.length,
    total,
    pages: Math.ceil(total / limit),
    page,
    items
  };

  // Cache public queries for 2 minutes
  if (query.status === 'approved' && !req.query.category && !req.query.featured) {
    cache.set(cacheKey, response, 120000);
  }

  res.status(200).json(response);
});

/**
 * Get single gallery item
 * GET /api/gallery/:id
 */
exports.getGalleryItemById = asyncHandler(async (req, res) => {
  const item = await GalleryItem.findById(req.params.id)
    .populate('uploadedBy', 'firstName lastName avatar')
    .populate('eventReference', 'title startDate');

  if (!item) {
    throw new APIError('Gallery item not found', 404);
  }

  // Use updateOne for better performance instead of save
  await GalleryItem.updateOne(
    { _id: req.params.id },
    { $inc: { views: 1 } }
  );
  // Update local object for response
  item.views = (item.views || 0) + 1;

  res.status(200).json({
    success: true,
    item
  });
});

/**
 * Create gallery item
 * POST /api/gallery
 */
exports.createGalleryItem = asyncHandler(async (req, res) => {
  // Check if user is admin
  // NEW ADMIN STRUCTURE: Admin access is determined by Admin model via req.isAdmin
  const isAdmin = req.isAdmin || false;

  // Auto-approve admin uploads
  const status = isAdmin ? 'approved' : 'pending';

  // Ensure required fields for admins
  if (isAdmin) {
    req.body.title = req.body.title || 'Admin Upload';
    req.body.description = req.body.description || 'Uploaded by admin';
    req.body.category = req.body.category || 'other';
  }

  // For admins, ensure all required fields and bypass validation
  let item;
  if (isAdmin) {
    // Ensure all required fields exist
    req.body.title = req.body.title || 'Admin Upload';
    req.body.description = req.body.description || 'Uploaded by admin';
    req.body.category = req.body.category || 'other';

    // Create without strict validation
    item = new GalleryItem({
      ...req.body,
      uploadedBy: req.user._id,
      status: status
    });
    await item.save({ validateBeforeSave: false });
  } else {
    item = await GalleryItem.create({
      ...req.body,
      uploadedBy: req.user._id,
      status: status
    });
  }

  await item.populate('uploadedBy', 'firstName lastName avatar');

  res.status(201).json({
    success: true,
    message: 'Gallery item uploaded successfully. Awaiting moderation.',
    item
  });
});

/**
 * Update gallery item
 * PUT /api/gallery/:id
 */
exports.updateGalleryItem = asyncHandler(async (req, res) => {
  const item = await GalleryItem.findById(req.params.id);

  if (!item) {
    throw new APIError('Gallery item not found', 404);
  }

  // Check authorization
  // NEW ADMIN STRUCTURE: Admin access is determined by Admin model via req.isAdmin
  if (item.uploadedBy.toString() !== req.user._id.toString() && !req.isAdmin) {
    throw new APIError('Not authorized to update this item', 403);
  }

  // Update allowed fields
  const allowedFields = ['title', 'description', 'category', 'tags', 'photographer', 'credits'];
  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      item[key] = req.body[key];
    }
  });

  await item.save();
  await item.populate('uploadedBy', 'firstName lastName avatar');

  res.status(200).json({
    success: true,
    message: 'Gallery item updated successfully',
    item
  });
});

/**
 * Delete gallery item
 * DELETE /api/gallery/:id
 */
exports.deleteGalleryItem = asyncHandler(async (req, res) => {
  const item = await GalleryItem.findById(req.params.id);

  if (!item) {
    throw new APIError('Gallery item not found', 404);
  }

  // NEW ADMIN STRUCTURE: Admin access is determined by Admin model via req.isAdmin
  if (item.uploadedBy.toString() !== req.user._id.toString() && !req.isAdmin) {
    throw new APIError('Not authorized to delete this item', 403);
  }

  // Permanently delete gallery item from database
  await GalleryItem.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Gallery item permanently deleted from database'
  });
});

/**
 * Like/Unlike gallery item
 * POST /api/gallery/:id/like
 */
exports.toggleLike = asyncHandler(async (req, res) => {
  const item = await GalleryItem.findById(req.params.id);

  if (!item) {
    throw new APIError('Gallery item not found', 404);
  }

  const userLiked = item.likes.some(
    (like) => like.toString() === req.user._id.toString()
  );

  if (userLiked) {
    item.likes = item.likes.filter(
      (like) => like.toString() !== req.user._id.toString()
    );
  } else {
    item.likes.push(req.user._id);
  }

  await item.save();

  res.status(200).json({
    success: true,
    message: userLiked ? 'Like removed' : 'Gallery item liked',
    likes: item.likes.length
  });
});

/**
 * Get pending gallery items (admin only)
 * GET /api/gallery/pending
 */
exports.getPendingItems = asyncHandler(async (req, res) => {
  const items = await GalleryItem.find({ status: 'pending' })
    .populate('uploadedBy', 'firstName lastName avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: items.length,
    items
  });
});

/**
 * Approve gallery item (admin only)
 * PUT /api/gallery/:id/approve
 */
exports.approveItem = asyncHandler(async (req, res) => {
  const item = await GalleryItem.findById(req.params.id);

  if (!item) {
    throw new APIError('Gallery item not found', 404);
  }

  item.status = 'approved';
  await item.save();

  res.status(200).json({
    success: true,
    message: 'Gallery item approved successfully'
  });
});

/**
 * Reject gallery item (admin only)
 * PUT /api/gallery/:id/reject
 */
exports.rejectItem = asyncHandler(async (req, res) => {
  const item = await GalleryItem.findById(req.params.id);

  if (!item) {
    throw new APIError('Gallery item not found', 404);
  }

  item.status = 'rejected';
  await item.save();

  res.status(200).json({
    success: true,
    message: 'Gallery item rejected'
  });
});

/**
 * Get gallery items by category
 * GET /api/gallery/category/:category
 */
exports.getByCategory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const items = await GalleryItem.find({
    category: req.params.category,
    status: 'approved'
  })
    .populate('uploadedBy', 'firstName lastName avatar')
    .limit(limit)
    .skip(skip)
    .sort({ dateTaken: -1 });

  const total = await GalleryItem.countDocuments({
    category: req.params.category,
    status: 'approved'
  });

  res.status(200).json({
    success: true,
    count: items.length,
    total,
    pages: Math.ceil(total / limit),
    items
  });
});
