const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Property = require('../models/Property');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// ---- CREATE DEFAULT ADMIN ----
const initAdmin = async () => {
  try {
    const count = await Admin.countDocuments();
    if (count === 0) {
      const hash = await bcrypt.hash('Admin123!', 10);
      await Admin.create({ email: 'admin@ashmil.com', password: hash });
      console.log('✅ Default admin created: admin@ashmil.com / Admin123!');
    }
  } catch (err) {
    console.error('Admin init error:', err.message);
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

// ---- ADD PROPERTY (with image upload + URL images + video URL) ----
router.post('/properties', auth, upload.array('images', 10), async (req, res) => {
  try {
    const { title, description, price, location, category, bedrooms, bathrooms, area, featured, video, imageUrls } = req.body;
    
    if (!title || !description || !price || !location || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Uploaded images from file input
    const uploadedImages = req.files ? req.files.map(file => '/uploads/' + file.filename) : [];

    // URL images from textarea (sent as JSON string)
    let urlImages = [];
    if (imageUrls) {
      try {
        urlImages = JSON.parse(imageUrls);
      } catch (e) {
        urlImages = [];
      }
    }

    // Combine both
    const allImages = [...uploadedImages, ...urlImages];

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
      images: allImages,
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
router.put('/properties/:id', auth, upload.array('images', 10), async (req, res) => {
  try {
    const { title, description, price, location, category, bedrooms, bathrooms, area, featured, video, imageUrls } = req.body;
    
    // Uploaded images from file input
    const uploadedImages = req.files ? req.files.map(file => '/uploads/' + file.filename) : [];

    // URL images from textarea
    let urlImages = [];
    if (imageUrls) {
      try {
        urlImages = JSON.parse(imageUrls);
      } catch (e) {
        urlImages = [];
      }
    }

    // Combine both
    const allImages = [...uploadedImages, ...urlImages];

    const updates = {
      title,
      description,
      price,
      location,
      category,
      bedrooms: Number(bedrooms) || 0,
      bathrooms: Number(bathrooms) || 0,
      area: area || '',
      featured: featured === 'true',
      images: allImages,
      video: video || ''
    };

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
