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
    votingStartDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    dataLoadingStartDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    dataLoadingEndDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    votingPaused: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  }, {
    tableName: 'configs',
    timestamps: true
  });

  return Config;
};

