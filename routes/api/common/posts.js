const models = require("../../../models");
const Sequelize = require("sequelize");
const getUploadFilePath = require("../../../utils/getUploadFilePath");
const uploadFiles = require("../../../utils/uploadFiles");

const createPost = async function createPost({
  text,
  groupId,
  userId,
  postId,
  conversationId,
  files
}) {
  const userQuery = `select "Users"."name", "Users"."avatar", "Users"."Position"
                    from "Users"
                    where "Users"."id"=${userId}`;

  await uploadFiles(files);

  const post = await models.Post.create({
    text,
    GroupId: groupId,
    ConversationId: conversationId,
    UserId: userId,
    ParentId: postId
  });

  const createdFiles = await models.File.bulkCreate(
    files.map(file => ({
      file: file.name,
      size: file.size,
      type: "post",
      entityId: post.id
    })),
    { returning: true }
  );

  const users = await models.sequelize.query(userQuery);
  const user = users[0][0];

  return {
    id: post.id,
    parentId: post.ParentId,
    text: post.text,
    avatar: getUploadFilePath(user.avatar),
    userName: user.name,
    position: user.Position,
    createdAt: post.createdAt,
    files: files.map(f => ({ name: getUploadFilePath(f.name), size: f.size })),
    children: []
  };
};

const getPosts = async function getPosts(query) {
  const posts = (await models.sequelize.query(query))[0];

  const postFilesPromises = posts.map(async post => {
    const filesQuery = `select "Files"."id", "Files"."file", "Files"."size"
                        from "Files"
                        where ("Files"."type" = 'post') and "Files"."entityId" = ${
                          post.id
                        }`;
    const files = await models.sequelize.query(filesQuery).then(f => f[0]);

    return {
      id: post.id,
      parentId: post.ParentId,
      text: post.text,
      avatar: getUploadFilePath(post.avatar),
      userName: post.name,
      position: post.Position,
      createdAt: post.createdAt,
      files: files.map(pf => ({
        name: getUploadFilePath(pf.file),
        size: pf.size
      }))
    };
  });

  const extendedPosts = await Promise.all(postFilesPromises);

  const postsLookup = {};

  extendedPosts.forEach(post => {
    postsLookup[post.id] = post;
  });

  return extendedPosts.reduce((acc, post) => {
    post.children = post.children || [];
    if (post.parentId) {
      const parentPost = postsLookup[post.parentId];
      parentPost.children = parentPost.children || [];
      parentPost.children.push(post);

      return acc;
    }
    return acc.concat([post]);
  }, []);
};

module.exports = {
  createPost,
  getPosts
};
