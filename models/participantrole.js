'use strict';
module.exports = (sequelize, DataTypes) => {
  const ParticipantRole = sequelize.define('ParticipantRole', {
    name: DataTypes.STRING,
    level: DataTypes.INTEGER
  }, {});
  ParticipantRole.associate = function(models) {
    // associations can be defined here
  };
  return ParticipantRole;
};