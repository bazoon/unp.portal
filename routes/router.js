const Router = require("koa-router");
const router = new Router();

const projectGroups = require("./api/projectGroups");
const feed = require("./api/feed");
const chat = require("./api/chat");
const conversations = require("./api/conversations");
const events = require("./api/events");
const users = require("./api/users");
const files = require("./api/files");
const notifications = require("./api/notifications");

// Admin
const adminUsers = require("./api/admin/users");
const adminOrganizations = require("./api/admin/organizations");
const adminPositions = require("./api/admin/positions");
const adminGroups = require("./api/admin/projectGroups");

router.use("/api/projectGroups", projectGroups.routes());
router.use("/api/users", users.routes());
router.use("/api/feed", feed.routes());
router.use("/api/chat", chat.routes());
router.use("/api/conversations", conversations.routes());
router.use("/api/events", events.routes());
router.use("/api/files", files.routes());
router.use("/api/notifications", notifications.routes());

router.use("/admin/api/users", adminUsers.routes());
router.use("/admin/api/organizations", adminOrganizations.routes());
router.use("/admin/api/positions", adminPositions.routes());
router.use("/admin/api/projectGroups", adminGroups.routes());

http: module.exports = router;
