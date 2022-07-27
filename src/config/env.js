require('dotenv').config();

module.exports = {
  PORT: process.env.PORT,
  DBURI: process.env.DBURI,
  DBURI_remote: process.env.DBURI_remote,
  TOKENKEY: process.env.TOKENWORD,

  NODE_ENV: process.env.NODE_ENV,
};
