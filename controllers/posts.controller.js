const Post = require('../models/Post');
const postValidator = require('../validators/postValidator');
const { asyncHandler, APIError } = require('../middleware/errorMiddleware');
const cache = require('../utils/cache');

/**
 * Get all posts with filtering
 * GET /api/posts
 */
exports.getAllPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};

  // If user is admin, they can see all posts (including drafts)
  // Otherwise, only show published posts
  // NEW ADMIN STRUCTURE: Admin access is determined by Admin model via req.isAdmin
  if (req.query.status === 'all' && req.isAdmin) {
    // Admin can see all statuses
    // Don't filter by status
  } else {
    // Non-admin users only see published posts
    query.status = 'published';
  }

  if (req.query.category) {
    query.category = req.query.category;
  }

  if (req.query.featured === 'true') {
    query.isFeatured = true;
  }

  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { content: { $regex: req.query.search, $options: 'i' } },
      { excerpt: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Create cache key
  const cacheKey = `posts:${JSON.stringify(query)}:${page}:${limit}`;

  // Check cache for public queries (no search, no admin filters)
  if (!req.query.search && !req.isAdmin && query.status === 'published') {
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }
  }

  // Use lean() for read-only queries - much faster
  const [posts, total] = await Promise.all([
    Post.find(query)
      .populate('author', 'firstName lastName avatar')
      .limit(limit)
      .skip(skip)
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean(),
    Post.countDocuments(query)
  ]);

  const response = {
    success: true,
    count: posts.length,
    total,
    pages: Math.ceil(total / limit),
    page,
    posts
  };

  // Cache public queries for 2 minutes
  if (!req.query.search && !req.isAdmin && query.status === 'published') {
    cache.set(cacheKey, response, 120000);
  }

  res.status(200).json(response);
});

/**
 * Get single post by ID
 * GET /api/posts/:id
 */
exports.getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'firstName lastName avatar bio')
    .populate('comments.user', 'firstName lastName avatar');

  if (!post) {
    throw new APIError('Post not found', 404);
  }

  // Only increment views for published posts - use updateOne for better performance
  if (post.status === 'published') {
    // Use updateOne instead of save for better performance (no need to load full document)
    await Post.updateOne(
      { _id: req.params.id },
      { $inc: { views: 1 } }
    );
    // Update local object for response
    post.views = (post.views || 0) + 1;
  }

  res.status(200).json({
    success: true,
    post
  });
});

/**
 * Get post by slug
 * GET /api/posts/slug/:slug
 */
exports.getPostBySlug = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug })
    .populate('author', 'firstName lastName avatar bio')
    .populate('comments.user', 'firstName lastName avatar');

  if (!post) {
    throw new APIError('Post not found', 404);
  }

  if (post.status === 'published') {
    // Use updateOne for better performance
    await Post.updateOne(
      { slug: req.params.slug },
      { $inc: { views: 1 } }
    );
    post.views = (post.views || 0) + 1;
  }

  res.status(200).json({
    success: true,
    post
  });
});

/**
 * Create new post
 * POST /api/posts
 */
exports.createPost = asyncHandler(async (req, res) => {
  // Check if user is admin for lenient validation
  // NEW ADMIN STRUCTURE: Admin access is determined by Admin model via req.isAdmin
  const isAdmin = req.isAdmin || false;

  const errors = postValidator.validateCreate(req.body, isAdmin);
  if (errors) {
    // For admins, ALWAYS proceed regardless of validation errors
    if (isAdmin) {
      console.warn('Admin post creation validation warnings (proceeding anyway):', errors);
      // Auto-fix ALL issues for admins
      req.body.title = req.body.title || 'Admin Post';
      req.body.content = req.body.content || req.body.description || 'Content created by admin';
      req.body.excerpt = req.body.excerpt || (req.body.content ? req.body.content.substring(0, 150) + '...' : 'Admin post');
      req.body.featuredImage = req.body.featuredImage || '/images/default-post.jpg';
      req.body.status = req.body.status || 'published';
      req.body.category = req.body.category || 'update';
    } else {
      return res.status(400).json({ success: false, errors });
    }
  }

  // For admins, ensure all required fields and bypass validation
  let post;
  if (isAdmin) {
    // Ensure all required fields exist
    req.body.title = req.body.title || 'Admin Post';
    req.body.content = req.body.content || 'Content created by admin';
    req.body.excerpt = req.body.excerpt || (req.body.content ? req.body.content.substring(0, 150) + '...' : 'Admin post');
    req.body.featuredImage = req.body.featuredImage || '/images/default-post.jpg';
    req.body.category = req.body.category || 'update';
    req.body.status = req.body.status || 'published';

    // Create without strict validation
    post = new Post({
      ...req.body,
      author: req.user._id,
      status: req.body.status || 'published'
    });
    await post.save({ validateBeforeSave: false });
  } else {
    post = await Post.create({
      ...req.body,
      author: req.user._id,
      status: req.body.status || 'draft'
    });
  }

  await post.populate('author', 'firstName lastName avatar');

  res.status(201).json({
    success: true,
    message: 'Post created successfully',
    post,
    ...(isAdmin && Object.keys(errors || {}).length > 0 && {
      warnings: 'Some validations were bypassed for admin'
    })
  });
});

