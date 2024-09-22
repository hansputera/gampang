import type { Command, Cooldown } from '../@typings';
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
  const cooldownValues = await context.client.dataStores?.get(cooldownKey);

  if (!cooldownValues) {
    const payload: Cooldown = {
      expiresAt: Date.now() + (cmd.options?.cooldown ?? 5_000),
      wasWarned: false,
    };

    await context.client.dataStores?.set(cooldownKey, JSON.stringify(payload));
  } else {
    const cooldown: Cooldown = JSON.parse(cooldownValues);
    if (Date.now() >= cooldown.expiresAt) {
      await context.client.dataStores?.delete(cooldownKey);
      return false;
    }

    if (!cooldown.wasWarned) {
      cooldown.wasWarned = true;
      await context.client.dataStores?.set(
        cooldownKey,
        JSON.stringify(cooldown),
      );
      if (typeof cmd.options?.cooldownMessage === 'function') {
        await cmd.options.cooldownMessage(context);
      } else {
        throw new Error('Please slow down!');
      }
    }
  }

  return !!cooldownValues;
};
