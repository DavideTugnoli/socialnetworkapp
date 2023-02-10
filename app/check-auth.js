const jwt = require("jsonwebtoken");

const isAuthenticated = async (req, res, next) => {
  const cookie = await req.cookies[process.env.JWT_COOKIE_NAME];
  if (!cookie) {
    req.isAuthenticated = false;
  } else {
    try {
      const decoded = jwt.verify(cookie, process.env.JWT_PRIVATE_KEY);
      req.id = decoded.id;
      req.username = decoded.username;
      req.isAuthenticated = true;
    } catch {
      req.isAuthenticated = false;
    }
  }
  return next();
};

module.exports = { isAuthenticated };
