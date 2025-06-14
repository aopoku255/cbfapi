"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Sessions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      Sessions.belongsToMany(models.Speakers, {
        through: "SessionSpeakers",
        foreignKey: "sessionId",
        otherKey: "speakerId",
      });
      Sessions.hasMany(models.ParallelSession, {
        foreignKey: "sessionId",
        as: "parallelSessions",
      });
    }
  }
  Sessions.init(
    {
      date: DataTypes.DATE,
      starttime: DataTypes.STRING,
      endtime: DataTypes.STRING,
      name: DataTypes.STRING,
      // ✅ Remove speakers: DataTypes.STRING
    },
    {
      sequelize,
      modelName: "Sessions",
    }
  );

  return Sessions;
};
