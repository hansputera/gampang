import { proto } from '@adiwajshing/baileys';
import { BaseEntity } from './baseEntity';

/**
 * @class Document
 */
export class Document extends BaseEntity {
  /**
   * @param {proto.Message.IImageMessage} raw
   */
  constructor(public raw: proto.Message.IDocumentMessage) {
    super(raw);
  }

  /**
   * Get caption from the document
   *
   * @return {string | undefined}
   */
  public get caption(): string | undefined {
    return (this.raw.caption as string) ?? undefined;
  }

  /**
   * Get mimetype from the document
   *
   * @return {string}
   */
  public get mimetype(): string {
    return this.raw.mimetype ?? 'unknown';
  }
}
