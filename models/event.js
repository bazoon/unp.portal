"use strict";
module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define(
    "Event",
    {
      userId: DataTypes.INTEGER,
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      startDate: DataTypes.DATE,
      remindAt: DataTypes.DATE
    },
    {}
  );
  Event.associate = function(models) {
    // associations can be defined here
    Event.hasMany(models.UserEvent, { as: "UserEvents" });
    Event.belongsTo(models.User);
  };
  return Event;
};
