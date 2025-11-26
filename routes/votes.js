const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const { authenticateToken } = require('../middlewares/auth');

// Permitir que estudiantes, helpers y admins voten
router.post('/', authenticateToken, voteController.createVote);
router.get('/visible-counts', authenticateToken, voteController.getVisibleCounts);
router.get('/me', authenticateToken, voteController.getMyVotes);

module.exports = router;

