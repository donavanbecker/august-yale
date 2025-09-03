import { describe, expect, it } from 'vitest'

import subscribe from './subscribe'

describe('subscribe method', () => {
  it('should be a function', () => {
    expect(typeof subscribe).toBe('function')
  })
})
