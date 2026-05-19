const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  race: { type: mongoose.Schema.Types.ObjectId, ref: 'Race', required: true },
  predictedHorse: { type: mongoose.Schema.Types.ObjectId, ref: 'Horse', required: true },
  predictedPosition: { type: Number, required: true },
  amount: { type: Number, required: true },
  odds: { type: Number, default: 2.0 },
  status: { type: String, enum: ['pending', 'won', 'lost'], default: 'pending' },
  payout: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Bet', betSchema);
