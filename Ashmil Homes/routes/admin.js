const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Property = require('../models/Property');
const auth = require('../middleware/auth');
const router = express.Router();

// ---- CREATE DEFAULT ADMIN ----
const initAdmin = async () => {
  const count = await Admin.countDocuments();
  if (count === 0) {
    const hash = await bcrypt.hash('Admin123!', 10);
    await Admin.create({ email: 'admin@ashmil.com', password: hash });
    console.log('✅ Default admin created: admin@ashmil.com / Admin123!');
  }
};
initAdmin();

// ---- LOGIN ----
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
  const match = await admin.comparePassword(password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, message: 'Login successful' });
});

// ---- GET ALL PROPERTIES (admin) ----
router.get('/properties', auth, async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- ADD PROPERTY (no file upload, only URLs) ----
router.post('/properties', auth, async (req, res) => {
  try {
    const { title, description, price, location, category, bedrooms, bathrooms, area, featured, images, video } = req.body;
    if (!title || !description || !price || !location || !category) {
      return res.status(400).json({ error: 'Missing required fields: title, description, price, location, category' });
    }

    // Process images: if images is a string, split by comma/newline; else use array
    let imageArray = [];
    if (typeof images === 'string') {
      imageArray = images.split(/[\n,]+/).map(s => s.trim()).filter(s => s);
    } else if (Array.isArray(images)) {
      imageArray = images.filter(s => s);
    }

    const property = new Property({
      title,
      description,
      price,
      location,
      category,
      bedrooms: Number(bedrooms) || 0,
      bathrooms: Number(bathrooms) || 0,
      area: area || '',
      featured: featured === 'true',
      images: imageArray,
      video: video || ''
    });
    await property.save();
    res.status(201).json(property);
  } catch (err) {
    console.error('Error saving property:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---- UPDATE PROPERTY ----
router.put('/properties/:id', auth, async (req, res) => {
  try {
    const updates = { ...req.body };
    // Process images if provided
    if (updates.images) {
      if (typeof updates.images === 'string') {
        updates.images = updates.images.split(/[\n,]+/).map(s => s.trim()).filter(s => s);
      } else if (!Array.isArray(updates.images)) {
        updates.images = [];
      }
    }
    // Convert numeric fields
    if (updates.bedrooms) updates.bedrooms = Number(updates.bedrooms);
    if (updates.bathrooms) updates.bathrooms = Number(updates.bathrooms);
    if (updates.featured) updates.featured = updates.featured === 'true';

    const property = await Property.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- DELETE PROPERTY ----
router.delete('/properties/:id', auth, async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Property deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
