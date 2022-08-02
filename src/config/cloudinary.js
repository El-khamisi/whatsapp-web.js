const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { cloudinary_name, cloudinary_api_key, cloudinary_api_secret } = require('./env');

cloudinary.config({
  cloud_name: cloudinary_name,
  api_key: cloudinary_api_key,
  api_secret: cloudinary_api_secret,
});

exports.upload_raw = async (rawPath, rawName, tag) => {
  const file = await cloudinary.uploader.upload(
    rawPath,
    {
      resource_type: 'raw',
      public_id: `goWhatsapp/assets/${tag}/${rawName}`,
      overwrite: true,
      tags: `${tag}`,
    },
    function (err, result) {
      if (err) {
        console.log(err);
        return err;
      }
    }
  );
  if (fs.existsSync(rawPath)) {
    fs.rmSync(rawPath);
  }
  return file.url;
};

exports.upload_image = async (imagePath, imageName, tag) => {
  const img = await cloudinary.uploader.upload(
    imagePath,
    {
      public_id: `goWhatsapp/assets/${tag}/${imageName}`,
      overwrite: true,
      tags: `${tag}`,
    },
    function (err, image) {
      if (err) {
        console.log(err);
        return err;
      }
    }
  );
  if (fs.existsSync(imagePath)) {
    fs.rmSync(imagePath);
  }
  return img.url;
};
