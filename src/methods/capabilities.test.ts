import { describe, expect, it } from 'vitest'

import capabilities from './capabilities.js'

describe('capabilities', () => {
  it('should export the capabilities function', () => {
    expect(capabilities).toBeTypeOf('function')
  })
})
