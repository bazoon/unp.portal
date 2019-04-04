"use strict";
module.exports = (sequelize, DataTypes) => {
  const Participant = sequelize.define(
    "Participant",
    {
      ProjectGroupId: DataTypes.INTEGER,
      UserId: DataTypes.INTEGER
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
