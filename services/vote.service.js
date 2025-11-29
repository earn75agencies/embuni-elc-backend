/**
 * Vote Service
 * Business logic for voting with transactions and real-time updates
 */

const mongoose = require('mongoose');
const Vote = require('../models/Vote');
const Candidate = require('../models/Candidate');
const Position = require('../models/Position');
const Election = require('../models/Election');
const VotingLog = require('../models/VotingLog');
const VotingLink = require('../models/VotingLink');
const { emitVoteUpdate } = require('./socket.service');

/**
 * Cast a vote with transaction
 * @param {Object} voteData - { memberId, candidateId, positionId, electionId, token, ip, userAgent }
 * @returns {Object} Vote document
 */
exports.castVote = async (voteData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      memberId,
      candidateId,
      positionId,
      electionId,
      token,
      ip,
      userAgent,
      chapter
    } = voteData;

    // 1. Verify election is active and within time window
    const election = await Election.findById(electionId).session(session);
    if (!election) {
      throw new Error('Election not found');
    }

    if (election.status !== 'active') {
      throw new Error(`Election is not active. Current status: ${election.status}`);
    }

    const now = new Date();
    if (now < election.startTime || now > election.endTime) {
      throw new Error('Election is not currently open for voting');
    }

    // 2. Verify member is eligible
    const User = mongoose.model('User');
    const member = await User.findById(memberId).session(session);
    if (!member) {
      throw new Error('Member not found');
    }

    if (!member.isActive) {
      throw new Error('Member account is not active');
    }

    if (election.requireVerification && !member.isVerified) {
      throw new Error('Member is not verified and cannot vote');
    }

    // 3. Check if member already voted for this position
    const existingVote = await Vote.findOne({
      memberId,
      positionId,
      electionId,
      status: 'cast'
    }).session(session);

    if (existingVote) {
      throw new Error('You have already voted for this position');
    }

    // 4. Verify candidate exists and is active
    const candidate = await Candidate.findById(candidateId).session(session);
    if (!candidate) {
      throw new Error('Candidate not found');
    }

    if (!candidate.isActive || candidate.isWithdrawn) {
      throw new Error('Candidate is not eligible for voting');
    }

    if (candidate.positionId.toString() !== positionId.toString()) {
      throw new Error('Candidate does not belong to this position');
    }

    // 5. Verify voting link token if provided
    let votingLink = null;
    if (token) {
      const tokenHash = require('../utils/votingTokenUtil').hashToken(token);
      votingLink = await VotingLink.findOne({
        tokenHash,
        memberId,
        electionId,
        status: { $in: ['pending', 'sent'] }
      }).session(session);

      if (!votingLink) {
        throw new Error('Invalid or already used voting link');
      }

      if (new Date() > votingLink.expiresAt) {
        votingLink.status = 'expired';
        await votingLink.save({ session });
        throw new Error('Voting link has expired');
      }
    }

    // 6. Create vote document
    const vote = new Vote({
      memberId,
      memberEmail: member.email,
      memberName: `${member.firstName} ${member.lastName}`,
      candidateId,
      positionId,
      electionId,
      chapter: chapter || member.chapter || election.chapter,
      linkToken: token,
      linkTokenHash: token ? require('../utils/votingTokenUtil').hashToken(token) : null,
      timestamp: now,
      ipAddress: ip,
      userAgent: userAgent,
      verified: true,
      status: 'cast'
    });

    await vote.save({ session });

    // 7. Atomically increment candidate vote count
    await Candidate.findByIdAndUpdate(
      candidateId,
      { $inc: { votesCount: 1 } },
      { session, new: true }
    );

    // 8. Update position vote count
    await Position.findByIdAndUpdate(
      positionId,
      { $inc: { totalVotes: 1 } },
      { session }
    );

    // 9. Update election vote count
    await Election.findByIdAndUpdate(
      electionId,
      { $inc: { totalVotesCast: 1 } },
      { session }
    );

    // 10. Mark voting link as used
    if (votingLink) {
      await votingLink.markAsUsed([positionId]);
      await votingLink.save({ session });
    }

    // 11. Log the vote
    await VotingLog.create([{
      actorId: memberId,
      actorEmail: member.email,
      actorRole: 'member',
      action: 'vote_cast',
      resource: {
        type: 'vote',
        id: vote._id
      },
      electionId,
      chapter: chapter || member.chapter,
      details: {
        candidateId,
        positionId,
        candidateName: candidate.name
      },
      ip,
      userAgent,
      success: true
    }], { session });

    // 12. Commit transaction
    await session.commitTransaction();

    // 13. Update statistics (outside transaction for performance)
    await Promise.all([
      candidate.updateVoteStats(),
      updatePositionStats(positionId),
      updateElectionStats(electionId)
    ]);

    // 14. Emit real-time update via Socket.io
    await emitVoteUpdate(electionId, positionId, candidateId);

    return vote;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Update position statistics
 */
