"use strict";
module.exports = (sequelize, DataTypes) => {
  const EventAccess = sequelize.define(
    "EventAccess",
    {
      eventId: DataTypes.INTEGER,
      entityId: DataTypes.INTEGER
    },
    {}
  );
  EventAccess.associate = function(models) {
    // associations can be defined here
  };
  return EventAccess;
};
