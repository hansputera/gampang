import { Context } from '../../structures';
import { Client } from '../client';

export const messageUpsertHandler = (client: Client) => {
  client.raw?.ev.on('messages.upsert', ({ messages }) => {
    client.emit('message', new Context(client, messages[0]));
  });
};
