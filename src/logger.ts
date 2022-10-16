import p from 'pino';
import mainLogger from '@adiwajshing/baileys/lib/Utils/logger';

export type PinoLogger = ReturnType<typeof mainLogger.child>;

/**
 * Create pino logger.
 * @param {string} service logger service.
 * @param {p.LoggerOptions} options logger options.
 * @return {PinoLogger}
 */
export const createLogger = (
  service: string,
  options?: p.ChildLoggerOptions,
): PinoLogger => {
  return mainLogger.child(mainLogger, {
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
};
