import { jidNormalizedUser } from '@adiwajshing/baileys';
import { MiddlewareFunc } from '../@typings';
import { Context } from '../structures/context';

export const pollMiddleware: MiddlewareFunc = async (context: Context) => {
  if (context.raw.message?.pollCreationMessage) {
    context.client.emit('poll', {
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
  } else if (context.raw?.message?.pollUpdateMessage) {
    context.client.emit('vote', {
      pollId:
        context.raw.message.pollUpdateMessage.pollCreationMessageKey?.id || '',
      voter: jidNormalizedUser(
        (context.raw.key.remoteJid?.endsWith('@g.us')
          ? context.raw.key.participant
          : context.raw.key.remoteJid) || '',
      ),
      payload:
        context.raw.message.pollUpdateMessage.vote?.encPayload ||
        new Uint8Array(),
      payload_iv:
        context.raw.message.pollUpdateMessage.vote?.encIv || new Uint8Array(),
      sender: jidNormalizedUser(
        (context.raw.message.pollUpdateMessage.pollCreationMessageKey?.remoteJid?.endsWith(
          '@g.us',
        )
          ? context.raw.message.pollUpdateMessage.pollCreationMessageKey
              ?.participant
          : context.raw.message.pollUpdateMessage.pollCreationMessageKey
              ?.remoteJid) || '',
      ),
    });
  }

  return true;
};
