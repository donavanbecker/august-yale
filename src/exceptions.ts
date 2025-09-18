/* Copyright(C) 2024, homebridge-plugins (https://github.com/homebridge-plugins). All rights reserved.
 *
 * exceptions.ts: Custom exception classes for August-Yale API.
 */

/**
 * Base Yale API error class
 */
export class YaleApiError extends Error {
  public originalError?: Error

  constructor(message: string, originalError?: Error) {
    super(message)
    this.name = 'YaleApiError'
    this.originalError = originalError

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, YaleApiError)
    }
  }
}

/**
 * Authentication/authorization error class
 */
export class InvalidAuth extends YaleApiError {
  constructor(message: string, originalError?: Error) {
    super(message, originalError)
    this.name = 'InvalidAuth'

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidAuth)
    }
  }
}

/**
 * Rate limiting error class
 */
export class RateLimitError extends YaleApiError {
  constructor(message: string, originalError?: Error) {
    super(message, originalError)
    this.name = 'RateLimitError'

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RateLimitError)
    }
  }
}

/**
 * Bridge/device connectivity error class
 */
export class BridgeError extends YaleApiError {
  constructor(message: string, originalError?: Error) {
    super(message, originalError)
    this.name = 'BridgeError'

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BridgeError)
    }
  }
}

/**
 * Timeout error class
 */
export class TimeoutError extends YaleApiError {
  constructor(message: string, originalError?: Error) {
    super(message, originalError)
    this.name = 'TimeoutError'

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TimeoutError)
    }
  }
}