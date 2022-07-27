const jwt = require('jsonwebtoken');
const { TOKENKEY } = require('../config/env');
const { failedRes } = require('../utils/response');

exports.authN = (req, res, next) => {
  try {
    if (!(req.get('Authorization') || req.cookies.authorization)) {
      throw new Error('Login first');
    }
    const token = req.get('Authorization') ? req.get('Authorization').split(' ')[1] : req.cookies.authorization;

    const verify = jwt.verify(token, TOKENKEY);
    res.locals.user = verify;
    next();
  } catch (e) {
    return failedRes(res, 401, e);
  }
};

exports.socketAuthN = (socket, next) => {
  // const token = socket.handshake.auth.token;
  try {
    const token = socket.handshake.headers.auth?.split(' ')[1];
    if (!token) throw new Error(`Provide valid token`);

    const verify = jwt.verify(token, TOKENKEY);
    socket.user = verify;
    next();
  } catch (err) {
    return next(new Error(err.message));
  }
};
