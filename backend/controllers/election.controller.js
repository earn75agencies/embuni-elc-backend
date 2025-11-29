/**
 * Election Controller
 * Handles election creation, approval, and management
 */

const Election = require('../models/Election');
const Position = require('../models/Position');
const Candidate = require('../models/Candidate');
const VotingLog = require('../models/VotingLog');
const { emitElectionStatus } = require('../services/socket.service');
const { asyncHandler, APIError } = require('../middleware/errorHandler');
const cache = require('../config/cache');
const logger = require('../utils/logger');

/**
 * Create new election (Chapter Admin)
 */
exports.createElection = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    chapter,
    isNational,
    startTime,
    endTime,
    allowMultiplePositions,
    requireVerification,
    publicResults
  } = req.body;

  // Validate required fields
  if (!title || !chapter || !startTime || !endTime) {
    return res.status(400).json({
      success: false,
      message: 'Title, chapter, start time, and end time are required'
    });
  }

  // Validate dates
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (end <= start) {
    return res.status(400).json({
      success: false,
      message: 'End time must be after start time'
    });
  }

  // Create election
  const election = await Election.create({
    title,
    description,
    chapter,
    isNational: isNational || false,
    startTime: start,
    endTime: end,
    createdBy: req.user._id,
    allowMultiplePositions: allowMultiplePositions !== false,
    requireVerification: requireVerification !== false,
    publicResults: publicResults || false,
    status: 'pending'
  });

  // Log action
  await VotingLog.log({
    actorId: req.user._id,
    actorEmail: req.user.email,
    actorRole: req.user.role,
    action: 'election_created',
    resource: {
      type: 'election',
      id: election._id
    },
    electionId: election._id,
    chapter,
    details: { title, startTime, endTime },
    ip: req.ip,
    userAgent: req.get('user-agent'),
    success: true
  });

  res.status(201).json({
    success: true,
    message: 'Election created successfully. Awaiting superadmin approval.',
    data: election
  });
});

/**
 * Approve election (Super Admin)
 */
exports.approveElection = async (req, res) => {
  try {
    const { id } = req.params;

    const election = await Election.findById(id);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    if (election.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Election is already ${election.status}`
      });
    }

    election.status = 'approved';
    election.approvedBy = req.user._id;
    election.approvedAt = new Date();
    await election.save();

    // Log action
    await VotingLog.log({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: 'superadmin',
      action: 'election_approved',
      resource: {
        type: 'election',
        id: election._id
      },
      electionId: election._id,
      chapter: election.chapter,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      success: true
    });

    res.json({
      success: true,
      message: 'Election approved successfully',
      data: election
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to approve election',
      error: error.message
    });
  }
};

/**
 * Start election
 */
exports.startElection = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const election = await Election.findById(id);
  if (!election) {
    return res.status(404).json({
      success: false,
      message: 'Election not found'
    });
  }

  if (election.status !== 'approved') {
    return res.status(400).json({
      success: false,
      message: 'Only approved elections can be started'
    });
  }

  await election.start(req.user._id);

  // Emit status change
  emitElectionStatus(election._id, 'active');

  // Log action
  await VotingLog.log({
    actorId: req.user._id,
    actorEmail: req.user.email,
    actorRole: req.user.role,
    action: 'election_started',
    resource: {
      type: 'election',
      id: election._id
    },
    electionId: election._id,
    chapter: election.chapter,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    success: true
  });

  res.json({
    success: true,
    message: 'Election started successfully',
    data: election
  });
});

/**
 * Close election
 */
exports.closeElection = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const election = await Election.findById(id);
  if (!election) {
    return res.status(404).json({
      success: false,
      message: 'Election not found'
    });
  }

  if (election.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Only active elections can be closed'
    });
  }

  await election.close();

  // Calculate final statistics
  await election.calculateTurnout();

  // Emit status change
  emitElectionStatus(election._id, 'closed');

  // Log action
  await VotingLog.log({
    actorId: req.user._id,
    actorEmail: req.user.email,
    actorRole: req.user.role,
    action: 'election_closed',
    resource: {
      type: 'election',
      id: election._id
    },
    electionId: election._id,
    chapter: election.chapter,
    details: {
      totalVotesCast: election.totalVotesCast,
      turnoutPercentage: election.turnoutPercentage
    },
    ip: req.ip,
    userAgent: req.get('user-agent'),
    success: true
  });

  res.json({
    success: true,
    message: 'Election closed successfully',
    data: election
  });
});

/**
 * Get election details
 */
exports.getElection = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check cache first
  const cacheKey = `election:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // Use lean() and parallel queries for better performance
  const [election, positions] = await Promise.all([
    Election.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .lean(),
    Position.find({ electionId: id })
      .sort({ order: 1 })
      .lean()
  ]);

  if (!election) {
    throw new APIError('Election not found', 404);
  }

  // Get candidates for all positions in parallel
  const candidatesPromises = positions.map(position =>
    Candidate.find({
      positionId: position._id,
      isActive: true,
      isWithdrawn: false
    })
      .sort({ order: 1 })
      .lean()
  );

  const candidatesArrays = await Promise.all(candidatesPromises);

  // Combine positions with candidates
  const positionsWithCandidates = positions.map((position, index) => ({
    ...position,
    candidates: candidatesArrays[index]
  }));

  const response = {
    success: true,
    data: {
      election,
      positions: positionsWithCandidates
    }
  };

  // Cache for 1 minute
  cache.set(cacheKey, response, 60000);

  res.json(response);
});

/**
 * List elections
 */
exports.listElections = asyncHandler(async (req, res) => {
  const {
    chapter,
    status,
    page = 1,
    limit = 20
  } = req.query;

  const query = {};
  if (chapter) {query.chapter = chapter;}
  if (status) {query.status = status;}

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Use lean() and parallel queries for better performance
  const [elections, total] = await Promise.all([
    Election.find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Election.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: elections,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

/**
 * Export election results
 */
exports.exportResults = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { format = 'csv' } = req.query;

  const voteService = require('../services/vote.service');
  const results = await voteService.getElectionResults(id);

  if (format === 'csv') {
    // Generate CSV
    let csv = 'Position,Candidate,Votes,Percentage\n';

    results.positions.forEach(positionData => {
      positionData.candidates.forEach(candidate => {
        csv += `"${positionData.position.name}","${candidate.name}",${candidate.votesCount},${candidate.votePercentage}%\n`;
      });
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=election-${id}-results.csv`);
    res.send(csv);
  } else {
    // Return JSON
    res.json({
      success: true,
      data: results
    });
  }
});

module.exports = exports;

