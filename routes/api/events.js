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

  console.log(ctx.request.body);
  const event = await models.Event.create({
    title,
    description,
    userId,
    startDate: date,
    remind,
    accessType
  });

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
    })
  );

  let accessIds = accessEntitiesIds ? accessEntitiesIds.split(",") : [];

  if (accessType == 1) {
    accessIds.push(userId);
    accessIds = Array.from(new Set(accessIds));
    recipientsIds = accessIds;

    await models.EventAccess.bulkCreate(
      accessIds.map(id => {
        return {
          eventId: event.id,
          userId: id
        };
      })
    );
  } else if (accessType == 2) {
    const usersQuery = `select distinct user_id from participants where project_group_id in (:accessEntitiesIds)`;
    const users = (await models.sequelize.query(usersQuery, {
      replacements: {
        accessEntitiesIds: accessIds
      }
    }))[0];

    await models.EventAccess.bulkCreate(
      accessIds.map(id => {
        return {
          eventId: event.id,
          groupId: id
        };
      })
    );

    await models.EventAccess.findOrCreate({
      where: {
        [Op.and]: [{ eventId: event.id }, { userId }]
      },
      defaults: {
        eventId: event.id,
        userId
      }
    });

    recipientsIds = Array.from(
      new Set(recipientsIds.concat(users.map(u => u.user_id)))
    );
  }

  // notifications
  await notificationService.eventCreated({
    userId,
    title: event.title,
    eventId: event.id,
    recipientsIds
  });

  // reminders
  if (remind) {
    eventReminder.remind({ title, description, date }, recipientsIds, delay);
  }

  ctx.body = event;
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

  await event.update({
    title,
    description,
    userId,
    startDate: date,
    remind,
    accessType
  });

  await models.EventAccess.destroy({
    where: {
      eventId: id
    }
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
      })
    );

    await notificationService.eventUpdated({
      userId,
      title: event.title,
      eventId: event.id,
      recipientsIds: accessEntitiesIds.concat([userId])
    });
  } else if (accessType == 2) {
    const usersQuery = `select distinct user_id from participants where project_group_id in (:accessEntitiesIds)`;
    const users = (await models.sequelize.query(usersQuery, {
      replacements: {
        accessEntitiesIds: accessEntitiesIds
      }
    }))[0];

    await models.EventAccess.bulkCreate(
      accessEntitiesIds.map(id => {
        return {
          eventId: event.id,
          groupId: id
        };
      })
    );

    await models.EventAccess.findOrCreate({
      where: {
        [Op.and]: [{ eventId: event.id }, { userId }]
      },
      defaults: {
        eventId: event.id,
        userId
      }
    });

    await notificationService.eventUpdated({
      userId,
      title: event.title,
      eventId: event.id,
      recipientsIds: users.map(u => u.id).concat([userId])
    });
  }

  ctx.body = event;
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

  const events = await getEvents({
    userId,
    isAdmin,
    page,
    pageSize
  });

  ctx.body = events;
});

router.get("/upcoming", async (ctx, next) => {
  const { id: userId, isAdmin } = ctx.user;
  const { date } = ctx.request.query;
  const from = (date && moment(date)) || moment(new Date());
  from.tz("Etc/GMT-0");
  from.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

  const query = `select *from events where id in (select event_id from event_accesses 
            where ((group_id in (select project_group_id from participants where user_id = :userId)) or 
            (event_accesses.user_id = :userId)) or events.user_id = :userId) and
            start_date >= :from::date
            order by events.start_date asc
            limit 5`;

  const events = (await models.sequelize.query(query, {
    replacements: {
      userId,
      from: from.toString()
    }
  }))[0];

  ctx.body = await Promise.all(getFullEvents({ events, userId, isAdmin }));
});

async function getEvents({ userId, from, to, page, pageSize, isAdmin }) {
  let query, countQuery;
  const offset = (page - 1) * pageSize;
  const limit = pageSize;

  if (from && to) {
    // countQuery = `select count(events.id)
    //               from events, user_events
    //               where events.id = user_events.event_id and user_events.user_id=${userId} and
    //               events.start_date BETWEEN '${from}' AND '${to}
    //               `;
    // query = `select events.id, title, description, start_date, remind_at
    //         from events, user_events
    //         where events.id = user_events.event_id and user_events.user_id=${userId} and
    //         events.start_date BETWEEN '${from}' AND '${to}'
    //         order by events.start_date asc
    //         limit ${limit} offset ${offset}`;
  } else {
    countQuery = `select count(*) from events where id in (select event_id from event_accesses 
                  where (group_id in (select project_group_id from participants where user_id = :userId)) or 
                  (event_accesses.user_id = :userId)) or user_id = :userId or access_type=0
                `;

    query = `select *from events where id in (select event_id from event_accesses 
            where (group_id in (select project_group_id from participants where user_id = :userId)) or 
            (event_accesses.user_id = :userId)) or user_id = :userId or access_type=0
            order by events.start_date asc
            limit :limit offset :offset`;
  }

  const [events] = await models.sequelize.query(query, {
    replacements: {
      userId,
      limit,
      offset
    }
  });

  const total = +(await models.sequelize.query(countQuery, {
    replacements: {
      userId,
      limit,
      offset
    }
  }))[0][0].count;

  return {
    events: await Promise.all(getFullEvents({ events, userId, isAdmin })),
    pagination: {
      total: total
    }
  };
}

function getFullEvents({ events, userId, isAdmin }) {
  return events.map(async event => {
    const query = `select id, title as name from project_groups where id in 
                  (select group_id from event_accesses where event_id = :eventId)
                  union
                  (select id, name from users where id in 
                  (select user_id from event_accesses where event_id = :eventId))`;

    const [eventParticipants] = await models.sequelize.query(query, {
      replacements: {
        eventId: event.id
      }
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

  const event = await models.Event.findOne({
    where: {
      id
    }
  });

  const user = await models.User.findOne({ where: { id: event.userId } });
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
    }
  });

  if (!event) {
    ctx.code = 404;
    return;
  }

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
    }
  });

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

  const canEdit = await canEditEvent(id, ctx);
  if (!canEdit) return;

  // Notifications

  const event = await models.Event.findOne({
    where: {
      id
    }
  });

  const recipientsIds = await models.UserEvent.findAll({
    where: {
      eventId: id
    }
  }).map(e => e.userId);

  await notificationService.eventRemoved({
    userId,
    title: event.title,
    eventId: event.id,
    recipientsIds: recipientsIds
  });

  // end

  await models.Event.destroy({
    where: {
      id
    }
  });

  await models.UserEvent.destroy({
    where: {
      eventId: id
    }
  });

  ctx.body = "ok";
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
