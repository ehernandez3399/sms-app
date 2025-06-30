// server/src/routes/jobs.js
const express       = require('express');
const router        = express.Router({ mergeParams: true });
const SmsJob        = require('../models/smsJob');
const Customer      = require('../models/customer');
const Business      = require('../models/business');
const { scheduleJob } = require('../services/scheduler');

// GET /businesses/:businessId/jobs
// GET /customers/:customerId/jobs
router.get('/', async (req, res) => {
  try {
    const filter = { clientId: req.clientId };

    if (req.params.customerId) filter.customerId = req.params.customerId;
    if (req.params.businessId) filter.businessId = req.params.businessId;

    const jobs = await SmsJob.find(filter).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error('Failed to fetch jobs:', err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// POST /businesses/:businessId/jobs
// POST /customers/:customerId/jobs
router.post('/', async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const businessId = req.params.businessId || req.body.businessId;

    if (!customerId || !businessId) {
      return res.status(400).json({ error: 'Missing customerId or businessId' });
    }

    // 1) Load and verify the Customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    if (customer.businessId.toString() !== businessId) {
      return res
        .status(400)
        .json({ error: 'Customer is not associated with that business' });
    }

    // 2) Load and authorize the Business
    const business = await Business.findOne({
      _id: businessId,
      clientId: req.clientId
    });
    if (!business) {
      return res.status(403).json({ error: 'Not authorized for this business' });
    }

    // 3) Create the job
    const { type, message, schedule } = req.body;
    const newJob = new SmsJob({
      clientId:   req.clientId,
      businessId: business._id,
      customerId: customer._id,
      type,
      message,
      schedule,
      status: 'active'
    });
    await newJob.save();

    // 4) Schedule it with Agenda
    await scheduleJob(newJob);

    res.status(201).json(newJob);
  } catch (err) {
    console.error('Error creating job:', err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /businesses/:businessId/jobs/:jobId
// PUT /customers/:customerId/jobs/:jobId
router.put('/:jobId', async (req, res) => {
  try {
    const updated = await SmsJob.findOneAndUpdate(
      { _id: req.params.jobId, clientId: req.clientId },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Job not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating job:', err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /businesses/:businessId/jobs/:jobId
// DELETE /customers/:customerId/jobs/:jobId
router.delete('/:jobId', async (req, res) => {
  try {
    const deleted = await SmsJob.findOneAndDelete({
      _id: req.params.jobId,
      clientId: req.clientId
    });
    if (!deleted) return res.status(404).json({ error: 'Job not found' });
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting job:', err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
