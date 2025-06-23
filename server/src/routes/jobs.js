const express = require('express');
// ⬇️ mergeParams:true so req.params.customerId is available
const router = express.Router({ mergeParams: true });

const SmsJob = require('../models/smsJob');
const { scheduleJob } = require('../services/scheduler');
const SmsJob = require('../models/smsJob');

// POST /customers/:customerId/jobs
router.post('/', async (req, res) => {
  const { customerId } = req.params;
  const { businessId, type, message, schedule } = req.body;

  try {
    // explicitly include customerId from URL
    const job = await SmsJob.create({
      customerId,
      businessId,
      type,
      message,
      schedule
    });
    await scheduleJob(job); // Schedule it right after creating
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /customers/:customerId/jobs or GET /jobs?businessId=...
router.get('/', async (req, res) => {
  // if you still want to support filtering by businessId via query
  const { businessId } = req.query;
  const filter = businessId ? { businessId } : {};

  try {
    const jobs = await SmsJob.find(filter);
    console.log(
      `[→] Fetched ${jobs.length} jobs${businessId ? ` for businessId=${businessId}` : ''}`
    );
    res.json(jobs);
  } catch (err) {
    console.error('[✖] Failed to fetch jobs:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// GET /customers/:customerId/jobs/:id
router.get('/:id', async (req, res) => {
  try {
    const job = await SmsJob.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Not found' });
    res.json(job);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /customers/:customerId/jobs/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await SmsJob.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /customers/:customerId/jobs/:id
router.delete('/:id', async (req, res) => {
  try {
    await SmsJob.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE all (rarely used)
router.delete('/', async (req, res) => {
  try {
    await SmsJob.deleteMany({});
    res.json({ message: 'All jobs deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /businesses/:businessId/jobs
router.get('/:businessId/jobs', async (req, res) => {
  try {
    const jobs = await SmsJob.find({ businessId: req.params.businessId });
    return res.json(jobs);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;
