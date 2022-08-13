import { AnyMessageContent, proto } from '@adiwajshing/baileys';
import Long from 'long';
import { CollectorOptions } from '../@typings';
import { Client, CommandClient } from '../bot';
import { MessageCollector } from './collector';
import { Image, Sticker, Video } from './entities';

/**
 * @class Context
 */
export class Context {
  /**
   * @constructor
   * @param {Client | CommandClient} client Gampang Client
   * @param {proto.IWebMessageInfo} rawMessage Baileys proto.IWebMessageInfo
   */
  constructor(
    public client: Client | CommandClient,
    private rawMessage: proto.IWebMessageInfo,
  ) {}

  /**
   * Get Message ID
   * @return {string}
   */
  public get id(): string {
    return this.rawMessage.key.id as string;
  }

  /**
   * Is this message from me?
   * @return {boolean}
   */
  public get isFromMe(): boolean {
    return this.rawMessage.key.fromMe as boolean;
  }

  /**
   * Get current JID
   * @return {string}
   */
  public getCurrentJid(): string {
    return this.rawMessage.key.remoteJid
      ? this.rawMessage.key.remoteJid.replace(/@.+/gi, '')
      : '';
  }

  /**
   * Get sticker from this message
   *
   * @return {Sticker | undefined}
   */
  public get sticker(): Sticker | undefined {
    if (this.rawMessage.message?.stickerMessage) {
      return new Sticker(this.rawMessage.message.stickerMessage);
    } else return undefined;
  }

  /**
   * Get an image from this message
   *
   * @return {Image | undefined}
   */
  public get image(): Image | undefined {
    if (this.rawMessage.message?.imageMessage) {
      return new Image(this.rawMessage.message.imageMessage);
    } else return undefined;
  }

  /**
   * Get a video from this message
   *
   * @return {Video | undefined}
   */
  public get video(): Video | undefined {
    if (this.rawMessage.message?.videoMessage) {
      return new Video(this.rawMessage.message.videoMessage);
    } else return undefined;
  }

  /**
   * Get author phone number of this message.
   * @return {string}
   */
  public get authorNumber(): string {
    return this.rawMessage.key.participant
      ? this.rawMessage.key.participant.replace(/@.+/gi, '')
      : this.isFromMe
      ? (this.client.raw?.user?.id
          .replace(/@.+/gi, '')
          .split(':')
          .at(0) as string)
      : this.getCurrentJid();
  }

  /**
   * Is it in a group?
   */
  public get isGroup(): boolean {
    return !(this.authorNumber === this.getCurrentJid());
  }

  /**
   * Is it in private-message?
   */
  public get isPM(): boolean {
    return !this.isGroup;
  }

  /**
   * Get message text.
   * @return {string}
   */
  public get text(): string {
    if (this.rawMessage.message?.extendedTextMessage) {
      return this.rawMessage.message.extendedTextMessage.text as string;
    }

    return this.rawMessage.message?.conversation as string;
  }

  /**
   * Get replied message from this message
   *
   * @return {ContextInfo | undefined}
   */
  public getReply(): ContextInfo | undefined {
    if (
      this.rawMessage.message?.extendedTextMessage &&
      this.rawMessage.message.extendedTextMessage.contextInfo
    ) {
      return new ContextInfo(
        this.rawMessage.message.extendedTextMessage.contextInfo,
        this.getCurrentJid(),
        this.client,
      );
    }
    return undefined;
  }

  /**
   * Get the timestamp message
   * @return {number}
   */
  public get timestamp(): number {
    if (this.rawMessage.messageTimestamp instanceof Long) {
      return this.rawMessage.messageTimestamp.toInt() * 1000;
    } else return (this.rawMessage.messageTimestamp as number) * 1000;
  }

  /**
   * Reply the message
   *
   * @param {string} text - Text Content
   * @param {AnyMessageContent} anotherOptions - Send message options
   */
  public async reply(text: string, anotherOptions?: AnyMessageContent) {
    try {
      return new Context(
        this.client,
        (await this.client.raw?.sendMessage(
          this.rawMessage.key.remoteJid as string,
          {
            'text': text,
            ...anotherOptions,
          },
          {
            quoted: this.rawMessage,
          },
        )) as proto.IWebMessageInfo,
      );
    } catch (e) {
      this.client.logger.error('Error to send a message: ' + text, e);
      return undefined;
    }
  }

  /**
   * Reply a message with audio
   * @param {Buffer | string} audio - URL/Buffer audio
   * @param {boolean} isVN - Is it voice note?
   * @param {AnyMessageContent} anotherOptions - Send message options
   */
  public async replyWithAudio(
    audio: Buffer | string,
    isVN = false,
    anotherOptions?: AnyMessageContent,
  ) {
    try {
      return new Context(
        this.client,
        (await this.client.raw?.sendMessage(
          this.rawMessage.key.remoteJid as string,
          {
            'audio':
              typeof audio === 'string'
                ? {
                    'url': audio,
                  }
                : audio,
            'ptt': isVN,
            ...anotherOptions,
          },
          {
            'quoted': this.rawMessage,
          },
        )) as proto.IWebMessageInfo,
      );
    } catch (e) {
      this.client.logger.error('Error want to send a message: AUDIO', e);
      return undefined;
    }
  }

