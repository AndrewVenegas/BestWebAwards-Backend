const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'bestwebawards',
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    const stream = Readable.from(buffer);
    stream.pipe(uploadStream);
  });
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    const result = await uploadToCloudinary(req.file.buffer);
    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('Error en uploadAvatar:', error);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
};

const uploadScreenshot = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    const result = await uploadToCloudinary(req.file.buffer);
    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('Error en uploadScreenshot:', error);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
};

module.exports = {
  upload,
  uploadAvatar,
  uploadScreenshot
};

