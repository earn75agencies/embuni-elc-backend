/**
 * Email Service
 * Handles email sending for voting links and notifications
 */

const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  if (!process.env.SMTP_HOST) {
    console.warn('SMTP not configured. Email sending disabled.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

/**
 * Send voting link email
 */
exports.sendVotingLink = async ({ to, name, electionTitle, voteUrl, expiresAt }) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn('Email not sent - SMTP not configured');
    return false;
  }

  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Equity Leaders Program</h1>
            <h2>Voting Invitation</h2>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>You have been invited to vote in the following election:</p>
            <h3>${electionTitle}</h3>
            <p>Click the button below to access your secure voting link:</p>
            <a href="${voteUrl}" class="button">Cast Your Vote</a>
            <p><strong>Important:</strong></p>
            <ul>
              <li>This link is unique to you and can only be used once</li>
              <li>The link expires on ${new Date(expiresAt).toLocaleString()}</li>
              <li>Do not share this link with anyone</li>
            </ul>
            <p>If you did not expect this email, please ignore it.</p>
            <p>Best regards,<br>Equity Leaders Program</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Equity Leaders Program - Voting Invitation
      
      Dear ${name},
      
      You have been invited to vote in: ${electionTitle}
      
      Click here to vote: ${voteUrl}
      
      This link is unique to you and expires on ${new Date(expiresAt).toLocaleString()}.
      
      Best regards,
      Equity Leaders Program
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: `Voting Invitation: ${electionTitle}`,
      text,
      html
    });

    return true;
  } catch (error) {
    console.error('Failed to send voting link email:', error);
    return false;
  }
};

/**
 * Send election reminder
 */
exports.sendElectionReminder = async ({ to, name, electionTitle, voteUrl, timeRemaining }) => {
  const transporter = createTransporter();
  if (!transporter) {return false;}

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: `Reminder: ${electionTitle} - Voting Closes Soon`,
      html: `
        <h2>Voting Reminder</h2>
        <p>Dear ${name},</p>
        <p>This is a reminder that voting for <strong>${electionTitle}</strong> closes in ${timeRemaining}.</p>
        <p><a href="${voteUrl}">Cast your vote now</a></p>
      `
    });
    return true;
  } catch (error) {
    console.error('Failed to send reminder:', error);
    return false;
  }
};

module.exports = exports;

