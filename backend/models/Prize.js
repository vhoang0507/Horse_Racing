const mongoose = require('mongoose');

const prizeSchema = new mongoose.Schema({
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  race: { type: mongoose.Schema.Types.ObjectId, ref: 'Race' },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  horse: { type: mongoose.Schema.Types.ObjectId, ref: 'Horse' },
  position: { type: Number, required: true },
  amount: { type: Number, required: true },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Prize', prizeSchema);
