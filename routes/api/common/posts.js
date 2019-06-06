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
  const userQuery = `select users.name, users.avatar, users.position_id, positions.name as position
                    from users, positions
                    where users.id=${userId} and users.position_id = positions.id
                    `;

  await uploadFiles(files);

  const post = await models.Post.create({
    text,
    groupId: groupId,
    conversationId: conversationId,
    userId: userId,
    parentId: postId
  });

  const createdFiles = await models.File.bulkCreate(
    files.map(file => ({
      file: file.name,
      size: file.size,
      postId: postId
    })),
    { returning: true }
  );

  const users = await models.sequelize.query(userQuery);
  const user = users[0][0];

  return {
    id: post.id,
    parentId: post.parentId && post.parentId,
    text: post.text,
    avatar: getUploadFilePath(user.avatar),
    userName: user.name,
    position: user.position,
    createdAt: post.createdAt,
    files: files.map(f => ({
      name: getUploadFilePath(f.name),
      size: f.size
    })),
    children: []
  };
};

const getPosts = async function getPosts(query) {
  const posts = (await models.sequelize.query(query))[0];

  const postFilesPromises = posts.map(async post => {
    const filesQuery = `select files.id, files.file, files.size
                        from files
                        where files.post_id = ${post.id}`;
    const files = await models.sequelize.query(filesQuery).then(f => f[0]);

    return {
      id: post.id,
      parentId: post.parent_id && post.parent_id,
      text: post.text,
      avatar: getUploadFilePath(post.avatar),
      userName: post.name,
      position: post.position,
      createdAt: post.created_at,
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
      // console.log(postsLookup);
      // console.log("=======================");
      // console.log(post.parentId, parentPost);
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
