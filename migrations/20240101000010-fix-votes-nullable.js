'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Usar SQL directo para asegurar que studentId sea nullable
    // Esto es más confiable que changeColumn en algunos casos
    await queryInterface.sequelize.query(`
      ALTER TABLE votes 
      ALTER COLUMN "studentId" DROP NOT NULL;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Restaurar NOT NULL solo si no hay valores NULL
    await queryInterface.sequelize.query(`
      UPDATE votes SET "studentId" = 0 WHERE "studentId" IS NULL;
      ALTER TABLE votes 
      ALTER COLUMN "studentId" SET NOT NULL;
    `);
  }
};

