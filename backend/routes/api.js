const express = require('express');
const router = express.Router();

// Middleware
const { protect, admin } = require('../middleware/authMiddleware');

// Controllers
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController');
const {
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAdminAnalytics,
  getActivityLogs
} = require('../controllers/adminController');

// ==========================================
// AUTH ROUTES (/api/auth)
// ==========================================
router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.get('/auth/me', protect, getMe);

// ==========================================
// TASK ROUTES (/api/tasks)
// ==========================================
router.post('/tasks', protect, createTask);
router.get('/tasks', protect, getTasks);
router.put('/tasks/:id', protect, updateTask);
router.delete('/tasks/:id', protect, deleteTask);

// ==========================================
// ADMIN ROUTES (/api/admin)
// ==========================================
router.get('/admin/users', protect, admin, getAllUsers);
router.put('/admin/users/:id/status', protect, admin, updateUserStatus);
router.delete('/admin/users/:id', protect, admin, deleteUser);
router.get('/admin/analytics', protect, admin, getAdminAnalytics);
router.get('/admin/logs', protect, admin, getActivityLogs);

module.exports = router;
