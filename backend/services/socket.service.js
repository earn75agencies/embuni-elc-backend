/**
 * Socket.io Service
 * Real-time voting updates via WebSockets
 *
 * Install: npm install socket.io
 * Configure: Set SOCKET_ORIGIN in .env
 */

let io = null;

/**
 * Initialize Socket.io
 */
exports.initializeSocket = (server) => {
  try {
    const socketIo = require('socket.io');

    io = socketIo(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'https://embuni-elc-frontend.vercel.app',
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // Voting namespace
    const votesNamespace = io.of('/votes');

    // Authentication middleware for socket
    votesNamespace.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
        // Allow anonymous connections for public results
          socket.isAuthenticated = false;
          return next();
        }

        // Verify JWT token
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Load user
        const User = require('../models/User');
        const user = await User.findById(decoded.id).select('-password');

        if (!user || !user.isActive) {
          return next(new Error('Authentication failed'));
        }

        socket.user = user;
        socket.isAuthenticated = true;
        next();
      } catch (error) {
      // Allow connection but mark as unauthenticated
        socket.isAuthenticated = false;
        next();
      }
    });

    // Connection handling
    votesNamespace.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      const subscribedElections = new Set();

      // Subscribe to election updates
      socket.on('subscribe', async (data) => {
        try {
          const { electionId } = data;

          if (!electionId) {
            socket.emit('error', { message: 'electionId is required' });
            return;
          }

          // Verify election exists and user has access
          const Election = require('../models/Election');
          const election = await Election.findById(electionId);

          if (!election) {
            socket.emit('error', { message: 'Election not found' });
            return;
          }

          // Check if results are public or user is verified member
          if (!election.publicResults) {
            if (!socket.isAuthenticated || !socket.user) {
              socket.emit('error', { message: 'Authentication required' });
              return;
            }

            // Check if user is member of chapter
            if (socket.user.chapter !== election.chapter && !election.isNational) {
              socket.emit('error', { message: 'Access denied' });
              return;
            }
          }

          // Join election room
          socket.join(`election:${electionId}`);
          subscribedElections.add(electionId.toString());

          // Send initial results
          const voteService = require('./vote.service');
          const results = await voteService.getElectionResults(electionId);

          socket.emit('initial-results', {
            electionId,
            results
          });

          console.log(`Socket ${socket.id} subscribed to election ${electionId}`);
        } catch (error) {
          console.error('Subscribe error:', error);
          socket.emit('error', { message: error.message });
        }
      });

      // Unsubscribe from election
      socket.on('unsubscribe', (data) => {
        const { electionId } = data;
        if (electionId) {
          socket.leave(`election:${electionId}`);
          subscribedElections.delete(electionId.toString());
          console.log(`Socket ${socket.id} unsubscribed from election ${electionId}`);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        subscribedElections.clear();
      });
    });

    return io;
  } catch (error) {
    console.error('Socket.io initialization error:', error);
    throw error;
  }
};

/**
 * Emit vote update to all subscribers
 */
exports.emitVoteUpdate = async (electionId, positionId, candidateId) => {
  if (!io) {
    console.warn('Socket.io not initialized');
    return;
  }

  try {
    const Candidate = require('../models/Candidate');
    const Position = require('../models/Position');

    // Get updated candidate and position stats in parallel with lean()
    const [candidate, position] = await Promise.all([
      Candidate.findById(candidateId).lean(),
      Position.findById(positionId).lean()
    ]);

    if (!candidate || !position) {return;}

    // Calculate percentage
    const votePercentage = position.totalVotes > 0
      ? parseFloat((candidate.votesCount / position.totalVotes * 100).toFixed(2))
      : 0;

    // Emit to all subscribers of this election
    io.of('/votes').to(`election:${electionId}`).emit('vote-update', {
      electionId: electionId.toString(),
      positionId: positionId.toString(),
      candidateId: candidateId.toString(),
      candidateVotes: candidate.votesCount,
      candidatePercentage: votePercentage,
      totalVotesPosition: position.totalVotes,
      timestamp: new Date().toISOString()
    });

    // Also emit election status update
    const Election = require('../models/Election');
    const election = await Election.findById(electionId);
    if (election) {
      io.of('/votes').to(`election:${electionId}`).emit('election-status', {
        electionId: electionId.toString(),
        status: election.status,
        totalVotesCast: election.totalVotesCast,
        turnoutPercentage: election.turnoutPercentage,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error emitting vote update:', error);
  }
};

/**
 * Emit election status change
 */
exports.emitElectionStatus = (electionId, status) => {
  if (!io) {return;}

  io.of('/votes').to(`election:${electionId}`).emit('election-status', {
    electionId: electionId.toString(),
    status,
    timestamp: new Date().toISOString()
  });
};

/**
 * Get Socket.io instance
 */
exports.getIO = () => {
  return io;
};

module.exports = exports;

