'use strict';
module.exports = (sequelize, DataTypes) => {
  const ProjectGroupBackground = sequelize.define('ProjectGroupBackground', {
    file_id: DataTypes.INTEGER
  }, {});
  ProjectGroupBackground.associate = function(models) {
    // associations can be defined here
  };
  return ProjectGroupBackground;
};