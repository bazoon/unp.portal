export default function getFileIcon(file) {
  file = file || "";
  switch (true) {
    case file.endsWith("pdf"):
      return "file-pdf";
    case file.endsWith("jpg"):
    case file.endsWith("jpeg"):
      return "file-jpg";
    case file.endsWith("doc"):
    case file.endsWith("docx"):
      return "file-word";
    case file.endsWith("xls"):
    case file.endsWith("xlsx"):
      return "file-excel";
    default:
      return "file";
  }
}
