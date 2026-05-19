const mongoose = require('mongoose');

const horseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  breed: { type: String, required: true },
  age: { type: Number, required: true },
  color: { type: String, required: true },
  weight: { type: Number, required: true }, // kg
  height: { type: Number, required: true }, // cm
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jockey: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  image: { type: String, default: '' },
  status: {
    type: String,
    enum: ['available', 'racing', 'injured', 'retired'],
    default: 'available',
  },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  totalRaces: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Horse', horseSchema);
