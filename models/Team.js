module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define('Team', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    groupName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    appName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    participates: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    deployUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    videoUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    screenshotUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    helperId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'helpers',
        key: 'id'
      }
    }
  }, {
    tableName: 'teams',
    timestamps: true
  });

  return Team;
};

