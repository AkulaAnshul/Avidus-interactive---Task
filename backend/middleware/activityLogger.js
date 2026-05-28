const { readDB, writeDB } = require('../config/db');

/**
 * Utility function to write a new activity log entry to the local JSON database file.
 * Can be imported and invoked inside route controllers upon successful events.
 *
 * @param {string} userId - ID of the user performing the action
 * @param {string} email - Email of the user performing the action
 * @param {string} role - Role of the user performing the action (Admin/User)
 * @param {string} action - Action Category ('Login', 'Task Creation', 'Task Update', 'Task Deletion')
 * @param {string} details - Detailed human-readable description of what was changed
 * @param {Object} req - The Express request object to resolve network details (IP address)
 */
const logActivity = async (userId, email, role, action, details, req) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1') : '127.0.0.1';
    
    const db = readDB();
    
    // Create new log record with robust unique ID
    const newLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      email,
      role,
      action,
      details,
      ipAddress,
      timestamp: new Date().toISOString()
    };
    
    db.logs.push(newLog);
    writeDB(db);
  } catch (error) {
    console.error(`Failed to record Activity Log: ${error.message}`);
  }
};

module.exports = { logActivity };
