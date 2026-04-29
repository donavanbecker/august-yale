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
 * Network / transport-level failure.
 *
 * Thrown when a request did not get a clean answer from the server: TCP
 * connect timeout, socket reset, DNS failure, headers/body timeout,
 * malformed response, TLS proxy failure, etc. Distinct from
 * {@link InvalidAuth} (server answered with 401) and from generic
 * server errors (server answered with 4xx/5xx HTTP, see
 * {@link YaleApiError}).
 *
 * Consumers can check `err.code` for the underlying transport code
 * (e.g. `ECONNRESET`, `UND_ERR_CONNECT_TIMEOUT`). The original error
 * is preserved on `err.cause` and `err.originalError`.
 */
export class NetworkError extends YaleApiError {
  /** Underlying transport error code, when available. */
  public code?: string

  constructor(message: string, originalError?: Error, code?: string) {
    super(message, originalError)
    this.name = 'NetworkError'
    this.code = code
    if (originalError) {
      // Preserve cause for code that walks the chain.
      ;(this as any).cause = originalError
    }

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NetworkError)
    }
  }
}

/**
 * Timeout error class.
 *
 * Subclass of {@link NetworkError} — a request timing out is one
 * specific kind of transport-level failure. Existing callers checking
 * `err instanceof TimeoutError` continue to work; callers using the
 * broader `err instanceof NetworkError` (or `instanceof YaleApiError`)
 * also catch this case.
 */
export class TimeoutError extends NetworkError {
  constructor(message: string, originalError?: Error, code?: string) {
    super(message, originalError, code)
    this.name = 'TimeoutError'

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TimeoutError)
    }
  }
}

/**
 * Aborted error.
 *
 * Thrown when an in-flight request races with an intentional client
 * teardown (e.g. the consumer calling `august.destroy()` while requests
 * are pending). Callers should typically swallow these — they reflect
 * the consumer's own intent, not a real failure.
 */
export class AbortedError extends YaleApiError {
  /** Underlying transport error code, when available. */
  public code?: string

  constructor(message: string, originalError?: Error, code?: string) {
    super(message, originalError)
    this.name = 'AbortedError'
    this.code = code
    if (originalError) {
      ;(this as any).cause = originalError
    }

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AbortedError)
    }
  }
}
