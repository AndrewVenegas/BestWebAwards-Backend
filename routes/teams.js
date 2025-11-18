const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { optionalAuthenticateToken } = require('../middlewares/optionalAuth');

router.get('/', optionalAuthenticateToken, teamController.getAllTeams);
router.get('/:id', teamController.getTeamById);

module.exports = router;

