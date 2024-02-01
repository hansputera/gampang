import { DisconnectReason, UserFacingSocketConfig } from '@adiwajshing/baileys';
import EventEmitter from 'events';
import { Server } from 'node:http';
import { format as textFormat } from 'node:util';

import type {
  ClientEvents,
  RawClient,
  ClientOptions,
  Command,
  CommandOptions,
  BaileysEventList,
  CustomEventFunc,
} from '../@typings';
import { createLogger, PinoLogger } from '../logger';
import { createWA } from './createWA';
import {
  DataStoreKeyValMap,
  GroupContext,
  MessageCollector,
} from '../structures';
import { qrHandler, SessionManager } from '../utils';
import { MiddlewareManager } from './middleware';

import { botCommand, messageCollector, pollMiddleware } from '../middlewares';
import { messageUpsertEvent } from '../events';

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
   * @param {SessionManager} session Session Manager instance.
   * @param {ClientOptions} options Command Client options.
   */
  constructor(
    private session: SessionManager,
    private options?: ClientOptions,
  ) {
    super();

    if (typeof options !== 'object' || !Array.isArray(options.prefixes))
      options = {
        'prefixes': ['!'],
        'qr': {
          'store': 'terminal',
        },
      };

    if (options.dataStore) this.dataStores = options.dataStore;
    else this.dataStores = new DataStoreKeyValMap();
    this.logger = createLogger('Gampang', options.logger);

    if (!(session instanceof SessionManager))
      throw new TypeError("'session' must be SessionManager!");

    this.middleware.use(pollMiddleware);
    this.middleware.use(messageCollector);
    this.middleware.use(botCommand);

    this.session.client = this;
    this.addCustomEvent('messages.upsert', messageUpsertEvent);
  }

  public commands: Map<string, Command> = new Map();
  public logger!: PinoLogger;
  public raw?: RawClient;
  public collectors: Map<string, MessageCollector> = new Map();
  public groups: Map<string, GroupContext> = new Map();
  public dataStores?: ClientOptions['dataStore'];
  public middleware: MiddlewareManager = new MiddlewareManager();

  qrServer?: Server;
  #rawEvents: Set<{
    event: BaileysEventList;
    func: CustomEventFunc<BaileysEventList>;
  }> = new Set();

  /**
   * Add your custom event handler.
   * @param {BaileysEventList} event Listener baileys name
   * @param {CustomEventFunc} func Listener function
   * @return {Client}
   */
  addCustomEvent<T extends BaileysEventList>(
    event: T,
    func: CustomEventFunc<T>,
  ): Client {
    this.logger.info(textFormat('CustomEvent [%s] added', event));
    this.#rawEvents.add({
      event,
      func: func as CustomEventFunc<BaileysEventList>,
    });
    return this;
  }
  /**
   * Add a command
   * @param {string} name Command name.
   * @param {Function} func Command function.
   * @param {CommandOptions} opts Command options.
   * @return {CommandClient}
   */
  command(
    name: string,
    func: Command['run'],
    opts: CommandOptions = {
      'cooldown': 5000,
    },
  ): Client {
    if (typeof name !== 'string' || typeof func !== 'function')
      throw new TypeError('Name, and command function should not empty!');
    if (typeof opts !== 'object')
      opts = {
        'cooldown': 5000,
      };

    if (!opts.cooldownMessage)
      opts.cooldownMessage = async (ctx) => {
        await ctx.reply('Please slow down!');
        return;
      };

    if (this.commands.has(name)) {
      this.logger.warn(
        'Command',
        name,
        'registered, please use other command name',
      );
    }

    this.commands.set(name, {
      'run': func,
      'options': opts,
    });

    return this;
  }
  /**
   * Get CommandClient options
   * @return {CommandClientOptions}
   */
  public getOptions(): ClientOptions | undefined {
    return this.options;
  }

  /**
   * Launch bot.
   * @param {Omit<UserFacingSocketConfig, 'auth'>} options Launch options.
   * @return {Promise<void>}
   */
  async launch(options?: Omit<UserFacingSocketConfig, 'auth'>): Promise<void> {
    if (this.qrServer) {
      this.qrServer.close();
      this.qrServer = undefined;
    }
    this.logger.info('Launching Gampang Client');
    if (typeof options !== 'object')
      options = {
        'logger': this.logger as unknown as Omit<
          UserFacingSocketConfig,
          'auth'
        >['logger'],
      };
    else if (!options.logger)
      options.logger = this.logger as unknown as Omit<
        UserFacingSocketConfig,
        'auth'
      >['logger'];

    if (!this.session.auth) {
      this.logger.debug('Refreshing authentiction state');
      await this.session.init();
    }

    this.raw = await createWA(
      this.session,
      options as Omit<UserFacingSocketConfig, 'auth'>,
    );

    this.logger.info(
      textFormat('Found %d registered raw events', this.#rawEvents.size),
    );
    this.#rawEvents.forEach((value) => {
      this.logger.info(
        textFormat('Registering %s to current client', value.event),
      );
      this.raw?.ev.on(value.event, (arg) => value.func(this, arg));
    });

    if (!this.raw.user?.id)
      qrHandler(this, this.options?.qr as ClientOptions['qr']);

    this.raw.ev.on('connection.update', async (conn) => {
      if (conn.connection === 'open' && this.raw && this.raw.user?.id) {
        if (this.qrServer) {
          this.qrServer.close();
          this.qrServer = undefined;
        }
        this.emit('ready');
      }

      if (conn.isNewLogin && this.qrServer) {
        this.qrServer.close();
        this.qrServer = undefined;
      }

      if (conn.qr) {
        this.emit('qr', conn.qr);
      } else if (conn.lastDisconnect && conn.lastDisconnect.error) {
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
            if (this.raw?.ws) this.raw.ws.close();
            this.raw = undefined;
            break;
          case DisconnectReason.restartRequired:
            this.logger.warn('Restart required signal received, reconnecting');
            this.raw = undefined;
            this.launch(options);
            break;
          case DisconnectReason.badSession:
            this.logger.error('Bad Session, removing sessions folder');
            await this.session.remove();
            this.logger.warn('Reconnecting');
            this.raw = undefined;
            this.launch(options);
            break;
          default: {
            this.logger.warn('Unhandled DisconnectReason');
            this.raw = undefined;
            this.logger.info('Trying to reconnect');
            this.launch(options);
          }
        }
      }

      await this.session.save();
    });
  }
}

export { MiddlewareManager };
