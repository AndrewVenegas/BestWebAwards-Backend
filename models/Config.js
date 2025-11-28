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
    },
    dataLoadingPeriod: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    votingStartDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'configs',
    timestamps: true
  });

  return Config;
};

