import type { config } from './types'

import { describe, expect, it } from 'vitest'

import August from './index'

describe('august', () => {
  const mockConfig: config = {
    countryCode: 'US',
    installId: 'test-install-id',
    augustId: 'test@example.com',
    password: 'test-password',
    // Add any other required config properties here
  }

  it('should instantiate with config', () => {
    const august = new August(mockConfig)
    expect(august).toBeInstanceOf(August)
  })

  it('should have static methods', () => {
    expect(typeof August.authorize).toBe('function')
    expect(typeof August.locks).toBe('function')
    expect(typeof August.lock).toBe('function')
    expect(typeof August.unlock).toBe('function')
  })
})
