import { messageCollector } from '../../middlewares';
import { Context } from '../../structures';
import { Client } from '../client';

export const messageUpsertHandler = async (client: Client) => {
  client.raw?.ev.on('messages.upsert', async ({ messages }) => {
    const context = new Context(client, messages[0]);

    const collector = await messageCollector(context);
    if (!collector) return;

    const cmd = context.getCommand();
    if (cmd) {
      if (
        (cmd.options?.groupOnly && !context.isGroup) ||
        (cmd.options?.privateOnly && !context.isPM) ||
        (cmd.options?.ownerOnly &&
          !context.client.getOptions()?.owners?.includes(context.authorNumber))
      )
        return;

      const cooldownKey = 'cooldown_'.concat(
        context.getCurrentJid(),
        '-',
        context.authorNumber,
      );
      const cooldown = (await context.client.dataStores?.get(
        cooldownKey,
      )) as string;

      if (!cooldown)
        await context.client.dataStores?.set(
          cooldownKey,
          JSON.stringify({
            'time': (Date.now() + (cmd.options?.cooldown || 5_000)).toString(),
            'warned': 0,
          }),
        );
      else if (!JSON.parse(cooldown).warned) {
        await context.client.dataStores?.set(
          cooldownKey,
          JSON.stringify({
            ...JSON.parse(cooldown),
            'warned': 1,
          }),
        );

        cmd.options?.cooldownMessage &&
          (await cmd.options.cooldownMessage(context));
      } else if (JSON.parse(cooldown).time <= Date.now()) {
        await context.client.dataStores?.delete(cooldownKey);
      } else return;

      cmd.run(context);
    }

    client.emit('message', context);
  });
};
