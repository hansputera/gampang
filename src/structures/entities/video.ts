import { proto } from '@adiwajshing/baileys';
import { BaseEntity } from '.';

/**
 * TODO:
 *
 * - Add thumbnail and decrypt it.
 */

/**
 * @class Video
 */
export class Video extends BaseEntity {
  /**
   * @param {proto.IVideoMessage} raw
   */
  constructor(public raw: proto.IVideoMessage) {
    super(raw);
  }

  /**
   * Playback video?
   *
   * @return {boolean}
   */
  public get playback(): boolean {
    return Boolean(this.raw.gifPlayback);
  }

  /**
   * Get seconds duration from a message
   *
   * @return {number}
   */
  public get seconds(): number {
    return this.raw.seconds as number;
  }

  /**
   * Get caption from the video
   *
   * @return {string | undefined}
   */
  public get caption(): string | undefined {
    return (this.raw.caption as string) ?? undefined;
  }

  /**
   * Get image video
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
