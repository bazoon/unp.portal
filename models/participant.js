"use strict";
module.exports = (sequelize, DataTypes) => {
  const Participant = sequelize.define(
    "Participant",
    {
      projectGroupId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER
    },
    {}
  );
  Participant.associate = function(models) {
    // associations can be defined here
    Participant.belongsTo(models.ProjectGroup);
    Participant.belongsTo(models.User);
  };
  return Participant;
};
