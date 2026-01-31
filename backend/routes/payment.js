const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protect } = require('../middleware/auth');

// @route   POST /api/payment/create-payment-intent
// @desc    Create Stripe payment intent
// @access  Private
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { amount } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Create payment intent
    // Amount should be in cents (multiply by 100)
    
    const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(amount * 100), // Convert rupees to cents
  currency: 'lkr', // ← CHANGED FROM 'usd' to 'lkr'
  metadata: {
    userId: req.user._id.toString(),
    userName: req.user.name
  }
});

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ 
      message: 'Payment processing error', 
      error: error.message 
    });
  }
});

module.exports = router;