/**
 * Vote Controller
 * Handles voting operations
 */

const voteService = require('../services/vote.service');
const VotingLog = require('../models/VotingLog');
const { asyncHandler, APIError } = require('../middleware/errorMiddleware');
const cache = require('../utils/cache');
const logger = require('../utils/logger');

/**
 * Validate voting link token
 */
exports.validateVotingLink = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Voting token is required'
      });
    }

    const result = await voteService.validateVotingLink(token, req.user?._id);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Invalid voting link'
    });
  }
};

/**
 * Submit vote
 */
exports.submitVote = async (req, res) => {
  try {
    const {
      candidateId,
      positionId,
      electionId,
      token
    } = req.body;

    // Validate required fields
    if (!candidateId || !positionId || !electionId) {
      return res.status(400).json({
        success: false,
        message: 'candidateId, positionId, and electionId are required'
      });
    }

    // Get member ID from token or request
    const memberId = req.user?._id || req.body.memberId;

    if (!memberId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Cast vote
    const vote = await voteService.castVote({
      memberId,
      candidateId,
      positionId,
      electionId,
      token,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      chapter: req.user?.chapter
    });

    res.json({
      success: true,
      message: 'Vote cast successfully',
      data: {
        voteId: vote._id,
        candidateId,
        positionId,
        electionId
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to cast vote'
    });
  }
};

/**
 * Get election results
 * Optimized with caching and lean queries
 */
exports.getResults = asyncHandler(async (req, res) => {
  const { electionId } = req.params;

  // Check cache first (cache for 10 seconds for live results)
  const cacheKey = `results:${electionId}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const results = await voteService.getElectionResults(electionId);

  // Log view (async, don't wait)
  if (req.user) {
    VotingLog.log({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'results_viewed',
      resource: {
        type: 'election',
        id: electionId
      },
      electionId,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      success: true
    }).catch(err => logger.error('Failed to log results view:', err));
  }

  const response = {
    success: true,
    data: results
  };

  // Cache for 10 seconds (live results update frequently)
  cache.set(cacheKey, response, 10000);

  res.json(response);
});

/**
 * Get live results snapshot
 */
exports.getLiveResults = async (req, res) => {
  try {
    const { electionId } = req.params;

    const results = await voteService.getElectionResults(electionId);

    res.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get live results'
    });
  }
};

module.exports = exports;

