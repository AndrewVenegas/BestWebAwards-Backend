const db = require('../models');

const getPodium = async (req, res) => {
  try {
    const teams = await db.Team.findAll({
      where: { participates: true },
      include: [
        {
          model: db.Vote,
          as: 'votes',
          attributes: []
        }
      ],
      attributes: [
        'id',
        'groupName',
        'displayName',
        'appName',
        'screenshotUrl',
        [db.sequelize.fn('COUNT', db.sequelize.col('votes.id')), 'voteCount']
      ],
      group: ['Team.id'],
      order: [[db.sequelize.literal('voteCount'), 'DESC']],
      limit: 5
    });

    const podium = teams.map((team, index) => ({
      position: index + 1,
      teamId: team.id,
      groupName: team.groupName,
      displayName: team.displayName,
      appName: team.appName,
      screenshotUrl: team.screenshotUrl,
      voteCount: parseInt(team.get('voteCount'))
    }));

    res.json(podium);
  } catch (error) {
    console.error('Error en getPodium:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getPodium
};

