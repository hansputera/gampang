import { proto } from '@adiwajshing/baileys';
import { BaseEntity } from './baseEntity';

/**
 * @class Image
 */
export class Image extends BaseEntity {
  /**
   * @param {proto.Message.IImageMessage} raw
   */
  constructor(public raw: proto.Message.IImageMessage) {
    super(raw);
  }

  /**
   * Get caption from the image
   *
   * @return {string | undefined}
   */
  public get caption(): string | undefined {
    return (this.raw.caption as string) ?? undefined;
  }

  /**
   * Get image size
   *
   * @return {{height:number,width:number}}
   */
  public get size(): { height: number; width: number } {
    return {
      'height': this.raw.height as number,
      'width': this.raw.width as number,
    };
  }
}
