const models = require("../../models");
const uploadStreams = require("../../utils/uploadStreams");

module.exports = {
  Query: {
    getOwnFiles: async (root, { input }, { user }) => {
      const files = await models.File.findAll({ where: { UserId: user.id } });
      return files.map(f => {
        return {
          id: f.id,
          userId: f.UserId,
          postId: f.PostId,
          groupId: f.GroupId,
          messageId: f.MessageId,
          file: f.file,
          size: f.size
        };
      });
    }
  },
  Mutation: {
    uploadFiles: async (root, { input }, { user }) => {
      const { userIds, postId, groupId, messageId, files, fileSizes } = input;
      const readyFiles = await Promise.all(files);

      readyFiles.forEach(async (file, index) => {
        var { createReadStream, filename, mimetype, encoding } = file;
        uploadStreams({ stream: createReadStream(), filename });
      });

      const createdFiles = await models.File.bulkCreate(
        readyFiles.map((f, index) => {
          return {
            userId: user.id,
            postId,
            groupId,
            messageId,
            file: f.filename,
            size: fileSizes[index]
          };
        }),
        { returning: true }
      );

      userIds.forEach(async userId => {
        await models.FileAccess.bulkCreate(
          createdFiles.map(file => {
            return {
              UserId: userId,
              FileId: file.id
            };
          })
        );
      });

      return createdFiles;
    }
  }
};
