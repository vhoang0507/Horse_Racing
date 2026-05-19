const mongoose = require('mongoose');

const raceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  raceDate: { type: Date, required: true },
  trackLength: { type: Number, required: true }, // meters
  trackType: { type: String, enum: ['dirt', 'turf', 'synthetic'], default: 'turf' },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  referee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  maxParticipants: { type: Number, default: 12 },
  participants: [
    {
      horse: { type: mongoose.Schema.Types.ObjectId, ref: 'Horse' },
      jockey: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      laneNumber: { type: Number },
    },
  ],
  prizeDistribution: {
    first: { type: Number, default: 50 },   // %
    second: { type: Number, default: 30 },
    third: { type: Number, default: 20 },
  },
  weather: { type: String, default: 'clear' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Race', raceSchema);
