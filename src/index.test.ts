import type { config } from './types'

import { describe, expect, it, vi } from 'vitest'

import August from './index'
import { TimeoutError } from './exceptions'
import tiny from 'tiny-json-http'

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

  it('should use default timeout of 30000ms', () => {
    const august = new August(mockConfig)
    expect((august.config as any).timeout).toBe(30000)
  })

  it('should accept a custom timeout', () => {
    const august = new August({ ...mockConfig, timeout: 5000 })
    expect((august.config as any).timeout).toBe(5000)
  })

  it('should reject with TimeoutError when request exceeds timeout', async () => {
    vi.useFakeTimers()

    const august = new August({ ...mockConfig, timeout: 100 })

    // Mock tiny.get to return a promise that never resolves
    const getSpy = vi.spyOn(tiny, 'get').mockImplementation(() => new Promise<never>(() => {}))

    const fetchPromise = august.fetch({ method: 'get', url: 'https://api-production.august.com/locks' })
    // Attach the error handler BEFORE advancing timers so the rejection is always handled
    const errorPromise = fetchPromise.catch(e => e)

    // Advance time past the timeout
    await vi.advanceTimersByTimeAsync(200)

    const error = await errorPromise
    expect(error).toBeInstanceOf(TimeoutError)
    expect(error.message).toBe('Request timed out after 100ms')

    getSpy.mockRestore()
    vi.useRealTimers()
  })
})
