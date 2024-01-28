import { AugustLockStatus } from '../types.js';

/**
 * * Lock or unlock a lock
 *
 * @param {string} action (used internally)
 * @param {string} [lockId]
 * @return {AugustLockStatus}
 */
export default async function lockUnlock(this: any, action: string, lockId: string): Promise<AugustLockStatus> {
  if (action !== 'lock' && action !== 'unlock') {
    throw ReferenceError('Action must either be \'lock\' or \'unlock\'');
  }

  if (!lockId) {
    const locks = Object.keys(await this._locks());

    // Make sure we never, ever lock or unlock the wrong lock
    if (locks.length > 1) {
      throw Error(`If you own multiple locks, you must specify which lock to ${action}.`);
    }

    lockId = locks[0];
  }

  const { body } = await this.put(`/remoteoperate/${lockId}/${action}`);

  this.end();

  this.addSimpleProps(body);

  return body;

}
