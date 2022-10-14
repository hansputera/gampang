import { MiddlewareFunc } from '../@typings';
import { Context } from '../structures';

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

    cmd.run(context);
    return true;
  }

  return false;
};
