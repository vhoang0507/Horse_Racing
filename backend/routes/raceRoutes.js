const express = require('express');
const router = express.Router();
const { getAllRaces, getRace, createRace, updateRace, deleteRace, startRace } = require('../controllers/raceController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllRaces);
router.get('/:id', getRace);
router.post('/', protect, authorize('admin'), createRace);
router.put('/:id', protect, authorize('admin', 'referee'), updateRace);
router.delete('/:id', protect, authorize('admin'), deleteRace);
router.post('/:id/start', protect, authorize('admin'), startRace);

module.exports = router;
