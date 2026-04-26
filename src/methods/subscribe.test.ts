import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the PubNub module before importing subscribe
const mockPubNubInstances: any[] = []

vi.mock('pubnub', () => {
  return {
    // eslint-disable-next-line prefer-arrow-callback -- must be a function for `new` (vitest 4 requires constructable mocks)
    default: vi.fn().mockImplementation(function () {
      const listeners: any[] = []
      const subscribedChannels = new Set<string>()
      const instance = {
        addListener: vi.fn((listener: any) => {
          listeners.push(listener)
        }),
        subscribe: vi.fn(({ channels }: { channels: string[] }) => {
          channels.forEach(c => subscribedChannels.add(c))
        }),
        unsubscribe: vi.fn(({ channels }: { channels: string[] }) => {
          channels.forEach(c => subscribedChannels.delete(c))
        }),
        unsubscribeAll: vi.fn(() => {
          subscribedChannels.clear()
        }),
        removeAllListeners: vi.fn(() => {
          listeners.length = 0
        }),
        destroy: vi.fn(),
        _listeners: listeners,
        _subscribedChannels: subscribedChannels,
        _simulateMessage: (event: any) => {
          listeners.forEach(l => l.message?.(event))
        },
        _simulateStatus: (status: any) => {
          listeners.forEach(l => l.status?.(status))
        },
      }
      mockPubNubInstances.push(instance)
      return instance
    }),
  }
})

const subscribeModule = await import('./subscribe')
const subscribe = subscribeModule.default
const { tearDownPubNub, onPubNubStatus } = subscribeModule

function makeFakeAugust(options: { lockIds?: string[], pubsubChannels?: Record<string, string> } = {}) {
  const lockIds = options.lockIds ?? ['lock-1']
  const channels = options.pubsubChannels ?? { 'lock-1': 'channel-1' }
  const august: any = {
    config: {
      pnSubKey: 'sub-key',
      augustId: 'user@example.com',
    },
    end: vi.fn(),
    addSimpleProps: vi.fn((msg: any) => {
      msg._propsAdded = true
    }),
    _locks: vi.fn(async () => {
      const result: Record<string, any> = {}
      lockIds.forEach((id) => {
        result[id] = {}
      })
      return result
    }),
    _details: vi.fn(async (lockId: string) => ({
      pubsubChannel: channels[lockId],
    })),
    _subscribe: vi.fn(async function (this: any, id: string, cb: any) {
      return subscribe.call(this, id, cb, true)
    }),
  }
  return august
}

describe('subscribe method - basic', () => {
  beforeEach(() => {
    mockPubNubInstances.length = 0
  })

  it('should be a function', () => {
    expect(typeof subscribe).toBe('function')
  })

  it('returns an unsubscribe function', async () => {
    const august = makeFakeAugust()
    const unsub = await subscribe.call(august, 'lock-1', vi.fn(), false)
    expect(typeof unsub).toBe('function')
  })
})

describe('subscribe method - PubNub instance sharing', () => {
  beforeEach(() => {
    mockPubNubInstances.length = 0
  })

  it('creates only one PubNub instance for multiple subscriptions on the same August instance', async () => {
    const august = makeFakeAugust({
      lockIds: ['lock-1', 'lock-2', 'lock-3'],
      pubsubChannels: {
        'lock-1': 'channel-1',
        'lock-2': 'channel-2',
        'lock-3': 'channel-3',
      },
    })

    await subscribe.call(august, 'lock-1', vi.fn(), false)
    await subscribe.call(august, 'lock-2', vi.fn(), false)
    await subscribe.call(august, 'lock-3', vi.fn(), false)

    // Core leak fix: previously each call created a new PubNub
    expect(mockPubNubInstances.length).toBe(1)
  })

  it('subscribes to the correct channel for each lock', async () => {
    const august = makeFakeAugust({
      lockIds: ['lock-1', 'lock-2'],
      pubsubChannels: { 'lock-1': 'channel-1', 'lock-2': 'channel-2' },
    })

    await subscribe.call(august, 'lock-1', vi.fn(), false)
    await subscribe.call(august, 'lock-2', vi.fn(), false)

    const pn = mockPubNubInstances[0]
    expect(pn._subscribedChannels.has('channel-1')).toBe(true)
    expect(pn._subscribedChannels.has('channel-2')).toBe(true)
  })

  it('creates separate PubNub instances for separate August instances', async () => {
    const august1 = makeFakeAugust()
    const august2 = makeFakeAugust()
    await subscribe.call(august1, 'lock-1', vi.fn(), false)
    await subscribe.call(august2, 'lock-1', vi.fn(), false)
    expect(mockPubNubInstances.length).toBe(2)
  })
})

