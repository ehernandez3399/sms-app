// server/src/routes/customers.js
const express   = require('express');
const router    = express.Router({ mergeParams: true });
const Customer  = require('../models/customer');
const Business  = require('../models/business');
const SmsJob    = require('../models/smsJob');
const { sendSms } = require('../services/smsService');

// POST   /businesses/:businessId/customers
// Create a new customer under a given business
router.post('/', async (req, res) => {
  const { businessId } = req.params;
  try {
    // 1) Verify business belongs to this client
    const biz = await Business.findOne({ _id: businessId, clientId: req.clientId });
    if (!biz) return res.status(403).json({ error: 'Not authorized for this business' });

    // 2) Create the customer
    const customer = new Customer({ ...req.body, businessId });
    await customer.save();

    // 3) If there’s a first-time welcome job, send it immediately
    const welcomeJob = await SmsJob.findOne({
      businessId,
      type: 'first-time-welcome',
      status: 'active'
    });
    if (welcomeJob) {
      await sendSms(customer.phoneNumber, welcomeJob.message);
      customer.lastInteraction = new Date();
      await customer.save();
    }

    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET    /businesses/:businessId/customers
// GET    /customers
// List customers either for one business or all
router.get('/', async (req, res) => {
  try {
    let filter;
    if (req.params.businessId) {
      // business‐scoped
      const biz = await Business.findOne({ 
        _id: req.params.businessId, 
        clientId: req.clientId 
      });
      if (!biz) return res.status(403).json({ error: 'Not authorized for this business' });
      filter = { businessId: req.params.businessId };
    } else {
      // global: all businesses for this client
      const bizs = await Business.find({ clientId: req.clientId }, '_id');
      filter = { businessId: { $in: bizs.map(b => b._id) } };
    }
    const customers = await Customer.find(filter);
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET    /businesses/:businessId/customers/:id
// GET    /customers/:id
// Read one customer (scoped to business or global)
router.get('/:id', async (req, res) => {
  const { id, businessId } = req.params;
  try {
    let filter = { _id: id };
    if (businessId) {
      // ensure this business belongs to client
      const biz = await Business.findOne({ 
        _id: businessId, 
        clientId: req.clientId 
      });
      if (!biz) return res.status(403).json({ error: 'Not authorized for this business' });
      filter.businessId = businessId;
    } else {
      // global: ensure it’s under one of this client’s businesses
      const bizs = await Business.find({ clientId: req.clientId }, '_id');
      filter.businessId = { $in: bizs.map(b => b._id) };
    }
    const customer = await Customer.findOne(filter);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT    /customers/:id
// Update a customer (only if under this client’s businesses)
router.put('/:id', async (req, res) => {
  try {
    // find all business IDs for this client
    const bizs = await Business.find({ clientId: req.clientId }, '_id');
    const updated = await Customer.findOneAndUpdate(
      { 
        _id: req.params.id,
        businessId: { $in: bizs.map(b => b._id) } 
      },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Customer not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /customers/:id
// Delete a customer (only if under this client’s businesses)
router.delete('/:id', async (req, res) => {
  try {
    const bizs = await Business.find({ clientId: req.clientId }, '_id');
    const deleted = await Customer.findOneAndDelete({
      _id: req.params.id,
      businessId: { $in: bizs.map(b => b._id) }
    });
    if (!deleted) return res.status(404).json({ error: 'Customer not found' });
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
