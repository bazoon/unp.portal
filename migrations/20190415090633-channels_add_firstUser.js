"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface
      .addColumn("Channels", "firstUserId", Sequelize.INTEGER)
      .then(() => {
        return queryInterface.addColumn(
          "Channels",
          "secondUserId",
          Sequelize.INTEGER
        );
      });
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.removeColumn("Channels", "firstUserId").then(() => {
      return queryInterface.removeColumn("Channels", "secondUserId");
    });
  }
};
