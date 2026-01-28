const mongoose = require('mongoose');

// Define donation categories (Education, Healthcare, etc.)
const categorySchema = new mongoose.Schema({
  // Category name (e.g., "Education", "Healthcare")
  name: {
    type: String,
    required: [true, 'Please provide a category name'],
    unique: true,
    trim: true
  },
  
  // Description of what this category supports
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  
  // Image URL for the category (optional)
  image: {
    type: String,
    default: 'https://via.placeholder.com/300' // Placeholder if no image
  },
  
  // Track total donations to this category
  totalDonations: {
    type: Number,
    default: 0
  },
  
  // When category was created
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Category', categorySchema);