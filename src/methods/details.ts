import { AugustLockDetails } from '../types.js';
/**
 * * Get details for a lock
 *
 * @param {string} [lockId]
 * @return {AugustLockDetails}
 */
export default async function details(this: any, lockId: string, internal: any): Promise<AugustLockDetails[]> {
  if (!lockId) {
    const locks = Object.keys(await this._locks());

    if (locks.length > 1) {
      return Promise.all(locks.map(this._details.bind(this)));
    }

    lockId = locks[0];
  }

  const { body } = await this.get(`/locks/${lockId}`);

  if (!internal) {
    this.end();
  }

  body.lockId = body.LockID;

  return body;
}
