"use strict";
module.exports = (sequelize, DataTypes) => {
  const ProjectGroup = sequelize.define(
    "ProjectGroup",
    {
      title: DataTypes.STRING,
      avatar: DataTypes.STRING,
      isOpen: DataTypes.BOOLEAN,
      description: DataTypes.TEXT
    },
    {}
  );
  ProjectGroup.associate = function(models) {
    ProjectGroup.belongsTo(models.User);
    ProjectGroup.hasMany(models.Participant, { as: "Participants" });
    ProjectGroup.hasMany(models.Conversation, { as: "Conversations" });
    ProjectGroup.hasMany(models.ProjectGroupDoc, { as: "Docs" });
    ProjectGroup.hasMany(models.ProjectGroupLink, { as: "Links" });
    ProjectGroup.hasMany(models.ProjectGroupMedia, { as: "MediaFiles" });
    ProjectGroup.hasMany(models.ProjectGroupAdmin, { as: "Admins" });
  };
  return ProjectGroup;
};
