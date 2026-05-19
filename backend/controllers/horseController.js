const Horse = require('../models/Horse');

// GET /api/horses
exports.getAllHorses = async (req, res) => {
  try {
    const filter = {};
    if (req.query.owner) filter.owner = req.query.owner;
    if (req.query.status) filter.status = req.query.status;
    const horses = await Horse.find(filter).populate('owner', 'name email').populate('jockey', 'name email');
    res.json({ success: true, data: horses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/horses/:id
exports.getHorse = async (req, res) => {
  try {
    const horse = await Horse.findById(req.params.id).populate('owner', 'name email').populate('jockey', 'name email');
    if (!horse) return res.status(404).json({ success: false, message: 'Horse not found' });
    res.json({ success: true, data: horse });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/horses
exports.createHorse = async (req, res) => {
  try {
    const horse = await Horse.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ success: true, data: horse });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/horses/:id
exports.updateHorse = async (req, res) => {
  try {
    const horse = await Horse.findById(req.params.id);
    if (!horse) return res.status(404).json({ success: false, message: 'Horse not found' });
    if (horse.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const updated = await Horse.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/horses/:id
exports.deleteHorse = async (req, res) => {
  try {
    const horse = await Horse.findById(req.params.id);
    if (!horse) return res.status(404).json({ success: false, message: 'Horse not found' });
    if (horse.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await horse.deleteOne();
    res.json({ success: true, message: 'Horse deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
