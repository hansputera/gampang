const { Client, SessionManager, CommandLoader } = require('../dist/index.js');
const path = require('node:path');

const session = new SessionManager(
  path.resolve(__dirname, 'sessions'),
  'folder',
);
// const sessionFile = new SessionManager(
//   path.resolve(__dirname, 'session.json'),
//   'file',
// );
const client = new Client(session, {
  'qr': {
    'store': 'web',
    'options': {
      'port': 3000,
    },
  },
  'prefixes': ['.'],
});

const commandLoader = new CommandLoader(
  client,
  path.resolve(__dirname, 'commands'),
);
void commandLoader.load();

client.on('message', (ctx) => {
  console.log(
    ctx.text,
    '::from::',
    ctx.authorNumber,
    '::on::',
    ctx.getCurrentJid(),
  );
});

client.on('ready', async () => {
  console.log(client.raw?.user, 'ready');
});

client.launch({
  defaultQueryTimeoutMs: undefined, // test purpose
});
