const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

router.get('/me', authenticateToken, requireRole('student'), studentController.getMe);
router.put('/me', authenticateToken, requireRole('student'), studentController.updateMe);
router.get('/me/votes', authenticateToken, requireRole('student'), studentController.getMyVotes);
router.put('/me/intro', authenticateToken, requireRole('student'), studentController.markIntroAsSeen);

module.exports = router;

