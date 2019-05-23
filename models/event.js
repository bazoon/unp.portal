"use strict";
module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define(
    "Event",
    {
      title: DataTypes.STRING,
      fromDate: DataTypes.DATE,
      toDate: DataTypes.DATE,
      place: DataTypes.STRING,
      description: DataTypes.TEXT,
      userId: DataTypes.INTEGER,
      allDay: DataTypes.BOOLEAN,
      remindBefore: DataTypes.INTEGER
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
