const express = require('express');
const router = express.Router();
const { getMyBets, createBet } = require('../controllers/betController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getMyBets);
router.post('/', protect, authorize('spectator', 'horse_owner'), createBet);

module.exports = router;
