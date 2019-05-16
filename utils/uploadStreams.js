const fs = require("fs");
const path = require("path");
const util = require("util");

const renameP = util.promisify(fs.rename);
const uploadPath = "../uploads";

module.exports = function uploadStreams(f) {
  const files = Array.isArray(f) ? f : [f];

  files.map(f => {
    const targetPath = path.join(__dirname, `${uploadPath}/${f.filename}`);
    const writeStream = fs.createWriteStream(targetPath);
    f.stream.pipe(writeStream);
  });
};
