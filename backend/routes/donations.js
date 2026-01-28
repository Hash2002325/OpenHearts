const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const Category = require('../models/Category');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/donations
// @desc    Get all donations (admin) or user's donations (donor)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let donations;

    // If user is admin, get all donations
    if (req.user.role === 'admin') {
      donations = await Donation.find()
        .populate('user', 'name email') // Include user's name and email
        .populate('category', 'name')   // Include category name
        .sort({ createdAt: -1 });
    } else {
      // If regular user, get only their donations
      donations = await Donation.find({ user: req.user._id })
        .populate('category', 'name')
        .sort({ createdAt: -1 });
    }

    res.json(donations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/donations/:id
// @desc    Get single donation
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('user', 'name email')
      .populate('category', 'name description');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Check if user owns this donation or is admin
    if (donation.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this donation' });
    }

    res.json(donation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/donations
// @desc    Create new donation (we'll add Stripe payment later)
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { category, amount, message, paymentId } = req.body;

    // Validation
    if (!category || !amount || !paymentId) {
      return res.status(400).json({ message: 'Please provide category, amount, and paymentId' });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Create donation
    const donation = await Donation.create({
      user: req.user._id,
      category,
      amount,
      paymentId,
      message: message || '',
      status: 'completed' // We'll update this when we add Stripe
    });

    // Update category's total donations
    categoryExists.totalDonations += amount;
    await categoryExists.save();

    // Populate user and category info before sending response
    await donation.populate('user', 'name email');
    await donation.populate('category', 'name');

    res.status(201).json(donation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/donations/stats/total
// @desc    Get donation statistics
// @access  Private/Admin
router.get('/stats/total', protect, admin, async (req, res) => {
  try {
    // Calculate total donations
    const totalDonations = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Count total donors
    const totalDonors = await Donation.distinct('user').countDocuments();

    // Count donations by category
    const donationsByCategory = await Donation.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      }
    ]);

    res.json({
      totalAmount: totalDonations[0]?.total || 0,
      totalDonors,
      donationsByCategory
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;