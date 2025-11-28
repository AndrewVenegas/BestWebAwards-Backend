const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');

router.get('/', configController.getConfig);
router.post('/toggle-paused', configController.toggleVotingPaused);

module.exports = router;

