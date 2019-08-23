const moment = require("moment-timezone");
const Router = require("koa-router");
const router = new Router();
const koaBody = require("koa-body");
const fs = require("fs");
const models = require("../../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const uploadFiles = require("../../utils/uploadFiles");
const notificationService = require("../../utils/notifications");
const { fileOwners } = require("../../utils/constants");
const getUploadFilePath = require("../../utils/getUploadFilePath");
const eventReminder = require("../../utils/eventReminder");
const {
  NotFoundRecordError,
  NotAuthorizedError
} = require("../../utils/errors");

router.post("/", koaBody({ multipart: true }), async ctx => {
  const {
    title,
    description,
    accessType,
    accessEntitiesIds,
    date,
    remind
  } = ctx.request.body;

  const userId = ctx.user.id;
  const { file } = ctx.request.files;
  const files = file ? (Array.isArray(file) ? file : [file]) : [];
  await uploadFiles(files);
  let transaction;

  try {
    transaction = await models.sequelize.transaction();

    const event = await models.Event.create(
      {
        title,
        description,
        userId,
        startDate: date,
        remind,
        accessType
      },
      { transaction }
    );

    const remindAt = moment(date);
    remindAt.subtract(moment.duration(+remind, "m"));
    const delay = remindAt.diff(moment());
    let recipientsIds = [];

    await models.File.bulkCreate(
      files.map(file => {
        return {
          userId,
          file: file.name,
          entityType: fileOwners.event,
          entityId: event.id,
          size: file.size
        };
      }),
      { transaction }
    );

    let accessIds = accessEntitiesIds ? accessEntitiesIds.split(",") : [];

    if (accessType == 1) {
      accessIds = Array.from(new Set(accessIds));
      recipientsIds = accessIds;

      await models.EventAccess.bulkCreate(
        accessIds.map(id => {
          return {
            eventId: event.id,
            userId: id
          };
        }),
        { transaction }
      );
    } else if (accessType == 2) {
      const usersQuery = `select distinct user_id from participants where project_group_id in (:accessEntitiesIds)`;
      const users = (await models.sequelize.query(usersQuery, {
        replacements: {
          accessEntitiesIds: accessIds
        },
        transaction
      }))[0];

      await models.EventAccess.bulkCreate(
        accessIds.map(id => {
          return {
            eventId: event.id,
            groupId: id
          };
        }),
        { transaction }
      );

      recipientsIds = Array.from(
        new Set(recipientsIds.concat(users.map(u => u.user_id)))
      );
    }

    // notifications
    await notificationService.eventCreated({
      userId,
      title: event.title,
      eventId: event.id,
      recipientsIds,
      transaction
    });

    // reminders
    if (remind) {
      eventReminder.remind({ title, description, date }, recipientsIds, delay);
    }
    await transaction.commit();
    ctx.body = event;
  } catch (e) {
    await transaction.rollback();
    ctx.body = e.message;
    ctx.status = e.status || 500;
  }
});

router.put("/:id", async ctx => {
  let {
    title,
    description,
    accessType,
    accessEntitiesIds,
    date,
    remind
  } = ctx.request.body;
  const { id } = ctx.params;
  const userId = ctx.user.id;
  const event = await models.Event.findOne({ where: { id } });
  let transaction;

  try {
    transaction = await models.sequelize.transaction();

    await event.update(
      {
        title,
        description,
        userId,
        startDate: date,
        remind,
        accessType
      },
      { transaction }
    );

    await models.EventAccess.destroy({
      where: {
        eventId: id
      },
      transaction
    });

    if (accessType == 1) {
      accessEntitiesIds.push(userId);
      accessEntitiesIds = Array.from(new Set(accessEntitiesIds));
      recipientsIds = accessEntitiesIds;

      await models.EventAccess.bulkCreate(
        accessEntitiesIds.map(id => {
          return {
            eventId: event.id,
            userId: id
          };
        }),
        { transaction }
      );

      await notificationService.eventUpdated({
        userId,
        title: event.title,
        eventId: event.id,
        recipientsIds: accessEntitiesIds.concat([userId]),
        transaction
      });
    } else if (accessType == 2) {
      const usersQuery = `select distinct user_id from participants where project_group_id in (:accessEntitiesIds)`;
      const users = (await models.sequelize.query(usersQuery, {
        replacements: {
          accessEntitiesIds: accessEntitiesIds
        },
        transaction
      }))[0];

      await models.EventAccess.bulkCreate(
        accessEntitiesIds.map(id => {
          return {
            eventId: event.id,
            groupId: id
          };
        }),
        { transaction }
      );

      await models.EventAccess.findOrCreate({
        where: {
          [Op.and]: [{ eventId: event.id }, { userId }]
        },
        defaults: {
          eventId: event.id,
          userId
        },
        transaction
      });

      await notificationService.eventUpdated({
        userId,
        title: event.title,
        eventId: event.id,
        recipientsIds: users.map(u => u.id).concat([userId]),
        transaction
      });
    }

    await transaction.commit();
    ctx.body = event;
  } catch (e) {
    await transaction.rollback();
    ctx.body = e.message;
    ctx.status = e.status || 500;
  }
});

// router.get("/list", async (ctx, next) => {
//   const { page, pageSize } = ctx.request.query;
//   const userId = ctx.user.id;
//   const now = newDate();
//   const from = moment(now);
//   from.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
//   from.tz("Etc/GMT-0");

//   const to = moment(now).endOf("month");
//   to.set({ hour: 23, minute: 59, second: 59, millisecond: 999 });
//   to.tz("Etc/GMT-0");

//   const events = await getEvents(userId, from, to);

router.get("/search/:query", async (ctx, next) => {
  const { query } = ctx.params;
  let searchResults = [];

  if (query) {
    searchResults = await models.sequelize.query(
      ` select *
        from events
        where _search @@ to_tsquery(:query)`,
      {
        model: models.ProjectGroup,
        replacements: { query: `${query} | ${query}:*` }
      }
    );
  }
  ctx.body = searchResults;
});

router.get("/", async (ctx, next) => {
  const { page, pageSize } = ctx.request.query;
  const { id: userId, isAdmin } = ctx.user;
  let transaction;

  try {
    transaction = await models.sequelize.transaction();
    const events = await getEvents({
      userId,
      isAdmin,
      page,
      pageSize,
      transaction
    });
    await transaction.commit();
    ctx.body = events;
  } catch (e) {
    await transaction.rollback();
    ctx.body = e.message;
    ctx.status = e.status || 500;
  }
});

router.get("/upcoming", async (ctx, next) => {
  const { id: userId, isAdmin } = ctx.user;
  const { date } = ctx.request.query;
  const from = (date && moment(date)) || moment(new Date());
  from.tz("Etc/GMT-0");
  from.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  let transaction;

  try {
    transaction = await models.sequelize.transaction();

    const query = `select *from events where (id in (select event_id from event_accesses 
              where ((group_id in (select project_group_id from participants where user_id = :userId)) or 
              (event_accesses.user_id = :userId)) or events.user_id = :userId) or (events.access_type=0)) and
              start_date >= :from::date
              order by events.start_date asc
              limit 5`;

    const events = (await models.sequelize.query(query, {
      replacements: {
        userId,
        from: from.toString()
      },
      transaction
    }))[0];

    const fullEvents = await Promise.all(
      getFullEvents({ events, userId, isAdmin, transaction })
    );

    await transaction.commit();
    ctx.body = fullEvents;
  } catch (e) {
    await transaction.rollback();
    ctx.body = e.message;
    ctx.status = e.status || 500;
  }
});

async function getEvents({
  userId,
  from,
  to,
  page,
  pageSize,
  isAdmin,
  transaction
}) {
  let query, countQuery;
  const offset = (page - 1) * pageSize;
  const limit = pageSize;

  countQuery = `select count(*) from events where id in (select event_id from event_accesses 
                where (group_id in (select project_group_id from participants where user_id = :userId)) or 
                (event_accesses.user_id = :userId)) or user_id = :userId or access_type=0
              `;

  query = `select *from events where id in (select event_id from event_accesses 
            where (group_id in (select project_group_id from participants where user_id = :userId)) or 
            (event_accesses.user_id = :userId)) or user_id = :userId or access_type=0
            order by events.start_date asc
            limit :limit offset :offset`;

  const [events] = await models.sequelize.query(query, {
    replacements: {
      userId,
      limit,
      offset
    },
    transaction
  });

  const total = +(await models.sequelize.query(countQuery, {
    replacements: {
      userId,
      limit,
      offset
    },
    transaction
  }))[0][0].count;

  return {
    events: await Promise.all(
      getFullEvents({ events, userId, isAdmin, transaction })
    ),
    pagination: {
      total: total
    }
  };
}

function getFullEvents({ events, userId, isAdmin, transaction }) {
  return events.map(async event => {
    const query = `select id, title as name from project_groups where id in 
                  (select group_id from event_accesses where event_id = :eventId)
                  union
                  (select id, name from users where id in 
                  (select user_id from event_accesses where event_id = :eventId))
                  order by name`;

    const [eventParticipants] = await models.sequelize.query(query, {
      replacements: {
        eventId: event.id
      },
      transaction
    });

    return {
      id: event.id,
      title: event.title,
      canEdit: isAdmin || userId == event.user_id,
      description: event.description,
      startDate: event.start_date,
      remind: event.remind,
      usersCount: 0,
      participants: eventParticipants,
      isPublic: event.access_type === 0
    };
  });
}

router.get("/:id", async (ctx, next) => {
  const userId = ctx.user.id;
  const { id } = ctx.params;
  let transaction;

  try {
    transaction = await models.sequelize.transaction();

    const event = await models.Event.findOne({
      where: {
        id
      },
      transaction
    });

    if (!event) {
      throw new NotFoundRecordError("Event not found");
    }

    const user = await models.User.findOne({
      where: { id: event.userId },
      transaction
    });

    if (!user) {
      throw new NotFoundRecordError("User not found");
    }

    const files = await models.File.findAll({
      where: {
        [Op.or]: [
          {
            entityId: event.id
          },
          {
            entityType: fileOwners.event
          }
        ]
      },
      transaction
    });

    let query;

    if (event.accessType == 1) {
      query = `select id, user_id, group_id from event_accesses 
                 where user_id is not null and event_id=:eventId`;
    } else {
      query = `select id, user_id, group_id from event_accesses 
                 where group_id is not null and event_id=:eventId`;
    }

    const [eventAccesses] = await models.sequelize.query(query, {
      replacements: {
        eventId: id
      },
      transaction
    });

    await transaction.commit();

    ctx.body = {
      id: event.id,
      userId: event.UserId,
      userName: user.name,
      canEdit: event.userId == userId,
      userAvatar: getUploadFilePath(user.avatar),
      description: event.description,
      remind: event.remind,
      startDate: event.startDate,
      title: event.title,
      files: files.map(file => {
        return {
          id: file.id,
          name: file.file,
          url: getUploadFilePath(file.file)
        };
      }),
      accessType: event.accessType,
      accesses: eventAccesses.map(ea => ({
        id: ea.id,
        userId: ea.user_id,
        groupId: ea.group_id
      }))
    };
  } catch (e) {
    await transaction.rollback();
    ctx.body = e.message;
    ctx.status = e.status || 500;
  }
});

router.delete("/files", async ctx => {
  const { fileId } = ctx.request.query;
  await models.File.destroy({
    where: {
      id: fileId
    }
  });
  ctx.body = fileId;
});

router.delete("/:id", async (ctx, next) => {
  const { id } = ctx.params;
  const userId = ctx.user.id;
  let transaction;

  try {
    transaction = await models.sequelize.transaction();

    const canEdit = await canEditEvent(id, ctx);
    if (!canEdit) {
      throw new NotAuthorizedError();
    }

    // Notifications
    const event = await models.Event.findOne({
      where: {
        id
      }
    });

    if (!event) {
      throw new NotFoundRecordError("Event not found");
    }

    const recipientsIds = await models.UserEvent.findAll({
      where: {
        eventId: id
      }
    }).map(e => e.userId);

    await notificationService.eventRemoved({
      userId,
      title: event.title,
      eventId: event.id,
      recipientsIds: recipientsIds,
      transaction
    });

    // end

    await models.Event.destroy({
      where: {
        id
      },
      transaction
    });

    await models.UserEvent.destroy({
      where: {
        eventId: id
      },
      transaction
    });

    await transaction.commit();
    ctx.body = "ok";
  } catch (e) {
    await transaction.rollback();
    ctx.body = e.message;
    ctx.status = e.status || 500;
  }
});

router.post("/files", koaBody({ multipart: true }), async ctx => {
  const userId = ctx.user.id;
  const { eventId } = ctx.request.body;
  const { file } = ctx.request.files;
  const docs = file ? (Array.isArray(file) ? file : [file]) : [];
  await uploadFiles(docs);

  const files = await models.File.bulkCreate(
    docs.map(doc => {
      return {
        userId,
        file: doc.name,
        entityType: fileOwners.event,
        entityId: eventId,
        size: doc.size
      };
    }),
    { returning: true }
  );
  ctx.body = files.map(f => ({
    id: f.id,
    name: f.file,
    url: getUploadFilePath(f.file),
    size: f.size
  }));
});

module.exports = router;

async function canEditEvent(eventId, ctx) {
  const userId = ctx.user.id;

  const user = await models.User.findOne({
    where: {
      id: userId
    }
  });

  const event = await models.Event.findOne({
    where: {
      id: eventId
    }
  });

  if (!(user.isAdmin || event.userId === userId)) {
    ctx.status = 403;
    ctx.body = "Unauthorized!";
    return false;
  }

  return true;
}
