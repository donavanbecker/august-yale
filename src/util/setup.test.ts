import { describe, expect, it } from 'vitest'

import setup from './setup'

const AUGUST_US_KEY = '79fd0eb6-381d-4adf-95a0-47721289d1d9'
const AUGUST_NON_US_KEY = 'd9984f29-07a6-816e-e1c9-44ec9d1be431'

function baseConfig(overrides: Record<string, unknown> = {}) {
  return {
    installId: 'test-install-id',
    augustId: '+15551234567',
    password: 'test-password',
    ...overrides,
  }
}

describe('setup util', () => {
  it('should export expected members', () => {
    expect(setup).toBeDefined()
  })

  // The August brand uses region-specific keys, so it must fall through to the
  // country-code defaults rather than a single pinned brand key (#238).
  it('uses the US default api key for a US August account', () => {
    const result = setup(baseConfig({ brand: 'august', countryCode: 'US' })) as { apiKey: string }
    expect(result.apiKey).toBe(AUGUST_US_KEY)
  })

  it('uses the non-US default api key for a non-US August account', () => {
    const result = setup(baseConfig({ brand: 'august', countryCode: 'GB' })) as { apiKey: string }
    expect(result.apiKey).toBe(AUGUST_NON_US_KEY)
  })

  it('uses the brand-specific api key for yale_access', () => {
    const result = setup(baseConfig({ brand: 'yale_access', countryCode: 'US' })) as { apiKey: string }
    expect(result.apiKey).toBe(AUGUST_NON_US_KEY)
  })

  it('lets an explicit config.apiKey override the defaults', () => {
    const result = setup(baseConfig({ brand: 'august', countryCode: 'US', apiKey: 'custom-key' })) as { apiKey: string }
    expect(result.apiKey).toBe('custom-key')
  })
})
