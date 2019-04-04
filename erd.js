(async function() {
  const { writeFileSync } = require("fs");
  const sequelizeErd = require("sequelize-erd");

  // const db = new Sequelize("unp_portal", "vn", "t9788886", {
  //   host: "localhost",
  //   dialect: "postgres"
  // });

  const db = require("./models");
  console.log(db.sequelize);
  const svg = await sequelizeErd({ source: db.sequelize });
  // writeFileSync("./erd.svg", svg);

  // Writes erd.svg to local path with SVG file from your Sequelize models
})();
