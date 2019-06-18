function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
}

export default function getImageUrlFromFile(file) {
  return new Promise(resolve => {
    getBase64(file, imageUrl => {
      resolve(imageUrl);
    });
  });
}
