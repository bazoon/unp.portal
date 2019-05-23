"use strict";
module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define(
    "Post",
    {
      text: DataTypes.STRING,
      conversationId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      parentId: DataTypes.INTEGER,
      groupId: DataTypes.INTEGER
    },
    {}
  );
  Post.associate = function(models) {
    // associations can be defined here
    Post.belongsTo(models.User);
  };
  return Post;
};
