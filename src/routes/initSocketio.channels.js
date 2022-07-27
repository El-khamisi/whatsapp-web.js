const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');

const { WSESSION_FILE_PATH } = require('../config/env');
const whatsappClientEvents = require('../controllers/whatsapp.controller');

module.exports = function (socket) {
  //First we need to check if the user has a session file
  if (!fs.existsSync(WSESSION_FILE_PATH)) {
    fs.mkdirSync(WSESSION_FILE_PATH);
  }
  const wclient = new Client({
    authStrategy: new LocalAuth({
      clientId: socket.user.id,
      dataPath: WSESSION_FILE_PATH,
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process', // <- this one doesn't works in Windows
        '--disable-gpu',
      ],
    },
  });

  const wEventsInstance = new whatsappClientEvents(socket, wclient);

  console.log(`A user connected to Socket.io #${socket.id}`);

  //wInitializetion
  socket.on('w:init', wEventsInstance.init);
  // socket.on('w:logout', wlogout);

  //wChats
  socket.on('chats:getAll', wEventsInstance.getChats);

  //wContacts
  socket.on('contacts:getAll', wEventsInstance.getContacts);
  socket.on('contacts:getById', wEventsInstance.getContactById);

  //wMessages
  socket.on('msgs:send', wEventsInstance.sendMsgTo);

  // socket.on('disconnect', disconnect);
};
