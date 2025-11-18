const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

router.post('/', authenticateToken, requireRole('student'), favoriteController.toggleFavorite);
router.get('/', authenticateToken, requireRole('student'), favoriteController.getMyFavorites);

module.exports = router;

