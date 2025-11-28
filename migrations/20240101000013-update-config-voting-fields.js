'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Eliminar dataLoadingPeriod
    await queryInterface.removeColumn('configs', 'dataLoadingPeriod');
    
    // Agregar nuevos campos
    await queryInterface.addColumn('configs', 'dataLoadingStartDate', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    await queryInterface.addColumn('configs', 'dataLoadingEndDate', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    await queryInterface.addColumn('configs', 'votingPaused', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Restaurar dataLoadingPeriod
    await queryInterface.addColumn('configs', 'dataLoadingPeriod', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
    
    // Eliminar nuevos campos
    await queryInterface.removeColumn('configs', 'dataLoadingStartDate');
    await queryInterface.removeColumn('configs', 'dataLoadingEndDate');
    await queryInterface.removeColumn('configs', 'votingPaused');
  }
};

