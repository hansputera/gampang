import makeWASocket from '@adiwajshing/baileys';
import type { Context } from '../structures';
import type { IStore } from './stores';

export type MakeWaSocketType = ReturnType<typeof makeWASocket>;
export type RawClient = MakeWaSocketType;

export type QrStoreType = 'file' | 'terminal' | 'web';

export interface ClientOptions {
  qr?: {
    store: QrStoreType;
    options?: Record<string, string | number>;
  };
  /**
   * Custom data store.
   */
  dataStore?: IStore<string, unknown>;
  prefixes?: string[];
  owners?: string[];
}

export interface ClientEvents {
  'qr': (code: string) => Promise<void> | void;
  'ready': () => Promise<void> | void;
  'logout': () => Promise<void> | void;
  'message': (context: Context) => Promise<void | void>;
}
