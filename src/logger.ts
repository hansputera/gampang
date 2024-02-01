import p from 'pino';

export type PinoLogger = p.Logger;

/**
 * Create pino logger.
 * @param {string} service logger service.
 * @param {p.LoggerOptions} options logger options.
 * @return {PinoLogger}
 */
export const createLogger = (
  service: string,
  options?: p.LoggerOptions,
): PinoLogger => {
  return p({
    'name': service.replace(/\s+/g, '_'),
    'enabled': true,
    'transport': {
      'target': 'pino-pretty',
      'options': {
        'colorize': true,
        'ignore': 'hostname',
        'hideObject': true,
      },
    },
    timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
    ...options,
  });
};
