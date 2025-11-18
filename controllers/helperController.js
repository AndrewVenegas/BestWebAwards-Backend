const db = require('../models');

const getMyTeams = async (req, res) => {
  try {
    const teams = await db.Team.findAll({
      where: { helperId: req.user.id },
      include: [
        {
          model: db.Student,
          as: 'students'
        }
      ],
      order: [['groupName', 'ASC']]
    });

    res.json(teams);
  } catch (error) {
    console.error('Error en getMyTeams:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { participates, displayName, appName, deployUrl, videoUrl, screenshotUrl } = req.body;

    const team = await db.Team.findOne({
      where: { id: teamId, helperId: req.user.id }
    });

    if (!team) {
      return res.status(404).json({ error: 'Equipo no encontrado o no tienes permisos' });
    }

    if (participates !== undefined) team.participates = participates;
    if (displayName !== undefined) team.displayName = displayName;
    if (appName !== undefined) team.appName = appName;
    if (deployUrl !== undefined) team.deployUrl = deployUrl;
    if (videoUrl !== undefined) team.videoUrl = videoUrl;
    if (screenshotUrl !== undefined) team.screenshotUrl = screenshotUrl;

    await team.save();

    res.json(team);
  } catch (error) {
    console.error('Error en updateTeam:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getMyTeams,
  updateTeam
};

