const db = require('../models');

const toggleFavorite = async (req, res) => {
  try {
    const { teamId } = req.body;
    const userId = req.user.id;
    const userType = req.user.type || req.user.role;

    if (!teamId) {
      return res.status(400).json({ error: 'teamId es requerido' });
    }

    // Verificar que el equipo existe
    const team = await db.Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    // Para estudiantes, helpers y admins, usar el mismo modelo Favorite
    // Nota: El modelo usa studentId, pero podemos usar el userId de cualquier tipo de usuario
    // ya que los IDs no se solapan entre las tablas
    const studentId = userId;

    // Buscar si ya existe el favorito
    const existingFavorite = await db.Favorite.findOne({
      where: { studentId, teamId }
    });

    if (existingFavorite) {
      // Si existe, eliminarlo
      await existingFavorite.destroy();
      res.json({ 
        message: 'Favorito eliminado',
        isFavorite: false 
      });
    } else {
      // Si no existe, crearlo
      await db.Favorite.create({ studentId, teamId });
      res.json({ 
        message: 'Favorito agregado',
        isFavorite: true 
      });
    }
  } catch (error) {
    console.error('Error en toggleFavorite:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Este favorito ya existe' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getMyFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    // Usar userId como studentId (los IDs no se solapan entre estudiantes, helpers y admins)
    const studentId = userId;

    const favorites = await db.Favorite.findAll({
      where: { studentId },
      include: [
        {
          model: db.Team,
          as: 'team',
          include: [
            {
              model: db.Student,
              as: 'students'
            },
            {
              model: db.Helper,
              as: 'helper'
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Retornar solo los IDs de los equipos favoritos
    const favoriteTeamIds = favorites.map(fav => fav.teamId);

    res.json({ 
      favorites: favoriteTeamIds,
      teams: favorites.map(fav => fav.team)
    });
  } catch (error) {
    console.error('Error en getMyFavorites:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  toggleFavorite,
  getMyFavorites
};

