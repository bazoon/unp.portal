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

  const accessIds = accessEntitiesIds ? accessEntitiesIds.split(",") : [];
  if (accessType == 1) {
    await models.EventAccess.bulkCreate(
      accessIds.map(id => {
        return {
          eventId: event.id,
          entityId: id,
          accessType: 1
        };
      })
    );

    // await models.UserEvent.bulkCreate(
    //   accessIds.map(id => {
    //     return {
    //       eventId: event.id,
    //       userId: id
    //     };
    //   })
    // );

    await notificationService.eventCreated({
      userId,
      title: event.title,
      eventId: event.id,
      recipientsIds: accessIds.concat([userId])
    });
  } else if (accessType == 2) {
    const usersQuery = `select distinct user_id from participants where project_group_id in (${accessEntitiesIds})`;
    const users = (await models.sequelize.query(usersQuery))[0];

    // await models.UserEvent.bulkCreate(
    //   users.map(u => {
    //     return {
    //       eventId: event.id,
    //       userId: u.user_id
    //     };
    //   })
    // );

    await models.EventAccess.bulkCreate(
      accessIds.map(id => {
        return {
          eventId: event.id,
          entityId: id,
          accessType: 2
        };
      })
    );

    await notificationService.eventCreated({
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
    const usersQuery = `select distinct user_id from participants where project_group_id in (${accessEntitiesIds})`;
    const users = (await models.sequelize.query(usersQuery))[0];

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

  const query = `select events.id, title, description, start_date, remind_at
          from events, user_events
          where events.id = user_events.event_id and user_events.user_id=${userId}
          and start_date >= '${from}'
          order by events.start_date asc
          limit 5`;

  const events = (await models.sequelize.query(query))[0];

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
    countQuery = `select count(*) from participants where project_group_id 
                  in (select entity_id from event_accesses where event_id = 24 and access_type = 2)
                  `;

    query = `select *from events where id in (select event_id from event_accesses 
            where (access_type = 2 and entity_id in (select project_group_id from participants where user_id = ${userId})) or 
            (access_type = 1 and entity_id = ${userId})) or user_id = ${userId}
            order by events.start_date asc
            limit ${limit} offset ${offset}`;
  }

  const events = (await models.sequelize.query(query))[0];
  const total = +(await models.sequelize.query(countQuery))[0][0].count;

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
                      (select entity_id from event_accesses where event_id = ${
                        event.id
                      } and access_type = 2)`;
    const usersCountQuery = `select count(*) from event_accesses where access_type = 1 and event_id=${
      event.id
    }`;

    const count =
      +(await models.sequelize.query(groupsCountQuery))[0][0].count +
      +(await models.sequelize.query(usersCountQuery))[0][0].count;

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

  if (!event) {
    ctx.code = 404;
    ctx.body = "not found";
    return;
  }

  ctx.body = {
    id: id,
    userId: event.UserId,
    description: event.description,
    remind: event.remind,
    startDate: event.startDate,
    title: event.title,
    accessType: event.accessType,
    accesses: await models.EventAccess.findAll({ where: { eventId: id } }).map(
      ea => ({ id: ea.id, accessType: ea.accessType, entityId: ea.entityId })
    )
  };
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
