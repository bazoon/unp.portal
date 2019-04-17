'use strict';
module.exports = (sequelize, DataTypes) => {
  const NotificationPreference = sequelize.define('NotificationPreference', {
    type: DataTypes.STRING,
    SourceId: DataTypes.INTEGER,
    sms: DataTypes.BOOLEAN,
    push: DataTypes.BOOLEAN,
    email: DataTypes.BOOLEAN
  }, {});
  NotificationPreference.associate = function(models) {
    // associations can be defined here
  };
  return NotificationPreference;
};