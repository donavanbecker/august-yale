import { AugustLockStatus } from '../types.js';
/**
 * * Get status of a lock
 *
 * @param {string} [lockId]
 * @return {AugustLockStatus}
 */
export default async function status(this: any, lockId: string, internal: any): Promise<AugustLockStatus | any> {
  if (!lockId) {
    const locks = Object.keys(await this._locks());

    if (locks.length > 1) {
      return Promise.all(locks.map(this._status.bind(this)));
    }

    lockId = locks[0];
  }

  const { body } = await this.put(`/remoteoperate/${lockId}/status`);

  if (!internal) {
    this.end();
  }

  if (!body) {
    return;
  }

  this.addSimpleProps(body);

  return body;
}
