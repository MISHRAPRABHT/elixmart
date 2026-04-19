const router = require('express').Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// GET /api/ai/search-suggestions?q=...
// AI Smart Search — returns products, brands, categories matching the query
router.get('/search-suggestions', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q || q.length < 2) {
      // Return trending searches when no query
      const trending = await Product.find({ isFeatured: true })
        .limit(6).select('name images price brand');
      const topBrands = await Product.distinct('brand');
      return res.json({
        products: [], brands: [], categories: [],
        trending: trending.map(p => ({ _id: p._id, name: p.name, image: p.images?.[0]?.url, price: p.price })),
        popularSearches: ['iPhone', 'Nike Shoes', 'Headphones', 'Watch', 'Laptop', 'Kurta', 'Sunglasses', 'Protein'],
        topBrands: topBrands.slice(0, 8)
      });
    }

    const regex = new RegExp(q, 'i');

    // Parallel queries for speed
    const [products, brands, categories] = await Promise.all([
      Product.find({ $or: [{ name: regex }, { brand: regex }, { tags: regex }] })
        .limit(6).select('name price mrp images brand ratings'),
      Product.distinct('brand', { brand: regex }),
      Category.find({ name: regex }).select('name slug image')
    ]);

    // AI-style "Did you mean?" suggestion (simple Levenshtein-like)
    let didYouMean = null;
    if (products.length === 0) {
      const allNames = await Product.distinct('name');
      const lower = q.toLowerCase();
      const closest = allNames.find(n => {
        const nl = n.toLowerCase();
        return nl.includes(lower.slice(0, 3)) || lower.includes(nl.slice(0, 3));
      });
      if (closest) didYouMean = closest;
    }

    res.json({
      products: products.map(p => ({
        _id: p._id, name: p.name, price: p.price, mrp: p.mrp,
        image: p.images?.[0]?.url, brand: p.brand, ratings: p.ratings
      })),
      brands,
      categories,
      didYouMean,
      resultCount: products.length
    });
  } catch (err) { next(err); }
});

// GET /api/ai/trending
// Returns trending/popular products for homepage
router.get('/trending', async (req, res, next) => {
  try {
    const products = await Product.find()
      .sort({ numReviews: -1, ratings: -1 })
      .limit(8)
      .select('name price mrp images ratings numReviews brand')
      .populate('category', 'name');
    res.json(products);
  } catch (err) { next(err); }
});

// GET /api/ai/recommendations/:productId
router.get('/recommendations/:productId', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const similar = await Product.find({
      _id: { $ne: product._id },
      $or: [
        { category: product.category },
        { tags: { $in: product.tags } },
        { brand: product.brand }
      ]
    }).limit(8).select('name price mrp images ratings numReviews');

    res.json(similar);
  } catch (err) { next(err); }
});

// GET /api/ai/personalized
router.get('/personalized', protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('items.product');
    const purchasedCategories = new Set();
    const purchasedBrands = new Set();
    const purchasedIds = new Set();

    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.product) {
          purchasedCategories.add(item.product.category?.toString());
          purchasedBrands.add(item.product.brand);
          purchasedIds.add(item.product._id.toString());
        }
      });
    });

    const recommended = await Product.find({
      _id: { $nin: [...purchasedIds] },
      $or: [
        { category: { $in: [...purchasedCategories] } },
        { brand: { $in: [...purchasedBrands] } }
      ]
    }).limit(12).select('name price mrp images ratings numReviews');

    res.json(recommended);
  } catch (err) { next(err); }
});

// POST /api/ai/image-search
router.post('/image-search', async (req, res, next) => {
  try {
    const products = await Product.aggregate([{ $sample: { size: 6 } }]);
    res.json({
      message: 'Image analyzed successfully (mock mode)',
      matches: products.map(p => ({
        ...p, confidence: (Math.random() * 30 + 70).toFixed(1) + '%'
      }))
    });
  } catch (err) { next(err); }
});

module.exports = router;
