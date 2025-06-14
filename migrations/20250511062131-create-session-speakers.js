"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("SessionSpeakers", {
      sessionId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Sessions",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      speakerId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Speakers",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("SessionSpeakers");
  },
};
