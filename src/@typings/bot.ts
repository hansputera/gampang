import makeWASocket, { AuthenticationState } from '@adiwajshing/baileys';

export type MakeWaSocketType = ReturnType<typeof makeWASocket>;
export interface RawClient extends MakeWaSocketType {
  getAuth(): {
    state: AuthenticationState;
    saveCreds: () => Promise<void>;
  };
}

export interface ClientEvents {
  'qr': (code: string) => Promise<void> | void;
  'ready': () => Promise<void> | void;
  'logout': () => Promise<void> | void;
}
