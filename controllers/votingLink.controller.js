/**
 * Voting Link Controller
 * Generates and manages one-time voting links
 */

const { generateVotingToken, hashToken } = require('../utils/votingTokenUtil');
const VotingLink = require('../models/VotingLink');
const Election = require('../models/Election');
const User = require('../models/User');
const VotingLog = require('../models/VotingLog');
const emailService = require('../services/email.service');

/**
 * Generate voting links for verified members
 */
exports.generateVotingLinks = async (req, res) => {
  try {
    const { electionId, memberIds } = req.body;

    if (!electionId) {
      return res.status(400).json({
        success: false,
        message: 'electionId is required'
      });
    }

    // Verify election exists
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // Get eligible members
    const query = {
      role: 'member',
      isActive: true,
      chapter: election.chapter
    };

    if (election.requireVerification) {
      query.isVerified = true;
    }

    // If specific member IDs provided, use those
    if (memberIds && Array.isArray(memberIds) && memberIds.length > 0) {
      query._id = { $in: memberIds };
    }

    const members = await User.find(query);

    if (members.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No eligible members found'
      });
    }

    // Generate links
    const links = [];
    const expiresAt = election.endTime;

    for (const member of members) {
      // Check if link already exists
      const existingLink = await VotingLink.findOne({
        memberId: member._id,
        electionId,
        status: { $in: ['pending', 'sent'] }
      });

      if (existingLink) {
        links.push({
          memberId: member._id,
          memberEmail: member.email,
          memberName: `${member.firstName} ${member.lastName}`,
          link: existingLink,
          alreadyExists: true
        });
        continue;
      }

      // Generate token
      const { token, tokenHash } = generateVotingToken({
        memberId: member._id,
        electionId,
        issuedAt: new Date().toISOString()
      });

      // Create voting link
      const votingLink = await VotingLink.create({
        memberId: member._id,
        memberEmail: member.email,
        electionId,
        chapter: election.chapter,
        token,
        tokenHash,
        expiresAt,
        generatedBy: req.user._id
      });

      // Send email if configured
      if (process.env.SMTP_HOST && req.body.sendEmails !== false) {
        try {
          const frontendUrl = process.env.FRONTEND_URL || 'https://embuni-elc-frontend.vercel.app';
          const voteUrl = `${frontendUrl}/vote/${token}`;

          await emailService.sendVotingLink({
            to: member.email,
            name: `${member.firstName} ${member.lastName}`,
            electionTitle: election.title,
            voteUrl,
            expiresAt: election.endTime
          });

          votingLink.emailSent = true;
          votingLink.emailSentAt = new Date();
          await votingLink.save();
        } catch (emailError) {
          console.error('Failed to send voting link email:', emailError);
        }
      }

      // Log action
      await VotingLog.log({
        actorId: req.user._id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        action: 'vote_link_generated',
        resource: {
          type: 'link',
          id: votingLink._id
        },
        electionId,
        chapter: election.chapter,
        details: {
          memberId: member._id,
          memberEmail: member.email
        },
        ip: req.ip,
        userAgent: req.get('user-agent'),
        success: true
      });

      links.push({
        memberId: member._id,
        memberEmail: member.email,
        memberName: `${member.firstName} ${member.lastName}`,
        link: {
          _id: votingLink._id,
          token: votingLink.token,
          expiresAt: votingLink.expiresAt,
          emailSent: votingLink.emailSent
        },
        alreadyExists: false
      });
    }

    res.json({
      success: true,
      message: `Generated ${links.length} voting links`,
      data: {
        links,
        total: links.length,
        newLinks: links.filter(l => !l.alreadyExists).length,
        existingLinks: links.filter(l => l.alreadyExists).length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate voting links',
      error: error.message
    });
  }
};

/**
 * Get voting links for an election
 */
exports.getVotingLinks = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { status, page = 1, limit = 50 } = req.query;

    const query = { electionId };
    if (status) {query.status = status;}

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Use lean() and parallel queries for better performance
    const [links, total] = await Promise.all([
      VotingLink.find(query)
        .populate('memberId', 'firstName lastName email')
        .populate('generatedBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      VotingLink.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: links,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get voting links',
      error: error.message
    });
  }
};

module.exports = exports;

