const jwt = require('jsonwebtoken');

const currentUser = (req, res, next) => {
  console.log(req.cookies.token,'kkkkkkkk')
  if (!req?.cookies?.token) {
    return next();
  }
  try {
    const payload = jwt.verify(req.cookies.token, process.env.JWT_KEY); // extract info from json web token
    req.currentUser = payload;
  } catch (err) {}
  next();
};

module.exports = currentUser;
