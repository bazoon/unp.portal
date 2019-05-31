"use strict";
module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define(
    "File",
    {
      file: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      postId: DataTypes.INTEGER,
      groupId: DataTypes.INTEGER,
      messageId: DataTypes.INTEGER,
      conversationId: DataTypes.INTEGER,
      size: DataTypes.INTEGER
    },
    {}
  );
  File.associate = function(models) {
    // associations can be defined here
  };
  return File;
};
