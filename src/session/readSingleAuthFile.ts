import { BufferJSON, proto, SignalDataTypeMap } from '@adiwajshing/baileys';
import * as fs from 'node:fs/promises';
import { format as textFormat } from 'node:util';
import { AuthState } from '../@typings';

/**
 * This function only reads your session file.
 * We recomend you to use new authentication method using `useMultiFileAuthState`, and others.
 * @param {string} filePath Your single auth file authentication
 * @return {Promise<AuthState | undefined>}
 */
export const readSingleAuthFile = async (
  filePath: string,
): Promise<AuthState | undefined> => {
  const contents = await fs
    .readFile(filePath, {
      'encoding': 'utf8',
    })
    .catch(() => undefined);
  if (!contents) return undefined;

  const KEY_MAP: Record<keyof SignalDataTypeMap, string> = {
    'pre-key': 'preKeys',
    'session': 'sessions',
    'sender-key': 'senderKeys',
    'app-state-sync-key': 'appStateSyncKeys',
    'app-state-sync-version': 'appStateVersions',
    'sender-key-memory': 'senderKeyMemory',
  };

  try {
    const json: AuthState['state'] = JSON.parse(contents, BufferJSON.reviver);
    if (typeof json.creds !== 'object' || typeof json.keys !== 'object')
      throw new Error("Couldn't find `json.creds`, or `json.keys`");

    return {
      'state': {
        creds: json.creds,
        keys: {
          get: <T extends keyof SignalDataTypeMap>(type: T, ids: string[]) => {
            const key = KEY_MAP[type];
            return ids.reduce(
              (dict: Record<string, SignalDataTypeMap[T]>, id: string) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let value = (json.keys as any)[key]?.[id];
                if (value) {
                  if (type === 'app-state-sync-key') {
                    value = proto.Message.AppStateSyncKeyData.fromObject(value);
                  }
                  dict[id] = value;
                }

                return dict;
              },
              {},
            );
          },
          set: async (data) => {
            for (const key in data) {
              if (Object.prototype.hasOwnProperty.call(data, key)) {
                const theKey = KEY_MAP[key as keyof SignalDataTypeMap];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (json.keys as any)[theKey] = (json.keys as any)[theKey] || {};

                Object.assign(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (json.keys as any)[theKey],
                  data[key as keyof SignalDataTypeMap],
                );
              }
            }
          },
        },
      },
      saveCreds: () => Promise.resolve(),
    };
  } catch (e: unknown) {
    throw new Error(textFormat('Fail to read: %s', (e as Error).message));
  }
};
