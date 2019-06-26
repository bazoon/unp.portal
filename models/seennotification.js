"use strict";
module.exports = (sequelize, DataTypes) => {
  const SeenNotification = sequelize.define(
    "SeenNotification",
    {
      notificationId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      seen: DataTypes.BOOLEAN
    },
    {}
  );
  SeenNotification.associate = function(models) {
    // associations can be defined here
  };
  return SeenNotification;
};
