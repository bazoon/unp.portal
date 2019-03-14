const fs = require("fs");
var path = require("path");
const fileName = path.resolve("routes/api/chat.json");

module.exports = {
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

          item.messages.push({
            id: last ? last.id + 1 : 1,
            type,
            date: new Date(),
            author: "Соколова Виктория",
            content: message
          });

          fs.writeFile(fileName, JSON.stringify(chat), function(err) {
            if (!err) {
              console.log("Writed!");
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
