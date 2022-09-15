import { getMediaKeys, MediaType } from '@adiwajshing/baileys';
import { createCipheriv } from 'node:crypto';
import https from 'node:https';
import { Transform } from 'node:stream';

/**
 * Decrypt encrypted whatsapp media
 * @param {string} url WhatsApp Encrypted Media URL
 * @param {Uint8Array} mediaKey WhatsApp Media Key
 * @param {MediaType} type WhatsApp Media Type
 * @return {Transform}
 */
export const decryptMedia = async (
  url: string,
  mediaKey: Uint8Array,
  type: MediaType,
): Promise<Buffer> => {
  let buffer = Buffer.alloc(0);
  let remainBytes = Buffer.alloc(0);
  const { cipherKey, iv } = getMediaKeys(mediaKey, type);
  const aes = createCipheriv('aes-256-cbc', cipherKey, iv);
  aes.setAutoPadding(false);

  return new Promise(function (resolve) {
    https.get(
      url,
      {
        'timeout': 10_000,
      },
      (res) => {
        res
          .on('data', (chunk) => {
            console.log(Buffer.isBuffer(chunk), 'on data');
            buffer = Buffer.concat([buffer, Buffer.from(chunk)]);
          })
          .on('end', () => {
            console.log('end fro');
            resolve(buffer);
          })
          .pipe(
            new Transform({
              'transform'(chunk, _, callback) {
                console.log(Buffer.isBuffer(chunk), 'on transform');
                let data = Buffer.concat([remainBytes, chunk]);

                const decLength = Math.floor(data.length / 16) * 16;
                remainBytes = data.subarray(decLength);
                data = data.subarray(0, decLength);

                try {
                  this.push(aes.update(chunk));
                  callback();
                } catch (error) {
                  callback(error as Error);
                }
              },
              final(callback) {
                try {
                  console.log('final');
                  this.push(aes.final());
                  callback();
                } catch (error) {
                  callback(error as Error);
                }
              },
            }),
            {
              'end': true,
            },
          );
      },
    );
  });
};
