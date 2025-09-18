import { describe, expect, it } from 'vitest'

import { BridgeError, InvalidAuth, RateLimitError, TimeoutError, YaleApiError } from './exceptions.js'

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

  it('should preserve original error', () => {
    const originalError = new Error('Original error')
    const error = new YaleApiError('Wrapped error', originalError)
    expect(error.originalError).toBe(originalError)
  })
})