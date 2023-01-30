import type { Command } from '../@typings';
import type { Context } from '../structures/context';

export const botCommandCooldown = async (
  context: Context,
  cmd: Command,
): Promise<boolean | undefined> => {
  if (context.client.getOptions()?.disableCooldown) {
    return;
  }

  const cooldownKey = 'cooldown_'.concat(
    context.getCurrentJid(),
    '-',
    context.authorNumber,
  );
  const cooldown = (await context.client.dataStores?.get(
    cooldownKey,
  )) as string;

  if (context.client.dataStores instanceof Map) {
    setTimeout(() => {
      context.client.dataStores?.delete(cooldownKey);
    }, cmd.options?.cooldown || 5_000);
  }

  if (!cooldown)
    await context.client.dataStores?.set(
      cooldownKey,
      (Date.now() + (cmd.options?.cooldown || 5_000)).toString(),
    );
  else {
    if (typeof cmd.options?.cooldownMessage === 'function') {
      await cmd.options.cooldownMessage(context);
    } else {
      throw new Error('Please slow down!');
    }
  }

  return !!cooldown;
};
