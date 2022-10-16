import { AuthenticationCreds, BaileysEventMap } from '@adiwajshing/baileys';
import type { Client } from '../bot';

export type BaileysEventList = keyof BaileysEventMap<AuthenticationCreds>;
export type CustomEventFunc<T extends BaileysEventList> = (
  client: Client,
  arg: BaileysEventMap<AuthenticationCreds>[T],
) => Promise<void>;
