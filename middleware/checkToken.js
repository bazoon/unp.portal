const secret = "Some secret key";
const jwt = require("jsonwebtoken");

const checkToken = async (ctx, next) => {
  // check header or url parameters or post parameters for token
  var token =
    ctx.request.body.token || ctx.request.query.token || ctx.get("token");

  if (token) {
    // verifies secret and checks exp
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
      ctx.decoded = decoded;
      await next();
    } catch (err) {
      ctx.throw(403, {
        success: false,
        message: "Failed to authenticate token. " + err
      });
    }
  } else {
    // if there is no token
    // return an error
    ctx.throw(403, {
      success: false,
      message: "Failed to authenticate token."
    });
  }
};

module.exports = checkToken;
