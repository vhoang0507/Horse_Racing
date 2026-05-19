const express = require('express');
const router = express.Router();
const { getAllResults, getResultByRace, createResult } = require('../controllers/resultController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllResults);
router.get('/race/:raceId', getResultByRace);
router.post('/', protect, authorize('referee', 'admin'), createResult);

module.exports = router;
