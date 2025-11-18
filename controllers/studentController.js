const db = require('../models');
const bcrypt = require('bcrypt');

const getMe = async (req, res) => {
  try {
    const student = await db.Student.findByPk(req.user.id, {
      include: [
        {
          model: db.Team,
          as: 'team',
          include: [
            {
              model: db.Helper,
              as: 'helper'
            }
          ]
        }
      ]
    });

    if (!student) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    res.json(student);
  } catch (error) {
    console.error('Error en getMe:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateMe = async (req, res) => {
  try {
    const { name, avatarUrl } = req.body;
    const student = await db.Student.findByPk(req.user.id);

    if (!student) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    if (name) student.name = name;
    if (avatarUrl) student.avatarUrl = avatarUrl;

    await student.save();

    res.json(student);
  } catch (error) {
    console.error('Error en updateMe:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getMyVotes = async (req, res) => {
  try {
    const votes = await db.Vote.findAll({
      where: { studentId: req.user.id },
      include: [
        {
          model: db.Team,
          as: 'team'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(votes);
  } catch (error) {
    console.error('Error en getMyVotes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const markIntroAsSeen = async (req, res) => {
  try {
    const student = await db.Student.findByPk(req.user.id);

    if (!student) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    student.hasSeenIntro = true;
    await student.save();

    res.json({ 
      message: 'Introducción marcada como vista', 
      hasSeenIntro: true,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        avatarUrl: student.avatarUrl,
        hasSeenIntro: student.hasSeenIntro
      }
    });
  } catch (error) {
    console.error('Error en markIntroAsSeen:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const verifyPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Contraseña es requerida' });
    }

    const student = await db.Student.findByPk(req.user.id);

    if (!student) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    const isValidPassword = await bcrypt.compare(password, student.passwordHash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Obtener número de votos actuales
    const voteCount = await db.Vote.count({
      where: { studentId: req.user.id }
    });

    const remainingVotes = 3 - voteCount;

    res.json({ 
      valid: true,
      remainingVotes: remainingVotes
    });
  } catch (error) {
    console.error('Error en verifyPassword:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getMe,
  updateMe,
  getMyVotes,
  markIntroAsSeen,
  verifyPassword
};

