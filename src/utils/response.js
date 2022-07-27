const successfulRes = (res, status, data, msg = 'success') => {
  return res.status(status).json({
    status: status,
    msg: msg,
    data: data,
  });
};

const failedRes = (res, status, error = null, msg = 'error') => {
  return res.status(status).json({
    status: status,
    msg: msg,
    data: error?.message,
  });
};

module.exports = {
  successfulRes,
  failedRes,
};
