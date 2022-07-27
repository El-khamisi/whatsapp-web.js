const qrcode = require('qrcode-terminal');

class whatsappEventHandler {
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
    this.socket.emit('wlogs', `Whatsapp Web Client has been authenticated`);
  };

  auth_failure = (message) => {
    this.socket.emit('wlogs', `Whatsapp Web Client has been Failed to authenticated | ${message}`);
  };

  change_state = (state) => {
    this.socket.emit('wlogs', `change_state ${state}`);
  };

  ready = () => {
    this.socket.emit('wlogs', `Whatsapp Web Client is ready!`);
  };

  disconnected = (reason) => {
    this.socket.emit('wlogs', `Client has been disconnected || ${reason}`);
  };

  incoming_call = (call) => {
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

module.exports = whatsappEventHandler;
