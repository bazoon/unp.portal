const models = require("../../../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

function getGroupUsersIds(projectGroupId) {
  return models.Participant.findAll({
    where: {
      projectGroupId
    }
  }).map(a => a.userId);
}

function getGroupAdminsIds(projectGroupId) {
  return models.Participant.findAll({
    where: {
      [Op.and]: [
        {
          projectGroupId
        },
        {
          isAdmin: true
        }
      ]
    }
  }).map(a => a.userId);
}

module.exports = {
  getGroupUsersIds,
  getGroupAdminsIds
};
