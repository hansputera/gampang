import { proto } from '@adiwajshing/baileys';
import Long from 'long';

/**
 * @class MessageMediaBase
 */
export class BaseEntity {
  /**
     * @param {proto.IAudioMessage |
            proto.IImageMessage |
            proto.IVideoMessage |
            proto.IStickerMessage} raw
     */
  constructor(
    public raw:
      | proto.IAudioMessage
      | proto.IImageMessage
      | proto.IVideoMessage
      | proto.IStickerMessage,
  ) {}

  /**
   * Get encrypted message media url
   *
   * @return {string}
   */
  public get encryptedUrl(): string {
    return this.raw.url + (this.raw.directPath as string);
  }

  /**
   * Get mimetype of media
   *
   * @return {string}
   */
  public get mimeType(): string {
    return this.raw.mimetype as string;
  }

  /**
   * Get message timestamp message
   *
   * @return {number}
   */
  public get timestamp(): number {
    if (this.raw.mediaKeyTimestamp instanceof Long) {
      return this.raw.mediaKeyTimestamp.toInt() * 1000;
    } else return this.raw.mediaKeyTimestamp as number;
  }

  /**
   * SHA256 media file
   *
   * @return {{source: Uint8Array, enc: Uint8Array}}
   */
  public get sha256(): { source: Uint8Array; enc: Uint8Array } {
    return {
      'source': this.raw.fileSha256 as Uint8Array,
      'enc': this.raw.fileEncSha256 as Uint8Array,
    };
  }

  /**
   * Get mediaKey of media file
   *
   * @return {Uint8Array}
   */
  public get key(): Uint8Array {
    return this.raw.mediaKey as Uint8Array;
  }

  /**
   * Get file size of media
   *
   * @return {number}
   */
  public get fileSize(): number {
    if (this.raw.fileLength instanceof Long) {
      return this.raw.fileLength.toInt();
    } else return this.raw.fileLength as number;
  }
}

export * from './image';
export * from './sticker';
export * from './video';
export * from './groupParticipant';
