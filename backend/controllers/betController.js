const Bet = require('../models/Bet');

// GET /api/bets  (my bets)
exports.getMyBets = async (req, res) => {
  try {
    const bets = await Bet.find({ user: req.user._id })
      .populate('race', 'name raceDate status')
      .populate('predictedHorse', 'name');
    res.json({ success: true, data: bets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/bets
exports.createBet = async (req, res) => {
  try {
    const { race, predictedHorse, predictedPosition, amount, odds } = req.body;
    const existing = await Bet.findOne({ user: req.user._id, race });
    if (existing) return res.status(400).json({ success: false, message: 'Already bet on this race' });
    const bet = await Bet.create({ user: req.user._id, race, predictedHorse, predictedPosition, amount, odds });
    res.status(201).json({ success: true, data: bet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bets/leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { User } = require('../models/User');
    const users = await require('../models/User').find({ role: { $ne: 'admin' } })
      .select('name role points avatar')
      .sort({ points: -1 })
      .limit(20);
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
