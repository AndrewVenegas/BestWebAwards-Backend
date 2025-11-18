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
    const { participates, displayName, appName, deployUrl, videoUrl, screenshotUrl, tipo_app } = req.body;

    const team = await db.Team.findOne({
      where: { id: teamId, helperId: req.user.id }
    });

    if (!team) {
      return res.status(404).json({ error: 'Equipo no encontrado o no tienes permisos' });
    }

    // Validar campos obligatorios si se están actualizando
    const errors = [];

    if (displayName !== undefined) {
      if (!displayName || displayName.trim() === '') {
        errors.push('El nombre del grupo (para mostrar) es obligatorio');
      } else {
        team.displayName = displayName.trim();
      }
    }

    if (appName !== undefined) {
      if (!appName || appName.trim() === '') {
        errors.push('El nombre de la aplicación es obligatorio');
      } else {
        team.appName = appName.trim();
      }
    }

    if (deployUrl !== undefined) {
      if (!deployUrl || deployUrl.trim() === '') {
        errors.push('La URL de despliegue es obligatoria');
      } else {
        const trimmedUrl = deployUrl.trim();
        try {
          const urlObj = new URL(trimmedUrl);
          if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
            errors.push('La URL de despliegue debe comenzar con http:// o https://');
          } else {
            team.deployUrl = trimmedUrl;
          }
        } catch {
          errors.push('La URL de despliegue no tiene un formato válido');
        }
      }
    }

    if (videoUrl !== undefined) {
      if (!videoUrl || videoUrl.trim() === '') {
        errors.push('La URL del video es obligatoria');
      } else {
        const trimmedUrl = videoUrl.trim();
        try {
          const urlObj = new URL(trimmedUrl);
          if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
            errors.push('La URL del video debe comenzar con http:// o https://');
          } else {
            team.videoUrl = trimmedUrl;
          }
        } catch {
          errors.push('La URL del video no tiene un formato válido');
        }
      }
    }

    if (screenshotUrl !== undefined) {
      if (!screenshotUrl || screenshotUrl.trim() === '') {
        errors.push('La imagen de portada es obligatoria');
      } else {
        team.screenshotUrl = screenshotUrl.trim();
      }
    }

    if (participates !== undefined) {
      team.participates = participates;
    }

    if (tipo_app !== undefined) {
      const validTypes = ['Chat', 'E-commerce', 'Juego', 'Planificador', 'Red Social', 'Mix', 'Otro', null, ''];
      if (tipo_app && !validTypes.includes(tipo_app)) {
        errors.push('Tipo de aplicación no válido');
      } else {
        team.tipo_app = tipo_app || null;
      }
    }

    // Si hay errores, retornarlos sin guardar
    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0] }); // Retornar el primer error
    }

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

