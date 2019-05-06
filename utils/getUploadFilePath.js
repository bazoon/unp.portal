const uploadFolder = "uploads";

const getUploadFilePath = function getUploadFilePath(name = "") {
  if (!name) return null;
  return name && name.includes("http") ? name : `/${uploadFolder}/${name}`;
};

module.exports = getUploadFilePath;
