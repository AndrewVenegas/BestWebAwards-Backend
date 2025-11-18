const db = require('../models');

const getConfig = async (req, res) => {
  try {
    let config = await db.Config.findOne({ where: { id: 1 } });
    
    if (!config) {
      // Crear config por defecto si no existe
      const defaultDeadline = new Date();
      defaultDeadline.setDate(defaultDeadline.getDate() + 30);
      
      config = await db.Config.create({
        id: 1,
        votingDeadline: defaultDeadline
      });
    }

    const now = new Date();
    const deadline = new Date(config.votingDeadline);
    const isOpen = now <= deadline;

    res.json({
      votingDeadline: config.votingDeadline,
      isOpen
    });
  } catch (error) {
    console.error('Error en getConfig:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateVotingDeadline = async (req, res) => {
  try {
    const { votingDeadline } = req.body;

    if (!votingDeadline) {
      return res.status(400).json({ error: 'votingDeadline es requerido' });
    }

    let config = await db.Config.findOne({ where: { id: 1 } });

    if (!config) {
      config = await db.Config.create({
        id: 1,
        votingDeadline: new Date(votingDeadline)
      });
    } else {
      config.votingDeadline = new Date(votingDeadline);
      await config.save();
    }

    const now = new Date();
    const deadline = new Date(config.votingDeadline);
    const isOpen = now <= deadline;

    res.json({
      votingDeadline: config.votingDeadline,
      isOpen
    });
  } catch (error) {
    console.error('Error en updateVotingDeadline:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getConfig,
  updateVotingDeadline
};

