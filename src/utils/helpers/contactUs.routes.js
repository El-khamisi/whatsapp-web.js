const router = require('express').Router();
const { smtpMail } = require('../smtp');
const { to_email } = require('../../config/env');

const { successfulRes, failedRes } = require('../../utils/response');

router.post('/contact-us', async (req, res) => {
  const { name, phone, email, message } = req.body;
  try {
    const subject = `Email sent through contact us form, Phone: ${phone}`;
    const info = await smtpMail(to_email, name, email, subject, message);

    return successfulRes(res, 200, { response: info.response, from: info.envelope.from, to: info.envelope.to[0] });
  } catch (e) {
    return failedRes(res, 500, e);
  }
});

module.exports = router;
