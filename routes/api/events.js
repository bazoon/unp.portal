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
    userId,
    eventTitle,
    fromTime,
    fromDate,
    toTime,
    toDate,
    place,
    description,
    allDay,
    remindBefore
  } = ctx.request.body;

  const { file } = ctx.request.files;
  const files = file ? (Array.isArray(file) ? file : [file]) : [];
  await uploadFiles(files);

  const result = await models.Event.create({
    userId,
    title: eventTitle,
    fromDate: fromDate,
    toDate: toDate,
    place,
    description,
    allDay,
    remindBefore
  }).then(event => {
    return models.UserEvent.create({
      UserId: userId,
      eventId: event.id
    }).then(() => {
      return models.EventFile.bulkCreate(
        files.map(f => ({
          EventId: event.id,
          file: f.name,
          size: f.size
        }))
      ).then(() => {
        return {
          userId: event.userId,
          title: event.title,
          fromDate: event.fromDate,
          toDate: event.toDate,
          place: event.place,
          description: event.description,
          allDay: event.allDay,
          remindBefore: event.remindBefore,
          files: files.map(f => ({ name: f.name, size: f.size }))
        };
      });
    });
  });
  ctx.body = result;
});

router.get("/list", async (ctx, next) => {
  const { userId, now } = ctx.request.query;

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
  const { userId } = ctx.request.query;
  const events = await getEvents(userId, undefined, undefined);
  ctx.body = events;
});

async function getEvents(userId, from, to, fn) {
  let query;

  if (from && to) {
    query = `select "Events"."id" ,"Events"."title", "Events"."description", "Events"."fromDate", "Events"."toDate", "Events"."place", "Events"."UserId"
                from "Events", "UserEvents"
                where "Events"."id" = "UserEvents"."eventId" and "UserEvents"."userId" = ${userId}  and
                "Events"."fromDate" BETWEEN '${from}' AND '${to}'
                order by "Events"."fromDate" asc`;
  } else {
    query = `select "Events"."id" ,"Events"."title", "Events"."description", "Events"."fromDate", "Events"."toDate", "Events"."place", "Events"."UserId"
            from "Events", "UserEvents"
            where "Events"."id" = "UserEvents"."eventId" and "UserEvents"."userId" = ${userId}
            order by "Events"."fromDate" asc`;
  }

  const promise = models.sequelize.query(query).then(function(e) {
    const events = e[0];

    return events.map(event => {
      return models.EventFile.findAll({
        where: { EventId: event.id }
      }).then(files => {
        return {
          id: event.id,
          userId: event.UserId,
          title: event.title,
          fromDate: event.fromDate,
          toDate: event.toDate,
          place: event.place,
          description: event.description,
          files: files.map(file => ({ name: file.file, size: file.size }))
        };
      });
    });
  });

  return promise.then(r => {
    return Promise.all(r);
  });
}

module.exports = router;
