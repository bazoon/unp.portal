"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.removeColumn("Comments", "comment").then(() => {
      return queryInterface.addColumn("Comments", "comment", Sequelize.TEXT);
    });
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.removeColumn("Comments", "comment").then(() => {
      return queryInterface.addColumn("Comments", "comment", Sequelize.STRING);
    });
  }
};
