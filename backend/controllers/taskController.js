const Task = require('../models/Task');
const { logActivity } = require('../middleware/activityLogger');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Please provide a title and description' });
    }

    const task = await Task.create({
      title,
      description,
      creator: req.user._id
    });

    // Log task creation activity
    await logActivity(
      req.user._id,
      req.user.email,
      req.user.role,
      'Task Creation',
      `Created task: "${task.title}"`,
      req
    );

    res.status(201).json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get tasks (Admins get all tasks; Users get only their own)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    let tasks;

    // Check if the caller is Admin
    if (req.user.role === 'Admin') {
      // Admin views all tasks and populates creator details
      tasks = await Task.find({}).populate('creator', 'name email role status');
    } else {
      // Regular user views only their own tasks
      tasks = await Task.find({ creator: req.user._id });
    }

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a task (Only the owner can update their own tasks)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Double check that the task owner is the one attempting the update
    if (task.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You can only update your own tasks.' });
    }

    // Store old status and title for logging differences
    const oldTitle = task.title;
    const oldStatus = task.status;

    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;

    const updatedTask = await task.save();

    // Compile audit details
    let auditDetails = `Updated task: "${oldTitle}"`;
    if (oldStatus !== updatedTask.status) {
      auditDetails += ` (Status changed: ${oldStatus} -> ${updatedTask.status})`;
    }

    // Log task update activity
    await logActivity(
      req.user._id,
      req.user.email,
      req.user.role,
      'Task Update',
      auditDetails,
      req
    );

    res.json({
      success: true,
      task: updatedTask
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a task (Owner can delete own task; Admin can delete ANY task)
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Security Gate: Check if user is the Owner OR is Admin
    const isOwner = task.creator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized. Only the owner or an administrator can delete this task.' });
    }

    // Perform deletion
    await Task.findByIdAndDelete(req.params.id);

    // Log task deletion activity
    await logActivity(
      req.user._id,
      req.user.email,
      req.user.role,
      'Task Deletion',
      `Deleted task: "${task.title}" (Deleted by: ${req.user.role})`,
      req
    );

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask };
