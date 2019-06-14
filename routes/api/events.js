const moment = require("moment-timezone");
const Router = require("koa-router");
const router = new Router();
const koaBody = require("koa-body");
const fs = require("fs");
const models = require("../../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const uploadFiles = require("../../utils/uploadFiles");

router.post("/create", koaBody({ multipart: true }), async ctx => {
  const {
    title,
    description,
    accessType,
    accessEntitiesIds,
    date,
    remind
  } = ctx.request.body;

  const userId = ctx.user.id;
  const remindAt = remind > 0 ? moment(date).add(+remind, "minutes") : null;

  const { file } = ctx.request.files;
  const files = file ? (Array.isArray(file) ? file : [file]) : [];
  await uploadFiles(files);

  const event = await models.Event.create({
    title,
    description,
    userId,
    startDate: date,
    remindAt
  });

  const accessIds = accessEntitiesIds ? accessEntitiesIds.split(",") : [];
  if (accessType == 1) {
    await models.UserEvent.bulkCreate(
      accessIds.map(id => {
        return {
          eventId: event.id,
          userId: id
        };
      })
    );
  } else if (accessType == 2) {
    const usersQuery = `select distinct user_id from participants where project_group_id in (${accessEntitiesIds})`;
    const users = (await models.sequelize.query(usersQuery))[0];
    await models.UserEvent.bulkCreate(
      users.map(u => {
        return {
          eventId: event.id,
          userId: u.user_id
        };
      })
    );
  }

  await models.UserEvent.findOrCreate({
    where: {
      [Op.and]: [{ eventId: event.id }, { userId: userId }]
    },
    defaults: {
      eventId: event.id,
      userId: userId
    }
  });

  ctx.body = event;
});

router.get("/list", async (ctx, next) => {
  const { page, pageSize } = ctx.request.query;
  const userId = ctx.user.id;
  const now = newDate();
  const from = moment(now);
  from.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  from.tz("Etc/GMT-0");

  const to = moment(now).endOf("month");
  to.set({ hour: 23, minute: 59, second: 59, millisecond: 999 });
  to.tz("Etc/GMT-0");

  const events = await getEvents(userId, from, to);
  ctx.body = events;
});

router.get("/list/all", async (ctx, next) => {
  const { page, pageSize } = ctx.request.query;
  const userId = ctx.user.id;
  const events = await getEvents(userId, undefined, undefined, page, pageSize);
  ctx.body = events;
});

router.get("/upcoming", async (ctx, next) => {
  const userId = ctx.user.id;
  const from = moment(new Date());
  from.tz("Etc/GMT-0");

  const query = `select events.id, title, description, start_date, remind_at
            from events, user_events
            where events.id = user_events.event_id and user_events.user_id=${userId}
            and start_date > '${from}'
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
    countQuery = `select count(events.id)
                  from events, user_events              
                  where events.id = user_events.event_id and user_events.user_id=${userId} and
                  events.start_date BETWEEN '${from}' AND '${to}
                  `;

    query = `select events.id, title, description, start_date, remind_at
            from events, user_events
            where events.id = user_events.event_id and user_events.user_id=${userId} and
            events.start_date BETWEEN '${from}' AND '${to}'
            order by events.start_date asc
            limit ${limit} offset ${offset}`;
  } else {
    countQuery = `select count(events.id)
                  from events, user_events            
                  where events.id = user_events.event_id and user_events.user_id=${userId}
                  `;

    query = `select events.id, title, description, start_date, remind_at
            from events, user_events
            where events.id = user_events.event_id and user_events.user_id=${userId}
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
    const usersQuery = `select count(*) from user_events where event_id = ${
      event.id
    }`;

    const count = +(await models.sequelize.query(usersQuery))[0][0].count;

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.start_date,
      remindAt: event.remind_at,
      usersCount: count
    };
  });
}

module.exports = router;
