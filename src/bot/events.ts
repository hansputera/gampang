import { Client } from './client';
import { messageUpsertHandler } from './events/messageUpsert';

export const registerEvents = async (client: Client) => {
  messageUpsertHandler(client);
  return;
};
