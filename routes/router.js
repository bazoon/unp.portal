const express = require("express");
const router = express.Router();

const secret = "Some secret key";
const jwt = require("jsonwebtoken");

const users = require("./api/users");
const projectGroups = require("./api/projectGroups");
const news = require("./api/news");
const feed = require("./api/feed");
const laws = require("./api/laws");
const user = require("./api/user");
const profilePreferences = require("./api/profile_preferences");
const chat = require("./api/chat");
const conversations = require("./api/conversations");
const comments = require("./api/comments");

// Api routes

router.use("/user", user);

router.use(function(req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers["token"];
  console.log(token);
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, secret, function(err, decoded) {
      if (err) {
        return res.status(403).json({
          success: false,
          message: "Failed to authenticate token."
        });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({
      success: false,
      message: "No token provided."
    });
  }
});

router.use("/users", users);
router.use("/projectGroups", projectGroups);
router.use("/news", news);
router.use("/feed", feed);
router.use("/laws", laws);
router.use("/profile_preferences", profilePreferences);
router.use("/chat", chat);
router.use("/conversations", conversations);
router.use("/comments", comments);

module.exports = router;
