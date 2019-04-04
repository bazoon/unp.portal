"use strict";
module.exports = (sequelize, DataTypes) => {
  const ProjectGroup = sequelize.define(
    "ProjectGroup",
    {
      title: DataTypes.STRING,
      avatar: DataTypes.STRING,
      is_open: DataTypes.BOOLEAN
    },
    {}
  );
  ProjectGroup.associate = function(models) {
    // associations can be defined here
    ProjectGroup.belongsTo(models.User);
    ProjectGroup.hasMany(models.Participant, { as: "Participants" });
    ProjectGroup.hasMany(models.Conversation, { as: "Conversations" });
  };
  return ProjectGroup;
};
