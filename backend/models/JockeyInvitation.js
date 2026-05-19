const mongoose = require('mongoose');

const jockeyInvitationSchema = new mongoose.Schema({
  horse: { type: mongoose.Schema.Types.ObjectId, ref: 'Horse', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jockey: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'confirmed', 'declined'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('JockeyInvitation', jockeyInvitationSchema);
