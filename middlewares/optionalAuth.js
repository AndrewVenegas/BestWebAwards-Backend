const jwt = require('jsonwebtoken');
const db = require('../models');

// Middleware de autenticación opcional - no falla si no hay token
const optionalAuthenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // Si no hay token, continuar sin usuario
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Determinar el modelo según el tipo de usuario
    let user;
    if (decoded.type === 'admin') {
      user = await db.Admin.findByPk(decoded.userId);
    } else if (decoded.type === 'helper') {
      user = await db.Helper.findByPk(decoded.userId);
    } else if (decoded.type === 'student') {
      user = await db.Student.findByPk(decoded.userId);
    }

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        type: decoded.type,
        role: decoded.type === 'admin' ? 'admin' : decoded.type
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // Si hay error con el token, continuar sin usuario
    req.user = null;
    next();
  }
};

module.exports = {
  optionalAuthenticateToken
};

