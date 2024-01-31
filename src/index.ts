/* eslint-disable no-console */
/* Copyright(C) 2024, donavanbecker (https://github.com/donavanbecker). All rights reserved.
 *
 * index.ts: august-yale API registration.
 */
import tiny from 'tiny-json-http';

import setup from './util/setup.js';
import session from './util/session.js';

import authorize from './methods/authorize.js';
import validate from './methods/validate.js';
import lockUnlock from './methods/lock-unlock.js';
import locks from './methods/locks.js';
import status from './methods/status.js';
import details from './methods/details.js';
import subscribe from './methods/subscribe.js';

import { config } from './types.js';

const API_URL_US = 'https://api-production.august.com';
const API_URL_NON_US = 'https://api.aaecosystem.com';

class August {
  config: config;
  token: any;
  constructor(config: any) {
    this.config = setup(config);
  }

  async fetch({ method, ...params }: { method: string, [key: string]: any }) {
    const API_URL = this.config.countryCode === 'US' ? API_URL_US : API_URL_NON_US;

    // Ensure proper url
    if (!params.url.startsWith(API_URL)) {
      if (!params.url.startsWith('/')) {
        params.url = '/' + params.url;
      }
      params.url = API_URL + params.url;
    }
    try {
      // Keep this `await` - it allows us to catch errors from tiny
      // console.log('REQUEST', method, params)
      const res = await (tiny as any)[method](params);
      // console.log('RESPONSE', res)
      return res;
    } catch (err: any) {
      // Convert giagantic error to a more manageable one
      let errorMessage;
      if (err.statusCode) {
        errorMessage = `FetchError: Status ${err.statusCode} (${err.body.code}): ${err.body.message}`;
      } else {
        errorMessage = err;
      }

      console.error(errorMessage);
      return {};
    }
  }

  /* --------------------------------- Session -------------------------------- */
  async #start(method: any, url: any, data: any) {
    // Start or continue a session
    const headers: { [key: string]: any } = await session.call(this);

    if (!this.token) {
      throw Error('Session not started');
    }

    if (!data) {
      headers['Content-Length'] = 0;
    } // If no data, endpoint requires `Content-length: 0` or it won't hang up ¯\_(ツ)_/¯

    return this.fetch({ method, url, headers, data });
  }

  async get(endpoint: any) {
    return this.#start('get', endpoint, null);
  }

  async post(endpoint: any, data: any) {
    return this.#start('post', endpoint, data);
  }

  async put(endpoint: any, data: any) {
    return this.#start('put', endpoint, data);
  }

  end() {
    // End the session (called automatically in every method below except where noted)
    this.token = null;
  }

  /* ---------------------------------- Auth ---------------------------------- */
  async authorize() {
    return authorize.call(this);
  }

  async validate(code: string) {
    return validate.call(this, code);
  }

  /* ---------------------------------- Info ---------------------------------- */
  async locks() {
    return locks.call(this, false);
  }

  async _locks() {
    // Interal use only
    return locks.call(this, true); // true keeps the session alive
  }

  async details(lockId?: string) {
    return details.call(this, false, lockId);
  }

  async _details(lockId?: string) {
    // Interal use only
    return details.call(this, true, lockId); // true keeps the session alive
  }

  async status(lockId: string) {
    return status.call(this, lockId, false);
  }

  async _status(lockId: string) {
    // Interal use only
    return status.call(this, lockId, true); // true keeps the session alive
  }

  /* --------------------------------- Action --------------------------------- */
  async lock(lockId: string) {
    return lockUnlock.call(this, 'lock', lockId);
  }

  async unlock(lockId: string) {
    return lockUnlock.call(this, 'unlock', lockId);
  }

  /* --------------------------------- Events --------------------------------- */
  async subscribe(lockId: any, callback: any) {
    return subscribe.call(this, lockId, callback, false);
  }

  async _subscribe(lockId: any, callback: any) {
    return subscribe.call(this, lockId, callback, true); // true keeps the session alive
  }

  addSimpleProps(obj: { state?: any; lockID?: any; status?: any; doorState?: any; info?: any; }) {
    // Adds .state and .lockID to obj
    const { status, doorState, info } = obj;
    obj.state = {};
    if (status) {
      obj.state.locked = status === 'kAugLockState_Locked' || status === 'locked';
      obj.state.unlocked = status === 'kAugLockState_Unlocked' || status === 'unlocked';
    }
    if (doorState) {
      obj.state.open =
          doorState === 'kAugDoorState_Open' ||
          doorState === 'kAugLockDoorState_Open' ||
          doorState === 'open';
      obj.state.closed =
          doorState === 'kAugDoorState_Closed' ||
          doorState === 'kAugLockDoorState_Closed' ||
          doorState === 'closed';
    }
    if (info?.lockID) {
      obj.lockID = info.lockID;
    }
  }

  /* ----------------------------- Static methods ----------------------------- */
  static async authorize(config: any) {
    return new August(config).authorize();
  }

  static async validate(config: any, code: string) {
    return new August(config).validate(code);
  }

  static async locks(config: any) {
    return new August(config).locks();
  }

  static async details(config: any, lockId?: string) {
    return new August(config).details(lockId);
  }

  static async status(config: any, lockId: any) {
    return new August(config).status(lockId);
  }

  static async lock(config: any, lockId: any) {
    return new August(config).lock(lockId);
  }

  static async unlock(config: any, lockId: any) {
    return new August(config).unlock(lockId);
  }

  static async subscribe(config: any, lockId: any, callback: any) {
    return new August(config).subscribe(lockId, callback);
  }
}

export default August;