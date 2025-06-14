module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("ParallelSessions", "locationId", {
      type: Sequelize.INTEGER,
      references: {
        model: "Locations",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("ParallelSessions", "locationId");
  },
};
