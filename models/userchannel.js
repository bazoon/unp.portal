"use strict";
module.exports = (sequelize, DataTypes) => {
  const UserChannel = sequelize.define(
    "UserChannel",
    {
      ChannelId: DataTypes.INTEGER,
      UserId: DataTypes.INTEGER
    },
    {}
  );
  UserChannel.associate = function(models) {
    UserChannel.belongsTo(models.User);
    UserChannel.belongsTo(models.Channel);
  };
  return UserChannel;
};
