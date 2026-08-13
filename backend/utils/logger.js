const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function logNotification(type, message, details = {}) {
  try {
    // 1. Write to log file
    const logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logFile = path.join(logDir, 'notifications.log');
    const timestamp = new Date().toISOString();
    const logEntry = JSON.stringify({
      timestamp,
      type,
      message,
      details
    }) + '\n';

    fs.appendFileSync(logFile, logEntry);

    // 2. Write to MySQL database
    const detailsStr = details ? JSON.stringify(details) : null;
    await db.pool.query(
      'INSERT INTO notification_logs (type, message, details_json) VALUES (?, ?, ?)',
      [type, message, detailsStr]
    );

    console.log(`[Notification Log] [${type}] ${message}`);
  } catch (error) {
    console.error('Failed to write notification log:', error);
  }
}

module.exports = { logNotification };
