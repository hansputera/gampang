import makeWASocket, { AuthenticationState } from '@adiwajshing/baileys';
import type pino from 'pino';
import type { Client } from '../bot';
import type { Context, MessageCollector } from '../structures';
import type { PollCreateEventData, PollVoteEventData } from './messages';
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
  dataStore?: IStore<string, string>;
  prefixes?: string[];
  owners?: string[];
  middlewares?: {
    cooldown?: MiddlewareFunc;
  };
  saveGroupMetadata?: boolean;
  logger?: pino.LoggerOptions;
  disableCooldown?: boolean;
}

export type CollectorEventState = 'create' | 'end';

export interface ClientEvents {
  'qr': (code: string) => Promise<void> | void;
  'ready': () => Promise<void> | void;
  'logout': () => Promise<void> | void;
  'message': (context: Context) => Promise<void> | void;
  'collector': (
    state: CollectorEventState,
    collector: MessageCollector,
  ) => Promise<void> | void;
  'poll': (poll: PollCreateEventData, ctx: Context) => Promise<void> | void;
  'vote': (vote: PollVoteEventData, ctx: Context) => Promise<void> | void;
}

/**
 * Middleware Function
 * @param {Context} ctx Message context.
 * @return {Promise<boolean>} You should return boolean or an Error
 */
export type MiddlewareFunc = (ctx: Context) => Promise<boolean>;

export type AuthState = {
  state: AuthenticationState;
  saveCreds: () => Promise<void>;
};

/**
 * @param {Client} client Gampang Client
 * @param {string} path Authentication session path (if required by adapter)
 * @param {T} args Adapter's args
 * @return {Promise<{ state: AuthenticationState, save: () => Promise<void> }>}
 */
export type Adapter<T> = (
  client: Client,
  path: string,
  args: T,
) => Promise<{
  state: AuthState['state'];
  save: AuthState['saveCreds'];
}>;
