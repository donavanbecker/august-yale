import { describe, expect, it } from 'vitest'

import details from './details'

describe('details method', () => {
  it('should be a function', () => {
    expect(typeof details).toBe('function')
  })
})
