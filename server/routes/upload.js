const router = require('express').Router();
const { protect, isAdmin } = require('../middleware/auth');
const { upload, cloudinary } = require('../middleware/upload');

// POST /api/upload - Single image upload
router.post('/', protect, isAdmin, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided' });
    res.json({ url: req.file.path, public_id: req.file.filename });
  } catch (err) { next(err); }
});

// POST /api/upload/multiple - Multiple images upload
router.post('/multiple', protect, isAdmin, upload.array('images', 5), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'No images provided' });
    const images = req.files.map(f => ({ url: f.path, public_id: f.filename }));
    res.json(images);
  } catch (err) { next(err); }
});

// DELETE /api/upload/:publicId
router.delete('/:publicId', protect, isAdmin, async (req, res, next) => {
  try {
    await cloudinary.uploader.destroy(req.params.publicId);
    res.json({ message: 'Image deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
