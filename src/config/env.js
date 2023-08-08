require('dotenv').config();

module.exports = {
  PORT: process.env.PORT,
  DBURI: process.env.DBURI,
  DBURI_remote: process.env.DBURI_remote,
  TOKENKEY: process.env.TOKENWORD,

  //wWhatsApp Client
  WSESSION_FILE_PATH: process.env.WSESSION_FILE_PATH,

  //SMTP
  sendinblue_user: process.env.sendinblue_user,
  sendinblue_key: process.env.sendinblue_key,
  to_email: process.env.to_email,
  smtp_host: process.env.smtp_host,
  smtp_port: process.env.smtp_port,

  // Cloudinary
  cloudinary_name: process.env.cloudinary_name,
  cloudinary_api_key: process.env.cloudinary_api_key,
  cloudinary_api_secret: process.env.cloudinary_api_secret,

  //Environment
  baseUrl: process.env.baseUrl,
  NODE_ENV: process.env.NODE_ENV,

  // url website
  baseUrlWeb: process.env.baseUrlWeb
};
