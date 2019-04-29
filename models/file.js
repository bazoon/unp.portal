'use strict';
module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define('File', {
    file: DataTypes.STRING,
    size: DataTypes.INTEGER
  }, {});
  File.associate = function(models) {
    // associations can be defined here
  };
  return File;
};