const updatePositionStats = async (positionId) => {
  const Position = require('../models/Position');
  const position = await Position.findById(positionId);
  if (position) {
    await position.updateVoteCount();
  }
};

/**
 * Update election statistics
 */
const updateElectionStats = async (electionId) => {
  const Election = require('../models/Election');
  const election = await Election.findById(electionId);
  if (election) {
    await election.calculateTurnout();
  }
};

/**
 * Get election results
 */
/**
 * Get election results
 * Optimized with lean queries and parallel processing
 */
exports.getElectionResults = async (electionId) => {
  // Use lean() for better performance
  const election = await Election.findById(electionId).lean();
  if (!election) {
    throw new Error('Election not found');
  }

  // Get positions with lean()
  const positions = await Position.find({ electionId })
    .sort({ order: 1 })
    .lean();

  // Get all candidates for all positions in parallel
  const candidatesPromises = positions.map(position =>
    Candidate.find({ positionId: position._id })
      .sort({ votesCount: -1, order: 1 })
      .lean()
  );

  const candidatesArrays = await Promise.all(candidatesPromises);

  // Process results in parallel
  const results = positions.map((position, index) => {
    const candidates = candidatesArrays[index];
    const totalVotes = position.totalVotes || 0;

    // Calculate percentages efficiently
    const candidatesWithStats = candidates.map(candidate => ({
      ...candidate,
      votePercentage: totalVotes > 0
        ? parseFloat((candidate.votesCount / totalVotes * 100).toFixed(2))
        : 0
    }));

    return {
      position: {
        _id: position._id,
        name: position.name,
        description: position.description,
        totalVotes,
        totalCandidates: candidates.length
      },
      candidates: candidatesWithStats
    };
  });

  return {
    election: {
      _id: election._id,
      title: election.title,
      status: election.status,
      totalVotesCast: election.totalVotesCast,
      totalEligibleVoters: election.totalEligibleVoters,
      turnoutPercentage: election.turnoutPercentage,
      startTime: election.startTime,
      endTime: election.endTime
    },
    positions: results
  };
};

/**
 * Validate voting link token
 */
exports.validateVotingLink = async (token, memberId) => {
  const { verifyVotingToken, hashToken } = require('../utils/votingTokenUtil');

  // Verify token format
  const verification = verifyVotingToken(token);
  if (!verification.valid) {
    throw new Error(verification.reason || 'Invalid token');
  }

  const { payload } = verification;

  // Check voting link in database
  const tokenHash = hashToken(token);
  const votingLink = await VotingLink.findOne({
    tokenHash,
    memberId: payload.memberId || memberId,
    electionId: payload.electionId
  }).populate('electionId');

  if (!votingLink) {
    throw new Error('Voting link not found');
  }

  if (votingLink.status === 'used') {
    throw new Error('Voting link has already been used');
  }

  if (votingLink.status === 'expired' || votingLink.status === 'revoked') {
    throw new Error(`Voting link is ${votingLink.status}`);
  }

  const now = new Date();
  if (now > votingLink.expiresAt) {
    votingLink.status = 'expired';
    await votingLink.save();
    throw new Error('Voting link has expired');
  }

  // Update access tracking
  votingLink.accessedAt = now;
  votingLink.accessCount += 1;
  await votingLink.save();

  // Get election details
  const election = await Election.findById(payload.electionId);
  if (!election) {
    throw new Error('Election not found');
  }

  // Get positions and candidates with lean() for better performance
  const positions = await Position.find({ electionId: election._id })
    .sort({ order: 1 })
    .lean();

  // Get all candidates and votes in parallel
  const candidatesPromises = positions.map(position =>
    Candidate.find({
      positionId: position._id,
      isActive: true,
      isWithdrawn: false
    })
      .select('_id name photoUrl manifesto bio')
      .sort({ order: 1 })
      .lean()
  );

  const voteCheckPromises = positions.map(position =>
    Vote.hasVoted(
      payload.memberId || memberId,
      position._id,
      election._id
    )
  );

  const [candidatesArrays, hasVotedArray] = await Promise.all([
    Promise.all(candidatesPromises),
    Promise.all(voteCheckPromises)
  ]);

  // Combine results
  const positionsWithCandidates = positions.map((position, index) => ({
    _id: position._id,
    name: position.name,
    description: position.description,
    candidates: candidatesArrays[index],
    hasVoted: hasVotedArray[index]
  }));

  return {
    election: {
      _id: election._id,
      title: election.title,
      description: election.description,
      startTime: election.startTime,
      endTime: election.endTime,
      status: election.status
    },
    positions: positionsWithCandidates,
    memberId: payload.memberId || memberId
  };
};

module.exports = exports;

