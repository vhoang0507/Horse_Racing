const express = require('express');
const router = express.Router();
const { getAllUsers, getUser, updateUser, deleteUser, getJockeys, getLeaderboard, getStats } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/leaderboard', getLeaderboard);
router.get('/jockeys', protect, getJockeys);
router.get('/stats', protect, authorize('admin'), getStats);
router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/:id', protect, getUser);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
