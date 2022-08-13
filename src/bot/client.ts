import { DisconnectReason, UserFacingSocketConfig } from '@adiwajshing/baileys';
import EventEmitter from 'events';
import { unlink } from 'node:fs/promises';

import type { ClientEvents, RawClient } from '../@typings';
import { createLogger } from '../logger';
import { createWA } from '../raw/client';

export declare interface Client {
  on<U extends keyof ClientEvents>(event: U, listener: ClientEvents[U]): this;

  emit<U extends keyof ClientEvents>(
    event: U,
    ...args: Parameters<ClientEvents[U]>
  ): boolean;
}

/**
 * @class Client
 */
export class Client extends EventEmitter {
  /**
   * @constructor
   * @param {string} session Folder session path.
   */
  constructor(private session: string) {
    super();
  }

  public logger = createLogger('Gampang');
  #baileys?: RawClient;

  /**
   * Launch bot.
   * @param {Omit<UserFacingSocketConfig, 'auth'>} options Launch options.
   * @return {Promise<void>}
   */
  async launch(options?: Omit<UserFacingSocketConfig, 'auth'>): Promise<void> {
    this.logger.info('Launching Gampang Client');
    if (typeof options !== 'object')
      options = {
        'logger': this.logger,
      };
    else if (!options.logger) options.logger = this.logger;

    this.#baileys = await createWA(this.session, options);

    this.#baileys.ev.on('connection.update', async (conn) => {
      if (conn.qr) this.emit('qr', conn.qr);
      else if (conn.lastDisconnect && conn.lastDisconnect.error) {
        switch (
          (
            conn.lastDisconnect.error as unknown as {
              output: {
                statusCode: number;
              };
            }
          ).output.statusCode
        ) {
          case DisconnectReason.loggedOut:
            this.logger.info('Logged out');
            this.emit('logout');
            if (this.#baileys?.ws) this.#baileys.ws.close();
            this.#baileys = undefined;
            break;
          case DisconnectReason.restartRequired:
            this.logger.warn('Restart required signal received, reconnecting');
            this.#baileys = undefined;
            this.launch(options);
            break;
          case DisconnectReason.badSession:
            this.logger.error('Bad Session, removing sessions folder');
            await unlink(this.session).catch((e) => {
              this.logger.error('Fail to remove session folder:', e);
            });
            this.logger.warn('Reconnecting');
            this.#baileys = undefined;
            this.launch(options);
            break;
        }
      }

      await this.#baileys?.getAuth().saveCreds();
    });
  }
}
