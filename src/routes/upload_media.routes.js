const fs = require('fs');
const { upload_image, upload_raw } = require('../../config/cloudinary');
const { imageUpload, fileUpload } = require('../../config/multer');
const { failedRes, successfulRes } = require('../../utils/response');

const { authN } = require('../../middlewares/authN');

const router = require('express').Router();

router.post('/upload-photo', authN, imageUpload.single('photo'), async (req, res) => {
  try {
    const file = req.file;
    const user = req.user;
    const folderName = req.body.folderName ? req.body.folderName : 'photos';
    const photoName = `${new Date().toISOString()}-${user.id}`;

    const url = await upload_image(file.path, photoName, folderName);
    if (fs.existsSync(file.path)) {
      fs.rmSync(file.path);
    }
    return successfulRes(res, 200, { photo_url: url });
  } catch (e) {
    return failedRes(res, 500, e);
  }
});

router.post('/upload-file', authN, fileUpload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const user = req.user;
    const folderName = req.body.folderName ? req.body.folderName : 'files';
    const videoName = `${new Date().toISOString()}-${user.id}`;

    const url = await upload_raw(file.path, videoName, folderName);
    if (fs.existsSync(file.path)) {
      fs.rmSync(file.path);
    }
    return successfulRes(res, 200, { file_url: url });
  } catch (err) {
    return failedRes(res, 500, err);
  }
});

module.exports = router;
