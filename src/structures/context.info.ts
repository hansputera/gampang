import { proto } from '@adiwajshing/baileys';
import { Client } from '../bot';
import { Context } from './context';

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
