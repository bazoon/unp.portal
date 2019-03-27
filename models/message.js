"use strict";
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define(
    "Message",
    {
      channel_id: DataTypes.INTEGER,
      message: DataTypes.STRING,
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
