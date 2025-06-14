"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ParallelSession extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ParallelSession.belongsTo(models.Sessions, {
        foreignKey: "sessionId",
        as: "session",
      });

      ParallelSession.belongsToMany(models.Speakers, {
        through: "ParallelSessionSpeakers",
        foreignKey: "parallelSessionId",
        otherKey: "speakerId",
      });
      ParallelSession.belongsToMany(models.Location, {
        through: "ParallelSessionSpeakers",
        foreignKey: "parallelSessionId",
        otherKey: "speakerId",
      });
    }
  }
  ParallelSession.init(
    {
      sessionId: DataTypes.INTEGER,
      starttime: DataTypes.STRING,
      endtime: DataTypes.STRING,
      name: DataTypes.STRING,
      topic: DataTypes.STRING,
      sessionchair: DataTypes.STRING,
      hall: DataTypes.STRING,
      zoomlink: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "ParallelSession",
    }
  );

  return ParallelSession;
};
