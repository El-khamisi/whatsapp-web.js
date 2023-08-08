const { User, Verification } = require('../models/user.model');
const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const { successfulRes, failedRes } = require('../utils/response');
const { setS_id } = require('../utils/cookie');
const { default: mongoose } = require('mongoose');
const MongoStore = require('connect-mongo');
const { NODE_ENV, TOKENKEY, to_email,baseUrlWeb } = require('../config/env');
const { smtpMail } = require('../utils/smtp');

const verificationMsg = (name, baseUrl, verfHash) => `Hello ${name},
 You requested to use this email address to access your Shuhyb Academy account.
Click the link below to verify this email address
${baseUrl}/email-confirmation/${verfHash}`;

exports.regUser = async (req, res) => {
  try {
    let { first_name, last_name, email, password } = req.body;
    if (email && password) {
      password = bcrypt.hashSync(password, 10);
    } else {
      throw new Error('Email and password are REQUIRED');
    }
    let saved = new User({ first_name, last_name, email, password });
    await saved.save();

    const token = saved.generateToken(req, res);

    req.session.user = saved;

    const user = {
      id: saved._id,
      name: `${saved.first_name} ${saved.last_name}`,
      photo: saved.photo,
      email: saved.email,
      isVerified: saved.is_verified,
    };

    // setS_id(req, res);

    // Send Email verification
    const hash = crypto.createHmac('sha256', TOKENKEY).update(saved._id.toString()).digest('hex');
    const verfCode = new Verification({ verification_hash: hash, user_id: saved._id });
    await verfCode.save();

    const info = await smtpMail(
      saved.email,
      'GoWhats',
      to_email,
      'GoWhats email verification',
      verificationMsg(`${saved.first_name} ${saved.last_name}`, baseUrlWeb, hash),
    );
    return successfulRes(res, 201, { user, token, email_verifiction: info?.response });
  } catch (e) {
    return failedRes(res, 500, e);
  }
};

exports.logUser = async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return failedRes(res, 400, null, 'Email and password are REQUIRED');
  }

  try {
    let logged = await User.findOne({ email }).exec();

    if (!logged) {
      return failedRes(res, 400, null, 'Email is invalid');
    }

    const matched = bcrypt.compareSync(password, logged.password);
    logged.password = undefined;
    if (!logged || !matched) {
      return failedRes(res, 400, null, 'Email or Password is invalid');
    } else {
      const token = logged.generateToken(req, res);

      req.session.user = logged;

      const user = {
        id: logged._id,
        name: `${logged.first_name} ${logged.last_name}`,
        photo: logged.photo,
        email: logged.email,
        isVerified: logged.is_verified,
        role: logged.role,
      };

      // setS_id(req, res);
      return successfulRes(res, 200, { user, token });
    }
  } catch (e) {
    return failedRes(res, 500, e);
  }
};

exports.logout = async (req, res) => {
  try {
    req.session.destroy(() => {});
    const session = MongoStore.create({ client: mongoose.connection.getClient() });
    session.destroy(req.sessionID);

    res.cookie('authorization', '', {
      sameSite: NODE_ENV == 'dev' ? false : 'none',
      secure: NODE_ENV == 'dev' ? false : true,
    });

    res.cookie('s_id', '', {
      sameSite: NODE_ENV == 'dev' ? false : 'none',
      secure: NODE_ENV == 'dev' ? false : true,
    });

    return successfulRes(res, 200, 'You have been logged out successfully');
  } catch (err) {
    return failedRes(res, 500, 'Invalid logout operation');
  }
};

exports.resetPassword = async (req, res) => {
  const { current_password, new_password } = req.body;
  const user_id = res.locals.user.id;
  try {
    const user = await User.findById(user_id).exec();
    if (!user) {
      return failedRes(res, 400, new Error('User not found'));
    }
    const matched = bcrypt.compareSync(current_password, user.password);
    if (!matched) {
      return failedRes(res, 400, new Error('Current password is invalid'));
    } else {
      user.password = bcrypt.hashSync(new_password, 10);
      await user.save();
      return successfulRes(res, 200, 'Password has been changed successfully');
    }
  } catch (e) {
    return failedRes(res, 500, e);
  }
};

exports.emailVerification = async (req, res) => {
  const hash = req.params.hash;
  try {
    const hashDoc = await Verification.findOne({ verification_hash: hash }).exec();
    if (hashDoc) {
      const user = await User.findById(hashDoc.user_id).exec();
      user.is_verified = true;
      await user.save();
      await Verification.deleteMany({ user_id: user.id });
      return successfulRes(res, 200, { msg: 'Email verified successfully' });
    } else {
      throw new Error('Invalid verification link');
    }
  } catch (e) {
    return failedRes(res, 500, e);
  }
};

exports.reverifyEmail = async (req, res) => {
  try {
    const user = req.session.user;

    const hash = crypto.createHmac('sha256', TOKENKEY).update(user._id.toString()).digest('hex');
    const verfCode = new Verification({ verification_hash: hash, user_id: user._id });
    await verfCode.save();
    const info = await smtpMail(
      user.email,
      'GoWhats',
      to_email,
      'GoWhats email verification',
      verificationMsg(`${user.first_name} ${user.last_name}`, baseUrlWeb, hash),
    );

    return successfulRes(res, 201, { email_verifiction: info.response });
  } catch (e) {
    return failedRes(res, 500, e);
  }
};
