import type { MiddlewareFunc } from '../@typings';
import { Context } from '../structures';

export const messageCollector: MiddlewareFunc = async (ctx: Context) => {
  const session = ctx.client.collectors.get(
    ctx.authorNumber.concat('-', ctx.getCurrentJid()),
  );

  if (session && (await session.validate(ctx))) {
    ctx.client.logger.debug(
      `msgCollector session detected on ${ctx.getCurrentJid()}`,
    );
    session.contexts.push(ctx);
    if (session.contexts.length >= session.maxMessages) {
      session.destroy();
    }

    return false;
  } else {
    return true;
  }
};
