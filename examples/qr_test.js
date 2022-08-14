const { Client } = require('../dist/index.js');
const path = require('node:path');

const client = new Client(path.resolve(__dirname, 'sessions'), {
  'qr': {
    'store': 'web',
    'options': {
      'port': 3000,
    },
  },
  'prefixes': ['!!'],
});

client.command('hello', {
  'aliases': ['hi', 'hey'],
  'cooldown': 1_000,
}, (ctx) => {
  ctx.reply('Hello World');
});

client.launch();
