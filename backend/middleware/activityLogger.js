const ActivityLog = require('../models/ActivityLog');

/**
 * Utility function to write a new activity log to the database.
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
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    await ActivityLog.create({
      userId,
      email,
      role,
      action,
      details,
      ipAddress
    });
  } catch (error) {
    console.error(`Failed to record Activity Log: ${error.message}`);
  }
};

module.exports = { logActivity };
