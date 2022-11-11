import { Context } from '../structures/context';

export interface CollectorOptions {
  max: number;
  time?: number;
  validation: (ctx: Context) => Promise<boolean> | boolean;
}

export interface PollCreateEventData {
  encKey: Uint8Array;
  options: string[];
  sender: string;
  pollId: string;
}

export interface PollVoteEventData {
  pollId: string;
  voter: string;
  sender?: string;
  payload: Uint8Array;
  payload_iv: Uint8Array;
}
