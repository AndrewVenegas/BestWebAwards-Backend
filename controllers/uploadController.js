const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

const uploadToCloudinary = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    try {
      // Determinar el tipo de imagen basado en el mimetype
      let imageType = 'jpeg';
      if (mimetype) {
        if (mimetype.includes('png')) imageType = 'png';
        else if (mimetype.includes('gif')) imageType = 'gif';
        else if (mimetype.includes('webp')) imageType = 'webp';
      }
      
      // Convertir buffer a base64 para subir a Cloudinary
      const base64String = buffer.toString('base64');
      const dataUri = `data:image/${imageType};base64,${base64String}`;
      
      console.log('Subiendo a Cloudinary, tipo:', imageType, 'tamaño:', buffer.length, 'bytes');
      
      cloudinary.uploader.upload(
        dataUri,
        {
          folder: 'bestwebawards',
          resource_type: 'image',
          overwrite: true,
          use_filename: true,
          unique_filename: true
        },
        (error, result) => {
          if (error) {
            console.error('Error de Cloudinary:', error);
            console.error('Detalles:', {
              message: error.message,
              http_code: error.http_code,
              name: error.name
            });
            reject(error);
          } else {
            console.log('Upload exitoso, URL:', result.secure_url);
            resolve(result);
          }
        }
      );
    } catch (err) {
      console.error('Error al procesar imagen:', err);
      reject(err);
    }
  });
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    console.log('Subiendo avatar a Cloudinary...');
    console.log('Archivo recibido:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
    const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    
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
    console.log('Archivo recibido:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    
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

