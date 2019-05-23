"use strict";
module.exports = (sequelize, DataTypes) => {
  const ProjectGroupAdmin = sequelize.define(
    "ProjectGroupAdmin",
    {
      projectGroupId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER
    },
    {}
  );
  ProjectGroupAdmin.associate = function(models) {
    // associations can be defined here
    ProjectGroupAdmin.belongsTo(models.ProjectGroup);
  };
  return ProjectGroupAdmin;
};
