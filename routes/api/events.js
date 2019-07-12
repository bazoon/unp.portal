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
  let recipientsIds = [userId];

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

  const accessIds = accessEntitiesIds ? accessEntitiesIds.split(",") : [];
  if (accessType == 1) {
    recipientsIds = recipientsIds.concat(accessIds);
    await models.EventAccess.bulkCreate(
      accessIds.map(id => {
        return {
          eventId: event.id,
          entityId: id,
          accessType: 1
        };
      })
    );
  } else if (accessType == 2) {
    const usersQuery = `select distinct user_id from participants where project_group_id in (:accessEntitiesIds)`;
    const users = (await models.sequelize.query(usersQuery, {
      replacements: {
        accessEntitiesIds
      }
    }))[0];

    await models.EventAccess.bulkCreate(
      accessIds.map(id => {
        return {
          eventId: event.id,
          entityId: id,
          accessType: 2
        };
      })
    );

    recipientsIds = recipientsIds.concat(users.map(u => u.id).concat([userId]));
  }

  // notifications
  await notificationService.eventCreated({
    userId,
    title: event.title,
    eventId: event.id,
    recipientsIds
  });

  // reminders
  eventReminder.remind({ title, description, date }, recipientsIds, delay);

  await models.EventAccess.findOrCreate({
    where: {
      [Op.and]: [{ eventId: event.id }, { entityId: userId }]
    },
    defaults: {
      eventId: event.id,
      entityId: userId,
      accessType: 1
    }
  });

  ctx.body = event;
});

router.put("/:id", async ctx => {
  const {
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
    await models.EventAccess.bulkCreate(
      accessEntitiesIds.map(id => {
        return {
          eventId: event.id,
          entityId: id,
          accessType: 1
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
        accessEntitiesIds
      }
    }))[0];

    await models.EventAccess.bulkCreate(
      accessEntitiesIds.map(id => {
        return {
          eventId: event.id,
          entityId: id,
          accessType: 2
        };
      })
    );

    await notificationService.eventUpdated({
      userId,
      title: event.title,
      eventId: event.id,
      recipientsIds: users.map(u => u.id).concat([userId])
    });
  }

  await models.EventAccess.findOrCreate({
    where: {
      [Op.and]: [{ eventId: event.id }, { entityId: userId }]
    },
    defaults: {
      eventId: event.id,
      entityId: userId
    }
  });

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
//   ctx.body = events;
// });

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
  const userId = ctx.user.id;
  const events = await getEvents(userId, undefined, undefined, page, pageSize);
  ctx.body = events;
});

router.get("/upcoming", async (ctx, next) => {
  const userId = ctx.user.id;
  const { date } = ctx.request.query;
  const from = (date && moment(date)) || moment(new Date());
  from.tz("Etc/GMT-0");
  from.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

  const query = `select *from events where id in (select event_id from event_accesses 
            where ((access_type = 2 and entity_id in (select project_group_id from participants where user_id = :userId)) or 
            (access_type = 1 and entity_id = :userId)) or user_id = :userId) and
            start_date >= :from::date
            order by events.start_date asc
            limit 5`;

  const events = (await models.sequelize.query(query, {
    replacements: {
      userId,
      from: from.toString()
    }
  }))[0];

  ctx.body = await Promise.all(getFullEvents(events));
});

async function getEvents(userId, from, to, page, pageSize) {
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
            where (access_type = 2 and entity_id in (select project_group_id from participants where user_id = :userId)) or 
            (access_type = 1 and entity_id = :userId)) or user_id = :userId
            `;

    query = `select *from events where id in (select event_id from event_accesses 
            where (access_type = 2 and entity_id in (select project_group_id from participants where user_id = :userId)) or 
            (access_type = 1 and entity_id = :userId)) or user_id = :userId
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
    events: await Promise.all(getFullEvents(events)),
    pagination: {
      total: total
    }
  };
}

function getFullEvents(events) {
  return events.map(async event => {
    const groupsCountQuery = `select count(*) from participants where project_group_id in 
                      (select entity_id from event_accesses where event_id = :eventId and access_type = 2)`;
    const usersCountQuery = `select count(*) from event_accesses where access_type = 1 and event_id= :eventId`;

    const count =
      +(await models.sequelize.query(groupsCountQuery, {
        replacements: {
          eventId: event.id
        }
      }))[0][0].count +
      +(await models.sequelize.query(usersCountQuery, {
        replacements: {
          eventId: event.id
        }
      }))[0][0].count;

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.start_date,
      remind: event.remind,
      usersCount: count
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

  ctx.body = {
    id: event.id,
    userId: event.UserId,
    userName: user.name,
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
    accesses: await models.EventAccess.findAll({
      where: { eventId: id }
    }).map(ea => ({
      id: ea.id,
      accessType: ea.accessType,
      entityId: ea.entityId
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
