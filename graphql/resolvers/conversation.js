const models = require("../../models");
const { getPosts } = require("../../routes/api/common/posts");

module.exports = {
  Query: {
    conversation: async (root, input, { user }) => {
      const { id } = input;

      const conversation = await models.Conversation.findOne({
        where: { id: id }
      });

      const query = `select posts.id, posts.parent_id, text, users.name,
                  users.avatar, users.position_id, posts.created_at, positions.name as position
                  from posts, users, positions
                  where (conversation_id=${id}) and (posts.user_id = users.id) and (users.position_id = positions.id)
                  order by posts.created_at asc`;

      const postsTree = await getPosts(query);

      return {
        title: conversation.title,
        postsTree
      };
    }
  },
  Mutation: {}
};
