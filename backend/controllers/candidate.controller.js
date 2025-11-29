/**
 * Candidate Controller
 * Handles candidate management
 */

const Candidate = require('../models/Candidate');
const Position = require('../models/Position');
const Election = require('../models/Election');
const VotingLog = require('../models/VotingLog');
const cloudinary = require('cloudinary').v2;

/**
 * Add candidate to position
 */
exports.addCandidate = async (req, res) => {
  try {
    const { positionId } = req.params;
    const {
      name,
      email,
      phone,
      bio,
      manifesto,
      qualifications,
      achievements,
      socialLinks
    } = req.body;

    // Verify position exists
    const position = await Position.findById(positionId);
    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Position not found'
      });
    }

    // Verify election exists and is not closed
    const election = await Election.findById(position.electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    if (election.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot add candidates to closed election'
      });
    }

    // Handle photo upload
    let photoUrl = null;
    let photoPublicId = null;

    if (req.file) {
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: 'elp/candidates',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto' }
          ]
        });
        photoUrl = uploadResult.secure_url;
        photoPublicId = uploadResult.public_id;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload photo'
        });
      }
    }

    // Create candidate
    const candidate = await Candidate.create({
      name,
      email,
      phone,
      bio,
      manifesto,
      positionId,
      electionId: position.electionId,
      chapter: position.chapter,
      photoUrl,
      photoPublicId,
      qualifications: qualifications ? (Array.isArray(qualifications) ? qualifications : [qualifications]) : [],
      achievements: achievements ? (Array.isArray(achievements) ? achievements : [achievements]) : [],
      socialLinks: socialLinks || {},
      order: 0
    });

    // Update position candidate count
    await position.updateCandidateCount();

    // Log action
    await VotingLog.log({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'candidate_added',
      resource: {
        type: 'candidate',
        id: candidate._id
      },
      electionId: position.electionId,
      chapter: position.chapter,
      details: { name, positionId },
      ip: req.ip,
      userAgent: req.get('user-agent'),
      success: true
    });

    res.status(201).json({
      success: true,
      message: 'Candidate added successfully',
      data: candidate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add candidate',
      error: error.message
    });
  }
};

/**
 * Update candidate
 */
exports.updateCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Check if election is closed
    const election = await Election.findById(candidate.electionId);
    if (election && election.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update candidate in closed election'
      });
    }

    // Handle photo update
    if (req.file) {
      // Delete old photo if exists
      if (candidate.photoPublicId) {
        try {
          await cloudinary.uploader.destroy(candidate.photoPublicId);
        } catch (error) {
          console.error('Error deleting old photo:', error);
        }
      }

      // Upload new photo
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: 'elp/candidates',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto' }
          ]
        });
        updateData.photoUrl = uploadResult.secure_url;
        updateData.photoPublicId = uploadResult.public_id;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload photo'
        });
      }
    }

    // Update candidate
    Object.assign(candidate, updateData);
    await candidate.save();

    // Log action
    await VotingLog.log({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'candidate_updated',
      resource: {
        type: 'candidate',
        id: candidate._id
      },
      electionId: candidate.electionId,
      chapter: candidate.chapter,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      success: true
    });

    res.json({
      success: true,
      message: 'Candidate updated successfully',
      data: candidate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update candidate',
      error: error.message
    });
  }
};

/**
 * Withdraw candidate
 */
exports.withdrawCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    candidate.isWithdrawn = true;
    candidate.withdrawnAt = new Date();
    await candidate.save();

    // Log action
    await VotingLog.log({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'candidate_withdrawn',
      resource: {
        type: 'candidate',
        id: candidate._id
      },
      electionId: candidate.electionId,
      chapter: candidate.chapter,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      success: true
    });

    res.json({
      success: true,
      message: 'Candidate withdrawn successfully',
      data: candidate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to withdraw candidate',
      error: error.message
    });
  }
};

module.exports = exports;

