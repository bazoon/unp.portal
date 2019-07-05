const Bull = require("bull");

class EventReminder {
  constructor() {
    this.queue = new Bull("Foo");
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
        { delay, attempts: 100, backoff: 5000 }
      );
    });
  }

  run() {
    if (this.queue) {
      this.queue.process(async (job, done) => {
        try {
          console.log("Sending", job.data);
          this.chat.sendMessage(
            "notify",
            { title: job.data.title, description: job.data.description },
            job.data.userId
          );
          done();
        } catch (e) {
          console.log(`Failed for ${job.data.userId}`);
          done("failed");
        }
      });
    }
  }
}

const eventReminder = new EventReminder();
eventReminder.run();
module.exports = eventReminder;
