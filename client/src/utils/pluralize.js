const comments = ["коментарий", "коментария", "комментариев"];
const files = [
  "прикрепленный файл",
  "прикрепленных файла",
  "прикрепленных файлов"
];

export function pluralize(count, words) {
  var cases = [2, 0, 1, 1, 1, 2];
  return (
    count +
    " " +
    words[
      count % 100 > 4 && count % 100 < 20 ? 2 : cases[Math.min(count % 10, 5)]
    ]
  );
}

export function pluralizeComments(count) {
  if (+count === 0) return "нет комментариев";
  return pluralize(count, comments);
}

export function pluralizeFiles(count) {
  if (+count === 0) return "нет файлов";
  return pluralize(count, files);
}
