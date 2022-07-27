const whatsappEventHandler = require('./whatsappEventHandler');

class whatsappClientEvents {
  constructor(socket, client) {
    this.socket = socket;
    this.client = client;
  }

  init = () => {
    try {
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

      this.client.initialize();
      this.socket.emit('wlogs' ,`Client has been initialized`);
    } catch (err) {
      console.log(err.message);
      this.socket.emit('ioerr', {err: err.message});
    }
  };

  getChats = () => {
    try {
      this.client
        .getChats()
        .then((data) => this.socket.emit('wdata', { data }))
        .catch((err) => this.socket.emit('wlogs', err.message));
    } catch (err) {
      console.log(err.message);
      this.socket.emit('ioerr', {err: err.message});
    }
  };

  getContactById = (payload) => {
    try {
      const {contactId} = payload;
      this.client
        .getContactById(contactId)
        .then((data) => {
          contact.id = contact.id._serialized;
          this.socket.emit('wdata', { data });
        })
        .catch((err) => this.socket.emit('wlogs', err.message ));
    } catch (err) {
      console.log(err.message);
      this.socket.emit('ioerr', {err: err.message});
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
        .catch((err) => this.socket.emit('wlogs', err.message ));
    } catch (err) {
      console.log(err.message);
      this.socket.emit('ioerr', {err: err.message});
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
          .catch((err) => socket.emit('wlogs', err.message ));
        response.push(msg);
      }
      this.socket.emit('wdata', { data: response });
    } catch (err) {
      console.log(err.message);
      this.socket.emit('ioerr', {err: err.message});
    }
  };
}

module.exports = whatsappClientEvents;
