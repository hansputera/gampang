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
export const decryptMedia = (
  url: string,
  mediaKey: Uint8Array,
  type: MediaType,
): Transform => {
  const mediaResponse = https.get(url, {
    'timeout': 10_000,
  });

  let remainBytes = Buffer.alloc(0);

  const { cipherKey, iv } = getMediaKeys(mediaKey, type);
  const aes = createCipheriv('aes-256-cbc', cipherKey, iv);
  aes.setAutoPadding(false);

  return mediaResponse.pipe(
    new Transform({
      'transform'(chunk, _, callback) {
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
};
