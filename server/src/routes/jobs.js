const express   = require('express');
const router    = express.Router({ mergeParams: true });
const SmsJob    = require('../models/smsJob');
const { scheduleJob } = require('../services/scheduler');

// GET all campaigns for a customer
router.get('/', async (req, res) => {
  try {
    const jobs = await SmsJob
      .find({ customerId: req.params.customerId })
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error('Failed to fetch campaigns:', err);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// Create a new campaign
router.post('/', async (req, res) => {
  try {
    const { type, message, schedule, businessId } = req.body;
    const newJob = new SmsJob({
      customerId: req.params.customerId,
      businessId,
      type,
      message,
      schedule,
      status: 'active'
    });
    await newJob.save();

    // schedule it with Agenda
    await scheduleJob(newJob);

    res.status(201).json(newJob);
  } catch (err) {
    console.error('Error creating campaign:', err);
    res.status(400).json({ error: err.message });
  }
});

// Update an existing campaign
router.put('/:jobId', async (req, res) => {
  try {
    const updated = await SmsJob.findByIdAndUpdate(
      req.params.jobId,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error('Error updating campaign:', err);
    res.status(400).json({ error: err.message });
  }
});

// Delete a campaign
router.delete('/:jobId', async (req, res) => {
  try {
    await SmsJob.findByIdAndDelete(req.params.jobId);
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting campaign:', err);
    res.status(400).json({ error: err.message });
  }
});

// GET all campaigns (jobs) for a customer OR for a business
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.params.customerId)  filter.customerId  = req.params.customerId;
    if (req.params.businessId)  filter.businessId  = req.params.businessId;

    const jobs = await SmsJob
      .find(filter)
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    console.error('Failed to fetch campaigns:', err);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

module.exports = router;
