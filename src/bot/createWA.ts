import makeWASocket, {
  Browsers,
  UserFacingSocketConfig,
} from '@adiwajshing/baileys';
import { RawClient } from '../@typings';
import { SessionManager } from '../utils';

/**
 * Create raw WA.
 * @param {SessionManager} session Session manager.
 * @param {UserFacingSocketConfig} config Baileys config.
 * @return {Promise<RawClient>}
 */
export const createWA = async (
  session: SessionManager,
  config: Omit<UserFacingSocketConfig, 'auth'>,
): Promise<RawClient> => {
  const bot = makeWASocket({
    ...config,
    'auth': session.auth,
    'browser': Browsers.windows('Chrome'), // safety issue
  });

  return bot;
};
