const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const { auth, admin } = require('../middleware/auth');

// Record a new payment
router.post('/record', auth, async (req, res) => {
  try {
    const { paymentId, amount, currency, status } = req.body;
    
    // Check if payment already exists
    const existingPayment = await Payment.findOne({ paymentId });
    if (existingPayment) {
      return res.status(400).json({ message: 'Payment already recorded' });
    }

    // Create new payment record
    const payment = new Payment({
      userId: req.user.id,
      paymentId,
      amount,
      currency,
      status: status || 'completed',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours validity
    });

    await payment.save();
    res.status(201).json(payment);
  } catch (error) {
    console.error('Payment recording error:', error);
    res.status(500).json({ message: 'Error recording payment' });
  }
});

// Check if user has valid payment
router.get('/check', auth, async (req, res) => {
  try {
    const validPayment = await Payment.findOne({
      userId: req.user.id,
      status: 'completed',
      expiresAt: { $gt: new Date() }
    });

    res.json({ hasValidPayment: !!validPayment });
  } catch (error) {
    console.error('Payment check error:', error);
    res.status(500).json({ message: 'Error checking payment status' });
  }
});

// Get payment history (admin only)
router.get('/history', [auth, admin], async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ message: 'Error fetching payment history' });
  }
});

module.exports = router; 