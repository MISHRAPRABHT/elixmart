const router = require('express').Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

function normalizeAddress(input = {}) {
  const zipCode = input.zipCode || input.pincode || '';
  return {
    fullName: input.fullName || '',
    phone: input.phone || '',
    street: input.street || '',
    city: input.city || '',
    state: input.state || '',
    zipCode,
    country: input.country || 'India',
    isDefault: Boolean(input.isDefault),
  };
}

function validateAddress(addr) {
  const missing = [];
  if (!addr.fullName) missing.push('fullName');
  if (!addr.phone) missing.push('phone');
  if (!addr.street) missing.push('street');
  if (!addr.city) missing.push('city');
  if (!addr.state) missing.push('state');
  if (!addr.zipCode) missing.push('zipCode');
  if (missing.length) return `Missing fields: ${missing.join(', ')}`;
  return null;
}

// GET /api/addresses
router.get('/', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ addresses: user?.addresses || [] });
  } catch (err) { next(err); }
});

// POST /api/addresses
router.post('/', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = normalizeAddress(req.body);
    const validationError = validateAddress(addr);
    if (validationError) return res.status(400).json({ message: validationError });

    if (addr.isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    } else if (user.addresses.length === 0) {
      addr.isDefault = true;
    }

    user.addresses.push(addr);
    await user.save();
    res.status(201).json({ addresses: user.addresses });
  } catch (err) { next(err); }
});

// PUT /api/addresses/:addressId
router.put('/:addressId', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: 'Address not found' });

    const nextAddr = normalizeAddress({ ...address.toObject(), ...req.body });
    const validationError = validateAddress(nextAddr);
    if (validationError) return res.status(400).json({ message: validationError });

    if (nextAddr.isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }

    address.fullName = nextAddr.fullName;
    address.phone = nextAddr.phone;
    address.street = nextAddr.street;
    address.city = nextAddr.city;
    address.state = nextAddr.state;
    address.zipCode = nextAddr.zipCode;
    address.country = nextAddr.country;
    address.isDefault = nextAddr.isDefault;

    await user.save();
    res.json({ addresses: user.addresses });
  } catch (err) { next(err); }
});

// PUT /api/addresses/:addressId/default
router.put('/:addressId/default', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: 'Address not found' });

    user.addresses.forEach(a => { a.isDefault = false; });
    address.isDefault = true;
    await user.save();

    res.json({ addresses: user.addresses });
  } catch (err) { next(err); }
});

// DELETE /api/addresses/:addressId
router.delete('/:addressId', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: 'Address not found' });

    const wasDefault = address.isDefault;
    address.deleteOne();

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json({ addresses: user.addresses });
  } catch (err) { next(err); }
});

module.exports = router;

