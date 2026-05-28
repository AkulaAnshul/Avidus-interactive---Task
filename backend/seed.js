const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Task = require('./models/Task');
const ActivityLog = require('./models/ActivityLog');

const seedDB = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/avidus_task');
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    await ActivityLog.deleteMany({});
    console.log('Cleared existing Users, Tasks, and Activity Logs.');

    // Seed Admin Account
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'Admin',
      status: 'Active'
    });
    console.log('Seeded Admin Account: admin@example.com / password123');

    // Seed Standard User Account
    const standardUser = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'User',
      status: 'Active'
    });
    console.log('Seeded Standard User Account: john@example.com / password123');

    // Seed Inactive User Account (to verify inactive lockouts)
    const inactiveUser = await User.create({
      name: 'Disabled User',
      email: 'disabled@example.com',
      password: 'password123',
      role: 'User',
      status: 'Inactive'
    });
    console.log('Seeded Inactive User Account: disabled@example.com / password123');

    // Seed some initial Tasks
    const task1 = await Task.create({
      title: 'Design System Implementation',
      description: 'Implement premium vanilla CSS glassmorphic components in frontend.',
      status: 'Completed',
      creator: standardUser._id
    });
    console.log('Seeded Task 1 owned by John');

    const task2 = await Task.create({
      title: 'E2E Testing',
      description: 'Verify routing protections and activity logs backend compliance.',
      status: 'Pending',
      creator: standardUser._id
    });
    console.log('Seeded Task 2 owned by John');

    const task3 = await Task.create({
      title: 'Database Security Sweep',
      description: 'Enforce access scopes on task collection operations.',
      status: 'Pending',
      creator: adminUser._id
    });
    console.log('Seeded Task 3 owned by Admin');

    // Seed initial Activity logs for setup
    await ActivityLog.create([
      {
        userId: adminUser._id,
        email: adminUser.email,
        role: adminUser.role,
        action: 'Login',
        details: 'Admin account seeded and provisioned',
        ipAddress: '127.0.0.1'
      },
      {
        userId: standardUser._id,
        email: standardUser.email,
        role: standardUser.role,
        action: 'Task Creation',
        details: `Seeded task: "${task1.title}"`,
        ipAddress: '127.0.0.1'
      },
      {
        userId: standardUser._id,
        email: standardUser.email,
        role: standardUser.role,
        action: 'Task Creation',
        details: `Seeded task: "${task2.title}"`,
        ipAddress: '127.0.0.1'
      }
    ]);
    console.log('Seeded initial audit activity logs.');

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
