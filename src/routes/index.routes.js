const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const { Server, Socket } = require('socket.io');

//import configurations
const { socketAuthN } = require('../middlewares/authN');
const { TOKENKEY, DBURI, DBURI_remote, NODE_ENV } = require('../config/env');

//import routes
const user = require('./user.routes');
const initSocketio = require('./initSocketio.channels');

module.exports = async (app, httpServer) => {
  app.use(express.json());
  app.use(morgan('dev'));

  let clientPromise;
  if (NODE_ENV == 'dev') {
    clientPromise = mongoose
      .connect(DBURI)
      .then((conn) => {
        console.log('connected to local database successfully');
        return conn.connection.getClient();
      })
      .catch(() => {
        console.log("can't connect to remote database");
      });
  } else {
    clientPromise = mongoose
      .connect(DBURI_remote)
      .then((conn) => {
        console.log('connected to database successfully');
        return conn.connection.getClient();
      })
      .catch(() => {
        console.log("can't connect to database");
      });
  }

  // Middlewares
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Allow-Credentials', true);
    return next();
  });

  app.use(cookieParser())


  app.use(
    session({
      name: 's_id',
      secret: TOKENKEY,
      store: MongoStore.create({ clientPromise }),
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, //7 days OR ONE WEEK
        sameSite: NODE_ENV == 'dev' ? '' : 'none',
        secure: NODE_ENV == 'dev' ? false : true,
        httpOnly: NODE_ENV == 'dev' ? true: false,
      },
    })
  );

  
  //Allow all CORS-Requests
  const io = new Server(httpServer, {
    allowRequest: (req, cb) => {
      console.log('Origin: ' + req.headers.origin);
      cb(null, true);
    },
    cors: {
      credentials: true,
    },
  });

  // Socket authentication middleware
  io.use(socketAuthN);

  //Socket.io events
  io.on('connection', initSocketio);

  //Express routers
  app.use(user);
};
