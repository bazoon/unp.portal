"use strict";
module.exports = (sequelize, DataTypes) => {
  const PostFile = sequelize.define(
    "PostFile",
    {
      PostId: DataTypes.INTEGER,
      file: DataTypes.STRING,
      size: DataTypes.INTEGER
    },
    {}
  );
  PostFile.associate = function(models) {
    // associations can be defined here
    models.PostFile.belongsTo(models.Post);
  };
  return PostFile;
};
