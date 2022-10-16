import { proto } from '@adiwajshing/baileys';
import { BaseEntity } from './baseEntity';

/**
 * @class Sticker
 */
export class Sticker extends BaseEntity {
  /**
   * @param {proto.Message.StickerMessage} raw - Sticker raw message
   */
  constructor(public raw: proto.Message.IStickerMessage) {
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
}
