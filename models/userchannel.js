"use strict";
module.exports = (sequelize, DataTypes) => {
  const UserChannel = sequelize.define(
    "UserChannel",
    {
      channelId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER
    },
    {}
  );
  UserChannel.associate = function(models) {
    UserChannel.belongsTo(models.User);
    UserChannel.belongsTo(models.Channel);
  };
  return UserChannel;
};
