import { Client } from '../bot';
import { CommandContext } from '../structures';
import { Context } from '../structures/context';

export interface CollectorOptions<C> {
  max: number;
  time?: number;
  validation: (
    ctx: C extends Client ? Context : CommandContext,
  ) => Promise<boolean> | boolean;
}
