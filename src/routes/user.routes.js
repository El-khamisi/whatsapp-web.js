const router = require('express').Router();
const { authN } = require('../middlewares/authN');
const { logUser, regUser, logout, resetPassword, reverifyEmail, emailVerification } = require('../controllers/login.controller');
const { profileView, profileUpdate, profileDelete, addAccount } = require('../controllers/profile.controller');

//Authentication routes
router.post('/login', logUser);
router.post('/signup', regUser);
router.post('/logout', logout);
router.put('/reset-password', authN, resetPassword);
router.get('/email-confirmation/:hash', emailVerification);
router.post('/email-verification', authN, reverifyEmail);

//Profile routes
router.get('/myprofile', authN, profileView);
router.put('/myprofile', authN, profileUpdate);
router.delete('/myprofile', authN, profileDelete);

//Account routes
router.post('/myprofile/accounts', authN, addAccount);
module.exports = router;
