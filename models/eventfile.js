"use strict";
module.exports = (sequelize, DataTypes) => {
  const EventFile = sequelize.define(
    "EventFile",
    {
      EventId: DataTypes.INTEGER,
      file: DataTypes.STRING,
      size: DataTypes.INTEGER
    },
    {}
  );
  EventFile.associate = function(models) {
    // associations can be defined here
    models.EventFile.belongsTo(models.Event);
  };
  return EventFile;
};
