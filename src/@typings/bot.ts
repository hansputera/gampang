import makeWASocket, { AuthenticationState } from '@adiwajshing/baileys';
import { Context } from '../structures';

export type MakeWaSocketType = ReturnType<typeof makeWASocket>;
export interface RawClient extends MakeWaSocketType {
  getAuth(): {
    state: AuthenticationState;
    saveCreds: () => Promise<void>;
  };
}

type QrStoreType = 'file' | 'terminal' | 'web';

export interface ClientOptions {
  qr: {
    storeType: QrStoreType;
    options: Record<string, unknown>;
  };
}

export interface ClientEvents<C> {
  'qr': (code: string) => Promise<void> | void;
  'ready': () => Promise<void> | void;
  'logout': () => Promise<void> | void;
  'message': (context: Context) => Promise<void | void>;
}
