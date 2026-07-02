const express = require('express');
const supabase = require('../config/supabase');
const router = express.Router();

// GET all properties
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Log to see what's being returned
    console.log('Properties API called, count:', data?.length);
    if (data && data.length > 0) {
      console.log('Sample property:', data[0]);
      console.log('ID field:', Object.keys(data[0]));
    }
    
    res.json(data);
  } catch (err) {
    console.error('Error fetching properties:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET single property by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching property with ID:', id);
    
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching property:', error);
      return res.status(404).json({ error: 'Property not found' });
    }
    
    console.log('Found property:', data);
    res.json(data);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
