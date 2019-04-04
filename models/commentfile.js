"use strict";
module.exports = (sequelize, DataTypes) => {
  const CommentFile = sequelize.define(
    "CommentFile",
    {
      CommentId: DataTypes.INTEGER,
      file: DataTypes.STRING,
      size: DataTypes.INTEGER
    },
    {}
  );
  CommentFile.associate = function(models) {
    // associations can be defined here
    models.CommentFile.belongsTo(models.Comment);
  };
  return CommentFile;
};
