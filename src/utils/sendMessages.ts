import type {
  AnyMessageContent,
  MiscMessageGenerationOptions,
  proto,
} from '@adiwajshing/baileys';
import { AsyncQueue } from '@sapphire/async-queue';
import type { Client } from '../bot';
import { Context } from '../structures';
import { SendMessageList } from '../@typings';

// Global queues to handle send messages without messages.upsert
export const sendMessagesQueue = new AsyncQueue();

/**
 * Send message to single jid
 * @param {Client} client The Gampang client
 * @param {string} jid WhatsApp JID Target
 * @param {AnyMessageContent} content WhatsApp Baileys message content
 * @param {MiscMessageGenerationOptions} options WhatsApp Baileys misc options for message
 * @param {boolean} noQueue Does this action need queue?
 * @return {Promise<Context | undefined>}
 */
export const sendMessageTo = async (
  client: Client,
  jid: string,
  content: AnyMessageContent,
  options?: MiscMessageGenerationOptions,
  noQueue = false,
): Promise<Context | undefined> => {
  if (!noQueue) {
    await sendMessagesQueue.wait();
  }

  try {
    const raw = await client.raw?.sendMessage(jid, content, options);
    return new Context(client, raw as proto.IWebMessageInfo);
  } catch (e) {
    client.logger.error(
      `Couldn't send message because: ${(e as Error).message}`,
    );
    return undefined;
  } finally {
    if (!noQueue) {
      sendMessagesQueue.shift();
    }
  }
};

/**
 * Send messages to many
 * @param {Client} client The Gampang client
 * @param {Array<SendMessageList>} list Broadcast targets
 * @param {boolean} noQueue Does this action using queue?
 * @return {Promise<Array<Context | undefined>>}
 */
export const sendMessagesTo = async (
  client: Client,
  list: Array<SendMessageList>,
  noQueue = false,
): Promise<Array<Context | undefined>> => {
  const promises = list.map(async (item) =>
    sendMessageTo(client, item.jid, item.content, item.options, noQueue),
  );
  return Promise.all(promises);
};