/**
 * Update post
 * PUT /api/posts/:id
 */
exports.updatePost = asyncHandler(async (req, res) => {
  // Check if user is admin for lenient validation
  // NEW ADMIN STRUCTURE: Admin access is determined by Admin model via req.isAdmin
  const isAdmin = req.isAdmin || false;

  const errors = postValidator.validateUpdate(req.body, isAdmin);
  if (errors) {
    // For admins, ALWAYS proceed and auto-fix
    if (isAdmin) {
      console.warn('Admin post update validation warnings (proceeding anyway):', errors);
      // Auto-fix any issues
      if (req.body.title === undefined || !req.body.title) {req.body.title = post.title || 'Admin Post';}
      if (req.body.content === undefined || !req.body.content) {req.body.content = post.content || 'Content created by admin';}
      if (req.body.category && !['news', 'announcement', 'achievement', 'event-recap', 'blog', 'update'].includes(req.body.category)) {
        req.body.category = 'update';
      }
    } else {
      return res.status(400).json({ success: false, errors });
    }
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new APIError('Post not found', 404);
  }

  // Check authorization
  // NEW ADMIN STRUCTURE: Admin access is determined by Admin model via req.isAdmin
  if (post.author.toString() !== req.user._id.toString() && !req.isAdmin) {
    throw new APIError('Not authorized to update this post', 403);
  }

  // For admins, auto-fix any issues before updating
  if (isAdmin) {
    if (req.body.title === undefined || !req.body.title) {req.body.title = post.title || 'Admin Post';}
    if (req.body.content === undefined || !req.body.content) {req.body.content = post.content || 'Content created by admin';}
    if (req.body.excerpt === undefined || !req.body.excerpt) {
      req.body.excerpt = req.body.content ? req.body.content.substring(0, 150) + '...' : post.excerpt || 'Admin post';
    }
    if (req.body.featuredImage === undefined || !req.body.featuredImage) {
      req.body.featuredImage = post.featuredImage || '/images/default-post.jpg';
    }
    if (req.body.category && !['news', 'announcement', 'achievement', 'event-recap', 'blog', 'update'].includes(req.body.category)) {
      req.body.category = 'update';
    }
  }

  Object.keys(req.body).forEach((key) => {
    post[key] = req.body[key];
  });

  // For admins, bypass validation on save
  await post.save(isAdmin ? { validateBeforeSave: false } : {});
  await post.populate('author', 'firstName lastName avatar');

  res.status(200).json({
    success: true,
    message: 'Post updated successfully',
    post,
    ...(isAdmin && Object.keys(errors || {}).length > 0 && {
      warnings: 'Some validations were bypassed for admin'
    })
  });
});

/**
 * Delete post
 * Permanently deletes post and all comments from database
 * DELETE /api/posts/:id
 */
exports.deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new APIError('Post not found', 404);
  }

  // NEW ADMIN STRUCTURE: Admin access is determined by Admin model via req.isAdmin
  if (post.author.toString() !== req.user._id.toString() && !req.isAdmin) {
    throw new APIError('Not authorized to delete this post', 403);
  }

  // Permanently delete post (comments are embedded and will be deleted with post)
  await Post.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Post and all comments permanently deleted from database'
  });
});

