import { proto } from '@adiwajshing/baileys';
import { BaseEntity } from '.';
import { decryptMedia } from './_util';

/**
 * @class Sticker
 */
export class Sticker extends BaseEntity {
  /**
   * @param {proto.StickerMessage} raw - Sticker raw message
   */
  constructor(public raw: proto.IStickerMessage) {
    super(raw);
  }

  /**
   * Get sticker size
   *
   * @return {{height:number,width:number}}
   */
  public get size(): { height: number; width: number } {
    return {
      'height': this.raw.height as number,
      'width': this.raw.width as number,
    };
  }

  /**
   * Sticker is animated?
   *
   * @return {boolean}
   */
  public get animated(): boolean {
    return this.raw.isAnimated as boolean;
  }

  /**
   * Fetch encrypted url sticker file.
   *
   * @return {Promise<Buffer>}
   */
  public async retrieveFile(): Promise<Buffer> {
    return await new Promise((resolve) => {
      let buffer = Buffer.alloc(0);
      const stream = decryptMedia(this.encryptedUrl, this.key, 'sticker');
      stream.on('data', (chunk) => {
        buffer = Buffer.concat([buffer, Buffer.from(chunk)]);
      });

      stream.on('end', () => resolve(buffer));
    });
  }
}
