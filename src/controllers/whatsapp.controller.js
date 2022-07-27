const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');
const Handlers = require('./whatsappEventHandler');

const SESSION_FILE_PATH = './.wwebjs_auth';



class initWhatsappClient {

  constructor(socket, client) {
    this.socket = socket;
    this.client = client;
  }
  
  // user = this.socket.user;
  
  main = ()=> {
    try {
      if (!fs.existsSync(SESSION_FILE_PATH)) {
        fs.mkdirSync(SESSION_FILE_PATH);
      }
      
      const handlers = new Handlers(this.socket, this.client);
  
      this.client.on('qr', (qr) => handlers.qrHandler(qr));
  
      //Authentication
      this.client.on('authenticated', () => handlers.authenticated());
      this.client.on('auth_failure', (message) => handlers.auth_failure(message));
  
      //whatsapp client change state
      this.client.on('change_state', (state) => handlers.change_state(state));
      this.client.on('ready', () => handlers.ready());
      this.client.on('disconnected', (reason) => handlers.disconnected(reason));
  
      //Calls
      this.client.on('incoming_call', (call) => handlers.incoming_call(call));
  
      //Messages
      this.client.on('message_ack', (msg, ack) => handlers.message_ack(msg, ack));
  
      this.client.initialize();
      console.log(`Client has been initialized`);
    } catch (err) {
      console.log(err.message);
      this.socket.emit('ioerr', err.message);
    }  
  }
  
  getChats =()=> {
    
    try {
      this.client
        .getChats()
        .then((data) => this.socket.emit('wdata', { data }))
        .catch((err) => this.socket.emit('wlogs', { err: err.message }));
    } catch (err) {
      console.log(err.message);
      this.socket.emit('ioerr', err.message);
    }
  };
  
  getContactById =(contactId)=> {
    
    try {
      this.client
        .getContactById(contactId)
        .then((data) => {
          data.id = data.id._serialized;
          this.socket.emit('wdata', { data });
        })
        .catch((err) => this.socket.emit('wlogs', { err: err.message }));
    } catch (err) {
      console.log(err.message);
      this.socket.emit('ioerr', err.message);
    }
  };
  
  getContacts =()=> {
    
    try {
      this.client
        .getContacts()
        .then((data) => {
          data.forEach((e, i) => (data[i].id = e.id._serialized));
          this.socket.emit('wdata', { data });
        })
        .catch((err) => this.socket.emit('wlogs', { err: err.message }));
    } catch (err) {
      console.log(err.message);
      this.socket.emit('ioerr', err.message);
    }
  };
  
   sendMsgTo =async(args)=> {
    
    try {
      const { users, msgBody } = args;
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
          .catch((err) => socket.emit('wlogs', { err: err.message }));
        response.push(msg);
      }
      this.socket.emit('wlogs', { data: response });
    } catch (err) {
      console.log(err.message);
      this.socket.emit('ioerr', err.message);
    }
  };
};


module.exports = initWhatsappClient;