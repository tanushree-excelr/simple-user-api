const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/simple_user_api';
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('DB connection failed', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
