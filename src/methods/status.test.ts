import { describe, expect, it } from 'vitest'

import status from './status'

describe('status method', () => {
  it('should be a function', () => {
    expect(typeof status).toBe('function')
  })
})
