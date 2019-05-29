"use strict";
module.exports = (sequelize, DataTypes) => {
  const ProjectGroup = sequelize.define(
    "ProjectGroup",
    {
      title: DataTypes.STRING,
      avatar: DataTypes.STRING,
      isOpen: DataTypes.BOOLEAN,
      description: DataTypes.TEXT,
      userId: DataTypes.INTEGER
    },
    {}
  );
  ProjectGroup.associate = function(models) {
    ProjectGroup.belongsTo(models.User);
    ProjectGroup.hasMany(models.Participant, { as: "Participants" });
    ProjectGroup.hasMany(models.Conversation, { as: "Conversations" });
  };
  return ProjectGroup;
};
