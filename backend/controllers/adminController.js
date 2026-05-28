const User = require('../models/User');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const { logActivity } = require('../middleware/activityLogger');

// @desc    View all registered users
// @route   GET /api/admin/users
// @access  Private (Admin Only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({
      success: true,
      count: users.length,
      users
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

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent Admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account.' });
    }

    const oldStatus = user.status;
    user.status = status;
    await user.save();

    // Log admin action
    await logActivity(
      req.user._id,
      req.user.email,
      req.user.role,
      'Login', // Category of audit, let's keep it clean or make it a specific login activity type if desired
      `Admin changed status of user "${user.email}" from ${oldStatus} to ${status}`,
      req
    );

    res.json({
      success: true,
      message: `User status successfully updated to ${status}`,
      user: {
        _id: user._id,
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
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent Admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    // Cascade delete tasks created by this user
    const deletedTasksCount = await Task.deleteMany({ creator: req.params.id });

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    // Log admin action
    await logActivity(
      req.user._id,
      req.user.email,
      req.user.role,
      'Task Deletion', // Fit Category
      `Admin deleted user "${user.email}" and cascade-removed ${deletedTasksCount.deletedCount} tasks`,
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
    const totalUsers = await User.countDocuments({});
    const totalTasks = await Task.countDocuments({});
    const completedTasks = await Task.countDocuments({ status: 'Completed' });
    const pendingTasks = await Task.countDocuments({ status: 'Pending' });

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
    // Sort by latest timestamp first
    const logs = await ActivityLog.find({})
      .sort({ timestamp: -1 })
      .limit(100); // Limit to last 100 for performance

    res.json({
      success: true,
      count: logs.length,
      logs
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
