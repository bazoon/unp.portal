"use strict";
module.exports = (sequelize, DataTypes) => {
  const Channel = sequelize.define(
    "Channel",
    {
      name: DataTypes.STRING,
      avatar: DataTypes.STRING
    },
    {}
  );
  Channel.associate = function(models) {
    Channel.hasMany(models.Message, { as: "Messages" });
  };
  return Channel;
};
