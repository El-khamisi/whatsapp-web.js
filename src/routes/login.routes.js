const router = require('express').Router();
const { logUser, regUser, logout, resetPassword, reverifyEmail, emailVerification } = require('../controllers/login.controller');
const { authN } = require('../middlewares/authN');

router.post('/login', logUser);
router.post('/signup', regUser);
router.post('/logout', logout);
router.put('/reset-password', authN, resetPassword);
router.get('/email-confirmation/:hash', emailVerification);
router.post('/email-verification', authN, reverifyEmail);

module.exports = router;
