const mongoose = require('mongoose');

// Define how a donation record looks
const donationSchema = new mongoose.Schema({
  // Who made the donation (reference to User)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links to User model
    required: true
  },
  
  // Which category they donated to
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Links to Category model
    required: true
  },
  
  // Amount donated (in dollars)
  amount: {
    type: Number,
    required: [true, 'Please provide donation amount'],
    min: [1, 'Minimum donation is $1']
  },
  
  // Stripe payment ID (proof of payment)
  paymentId: {
    type: String,
    required: true
  },
  
  // Payment status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  
  // Optional message from donor
  message: {
    type: String,
    maxlength: 500
  },
  
  // When donation was made
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Donation', donationSchema);