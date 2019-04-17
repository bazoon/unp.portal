const express = require("express");
const moment = require("moment-timezone");
const router = express.Router();
const fs = require("fs");
const models = require("../../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const multer = require("multer");
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

router.post("/create", upload.array("file", 12), function(req, res, next) {
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
  } = req.body;
  console.log(req.body);
  const files = req.files;

  console.log(remindBefore);
  console.log(allDay);

  const promise = models.Event.create({
    userId,
    title: eventTitle,
    fromDate: fromDate,
    toDate: toDate,
    place,
    description,
    allDay,
    remindBefore
  }).then(event => {
    models.UserEvent.create({
      userId,
      eventId: event.id
    }).then(() => {
      return models.EventFile.bulkCreate(
        files.map(f => ({
          EventId: event.id,
          file: f.filename,
          size: f.size
        }))
      ).then(() => {
        const r = {
          userId: event.userId,
          title: event.title,
          fromDate: event.fromDate,
          toDate: event.toDate,
          place: event.place,
          description: event.description,
          allDay: event.allDay,
          remindBefore: event.remindBefore,
          files: files.map(f => ({ name: f.filename, size: f.size }))
        };
        res.json(r);
      });
    });
  });
});

router.get("/list", (req, res) => {
  const { userId, now } = req.query;

  const from = moment(now);
  from.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  from.tz("Etc/GMT-0");

  const to = moment(now).endOf("month");
  to.set({ hour: 23, minute: 59, second: 59, millisecond: 999 });
  to.tz("Etc/GMT-0");

  getEvents(userId, from, to, r => res.json(r));
});

router.get("/list/all", (req, res) => {
  const { userId } = req.query;
  getEvents(userId, undefined, undefined, r => res.json(r));
});

function getEvents(userId, from, to, fn) {
  let query;

  if (from && to) {
    query = `select "Events"."id" ,"Events"."title", "Events"."description", "Events"."fromDate", "Events"."toDate", "Events"."place", "Events"."userId"
                from "Events", "UserEvents"
                where "Events"."id" = "UserEvents"."eventId" and "UserEvents"."userId" = ${userId}  and
                "Events"."fromDate" BETWEEN '${from}' AND '${to}'
                order by "Events"."fromDate" asc`;
  } else {
    query = `select "Events"."id" ,"Events"."title", "Events"."description", "Events"."fromDate", "Events"."toDate", "Events"."place", "Events"."userId"
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
          userId: event.userId,
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

  promise.then(r => {
    Promise.all(r).then(t => {
      fn(t);
    });
  });
}

module.exports = router;
