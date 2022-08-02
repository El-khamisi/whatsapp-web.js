const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const validator = require('validator');

//configuration
const { TOKENKEY } = require('../config/env');

const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, trim: true, required: true },
    last_name: { type: String, trim: true },
    email: { type: String, trim: true, required: [true, 'Email is required'], unique: true, validate: [validator.isEmail, 'Invalid Email'] },
    photo: { type: String, trim: true },
    password: { type: String, required: [true, 'Password is required'] },
    is_verified: { type: Boolean, default: false },
    role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
    accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }],
    balance: {
      _id: false,
      usd: { type: Number, set: (v) => Math.round(v * 100) / 100, default: 0.0 },
      sar: { type: Number, set: (v) => Math.round(v * 100) / 100, default: 0.0 },
      last_exchange: { type: Date },
    },
  },
  { strict: true, timestamps: true }
);

const accountSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, trim: true, required: true },
    is_verified: { type: Boolean, default: false },
    type: { type: String, enum: ['chat', 'bot', 'chat&bot'], required: true },
    mobile: { type: String, trim: true, required: true },
    bot: { type: String, trim: true, required: true },
  },
  { timestamps: true }
);

userSchema.methods.generateToken = function (req, res) {
  const token = jwt.sign(
    {
      id: this._id,
      name: this.first_name + ' ' + this.last_name,
      email: this.email,
    },
    TOKENKEY,
    { expiresIn: '7d' }
  );

  return token;
};

// Exclude password from the response
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

//Exclude findOne for Login password
// userSchema.post(['save', 'find', 'findByIdAndUpdate', 'findByIdAndDelete'], function (doc, next) {
//   if (!doc) {
//     next();
//   } else if (doc.length && doc.length > 0) {
//     doc.forEach((e, i) => {
//       doc[i].password = undefined;
//     });
//   } else {
//     doc.password = undefined;
//   }
//   next();
// });

const verificationSchema = new mongoose.Schema({
  verification_hash: { type: String },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = {
  Account: mongoose.model('Account', accountSchema),
  User: mongoose.model('User', userSchema),
  Verification: mongoose.model('Verification', verificationSchema),
};
