const fs = require('fs');
const path = require('path');

const IOLOGSFILE = path.join(__dirname, '/../../iologs.txt');

exports.emitLogs = (socket, msg) => {
  fs.writeFile(IOLOGSFILE, msg + '\n', { flag: 'a+' }, (err) => {
    if (err) {
      console.log(err);
    }
  });
  socket.emit('iologs', msg + '\n');
};
