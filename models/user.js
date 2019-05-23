"use strict";
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      name: DataTypes.STRING,
      login: DataTypes.STRING,
      password: DataTypes.STRING,
      avatar: DataTypes.STRING,
      positionId: DataTypes.INTEGER,
      organizationId: DataTypes.INTEGER,
      roleId: DataTypes.INTEGER,
      isAdmin: DataTypes.BOOLEAN
    },
    {}
  );
  User.associate = function(models) {
    // associations can be defined here
    User.hasMany(models.ProjectGroup, { as: "ProjectGroups" });
    User.hasMany(models.Post, { as: "Posts" });
    User.belongsTo(models.Role, { as: "Role" });
    User.belongsTo(models.Position, { as: "Position" });
    User.belongsTo(models.Organization, { as: "Organization" });
  };
  return User;
};
