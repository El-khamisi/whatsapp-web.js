const express = require('express');
const {createServer} = require('http');

//Config
const { PORT, NODE_ENV } = require('./src/config/env.js');

const port = PORT || 8080;


//Create Application
const app = express();
//Socket.io initialization
const httpServer = createServer(app);

const endpoints = require('./src/routes/index.routes');
endpoints(app, httpServer);

if (NODE_ENV == 'dev') {
  httpServer.listen(process.argv[2], () => {
    console.log(`Development connected successfully ON PORT-${process.argv[2]}`);
  });
} else {
  httpServer.listen(port, () => {
    console.log(`Production connected successfully ON port-${port}`);
  });
}

module.exports = httpServer;