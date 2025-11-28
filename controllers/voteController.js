const db = require('../models');
const { Op } = require('sequelize');
const { consoleDebug } = require('../utils/debug');

const createVote = async (req, res) => {
  try {
    const { teamId } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Determinar qué campo usar según el rol del usuario
    let voteWhere = {};
    let voteData = { teamId };

    // Usar req.user.type como fuente principal ya que es más confiable
    const userType = req.user.type || userRole;

    if (userType === 'student') {
      voteWhere = { studentId: userId };
      voteData.studentId = userId;
      // No establecer helperId ni adminId (quedarán como NULL)
    } else if (userType === 'helper') {
      voteWhere = { helperId: userId };
      voteData.helperId = userId;
      // No establecer studentId ni adminId (quedarán como NULL)
    } else if (userType === 'admin') {
      voteWhere = { adminId: userId };
      voteData.adminId = userId;
      // No establecer studentId ni helperId (quedarán como NULL)
    } else {
      return res.status(403).json({ error: 'Rol no permitido para votar. Tipo de usuario: ' + userType });
    }

    // Verificar que el usuario no haya superado los 3 votos
    const voteCount = await db.Vote.count({
      where: voteWhere
    });

    if (voteCount >= 3) {
      return res.status(400).json({ error: 'Ya has alcanzado el límite de 3 votos' });
    }

    // Verificar que no haya votado por este equipo antes
    const existingVote = await db.Vote.findOne({
      where: { ...voteWhere, teamId }
    });

    if (existingVote) {
      return res.status(400).json({ error: 'Ya has votado por este equipo' });
    }

    // Verificar que el equipo participe
    const team = await db.Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    if (!team.participates) {
      return res.status(400).json({ error: 'Este equipo no está participando' });
    }

    // Verificar deadline de votación y periodo de carga de datos
    const config = await db.Config.findOne({ where: { id: 1 } });
    if (!config) {
      return res.status(500).json({ error: 'Configuración no encontrada' });
    }

    const now = new Date();
    
    // Si está en periodo de carga de datos, no permitir votos
    if (config.dataLoadingPeriod) {
      return res.status(400).json({ error: 'Las votaciones están deshabilitadas durante el periodo de carga de datos' });
    }
    
    // Verificar si las votaciones han comenzado
    if (config.votingStartDate) {
      const startDate = new Date(config.votingStartDate);
      if (now < startDate) {
        return res.status(400).json({ error: 'Las votaciones aún no han comenzado' });
      }
    }
    
    // Verificar si las votaciones han cerrado
    if (now > new Date(config.votingDeadline)) {
      return res.status(400).json({ error: 'El período de votación ha cerrado' });
    }

    // Crear el voto
    const vote = await db.Vote.create(voteData);

    res.status(201).json(vote);
  } catch (error) {
    consoleDebug('Error en createVote:', error);
    consoleDebug('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      userId: req.user?.id,
      userRole: req.user?.role,
      userType: req.user?.type
    });
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Ya has votado por este equipo' });
    }
    if (error.name === 'SequelizeDatabaseError' || error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.message || 'Error de validación en la base de datos' });
    }
    res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
  }
};

const getVisibleCounts = async (req, res) => {
  try {
    // Verificar si las votaciones están cerradas o en periodo de carga de datos
    const config = await db.Config.findOne({ where: { id: 1 } });
    const now = new Date();
    
    // Si está en periodo de carga de datos, no mostrar conteos
    if (config && config.dataLoadingPeriod) {
      return res.json({ showCounts: false, counts: [] });
    }
    
    const votingClosed = config && now > new Date(config.votingDeadline);

    // Si las votaciones están cerradas, mostrar conteos a todos
    // Si están abiertas, solo mostrar si el usuario ha votado
    if (!votingClosed) {
      const userId = req.user.id;
      const userRole = req.user.role;

      let voteWhere = {};
      if (userRole === 'student') {
        voteWhere = { studentId: userId };
      } else if (userRole === 'helper') {
        voteWhere = { helperId: userId };
      } else if (userRole === 'admin') {
        voteWhere = { adminId: userId };
      }

      if (Object.keys(voteWhere).length > 0) {
        const voteCount = await db.Vote.count({
          where: voteWhere
        });

        if (voteCount === 0) {
          return res.json({ showCounts: false, counts: [] });
        }
      } else {
        // Si no es un rol válido y las votaciones están abiertas, no mostrar conteos
        return res.json({ showCounts: false, counts: [] });
      }
    }

    // Obtener conteos de votos por equipo usando consulta SQL directa
    const [results] = await db.sequelize.query(`
      SELECT 
        t.id as "teamId",
        t."groupName",
        t."displayName",
        t."appName",
        t."screenshotUrl",
        COUNT(v.id) as "voteCount"
      FROM teams t
      LEFT JOIN votes v ON v."teamId" = t.id
      WHERE t.participates = true
      GROUP BY t.id, t."groupName", t."displayName", t."appName", t."screenshotUrl"
      ORDER BY "voteCount" DESC
    `);

    const counts = results.map(row => ({
      teamId: parseInt(row.teamId),
      groupName: row.groupName,
      displayName: row.displayName,
      appName: row.appName,
      screenshotUrl: row.screenshotUrl,
      voteCount: parseInt(row.voteCount) || 0
    }));

    res.json({ showCounts: true, counts });
  } catch (error) {
    consoleDebug('Error en getVisibleCounts:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getMyVotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let voteWhere = {};
    if (userRole === 'student') {
      voteWhere = { studentId: userId };
    } else if (userRole === 'helper') {
      voteWhere = { helperId: userId };
    } else if (userRole === 'admin') {
      voteWhere = { adminId: userId };
    } else {
      return res.status(403).json({ error: 'Rol no permitido' });
    }

    const votes = await db.Vote.findAll({
      where: voteWhere,
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
    consoleDebug('Error en getMyVotes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  createVote,
  getVisibleCounts,
  getMyVotes
};

