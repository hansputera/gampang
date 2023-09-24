import {
  AnyMessageContent,
  GroupParticipant,
  MiscMessageGenerationOptions,
  proto,
} from '@adiwajshing/baileys';
import Long from 'long';
import {
  type CollectorOptions,
  Command,
  ClientOptions,
  ButtonType,
} from '../@typings';
import { type Client } from '../bot';
import { ButtonBuilder } from '../utils/builder';
import { MessageCollector } from './collector';
import { Document, Image, Sticker, Video } from './entities';
import { GroupContext } from './group';

/**
 * @class Context
 */
export class Context {
  /**
   * @constructor
   * @param {Client} client Gampang Client
   * @param {proto.IWebMessageInfo} rawMessage Baileys proto.IWebMessageInfo
   * @param {boolean?} groupSync Sync group mode
   */
  constructor(
    public client: Client,
    private rawMessage: proto.IWebMessageInfo,
    groupSync: boolean | null = false,
  ) {
    this.#reloadQuery();
    if (groupSync) this.syncGroup();

    if (rawMessage.message?.documentWithCaptionMessage?.message) {
      Reflect.set(
        this.rawMessage.message as proto.Message,
        'documentMessage',
        rawMessage.message.documentWithCaptionMessage.message.documentMessage,
      );
    }
  }

  /**
   * Get Message ID
   * @return {string}
   */
  public get id(): string {
    return this.rawMessage.key.id as string;
  }

  /**
   * Get Poll Enc Key
   * @return {Uint8Array | undefined}
   */
  public get pollEncKey(): Uint8Array | undefined {
    return (
      this.rawMessage.message?.messageContextInfo?.messageSecret ||
      this.rawMessage.message?.pollCreationMessage?.encKey ||
      undefined
    );
  }

  /**
   * Is this message from me?
   * @return {boolean}
   */
  public get isFromMe(): boolean {
    return this.rawMessage.key.fromMe as boolean;
  }

