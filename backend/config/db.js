// Import mongoose (MongoDB library)
const mongoose = require('mongoose');

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    // Connect to MongoDB using the connection string from .env file
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    // If connection fails, show error and stop the app
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1); // Exit with failure
  }
};

// Export so we can use it in server.js
module.exports = connectDB;