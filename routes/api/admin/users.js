const bcrypt = require("bcryptjs");
const Router = require("koa-router");
const koaBody = require("koa-body");
const router = new Router();
const models = require("../../../models");
const getUploadFilePath = require("../../../utils/getUploadFilePath");
const uploadFiles = require("../../../utils/uploadFiles");
const notificationService = require("../../../utils/notifications");

router.get("/", async (ctx, next) => {
  const { isAdmin } = ctx.user;
  if (!isAdmin) {
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
    order: [["isAdmin", "desc"], ["name", "asc"]]
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

router.get("/:id", async (ctx, next) => {
  const { isAdmin } = ctx.user;
  const { id } = ctx.params;

  // if (!(isAdmin || id == ctx.user.id)) {
  //   ctx.status = 403;
  //   ctx.body = "Not authorized!";
  //   return;
  // }

  const user = await models.User.findOne({
    where: {
      id
    },
    include: [
      {
        model: models.Position,
        as: "Position"
      },
      {
        model: models.Organization,
        as: "Organization"
      }
    ]
  });

  if (!user) {
    ctx.status = 404;
    return;
  }

  ctx.body = {
    id: user.id,
    isAdmin: user.isAdmin,
    avatar: getUploadFilePath(user.avatar),
    name: user.name,
    login: user.login,
    position: user.Position,
    organization: user.Organization
  };
});

router.post("/", async (ctx, next) => {
  const {
    name,
    login,
    avatar,
    positionId,
    organizationId,
    password,
    isAdmin
  } = ctx.request.body;
  const userId = ctx.user.id;
  const id = ctx.query.id;

  if (!ctx.user.isAdmin) {
    ctx.status = 403;
    ctx.body = "Not authorized!";
    return;
  }

  const hashedPassword = bcrypt.hashSync(password, 8);

  let newUser = await models.User.create({
    name,
    login,
    avatar,
    isAdmin,
    organizationId: organizationId,
    positionId: positionId,
    password: hashedPassword
  });

  const user = await models.User.findOne({
    where: {
      id: newUser.id
    },
    include: [
      {
        model: models.Position,
        as: "Position"
      },
      {
        model: models.Organization,
        as: "Organization"
      }
    ]
  });

  // notification

  if (user.isAdmin) {
    notificationService.superAdminAdded({
      userId,
      adminId: user.id,
      adminName: user.name
    });
  }

  // end

  ctx.body = {
    id: user.id,
    isAdmin: user.isAdmin,
    name: user.name,
    login: user.login,
    avatar: user.avatar,
    position: user.Position,
    organization: user.Organization
  };
});

router.put("/", koaBody({ multipart: true }), async (ctx, next) => {
  const {
    id,
    firstName,
    surName,
    lastName,
    login,
    positionId,
    organizationId,
    password,
    isAdmin
  } = ctx.request.body;
  const userId = ctx.user.id;
  const isSuperAdmin = ctx.user.isAdmin;

  if (!(isSuperAdmin || id == ctx.user.id)) {
    ctx.status = 403;
    ctx.body = "Not authorized!";
    return;
  }

  const { avatar } = ctx.request.files;
  const files = avatar ? (Array.isArray(avatar) ? avatar : [avatar]) : [];
  await uploadFiles(files);

  const name = `${surName} ${firstName} ${lastName}`;

  const newUser = await models.User.findOne({
    where: {
      id
    },
    include: [
      {
        model: models.Position,
        as: "Position"
      },
      {
        model: models.Organization,
        as: "Organization"
      }
    ]
  });

  await newUser.update({
    name,
    login,
    avatar: (avatar && avatar.name) || newUser.avatar,
    isAdmin: isAdmin === "true",
    OrganizationId: organizationId,
    PositionId: positionId
  });

  if (password) {
    await newUser.update({
      password: bcrypt.hashSync(password, 8)
    });
  }

  // notification

  if (newUser.isAdmin) {
    notificationService.superAdminAdded({
      userId,
      adminId: newUser.id,
      adminName: newUser.name
    });
  } else {
    notificationService.superAdminRemoved({
      userId,
      adminId: newUser.id,
      adminName: newUser.name
    });
  }

  // end

  ctx.body = {
    id: newUser.id,
    isAdmin: newUser.isAdmin,
    name: newUser.name,
    login: newUser.login,
    avatar: getUploadFilePath(newUser.avatar),
    organization: newUser.organization,
    position: newUser.position
  };
});

router.post("/delete", async (ctx, next) => {
  const { isAdmin } = ctx.user;
  if (!isAdmin) {
    ctx.status = 403;
    ctx.body = "Not authorized!";
    return;
  }
  const { id } = ctx.request.query;
  await models.User.destroy({ where: { id } });
  ctx.body = id;
});

module.exports = router;
