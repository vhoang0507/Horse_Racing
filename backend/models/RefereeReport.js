const mongoose = require('mongoose');

const refereeReportSchema = new mongoose.Schema({
  race: { type: mongoose.Schema.Types.ObjectId, ref: 'Race', required: true },
  referee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  violations: [
    {
      horse: { type: mongoose.Schema.Types.ObjectId, ref: 'Horse' },
      jockey: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      type: { type: String }, // e.g. 'false_start', 'obstruction'
      description: { type: String },
      penalty: { type: String },
    },
  ],
  generalNotes: { type: String, default: '' },
  raceConditions: { type: String, default: '' },
  isFinalized: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RefereeReport', refereeReportSchema);
