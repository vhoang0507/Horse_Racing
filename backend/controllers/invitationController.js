const JockeyInvitation = require('../models/JockeyInvitation');
const Horse = require('../models/Horse');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @route POST /api/invitations
// @desc Create invitation (Horse Owner invites Jockey)
exports.createInvitation = async (req, res) => {
  try {
    const { horseId, jockeyId } = req.body;

    // Check horse ownership
    const horse = await Horse.findById(horseId);
    if (!horse) return res.status(404).json({ success: false, message: 'Horse not found' });
    if (horse.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this horse' });
    }

    // Check jockey
    const jockey = await User.findById(jockeyId);
    if (!jockey || jockey.role !== 'jockey') {
      return res.status(400).json({ success: false, message: 'Selected user is not a Jockey' });
    }

    // Check existing active invitation
    const existing = await JockeyInvitation.findOne({
      horse: horseId,
      jockey: jockeyId,
      status: { $in: ['pending', 'accepted'] },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An active invitation already exists for this jockey and horse' });
    }

    const invitation = await JockeyInvitation.create({
      horse: horseId,
      owner: req.user._id,
      jockey: jockeyId,
    });

    // Create Notification for the Jockey
    await Notification.create({
      recipient: jockeyId,
      title: 'New Jockey Invitation 🏇',
      message: `Horse Owner "${req.user.name}" has invited you to ride horse "${horse.name}".`,
      type: 'invitation',
      relatedId: invitation._id,
    });

    res.status(201).json({ success: true, data: invitation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/invitations
// @desc Get invitations for currently logged in Jockey or Horse Owner
exports.getInvitations = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'jockey') {
      filter.jockey = req.user._id;
    } else if (req.user.role === 'horse_owner') {
      filter.owner = req.user._id;
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view invitations' });
    }

    const invitations = await JockeyInvitation.find(filter)
      .populate('horse', 'name breed color wins losses totalRaces status')
      .populate('owner', 'name email phone')
      .populate('jockey', 'name email bio')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: invitations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/invitations/:id/respond
// @desc Respond to invitation (Jockey accepts or rejects)
exports.respondToInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body; // 'accepted' or 'rejected'

    if (!['accepted', 'rejected'].includes(response)) {
      return res.status(400).json({ success: false, message: 'Invalid response. Must be accepted or rejected.' });
    }

    const invitation = await JockeyInvitation.findById(id).populate('horse', 'name');
    if (!invitation) return res.status(404).json({ success: false, message: 'Invitation not found' });

    if (invitation.jockey.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to respond to this invitation' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Invitation has already been handled' });
    }

    invitation.status = response;
    await invitation.save();

    // Create Notification for the Horse Owner
    await Notification.create({
      recipient: invitation.owner,
      title: response === 'accepted' ? 'Invitation Accepted ✅' : 'Invitation Declined ❌',
      message: `Jockey "${req.user.name}" has ${response === 'accepted' ? 'accepted' : 'declined'} your invitation to ride "${invitation.horse.name}".`,
      type: 'invitation',
      relatedId: invitation._id,
    });

    res.json({ success: true, data: invitation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/invitations/:id/confirm
// @desc Confirm Jockey (Horse Owner finalizes and chooses this Jockey)
exports.confirmInvitation = async (req, res) => {
  try {
    const { id } = req.params;

    const invitation = await JockeyInvitation.findById(id).populate('horse', 'name').populate('jockey', 'name');
    if (!invitation) return res.status(404).json({ success: false, message: 'Invitation not found' });

    if (invitation.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to confirm this invitation' });
    }

    if (invitation.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Only accepted invitations can be finalized' });
    }

    // Assign the jockey to the horse
    const horse = await Horse.findById(invitation.horse._id);
    if (!horse) return res.status(404).json({ success: false, message: 'Horse not found' });

    horse.jockey = invitation.jockey._id;
    await horse.save();

    // Update this invitation to confirmed
    invitation.status = 'confirmed';
    await invitation.save();

    // Decline all other pending or accepted invitations for this horse
    await JockeyInvitation.updateMany(
      { horse: invitation.horse._id, _id: { $ne: invitation._id }, status: { $in: ['pending', 'accepted'] } },
      { status: 'declined' }
    );

    // Create Notification for the Confirmed Jockey
    await Notification.create({
      recipient: invitation.jockey._id,
      title: 'Invitation Confirmed! 🏆',
      message: `Horse Owner "${req.user.name}" has confirmed you to ride horse "${invitation.horse.name}".`,
      type: 'invitation',
      relatedId: invitation._id,
    });

    res.json({ success: true, message: 'Jockey confirmed successfully!', data: invitation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
