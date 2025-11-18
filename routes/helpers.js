const express = require('express');
const router = express.Router();
const helperController = require('../controllers/helperController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

router.get('/me/teams', authenticateToken, requireRole('helper'), helperController.getMyTeams);
router.put('/teams/:teamId', authenticateToken, requireRole('helper'), helperController.updateTeam);

module.exports = router;

