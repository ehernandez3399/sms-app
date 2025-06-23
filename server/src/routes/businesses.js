const express = require('express');
const router = express.Router();
const Business = require('../models/business');

// Create new business
router.post('/', async (req, res) => {
  try {
    const business = await Business.create(req.body);
    res.status(201).json(business);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all businesses
router.get('/', async (req, res) => {
  const { clientId } = req.query;
  const filter = clientId ? { clientId } : {};

  try {
    const businesses = await Business.find(filter);
    res.json(businesses);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Get one business by ID
router.get('/:id', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ error: 'Not found' });
    res.json(business);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update business
router.put('/:id', async (req, res) => {
  try {
    const updated = await Business.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete business
router.delete('/:id', async (req, res) => {
  try {
    await Business.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
