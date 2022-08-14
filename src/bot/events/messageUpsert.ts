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
      cmd.run(context);
    }

    client.emit('message', context);
  });
};
