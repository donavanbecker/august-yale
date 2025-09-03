import { describe, expect, it } from 'vitest'

import authorize from './authorize'

describe('authorize method', () => {
  it('should be a function', () => {
    expect(typeof authorize).toBe('function')
  })
})
