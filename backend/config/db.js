const mongoose = require('mongoose');

/**
 * Asynchronously establishes a connection to MongoDB using the URI supplied in environmental configs.
 * Gracefully logs and terminates backend operations upon critical connection errors.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/avidus_task');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
