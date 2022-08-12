const { Client } = require('../dist/index.js');
const path = require('node:path');

const client = new Client(path.resolve(__dirname, 'sessions'));
client.on('qr', (code) => {
  console.log('QR diterima:', code);
});

client.launch();
