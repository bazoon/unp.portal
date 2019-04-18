const config = require("../config/config");
const uploadFolder = "uploads";

const getUploadFilePath = function getUploadFilePath(name = "") {
  return name.includes("http") ? name : `/${uploadFolder}/${name}`;
};

module.exports = getUploadFilePath;
