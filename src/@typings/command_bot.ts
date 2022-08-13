import { CommandContext } from '../structures';

export interface CommandClientOptions {
  prefixes: string[];
  /**
   * JIDs
   */
  owners?: string[];
}

export interface CommandOptions {
  description?: string;
  cooldown?: number;
  groupOnly?: boolean;
  privateOnly?: boolean;
}

export interface Command {
  options?: CommandOptions;
  run(ctx: CommandContext): Promise<void> | void;
}