describe('subscribe method - unsubscribe cleanup', () => {
  beforeEach(() => {
    mockPubNubInstances.length = 0
  })

  it('unsubscribe removes the callback and unsubscribes from channel', async () => {
    const august = makeFakeAugust()
    const cb = vi.fn()
    const unsub = await subscribe.call(august, 'lock-1', cb, false)

    const pn = mockPubNubInstances[0]
    expect(pn._subscribedChannels.has('channel-1')).toBe(true)

    unsub()
    expect(pn._subscribedChannels.has('channel-1')).toBe(false)
  })

  it('destroys the PubNub instance when the last subscription is removed', async () => {
    const august = makeFakeAugust()
    const unsub = await subscribe.call(august, 'lock-1', vi.fn(), false)

    const pn = mockPubNubInstances[0]
    expect(pn.destroy).not.toHaveBeenCalled()

    unsub()
    expect(pn.destroy).toHaveBeenCalledOnce()
    expect(pn.removeAllListeners).toHaveBeenCalledOnce()
  })

  it('does not destroy the PubNub instance while other subscriptions remain', async () => {
    const august = makeFakeAugust({
      lockIds: ['lock-1', 'lock-2'],
      pubsubChannels: { 'lock-1': 'channel-1', 'lock-2': 'channel-2' },
    })
    const unsub1 = await subscribe.call(august, 'lock-1', vi.fn(), false)
    await subscribe.call(august, 'lock-2', vi.fn(), false)

    const pn = mockPubNubInstances[0]
    unsub1()
    expect(pn.destroy).not.toHaveBeenCalled()
    expect(pn._subscribedChannels.has('channel-1')).toBe(false)
    expect(pn._subscribedChannels.has('channel-2')).toBe(true)
  })

  it('unsubscribe is idempotent - calling twice is safe', async () => {
    const august = makeFakeAugust()
    const unsub = await subscribe.call(august, 'lock-1', vi.fn(), false)

    const pn = mockPubNubInstances[0]
    unsub()
    unsub()
    unsub()

    expect(pn.destroy).toHaveBeenCalledOnce()
  })
})

describe('subscribe method - multiple callbacks per channel', () => {
  beforeEach(() => {
    mockPubNubInstances.length = 0
  })

  it('allows multiple callbacks on the same channel without subscribing twice', async () => {
    const august = makeFakeAugust()
    await subscribe.call(august, 'lock-1', vi.fn(), false)
    await subscribe.call(august, 'lock-1', vi.fn(), false)

    const pn = mockPubNubInstances[0]
    expect(pn.subscribe).toHaveBeenCalledOnce()
  })

  it('dispatches messages to all callbacks for a channel', async () => {
    const august = makeFakeAugust()
    const cb1 = vi.fn()
    const cb2 = vi.fn()
    await subscribe.call(august, 'lock-1', cb1, false)
    await subscribe.call(august, 'lock-1', cb2, false)

    const pn = mockPubNubInstances[0]
    pn._simulateMessage({
      channel: 'channel-1',
      message: { status: 'locked' },
      timetoken: '123',
    })

    expect(cb1).toHaveBeenCalledOnce()
    expect(cb2).toHaveBeenCalledOnce()
  })

  it('unsubscribing one callback does not affect the other', async () => {
    const august = makeFakeAugust()
    const cb1 = vi.fn()
    const cb2 = vi.fn()
    const unsub1 = await subscribe.call(august, 'lock-1', cb1, false)
    await subscribe.call(august, 'lock-1', cb2, false)

    unsub1()

    const pn = mockPubNubInstances[0]
    expect(pn._subscribedChannels.has('channel-1')).toBe(true)
    pn._simulateMessage({
      channel: 'channel-1',
      message: { status: 'locked' },
      timetoken: '123',
    })
    expect(cb1).not.toHaveBeenCalled()
    expect(cb2).toHaveBeenCalledOnce()
  })
})

describe('subscribe method - tearDownPubNub', () => {
  beforeEach(() => {
    mockPubNubInstances.length = 0
  })

  it('tears down all subscriptions on the instance', async () => {
    const august = makeFakeAugust({
      lockIds: ['lock-1', 'lock-2'],
      pubsubChannels: { 'lock-1': 'channel-1', 'lock-2': 'channel-2' },
    })
    await subscribe.call(august, 'lock-1', vi.fn(), false)
    await subscribe.call(august, 'lock-2', vi.fn(), false)

    tearDownPubNub(august)

    const pn = mockPubNubInstances[0]
    expect(pn.removeAllListeners).toHaveBeenCalled()
    expect(pn.destroy).toHaveBeenCalled()
  })

  it('is safe to call when no PubNub instance exists', () => {
    const august = makeFakeAugust()
    expect(() => tearDownPubNub(august)).not.toThrow()
  })

  it('is idempotent', async () => {
    const august = makeFakeAugust()
    await subscribe.call(august, 'lock-1', vi.fn(), false)

    const pn = mockPubNubInstances[0]
    tearDownPubNub(august)
    tearDownPubNub(august)

    expect(pn.destroy).toHaveBeenCalledOnce()
  })
})

