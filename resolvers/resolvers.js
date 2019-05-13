const models = require("../models");
const getUploadFilePath = require("../utils/getUploadFilePath");
const pick = require("lodash/pick");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const uploadStreams = require("../utils/uploadStreams");

const { getGroups } = require("../utils/db");

const Query = {
  users: async (root, input, { user }) => {
    const users = await models.User.findAll();
    return users.map(u => {
      return {
        id: u.id,
        avatar: getUploadFilePath(u.avatar),
        Position: u.Position,
        name: u.name
      };
    });
  },
  projectGroups: async (root, input, { user }) => {
    const query = `select "ProjectGroups"."title", "ProjectGroups"."avatar", "ProjectGroups"."id", is_open from
              "ProjectGroups"`;

    const countQuery = `select "ProjectGroups"."id", count(*) from "ProjectGroups", "Participants"
                    where ("ProjectGroups"."id" = "Participants"."ProjectGroupId")
                    group by "ProjectGroups"."id"`;
    return await getGroups(user.id, query, countQuery);
  }
};

const Mutation = {
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
        [Op.and]: [{ UserId: user.id }, { ProjectGroupId: groupId }]
      }
    });

    const notificationPromise = models.NotificationPreference.destroy({
      where: { UserId: user.id, SourceId: groupId }
    });

    const result = await Promise.all([participantPromise, notificationPromise]);
    return {
      id: groupId,
      title: "Fpp"
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
};

ProjectGroup = {
  user: async projectGroup => {
    const user = await models.User.findOne({
      where: { id: projectGroup.userId }
    });
    return user;
  }
};

module.exports = { Query, Mutation, ProjectGroup };
