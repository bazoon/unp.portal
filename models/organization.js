"use strict";
module.exports = (sequelize, DataTypes) => {
  const Organization = sequelize.define(
    "Organization",
    {
      name: DataTypes.STRING,
      fullName: DataTypes.STRING,
      inn: DataTypes.STRING,
      address: DataTypes.STRING
    },
    {}
  );
  Organization.associate = function(models) {
    // associations can be defined here
  };
  return Organization;
};
