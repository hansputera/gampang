import makeWASocket, {
  Browsers,
  makeCacheableSignalKeyStore,
  UserFacingSocketConfig,
} from '@adiwajshing/baileys';
import { RawClient } from '../@typings';
import { SessionManager } from '../utils';
import { createLogger } from '../logger';

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
    'auth': {
      'creds': session.auth.creds,
      'keys': makeCacheableSignalKeyStore(
        session.auth.keys,
        createLogger('SessionKeys') as any,
      ), // make a cache to store/recv more faster
    },
    'browser': Browsers.windows('Chrome'), // safety issue
    'generateHighQualityLinkPreview': true,
  });

  return bot;
};
