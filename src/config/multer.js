const multer = require('multer');
const fs = require('fs');
const path = require('path');

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tmpPath = path.join('tmp', 'thumbs');

    if (!fs.existsSync(tmpPath)) {
      fs.mkdirSync(tmpPath, { recursive: true });
    }
    cb(null, tmpPath);
  },
  filename: function (req, file, cb) {
    const uniquePreffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniquePreffix + file.originalname);
  },
});

const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tmpPath = path.join('tmp', 'files');

    if (!fs.existsSync(tmpPath)) {
      fs.mkdirSync(tmpPath, { recursive: true });
    }
    cb(null, tmpPath);
  },
  filename: function (req, file, cb) {
    const uniquePreffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniquePreffix + file.originalname);
  },
});

const imageUpload = multer({ storage: imageStorage });
const fileUpload = multer({ storage: fileStorage });

module.exports = {
  imageUpload,
  fileUpload,
};
