const router = require('express').Router();
const Wishlist = require('../models/Wishlist');
const { protect } = require('../middleware/auth');

// GET /api/wishlist
router.get('/', protect, async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products', 'name price mrp images ratings');
    if (!wishlist) wishlist = { products: [] };
    res.json(wishlist);
  } catch (err) { next(err); }
});

// POST /api/wishlist/toggle
router.post('/toggle', protect, async (req, res, next) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) wishlist = new Wishlist({ user: req.user._id, products: [] });

    const idx = wishlist.products.findIndex(p => p.toString() === productId);
    if (idx > -1) {
      wishlist.products.splice(idx, 1);
    } else {
      wishlist.products.push(productId);
    }
    await wishlist.save();
    wishlist = await Wishlist.findById(wishlist._id).populate('products', 'name price mrp images ratings');
    res.json(wishlist);
  } catch (err) { next(err); }
});

module.exports = router;
