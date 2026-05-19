const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createInvitation,
  getInvitations,
  respondToInvitation,
  confirmInvitation,
} = require('../controllers/invitationController');

router.get('/', protect, getInvitations);
router.post('/', protect, createInvitation);
router.put('/:id/respond', protect, respondToInvitation);
router.put('/:id/confirm', protect, confirmInvitation);

module.exports = router;
