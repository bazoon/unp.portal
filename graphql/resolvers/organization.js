const models = require("../../models");

module.exports = {
  Query: {
    organizations: async (root, input, { user }) => {
      const organizations = await models.Organization.findAll();
      return organizations.map(o => {
        return {
          id: o.id,
          name: o.name,
          fullName: o.FullName,
          inn: o.inn
        };
      });
    }
  },
  Mutation: {
    createOrganization: async (root, { input }, { user }) => {
      if (!user.isAdmin) throw Error("Not authorized!");
      const { name, inn } = input;
      const organization = await models.Organization.create({
        name,
        inn
      });

      return {
        id: organization.id,
        name,
        inn
      };
    },
    editOrganization: async (root, { input }, { user }) => {
      if (!user.isAdmin) throw Error("Not authorized!");
      const { id, name, inn } = input;
      const organization = await models.Organization.findOne({
        where: {
          id
        }
      });

      await organization.update({
        name,
        inn
      });

      return {
        id: organization.id,
        name,
        inn
      };
    }
  }
};
