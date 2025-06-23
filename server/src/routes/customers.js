const express = require('express');
const router = express.Router();
const Customer = require('../models/customer');
const SmsJob = require('../models/smsJob');
const { sendSms } = require('../services/smsService');

// Create new customer
router.post('/', async (req, res) => {
  try {
    const customer = await Customer.create(req.body);

    const welcomeJob = await SmsJob.findOne({
      businessId: customer.businessId,
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

// GET /businesses/:businessId/customers
router.get('/', async (req, res) => {
  const { businessId } = req.params;
  try {
    const customers = await Customer.find({ businessIds: businessId });
    res.json(customers);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /businesses/:businessId/customers/:id
router.get('/:id', async (req, res) => {
  const { businessId, id } = req.params;
  try {
    const customer = await Customer.findOne({
      _id: id,
      businessIds: businessId
    });
    if (!customer) return res.status(404).json({ error: 'Not found' });
    res.json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
