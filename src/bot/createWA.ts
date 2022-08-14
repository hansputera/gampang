import makeWASocket, {
  useMultiFileAuthState,
  UserFacingSocketConfig,
} from '@adiwajshing/baileys';
import { RawClient } from '../@typings';

/**
 * Create raw WA.
 * @param {string} folder Session folder.
 * @param {UserFacingSocketConfig} config Baileys config.
 * @return {Promise<RawClient>}
 */
export const createWA = async (
  folder: string,
  config: Omit<UserFacingSocketConfig, 'auth'>,
): Promise<RawClient> => {
  const auth = await useMultiFileAuthState(folder);
  const bot = makeWASocket({
    ...config,
    'auth': auth.state,
  });

  return {
    ...bot,
    getAuth: () => auth,
  };
};
