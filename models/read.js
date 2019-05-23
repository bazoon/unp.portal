"use strict";
module.exports = (sequelize, DataTypes) => {
  const Read = sequelize.define(
    "Read",
    {
      messageId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
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
