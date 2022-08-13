import { ClientOptions } from '../@typings';
import qrcode from 'qrcode';
import http from 'node:http';

export const qrHandler = async (
  qr: string,
  qrOptions: ClientOptions['qr'],
): Promise<void> => {
  if (qrOptions.storeType === 'file') {
    if (typeof qrOptions.options.dest !== 'string')
      throw new TypeError('Please fill QR Path destination!');
    qrcode.toFile(qrOptions.options.dest, qr, (err) => {
      if (err) console.error('Something was wrong:', err);
    });
  } else if (qrOptions.storeType === 'web') {
    if (typeof qrOptions.options.port !== 'number')
      throw new TypeError('Please fill QR Server Port number');

    const server = http.createServer();

    server.on('request', (_, res) => {
      return qrcode.toFileStream(res, qr);
    });

    server.on('listening', () => {
      setTimeout(() => {
        server.close();
      }, 30_000);
    });

    server.on('error', (err) => {
      if (/eaddrinuse/gi.test(err.message)) {
        (qrOptions.options.port as number)++;
        server.close();
        server.listen(qrOptions.options.port);
      }
    });

    server.listen(qrOptions.options.port, '0.0.0.0');
  } else if (qrOptions.storeType === 'terminal') {
    console.log(qrcode.toString(qr));
  }
  return;
};
