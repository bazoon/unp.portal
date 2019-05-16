const models = require("../models");
const getUploadFilePath = require("../utils/getUploadFilePath");
const pick = require("lodash/pick");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const uploadStreams = require("../utils/uploadStreams");
const bcrypt = require("bcryptjs");

const { getGroups } = require("../utils/db");

const Query = {
  // Admin
  users: async (root, input, { user }) => {
    if (!user.isAdmin) throw Error("Unauthorized!");
    const users = await models.User.findAll();

    return users.map(u => {
      return {
        id: u.id,
        isAdmin: u.isAdmin,
        avatar: getUploadFilePath(u.avatar),
        name: u.name,
        login: u.login,
        positionId: u.PositionId,
        roleId: u.RoleId,
        organizationId: u.OrganizationId
      };
    });
  },
  getUser: async (root, { id }, { user }) => {
    if (!user.isAdmin) throw Error("Unauthorized!");
    const u = await models.User.findOne({ where: { id } });
    return {
      id: u.id,
      isAdmin: u.isAdmin,
      avatar: getUploadFilePath(u.avatar),
      name: u.name,
      login: u.login,
      positionId: u.PositionId,
      roleId: u.RoleId,
      organizationId: u.OrganizationId
    };
  },
  projectGroups: async (root, input, { user }) => {
    const query = `select "ProjectGroups"."title", "ProjectGroups"."avatar", "ProjectGroups"."id", is_open from
              "ProjectGroups"`;

    const countQuery = `select "ProjectGroups"."id", count(*) from "ProjectGroups", "Participants"
                    where ("ProjectGroups"."id" = "Participants"."ProjectGroupId")
                    group by "ProjectGroups"."id"`;
    return await getGroups(user.id, query, countQuery);
  },
  organizations: async (root, input, { user }) => {
    const organizations = await models.Organization.findAll();
    return organizations.map(o => {
      return {
        id: o.id,
        name: o.name,
        fullName: o.FullName
      };
    });
  },
  positions: async (root, input, { user }) => {
    const positions = await models.Position.findAll();
    return positions.map(p => {
      return {
        id: p.id,
        name: p.name
      };
    });
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
  },
  createUser: async (root, { input }, { user }) => {
    if (!user.isAdmin) throw Error("Not authorized!");

    const {
      name,
      login,
      avatar,
      positionId,
      organizationId,
      password,
      isAdmin
    } = input;

    const newUser = await models.User.create({
      name,
      login,
      avatar,
      isAdmin,
      OrganizationId: organizationId,
      PositionId: positionId,
      password: bcrypt.hashSync(password, 8)
    });

    return {
      id: newUser.id,
      isAdmin: newUser.isAdmin,
      name: newUser.name,
      login: newUser.login,
      avatar: newUser.avatar,
      organizationId: newUser.OrganizationId,
      positionId: newUser.PositionId
    };
  },
  deleteUser: async (root, { id }, { user }) => {
    if (!user.isAdmin) throw Error("Not authorized!");
    await models.User.destroy({ where: { id } });
    return id;
  },
  editUser: async (root, { input }, { user }) => {
    if (!user.isAdmin) throw Error("Not authorized!");

    const {
      id,
      name,
      login,
      avatar,
      positionId,
      organizationId,
      password,
      isAdmin
    } = input;

    const newUser = await models.User.findOne({
      where: { id }
    });

    newUser.update({
      name,
      login,
      avatar,
      isAdmin,
      OrganizationId: organizationId,
      PositionId: positionId
    });

    if (password) {
      newUser.update({
        password: bcrypt.hashSync(password, 8)
      });
    }

    return {
      id: newUser.id,
      isAdmin: newUser.isAdmin,
      name: newUser.name,
      login: newUser.login,
      avatar: newUser.avatar,
      organizationId: newUser.OrganizationId,
      positionId: newUser.PositionId
    };
  }
};

const User = {
  role: async user => {
    const role = await models.Role.findOne({
      where: { id: user.roleId }
    });
    if (!role) return null;
    return {
      id: role.id,
      name: role.name
    };
  },
  position: async user => {
    const position = await models.Position.findOne({
      where: { id: user.positionId }
    });
    if (!position) return null;
    return {
      id: position.id,
      name: position.name
    };
  },
  organization: async user => {
    const organization = await models.Organization.findOne({
      where: { id: user.organizationId }
    });
    if (!organization) return null;
    return {
      id: organization.id,
      name: organization.name,
      fullName: organization.FullName,
      address: organization.address
    };
  }
};

const ProjectGroup = {
  user: async projectGroup => {
    const user = await models.User.findOne({
      where: { id: projectGroup.userId }
    });
    return user;
  }
};

module.exports = { Query, Mutation, ProjectGroup, User };
