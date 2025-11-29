/**
 * Seed Script for Voting System
 * Creates sample election data for testing
 *
 * Usage: node scripts/seed-voting.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Election = require('../models/Election');
const Position = require('../models/Position');
const Candidate = require('../models/Candidate');
const User = require('../models/User');

const connectDB = require('../config/db');

const seedVoting = async () => {
  try {
    await connectDB();
    console.log('Database connected');

    // Find or create a test admin
    // IMPORTANT: Use environment variables for production!
    const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@elp.org';
    const TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'password123';

    let admin = await User.findOne({ email: TEST_ADMIN_EMAIL });
    if (!admin) {
      console.log('Creating test admin...');
      console.log('⚠️  WARNING: Using default test credentials. Change in production!');
      admin = await User.create({
        firstName: 'Test',
        lastName: 'Admin',
        email: TEST_ADMIN_EMAIL,
        password: TEST_ADMIN_PASSWORD, // Will be hashed by pre-save hook
        role: 'admin',
        chapter: 'university-of-embu',
        isActive: true,
        isVerified: true
      });
    }

    // Create sample election
    const election = await Election.create({
      title: '2024 Chapter Leadership Elections',
      description: 'Annual elections for chapter leadership positions',
      chapter: 'university-of-embu',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      createdBy: admin._id,
      approvedBy: admin._id,
      approvedAt: new Date(),
      status: 'approved',
      requireVerification: true,
      publicResults: false
    });

    console.log('Created election:', election.title);

    // Create positions
    const positions = [
      { name: 'Chairperson', description: 'Chapter Chairperson - Leads all chapter activities' },
      { name: 'Vice Chairperson', description: 'Vice Chairperson - Supports the Chairperson' },
      { name: 'Secretary General', description: 'Secretary General - Handles documentation and records' },
      { name: 'Treasurer', description: 'Treasurer - Manages chapter finances' }
    ];

    const createdPositions = [];
    for (const posData of positions) {
      const position = await Position.create({
        ...posData,
        electionId: election._id,
        chapter: election.chapter,
        order: positions.indexOf(posData)
      });
      createdPositions.push(position);
      console.log('Created position:', position.name);
    }

    // Create candidates for each position
    const candidateNames = [
      ['John Doe', 'Jane Smith', 'Michael Johnson'],
      ['Sarah Williams', 'David Brown', 'Emily Davis'],
      ['Robert Wilson', 'Lisa Anderson', 'James Taylor'],
      ['Maria Garcia', 'Thomas Martinez', 'Jennifer Lee']
    ];

    for (let i = 0; i < createdPositions.length; i++) {
      const position = createdPositions[i];
      const names = candidateNames[i];

      for (let j = 0; j < names.length; j++) {
        const candidate = await Candidate.create({
          name: names[j],
          positionId: position._id,
          electionId: election._id,
          chapter: election.chapter,
          email: `${names[j].toLowerCase().replace(' ', '.')}@example.com`,
          bio: `Experienced leader with a passion for ${position.name.toLowerCase()}`,
          manifesto: `My vision for the ${position.name} role includes transparency, innovation, and member engagement. I will work tirelessly to ensure our chapter continues to grow and make a positive impact.`,
          order: j,
          isActive: true
        });
        console.log(`Created candidate: ${candidate.name} for ${position.name}`);
      }
    }

    // Update position candidate counts
    for (const position of createdPositions) {
      await position.updateCandidateCount();
    }

    console.log('\n✅ Voting system seeded successfully!');
    console.log(`\nElection ID: ${election._id}`);
    console.log(`Election Title: ${election.title}`);
    console.log(`Positions: ${createdPositions.length}`);
    console.log(`Total Candidates: ${createdPositions.length * 3}`);
    console.log('\nNext steps:');
    console.log('1. Start the election: PATCH /api/elections/:id/start');
    console.log('2. Generate voting links: POST /api/voting-links/generate');
    console.log('3. Access voting page: /vote/<token>');
    console.log('4. View live results: /elections/:id/results');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding voting system:', error);
    process.exit(1);
  }
};

seedVoting();

