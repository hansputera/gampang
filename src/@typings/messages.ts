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

// interface BaseButtonOptions {
//   text: string;
//   footer?: string;
// }

// export interface ButtonBasicOptions extends BaseButtonOptions {
//   buttons: Pick<WAProto.Message.IButtonsMessage, 'buttons'>;
//   headerType?: Pick<WAProto.Message.IButtonsMessage, 'headerType'>;
// }

// export interface ButtonTemplateOptions extends BaseButtonOptions {
//   viewOnce: boolean;
//   templateButtons: WAProto.IHydratedTemplateButton[];
// }

// export interface ButtonListOptions extends BaseButtonOptions {
//   sections: WAProto.Message.ListMessage.ISection[];
//   title: string;
//   buttonText: string;
// }

// export type ButtonType = 'basic' | 'list' | 'template';

// export type ButtonOptions<T extends ButtonType> = T extends 'basic'
//   ? ButtonBasicOptions
//   : T extends 'list'
//   ? ButtonListOptions
//   : ButtonTemplateOptions;

export interface PollVoteEventData {
  pollId: string;
  voter: string;
  sender?: string;
  payload: Uint8Array;
  payload_iv: Uint8Array;
}

export type PollUpdateMessageResult =
  | {
      hashes: string[];
    }
  | {
      hashes: string[];
      selectedOptions: string[];
    };
