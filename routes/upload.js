const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authenticateToken } = require('../middlewares/auth');

router.post('/avatar', authenticateToken, uploadController.upload.single('image'), uploadController.uploadAvatar);
router.post('/screenshot', authenticateToken, uploadController.upload.single('image'), uploadController.uploadScreenshot);

module.exports = router;

