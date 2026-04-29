import { describe, expect, it } from 'vitest'

import { AbortedError, BridgeError, InvalidAuth, NetworkError, RateLimitError, TimeoutError, YaleApiError } from './exceptions.js'

describe('exceptions', () => {
  it('should create YaleApiError correctly', () => {
    const error = new YaleApiError('Test error')
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(YaleApiError)
    expect(error.message).toBe('Test error')
    expect(error.name).toBe('YaleApiError')
  })

  it('should create InvalidAuth correctly', () => {
    const error = new InvalidAuth('Auth failed')
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(YaleApiError)
    expect(error).toBeInstanceOf(InvalidAuth)
    expect(error.message).toBe('Auth failed')
    expect(error.name).toBe('InvalidAuth')
  })

  it('should create RateLimitError correctly', () => {
    const error = new RateLimitError('Rate limited')
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(YaleApiError)
    expect(error).toBeInstanceOf(RateLimitError)
    expect(error.message).toBe('Rate limited')
    expect(error.name).toBe('RateLimitError')
  })

  it('should create BridgeError correctly', () => {
    const error = new BridgeError('Bridge offline')
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(YaleApiError)
    expect(error).toBeInstanceOf(BridgeError)
    expect(error.message).toBe('Bridge offline')
    expect(error.name).toBe('BridgeError')
  })

  it('should create TimeoutError correctly', () => {
    const error = new TimeoutError('Request timeout')
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(YaleApiError)
    expect(error).toBeInstanceOf(TimeoutError)
    expect(error.message).toBe('Request timeout')
    expect(error.name).toBe('TimeoutError')
  })

  it('should create NetworkError correctly', () => {
    const error = new NetworkError('Network down')
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(YaleApiError)
    expect(error).toBeInstanceOf(NetworkError)
    expect(error.message).toBe('Network down')
    expect(error.name).toBe('NetworkError')
  })

  it('networkError carries a code when supplied', () => {
    const error = new NetworkError('Connect timeout', undefined, 'UND_ERR_CONNECT_TIMEOUT')
    expect(error.code).toBe('UND_ERR_CONNECT_TIMEOUT')
  })

  it('timeoutError is also a NetworkError (back-compat with broader catches)', () => {
    // After making TimeoutError extend NetworkError, every TimeoutError
    // should match `instanceof NetworkError` so consumers using the
    // broader catch see it.
    const error = new TimeoutError('Connect timed out')
    expect(error).toBeInstanceOf(NetworkError)
    expect(error).toBeInstanceOf(YaleApiError)
  })

  it('should create AbortedError correctly', () => {
    const error = new AbortedError('aborted')
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(YaleApiError)
    expect(error).toBeInstanceOf(AbortedError)
    expect(error.message).toBe('aborted')
    expect(error.name).toBe('AbortedError')
    // AbortedError is intentionally NOT a NetworkError — consumers
    // catching NetworkError to handle "transport failure, retry" should
    // not also catch intentional teardowns.
    expect(error).not.toBeInstanceOf(NetworkError)
  })

  it('preserves originalError and exposes it via cause', () => {
    const inner = new Error('inner')
    const wrapped = new NetworkError('outer', inner, 'ECONNRESET')
    expect(wrapped.originalError).toBe(inner)
    expect((wrapped as any).cause).toBe(inner)
  })

  it('should preserve original error', () => {
    const originalError = new Error('Original error')
    const error = new YaleApiError('Wrapped error', originalError)
    expect(error.originalError).toBe(originalError)
  })
})
