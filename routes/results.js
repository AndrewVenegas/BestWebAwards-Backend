const express = require('express');
const router = express.Router();
const resultsController = require('../controllers/resultsController');

router.get('/podium', resultsController.getPodium);

module.exports = router;

