const { disconnect } = require('../controllers/initSocketio');
// const { initWhatsappClient, sendMsgTo, wlogout, getChats, getContactById, getContacts } = require('../controllers/whatsapp.controller');
const { Client, LocalAuth } = require('whatsapp-web.js');

const initWhatsappClient = require('../controllers/whatsapp.controller');
const SESSION_FILE_PATH = './.wwebjs_auth';

module.exports = function (socket) {

  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: socket.user.id,
      dataPath: SESSION_FILE_PATH,
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

  const init = new initWhatsappClient(socket, client);
  console.log(`A user connected to Socket.io #${socket.id}`);
  // socket.on('disconnect', disconnect);

  socket.on('w:init', init.main);

  //Chats
  socket.on('chats:getAll', init.getChats);

  //Contacts
  socket.on('contacts:getAll', init.getContacts);
  socket.on('contacts:getById', init.getContactById);

  //Messages
  socket.on('msg:send', init.sendMsgTo);

  // socket.on('w:logout', wlogout);
};
