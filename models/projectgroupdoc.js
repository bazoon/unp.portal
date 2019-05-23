"use strict";
module.exports = (sequelize, DataTypes) => {
  const ProjectGroupDoc = sequelize.define(
    "ProjectGroupDoc",
    {
      projectGroupId: DataTypes.INTEGER,
      file: DataTypes.STRING,
      size: DataTypes.INTEGER
    },
    {}
  );
  ProjectGroupDoc.associate = function(models) {
    // associations can be defined here
    ProjectGroupDoc.belongsTo(models.ProjectGroup);
  };
  return ProjectGroupDoc;
};
