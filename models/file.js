"use strict";
module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define(
    "File",
    {
      file: DataTypes.STRING,
      entityId: DataTypes.INTEGER,
      size: DataTypes.INTEGER,
      type: DataTypes.STRING
    },
    {}
  );
  File.associate = function(models) {
    // associations can be defined here
  };
  return File;
};
