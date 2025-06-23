const mongoose = require('mongoose');

const smsJobSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  type: {
    type: String,
    enum: [
      'one-time-event',
      'scheduled-once',
      'daily-recurring',
      'weekly-recurring',
      'biweekly-recurring',
      'monthly-recurring',
      'tag-based-broadcast',
      'date-anniversary',
      'inactivity-followup',
      'first-time-welcome'
    ],
    required: true
  },
  message: { type: String, required: true },
  schedule: { type: mongoose.Schema.Types.Mixed, required: true },
  status: { type: String, enum: ['active', 'paused', 'completed'], default: 'active' },
  nextRun: { type: Date },

  // ✅ New tracking fields:
  sendCount: { type: Number, default: 0 },
  lastSentAt: { type: Date },
  lastStatus: { type: String, enum: ['success', 'fail', 'pending'], default: 'pending' },
  errorLog: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('SmsJob', smsJobSchema);
