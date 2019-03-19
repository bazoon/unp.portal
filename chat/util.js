const fs = require("fs");
var path = require("path");
const fileName = path.resolve("routes/api/chat.json");

const users = [
  {
    name: "Петров Петр",
    avatar: "https://randomuser.me/api/portraits/men/21.jpg"
  },
  {
    name: "Иванов Семен",
    avatar: "https://randomuser.me/api/portraits/men/79.jpg"
  },
  {
    name: "Круглов Андрей",
    avatar: "https://randomuser.me/api/portraits/men/20.jpg"
  },
  {
    name: "Соколова Виктория",
    avatar: "https://randomuser.me/api/portraits/women/40.jpg"
  },
  {
    name: "Сидорова Анна",
    avatar: "https://randomuser.me/api/portraits/women/0.jpg"
  },
  {
    name: "Лукина Мария",
    avatar: "https://randomuser.me/api/portraits/women/72.jpg"
  }
];

https: module.exports = {
  writeMessage(id, message, type) {
    return new Promise((resolve, reject) => {
      fs.readFile(fileName, "utf8", function(err, contents) {
        if (!err) {
          const chat = JSON.parse(contents);
          const item = chat.find(i => i.id == id);

          const last =
            item.messages.length > 0
              ? item.messages[item.messages.length - 1]
              : undefined;

          var randomUser = users[Math.floor(Math.random() * users.length)];

          item.messages.push({
            id: last ? last.id + 1 : 1,
            type,
            date: new Date(),
            avatar: randomUser.avatar,
            author: randomUser.name,
            content: message
          });

          fs.writeFile(fileName, JSON.stringify(chat), function(err) {
            if (!err) {
              console.log("Writed!", randomUser);
              resolve();
            } else {
              reject(err);
            }
          });
        } else {
          reject(err);
        }
      });
    });
  }
};
