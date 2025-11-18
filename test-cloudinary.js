// Script para probar la conexión con Cloudinary
require('dotenv').config();
const cloudinary = require('./config/cloudinary');

console.log('🔍 Probando conexión con Cloudinary...\n');

// Verificar variables de entorno
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('Variables de entorno:');
console.log('  CLOUDINARY_CLOUD_NAME:', cloudName ? '✅ Configurado' : '❌ Faltante');
console.log('  CLOUDINARY_API_KEY:', apiKey ? '✅ Configurado' : '❌ Faltante');
console.log('  CLOUDINARY_API_SECRET:', apiSecret ? '✅ Configurado' : '❌ Faltante');
console.log('');

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Error: Faltan variables de entorno de Cloudinary');
  console.error('Por favor, configura tu archivo .env con las credenciales de Cloudinary');
  process.exit(1);
}

// Probar la configuración
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

// Hacer una prueba simple de conexión
cloudinary.api.ping((error, result) => {
  if (error) {
    console.error('❌ Error al conectar con Cloudinary:');
    console.error('  Mensaje:', error.message);
    console.error('  HTTP Code:', error.http_code);
    console.error('\nPosibles causas:');
    console.error('  - Credenciales incorrectas');
    console.error('  - Problema de conexión a internet');
    console.error('  - Cloudinary no está disponible');
    process.exit(1);
  } else {
    console.log('✅ Conexión exitosa con Cloudinary!');
    console.log('  Status:', result.status);
    console.log('\n🎉 Cloudinary está configurado correctamente');
    process.exit(0);
  }
});

