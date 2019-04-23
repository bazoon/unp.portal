const Router = require("koa-router");
const router = new Router();

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
const events = require("./api/events");

// Api routes

// router.use(function(req, res, next) {
//   // check header or url parameters or post parameters for token
//   var token = req.body.token || req.query.token || req.headers["token"];
//   console.log(token);
//   // decode token
//   if (token) {
//     // verifies secret and checks exp
//     jwt.verify(token, secret, function(err, decoded) {
//       if (err) {
//         return res.status(403).json({
//           success: false,
//           message: "Failed to authenticate token."
//         });
//       } else {
//         // if everything is good, save to request for use in other routes
//         req.decoded = decoded;
//         next();
//       }
//     });
//   } else {
//     // if there is no token
//     // return an error
//     return res.status(403).send({
//       success: false,
//       message: "No token provided."
//     });
//   }
// });

router.use("/api/user", user.routes());
router.use("/api/users", users.routes());
router.use("/api/projectGroups", projectGroups.routes());
router.use("/api/news", news.routes());
router.use("/api/feed", feed.routes());
// router.use("/laws", laws);
router.use("/api/profile_preferences", profilePreferences.routes());
router.use("/api/chat", chat.routes());
router.use("/api/conversations", conversations.routes());
// router.use("/comments", comments);
router.use("/api/events", events.routes());

module.exports = router;
