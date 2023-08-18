import { Context } from '../structures/context';

export interface CollectorOptions {
  max: number;
  time?: number;
  validation: (ctx: Context) => Promise<boolean> | boolean;
}

export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

export type ButtonType = 'basic' | 'list' | 'template';

export interface ButtonListOptions {
  highlightText?: string;
  sections: {
    title: string;
    buttons: (ButtonItem & { description?: string })[];
  };
  buttonText: string;
}
export interface ButtonBasicOptions {
  button: ButtonItem;
}

export interface ButtonItem {
  text: string;
  cmdName: string;
}

interface BaseButtonOptions {
  header: string;
  footer?: string | undefined;
}

export type ButtonOptions = BaseButtonOptions &
  (ButtonListOptions | ButtonBasicOptions);

export interface PollVoteEventData {
  pollId: string;
  voter: string;
  sender?: string;
  payload: Uint8Array;
  payload_iv: Uint8Array;
}

