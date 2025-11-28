const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: process.env.NODE_ENV === 'production' && process.env.DB_SSL === 'true' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  }
);

const db = {};

db.Admin = require('./Admin')(sequelize, Sequelize.DataTypes);
db.Helper = require('./Helper')(sequelize, Sequelize.DataTypes);
db.Student = require('./Student')(sequelize, Sequelize.DataTypes);
db.Team = require('./Team')(sequelize, Sequelize.DataTypes);
db.Vote = require('./Vote')(sequelize, Sequelize.DataTypes);
db.Favorite = require('./Favorite')(sequelize, Sequelize.DataTypes);
db.Config = require('./Config')(sequelize, Sequelize.DataTypes);

// Definir relaciones
db.Helper.hasMany(db.Team, { foreignKey: 'helperId', as: 'teams' });
db.Team.belongsTo(db.Helper, { foreignKey: 'helperId', as: 'helper' });

db.Team.hasMany(db.Student, { foreignKey: 'teamId', as: 'students' });
db.Student.belongsTo(db.Team, { foreignKey: 'teamId', as: 'team' });

db.Student.hasMany(db.Vote, { foreignKey: 'studentId', as: 'votes' });
db.Vote.belongsTo(db.Student, { foreignKey: 'studentId', as: 'student' });

db.Helper.hasMany(db.Vote, { foreignKey: 'helperId', as: 'votes' });
db.Vote.belongsTo(db.Helper, { foreignKey: 'helperId', as: 'helper' });

db.Admin.hasMany(db.Vote, { foreignKey: 'adminId', as: 'votes' });
db.Vote.belongsTo(db.Admin, { foreignKey: 'adminId', as: 'admin' });

db.Team.hasMany(db.Vote, { foreignKey: 'teamId', as: 'votes' });
db.Vote.belongsTo(db.Team, { foreignKey: 'teamId', as: 'team' });

db.Student.hasMany(db.Favorite, { foreignKey: 'studentId', as: 'favorites' });
db.Favorite.belongsTo(db.Student, { foreignKey: 'studentId', as: 'student' });

db.Team.hasMany(db.Favorite, { foreignKey: 'teamId', as: 'favorites' });
db.Favorite.belongsTo(db.Team, { foreignKey: 'teamId', as: 'team' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

