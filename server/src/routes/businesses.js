// server/src/routes/businesses.js
const express   = require('express');
const router    = express.Router();
const Business  = require('../models/business');

// LIST all businesses for this client
// GET /businesses
router.get('/', async (req, res) => {
  try {
    const businesses = await Business.find({ clientId: req.clientId });
    res.json(businesses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a new business
// POST /businesses
router.post('/', async (req, res) => {
  try {
    const { name, timeZone, defaultFromNumber } = req.body;
    const biz = new Business({
      clientId:         req.clientId,
      name,
      timeZone,
      defaultFromNumber
    });
    await biz.save();
    res.status(201).json(biz);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ a single business (for “Edit” form)
// GET /businesses/:businessId
router.get('/:businessId', async (req, res) => {
  try {
    const biz = await Business.findOne({
      _id:      req.params.businessId,
      clientId: req.clientId
    });
    if (!biz) return res.status(404).json({ error: 'Business not found' });
    res.json(biz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE an existing business
// PUT /businesses/:businessId
router.put('/:businessId', async (req, res) => {
  try {
    const updated = await Business.findOneAndUpdate(
      { _id: req.params.businessId, clientId: req.clientId },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Business not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a business
// DELETE /businesses/:businessId
router.delete('/:businessId', async (req, res) => {
  try {
    const deleted = await Business.findOneAndDelete({
      _id:       req.params.businessId,
      clientId:  req.clientId
    });
    if (!deleted) return res.status(404).json({ error: 'Business not found' });
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
