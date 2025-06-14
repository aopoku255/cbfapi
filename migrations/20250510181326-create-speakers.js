'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Speakers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      prefix: {
        type: Sequelize.STRING
      },
      fname: {
        type: Sequelize.STRING
      },
      lname: {
        type: Sequelize.STRING
      },
      suffix: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      linkedin: {
        type: Sequelize.STRING
      },
      company: {
        type: Sequelize.STRING
      },
      bio: {
        type: Sequelize.STRING
      },
      image: {
        type: Sequelize.STRING
      },
      notes: {
        type: Sequelize.STRING
      },
      custom: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Speakers');
  }
};