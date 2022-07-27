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
    phone: { type: String },
    password: { type: String, required: [true, 'Password is required'] },
    is_verified: { type: Boolean, default: false },
    //
  },
  { strict: true, timestamps: true }
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

//Exclude findOne for Login password
userSchema.post(['save', 'find', 'findByIdAndUpdate', 'findByIdAndDelete'], function (doc, next) {
  if (!doc) {
    next();
  } else if (doc.length && doc.length > 0) {
    doc.forEach((e, i) => {
      doc[i].password = undefined;
    });
  } else {
    doc.password = undefined;
  }
  next();
});

const verificationSchema = new mongoose.Schema({
  verification_hash: { type: String },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = {
  User: mongoose.model('User', userSchema),
  Verification: mongoose.model('Verification', verificationSchema),
};
