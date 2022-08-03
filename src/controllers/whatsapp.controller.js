const fs = require('fs');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

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

      this.socket.account_id = account_id;
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
      this.client.on('message', (msg) => wHandlerInstance.message(msg));
      this.client.on('message_ack', (msg, ack) => wHandlerInstance.message_ack(msg, ack));

      await this.client.initialize();
      this.socket.emit('wlogs', `Client has been initialized`);
    } catch (err) {
      emitLogs(this.socket, `ERROR::${err.message}`);
    }
  };

  logout = () => {
    try {
      // this.client.logout();
      this.client.destroy();
      this.socket.emit('wlogs', `Client has been disconnected`);
    } catch (err) {
      emitLogs(this.socket, `ERROR::${err.message}`);
    }
  };

  getChats = () => {
    try {
      this.client
        .getChats()
        .then((data) => this.socket.emit('wdata', { data }))
        .catch((err) => this.socket.emit('wlogs', `ERROR::${err.message}`));
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
        .catch((err) => this.socket.emit('wlogs', `ERROR::${err.message}`));
    } catch (err) {
      emitLogs(this.socket, `ERROR::${err.message}`);
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
        .catch((err) => this.socket.emit('wlogs', `ERROR::${err.message}`));
    } catch (err) {
      emitLogs(this.socket, `ERROR::${err.message}`);
    }
  };

  sendMsgTo = async (payload) => {
    try {
      let { users, text, base64, mimeType } = payload;
      if (!users) throw new Error(`users in undefined`);

      if (!Array.isArray(users)) {
        const arr = [];
        arr.push(users);
        users = arr;
      }

      const response = [];
      for (const e of users) {
        const msg = await this.client
          .sendMessage(`${e}@c.us`, text)
          .then((msg) => msg)
          .catch((err) => this.socket.emit('wlogs', `ERROR::${err.message}`));

        if (base64 && mimeType) {
          console.log('media')
          const media = new MessageMedia(mimeType, base64);
          const msgMedia = await this.client
            .sendMessage(`${e}@c.us`, media)
            .then((msg) => msg)
            .catch((err) => this.socket.emit('wlogs', `ERROR::${err.message}`));
          response.push(msgMedia);
        }

        // response.push(msg);
      }
      this.socket.emit('wdata', { data: response });
    } catch (err) {
      emitLogs(this.socket, `ERROR::${err.message}`);
    }
  };
}

module.exports = whatsappClientEvents;
