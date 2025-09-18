import { describe, expect, it } from 'vitest'

import addWebSocketSubscription, { deleteWebSocketSubscription, getWebSocketSubscriptions } from './websocket.js'

describe('websocket', () => {
  it('should export the WebSocket functions', () => {
    expect(addWebSocketSubscription).toBeTypeOf('function')
    expect(getWebSocketSubscriptions).toBeTypeOf('function')
    expect(deleteWebSocketSubscription).toBeTypeOf('function')
  })
})
