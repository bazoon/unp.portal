"use strict";
module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define(
    "Conversation",
    {
      title: DataTypes.STRING,
      ProjectGroupId: DataTypes.INTEGER
    },
    {}
  );
  Conversation.associate = function(models) {
    // associations can be defined here
    Conversation.belongsTo(models.ProjectGroup);
  };
  return Conversation;
};
