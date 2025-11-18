const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Verificar que las variables de entorno estén configuradas
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('⚠️  ADVERTENCIA: Variables de entorno de Cloudinary no configuradas');
  console.error('Necesitas configurar en .env:');
  console.error('  - CLOUDINARY_CLOUD_NAME');
  console.error('  - CLOUDINARY_API_KEY');
  console.error('  - CLOUDINARY_API_SECRET');
} else {
  console.log('✅ Cloudinary configurado correctamente');
  console.log('Cloud Name:', cloudName);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

module.exports = cloudinary;

