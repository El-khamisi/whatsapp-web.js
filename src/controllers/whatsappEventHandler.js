const qrcode = require('qrcode-terminal');

class Handlers {
  constructor(socket, client) {
    this.socket = socket;
    this.client = client;
  }

  qrHandler = (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
    this.socket.emit('wlogs', { qrCode: qr });
  };

  authenticated = () => {
    const user = this.socket.user;
    console.log(user);
    console.log('Whatsapp Web Client has been authenticated');
    this.socket.emit('wlogs', `Whatsapp Web Client has been authenticated`);
  };

  auth_failure = (message) => {
    console.log('Whatsapp Web Client has been Failed to authenticated');
    this.socket.emit('wlogs', `Whatsapp Web Client has been Failed to authenticated | ${message}`);
  };

  change_state = (state) => {
    console.log(`change_state ${state}`);
    this.socket.emit('wlogs', `change_state ${state}`);
  };

  ready = () => {
    console.log('Whatsapp Web Client is ready!');
    this.socket.emit('wlogs', `Whatsapp Web Client is ready!`);
  };

  disconnected = (reason) => {
    console.log(`Client  has been disconnected || ${reason}`);
    this.socket.emit('wlogs', `Client has been disconnected || ${reason}`);
  };

  incoming_call = (call) => {
    console.log(` has incoming call`);
    this.socket.emit('wlogs', ` has incoming call`);
  };

  message_ack = async (msg, ack) => {
    const ackValues = {
      '-1': 'ACK_ERROR',
      0: 'ACK_PENDING',
      1: 'ACK_SENT',
      2: 'ACK_RECEIVED',
      3: 'ACK_READ',
      4: 'ACK_PLAYED',
    };
    if (ack != 0) {
      const msgTo = await this.client
        .getContactById(msg.to)
        .then((data) => data.name)
        .catch((err) => this.socket.emit('wlogs', { err: err.message }));
      this.socket.emit('wlogs', { msgTo, ack: ackValues[`${ack}`] });
    }
  };
}

module.exports = Handlers;
