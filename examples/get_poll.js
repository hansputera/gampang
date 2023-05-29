const { Client, SessionManager } = require('../dist/index.js');
const path = require('node:path');

const polls = {};

const session = new SessionManager(
  path.resolve(__dirname, 'sessions'),
  'folder',
);

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

client.on('poll', (poll) => (polls[poll.pollId] = poll));
client.on('vote', async (vote, ctx) => {
  const poll = polls[vote.pollId];

  if (poll) {
    console.log('vote', vote);
    console.log('saved poll', poll);
    console.log('raw message', ctx.raw);
    const dec = await ctx.getPollUpdateMessage(
      poll.encKey,
      poll.options,
      poll.sender,
      true,
    );

    console.log(dec);
  }
});

client.command('is-work', async (ctx) => {
  console.log(await ctx.reply('It works!'));
});

client.command('test-poll', async (ctx) => {
  console.log(
    'Poll Result: ',
    await ctx.createPoll('Poll Test', ['Apple', 'Orange']),
  );
});

client.launch();
