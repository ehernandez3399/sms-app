const agenda = require('../config/agenda');
const SmsJob = require('../models/smsJob');
const Customer = require('../models/customer');
const { sendSms } = require('./smsService');

// -----------------------------
// Define Scheduled Jobs
// -----------------------------

// ✅ 1. Recurring sweep for due one-time jobs
agenda.define('process one-time jobs', async () => {
  const now = new Date();

  // ✅ Find all active jobs that are due now or earlier
  const dueJobs = await SmsJob.find({
    type: { $in: ['one-time-event', 'scheduled-once'] },
    status: 'active',
    'schedule.sendAt': { $lte: now }
  }).populate('customerId');

  console.log(`📤 [${now.toISOString()}] Found ${dueJobs.length} due job(s) to send:`);

  for (const job of dueJobs) {
    console.log(`  • ${job._id} | ${job.schedule.sendAt} | "${job.message}"`);
  }

  // ✅ Send messages and mark as completed after success
  for (const smsJob of dueJobs) {
    const to = smsJob.customerId?.phoneNumber;

    if (!to) {
      console.warn(`[⚠] Skipping job ${smsJob._id} — missing customer phone number`);
      continue;
    }

    try {
      await sendSms(to, smsJob.message);

      smsJob.sendCount = (smsJob.sendCount || 0) + 1;
      smsJob.lastSentAt = new Date();
      smsJob.lastStatus = 'success';
      smsJob.status = 'completed'; // ✅ Mark as inactive
      await smsJob.save();

      console.log(`[✔] Sent to ${to} | jobId=${smsJob._id} | message="${smsJob.message}"`);

    } catch (err) {
      smsJob.lastStatus = 'fail';
      smsJob.errorLog = smsJob.errorLog || [];
      smsJob.errorLog.push(`[${new Date().toISOString()}] ${err.message}`);
      await smsJob.save();

      console.error(`[✖] FAILED to send to ${to} | jobId=${smsJob._id} | error=${err.message}`);
    }
  }
});


// ✅ 2. Date-based anniversary
agenda.define('run anniversary broadcast', async job => {
  const { jobId } = job.attrs.data;
  const smsJob = await SmsJob.findById(jobId);
  if (!smsJob || smsJob.status !== 'active') return;

  const today = new Date();
  const mmdd = `${today.getMonth() + 1}-${today.getDate()}`;

  const customers = await Customer.find({ businessIds: smsJob.businessId });

  for (const customer of customers) {
    const created = new Date(customer.createdAt);
    const createdMmdd = `${created.getMonth() + 1}-${created.getDate()}`;
    if (createdMmdd === mmdd) {
      await sendSms(customer.phoneNumber, smsJob.message);
    }
  }
});

// ✅ 3. Inactivity follow-up
agenda.define('run inactivity followup', async job => {
  const { jobId } = job.attrs.data;
  const smsJob = await SmsJob.findById(jobId);
  if (!smsJob || smsJob.status !== 'active') return;

  const days = smsJob.schedule.inactiveForDays || 30;
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const customers = await Customer.find({
    businessIds: smsJob.businessId,
    $or: [
      { lastInteraction: { $lt: cutoff } },
      { lastInteraction: null }
    ]
  });

  for (const customer of customers) {
    await sendSms(customer.phoneNumber, smsJob.message);
    // Optionally update customer.lastInteraction = new Date();
  }
});

// -----------------------------
// scheduleJob Dispatcher
// -----------------------------
async function scheduleJob(smsJob) {
  const jobId = smsJob._id.toString();

  if (smsJob.status !== 'active') {
    console.log(`Skipping scheduling for job ${smsJob._id} — status: ${smsJob.status}`);
    return;
  }

  switch (smsJob.type) {
    case 'daily-recurring':
    case 'weekly-recurring':
    case 'biweekly-recurring':
    case 'monthly-recurring':
      await agenda.every(smsJob.schedule.repeatEvery || '1 day', 'send sms', { jobId });
      break;

    case 'tag-based-broadcast':
      const tag = smsJob.schedule.tag;
      if (!tag) {
        console.warn(`[tag-based-broadcast] Missing tag in schedule for job ${jobId}`);
        return;
      }

      const customers = await Customer.find({
        businessIds: smsJob.businessId,
        tags: tag
      });

      if (!customers.length) {
        console.log(`[tag-based-broadcast] No customers found for tag '${tag}'`);
        return;
      }

      for (const customer of customers) {
        const job = await SmsJob.create({
          customerId: customer._id,
          businessId: smsJob.businessId,
          type: 'one-time-event',
          message: smsJob.message,
          schedule: { sendAt: smsJob.schedule.sendAt },
          status: 'active'
        });

        await agenda.schedule(smsJob.schedule.sendAt, 'send sms', { jobId: job._id.toString() });
      }
      break;

    case 'date-anniversary':
      await agenda.every('0 8 * * *', 'run anniversary broadcast', { jobId });
      break;

    case 'inactivity-followup':
      await agenda.every('0 10 * * *', 'run inactivity followup', { jobId });
      break;

    case 'first-time-welcome':
      console.log(`[first-time-welcome] Not triggered here — handled on customer creation`);
      break;

    default:
      console.log(`Skipping agenda.schedule for job type '${smsJob.type}'`);
      break;
  }
}

module.exports = { agenda, scheduleJob };
