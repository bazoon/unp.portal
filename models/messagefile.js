"use strict";
module.exports = (sequelize, DataTypes) => {
  const MessageFile = sequelize.define(
    "MessageFile",
    {
      MessageId: DataTypes.INTEGER,
      FileId: DataTypes.INTEGER
    },
    {}
  );
  MessageFile.associate = function(models) {
    // associations can be defined here
    MessageFile.belongsTo(models.Message);
    MessageFile.belongsTo(models.File);
  };
  return MessageFile;
};
