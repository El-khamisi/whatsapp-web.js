require('dotenv').config();

module.exports = {
  PORT: process.env.PORT,
  DBURI: process.env.DBURI,
  DBURI_remote: process.env.DBURI_remote,
  TOKENKEY: process.env.TOKENWORD,

  NODE_ENV: process.env.NODE_ENV,

  WSESSION_FILE_PATH: process.env.WSESSION_FILE_PATH,
};
