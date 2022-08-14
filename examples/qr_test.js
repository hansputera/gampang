const { Client } = require('../dist/index.js');
const path = require('node:path');

const client = new Client(path.resolve(__dirname, 'sessions'), {
  'qr': {
    'store': 'web',
    'options': {
      'port': 3000,
    },
  },
});

client.on('message', async (ctx) => {
  if (ctx.text.toLowerCase() === 'halo') {
    await ctx.reply('Halo kak!');
  }
});

client.launch();
