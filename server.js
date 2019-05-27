require("dotenv").config();
const path = require("path");
const fs = require("fs");
const Koa = require("koa");
const koaJwt = require("koa-jwt");
const jwt = require("jsonwebtoken");
const serve = require("koa-static");
const send = require("koa-send");
const Router = require("koa-router");
const mount = require("koa-mount");
const router = new Router();
const koaBody = require("koa-body");
const uploadFiles = require("./utils/uploadFiles");
const models = require("./models");
const { ApolloServer, gql } = require("apollo-server-koa");
const {
  fileLoader,
  mergeTypes,
  mergeResolvers
} = require("merge-graphql-schemas");

const typeDefs = mergeTypes(
  fileLoader(path.join(__dirname, "./graphql/schema"))
);

const resolvers = fileLoader(path.join(__dirname, "./graphql/resolvers"));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ ctx }) => {
    // get the user token from the headers
    const token = ctx.request.headers.authorization || "";
    const tokenOnly = token.split(" ")[1];
    const user = jwt.verify(tokenOnly, process.env.API_TOKEN);
    if (!user) throw new AuthorizationError("you must be logged in");
    return { user };
  }
});

const app = new Koa();
const http = require("http").Server(app.callback());
const io = require("socket.io")(http);
const apiRouter = require("./routes/router");
const authRouter = require("./routes/authRouter");
const eventsRouter = require("./routes/api/events");

const port = process.env.PORT || 5000;
const chatFactory = require("./chat/index");
const chat = new chatFactory(io);

app.use(koaBody());

app.use(serve("client/dist"));
app.use(mount("/uploads", serve("uploads")));

app.use(async (ctx, next) => {
  const requestPath = ctx.request.path;
  if (requestPath.indexOf("api") > 0 || requestPath.indexOf("graphql") > 0) {
    return await next();
  }
  await send(ctx, path.resolve("/client/dist", "index.html"));
});

app.use(authRouter.routes()).use(authRouter.allowedMethods());
app.use(koaJwt({ secret: process.env.API_TOKEN }));

app.use(async (ctx, next) => {
  const token = ctx.request.header.authorization || "";
  const tokenOnly = token.split(" ")[1];
  if (tokenOnly) {
    const user = jwt.verify(tokenOnly, process.env.API_TOKEN);
    const isAdminUrl = ctx.request.url.indexOf("admin/api") > 0;

    if (isAdminUrl && !user.isAdmin) {
      ctx.status = 403;
      ctx.body = "Not authorized!";
    } else {
      ctx.user = user;
      await next();
    }
  }
});

server.applyMiddleware({ app });
app.use(apiRouter.routes()).use(apiRouter.allowedMethods());

models.sequelize.sync().then(function() {
  http.listen(port, () => console.log(`Server is running on ${port}`));
});
