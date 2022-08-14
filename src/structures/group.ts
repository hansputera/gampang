import { GroupMetadata, AnyMessageContent } from '@adiwajshing/baileys';
import { Client } from '../bot';
import { GroupParticipantContext } from './entities';
import { Context } from './context';

/**
 * @class GroupContext
 */
export class GroupContext {
  /**
   * @param {Client} client
   * @param {GroupMetaData} raw
   */
  constructor(public client: Client, public raw: GroupMetadata) {}

  /**
   * Get group id without '@g.us'
   *
   * @return {string}
   */
  public get id(): string {
    return this.jid.replace(/@.+/gi, '');
  }

  /**
   * Get group name
   *
   * @return {string}
   */
  public get name(): string {
    return this.raw.subject;
  }

  /**
   * Get the group creation date.
   *
   * @return {Date}
   */
  public get createdAt(): Date {
    return new Date(this.raw.creation as number);
  }

  /**
   * Get the group description.
   *
   * @return {string}
   */
  public get description(): string {
    return this.raw.desc ?? '';
  }

  /**
   * Restricted ?
   *
   * @return {boolean}
   */
  public get restricted(): boolean {
    return this.raw.restrict ?? false;
  }

  /**
   * Announce?
   *
   * @return {boolean}
   */
  public get announce(): boolean {
    return this.raw.announce ?? false;
  }

  /**
   * Get group JID
   *
   * @return {string}
   */
  public get jid(): string {
    return this.raw.id;
  }

  /**
   * Get participants.
   *
   * @return {GroupParticipantContext[]}
   */
  public get members(): GroupParticipantContext[] {
    return this.raw.participants.map(
      (p) => new GroupParticipantContext(this.client, p),
    );
  }

  /**
   * Send a message to group
   *
   * @param {AnyMessageContent} content - WhatsApp Content
   * @return {Promise<Context>}
   */
  public async send(content: AnyMessageContent): Promise<Context> {
    return new Context(
      this.client,
      await this.client.raw?.sendMessage(this.jid, content),
      false,
    ); // avoid internal error.
  }
}
