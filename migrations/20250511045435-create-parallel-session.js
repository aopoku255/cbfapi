"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ParallelSessions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      sessionId: {
        type: Sequelize.INTEGER,
      },
      starttime: {
        type: Sequelize.STRING,
      },
      endtime: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      },
      speakers: {
        type: Sequelize.STRING,
      },
      topic: {
        type: Sequelize.STRING,
      },
      sessionchair: {
        type: Sequelize.STRING,
      },
      hall: {
        type: Sequelize.STRING,
      },
      zoomlink: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ParallelSessions");
  },
};
