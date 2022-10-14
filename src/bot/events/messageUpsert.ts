import { Context } from '../../structures';
import { Client } from '../client';

export const messageUpsertHandler = async (client: Client) => {
  client.raw?.ev.on('messages.upsert', async ({ messages }) => {
    const context = new Context(client, messages[0]);

    const isAllow = await client.middleware.exec(context);
    if (!isAllow) return;
    
    client.emit('message', context);
  });
};