  /**
   * Get group context data (if any)
   *
   * @return {GroupContext | undefined}
   */
  public getGroup(): GroupContext | undefined {
    return this.client.groups.get(this.getCurrentJid().concat('@g.us'));
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
   * Get GroupParticipant class.
   *
   * @return {GroupParticipant | undefined}
   */
  public get participant(): GroupParticipant | undefined {
    if (!this.isGroup) return undefined;
    else if (
      this.isGroup &&
      !this.client.groups.has(this.rawMessage.key.remoteJid as string)
    ) {
      return undefined;
    }

    return this.client.groups
      .get(this.rawMessage.key.remoteJid as string)
      ?.members.find((m) => m.id === this.authorNumber);
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
   * Get detail from clicked button
   *
   * @return {proto.Message.ITemplateButtonReplyMessage | undefined}
   */
  public get clickedButtons():
    | proto.Message.IButtonsResponseMessage
    | proto.Message.ITemplateButtonReplyMessage
    | proto.Message.IListResponseMessage
    | undefined {
    const responseButtons =
      this.raw.message?.buttonsResponseMessage ||
      this.raw.message?.templateButtonReplyMessage ||
      this.raw.message?.listResponseMessage;
    return responseButtons || undefined;
  }

  public flags: string[] = [];
  public args: string[] = [];

  /**
   * Get command details.
   * @return {Command}
   */
  public getCommand(): Command | undefined {
    if (!this.isCommand() && !this.clickedButtons) return undefined;

    if (
      !!this.clickedButtons &&
      !this.client.commands.get(this.getIdButton() as string)
    ) {
      this.client.logger.warn(
        'The id of button is not equal for the command name',
      );
      return undefined;
    }

    return (
      this.client.commands.get(
        this.getCommandName() || (this.getIdButton() as string),
      ) ||
      [...this.client.commands.values()].find((c) =>
        c.options?.aliases?.includes(this.getCommandName()),
      )
    );
  }

  /**
   * If the chat is in a group, add it to cache.
   *
   * @return {Promise<boolean>}
   */
  public async syncGroup(): Promise<boolean> {
    if (
      !this.isGroup ||
      this.client.groups.has(this.rawMessage.key.remoteJid as string)
    ) {
      return false;
    }

    const groupMeta = await this.client.raw
      ?.groupMetadata(this.rawMessage.key.remoteJid as string)
      .catch((err) => err.message);

    if (typeof groupMeta === 'string') {
      console.warn("Couldn't sync the group for chat", this.id);
      return false;
    }

    this.client.groups.set(
      this.rawMessage.key.remoteJid as string,
      new GroupContext(this.client, groupMeta),
    );
    return true;
  }

  /**
   * Parse message to args and flags
   *
   * @return {{args: string[], flags: string[]}}
   */
  #reloadQuery(): { args: string[]; flags: string[] } {
    this.args = [];
    this.flags = [];

    for (const q of this.getArgs()) {
      if (q.startsWith('--')) this.flags.push(q.slice(2).toLowerCase());
      else this.args.push(q);
    }

    return { args: this.args, flags: this.flags };
  }

  /**
   * Get the arguments of message (only available if it is a command)
   *
   * @param {boolean} withPrefix
   * @return {string[]}
   */
  public getArgs(withPrefix = false): string[] {
    if (!this.isCommand()) return [];
    let text = this.text;
    const extendedMessage = this.raw.message?.extendedTextMessage;

    if (
      extendedMessage &&
      extendedMessage.contextInfo &&
      extendedMessage.contextInfo.quotedMessage
    ) {
      text += ' ' + extendedMessage.contextInfo.quotedMessage.conversation;
    }

    return text
      .slice(this.getPrefix().length)
      .split(/ +/g)
      .slice(withPrefix ? 0 : 1);
  }

  /**
   * Knows the message is command.
   *
   * @return {boolean}
   */
  public isCommand(): boolean {
    if (!this.text) return false;
    else return this.getPrefix().length > 0;
  }

  /**
   * Get the prefix from the message
   *
   * @return {string}
   */
  public getPrefix(): string {
    if (!this.text) return '';
    const p = (this.client.getOptions() as ClientOptions).prefixes?.find((p) =>
      this.text.startsWith(p.toLowerCase()),
    );

    return p ? p : '';
  }

  /**
   * Get the command name from message
   *
   * @return {string}
   */
  public getCommandName(): string {
    return this.getArgs(true)[0];
  }

  /**
   * Get the id button from message
   *
   * @return {string | undefined | null}
   */
  public getIdButton(): string | undefined | null {
    return (
      (this.clickedButtons as proto.Message.IListResponseMessage)
        ?.singleSelectReply?.selectedRowId ||
      (this.clickedButtons as proto.Message.ITemplateButtonReplyMessage)
        ?.selectedId ||
      (this.clickedButtons as proto.Message.IButtonsResponseMessage)
        ?.selectedButtonId
    );
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
   * Get a document from this message
   *
   * @return {Document | undefined}
   */
  public get document(): Document | undefined {
    if (this.rawMessage.message?.documentMessage) {
      return new Document(this.rawMessage.message.documentMessage);
    }

    return undefined;
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
      ? (this.client.raw?.user?.id.replace(/:[0-9]+@.+/gi, '') as string)
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

    if (this.rawMessage.message?.documentMessage?.caption) {
      return this.rawMessage.message.documentMessage.caption.trim();
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
   * @param {AnyMessageContent} options - Send message options
   */
  public async reply(text: string, options?: AnyMessageContent) {
    return this.sendRaw(
      {
        text,
        ...options,
      },
      {
        quoted: this.raw,
      },
    );
  }

  /**
   * Reply a message with audio
   * @param {Buffer | string} audio - URL/Buffer audio
   * @param {boolean} isVN - Is it voice note?
   * @param {AnyMessageContent} options - Send message options
   */
  public async replyWithAudio(
    audio: Buffer | string,
    isVN = false,
    options?: AnyMessageContent,
  ) {
    return this.sendRaw(
      {
        audio:
          typeof audio === 'string'
            ? {
                url: audio,
              }
            : audio,
        ptt: isVN,
        ...options,
      },
      {
        quoted: this.raw,
      },
    );
  }

  /**
   * Reply a message with video
   *
   * @param {Buffer | string} video - Video source want to send.
   * @param {string?} caption - Video caption
   * @param {AnyMessageContent} options - Send message options
   */
  public async replyWithVideo(
    video: Buffer | string,
    caption?: string,
    options?: AnyMessageContent,
  ) {
    if (!options) {
      (options as unknown) = {};
    }

    if (caption) {
      (options as Record<string, unknown>)['caption'] = caption;
    }

    return this.sendRaw(
      {
        video:
          typeof video === 'string'
            ? {
                url: video,
              }
            : video,
        ...options,
      },
      {
        quoted: this.raw,
      },
    );
  }

  /**
   * Only send a message without reply.
   *
   * @param {string} text - Send a text
   * @param {AnyMessageContent} options - Send message options
   */
  public async send(text: string, options?: AnyMessageContent) {
    return this.sendRaw({
      text,
      ...options,
    });
  }

  /**
   * Send raw message
   * @param {AnyMessageContent} raw AnyMessageContent message options
   * @param {MiscMessageGenerationOptions} miscOpt Misc message generation options
   * @return {Promise<Context | undefined>}
   */
  public async sendRaw(
    raw: AnyMessageContent,
    miscOpt?: MiscMessageGenerationOptions,
  ): Promise<Context | undefined> {
    try {
      return new Context(
        this.client,
        (await this.client.raw?.sendMessage(
          this.raw.key.remoteJid as string,
          raw,
          miscOpt,
        )) as proto.IWebMessageInfo,
      );
    } catch (e: unknown) {
      this.client.logger.error(
        `Couldn't send message because: ${(e as Error).message}`,
      );
      return undefined;
    }
  }

  /**
   * Reply a message with photo
   *
   * @param {Buffer | string} photo - A Photo
   * @param {string?} caption - A Photo caption
   * @param {AnyMessageContent?} options - Send message options
   */
  public async replyWithPhoto(
    photo: Buffer | string,
    caption?: string,
    options?: AnyMessageContent,
  ) {
    if (!options) (options as unknown) = {};
    if (caption) {
      (options as Record<string, unknown>)['caption'] = caption;
    }

    return this.sendRaw(
      {
        image:
          typeof photo === 'string'
            ? {
                url: photo,
              }
            : photo,
        ...options,
      },
      {
        quoted: this.raw,
      },
    );
  }

  /**
   * Reply a message using sticker
   *
   * @param {Buffer | string} sticker Sticker URL or Buffer
   * @param {AnyMessageContent?} options Reply message options
   */
  public async replyWithSticker(
    sticker: Buffer | string,
    options?: AnyMessageContent,
  ) {
    return this.sendRaw(
      {
        sticker:
          typeof sticker === 'string'
            ? {
                url: sticker,
              }
            : sticker,
        ...options,
      },
      {
        quoted: this.raw,
      },
    );
  }

  /**
   * Reply a message using button template
   *
   * @param {AnyMessageContent} content Reply message options
   */
  public async replyWithButton<T extends ButtonType>(
    content: AnyMessageContent | ButtonBuilder<T>,
  ) {
    return this.sendRaw(
      content instanceof ButtonBuilder ? content.build() : content,
      { quoted: this.raw },
    );
  }

  /**
   * Delete this message
   * @return {Promise<Context | undefined>}
   */
  public async delete(): Promise<Context | undefined> {
    if (this.isGroup && !this.isFromMe) {
      const group = this.getGroup();
      const [member, me] = [
        group?.members.find((mem) => mem.jid === this.rawMessage.key.id),
        group?.members.find((mem) => mem.jid === this.client.raw?.user?.id),
      ];

      if (!me || !member) {
        return undefined;
      } else if (me && member) {
        if (
          !(me.isAdmin || me.isSuperAdmin) &&
          (member.isAdmin || member.isSuperAdmin)
        )
          return undefined;

        return this.sendRaw({
          delete: this.raw.key,
        });
      } else {
        await this.syncGroup();
        return this.delete();
      }
    }

    const contextInfo = this.raw.message?.extendedTextMessage?.contextInfo;
    if (contextInfo) {
      this.raw.key = {
        ...this.raw.key,
        participant: contextInfo.participant,
        id: contextInfo.stanzaId,
      };
    }

    return this.sendRaw({
      delete: this.raw.key,
    });
  }

  /**
   * Create whatsapp poll/vote
   * @param {string} name Poll name
   * @param {string[]} values Poll values (options)
   * @param {number} selectableOptionsCount Selectable options count
   * @return {Promise<Context | undefined>}
   */
  public async createPoll(
    name: string,
    values: string[],
    selectableOptionsCount: number = values.length,
  ): Promise<Context | undefined> {
    if (values.length < 2) {
      throw new TypeError('Minimum createPoll.values is 2');
    } else if (
      selectableOptionsCount > values.length ||
      selectableOptionsCount < 2
    ) {
      throw new TypeError('Invalid selectableOptionsCount');
    }

    return this.sendRaw({
      poll: {
        name,
        values,
        selectableCount: selectableOptionsCount,
      },
    });
  }

  /**
   * Get collector instance.
   * @param {CollectorOptions} options - Message Collector options.
   * @return {MessageCollector}
   */
  public getCollector(options?: CollectorOptions): MessageCollector {
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
          client.raw?.user?.id?.replace(/:[0-9]+@.+/gi, '') ===
          raw.participant?.replace(/@.+/gi, ''),
        'id': raw.stanzaId,
        'remoteJid': remoteJid,
      },
      'message': raw.quotedMessage,
      'messageTimestamp': Date.now(),
    });
  }
}
