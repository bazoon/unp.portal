const fs = require("fs");
const path = require("path");
const util = require("util");

const renameP = util.promisify(fs.rename);
const uploadPath = "../uploads";

module.exports = async function uploadFiles(f) {
  const files = Array.isArray(f) ? f : [f];
  files.forEach(async f => {
    const targetPath = path.join(__dirname, `${uploadPath}/${f.name}`);
    await renameP(f.path, targetPath);
  });
};
