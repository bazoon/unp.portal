"use strict";
module.exports = (sequelize, DataTypes) => {
  const ProjectGroupMedia = sequelize.define(
    "ProjectGroupMedia",
    {
      ProjectGroupId: DataTypes.INTEGER,
      file: DataTypes.STRING,
      size: DataTypes.INTEGER
    },
    {}
  );
  ProjectGroupMedia.associate = function(models) {
    // associations can be defined here
    ProjectGroupMedia.belongsTo(models.ProjectGroup);
  };
  return ProjectGroupMedia;
};
