"use strict";
module.exports = (sequelize, DataTypes) => {
  const FileAccess = sequelize.define(
    "FileAccess",
    {
      userId: DataTypes.INTEGER,
      fileId: DataTypes.INTEGER
    },
    {}
  );
  FileAccess.associate = function(models) {
    // associations can be defined here
  };
  return FileAccess;
};
