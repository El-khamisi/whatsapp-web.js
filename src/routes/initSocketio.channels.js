const whatsappClientEvents = require('../controllers/whatsapp.controller');
const { uploadMedia } = require('../utils/socketMedia');
const { emitLogs } = require('../utils/writeLogs');

module.exports = function (socket) {
  const wEventsInstance = new whatsappClientEvents(socket);

  emitLogs(socket, `A user connected to Socket.io #${socket.id}`);

  //wInitializetion
  socket.on('w:init', wEventsInstance.init);
  socket.on('w:logout', wEventsInstance.logout);

  //wChats
  socket.on('chats:getAll', wEventsInstance.getChats);

  //wContacts
  socket.on('contacts:getAll', wEventsInstance.getContacts);
  socket.on('contacts:getById', wEventsInstance.getContactById);

  //wMessages
  socket.on('msgs:send', wEventsInstance.sendMsgTo);

  //Anywhere else
  socket.onAny((eventName, ...args) => {
    const isNotRegistered = !Object.keys(socket._events).includes(eventName);
    if (isNotRegistered) {
      emitLogs(socket, `[event] ${eventName} is NOT registered`);
    }
  });
};
