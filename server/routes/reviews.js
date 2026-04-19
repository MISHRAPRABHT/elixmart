const router = require('express').Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// GET /api/reviews/:productId
router.get('/:productId', async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar').sort('-createdAt');
    res.json(reviews);
  } catch (err) { next(err); }
});

// POST /api/reviews/:productId
router.post('/:productId', protect, async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body;
    const existing = await Review.findOne({ user: req.user._id, product: req.params.productId });
    if (existing) return res.status(400).json({ message: 'You already reviewed this product' });

    await Review.create({ user: req.user._id, product: req.params.productId, rating, title, comment });

    // Update product rating
    const reviews = await Review.find({ product: req.params.productId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(req.params.productId, { ratings: Math.round(avgRating * 10) / 10, numReviews: reviews.length });

    res.status(201).json({ message: 'Review added' });
  } catch (err) { next(err); }
});

module.exports = router;
