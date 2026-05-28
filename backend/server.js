const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');

// Initialize Database Connection
connectDB();

const app = express();

// Standard Middlewares
app.use(cors({
  origin: '*', // In development, allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Enable HTTP Request logging in dev environments
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// API Routes mounting point
app.use('/api', apiRoutes);

// Root Health check route
app.get('/', (req, res) => {
  res.json({ message: 'RBAC Task Manager API is running smoothly!' });
});

// Global Fallback Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Spin up HTTP Server listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
