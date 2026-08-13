const nodemailer = require('nodemailer');
const settingsService = require('../modules/settings/settings.service');

/**
 * Mailer Utility
 * Dynamically creates a transporter using settings from the database
 */
const sendEmail = async (options) => {
  // Fetch SMTP settings from DB
  const smtpConfig = await settingsService.getSettingsByGroup('smtp');
  
  if (!smtpConfig.smtp_host) {
    console.warn('SMTP host not configured. Email not sent.');
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: smtpConfig.smtp_host,
    port: parseInt(smtpConfig.smtp_port) || 465,
    secure: smtpConfig.smtp_encryption === 'ssl', // true for 465, false for other ports
    auth: {
      user: smtpConfig.smtp_user,
      pass: smtpConfig.smtp_password,
    },
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: `"${smtpConfig.smtp_from_name || 'NextPress Admin'}" <${smtpConfig.smtp_from_email || smtpConfig.smtp_user}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || options.message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = sendEmail;
