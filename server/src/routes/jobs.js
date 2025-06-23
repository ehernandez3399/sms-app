const express = require('express');
const router = express.Router();
const SmsJob = require('../models/smsJob');
const { scheduleJob } = require('../services/scheduler');

// Create new SMS job
router.post('/', async (req, res) => {
  try {
    const job = await SmsJob.create(req.body);
    await scheduleJob(job); // Schedule it right after creating
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all jobs
router.get('/', async (req, res) => {
  const { businessId } = req.query;
  const filter = businessId ? { businessId } : {};

  try {
    const jobs = await SmsJob.find(filter);
    console.log(`[→] Fetched ${jobs.length} jobs${businessId ? ` for businessId=${businessId}` : ''}`);
    res.json(jobs);
  } catch (err) {
    console.error('[✖] Failed to fetch jobs:', err.message);
    res.status(400).json({ error: err.message });
  }
});


// Get one job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await SmsJob.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Not found' });
    res.json(job);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update job
router.put('/:id', async (req, res) => {
  try {
    const updated = await SmsJob.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete job
router.delete('/:id', async (req, res) => {
  try {
    await SmsJob.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete all jobs
router.delete('/', async (req, res) => {
  try {
    await SmsJob.deleteMany({});
    res.json({ message: 'All jobs deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


module.exports = router;
