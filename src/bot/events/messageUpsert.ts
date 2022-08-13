import { messageCollector } from '../../middlewares';
import { CommandContext, Context } from '../../structures';
import { Client } from '../client';
import { CommandClient } from '../commandClient';

export const messageUpsertHandler = async (client: Client | CommandClient) => {
  client.raw?.ev.on('messages.upsert', async ({ messages }) => {
    if (client instanceof CommandClient) {
      const context = new CommandContext(client, messages[0]);

      const collector = await messageCollector(context);
      if (!collector) return;

      const cmd = context.getCommand();
      if (cmd) cmd.run(context);

      client.emit('message', context);
    } else {
      const context = new Context(client, messages[0]);

      const collector = await messageCollector(context);
      if (!collector) return;

      client.emit('message', context);
    }
  });
};
