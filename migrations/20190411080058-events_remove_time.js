"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.
      return queryInterface.removeColumn("ProjectGroups", "UserId");
      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.removeColumn("Events", "fromTime");
    return queryInterface.removeColumn("Events", "toTime");
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.addColumn("Events", "fromTime", Sequelize.Time);
    return queryInterface.addColumn("Events", "toTime", Sequelize.Time);
  }
};
