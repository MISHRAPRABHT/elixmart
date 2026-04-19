const router = require('express').Router();
const Category = require('../models/Category');
const { protect, isAdmin } = require('../middleware/auth');

// GET /api/categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.find().populate('parent', 'name slug').sort('name');
    res.json(categories);
  } catch (err) { next(err); }
});

// GET /api/categories/:id
router.get('/:id', async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).populate('parent', 'name slug');
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) { next(err); }
});

// POST /api/categories (Admin)
router.post('/', protect, isAdmin, async (req, res, next) => {
  try {
    const { name, description, image, parent } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const category = await Category.create({ name, slug, description, image, parent: parent || null });
    res.status(201).json(category);
  } catch (err) { next(err); }
});

// PUT /api/categories/:id (Admin)
router.put('/:id', protect, isAdmin, async (req, res, next) => {
  try {
    const { name, description, image, parent } = req.body;
    const updates = { description, image, parent };
    if (name) {
      updates.name = name;
      updates.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    const category = await Category.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) { next(err); }
});

// DELETE /api/categories/:id (Admin)
router.delete('/:id', protect, isAdmin, async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
