const router = require('express').Router();
const crypto = require('crypto');
const { protect } = require('../middleware/auth');

let Razorpay;
try { Razorpay = require('razorpay'); } catch (e) { /* optional */ }

// POST /api/payment/create-order
router.post('/create-order', protect, async (req, res, next) => {
  try {
    const { amount } = req.body; // amount in INR
    if (!Razorpay || !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_demo') {
      // Mock mode - return a fake order for testing
      return res.json({
        id: 'order_mock_' + Date.now(),
        amount: amount * 100,
        currency: 'INR',
        status: 'created',
        mockMode: true
      });
    }
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    const order = await razorpay.orders.create({
      amount: amount * 100, currency: 'INR', receipt: 'receipt_' + Date.now()
    });
    res.json(order);
  } catch (err) { next(err); }
});

// POST /api/payment/verify
router.post('/verify', protect, async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    // Mock mode
    if (razorpay_order_id?.startsWith('order_mock_')) {
      return res.json({ verified: true, mockMode: true });
    }
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
    const verified = expectedSig === razorpay_signature;
    res.json({ verified });
  } catch (err) { next(err); }
});

// GET /api/payment/key
router.get('/key', protect, (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo' });
});

module.exports = router;
