import { Client } from '../../bot';
import { GroupParticipant, AnyMessageContent } from '@adiwajshing/baileys';

/**
 * @class GroupParticipantContext
 */
export class GroupParticipantContext {
  /**
   * @param {Client} client
   * @param {GroupParticipant} raw
   */
  constructor(public client: Client, public raw: GroupParticipant) {}

  /**
   * Get participant id
   *
   * @return {string}
   */
  public get id(): string {
    return this.raw.id.replace(/@.+/gi, '');
  }

  /**
   * Get participant name. (if available)
   *
   * @return {string | undefined}
   */
  public get name(): string | undefined {
    return this.raw.name;
  }

  /**
   * Get verified name. (if the whatsapp account is verified)
   *
   * @return {string | undefined}
   */
  public get verifiedName(): string | undefined {
    return this.raw.verifiedName;
  }

  /**
   * Get participant status
   *
   * @return {string | undefined}
   */
  public get status(): string | undefined {
    return this.raw.status;
  }

  /**
   * Get the participant name in your contact.
   *
   * @return {string | undefined}
   */
  public get contactName(): string | undefined {
    return this.raw.notify;
  }

  /**
   * Get participant profile picture url.
   *
   * @return {string | undefined}
   */
  public get pictureUrl(): string | undefined {
    return this.raw.imgUrl;
  }

  /**
   * Get participant jid
   *
   * @return {string}
   */
  public get jid(): string {
    return this.raw.id;
  }

  /**
   * Participant is an admin?
   *
   * @return {string}
   */
  public get isAdmin(): boolean {
    return !!this.raw.admin;
  }

  /**
   * Get participant type
   *
   * @return {'admin' | 'superadmin' | 'member'}
   */
  public get type(): 'admin' | 'superadmin' | 'member' {
    return this.raw.admin ?? 'member';
  }

  /**
   * Participant is an superadmin?
   *
   * @return {boolean}
   */
  public get isSuperAdmin(): boolean {
    return this.raw.isSuperAdmin ?? false;
  }

  /**
   * Send a message to the participant via PM.
   * @param {AnyMessageContent} content
   */
  public async send(content: AnyMessageContent) {
    return await this.client.raw?.sendMessage(this.jid, content);
  }
}
