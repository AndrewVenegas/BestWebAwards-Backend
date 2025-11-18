const db = require('../models');
const { Op } = require('sequelize');

const createVote = async (req, res) => {
  try {
    const { teamId } = req.body;
    const studentId = req.user.id;

    // Verificar que el estudiante no haya superado los 3 votos
    const voteCount = await db.Vote.count({
      where: { studentId }
    });

    if (voteCount >= 3) {
      return res.status(400).json({ error: 'Ya has alcanzado el límite de 3 votos' });
    }

    // Verificar que no haya votado por este equipo antes
    const existingVote = await db.Vote.findOne({
      where: { studentId, teamId }
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

    // Verificar deadline de votación
    const config = await db.Config.findOne({ where: { id: 1 } });
    if (!config) {
      return res.status(500).json({ error: 'Configuración no encontrada' });
    }

    const now = new Date();
    if (now > new Date(config.votingDeadline)) {
      return res.status(400).json({ error: 'El período de votación ha cerrado' });
    }

    // Crear el voto
    const vote = await db.Vote.create({
      studentId,
      teamId
    });

    res.status(201).json(vote);
  } catch (error) {
    console.error('Error en createVote:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Ya has votado por este equipo' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getVisibleCounts = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Verificar si las votaciones están cerradas
    const config = await db.Config.findOne({ where: { id: 1 } });
    const now = new Date();
    const votingClosed = config && now > new Date(config.votingDeadline);

    // Si las votaciones están cerradas, mostrar conteos a todos
    // Si están abiertas, solo mostrar si el estudiante ha votado
    if (!votingClosed) {
      const voteCount = await db.Vote.count({
        where: { studentId }
      });

      if (voteCount === 0) {
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
    console.error('Error en getVisibleCounts:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  createVote,
  getVisibleCounts
};

