const jwt = require('jsonwebtoken');

const currentUser = require('./current-user');
const isAuthorizedUser = (role) => {
  return async (req, res, next) => {
    const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY); // extract info from json web token
    req.currentUser = payload;
    console.log(payload);

    if (role !== req.currentUser.role) {
      return res.json({
        message: ` is not access this resource`,
      });
    }
    next();
    
  };
};

module.exports = { isAuthorizedUser };
