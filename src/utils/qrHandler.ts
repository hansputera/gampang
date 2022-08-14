import { ClientOptions } from '../@typings';
import qrcode from 'qrcode';
import http from 'node:http';
import { Client } from '../bot';

export const qrHandler = async (
  client: Client,
  qr: string,
  qrOptions: ClientOptions['qr'],
): Promise<void> => {
  if (qrOptions?.store === 'file') {
    if (typeof qrOptions?.options?.dest !== 'string')
      throw new TypeError('Please fill QR Path destination!');
    qrcode.toFile(qrOptions?.options.dest, qr, (err) => {
      if (err) console.error('Something was wrong:', err);
    });
  } else if (qrOptions?.store === 'web') {
    if (!qrOptions.options?.port || typeof qrOptions.options?.port !== 'number')
      throw new TypeError('Please fill QR Server Port number');

    if (!client.qrServer) client.qrServer = http.createServer();
    let port = qrOptions.options.port;

    client.qrServer.on('request', async (_, res) => {
      res.setHeader('Content-Type', 'text/html');
      return res.end(`<img src="${await qrcode.toDataURL(qr)}" />`);
    });

    client.qrServer.on('error', (err) => {
      if (/eaddrinuse/gi.test(err.message)) {
        port++;
        client.qrServer?.close();
        client.qrServer?.listen(port);
      }
    });

    client.qrServer?.listen(port, '0.0.0.0');
  } else if (qrOptions?.store === 'terminal') {
    console.log(await qrcode.toString(qr));
  }
  return;
};
