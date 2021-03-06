const models = require("../../../models");
const Sequelize = require("sequelize");
const getUploadFilePath = require("../../../utils/getUploadFilePath");
const uploadFiles = require("../../../utils/uploadFiles");
const { fileOwners } = require("../../../utils/constants");
const notificationService = require("../../../utils/notifications");
const { getGroupUsersIds, getGroupAdminsIds } = require("./groups");
const {
  NotFoundRecordError,
  NotAuthorizedError
} = require("../../../utils/errors");

const createPost = async function createPost({
  text,
  groupId,
  userId,
  postId,
  conversationId,
  files
}) {
  const userQuery = `select users.name, users.avatar, users.position_id, positions.name as position
                    from users
                    left join positions on users.position_id = positions.id
                    where users.id=:userId
                    `;
  let transaction;

  try {
    transaction = await models.sequelize.transaction();
    await uploadFiles(files);

    const post = await models.Post.create(
      {
        text,
        groupId: groupId,
        conversationId: conversationId,
        userId: userId,
        parentId: postId,
        userId
      },
      { transaction }
    );

    const users = await models.sequelize.query(userQuery, {
      replacements: {
        userId
      },
      transaction
    });

    const user = users[0][0];

    // notification

    const conversation = await models.Conversation.findOne({
      where: {
        id: conversationId
      },
      transaction
    });

    if (!conversation) {
      throw new NotFoundRecordError("Conversation not found");
    }

    const group = await models.ProjectGroup.findOne({
      where: {
        id: conversation.projectGroupId
      },
      transaction
    });

    if (!group) {
      throw new NotFoundRecordError("Group not found");
    }

    await notificationService.postCreated({
      userId,
      userName: user.name,
      conversationId,
      groupId: conversation.projectGroupId,
      groupTitle: group.title,
      conversationTitle: conversation.title,
      recipientsIds: await getGroupUsersIds(conversation.projectGroupId),
      text,
      transaction
    });

    //

    const createdFiles = await models.File.bulkCreate(
      files.map(file => ({
        file: file.name,
        size: file.size,
        entityType: fileOwners.post,
        entityId: postId
      })),
      { returning: true, transaction }
    );

    await transaction.commit();

    return {
      id: post.id,
      parentId: post.parentId && post.parentId,
      text: post.text,
      avatar: getUploadFilePath(user.avatar) || "",
      userName: user.name,
      position: user.position || "",
      createdAt: post.createdAt,
      files: createdFiles.map(f => ({
        id: f.id,
        name: getUploadFilePath(f.file),
        size: f.size
      })),
      children: []
    };
  } catch (e) {
    await transaction.rollback();
    throw e;
  }
};

const getPosts = async function getPosts(query, id, transaction) {
  const posts = (await models.sequelize.query(query, {
    replacements: {
      id
    },
    transaction
  }))[0];

  const postFilesPromises = posts.map(async post => {
    const filesQuery = `select files.id, files.file, files.size
                        from files
                        where files.entity_id = :postId`;
    const files = await models.sequelize
      .query(filesQuery, {
        replacements: {
          postId: post.id
        },
        transaction
      })
      .then(f => f[0]);

    return {
      id: post.id,
      parentId: post.parent_id && post.parent_id,
      text: post.text,
      avatar: getUploadFilePath(post.avatar),
      userName: post.name,
      position: post.position,
      createdAt: post.created_at,
      files: files.map(pf => ({
        id: pf.id,
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
