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
        votingStartDate: null,
        dataLoadingStartDate: null,
        dataLoadingEndDate: null,
        votingPaused: false
      });
    }

    const now = new Date();
    
    // Verificar si estamos en periodo de carga de datos
    const isInDataLoadingPeriod = config.dataLoadingStartDate && config.dataLoadingEndDate
      ? now >= new Date(config.dataLoadingStartDate) && now <= new Date(config.dataLoadingEndDate)
      : false;
    
    // Determinar si las votaciones están abiertas
    let isOpen = false;
    
    if (isInDataLoadingPeriod || config.votingPaused) {
      // En periodo de carga o pausadas manualmente
      isOpen = false;
    } else {
      // Verificar si estamos dentro del periodo de votación
      const startDate = config.votingStartDate ? new Date(config.votingStartDate) : null;
      const endDate = new Date(config.votingDeadline);
      
      if (startDate && now < startDate) {
        // Aún no ha comenzado el periodo de votación
        isOpen = false;
      } else if (now > endDate) {
        // Ya pasó la fecha de cierre
        isOpen = false;
      } else {
        // Estamos en el periodo de votación
        isOpen = true;
      }
    }

    res.json({
      votingDeadline: config.votingDeadline,
      votingStartDate: config.votingStartDate,
      dataLoadingStartDate: config.dataLoadingStartDate,
      dataLoadingEndDate: config.dataLoadingEndDate,
      votingPaused: config.votingPaused,
      isOpen,
      isInDataLoadingPeriod
    });
  } catch (error) {
    consoleDebug('Error en getConfig:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateVotingDeadline = async (req, res) => {
  try {
    const { 
      votingDeadline, 
      votingStartDate, 
      dataLoadingStartDate, 
      dataLoadingEndDate 
    } = req.body;

    if (!votingDeadline) {
      return res.status(400).json({ error: 'votingDeadline es requerido' });
    }

    let config = await db.Config.findOne({ where: { id: 1 } });

    if (!config) {
      config = await db.Config.create({
        id: 1,
        votingDeadline: new Date(votingDeadline),
        votingStartDate: votingStartDate ? new Date(votingStartDate) : null,
        dataLoadingStartDate: dataLoadingStartDate ? new Date(dataLoadingStartDate) : null,
        dataLoadingEndDate: dataLoadingEndDate ? new Date(dataLoadingEndDate) : null,
        votingPaused: false
      });
    } else {
      config.votingDeadline = new Date(votingDeadline);
      if (votingStartDate !== undefined) {
        config.votingStartDate = votingStartDate ? new Date(votingStartDate) : null;
      }
      if (dataLoadingStartDate !== undefined) {
        config.dataLoadingStartDate = dataLoadingStartDate ? new Date(dataLoadingStartDate) : null;
      }
      if (dataLoadingEndDate !== undefined) {
        config.dataLoadingEndDate = dataLoadingEndDate ? new Date(dataLoadingEndDate) : null;
      }
      await config.save();
    }

    const now = new Date();
    
    // Verificar si estamos en periodo de carga de datos
    const isInDataLoadingPeriod = config.dataLoadingStartDate && config.dataLoadingEndDate
      ? now >= new Date(config.dataLoadingStartDate) && now <= new Date(config.dataLoadingEndDate)
      : false;
    
    // Determinar si las votaciones están abiertas
    let isOpen = false;
    
    if (isInDataLoadingPeriod || config.votingPaused) {
      isOpen = false;
    } else {
      const startDate = config.votingStartDate ? new Date(config.votingStartDate) : null;
      const endDate = new Date(config.votingDeadline);
      
      if (startDate && now < startDate) {
        isOpen = false;
      } else if (now > endDate) {
        isOpen = false;
      } else {
        isOpen = true;
      }
    }

    res.json({
      votingDeadline: config.votingDeadline,
      votingStartDate: config.votingStartDate,
      dataLoadingStartDate: config.dataLoadingStartDate,
      dataLoadingEndDate: config.dataLoadingEndDate,
      votingPaused: config.votingPaused,
      isOpen,
      isInDataLoadingPeriod
    });
  } catch (error) {
    consoleDebug('Error en updateVotingDeadline:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const toggleVotingPaused = async (req, res) => {
  try {
    let config = await db.Config.findOne({ where: { id: 1 } });

    if (!config) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }

    config.votingPaused = !config.votingPaused;
    await config.save();

    const now = new Date();
    
    // Verificar si estamos en periodo de carga de datos
    const isInDataLoadingPeriod = config.dataLoadingStartDate && config.dataLoadingEndDate
      ? now >= new Date(config.dataLoadingStartDate) && now <= new Date(config.dataLoadingEndDate)
      : false;
    
    // Determinar si las votaciones están abiertas
    let isOpen = false;
    
    if (isInDataLoadingPeriod || config.votingPaused) {
      isOpen = false;
    } else {
      const startDate = config.votingStartDate ? new Date(config.votingStartDate) : null;
      const endDate = new Date(config.votingDeadline);
      
      if (startDate && now < startDate) {
        isOpen = false;
      } else if (now > endDate) {
        isOpen = false;
      } else {
        isOpen = true;
      }
    }

    res.json({
      votingDeadline: config.votingDeadline,
      votingStartDate: config.votingStartDate,
      dataLoadingStartDate: config.dataLoadingStartDate,
      dataLoadingEndDate: config.dataLoadingEndDate,
      votingPaused: config.votingPaused,
      isOpen,
      isInDataLoadingPeriod
    });
  } catch (error) {
    consoleDebug('Error en toggleVotingPaused:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getConfig,
  updateVotingDeadline,
  toggleVotingPaused
};

