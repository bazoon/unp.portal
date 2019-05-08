"use strict";
module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define(
    "Post",
    {
      text: DataTypes.STRING,
      ConversationId: DataTypes.INTEGER,
      UserId: DataTypes.INTEGER,
      ParentId: DataTypes.INTEGER,
      GroupId: DataTypes.INTEGER
    },
    {}
  );
  Post.associate = function(models) {
    // associations can be defined here
  };
  return Post;
};
