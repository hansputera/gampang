import {
  ClientEvents,
  Command,
  CommandClientOptions,
  CommandOptions,
} from '../@typings';
import { Client } from './client';

export declare interface CommandClient {
  on<U extends keyof ClientEvents<CommandClient>>(
    event: U,
    listener: ClientEvents<CommandClient>[U],
  ): this;

  emit<U extends keyof ClientEvents<CommandClient>>(
    event: U,
    ...args: Parameters<ClientEvents<CommandClient>[U]>
  ): boolean;
}

/**
 * @class CommandClient
 */
export class CommandClient extends Client {
  /**
   * @constructor
   * @param {string} session Session folder path.
   * @param {CommandClientOptions} options CommandClient options
   */
  constructor(session: string, private options: CommandClientOptions) {
    super(session);

    if (typeof options !== 'object' || !Array.isArray(options.prefixes))
      options = {
        'prefixes': ['!'],
      };
  }

  public commands: Map<string, Command> = new Map();

  /**
   * Add a command
   * @param {string} name Command name.
   * @param {string | string[] | RegExp | RegExp[]} match Command matchs.
   * @param {CommandOptions} opts Command options.
   * @param {Function} func Command function.
   * @return {CommandClient}
   */
  command(
    name: string,
    match: Command['matchs'],
    opts: CommandOptions = {
      'cooldown': 5000,
    },
    func: Command['run'],
  ): CommandClient {
    if (Array.isArray(match)) {
      match = (match as unknown[]).filter(
        (m) => m instanceof RegExp || typeof m === 'string',
      ) as string[] | RegExp[];
    }

    if (typeof opts !== 'object')
      opts = {
        'cooldown': 5000,
      };

    if (this.commands.has(name)) {
      this.logger.warn(
        'Command',
        name,
        'registered, please use other command name',
      );
    }

    this.commands.set(name, {
      'matchs': match,
      'run': func,
      'options': opts,
    });

    return this;
  }
  /**
   * Get CommandClient options
   * @return {CommandClientOptions}
   */
  public getOptions(): CommandClientOptions {
    return this.options;
  }
}
