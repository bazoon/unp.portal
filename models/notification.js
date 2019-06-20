"use strict";
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define("Notification", {
    userId: DataTypes.INTEGER,
    recipientId: DataTypes.INTEGER,
    type: DataTypes.INTEGER,
    description: DataTypes.TEXT
  });
  Notification.associate = function(models) {
    // associations can be defined here
  };
  return Notification;
};
