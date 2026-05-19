const Tournament = require('../models/Tournament');

// GET /api/tournaments
exports.getAllTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find().populate('createdBy', 'name');
    res.json({ success: true, data: tournaments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/tournaments/:id
exports.getTournament = async (req, res) => {
  try {
    const t = await Tournament.findById(req.params.id).populate('createdBy', 'name');
    if (!t) return res.status(404).json({ success: false, message: 'Tournament not found' });
    res.json({ success: true, data: t });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/tournaments
exports.createTournament = async (req, res) => {
  try {
    const t = await Tournament.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: t });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/tournaments/:id
exports.updateTournament = async (req, res) => {
  try {
    const t = await Tournament.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!t) return res.status(404).json({ success: false, message: 'Tournament not found' });
    res.json({ success: true, data: t });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/tournaments/:id
exports.deleteTournament = async (req, res) => {
  try {
    await Tournament.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Tournament deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
