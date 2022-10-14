import type { MiddlewareFunc } from '../@typings';
import type { Context } from '../structures';

/**
 * @class MiddlewareManager
 */
export class MiddlewareManager {
  public readonly middlewares: Array<MiddlewareFunc> = [];
  /**
   * Add your middleware function to the list.
   * @param {MiddlewareFunc} func Your middleware function.
   * @return {Promise<void>} void
   */
  async use(func: MiddlewareFunc): Promise<void> {
    this.middlewares.push(func);
    return;
  }

  /**
   * You shouldn't use this function.
   * @description Execute all middlewares.
   * @param {Context} context Active message context
   * @return {Promise<boolean>}
   */
  async exec(context: Context): Promise<boolean> {
    const middlewares = (
      await Promise.allSettled(this.middlewares.map((func) => func(context)))
    ).filter((middleware) => middleware.status === 'rejected');

    if (middlewares.length < this.middlewares.length) {
      return false;
    }

    return true;
  }
}
