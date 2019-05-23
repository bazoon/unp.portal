const models = require("../../models");
const getUploadFilePath = require("../../utils/getUploadFilePath");
const pick = require("lodash/pick");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const uploadStreams = require("../../utils/uploadStreams");
const bcrypt = require("bcryptjs");
const { getGroups } = require("../../utils/db");

module.exports = {
  Query: {
    projectGroups: async (root, input, { user }) => {
      const query = `select project_groups.title, project_groups.avatar, project_groups.id, is_open from
              project_groups`;

      const countQuery = `select project_groups.id, count(*) from project_groups, participants
                    where (project_groups.id = participants.project_group_id)
                    group by project_groups.id`;
      return await getGroups(user.id, query, countQuery);
    }
  },
  Mutation: {
    subscribeToGroup: async (root, { groupId }, { user }) => {
      const participantPromise = models.Participant.create({
        ProjectGroupId: groupId,
        UserId: user.id
      });

      const notificationPromise = models.NotificationPreference.create({
        type: "Группа",
        SourceId: groupId,
        UserId: user.id,
        sms: false,
        push: false,
        email: false
      });

      await Promise.all([participantPromise, notificationPromise]);
      return {
        id: groupId,
        title: "Fpp"
      };
    },
    unsubscribeFromGroup: async (root, { groupId }, { user }) => {
      const participantPromise = models.Participant.destroy({
        where: {
          [Op.and]: [
            {
              user_id: user.id
            },
            {
              project_group_id: groupId
            }
          ]
        }
      });

      const notificationPromise = models.NotificationPreference.destroy({
        where: { user_id: user.id, source_id: groupId }
      });

      const result = await Promise.all([
        participantPromise,
        notificationPromise
      ]);

      return {
        id: groupId,
        title: ""
      };
    },
    createGroup: async (root, { input }, { user }) => {
      const { title, isOpen, description, file } = input;
      const fileResult = await file;
      if (fileResult) {
        var { createReadStream, filename, mimetype, encoding } = await file;
        uploadStreams({ stream: createReadStream(), filename });
      }

      const group = await models.ProjectGroup.create({
        title,
        avatar: filename,
        is_open: isOpen,
        description: description
      });

      await models.Participant.create({
        ProjectGroupId: group.id,
        UserId: user.id
      });

      return {
        id: group.id,
        title: group.title,
        avatar: getUploadFilePath(group.avatar),
        description: group.description,
        isOpen: group.is_open,
        participant: true,
        count: 1
      };
    }
  },
  ProjectGroup: {
    user: async projectGroup => {
      const user = await models.User.findOne({
        where: { id: projectGroup.userId }
      });
      return user;
    }
  }
};
