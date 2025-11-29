/**
 * Contact Message Controller
 * Handles contact form submissions and message management
 */

const ContactMessage = require('../models/ContactMessage');
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middleware/requestValidator');

/**
 * Submit contact form message
 */
const submitMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message, category = 'general', priority = 'medium' } = req.body;

    const contactMessage = new ContactMessage({
      name,
      email,
      phone,
      subject,
      message,
      category,
      priority,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referrer')
    });

    await contactMessage.save();

    res.status(201).json({
      success: true,
      message: 'Message submitted successfully. We will get back to you soon.',
      data: {
        id: contactMessage._id,
        status: contactMessage.status
      }
    });
  } catch (error) {
    console.error('Error submitting contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit message',
      error: error.message
    });
  }
};

/**
 * Get all contact messages with filtering
 */
const getMessages = async (req, res) => {
  try {
    const {
      status,
      category,
      priority,
      search,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = {};
    if (status && status !== 'all') {query.status = status;}
    if (category && category !== 'all') {query.category = category;}
    if (priority && priority !== 'all') {query.priority = priority;}

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let messages;
    if (search) {
      messages = await ContactMessage.searchMessages(search, query)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('respondedBy', 'firstName lastName email');
    } else {
      messages = await ContactMessage.find(query)
        .populate('respondedBy', 'firstName lastName email')
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    }

    const total = await ContactMessage.countDocuments(query);

    res.json({
      success: true,
      data: messages.map(message => message.toAdminJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

/**
 * Get contact message by ID
 */
const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await ContactMessage.findById(id)
      .populate('respondedBy', 'firstName lastName email');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      data: message.toAdminJSON()
    });
  } catch (error) {
    console.error('Error fetching contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message',
      error: error.message
    });
  }
};

/**
 * Respond to contact message
 */
const respondToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { response, internalNotes = '' } = req.body;

    const message = await ContactMessage.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.respond(response, req.user.id);
    if (internalNotes) {
      message.internalNotes = internalNotes;
      await message.save();
    }

    await message.populate('respondedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Response sent successfully',
      data: message.toAdminJSON()
    });
  } catch (error) {
    console.error('Error responding to message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send response',
      error: error.message
    });
  }
};

/**
 * Update message status
 */
const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, internalNotes = '' } = req.body;

    const message = await ContactMessage.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.updateStatus(status, internalNotes);
    await message.populate('respondedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Message status updated successfully',
      data: message.toAdminJSON()
    });
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message status',
      error: error.message
    });
  }
};

/**
 * Delete contact message
 */
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await ContactMessage.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await ContactMessage.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
};

/**
 * Get pending messages
 */
const getPendingMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.getPendingMessages();

    res.json({
      success: true,
      data: messages.map(message => message.toAdminJSON())
    });
  } catch (error) {
    console.error('Error fetching pending messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending messages',
      error: error.message
    });
  }
};

/**
 * Get message statistics
 */
const getMessageStats = async (req, res) => {
  try {
    const stats = await ContactMessage.getMessageStats();
    const total = await ContactMessage.countDocuments();
    const pending = await ContactMessage.countDocuments({ status: 'pending' });
    const resolved = await ContactMessage.countDocuments({ status: 'resolved' });

    res.json({
      success: true,
      data: {
        total,
        pending,
        resolved,
        breakdown: stats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching message stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message statistics',
      error: error.message
    });
  }
};

module.exports = {
  submitMessage,
  getMessages,
  getMessageById,
  respondToMessage,
  updateMessageStatus,
  deleteMessage,
  getPendingMessages,
  getMessageStats
};
