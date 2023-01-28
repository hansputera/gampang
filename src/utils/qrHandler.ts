import type { ClientOptions } from '../@typings';
import qrcode from 'qrcode';
import http from 'node:http';
import type { Client } from '../bot';
import { unlink } from 'node:fs/promises';

export const qrHandler = async (
  client: Client,
  qrOptions: ClientOptions['qr'],
): Promise<void> => {
  client.logger.info('QR Handler initialized');
  let qr = '';

  const defineQrCode = (code: string) => {
    qr = code;
  };

  client.removeListener('qr', defineQrCode);

  if (qrOptions?.store === 'file') {
    if (typeof qrOptions?.options?.dest !== 'string')
      throw new TypeError('Please fill QR Path destination!');
    qrcode.toFile(qrOptions?.options?.dest as string, qr, (err) => {
      if (err) console.error('Something was wrong:', err);

      client.on('ready', () =>
        unlink(qrOptions?.options?.dest as string).catch(console.error),
      );
    });
  } else if (qrOptions?.store === 'web') {
    if (!qrOptions.options?.port || typeof qrOptions.options?.port !== 'number')
      throw new TypeError('Please fill QR Server Port number');
    client.qrServer = http.createServer();

    let port = qrOptions.options?.port;

    client.qrServer?.on('request', async (_, res) => {
      res.setHeader('Content-Type', 'text/html');
      return res.end(`<img src="${await qrcode.toDataURL(qr)}" />`);
    });

    client.qrServer?.on('error', (err) => {
      if (/eaddrinuse/gi.test(err.message)) {
        port++;
        client.qrServer?.close();
        client.qrServer?.listen(port);
      }
    });

    client.qrServer.listen(port);
  } else if (qrOptions?.store === 'terminal') {
    console.log(
      await qrcode.toString(qr, {
        'type': 'terminal',
        'small': true,
      }),
    );
  }

  client.on('qr', defineQrCode);
  return;
};
