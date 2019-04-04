"use strict";
module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define(
    "Comment",
    {
      comment: DataTypes.STRING,
      PostId: DataTypes.INTEGER,
      UserId: DataTypes.INTEGER
    },
    {}
  );
  Comment.associate = function(models) {
    // associations can be defined here
    Comment.belongsTo(models.Post);
    Comment.belongsTo(models.User);
    Comment.hasMany(models.CommentFile);
  };
  return Comment;
};
