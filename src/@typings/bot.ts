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
  qr?: {
    store: QrStoreType;
    options?: Record<string, string | number>;
  };
  prefixes?: string[];
  owners?: string[];
}

export interface ClientEvents {
  'qr': (code: string) => Promise<void> | void;
  'ready': () => Promise<void> | void;
  'logout': () => Promise<void> | void;
  'message': (context: Context) => Promise<void | void>;
}
