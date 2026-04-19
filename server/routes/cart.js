const router = require('express').Router();
const Cart = require('../models/Cart');
const { protect } = require('../middleware/auth');

// GET /api/cart
router.get('/', protect, async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price mrp images stock');
    if (!cart) cart = { items: [] };
    res.json(cart);
  } catch (err) { next(err); }
});

// POST /api/cart/add
router.post('/add', protect, async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const idx = cart.items.findIndex(i => i.product.toString() === productId);
    if (idx > -1) {
      cart.items[idx].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    await cart.save();
    cart = await Cart.findById(cart._id).populate('items.product', 'name price mrp images stock');
    res.json(cart);
  } catch (err) { next(err); }
});

// PUT /api/cart/update
router.put('/update', protect, async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const idx = cart.items.findIndex(i => i.product.toString() === productId);
    if (idx === -1) return res.status(404).json({ message: 'Item not in cart' });

    if (quantity <= 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity = quantity;
    }
    await cart.save();
    const updated = await Cart.findById(cart._id).populate('items.product', 'name price mrp images stock');
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /api/cart/remove/:productId
router.delete('/remove/:productId', protect, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    await cart.save();
    const updated = await Cart.findById(cart._id).populate('items.product', 'name price mrp images stock');
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /api/cart/clear
router.delete('/clear', protect, async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ items: [] });
  } catch (err) { next(err); }
});

module.exports = router;
