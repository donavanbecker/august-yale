import { describe, expect, it } from 'vitest'

import lockAsync, { statusAsync, unlatchAsync, unlockAsync } from './async-operations.js'

describe('async-operations', () => {
  it('should export the async operation functions', () => {
    expect(lockAsync).toBeTypeOf('function')
    expect(unlockAsync).toBeTypeOf('function')
    expect(unlatchAsync).toBeTypeOf('function')
    expect(statusAsync).toBeTypeOf('function')
  })
})
