import { describe, expect, it } from 'vitest'

import unlatch from './unlatch.js'

describe('unlatch', () => {
  it('should export the unlatch function', () => {
    expect(unlatch).toBeTypeOf('function')
  })
})
