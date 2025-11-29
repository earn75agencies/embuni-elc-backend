/**
 * Position Routes
 * Handles position management
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/adminMiddleware');
const Position = require('../models/Position');
const Election = require('../models/Election');
const VotingLog = require('../models/VotingLog');

/**
 * Create position
 */
router.post(
  '/elections/:electionId/positions',
  protect,
  requirePermission('MANAGE_EVENTS'),
  async (req, res) => {
    try {
      const { electionId } = req.params;
      const { name, description, order } = req.body;

      // Verify election exists
      const election = await Election.findById(electionId);
      if (!election) {
        return res.status(404).json({
          success: false,
          message: 'Election not found'
        });
      }

      if (election.status === 'closed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot add positions to closed election'
        });
      }

      // Create position
      const position = await Position.create({
        name,
        description,
        electionId,
        chapter: election.chapter,
        order: order || 0
      });

      // Log action
      await VotingLog.log({
        actorId: req.user._id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        action: 'position_created',
        resource: {
          type: 'position',
          id: position._id
        },
        electionId,
        chapter: election.chapter,
        details: { name },
        ip: req.ip,
        userAgent: req.get('user-agent'),
        success: true
      });

      res.status(201).json({
        success: true,
        message: 'Position created successfully',
        data: position
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create position',
        error: error.message
      });
    }
  }
);

/**
 * Get positions for election
 */
router.get('/elections/:electionId/positions', async (req, res) => {
  try {
    const { electionId } = req.params;

    const positions = await Position.find({ electionId })
      .sort({ order: 1 });

    res.json({
      success: true,
      data: positions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get positions',
      error: error.message
    });
  }
});

/**
 * Update position
 */
router.patch(
  '/positions/:id',
  protect,
  requirePermission('MANAGE_EVENTS'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const position = await Position.findById(id);
      if (!position) {
        return res.status(404).json({
          success: false,
          message: 'Position not found'
        });
      }

      // Check if election is closed
      const election = await Election.findById(position.electionId);
      if (election && election.status === 'closed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot update position in closed election'
        });
      }

      Object.assign(position, updateData);
      await position.save();

      res.json({
        success: true,
        message: 'Position updated successfully',
        data: position
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update position',
        error: error.message
      });
    }
  }
);

/**
 * Delete position
 */
router.delete(
  '/positions/:id',
  protect,
  requirePermission('MANAGE_EVENTS'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const position = await Position.findById(id);
      if (!position) {
        return res.status(404).json({
          success: false,
          message: 'Position not found'
        });
      }

      // Check if election is closed
      const election = await Election.findById(position.electionId);
      if (election && election.status === 'closed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete position in closed election'
        });
      }

      // Check if position has candidates
      const Candidate = require('../models/Candidate');
      const candidateCount = await Candidate.countDocuments({ positionId: id });

      if (candidateCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete position with candidates. Remove candidates first.'
        });
      }

      await Position.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Position deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete position',
        error: error.message
      });
    }
  }
);

module.exports = router;

