const { Op } = require('sequelize');
const db = require('../models');
const { consoleDebug } = require('../utils/debug');

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

    // Si hay un usuario autenticado y es estudiante, incluir información de favoritos
    if (req.user && req.user.role === 'student') {
      const studentId = req.user.id;
      const favorites = await db.Favorite.findAll({
        where: { studentId },
        attributes: ['teamId']
      });
      const favoriteTeamIds = favorites.map(fav => fav.teamId);

      // Agregar isFavorite a cada equipo
      const teamsWithFavorites = teams.map(team => {
        const teamData = team.toJSON();
        teamData.isFavorite = favoriteTeamIds.includes(team.id);
        return teamData;
      });

      return res.json(teamsWithFavorites);
    }

    res.json(teams);
  } catch (error) {
    consoleDebug('Error en getAllTeams:', error);
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
    consoleDebug('Error en getTeamById:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllTeams,
  getTeamById
};

