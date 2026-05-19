const express = require('express');
const router = express.Router();
const { getAllHorses, getHorse, createHorse, updateHorse, deleteHorse } = require('../controllers/horseController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllHorses);
router.get('/:id', getHorse);
router.post('/', protect, authorize('horse_owner', 'admin'), createHorse);
router.put('/:id', protect, authorize('horse_owner', 'admin'), updateHorse);
router.delete('/:id', protect, authorize('horse_owner', 'admin'), deleteHorse);

module.exports = router;
