import PubNub from 'pubnub'

/**
 * Channel cache: lockId -> pubsubChannel.
 * Module-level cache of lock details, not instance state.
 */
const lockChannels = new Map<string, string>()

/**
 * Per-August-instance PubNub state. Keyed by the August instance itself
 * using a WeakMap so garbage collection of the instance also clears state.
 */
interface PubNubState {
  pubnub: PubNub
  // channel -> set of callbacks subscribed to that channel
  subscriptions: Map<string, Set<(message: any, timetoken: any) => void>>
}
const instanceState = new WeakMap<object, PubNubState>()

/**
 * Tear down the PubNub instance associated with this August instance.
 * Called when no subscriptions remain, or externally via cleanup paths.
 */
export function tearDownPubNub(august: object): void {
  const state = instanceState.get(august)
  if (!state) {
    return
  }
  try {
    state.pubnub.removeAllListeners()
    state.pubnub.unsubscribeAll()
    state.pubnub.destroy()
  } catch {
    // Best-effort cleanup; swallow any errors during teardown
  }
  instanceState.delete(august)
}

/**
 * Subscribe to lock events.
 *
 * Returns an idempotent unsubscribe function. Multiple calls to subscribe()
 * for different locks on the same August instance share a single PubNub
 * WebSocket connection. The connection is only torn down when the last
 * subscription is removed.
 *
 * @param {string} [lockId]
 * @param {Function} callback
 */
export default async function subscribe(
  this: any,
  lockId: any,
  callback: any,
  internal: any,
): Promise<() => void> {
  if (!lockId) {
    const locks = Object.keys(await this._locks())
    if (locks.length > 1) {
      // Multiple locks, subscribe to all (use iteration)
      const unsubscribes = await Promise.all(locks.map(id => this._subscribe(id, callback)))
      return () => unsubscribes.forEach(unsubscribe => unsubscribe())
    }
    lockId = locks[0]
  }

  // Resolve and cache the pubsub channel for this lock
  if (!lockChannels.has(lockId)) {
    const details = await this._details(lockId)
    if (!details?.pubsubChannel) {
      console.error('Lock does not have a pubsub channel')
      if (!internal) {
        this.end()
      }
      return () => {}
    }
    lockChannels.set(lockId, details.pubsubChannel)
  }

  if (!internal) {
    this.end()
  }

  const channel = lockChannels.get(lockId)!

  // Get or create the shared PubNub instance for this August instance
  let state = instanceState.get(this)
  if (!state) {
    const pubnub = new PubNub({
      subscribeKey: this.config.pnSubKey,
      uuid: `pn-${this.config.augustId.toUpperCase()}`,
    })
    state = {
      pubnub,
      subscriptions: new Map(),
    }
    instanceState.set(this, state)

    // Single shared listener that dispatches to per-channel callback sets.
    // Previously each subscribe() call added a new listener to a fresh
    // PubNub instance, which leaked both the listener and the instance.
    pubnub.addListener({
      message: (event: any) => {
        const callbacks = state!.subscriptions.get(event.channel)
        if (!callbacks) {
          return
        }
        const { message, timetoken } = event
        this.addSimpleProps(message)
        if (!message.lockId) {
          // Fall back to the first lockId known for this channel
          for (const [cachedLockId, cachedChannel] of lockChannels.entries()) {
            if (cachedChannel === event.channel) {
              message.lockId = cachedLockId
              break
            }
          }
        }
        for (const cb of callbacks) {
          cb(message, timetoken)
        }
      },
    })
  }

  // Register this callback for this channel
  let callbacks = state.subscriptions.get(channel)
  if (!callbacks) {
    callbacks = new Set()
    state.subscriptions.set(channel, callbacks)
    state.pubnub.subscribe({ channels: [channel] })
  }
  callbacks.add(callback)

  // Return an idempotent unsubscribe function
  let unsubscribed = false
  return () => {
    if (unsubscribed) {
      return
    }
    unsubscribed = true
    const currentState = instanceState.get(this)
    if (!currentState) {
      return
    }
    const currentCallbacks = currentState.subscriptions.get(channel)
    if (!currentCallbacks) {
      return
    }
    currentCallbacks.delete(callback)
    if (currentCallbacks.size === 0) {
      currentState.subscriptions.delete(channel)
      try {
        currentState.pubnub.unsubscribe({ channels: [channel] })
      } catch {
        // Best-effort; channel may already be unsubscribed
      }
    }
    // Tear down the PubNub instance entirely when no channels remain
    if (currentState.subscriptions.size === 0) {
      tearDownPubNub(this)
    }
  }
}
