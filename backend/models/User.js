const mongoose = require('mongoose');

// Define how a User should look in the database
const userSchema = new mongoose.Schema({
  // User's full name
  name: {
    type: String,
    required: [true, 'Please provide a name'], // Must provide name
    trim: true // Remove extra spaces
  },
  
  // User's email (must be unique)
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true, // No two users can have same email
    lowercase: true, // Convert to lowercase
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'] // Email format check
  },
  
  // User's password (will be encrypted)
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  
  // User role: either 'donor' or 'admin'
  role: {
    type: String,
    enum: ['donor', 'admin'], // Only these two values allowed
    default: 'donor' // By default, everyone is a donor
  },
  
  // When the user registered
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the model
module.exports = mongoose.model('User', userSchema);