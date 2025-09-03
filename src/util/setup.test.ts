import { describe, expect, it } from 'vitest'

import * as Setup from './setup'

describe('setup util', () => {
  it('should export expected members', () => {
    expect(Setup).toBeDefined()
  })
})