describe('onPubNubStatus', () => {
  it('delivers status events to a listener registered AFTER subscribe()', async () => {
    const august = makeFakeAugust()
    await subscribe.call(august, 'lock-1', vi.fn(), false)
    const pn = mockPubNubInstances[mockPubNubInstances.length - 1]

    const listener = vi.fn()
    onPubNubStatus(august, listener)

    pn._simulateStatus({ category: 'PNReconnectedCategory' })
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith({ category: 'PNReconnectedCategory' })
  })

  it('delivers status events to a listener registered BEFORE subscribe()', async () => {
    // Use case from homebridge-august: register the listener at platform
    // init time, before any lock has called subscribe(). The listener
    // must still see events when subscribe() eventually creates the
    // PubNub instance.
    const august = makeFakeAugust()
    const listener = vi.fn()
    onPubNubStatus(august, listener)

    await subscribe.call(august, 'lock-1', vi.fn(), false)
    const pn = mockPubNubInstances[mockPubNubInstances.length - 1]
    pn._simulateStatus({ category: 'PNConnectedCategory' })
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('delivers events to all registered listeners', async () => {
    const august = makeFakeAugust()
    await subscribe.call(august, 'lock-1', vi.fn(), false)
    const pn = mockPubNubInstances[mockPubNubInstances.length - 1]

    const a = vi.fn()
    const b = vi.fn()
    onPubNubStatus(august, a)
    onPubNubStatus(august, b)

    pn._simulateStatus({ category: 'PNReconnectedCategory' })
    expect(a).toHaveBeenCalledTimes(1)
    expect(b).toHaveBeenCalledTimes(1)
  })

  it('returns an unsubscribe function that removes only that listener', async () => {
    const august = makeFakeAugust()
    await subscribe.call(august, 'lock-1', vi.fn(), false)
    const pn = mockPubNubInstances[mockPubNubInstances.length - 1]

    const a = vi.fn()
    const b = vi.fn()
    const unsubscribeA = onPubNubStatus(august, a)
    onPubNubStatus(august, b)

    unsubscribeA()
    pn._simulateStatus({ category: 'PNReconnectedCategory' })

    expect(a).not.toHaveBeenCalled()
    expect(b).toHaveBeenCalledTimes(1)
  })

  it('unsubscribe is idempotent', async () => {
    const august = makeFakeAugust()
    await subscribe.call(august, 'lock-1', vi.fn(), false)
    const pn = mockPubNubInstances[mockPubNubInstances.length - 1]

    const a = vi.fn()
    const unsubscribe = onPubNubStatus(august, a)
    unsubscribe()
    unsubscribe() // second call is a no-op

    pn._simulateStatus({ category: 'PNReconnectedCategory' })
    expect(a).not.toHaveBeenCalled()
  })

  it('a throwing listener does not block other listeners', async () => {
    const august = makeFakeAugust()
    await subscribe.call(august, 'lock-1', vi.fn(), false)
    const pn = mockPubNubInstances[mockPubNubInstances.length - 1]

    const good = vi.fn()
    onPubNubStatus(august, () => {
      throw new Error('listener bug')
    })
    onPubNubStatus(august, good)

    expect(() => pn._simulateStatus({ category: 'PNReconnectedCategory' })).not.toThrow()
    expect(good).toHaveBeenCalledTimes(1)
  })

  it('tearDownPubNub clears status listeners', async () => {
    const august = makeFakeAugust()
    await subscribe.call(august, 'lock-1', vi.fn(), false)
    const pn = mockPubNubInstances[mockPubNubInstances.length - 1]

    const a = vi.fn()
    onPubNubStatus(august, a)
    tearDownPubNub(august)

    // The mock's _simulateStatus iterates the listener list pn carries;
    // after tearDownPubNub, removeAllListeners() emptied pn._listeners,
    // so the status callback won't be invoked anyway. But the contract
    // we care about is: after teardown, even if a NEW pubnub instance
    // is created (a fresh subscribe call), the previous listener must
    // not still be wired up.
    await subscribe.call(august, 'lock-1', vi.fn(), false)
    const pn2 = mockPubNubInstances[mockPubNubInstances.length - 1]
    expect(pn2).not.toBe(pn)
    pn2._simulateStatus({ category: 'PNReconnectedCategory' })
    expect(a).not.toHaveBeenCalled()
  })
})
