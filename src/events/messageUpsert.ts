import { jidNormalizedUser } from '@adiwajshing/baileys';
import { CustomEventFunc } from '../@typings';
import { Context } from '../structures/context';

export const messageUpsertEvent: CustomEventFunc<'messages.upsert'> = async (
  client,
  { messages },
) => {
  const context = new Context(client, messages[0]);
  if (context.raw.message?.pollCreationMessage) {
    client.emit('poll', {
      encKey: context.pollEncKey || new Uint8Array(),
      options:
        context.raw.message?.pollCreationMessage.options?.map(
          (o) => o.optionName as string,
        ) || [],
      pollId: context.raw.key.id || '',
      sender: jidNormalizedUser(
        context.raw.participant || context.raw.key.remoteJid || '',
      ),
    });
  }

  const isAllow = await client.middleware.exec(context);
  if (!isAllow) return;

  client.emit('message', context);
};
