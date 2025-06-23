const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  businessIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true }],
  phoneNumber: { type: String },  // made optional
  email:       { type: String },  // new optional field
  firstName:   { type: String },
  lastName:    { type: String },
  tags:        { type: [String] },
  lastInteraction: { type: Date, default: null }

}, { timestamps: true });

// Optional: enforce at least phone OR email
customerSchema.pre('validate', function (next) {
  if (!this.phoneNumber && !this.email) {
    return next(new Error('Customer must have at least a phone number or email.'));
  }
  next();
});

module.exports = mongoose.model('Customer', customerSchema);
