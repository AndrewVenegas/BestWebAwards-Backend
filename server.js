require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const db = require('./models');
const { consoleDebug } = require('./utils/debug');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/helpers', require('./routes/helpers'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/votes', require('./routes/votes'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/config', require('./routes/config'));
app.use('/api/results', require('./routes/results'));
app.use('/api/upload', require('./routes/upload'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handler para multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo es demasiado grande (máximo 5MB)' });
    }
    return res.status(400).json({ error: 'Error al procesar el archivo: ' + err.message });
  }
  
  consoleDebug('Error en servidor:', err);
  consoleDebug('Stack:', err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3001;

// Iniciar servidor
db.sequelize.authenticate()
  .then(() => {
    console.log('Conexión a la base de datos establecida');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  })
  .catch((error) => {
    consoleDebug('Error al conectar con la base de datos:', error);
    process.exit(1);
  });

module.exports = app;

