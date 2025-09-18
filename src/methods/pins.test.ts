import { describe, expect, it } from 'vitest'

import pins from './pins.js'

describe('pins', () => {
  it('should export the pins function', () => {
    expect(pins).toBeTypeOf('function')
  })
})
