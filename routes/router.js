const Router = require("koa-router");
const router = new Router();

const checkToken = require("../middleware/checkToken");
const users = require("./api/users");
const projectGroups = require("./api/projectGroups");
const news = require("./api/news");
const feed = require("./api/feed");
const user = require("./api/user");
const profilePreferences = require("./api/profile_preferences");
const chat = require("./api/chat");
const conversations = require("./api/conversations");
const events = require("./api/events");

// Middleware
router.use("/api/user", user.routes());
router.use(checkToken);

// Api routes
router.use("/api/users", users.routes());
router.use("/api/projectGroups", projectGroups.routes());
router.use("/api/news", news.routes());
router.use("/api/feed", feed.routes());
router.use("/api/profile_preferences", profilePreferences.routes());
router.use("/api/chat", chat.routes());
router.use("/api/conversations", conversations.routes());
router.use("/api/events", events.routes());

module.exports = router;
