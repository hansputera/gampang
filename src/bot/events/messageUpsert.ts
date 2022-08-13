import { messageCollector } from '../../middlewares';
import { Context } from '../../structures';
import { Client } from '../client';

export const messageUpsertHandler = async (client: Client) => {
  client.raw?.ev.on('messages.upsert', async ({ messages }) => {
    const context = new Context(client, messages[0]);

    const collector = await messageCollector(context);
    if (!collector) return;

    const cmd = context.getCommand();
    if (cmd) cmd.run(context);

    client.emit('message', context);
  });
};
