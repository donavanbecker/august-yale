/* eslint-disable no-console */
import PubNub from 'pubnub';

const lockChannels = new Map();

/**
 * * Subscribe to lock events
 *
 * @param {string} [lockId]
 * @param {function} callback
 */
export default async function subscribe(this: any, lockId: any, callback: any, internal: any): Promise<() => void> {
  if (!lockId) {
    const locks = Object.keys(await this._locks());
    if (locks.length > 1) {
      // Multiple locks, subscribe to all (use iteration)
      const unsubscribes = await Promise.all(locks.map(id => this._subscribe(id, callback)));
      return () => unsubscribes.forEach(unsubscribe => unsubscribe()) as unknown as () => void;
    }
    // Otherwise continue with the only lock
    lockId = locks[0];
  }

  if (!lockChannels.has(lockId)) {
    const details = await this._details(lockId);
    if (!details?.pubsubChannel) {
      console.error('Lock does not have a pubsub channel');
      if (!internal) {
        this.end();
      }
      return () => {};
    }
    // Cache the pubsub channel for this lock
    lockChannels.set(lockId, details.pubsubChannel);
  }

  if (!internal) {
    this.end();
  }

  const channel = lockChannels.get(lockId);

  const pnconfig = {
    subscribeKey: this.config.pnSubKey,
    uuid: `pn-${this.config.augustId.toUpperCase()}`,
  };

  const pubnub = new PubNub(pnconfig);

  pubnub.addListener({
    message: ({ message, timetoken }) => {
      this.addSimpleProps(message);
      if (!message.lockId) {
        message.lockId = lockId;
      }
      callback?.(message, timetoken);
    },
  });

  pubnub.subscribe({
    channels: [channel],
  });

  return () =>
    pubnub.unsubscribe({
      channels: [channel],
    });
}
