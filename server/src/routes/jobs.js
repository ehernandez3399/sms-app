// server/src/routes/jobs.js
const express       = require('express');
const router        = express.Router({ mergeParams: true });
const SmsJob        = require('../models/smsJob');
const Customer      = require('../models/customer');
const Business       = require('../models/business');
const { scheduleJob } = require('../services/scheduler');
const mongoose = require('mongoose');

// GET all campaigns for this customer (but only for the logged-in client)
router.get('/', async (req, res) => {
  try {
    const filter = { clientId: req.clientId };

    if (req.params.customerId)  filter.customerId  = req.params.customerId;
    if (req.params.businessId)  filter.businessId  = req.params.businessId;

    const jobs = await SmsJob.find(filter).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error('Failed to fetch campaigns:', err);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});
// debugging post
// router.post('/', async (req, res) => {
//   try {
//     console.log('→ req.params:', req.params);

//     const customer = await Customer.findById(req.params.customerId);
//     console.log('→ loaded customer:', customer);
//     console.log('→ customer.businessId:', customer?.businessId, typeof customer?.businessId);

//     if (!customer) return res.status(404).json({ error: 'Customer not found' });

//     const business = await Business.findById(customer.businessId);
//     console.log('→ raw business (mongoose):', business && business.toObject());

//     if (!business || business.clientId.toString() !== req.clientId) {
//       return res.status(403).json({ error: 'Not authorized for this customer' });
//     }

//     // … rest of your SMS‐job creation logic …
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

//CREATE a new campaign
router.post('/', async (req, res) => {
  try {
    // 1. Load the customer
    console.log('i am trying to post job')
    const customer = await Customer.findById(req.params.customerId);
    console.log(customer)
    console.log(req.body)
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // 2. Load the business so you can verify it belongs to this client
    const business = await Business.findById(customer.businessId);
      console.log('→ raw business:', business && business.toObject());
    console.log('→ fetched business:', business);
    console.log('→ req.clientId:', req.clientId);
    console.log('→ business.clientId:', business?.clientId?.toString());
    if (
      !business ||
      business.clientId.toString() !== req.clientId
    ) {
      return res.status(403).json({ error: 'Not authorized for this customer' });
    }
    console.log('passed step 2')
    console.log('→ req.clientId:', req.clientId);
    console.log('→ business.clientId:', business.clientId.toString());  

    // 3. Create the job, stamping in the clientId
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

    // 4. Schedule it with Agenda
    await scheduleJob(newJob);

    res.status(201).json(newJob);
  } catch (err) {
    console.error('Error creating campaign:', err);
    res.status(400).json({ error: err.message });
  }
});

// UPDATE a campaign (only if it belongs to this client)
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
    console.error('Error updating campaign:', err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE a campaign (only if it belongs to this client)
router.delete('/:jobId', async (req, res) => {
  try {
    const deleted = await SmsJob.findOneAndDelete({
      _id: req.params.jobId,
      clientId: req.clientId
    });
    if (!deleted) return res.status(404).json({ error: 'Job not found' });
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting campaign:', err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
