import type { ClientOptions } from '../@typings';
import qrcode from 'qrcode';
import http from 'node:http';
import type { Client } from '../bot';
import { existsSync, unlinkSync } from 'node:fs';
import { resolve as pathResolve } from 'node:path';

export const qrHandler = async (
  client: Client,
  qrOptions: ClientOptions['qr'],
): Promise<void> => {
  client.logger.info('QR Handler initialized');
  let qr: string = '';

  const defineQrCode = async (code: string) => {
    if (qrOptions?.store === 'file' && code.length) {
      if (typeof qrOptions?.options?.dest !== 'string')
        throw new TypeError('Please fill QR Path destination!');
      qrcode.toFile(qrOptions?.options?.dest as string, code, (err) => {
        if (err) console.error('Something was wrong:', err);
        else {
          const pathFile = qrOptions.options?.dest;
          if (typeof pathFile === 'string' && existsSync(pathResolve(pathFile))) {
            client.on('ready', () => {
              unlinkSync(pathResolve(pathFile));
            });
          }
        }
      });
    } else if (qrOptions?.store === 'terminal' && code.length) {
      console.log(
        await qrcode.toString(code, {
          'type': 'terminal',
          'small': true,
        }),
      );
    }

    qr = code;
  };

  if (qrOptions?.store === 'web') {
    if (!qrOptions.options?.port || typeof qrOptions.options?.port !== 'number')
      throw new TypeError('Please fill QR Server Port number');
    client.qrServer = http.createServer();

    let port = qrOptions.options?.port;

    client.qrServer?.on('request', async (_, res) => {
      res.setHeader('Content-Type', 'text/html');
      return res.end(qr.length ? `<img src="${await qrcode.toDataURL(qr)}" />` : 'no qr');
    });

    client.qrServer?.on('error', (err) => {
      if (/eaddrinuse/gi.test(err.message)) {
        port++;
        client.qrServer?.close();
        client.qrServer?.listen(port);
      }
    });

    client.qrServer.listen(port);
  }

  client.removeListener('qr', defineQrCode);
  client.on('qr', defineQrCode);
  return;
};
