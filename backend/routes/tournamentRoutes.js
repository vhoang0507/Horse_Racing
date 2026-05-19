const express = require('express');
const router = express.Router();
const { getAllTournaments, getTournament, createTournament, updateTournament, deleteTournament } = require('../controllers/tournamentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllTournaments);
router.get('/:id', getTournament);
router.post('/', protect, authorize('admin'), createTournament);
router.put('/:id', protect, authorize('admin'), updateTournament);
router.delete('/:id', protect, authorize('admin'), deleteTournament);

module.exports = router;
