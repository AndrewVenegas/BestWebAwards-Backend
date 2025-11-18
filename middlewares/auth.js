const jwt = require('jsonwebtoken');
const db = require('../models');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
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

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      type: decoded.type,
      role: decoded.type === 'admin' ? 'admin' : decoded.type
    };

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!roles.includes(req.user.role) && !roles.includes(req.user.type)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole
};

