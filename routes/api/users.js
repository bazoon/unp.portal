const Router = require("koa-router");
const router = new Router();
const models = require("../../models");
const getUploadFilePath = require("../../utils/getUploadFilePath");

router.get("/list/all", async (ctx, next) => {
  const users = await models.User.findAll();
  ctx.body = users.map(u => {
    return {
      id: u.id,
      avatar: getUploadFilePath(u.avatar),
      Position: u.Position,
      name: u.name
    };
  });
});

router.get("/search/:query", async (ctx, next) => {
  const { query } = ctx.params;
  const sqlQuery = `
    SELECT "User"."id", "User"."name", "User"."login", "User"."password", "User"."avatar", "User"."position_id" AS "positionId",
    "User"."organization_id" AS "organizationId", "User"."is_admin" AS "isAdmin", "User"."created_at" AS "createdAt",
    "User"."updated_at" AS "updatedAt", "User"."position_id" AS "PositionId", "User"."organization_id" AS "OrganizationId",
    "Position"."id" AS "Position.id", "Position"."name" AS "Position.name", "Position"."created_at" AS "Position.createdAt",
    "Position"."updated_at" AS "Position.updatedAt", "Organization"."id" AS "Organization.id", "Organization"."name" as
    "Organization.name", "Organization"."full_name" AS "Organization.fullName", "Organization"."inn" AS "Organization.inn",
    "Organization"."address" AS "Organization.address", "Organization"."created_at" AS "Organization.createdAt", "Organization"."updated_at"
    AS "Organization.updatedAt" FROM "users" AS "User" 
    LEFT JOIN "positions" AS "Position" ON "User"."position_id" = "Position"."id"
    LEFT JOIN "organizations" AS "Organization" ON "User"."organization_id" = "Organization"."id"
    where _search @@ to_tsquery(:query)
    ORDER BY "User"."name" ASC
  `;
  const users = await models.sequelize.query(sqlQuery, {
    replacements: { query: `${query} | ${query}:*` }
  });

  ctx.body = users[0].map(u => {
    return {
      id: u.id,
      isAdmin: u.isAdmin,
      avatar: getUploadFilePath(u.avatar),
      name: u.name,
      login: u.login,
      position: {
        id: u["Position.id"],
        name: u["Position.name"]
      },
      organization: {
        id: u["Organization.id"],
        name: u["Organization.name"],
        fullName: u["Organization.fullName"],
        address: u["Organization.address"]
      }
    };
  });
});

router.get("/", async (ctx, next) => {
  const users = await models.User.findAll({
    include: [
      {
        model: models.Position,
        as: "Position"
      },
      {
        model: models.Organization,
        as: "Organization"
      }
    ],
    order: [["name", "asc"]]
  });

  const u = users[0];
  ctx.body = users.map(u => {
    return {
      id: u.id,
      isAdmin: u.isAdmin,
      avatar: getUploadFilePath(u.avatar),
      name: u.name,
      login: u.login,
      position: u.Position,
      organization: u.Organization
    };
  });
});

module.exports = router;
