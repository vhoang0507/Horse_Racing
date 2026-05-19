const RaceResult = require('../models/RaceResult');
const Race = require('../models/Race');
const Horse = require('../models/Horse');
const Bet = require('../models/Bet');
const User = require('../models/User');

// GET /api/results
exports.getAllResults = async (req, res) => {
  try {
    const results = await RaceResult.find()
      .populate({ path: 'race', populate: { path: 'tournament', select: 'name' } })
      .populate('rankings.horse', 'name breed color')
      .populate('rankings.jockey', 'name')
      .populate('confirmedBy', 'name');
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/results/race/:raceId
exports.getResultByRace = async (req, res) => {
  try {
    const result = await RaceResult.findOne({ race: req.params.raceId })
      .populate('rankings.horse', 'name breed color image')
      .populate('rankings.jockey', 'name')
      .populate('confirmedBy', 'name');
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/results  — referee confirms results
exports.createResult = async (req, res) => {
  try {
    const { race, rankings } = req.body;
    const result = await RaceResult.create({ race, rankings, confirmedBy: req.user._id, confirmedAt: new Date() });

    // Update race status
    await Race.findByIdAndUpdate(race, { status: 'completed' });

    // Update horse stats
    for (const r of rankings) {
      const update = { $inc: { totalRaces: 1 } };
      if (r.position === 1) update.$inc.wins = 1;
      else update.$inc.losses = 1;
      await Horse.findByIdAndUpdate(r.horse, update);
    }

    // Settle bets
    const winner = rankings.find(r => r.position === 1);
    if (winner) {
      const bets = await Bet.find({ race, status: 'pending' });
      for (const bet of bets) {
        const isWin =
          bet.predictedHorse.toString() === winner.horse.toString() &&
          bet.predictedPosition === 1;
        bet.status = isWin ? 'won' : 'lost';
        bet.payout = isWin ? bet.amount * bet.odds : 0;
        await bet.save();
        if (isWin) await User.findByIdAndUpdate(bet.user, { $inc: { points: Math.floor(bet.payout) } });
      }
    }

    if (req.io) req.io.emit('race_result', { raceId: race, result });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
