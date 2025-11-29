const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const handlebars = require('handlebars');
const logger = require('./logger');

/**
 * Email Service Configuration
 */

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initialize();
  }

  /**
   * Initialize email transporter
   */
  initialize() {
    try {
      // Check if email is configured
      const hasEmailConfig = process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS;
      
      if (!hasEmailConfig) {
        logger.info('Email service not configured - using mock transporter for development');
        this.transporter = this.createMockTransporter();
        this.isConfigured = false;
        return;
      }

      // Create transporter based on environment
      if (process.env.NODE_ENV === 'production') {
        // Production email service (e.g., SendGrid, AWS SES)
        this.transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT || 587,
          secure: process.env.EMAIL_SECURE === 'true',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
      } else {
        // Development configuration
        this.transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
          port: process.env.EMAIL_PORT || 2525,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER || 'test-user',
            pass: process.env.EMAIL_PASS || 'test-pass'
          }
        });
      }

      // Verify configuration
      this.transporter.verify((error, success) => {
        if (error) {
          logger.warn('Email service verification failed:', error.message);
          this.isConfigured = false;
        } else {
          logger.info('Email service configured successfully');
          this.isConfigured = true;
        }
      });
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
      this.transporter = this.createMockTransporter();
      this.isConfigured = false;
    }
  }

  /**
   * Create mock transporter for development when email is not configured
   */
  createMockTransporter() {
    return {
      sendMail: async (options) => {
        logger.info('📧 Mock email sent:', {
          to: options.to,
          subject: options.subject,
          template: options.template,
          isConfigured: false
        });
        return { messageId: 'mock-' + Date.now() };
      }
    };
  }

  /**
   * Load email template
   */
  async loadTemplate(templateName, data) {
    try {
      const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.hbs`);
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      const template = handlebars.compile(templateContent);
      return template(data);
    } catch (error) {
      logger.error(`Failed to load email template ${templateName}:`, error);
      // Fallback to basic HTML
      return this.generateFallbackHTML(data);
    }
  }

  /**
   * Generate fallback HTML email
   */
  generateFallbackHTML(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${data.subject || 'Email Notification'}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>University of Embu Equity Leaders Program</h1>
          </div>
          <div class="content">
            ${data.message || data.content || 'No content provided'}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} University of Embu Equity Leaders Program</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send email
   */
  async sendEmail(options) {
    if (!this.isConfigured) {
      logger.warn('Email service not configured. Skipping email send.');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const mailOptions = {
        from: options.from || process.env.EMAIL_FROM || '"ELP Embu" <noreply@embuni.ac.ke>',
        to: options.to,
        subject: options.subject,
        html: options.html || await this.loadTemplate(options.template, options.data),
        text: options.text
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${options.to}:`, result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
        response: result.response
      };
    } catch (error) {
      logger.error(`Failed to send email to ${options.to}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(user) {
    return this.sendEmail({
      to: user.email,
      subject: 'Welcome to Equity Leaders Program',
      template: 'welcome',
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    return this.sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      template: 'password-reset',
      data: {
        firstName: user.firstName,
        resetUrl,
        expiresIn: '10 minutes'
      }
    });
  }

  /**
   * Send email verification email
   */
  async sendEmailVerification(user, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    return this.sendEmail({
      to: user.email,
      subject: 'Verify Your Email Address',
      template: 'email-verification',
      data: {
        firstName: user.firstName,
        verificationUrl
      }
    });
  }

  /**
   * Send application confirmation email
   */
  async sendApplicationConfirmation(user, applicationType, applicationData) {
    return this.sendEmail({
      to: user.email,
      subject: `${applicationType} Application Received`,
      template: 'application-confirmation',
      data: {
        firstName: user.firstName,
        applicationType,
        applicationData,
        submittedAt: new Date().toLocaleDateString()
      }
    });
  }

  /**
   * Send admin notification email
   */
  async sendAdminNotification(subject, message, recipients = null) {
    const adminEmails = recipients || process.env.ADMIN_EMAILS?.split(',') || ['admin@embuni.ac.ke'];
    
    return this.sendEmail({
      to: adminEmails.join(', '),
      subject: `[Admin Notification] ${subject}`,
      template: 'admin-notification',
      data: {
        subject,
        message,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Send voting invitation email
   */
  async sendVotingInvitation(user, election, votingLink) {
    return this.sendEmail({
      to: user.email,
      subject: `Voting Invitation: ${election.title}`,
      template: 'voting-invitation',
      data: {
        firstName: user.firstName,
        electionTitle: election.title,
        votingLink,
        startDate: election.startDate,
        endDate: election.endDate
      }
    });
  }

  /**
   * Send mentorship session reminder
   */
  async sendSessionReminder(user, session) {
    return this.sendEmail({
      to: user.email,
      subject: 'Mentorship Session Reminder',
      template: 'session-reminder',
      data: {
        firstName: user.firstName,
        sessionDate: session.date,
        sessionTime: session.time,
        mentorName: session.mentorName,
        sessionLink: session.meetingLink
      }
    });
  }

  /**
   * Send bulk email (for newsletters, announcements)
   */
  async sendBulkEmail(recipients, subject, content, template = null) {
    const results = [];
    
    for (const recipient of recipients) {
      try {
        const result = await this.sendEmail({
          to: recipient.email,
          subject,
          template: template || 'bulk-email',
          data: {
            firstName: recipient.firstName || 'Valued Member',
            content,
            unsubscribeLink: `${process.env.FRONTEND_URL}/unsubscribe?email=${recipient.email}`
          }
        });
        
        results.push({ email: recipient.email, success: true, result });
      } catch (error) {
        results.push({ email: recipient.email, success: false, error: error.message });
      }
    }
    
    return results;
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;