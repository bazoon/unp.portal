const models = require("../../models");

module.exports = {
  Query: {
    positions: async (root, input, { user }) => {
      const positions = await models.Position.findAll();
      return positions.map(p => {
        return {
          id: p.id,
          name: p.name
        };
      });
    }
  },
  Mutation: {
    createPosition: async (root, { input }, { user }) => {
      if (!user.isAdmin) throw Error("Not authorized!");
      const { name } = input;
      const position = await models.Position.create({
        name
      });

      return {
        id: position.id,
        name
      };
    },
    editPosition: async (root, { input }, { user }) => {
      if (!user.isAdmin) throw Error("Not authorized!");
      const { id, name } = input;
      const position = await models.Position.findOne({
        where: {
          id
        }
      });

      await position.update({
        name
      });

      return {
        id: position.id,
        name
      };
    }
  }
};
