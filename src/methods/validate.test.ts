import { describe, expect, it } from 'vitest'

import validate from './validate'

describe('validate method', () => {
  it('should be a function', () => {
    expect(typeof validate).toBe('function')
  })
})
