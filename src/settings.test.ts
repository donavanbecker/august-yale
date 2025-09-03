import { describe, expect, it } from 'vitest'

import * as Settings from './settings'

describe('settings module', () => {
  it('should export expected members', () => {
    expect(Settings).toBeDefined()
  })
})
