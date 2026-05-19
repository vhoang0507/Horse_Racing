const mongoose = require('mongoose');

const raceResultSchema = new mongoose.Schema({
  race: { type: mongoose.Schema.Types.ObjectId, ref: 'Race', required: true },
  rankings: [
    {
      position: { type: Number },
      horse: { type: mongoose.Schema.Types.ObjectId, ref: 'Horse' },
      jockey: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      finishTime: { type: Number }, // seconds
      prize: { type: Number, default: 0 },
    },
  ],
  confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  confirmedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RaceResult', raceResultSchema);