  /**
   * Reply a message with video
   *
   * @param {Buffer | string} video - Video source want to send.
   * @param {string?} caption - Video caption
   * @param {AnyMessageContent} anotherOptions - Send message options
   */
  public async replyWithVideo(
    video: Buffer | string,
    caption?: string,
    anotherOptions?: AnyMessageContent,
  ) {
    if (!anotherOptions) {
      (anotherOptions as unknown) = {};
    }
    if (caption) {
      (anotherOptions as Record<string, unknown>)['caption'] = caption;
    }
    try {
      return new Context(
        this.client,
        (await this.client.raw?.sendMessage(
          this.rawMessage.key.remoteJid as string,
          {
            'video':
              typeof video === 'string'
                ? {
                    'url': video,
                  }
                : video,
            ...anotherOptions,
          },
          {
            'quoted': this.rawMessage,
          },
        )) as proto.IWebMessageInfo,
      );
    } catch (e) {
      this.client.logger.error('Error want to send a message: VIDEO', e);
      return undefined;
    }
  }

  /**
   * Only send a message without reply.
   *
   * @param {string} text - Send a text
   * @param {AnyMessageContent} anotherOptions - Send message options
   */
  public async send(text: string, anotherOptions?: AnyMessageContent) {
    try {
      return new Context(
        this.client,
        (await this.client.raw?.sendMessage(
          this.rawMessage.key.remoteJid as string,
          {
            'text': text,
            ...anotherOptions,
          },
        )) as proto.IWebMessageInfo,
      );
    } catch (e) {
      this.client.logger.error('Error want to send a message: NORMAL TEXT', e);
      return undefined;
    }
  }

  /**
   * Reply a message with photo
   *
   * @param {Buffer | string} photo - A Photo
   * @param {string?} caption - A Photo caption
   * @param {AnyMessageContent?} anotherOptions - Send message options
   */
  public async replyWithPhoto(
    photo: Buffer | string,
    caption?: string,
    anotherOptions?: AnyMessageContent,
  ) {
    if (!anotherOptions) (anotherOptions as unknown) = {};
    if (caption) {
      (anotherOptions as Record<string, unknown>)['caption'] = caption;
    }
    try {
      return new Context(
        this.client,
        (await this.client.raw?.sendMessage(
          this.rawMessage.key.remoteJid as string,
          {
            'image': typeof photo === 'string' ? { 'url': photo } : photo,
            'mimetype': 'image/png',
            ...anotherOptions,
          },
          {
            'quoted': this.rawMessage,
          },
        )) as proto.IWebMessageInfo,
      );
    } catch (e) {
      this.client.logger.error('Error want to send a message: PHOTO', e);
      return undefined;
    }
  }

  /**
   * Reply a message using sticker
   *
   * @param {Buffer | string} sticker
   */
  public async replyWithSticker(sticker: Buffer | string) {
    try {
      return new Context(
        this.client,
        (await this.client.raw?.sendMessage(
          this.rawMessage.key.remoteJid as string,
          {
            'sticker':
              typeof sticker === 'string'
                ? {
                    'url': sticker,
                  }
                : sticker,
          },
          {
            'quoted': this.rawMessage,
          },
        )) as proto.IWebMessageInfo,
      );
    } catch (e) {
      this.client.logger.error('Error want to send a message: STICKER', e);
      return undefined;
    }
  }

  /**
   * Delete this message
   */
  public async delete() {
    try {
      return await this.client.raw?.sendMessage(
        this.rawMessage.key.remoteJid as string,
        {
          'delete': this.rawMessage.key,
        },
      );
    } catch (e) {
      this.client.logger.error('Error want to delete a message: ', e);
      return undefined;
    }
  }

  /**
   * Get collector instance.
   * @param {CollectorOptions} options - Message Collector options.
   * @return {MessageCollector}
   */
  public getCollector(
    options?: CollectorOptions<Client>,
  ): MessageCollector<Client> {
    return new MessageCollector(this, options);
  }
  /**
   * Get raw message.
   */
  get raw(): proto.IWebMessageInfo {
    return this.rawMessage;
  }
}
/**
 * @class ContextInfo
 */
export class ContextInfo extends Context {
  /**
   *
   * @param {proto.IContextInfo} raw - Context Info
   * @param {string} remoteJid - Remote JID
   * @param {Client} client - Bot Client
   */
  constructor(raw: proto.IContextInfo, remoteJid: string, client: Client) {
    super(client, {
      'key': {
        'fromMe':
          client.raw?.user?.id.replace(/@.+/gi, '').split(':')[0] ===
          raw.participant?.replace(/@.+/gi, ''),
        'id': raw.stanzaId,
        'remoteJid': remoteJid,
      },
      'message': raw.quotedMessage,
      'messageTimestamp': Date.now(),
    });
  }
}
