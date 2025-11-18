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

    console.log('Subiendo avatar a Cloudinary...');
    const result = await uploadToCloudinary(req.file.buffer);
    
    console.log('Avatar subido exitosamente:', result.secure_url);
    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('Error en uploadAvatar:', error);
    console.error('Detalles del error:', {
      message: error.message,
      http_code: error.http_code,
      name: error.name
    });
    res.status(500).json({ 
      error: 'Error al subir la imagen',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const uploadScreenshot = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    console.log('Subiendo screenshot a Cloudinary...');
    console.log('Tamaño del archivo:', req.file.size, 'bytes');
    console.log('Tipo MIME:', req.file.mimetype);

    const result = await uploadToCloudinary(req.file.buffer);
    
    console.log('Screenshot subido exitosamente:', result.secure_url);
    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('Error en uploadScreenshot:', error);
    console.error('Detalles del error:', {
      message: error.message,
      http_code: error.http_code,
      name: error.name
    });
    res.status(500).json({ 
      error: 'Error al subir la imagen',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  upload,
  uploadAvatar,
  uploadScreenshot
};

