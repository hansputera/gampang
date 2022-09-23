const { Client, SessionManager } = require('../dist/index.js');
const path = require('node:path');
const sharp = require('sharp');

const session = new SessionManager(
  path.resolve(__dirname, '..', 'tes.json'),
  'file',
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
    if (!ctx.getReply())
      return ctx.reply(
        'Silahkan reply pesan yang mengandung sticker terlebih dahulu!',
      );
    const sticker = ctx.getReply().sticker;
    if (!sticker) return ctx.reply('Yang anda reply bukanlah sticker!');

    const isGIF = !!ctx.flags.find((f) => f.toLowerCase() === 'gif');
    if (isGIF && !sticker.animated)
      return ctx.reply('Are you trying to convert an image to ' + 'a GIF?');
    try {
      const stickerBuffer = await sticker.retrieveFile('sticker');
      const sharped = sharp(stickerBuffer, {
        animated: sticker.animated,
      });

      if (isGIF) {
        await ctx.replyWithVideo(await sharped.gif().toBuffer());
      } else {
        await ctx.replyWithPhoto(await sharped.png().toBuffer());
      }
    } catch (e) {
      console.log(e);
      await ctx.reply(
        'Something was wrong, try again please?\n' + 'Error: ' + e.message,
      );
    }
  },
  {
    'aliases': ['hi', 'hey', '_'],
    'cooldown': 1_000,
  },
);

client.launch();
