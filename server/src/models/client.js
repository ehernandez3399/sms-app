const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  apiKey:   { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }, // ✅ Add this
  plan:     { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' }
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
