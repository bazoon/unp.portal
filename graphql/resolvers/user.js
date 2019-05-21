const models = require("../../models");
const getUploadFilePath = require("../../utils/getUploadFilePath");
const bcrypt = require("bcryptjs");

module.exports = {
  Query: {
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
    }
  },
  Mutation: {
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
  },
  User: {
    // role: async user => {
    //   const role = await models.Role.findOne({
    //     where: { id: user.roleId }
    //   });
    //   if (!role) return null;
    //   return {
    //     id: role.id,
    //     name: role.name
    //   };
    // },
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
  }
};
