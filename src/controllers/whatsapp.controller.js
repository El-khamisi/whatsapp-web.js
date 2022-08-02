const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');

const { WSESSION_FILE_PATH } = require('../config/env');
const { emitLogs } = require('../utils/writeLogs');
const whatsappEventHandler = require('./whatsappEventHandler');

class whatsappClientEvents {
  constructor(socket) {
    this.socket = socket;
  }

  init = async (payload) => {
    try {
      const { account_id } = payload;
      if (!account_id) throw new Error('account_id is required');

      //First we need to check if the user has a session file
      if (!fs.existsSync(WSESSION_FILE_PATH)) {
        fs.mkdirSync(WSESSION_FILE_PATH);
      }
      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: account_id,
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
      const wHandlerInstance = new whatsappEventHandler(this.socket, this.client);

      /*Emitted when qr code*/
      this.client.on('qr', (qr) => wHandlerInstance.qrHandler(qr));

      //Authentication handlers
      this.client.on('authenticated', () => wHandlerInstance.authenticated());
      this.client.on('auth_failure', (message) => wHandlerInstance.auth_failure(message));

      //State handlers
      this.client.on('change_state', (state) => wHandlerInstance.change_state(state));
      this.client.on('ready', () => wHandlerInstance.ready());
      this.client.on('disconnected', (reason) => wHandlerInstance.disconnected(reason));

      //Calls handlers
      this.client.on('incoming_call', (call) => wHandlerInstance.incoming_call(call));

      //Messages handlers
      this.client.on('message_ack', (msg, ack) => wHandlerInstance.message_ack(msg, ack));

      await this.client.initialize();
      this.socket.emit('wlogs', `Client has been initialized`);
    } catch (err) {
      emitLogs(this.socket, `ERROR::${err.message}`);
    }
  };

  getChats = () => {
    try {
      this.client
        .getChats()
        .then((data) => this.socket.emit('wdata', { data }))
        .catch((err) => this.socket.emit('wlogs', err.message));
    } catch (err) {
      emitLogs(this.socket, `ERROR::${err.message}`);
    }
  };

  getContactById = (payload) => {
    try {
      const { contactId } = payload;
      this.client
        .getContactById(contactId)
        .then((data) => {
          contact.id = contact.id._serialized;
          this.socket.emit('wdata', { data });
        })
        .catch((err) => this.socket.emit('wlogs', err.message));
    } catch (err) {
      console.log(err.message);
      this.socket.emit('iologs', { err: err.message });
    }
  };

  getContacts = () => {
    try {
      this.client
        .getContacts()
        .then((data) => {
          contacts.forEach((e, i) => (contacts[i].id = e.id._serialized));
          this.socket.emit('wdata', { data });
        })
        .catch((err) => this.socket.emit('wlogs', err.message));
    } catch (err) {
      console.log(err.message);
      this.socket.emit('iologs', { err: err.message });
    }
  };

  sendMsgTo = async (payload) => {
    try {
      const { users, msgBody } = payload;
      if (!users) throw new Error(`Users in undefined`);

      if (!Array.isArray(users)) {
        const arr = [];
        arr.push(users);
        users = arr;
      }

      const response = [];
      for (const e of users) {
        const msg = await this.client
          .sendMessage(`${e}@c.us`, msgBody)
          .then((msg) => msg)
          .catch((err) => socket.emit('wlogs', err.message));
        response.push(msg);
      }
      this.socket.emit('wdata', { data: response });
    } catch (err) {
      console.log(err.message);
      this.socket.emit('iologs', { err: err.message });
    }
  };
}

module.exports = whatsappClientEvents;
