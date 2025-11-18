module.exports = (sequelize, DataTypes) => {
  const Config = sequelize.define('Config', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    votingDeadline: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'configs',
    timestamps: true
  });

  return Config;
};

