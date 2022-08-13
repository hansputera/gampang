import p from 'pino';

/**
 * Create pino logger.
 * @param {string} service logger service.
 * @param {p.LoggerOptions} options logger options.
 * @return {p.Logger}
 */
export const createLogger = (
  service: string,
  options?: p.LoggerOptions,
): p.Logger =>
  p({
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
    ...options,
  });
