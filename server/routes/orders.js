const router = require('express').Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect, isAdmin } = require('../middleware/auth');

// POST /api/orders/create
router.post('/create', protect, async (req, res, next) => {
  try {
    const { shippingAddress, paymentInfo } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    const items = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.images?.[0]?.url || '',
      price: item.product.price,
      quantity: item.quantity
    }));

    const itemsTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingCost = itemsTotal > 500 ? 0 : 40;
    const tax = Math.round(itemsTotal * 0.18);
    const totalAmount = itemsTotal + shippingCost + tax;

    const order = await Order.create({
      user: req.user._id, items, shippingAddress, paymentInfo,
      itemsTotal, shippingCost, tax, totalAmount,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // Reduce stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
    }
    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (err) { next(err); }
});

// GET /api/orders - User's orders
router.get('/', protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt').populate('items.product', 'name images');
    res.json(orders);
  } catch (err) { next(err); }
});

// GET /api/orders/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images price').populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    // Only owner or admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(order);
  } catch (err) { next(err); }
});

// PUT /api/orders/:id/status (Admin)
router.put('/:id/status', protect, isAdmin, async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, note: note || `Order ${status}`, timestamp: new Date() });
    if (status === 'shipped') order.trackingNumber = 'TRK' + Date.now();
    if (status === 'delivered') order.paymentInfo.status = 'paid';
    await order.save();
    res.json(order);
  } catch (err) { next(err); }
});

// GET /api/orders/admin/all (Admin)
router.get('/admin/all', protect, isAdmin, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query).populate('user', 'name email').sort('-createdAt').skip(skip).limit(Number(limit)),
      Order.countDocuments(query)
    ]);
    res.json({ orders, page: Number(page), pages: Math.ceil(total / Number(limit)), total });
  } catch (err) { next(err); }
});

module.exports = router;
