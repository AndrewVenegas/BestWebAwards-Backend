const { Op } = require('sequelize');
const db = require('../models');

const getAllTeams = async (req, res) => {
  try {
    const teams = await db.Team.findAll({
      where: { participates: true },
      include: [
        {
          model: db.Student,
          as: 'students',
          attributes: ['id', 'name', 'avatarUrl']
        },
        {
          model: db.Helper,
          as: 'helper',
          attributes: ['id', 'name']
        }
      ],
      order: db.sequelize.literal('RANDOM()')
    });

    res.json(teams);
  } catch (error) {
    console.error('Error en getAllTeams:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await db.Team.findByPk(id, {
      include: [
        {
          model: db.Student,
          as: 'students',
          attributes: ['id', 'name', 'avatarUrl', 'email']
        },
        {
          model: db.Helper,
          as: 'helper',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!team) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    res.json(team);
  } catch (error) {
    console.error('Error en getTeamById:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllTeams,
  getTeamById
};

