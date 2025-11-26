'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Eliminar el índice único existente primero
    try {
      await queryInterface.removeIndex('votes', 'votes_student_team_unique');
    } catch (error) {
      // El índice puede no existir, continuar
      console.log('Índice no encontrado, continuando...');
    }
    
    // Hacer studentId nullable
    await queryInterface.changeColumn('votes', 'studentId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'students',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // Agregar helperId
    await queryInterface.addColumn('votes', 'helperId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'helpers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // Agregar adminId
    await queryInterface.addColumn('votes', 'adminId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'admins',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // Crear índices únicos parciales para cada tipo de usuario usando SQL directo
    // Esto asegura que un usuario solo pueda votar una vez por equipo
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS votes_student_team_unique 
      ON votes ("studentId", "teamId") 
      WHERE "studentId" IS NOT NULL;
    `);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS votes_helper_team_unique 
      ON votes ("helperId", "teamId") 
      WHERE "helperId" IS NOT NULL;
    `);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS votes_admin_team_unique 
      ON votes ("adminId", "teamId") 
      WHERE "adminId" IS NOT NULL;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar los nuevos índices usando SQL directo
    try {
      await queryInterface.sequelize.query('DROP INDEX IF EXISTS votes_admin_team_unique;');
      await queryInterface.sequelize.query('DROP INDEX IF EXISTS votes_helper_team_unique;');
      await queryInterface.sequelize.query('DROP INDEX IF EXISTS votes_student_team_unique;');
    } catch (error) {
      console.log('Error al eliminar índices:', error);
    }

    // Eliminar las columnas agregadas
    await queryInterface.removeColumn('votes', 'adminId');
    await queryInterface.removeColumn('votes', 'helperId');

    // Restaurar studentId a not null
    await queryInterface.changeColumn('votes', 'studentId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'students',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // Restaurar el índice único original
    await queryInterface.addIndex('votes', ['studentId', 'teamId'], {
      unique: true,
      name: 'votes_student_team_unique'
    });
  }
};

