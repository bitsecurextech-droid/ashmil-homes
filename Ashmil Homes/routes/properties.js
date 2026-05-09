const express = require('express');
const Property = require('../models/Property');
const router = express.Router();

// GET all properties with filters (category, location, search)
router.get('/', async (req, res) => {
  try {
    let filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.location) filter.location = { $regex: new RegExp(req.query.location, 'i') };
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: new RegExp(req.query.search, 'i') } },
        { description: { $regex: new RegExp(req.query.search, 'i') } },
        { location: { $regex: new RegExp(req.query.search, 'i') } }
      ];
    }
    const properties = await Property.find(filter).sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single property by ID
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: 'Property not found' });
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;