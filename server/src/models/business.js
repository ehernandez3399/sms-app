const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  clientId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  name:              { type: String, required: true },
  timeZone:          { type: String, default: 'UTC' },
  defaultFromNumber: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Business', businessSchema);
