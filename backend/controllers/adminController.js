const { readDB, writeDB } = require('../config/db');
const { logActivity } = require('../middleware/activityLogger');

// @desc    View all registered users
// @route   GET /api/admin/users
// @access  Private (Admin Only)
const getAllUsers = async (req, res) => {
  try {
    const db = readDB();
    // Exclude password from the results
    const safeUsers = db.users.map(({ password, ...u }) => u);
    
    res.json({
      success: true,
      count: safeUsers.length,
      users: safeUsers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a user's status (Active/Inactive)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin Only)
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid status (Active or Inactive)' });
    }

    const db = readDB();
    const userIndex = db.users.findIndex(u => u.id === req.params.id);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = db.users[userIndex];

    // Prevent Admin from deactivating themselves
    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account.' });
    }

    const oldStatus = user.status;
    user.status = status;
    db.users[userIndex] = user;
    writeDB(db);

    // Log admin action
    await logActivity(
      req.user.id,
      req.user.email,
      req.user.role,
      'Login', 
      `Admin changed status of user "${user.email}" from ${oldStatus} to ${status}`,
      req
    );

    res.json({
      success: true,
      message: `User status successfully updated to ${status}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a user and cascade delete their tasks
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin Only)
const deleteUser = async (req, res) => {
  try {
    const db = readDB();
    const userIndex = db.users.findIndex(u => u.id === req.params.id);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = db.users[userIndex];

    // Prevent Admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    // Cascade delete tasks created by this user
    const originalTasksLength = db.tasks.length;
    db.tasks = db.tasks.filter(t => t.creator !== req.params.id);
    const deletedTasksCount = originalTasksLength - db.tasks.length;

    // Delete user
    db.users.splice(userIndex, 1);
    writeDB(db);

    // Log admin action
    await logActivity(
      req.user.id,
      req.user.email,
      req.user.role,
      'Task Deletion',
      `Admin deleted user "${user.email}" and cascade-removed ${deletedTasksCount} tasks`,
      req
    );

    res.json({
      success: true,
      message: 'User and their created tasks deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get system-wide analytics (Total users, tasks, status distribution)
// @route   GET /api/admin/analytics
// @access  Private (Admin Only)
const getAdminAnalytics = async (req, res) => {
  try {
    const db = readDB();

    const totalUsers = db.users.length;
    const totalTasks = db.tasks.length;
    const completedTasks = db.tasks.filter(t => t.status === 'Completed').length;
    const pendingTasks = db.tasks.filter(t => t.status === 'Pending').length;

    res.json({
      success: true,
      analytics: {
        totalUsers,
        totalTasks,
        completedTasks,
        pendingTasks
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all activity logs
// @route   GET /api/admin/logs
// @access  Private (Admin Only)
const getActivityLogs = async (req, res) => {
  try {
    const db = readDB();

    // Sort by latest timestamp first (newest entries added last in JSON database)
    const sortedLogs = [...db.logs].reverse().slice(0, 100);

    res.json({
      success: true,
      count: sortedLogs.length,
      logs: sortedLogs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAdminAnalytics,
  getActivityLogs
};
