const db = require('../models');
const { consoleDebug } = require('../utils/debug');

const getConfig = async (req, res) => {
  try {
    let config = await db.Config.findOne({ where: { id: 1 } });
    
    if (!config) {
      // Crear config por defecto si no existe
      const defaultDeadline = new Date();
      defaultDeadline.setDate(defaultDeadline.getDate() + 30);
      
      config = await db.Config.create({
        id: 1,
        votingDeadline: defaultDeadline,
        dataLoadingPeriod: false,
        votingStartDate: null
      });
    }

    const now = new Date();
    const deadline = new Date(config.votingDeadline);
    
    // Si está en periodo de carga de datos, las votaciones están cerradas
    // Si no está en periodo de carga, verificar si estamos entre inicio y fin
    let isOpen = false;
    if (config.dataLoadingPeriod) {
      // En periodo de carga de datos, las votaciones están cerradas
      isOpen = false;
    } else {
      // Verificar si estamos dentro del periodo de votación
      const startDate = config.votingStartDate ? new Date(config.votingStartDate) : null;
      const endDate = new Date(config.votingDeadline);
      
      if (startDate && now < startDate) {
        // Aún no ha comenzado el periodo de votación
        isOpen = false;
      } else {
        // Estamos en el periodo de votación (o no hay fecha de inicio)
        isOpen = now <= endDate;
      }
    }

    res.json({
      votingDeadline: config.votingDeadline,
      votingStartDate: config.votingStartDate,
      dataLoadingPeriod: config.dataLoadingPeriod,
      isOpen
    });
  } catch (error) {
    consoleDebug('Error en getConfig:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateVotingDeadline = async (req, res) => {
  try {
    const { votingDeadline, votingStartDate, dataLoadingPeriod } = req.body;

    if (!votingDeadline) {
      return res.status(400).json({ error: 'votingDeadline es requerido' });
    }

    let config = await db.Config.findOne({ where: { id: 1 } });

    if (!config) {
      config = await db.Config.create({
        id: 1,
        votingDeadline: new Date(votingDeadline),
        votingStartDate: votingStartDate ? new Date(votingStartDate) : null,
        dataLoadingPeriod: dataLoadingPeriod || false
      });
    } else {
      config.votingDeadline = new Date(votingDeadline);
      if (votingStartDate !== undefined) {
        config.votingStartDate = votingStartDate ? new Date(votingStartDate) : null;
      }
      if (dataLoadingPeriod !== undefined) {
        config.dataLoadingPeriod = dataLoadingPeriod;
      }
      await config.save();
    }

    const now = new Date();
    const deadline = new Date(config.votingDeadline);
    
    // Si está en periodo de carga de datos, las votaciones están cerradas
    let isOpen = false;
    if (config.dataLoadingPeriod) {
      isOpen = false;
    } else {
      const startDate = config.votingStartDate ? new Date(config.votingStartDate) : null;
      if (startDate && now < startDate) {
        isOpen = false;
      } else {
        isOpen = now <= deadline;
      }
    }

    res.json({
      votingDeadline: config.votingDeadline,
      votingStartDate: config.votingStartDate,
      dataLoadingPeriod: config.dataLoadingPeriod,
      isOpen
    });
  } catch (error) {
    consoleDebug('Error en updateVotingDeadline:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getConfig,
  updateVotingDeadline
};

