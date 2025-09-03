import { describe, expect, it } from 'vitest'

import locks from './locks'

describe('locks method', () => {
  it('should be a function', () => {
    expect(typeof locks).toBe('function')
  })
})
