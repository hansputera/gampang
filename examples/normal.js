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
    'store': 'file',
    'options': {
      'dest': path.resolve(__dirname, 'scan.jpg'),
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
    
    // send a buttons message!
    const buttons = [
      { buttonId: 'id1', buttonText: { displayText: 'Button 1' }, type: 1 },
      { buttonId: 'id2', buttonText: { displayText: 'Button 2' }, type: 1 },
      { buttonId: 'id3', buttonText: { displayText: 'Button 3' }, type: 1 },
    ];

    const buttonMessage = {
      text: "Hi it's button message",
      footer: 'Hello World',
      buttons: buttons,
      headerType: 1,
    };

    await ctx.replyWithButton(buttonMessage);

    //send a template message!
    const templateButtons = [
      // {index: 1, urlButton: {displayText: '⭐ Star Baileys on GitHub!', url: 'https://github.com/adiwajshing/Baileys'}},
      // {index: 2, callButton: {displayText: 'Call me!', phoneNumber: '+1 (234) 5678-901'}},
      {
        index: 1,
        quickReplyButton: {
          displayText: 'test 1',
          id: 'test',
        },
      },
      {
        index: 2,
        quickReplyButton: {
          displayText: 'test 2',
          id: 'id-like-buttons-message-2',
        },
      },
    ];

    const templateMessage = {
      text: "Hi it's a template message",
      viewOnce: true,
      footer: 'Hello World',
      templateButtons: templateButtons,
    };

    await ctx.replyWithButton(templateMessage);

    // send a list message!
    const sections = [
      {
        title: 'Section 1',
        rows: [
          { title: 'Option 1', rowId: 'option1' },
          {
            title: 'Option 2',
            rowId: 'option2',
            description: 'This is a description',
          },
        ],
      },
      {
        title: 'Section 2',
        rows: [
          { title: 'Option 3', rowId: 'option3' },
          {
            title: 'Option 4',
            rowId: 'option4',
            description: 'This is a description V2',
          },
        ],
      },
    ];

    const listMessage = {
      text: 'This is a list',
      footer: 'nice footer, link: https://google.com',
      title: 'Amazing boldfaced list title',
      buttonText: 'Required, text on the button to view the list',
      sections,
    };

    await ctx.replyWithButton(listMessage);
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

client.addCustomEvent('messages.upsert', (_, { messages }) => {
  console.log(JSON.stringify(messages));
});

client.launch();
