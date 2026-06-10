'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('GalleryImages', 'thumbnailUrl', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'imageUrl',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('GalleryImages', 'thumbnailUrl');
  },
};
