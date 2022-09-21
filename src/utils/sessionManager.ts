import {
  AuthenticationState,
  useMultiFileAuthState,
  useSingleFileLegacyAuthState,
} from '@adiwajshing/baileys';
import * as fs from 'node:fs';

type SessionType = 'file' | 'folder';

/**
 * @class SessionManager
 * @description Support legacy, and modern session
 */
export class SessionManager {
  #auth!: AuthenticationState;
  /**
   * Save current state.
   * @return {Promise<void> | void}
   */
  public save!: () => Promise<void> | void;
  /**
   * @constructor
   * @param {string} path Session Path
   */
  constructor(private path: string, private type: SessionType = 'folder') {
    if (typeof path !== 'string') throw new TypeError('Invalid path');
    else if (
      typeof type !== 'string' ||
      ['folder', 'file'].indexOf(type.toLowerCase()) === -1
    )
      throw new TypeError('Invalid session type');

    this.type = type.toLowerCase() as SessionType;
    this.#init();
  }

  /**
   * Initialize session manager.
   * @return {void}
   */
  #init(): void {
    const stat = fs.statSync(this.path);
    if (stat.isDirectory() && this.type === 'file') {
      throw new TypeError(`'${this.path}' is folder!`);
    } else if (stat.isFile() && this.type === 'folder') {
      throw new TypeError(`'${this.path}' is file!`);
    }

    switch (this.type) {
      case 'file': {
        useMultiFileAuthState(this.path).then((state) => {
          this.#auth = state.state;
          this.save = state.saveCreds;
        });
        break;
      }
      case 'folder': {
        const state = useSingleFileLegacyAuthState(this.path);
        this.#auth = state.state as unknown as AuthenticationState;
        this.save = state.saveState;
      }
    }

    return;
  }

  /**
   * Remove current session folder/path
   * @return {Promise<boolean>}
   */
  public async remove(): Promise<boolean> {
    const stat = await fs.promises.stat(this.path);
    if (stat.size <= 0) return false;

    if (stat.isFile()) {
      const err = await fs.promises.unlink(this.path).catch((e) => e);
      if (err) return false;
    } else {
      const err = await fs.promises
        .rm(this.path, {
          'recursive': true,
          'force': true,
        })
        .catch((e) => e);

      if (err) return false;
    }

    return true;
  }

  /**
   * Get current authentication state.
   * @return {AuthenticationCreds}
   */
  public get auth(): AuthenticationState {
    return this.#auth;
  }
}
