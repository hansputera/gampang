import { DisconnectReason, UserFacingSocketConfig } from '@adiwajshing/baileys';
import EventEmitter from 'events';
import { Server } from 'node:http';

import type {
  ClientEvents,
  RawClient,
  ClientOptions,
  Command,
  CommandOptions,
} from '../@typings';
import { createLogger, PinoLogger } from '../logger';
import { createWA } from './createWA';
import { GroupContext, MessageCollector } from '../structures';
import { qrHandler, SessionManager } from '../utils';
import { registerEvents } from './events';
import { MiddlewareManager } from './middleware';

import { messageCollector } from '../middlewares';

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
    // TODO: change it.
    else this.dataStores = new Map() as unknown as ClientOptions['dataStore'];

    if (!(session instanceof SessionManager))
      throw new TypeError("'session' must be SessionManager!");

    this.middleware.use(messageCollector);
  }

  public commands: Map<string, Command> = new Map();
  public logger: PinoLogger = createLogger('Gampang');
  public raw?: RawClient;
  public collectors: Map<string, MessageCollector> = new Map();
  public groups: Map<string, GroupContext> = new Map();
  public dataStores?: ClientOptions['dataStore'];
  public middleware: MiddlewareManager = new MiddlewareManager();

  qrServer?: Server;

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
    this.logger.info('Launching Gampang Client');
    if (typeof options !== 'object')
      options = {
        'logger': this.logger,
      };
    else if (!options.logger) options.logger = this.logger;

    if (!this.session.auth) {
      this.logger.debug('Refreshing authentiction state');
      await this.session.init();
    }

    this.raw = await createWA(
      this.session,
      options as Omit<UserFacingSocketConfig, 'auth'>,
    );

    this.raw.ev.on('connection.update', async (conn) => {
      if (conn.connection === 'open' && this.raw && this.raw.user?.id) {
        this.emit('ready');
      }

      if (conn.isNewLogin && this.qrServer) {
        this.qrServer.close();
        this.qrServer = undefined;
      }

      if (conn.qr) {
        if (typeof this.options?.qr === 'object')
          qrHandler(this, conn.qr, this.options?.qr as ClientOptions['qr']);
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
        }
      }

      await this.session.save();
    });

    registerEvents(this);
  }
}
