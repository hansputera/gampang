import { type Client } from '../bot';
import { readdir, stat } from 'node:fs/promises';
import { resolve as pathResolve, basename as pathBase } from 'node:path';
import { type Command } from '../@typings';

/**
 * @class CommandLoader
 */
export class CommandLoader {
  /**
   * @constructor
   * @param {string} directoryPath Command's directory
   */
  constructor(private client: Client, private directoryPath: string) {}

  /**
   * Load commands
   * @param {string} directoryPath Command's directory
   * @return {Promise<void>}
   */
  async load(directoryPath?: string): Promise<void> {
    directoryPath ??= this.directoryPath;
    for (const folder of await readdir(directoryPath)) {
      const stats = await stat(pathResolve(directoryPath, folder)).catch(
        () => undefined,
      );
      if (directoryPath && stats?.isFile()) {
        let command: Command = await import(pathResolve(directoryPath, folder));
        if (Reflect.has(command, 'default'))
          command = Reflect.get(command, 'default');

        this.client.command(
          pathBase(pathResolve(directoryPath, folder).replace(/\.[^.]*$/, '')),
          command.run,
          {
            ...command.options,
            category: pathBase(directoryPath),
          },
        );
      } else {
        await this.load(pathResolve(directoryPath, folder));
      }
    }
  }

  /**
   * Reload commands
   * @return {Promise<void>}
   */
  async reload(): Promise<void> {
    this.client.commands.clear();
    return this.load();
  }
}

/**
 * Build command structure
 * @param {Command} args Command's args
 * @return {Command}
 */
export const buildCommand = (args: Command): Command => args;
