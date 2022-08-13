import { proto } from '@adiwajshing/baileys';
import { Command } from '../@typings';
import { CommandClient } from '../bot';
import { Context } from './context';

/**
 * @class CommandContext
 */
export class CommandContext extends Context {
  /**
   * @constructor
   * @param {CommandClient} client CommandClient instance.
   * @param {proto.IWebMessageInfo} rawMessage Raw WhatsApp Message
   */
  constructor(client: CommandClient, rawMessage: proto.IWebMessageInfo) {
    super(client, rawMessage);

    this.reloadQuery();
  }

  public flags: string[] = [];
  public args: string[] = [];

  /**
   * Get command details.
   * @return {Command}
   */
  public getCommand(): Command | undefined {
    if (!this.isCommand()) return undefined;

    return (this.client as CommandClient).commands.get(this.getCommandName());
  }
  /**
   * Parse message to args and flags
   *
   * @return {{args: string[], flags: string[]}}
   */
  private reloadQuery(): { args: string[]; flags: string[] } {
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
    const p = (this.client as CommandClient)
      .getOptions()
      .prefixes.find((p) => this.text.startsWith(p.toLowerCase()));

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
}
