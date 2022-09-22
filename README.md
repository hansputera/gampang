# Gampang

"Gampang" adalah WhatsApp Bot framework yang dibuat oleh anak bangsa dan berdiri diatas library [@adiwajshing/baileys](https://npmjs.com/package/baileys)

## Installation

Instalasi sangatlah mudah, kalian bisa menggunakan package manager kesukaan kalian. Contoh:

```
    pnpm add gampang
```

atau

```
    npm i gampang
```

atau

```
    yarn add gampang
```

## Usage

Sangatlah gampang sekali untuk menggunakannya

```js
const { Client, SessionManager } = require('gampang');

const client = new Client(
  new SessionManager(
    'folder_session', //  ini bisa di-isi dengan path session (bisa folder, dan file)
    'folder', // isi 'file' jika ingin menggunakan file.
  ),
  {
    'qr': {
      'store': 'file',
      'options': {
        'dest': 'qr.png',
      },
    },
  },
); // 'folder_session' bisa arahin ke direktori session kalian yah

client.on('message', async (context) => {
  if (context.text.toLowerCase() === 'halo') {
    await context.reply('Halo juga!!');
  }
});

client.launch(); // jalankan bot
```
