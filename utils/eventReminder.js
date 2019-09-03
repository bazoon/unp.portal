const Bull = require("bull");
const { RedisConfigMissingError } = require("../utils/errors");

class EventReminder {
  constructor() {
    const host = process.env.REDIS_HOST;
    const port = process.env.REDIS_PORT;

    if (!host || !port) {
      throw new RedisConfigMissingError();
    }

    this.queue = new Bull("Foo", {
      redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
      }
    });
  }

  setChat(chat) {
    this.chat = chat;
  }

  sendMessage(messageName, message, userId) {
    this.chat.sendMessage(messageName, message, userId);
  }

  remind(event, usersIds, delay) {
    usersIds.forEach(userId => {
      console.log("Added reminder for", userId);
      this.queue.add(
        { ...event, userId },
        { delay, attempts: 10, backoff: 30000 }
      );
    });
  }

  run() {
    if (this.queue) {
      this.queue.process(async (job, done) => {
        try {
          // console.log("Sending", job.data);
          await this.chat.sendMessage(
            "notify",
            { title: job.data.title, description: job.data.description },
            job.data.userId
          );
          done();
        } catch (e) {
          // console.log(`Failed for ${job.data.userId}`);
          done("failed");
        }
      });
    }
  }
}

const eventReminder = new EventReminder();
eventReminder.run();
module.exports = eventReminder;
