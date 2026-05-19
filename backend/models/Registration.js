const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  horse: { type: mongoose.Schema.Types.ObjectId, ref: 'Horse', required: true },
  race: { type: mongoose.Schema.Types.ObjectId, ref: 'Race', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jockey: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'withdrawn'],
    default: 'pending',
  },
  registeredAt: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
});

module.exports = mongoose.model('Registration', registrationSchema);
