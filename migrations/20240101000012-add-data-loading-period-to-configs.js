'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('configs', 'dataLoadingPeriod', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
    
    await queryInterface.addColumn('configs', 'votingStartDate', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('configs', 'dataLoadingPeriod');
    await queryInterface.removeColumn('configs', 'votingStartDate');
  }
};

