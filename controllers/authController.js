const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar en Admin, Helper y Student
    let user = await db.Admin.findOne({ where: { email } });
    let userType = 'admin';

    if (!user) {
      user = await db.Helper.findOne({ where: { email } });
      userType = 'helper';
    }

    if (!user) {
      user = await db.Student.findOne({ 
        where: { email },
        include: [{ model: db.Team, as: 'team' }]
      });
      userType = 'student';
    }

    if (!user) {
      return res.status(401).json({ error: 'Email no registrado en el sistema.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta. Ingresa tu número de alumno.'});
    }

    const token = jwt.sign(
      { userId: user.id, type: userType },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      type: userType,
      role: userType === 'admin' ? 'admin' : userType
    };

    if (userType === 'student') {
      userData.hasSeenIntro = user.hasSeenIntro;
      userData.team = user.team;
    }

    res.json({
      token,
      user: userData
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  login
};

