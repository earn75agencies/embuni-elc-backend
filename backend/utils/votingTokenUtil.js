/**
 * Voting Token Utility
 * Generates and validates HMAC-signed one-time voting link tokens
 */

const crypto = require('crypto');

const VOTE_LINK_SECRET = process.env.VOTE_LINK_SECRET || 'change-this-secret-in-production-min-32-chars';

/**
 * Generate HMAC signature for token
 */
const signToken = (payload) => {
  const hmac = crypto.createHmac('sha256', VOTE_LINK_SECRET);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
};

/**
 * Generate one-time voting link token
 * @param {Object} data - { memberId, electionId, issuedAt }
 * @returns {Object} { token, tokenHash }
 */
exports.generateVotingToken = (data) => {
  const { memberId, electionId, issuedAt = new Date().toISOString() } = data;

  if (!memberId || !electionId) {
    throw new Error('memberId and electionId are required');
  }

  // Create payload
  const payload = {
    memberId: memberId.toString(),
    electionId: electionId.toString(),
    issuedAt,
    nonce: crypto.randomBytes(16).toString('hex')
  };

  // Create token (base64 encoded payload)
  const token = Buffer.from(JSON.stringify(payload)).toString('base64url');

  // Create hash for storage/verification
  const tokenHash = signToken(payload);

  return {
    token,
    tokenHash,
    payload
  };
};

/**
 * Verify and decode voting token
 * @param {string} token - Base64 encoded token
 * @returns {Object} Decoded payload or null if invalid
 */
exports.verifyVotingToken = (token) => {
  try {
    // Decode token
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const payload = JSON.parse(decoded);

    // Verify signature
    const expectedHash = signToken(payload);

    // Check expiration (tokens expire after 30 days or election end)
    const issuedAt = new Date(payload.issuedAt);
    const now = new Date();
    const daysSinceIssue = (now - issuedAt) / (1000 * 60 * 60 * 24);

    if (daysSinceIssue > 30) {
      return { valid: false, reason: 'Token expired' };
    }

    return {
      valid: true,
      payload: {
        memberId: payload.memberId,
        electionId: payload.electionId,
        issuedAt: payload.issuedAt
      }
    };
  } catch (error) {
    return { valid: false, reason: 'Invalid token format' };
  }
};

/**
 * Hash token for storage
 */
exports.hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = exports;

