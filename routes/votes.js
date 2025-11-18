const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

router.post('/', authenticateToken, requireRole('student'), voteController.createVote);
router.get('/visible-counts', authenticateToken, requireRole('student'), voteController.getVisibleCounts);

module.exports = router;

