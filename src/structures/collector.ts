import type { Context } from './context';
import type { CollectorOptions } from '../@typings';

/**
 * @class MessageCollector
 */
export class MessageCollector {
  #runner?: NodeJS.Timeout;

  /**
   * MessageCollector runner
   * @type {NodeJS.Timeout | undefined}
   */
  get runner(): NodeJS.Timeout | undefined {
    return this.#runner;
  }
  /**
   * Message collector session key
   */
  private key!: string;
  /**
   * Validate a message function
   */
  public validate!: CollectorOptions['validation'];

  /**
   * @param {Context} ctx - A context of message
   */
  constructor(
    public ctx: Context,
    private options: CollectorOptions = {
      time: 30 * 1000,
      max: 3,
      validation: () => true,
    },
  ) {
    if (!options.time) options.time = 30000;
    else if (!options.max) options.max = 3;
    else if (!options.validation) {
      options.validation = () => true;
    }

    this.key = this.ctx.authorNumber + '-' + this.ctx.getCurrentJid();
    this.validate = this.options.validation;
  }

  /**
   * Collected context
   */
  public contexts: Context[] = [];

  /**
   * Get the waiting time.
   *
   * @return {number}
   */
  public get time(): number {
    return this.options.time as number;
  }

  /**
   * Get the maximum messages want to receive.
   *
   * @return {number}
   */
  public get maxMessages(): number {
    return this.options.max as number;
  }

  /**
   * Start the message collector
   *
   * @return {void}
   */
  public start(): void {
    if (this.#runner) {
      throw new Error('This instance is already started');
    }

    this.#runner = setTimeout(() => {
      this.destroy();
    }, this.time);
    this.ctx.client.collectors.set(this.key, this);
  }

  /**
   * Destroy the message collector session.
   *
   * @return {void}
   */
  public destroy(): void {
    if (this.#runner) {
      clearTimeout(this.#runner);
      this.#runner = undefined;
    }
    if (this.ctx.client.collectors.has(this.key)) {
      this.ctx.client.collectors.delete(this.key);
    }
  }

  /**
   * Wait message collector until 'end' event is fired.
   */
  public async wait(): Promise<boolean> {
    return await new Promise((resolve) => {
      while (this.runner) {
        // just wait.
      }

      resolve(true);
    });
  }
}
