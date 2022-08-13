import { Context } from '../structures/context';

export interface CollectorOptions {
  max: number;
  time?: number;
  validation: (ctx: Context) => Promise<boolean> | boolean;
}
