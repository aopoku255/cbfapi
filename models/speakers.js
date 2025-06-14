"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Speakers extends Model {
    static associate(models) {
      // Define associations correctly here
      Speakers.belongsToMany(models.Sessions, {
        through: "SessionSpeakers",
        foreignKey: "speakerId",
        otherKey: "sessionId",
      });

      Speakers.belongsToMany(models.ParallelSession, {
        through: "ParallelSessionSpeakers",
        foreignKey: "speakerId",
        otherKey: "parallelSessionId",
      });
    }
  }

  Speakers.init(
    {
      prefix: DataTypes.STRING,
      fname: DataTypes.STRING,
      lname: DataTypes.STRING,
      suffix: DataTypes.STRING,
      email: DataTypes.STRING,
      linkedin: DataTypes.STRING,
      company: DataTypes.STRING,
      bio: DataTypes.STRING,
      image: DataTypes.STRING,
      notes: DataTypes.STRING,
      custom: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Speakers",
    }
  );

  return Speakers;
};