/**
 * Like/Unlike post
 * POST /api/posts/:id/like
 */
exports.toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  const isAdmin = req.user && req.user.role === 'admin';

  if (!post) {
    throw new APIError('Post not found', 404);
  }

  const userLiked = post.likes.some(
    (like) => like.toString() === req.user._id.toString()
  );

  if (userLiked) {
    post.likes = post.likes.filter(
      (like) => like.toString() !== req.user._id.toString()
    );
  } else {
    post.likes.push(req.user._id);
  }

  // For admins, bypass validation on save
  await post.save(isAdmin ? { validateBeforeSave: false } : {});

  res.status(200).json({
    success: true,
    message: userLiked ? 'Like removed' : 'Post liked',
    likes: post.likes.length
  });
});

/**
 * Add comment to post
 * POST /api/posts/:id/comments
 */
exports.addComment = asyncHandler(async (req, res) => {
  const isAdmin = req.isAdmin || false;
  const errors = postValidator.validateComment(req.body);
  if (errors) {
    return res.status(400).json({ success: false, errors });
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new APIError('Post not found', 404);
  }

  post.comments.push({
    user: req.user._id,
    content: req.body.content
  });

  // For admins, bypass validation on save
  await post.save(isAdmin ? { validateBeforeSave: false } : {});
  await post.populate('comments.user', 'firstName lastName avatar');

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    comments: post.comments
  });
});

/**
 * Delete comment
 * DELETE /api/posts/:postId/comments/:commentId
 */
exports.deleteComment = asyncHandler(async (req, res) => {
  const isAdmin = req.isAdmin || false;
  const post = await Post.findById(req.params.postId);

  if (!post) {
    throw new APIError('Post not found', 404);
  }

  const comment = post.comments.id(req.params.commentId);

  if (!comment) {
    throw new APIError('Comment not found', 404);
  }

  // NEW ADMIN STRUCTURE: Admin access is determined by Admin model via req.isAdmin
  if (comment.user.toString() !== req.user._id.toString() && !req.isAdmin) {
    throw new APIError('Not authorized to delete this comment', 403);
  }

  // Permanently delete comment from database
  post.comments.id(req.params.commentId).deleteOne();
  // For admins, bypass validation on save
  await post.save(isAdmin ? { validateBeforeSave: false } : {});

  res.status(200).json({
    success: true,
    message: 'Comment permanently deleted from database'
  });
});

/**
 * Get featured posts
 * GET /api/posts/featured
 */
exports.getFeaturedPosts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;

  const posts = await Post.find({ isFeatured: true, status: 'published' })
    .populate('author', 'firstName lastName avatar')
    .limit(limit)
    .sort({ publishedAt: -1 });

  res.status(200).json({
    success: true,
    count: posts.length,
    posts
  });
});

/**
 * Toggle featured status (admin only)
 * PUT /api/posts/:id/featured
 */
exports.toggleFeatured = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new APIError('Post not found', 404);
  }

  post.isFeatured = !post.isFeatured;
  // For admins, bypass validation on save
  await post.save(isAdmin ? { validateBeforeSave: false } : {});

  res.status(200).json({
    success: true,
    message: `Post ${post.isFeatured ? 'featured' : 'unfeatured'} successfully`,
    isFeatured: post.isFeatured
  });
});

/**
 * Get posts by author
 * GET /api/posts/author/:authorId
 */
exports.getPostsByAuthor = asyncHandler(async (req, res) => {
  const posts = await Post.find({ author: req.params.authorId, status: 'published' })
    .populate('author', 'firstName lastName avatar')
    .sort({ publishedAt: -1 });

  res.status(200).json({
    success: true,
    count: posts.length,
    posts
  });
});

/**
 * Get posts by category
 * GET /api/posts/category/:category
 */
exports.getPostsByCategory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const posts = await Post.find({
    category: req.params.category,
    status: 'published'
  })
    .populate('author', 'firstName lastName avatar')
    .limit(limit)
    .skip(skip)
    .sort({ publishedAt: -1 });

  const total = await Post.countDocuments({
    category: req.params.category,
    status: 'published'
  });

  res.status(200).json({
    success: true,
    count: posts.length,
    total,
    pages: Math.ceil(total / limit),
    posts
  });
});
