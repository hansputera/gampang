# Gampang

"Gampang" adalah WhatsApp Bot framework yang berdiri atas library [@adiwajshing/baileys](https://npmjs.com/package/baileys)

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
const { Client } = require('gampang');

const client = new Client('folder_session'); // 'folder_session' bisa arahin ke direktori session kalian yah

client.on('qr', (code) => {
  // olah 'code' qr nya disini, untuk di scan.
});

client.on('message', async (context) => {
  if (context.text.toLowerCase() === 'halo') {
    await context.reply('Halo juga!!');
  }
});

client.launch(); // jalankan bot
```
