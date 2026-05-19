const Race = require('../models/Race');

// GET /api/races
exports.getAllRaces = async (req, res) => {
  try {
    const filter = {};
    if (req.query.tournament) filter.tournament = req.query.tournament;
    if (req.query.status) filter.status = req.query.status;
    const races = await Race.find(filter)
      .populate('tournament', 'name')
      .populate('referee', 'name')
      .populate('participants.horse', 'name breed color')
      .populate('participants.jockey', 'name');
    res.json({ success: true, data: races });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/races/:id
exports.getRace = async (req, res) => {
  try {
    const race = await Race.findById(req.params.id)
      .populate('tournament', 'name location')
      .populate('referee', 'name email')
      .populate('participants.horse', 'name breed color image wins losses')
      .populate('participants.jockey', 'name email');
    if (!race) return res.status(404).json({ success: false, message: 'Race not found' });
    res.json({ success: true, data: race });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/races
exports.createRace = async (req, res) => {
  try {
    const race = await Race.create(req.body);
    res.status(201).json({ success: true, data: race });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/races/:id
exports.updateRace = async (req, res) => {
  try {
    const race = await Race.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!race) return res.status(404).json({ success: false, message: 'Race not found' });
    res.json({ success: true, data: race });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/races/:id
exports.deleteRace = async (req, res) => {
  try {
    await Race.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Race deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/races/:id/start  — admin triggers via socket
exports.startRace = async (req, res) => {
  try {
    const race = await Race.findByIdAndUpdate(req.params.id, { status: 'in_progress' }, { new: true });
    if (req.io) req.io.emit('race_started', { raceId: race._id, raceName: race.name });
    res.json({ success: true, data: race });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
