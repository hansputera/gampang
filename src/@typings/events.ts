import { BaileysEventMap } from '@adiwajshing/baileys';
import type { Client } from '../bot';

export type BaileysEventList = keyof BaileysEventMap;
export type CustomEventFunc<T extends BaileysEventList> = (
  client: Client,
  arg: BaileysEventMap[T],
) => Promise<void>;
