import makeWASocket, { AuthenticationState } from '@adiwajshing/baileys';
import { CommandClient } from '../bot';
import { CommandContext, Context } from '../structures';

export type MakeWaSocketType = ReturnType<typeof makeWASocket>;
export interface RawClient extends MakeWaSocketType {
  getAuth(): {
    state: AuthenticationState;
    saveCreds: () => Promise<void>;
  };
}

export interface ClientEvents<C> {
  'qr': (code: string) => Promise<void> | void;
  'ready': () => Promise<void> | void;
  'logout': () => Promise<void> | void;
  'message': (
    context: C extends CommandClient ? CommandContext : Context,
  ) => Promise<void | void>;
}
