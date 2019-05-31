"use strict";
module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define(
    "Conversation",
    {
      title: DataTypes.STRING,
      projectGroupId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      description: DataTypes.TEXT,
      isCommentable: DataTypes.BOOLEAN,
      isPinned: DataTypes.BOOLEAN
    },
    {}
  );
  Conversation.associate = function(models) {
    // associations can be defined here
    Conversation.belongsTo(models.ProjectGroup);
  };
  return Conversation;
};
