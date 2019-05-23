"use strict";
module.exports = (sequelize, DataTypes) => {
  const ProjectGroupLink = sequelize.define(
    "ProjectGroupLink",
    {
      projectGroupId: DataTypes.INTEGER,
      link: DataTypes.STRING,
      title: DataTypes.STRING
    },
    {}
  );
  ProjectGroupLink.associate = function(models) {
    // associations can be defined here
    ProjectGroupLink.belongsTo(models.ProjectGroup);
  };
  return ProjectGroupLink;
};
