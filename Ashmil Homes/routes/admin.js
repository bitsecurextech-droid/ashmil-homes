const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Property = require('../models/Property');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// ---- CREATE DEFAULT ADMIN (only first run) ----
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

// ---- ADD PROPERTY (with images + video URL) ----
router.post('/properties', auth, upload.array('images', 10), async (req, res) => {
  try {
    console.log('Received property data:', req.body);
    console.log('Files:', req.files);
    const { title, description, price, location, category, bedrooms, bathrooms, area, featured, video } = req.body;
    if (!title || !description || !price || !location || !category) {
      return res.status(400).json({ error: 'Missing required fields: title, description, price, location, category' });
    }
    const images = req.files ? req.files.map(file => '/uploads/' + file.filename) : [];
    const property = new Property({
      title, description, price, location, category,
      bedrooms: Number(bedrooms) || 0,
      bathrooms: Number(bathrooms) || 0,
      area: area || '',
      featured: featured === 'true',
      images,
      video: video || '' // store video URL string
    });
    await property.save();
    res.status(201).json(property);
  } catch (err) {
    console.error('Error saving property:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---- UPDATE PROPERTY (with images + video URL) ----
router.put('/properties/:id', auth, upload.array('images', 10), async (req, res) => {
  try {
    const updates = { ...req.body };
    // If new images were uploaded, replace the images array
    if (req.files && req.files.length) {
      updates.images = req.files.map(f => '/uploads/' + f.filename);
    }
    // Convert numeric fields
    if (updates.bedrooms) updates.bedrooms = Number(updates.bedrooms);
    if (updates.bathrooms) updates.bathrooms = Number(updates.bathrooms);
    if (updates.featured) updates.featured = updates.featured === 'true';
    // video is already a string from req.body; include it if provided
    // If video is empty string, it will overwrite previous video
    // We can explicitly set video: updates.video || ''
    // But it's already in updates from req.body

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

// ---- GET ALL PROPERTIES (for admin dashboard) ----
router.get('/properties', auth, async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
