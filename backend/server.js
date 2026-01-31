// Load environment variables from .env file
require('dotenv').config();

// Import required packages
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware - Functions that run before our routes
app.use(cors()); // Allow frontend to talk to backend
app.use(express.json()); // Parse JSON data from requests

// Test route to check if server is working
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to OpenHearts API' });
});

// Routes will be added here soon
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/payment', require('./routes/payment'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});