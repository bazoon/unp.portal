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
  if (!ctx.user.isAdmin) {
    ctx.status = 403;
    ctx.body = "Not authorized!";
    return;
  }

  const { query } = ctx.params;
  const sqlQuery = `
    select "user"."id", "user"."name", "user"."login", "user"."avatar", "user"."position_id" as "positionid",
    "user"."organization_id" as "organizationid", "user"."is_admin" as "isadmin",
    "user"."position_id" as "positionid", "user"."organization_id" as "organizationid",
    "position"."id" as "position.id", "position"."name" as "position.name", "organization"."id" as "organization.id", "organization"."name" as
    "organization.name", "organization"."full_name" as "organization.fullname", "organization"."inn" as "organization.inn",
    "organization"."address" as "organization.address" from "users" as "user" 
    left join "positions" as "position" on "user"."position_id" = "position"."id"
    left join "organizations" as "organization" on "user"."organization_id" = "organization"."id"
    where _search @@ to_tsquery(:query)
    order by "user"."name" asc
  `;
  const users = await models.sequelize.query(sqlQuery, {
    replacements: { query: `${query} | ${query}:*` }
  });

  ctx.body = users[0].map(u => {
    const position = u["position.id"]
      ? {
          id: u["position.id"],
          name: u["position.name"]
        }
      : null;

    const organization = u["organization.id"]
      ? {
          id: u["organization.id"],
          name: u["organization.name"],
          fullName: u["organization.fullName"],
          address: u["organization.address"]
        }
      : null;

    return {
      id: u.id,
      isAdmin: u.isAdmin,
      avatar: getUploadFilePath(u.avatar),
      name: u.name,
      login: u.login,
      position,
      organization
    };
  });
});

router.get("/", async (ctx, next) => {
  const { isAdmin } = ctx.user;

  if (!ctx.user.isAdmin) {
    ctx.status = 403;
    ctx.body = "Not authorized!";
    return;
  }

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
