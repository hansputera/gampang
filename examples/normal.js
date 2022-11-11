const { Client, SessionManager } = require('../dist/index.js');
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

client.on('ready', () => {
  console.log(client.raw?.user, 'ready');
});

client.command(
  'col',
  async (ctx) => {
    const collector = ctx.getCollector({
      'max': 5,
      'validation': async () => true,
    });

    collector.start();
    await collector.wait();

    console.log(collector.contexts[0].text);
  },
  {
    aliases: ['collector'],
  },
);

client.command(
  'test',
  (ctx) => {
    ctx.reply('pong');
  },
  {
    aliases: ['-', 'ping', 'pong'],
    cooldown: 1_000,
  },
);

client.command(
  'debug',
  async (ctx) => {
    // test feature on this scope
  },
  {
    'aliases': ['hi', 'hey', '_'],
    'cooldown': 1_000,
  },
);

client.command(
  'poll',
  async (ctx) => {
    await ctx.createPoll('Test', ['Apple', 'Orange']);
  },
  {
    aliases: ['testpoll'],
  },
);

client.on('poll', console.log);
client.on('vote', console.log);

client.launch();
