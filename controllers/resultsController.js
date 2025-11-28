const db = require('../models');

const getPodium = async (req, res) => {
  try {
    // Usar consulta SQL directa para obtener equipos con conteo de votos
    const [results] = await db.sequelize.query(`
      SELECT 
        t.id as "teamId",
        t."groupName",
        t."displayName",
        t."appName",
        t."screenshotUrl",
        t."videoUrl",
        t."deployUrl",
        t."description",
        t."tipo_app",
        COUNT(v.id) as "voteCount"
      FROM teams t
      LEFT JOIN votes v ON v."teamId" = t.id
      WHERE t.participates = true
      GROUP BY t.id, t."groupName", t."displayName", t."appName", t."screenshotUrl", t."videoUrl", t."deployUrl", t."description", t."tipo_app"
      HAVING COUNT(v.id) > 0
      ORDER BY "voteCount" DESC
    `);

    // Obtener IDs de equipos para buscar estudiantes y ayudantes
    const teamIds = results.map(row => parseInt(row.teamId));

    if (teamIds.length === 0) {
      return res.json([]);
    }

    // Obtener estudiantes y ayudantes para estos equipos
    const teamsWithRelations = await db.Team.findAll({
      where: { id: teamIds },
      include: [
        {
          model: db.Student,
          as: 'students',
          attributes: ['id', 'name', 'avatarUrl']
        },
        {
          model: db.Helper,
          as: 'helper',
          attributes: ['id', 'name', 'avatarUrl']
        }
      ],
      attributes: ['id']
    });

    // Crear mapa de relaciones
    const relationsMap = new Map();
    teamsWithRelations.forEach(team => {
      relationsMap.set(team.id, {
        students: team.students.map(s => ({
          id: s.id,
          name: s.name,
          avatarUrl: s.avatarUrl
        })),
        helper: team.helper ? {
          id: team.helper.id,
          name: team.helper.name,
          avatarUrl: team.helper.avatarUrl
        } : null
      });
    });

    // Combinar datos de votos con relaciones
    const teamsArray = results.map(row => {
      const teamId = parseInt(row.teamId);
      const voteCount = parseInt(row.voteCount) || 0;
      const relations = relationsMap.get(teamId) || { students: [], helper: null };
      
      return {
        teamId: teamId,
        groupName: row.groupName,
        displayName: row.displayName,
        appName: row.appName,
        screenshotUrl: row.screenshotUrl,
        videoUrl: row.videoUrl,
        deployUrl: row.deployUrl,
        description: row.description,
        tipo_app: row.tipo_app,
        voteCount: voteCount,
        students: relations.students,
        helper: relations.helper
      };
    });

    // Asignar posiciones considerando empates
    const podium = [];
    let currentPosition = 1;
    let previousVoteCount = null;
    let teamsProcessed = 0;
    const maxTeams = 5;

    for (const team of teamsArray) {
      const voteCount = team.voteCount;
      
      // Si es un nuevo nivel de votos (no empate), actualizar la posición
      if (previousVoteCount !== null && voteCount < previousVoteCount) {
        currentPosition = teamsProcessed + 1;
      }
      
      // Solo agregar si no hemos alcanzado el límite de 5 equipos
      if (teamsProcessed < maxTeams) {
        podium.push({
          position: currentPosition,
          ...team
        });
        teamsProcessed++;
      } else {
        // Si ya tenemos 5 equipos, verificar si el siguiente tiene el mismo número de votos
        if (voteCount === previousVoteCount) {
          podium.push({
            position: currentPosition,
            ...team
          });
        } else {
          break;
        }
      }
      
      previousVoteCount = voteCount;
    }

    console.log('Podium results:', podium.length, 'teams with votes');
    res.json(podium);
  } catch (error) {
    console.error('Error en getPodium:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getPodium
};

