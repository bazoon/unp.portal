"use strict";
module.exports = (sequelize, DataTypes) => {
  const Read = sequelize.define(
    "Read",
    {
      message_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      seen: DataTypes.BOOLEAN
    },
    {}
  );
  Read.associate = function(models) {
    // associations can be defined here
    Read.belongsTo(models.User, {
      onDelete: "CASCADE"
    });

    Read.belongsTo(models.Message, {
      onDelete: "CASCADE"
    });
  };
  return Read;
};
