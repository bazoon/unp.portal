"use strict";
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define(
    "Message",
    {
      channelId: DataTypes.INTEGER,
      message: DataTypes.TEXT,
      type: DataTypes.STRING
    },
    {}
  );
  Message.associate = function(models) {
    // associations can be defined here
    Message.belongsTo(models.Channel);
    Message.belongsTo(models.User);
  };
  return Message;
};
