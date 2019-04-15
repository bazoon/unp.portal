"use strict";
module.exports = (sequelize, DataTypes) => {
  const UserEvent = sequelize.define(
    "UserEvent",
    {
      eventId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER
    },
    {}
  );
  UserEvent.associate = function(models) {
    // associations can be defined here
    UserEvent.belongsTo(models.User);
    UserEvent.belongsTo(models.Event);
  };
  return UserEvent;
};
