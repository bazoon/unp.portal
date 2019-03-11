const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 5000;

const bodyParser = require("body-parser");
const multer = require("multer");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

const users = require("./routes/api/users");
const projectGroups = require("./routes/api/projectGroups");
const news = require("./routes/api/news");
const feed = require("./routes/api/feed");
const laws = require("./routes/api/laws");

// Api routes
app.use("/api/users", users);
app.use("/api/projectGroups", projectGroups);
app.use("/api/news", news);
app.use("/api/feed", feed);
app.use("/api/laws", laws);

app.use(express.static("client/dist"));
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// Uploads
app.post("/upload", upload.array("file", 12), function(req, res, next) {
  res.send(req.files);
});

app.listen(port, () => console.log(`Server is running on ${port}`));
