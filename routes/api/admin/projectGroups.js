const Router = require("koa-router");
const router = new Router();
const koaBody = require("koa-body");
const fs = require("fs");
const models = require("../../../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const getUploadFilePath = require("../../../utils/getUploadFilePath");

router.get("/user", async (ctx, next) => {
  const { isAdmin } = ctx.user;
  // if (!isAdmin) {
  //   ctx.status = 403;
  //   ctx.body = "Not authorized!";
  //   return;
  // }

  const { page, pageSize, id } = ctx.request.query;
  const userId = ctx.user.id;
  const offset = (page - 1) * pageSize;
  const limit = pageSize;

  const query = `select title, avatar, id, is_open, user_id from
              project_groups 
              where id in (select project_group_id from participants where user_id = ${id})
              limit :limit offset :offset`;

  const countQuery = `select count(id) from
              project_groups 
              where id in (select project_group_id from participants where user_id = :id)
              `;

  const groupsResult = await models.sequelize.query(query, {
    replacements: {
      limit,
      offset
    }
  });

  const groupsCount = +(await models.sequelize.query(countQuery, {
    replacements: {
      id
    }
  }))[0][0].count;

  const groups = groupsResult[0].map(async group => {
    const participantsQuery = `select count(*) from participants where project_group_id=:groupId`;

    const conversationsQuery = `select count(*) from conversations where project_group_id=:groupId`;

    const participant = await models.Participant.findOne({
      where: {
        [Op.and]: [{ UserId: userId }, { ProjectGroupId: group.id }]
      }
    });

    const participantsResult = await models.sequelize.query(participantsQuery, {
      replacements: {
        groupId: group.id
      }
    });
    const conversationsResult = await models.sequelize.query(
      conversationsQuery,
      {
        replacements: {
          groupId: group.id
        }
      }
    );

    return {
      id: group.id,
      isOpen: group.is_open,
      title: group.title,
      avatar: getUploadFilePath(group.avatar) || "",
      isOpen: group.is_open,
      participantsCount: +participantsResult[0][0].count,
      conversationsCount: +conversationsResult[0][0].count,
      participant: participant !== null,
      state: (participant && participant.state) || 0,
      isAdmin: Boolean(participant && participant.isAdmin),
      files: [],
      participants: [],
      conversations: []
    };
  });

  const g = await Promise.all(groups);

  ctx.body = {
    groups: g,
    pagination: {
      total: groupsCount
    }
  };
});

module.exports = router;
