import { describe, expect, it } from 'vitest'

import lockUnlock from './lock-unlock'

describe('lockUnlock method', () => {
  it('should be a function', () => {
    expect(typeof lockUnlock).toBe('function')
  })
})
