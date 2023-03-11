import { CustomEventFunc } from '../@typings';
import { Context } from '../structures/context';

export const messageUpsertEvent: CustomEventFunc<'messages.upsert'> = async (
  client,
  { messages },
) => {
  const context = new Context(
    client,
    messages[0],
    client.getOptions()?.saveGroupMetadata,
  );

  const isAllow = await client.middleware.exec(context);
  if (!isAllow) return;

  client.emit('message', context);
};
