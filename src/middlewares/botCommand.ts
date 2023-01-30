import { format as textFormat } from 'node:util';

import type { MiddlewareFunc } from '../@typings';
import type { Context } from '../structures';
import { botCommandCooldown } from './botCommand.cooldown';

export const botCommand: MiddlewareFunc = async (context: Context) => {
  const cmd = context.getCommand();

  if (cmd && typeof cmd.run === 'function' && typeof cmd.options === 'object') {
    if (
      (cmd.options?.groupOnly && !context.isGroup) ||
      (cmd.options?.privateOnly && !context.isPM) ||
      (cmd.options?.ownerOnly &&
        context.client.getOptions()?.owners?.indexOf(context.authorNumber) ===
          -1)
    ) {
      return false;
    }

    let isCooldown: boolean | undefined = false;

    try {
      const opts = context.client.getOptions();
      if (typeof opts?.middlewares?.cooldown === 'function') {
        return await opts.middlewares.cooldown(context);
      }

      isCooldown = await botCommandCooldown(context, cmd);
    } catch (err: unknown) {
      if ((err as Error).message) {
        await context.reply(textFormat('Error: %s', (err as Error).message));
      }

      return false;
    }

    !isCooldown && cmd.run(context);
    return true;
  }

  return false;
};
