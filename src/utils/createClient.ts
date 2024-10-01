import type { ClientOptions } from '../@typings';
import { Client } from '../bot';
import { SessionManager } from './sessionManager';

export const createClient = (
  options?: ClientOptions,
  sessionManager?: SessionManager,
) => {
  sessionManager ??= new SessionManager('./sessions', 'folder');
  options ??= {
    qr: {
      store: 'file',
      options: {
        dest: 'qr-scan-gampang.png',
      },
    },
  };

  return new Client(sessionManager, options);
};
