import type { MiddlewareFunc } from '../@typings';
import { Context } from '../structures';

export const messageCollector: MiddlewareFunc = async (ctx: Context) => {
  const session = ctx.client.collectors.get(
    ctx.authorNumber.concat('-', ctx.getCurrentJid()),
  );

  if (session && (await session.validate(ctx))) {
    session.contexts.push(ctx);
    if (session.contexts.length >= session.maxMessages) {
      session.destroy();
    }

    return false;
  } else {
    return true;
  }
};
