export default function getFileName(fullPath) {
  const group = fullPath.split("/");
  const fileName = group.pop();
  return fileName;
}
