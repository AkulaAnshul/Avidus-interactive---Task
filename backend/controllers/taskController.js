const { readDB, writeDB } = require('../config/db');
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

    const db = readDB();

    const newTask = {
      id: `task_${Date.now()}`,
      title,
      description,
      status: 'Pending',
      creator: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.tasks.push(newTask);
    writeDB(db);

    // Log task creation activity
    await logActivity(
      req.user.id,
      req.user.email,
      req.user.role,
      'Task Creation',
      `Created task: "${newTask.title}"`,
      req
    );

    res.status(201).json({
      success: true,
      task: newTask
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
    const db = readDB();
    let tasks;

    // Check if the caller is Admin
    if (req.user.role === 'Admin') {
      // Admin views all tasks and populates creator details dynamically from JSON db
      tasks = db.tasks.map(task => {
        const creatorObj = db.users.find(u => u.id === task.creator);
        return {
          ...task,
          creator: creatorObj ? {
            id: creatorObj.id,
            name: creatorObj.name,
            email: creatorObj.email,
            role: creatorObj.role,
            status: creatorObj.status
          } : null
        };
      });
    } else {
      // Regular user views only their own tasks
      tasks = db.tasks.filter(t => t.creator === req.user.id);
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
    const db = readDB();
    
    // Find task in local DB
    const taskIndex = db.tasks.findIndex(t => t.id === req.params.id);

    if (taskIndex === -1) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const task = db.tasks[taskIndex];

    // Double check that the task owner is the one attempting the update
    if (task.creator !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You can only update your own tasks.' });
    }

    // Store old status and title for logging differences
    const oldTitle = task.title;
    const oldStatus = task.status;

    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;
    task.updatedAt = new Date().toISOString();

    db.tasks[taskIndex] = task;
    writeDB(db);

    // Compile audit details
    let auditDetails = `Updated task: "${oldTitle}"`;
    if (oldStatus !== task.status) {
      auditDetails += ` (Status changed: ${oldStatus} -> ${task.status})`;
    }

    // Log task update activity
    await logActivity(
      req.user.id,
      req.user.email,
      req.user.role,
      'Task Update',
      auditDetails,
      req
    );

    res.json({
      success: true,
      task
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
    const db = readDB();
    const taskIndex = db.tasks.findIndex(t => t.id === req.params.id);

    if (taskIndex === -1) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const task = db.tasks[taskIndex];

    // Security Gate: Check if user is the Owner OR is Admin
    const isOwner = task.creator === req.user.id;
    const isAdmin = req.user.role === 'Admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized. Only the owner or an administrator can delete this task.' });
    }

    // Remove from array
    db.tasks.splice(taskIndex, 1);
    writeDB(db);

    // Log task deletion activity
    await logActivity(
      req.user.id,
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
