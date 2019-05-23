"use strict";
module.exports = (sequelize, DataTypes) => {
  const NotificationPreference = sequelize.define(
    "NotificationPreference",
    {
      type: DataTypes.STRING,
      sourceId: DataTypes.INTEGER,
      sms: DataTypes.BOOLEAN,
      push: DataTypes.BOOLEAN,
      email: DataTypes.BOOLEAN,
      userId: DataTypes.INTEGER
    },
    {}
  );
  NotificationPreference.associate = function(models) {
    // associations can be defined here
  };
  return NotificationPreference;
};
