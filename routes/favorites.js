const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticateToken } = require('../middlewares/auth');

// Permitir que estudiantes, ayudantes y administradores puedan usar favoritos
router.post('/', authenticateToken, favoriteController.toggleFavorite);
router.get('/', authenticateToken, favoriteController.getMyFavorites);

module.exports = router;

