/* Copyright(C) 2026, homebridge-plugins (https://github.com/homebridge-plugins). All rights reserved.
 *
 * classify-error.test.ts: tests for transport-error classification.
 *
 * The shapes covered here mirror the actual undici 7.x error taxonomy
 * (see node_modules/undici/lib/core/errors.js). Each named undici error
 * class is tested by constructing the equivalent shape — that's what
 * the consumer actually sees, regardless of whether the constructor
 * details change in a future undici release.
 */
import { describe, expect, it } from 'vitest'

import { AbortedError, NetworkError, TimeoutError } from '../exceptions.js'
import { classifyTransportError } from './classify-error.js'

// Helper: simulate undici's pattern of wrapping every fetch failure in
// `TypeError("fetch failed")` with the real cause attached.
function fetchFailedWith(cause: any): TypeError {
  const err = new TypeError('fetch failed') as any
  err.cause = cause
  return err
}

// Helper: build an error with a name and code, mirroring undici classes.
function namedErrorWithCode(name: string, code: string, message = name): Error {
  const err = new Error(message) as any
  err.name = name
  err.code = code
  return err
}

describe('classifyTransportError', () => {
  describe('undici timeout family', () => {
    it('classifies wrapped ConnectTimeoutError (UND_ERR_CONNECT_TIMEOUT) as TimeoutError', () => {
      // This is the exact shape from a real production failure log:
      // TypeError "fetch failed" wrapping ConnectTimeoutError.
      const wrapped = fetchFailedWith(
        namedErrorWithCode('ConnectTimeoutError', 'UND_ERR_CONNECT_TIMEOUT', 'Connect Timeout Error'),
      )
      const result = classifyTransportError(wrapped)
      expect(result).toBeInstanceOf(TimeoutError)
      expect(result).toBeInstanceOf(NetworkError) // back-compat
      expect(result?.code).toBe('UND_ERR_CONNECT_TIMEOUT')
      expect(result?.originalError).toBe(wrapped)
    })

    it('classifies HeadersTimeoutError (UND_ERR_HEADERS_TIMEOUT) as TimeoutError', () => {
      const wrapped = fetchFailedWith(
        namedErrorWithCode('HeadersTimeoutError', 'UND_ERR_HEADERS_TIMEOUT'),
      )
      expect(classifyTransportError(wrapped)).toBeInstanceOf(TimeoutError)
    })

    it('classifies BodyTimeoutError (UND_ERR_BODY_TIMEOUT) as TimeoutError', () => {
      const wrapped = fetchFailedWith(
        namedErrorWithCode('BodyTimeoutError', 'UND_ERR_BODY_TIMEOUT'),
      )
      expect(classifyTransportError(wrapped)).toBeInstanceOf(TimeoutError)
    })
  })

  describe('undici generic transport failures', () => {
    it('classifies SocketError (UND_ERR_SOCKET) as NetworkError', () => {
      const wrapped = fetchFailedWith(
        namedErrorWithCode('SocketError', 'UND_ERR_SOCKET'),
      )
      const result = classifyTransportError(wrapped)
      expect(result).toBeInstanceOf(NetworkError)
      expect(result).not.toBeInstanceOf(TimeoutError) // not a timeout
      expect(result?.code).toBe('UND_ERR_SOCKET')
    })

    it('classifies HeadersOverflowError as NetworkError', () => {
      const wrapped = fetchFailedWith(
        namedErrorWithCode('HeadersOverflowError', 'UND_ERR_HEADERS_OVERFLOW'),
      )
      expect(classifyTransportError(wrapped)).toBeInstanceOf(NetworkError)
    })

    it('classifies SecureProxyConnectionError as NetworkError', () => {
      const wrapped = fetchFailedWith(
        namedErrorWithCode('SecureProxyConnectionError', 'UND_ERR_PRX_TLS'),
      )
      expect(classifyTransportError(wrapped)).toBeInstanceOf(NetworkError)
    })
  })

  describe('undici lifecycle errors (intentional teardown)', () => {
    it('classifies ClientDestroyedError as AbortedError, NOT NetworkError', () => {
      // This is critical: when the consumer destroys the Agent (e.g.
      // during a connectivity-rebuild cycle), in-flight requests reject
      // with ClientDestroyedError. The consumer's intent was to tear
      // down — it should NOT be reported as a network failure.
      const wrapped = fetchFailedWith(
        namedErrorWithCode('ClientDestroyedError', 'UND_ERR_DESTROYED'),
      )
      const result = classifyTransportError(wrapped)
      expect(result).toBeInstanceOf(AbortedError)
      expect(result).not.toBeInstanceOf(NetworkError)
    })

    it('classifies ClientClosedError as AbortedError', () => {
      const wrapped = fetchFailedWith(
        namedErrorWithCode('ClientClosedError', 'UND_ERR_CLOSED'),
      )
      expect(classifyTransportError(wrapped)).toBeInstanceOf(AbortedError)
    })

    it('classifies RequestAbortedError as AbortedError', () => {
      const wrapped = fetchFailedWith(
        namedErrorWithCode('AbortError', 'UND_ERR_ABORTED'),
      )
      expect(classifyTransportError(wrapped)).toBeInstanceOf(AbortedError)
    })
  })

  describe('pOSIX socket errors (bare or wrapped)', () => {
    it('classifies bare ECONNRESET as NetworkError', () => {
      const err = namedErrorWithCode('Error', 'ECONNRESET', 'socket hang up')
      expect(classifyTransportError(err)).toBeInstanceOf(NetworkError)
    })

    it('classifies wrapped ECONNRESET as NetworkError', () => {
      const wrapped = fetchFailedWith(namedErrorWithCode('Error', 'ECONNRESET'))
      expect(classifyTransportError(wrapped)).toBeInstanceOf(NetworkError)
    })

    it('classifies bare ETIMEDOUT as TimeoutError', () => {
      const err = namedErrorWithCode('Error', 'ETIMEDOUT', 'connect ETIMEDOUT')
      expect(classifyTransportError(err)).toBeInstanceOf(TimeoutError)
    })

    it('classifies bare ENOTFOUND as NetworkError', () => {
      const err = namedErrorWithCode('Error', 'ENOTFOUND', 'getaddrinfo failed')
      expect(classifyTransportError(err)).toBeInstanceOf(NetworkError)
    })
  })

  describe('hTTP parser failures', () => {
    it('classifies HPE_* coded errors as NetworkError', () => {
      // libhttp-parser reports wire-level parse failures with codes
      // prefixed HPE_ rather than the UND_ERR_ convention.
      const err = namedErrorWithCode('HTTPParserError', 'HPE_INVALID_VERSION')
      expect(classifyTransportError(err)).toBeInstanceOf(NetworkError)
    })
  })

  describe('non-transport errors must NOT be wrapped', () => {
    it('returns null for InvalidArgumentError (programmer bug)', () => {
      // These are bugs — wrapping them as NetworkError would fool the
      // state machine into retrying a deterministic failure forever.
      const err = namedErrorWithCode('InvalidArgumentError', 'UND_ERR_INVALID_ARG')
      expect(classifyTransportError(err)).toBeNull()
    })

    it('returns null for NotSupportedError (configuration bug)', () => {
      const err = namedErrorWithCode('NotSupportedError', 'UND_ERR_NOT_SUPPORTED')
      expect(classifyTransportError(err)).toBeNull()
    })

    it('returns null for plain server-answered errors with statusCode', () => {
      // A 422 response is not a transport error — the server answered.
      // Caller-level code should handle it; the classifier leaves it alone.
      const err = Object.assign(new Error('Unprocessable Entity'), { statusCode: 422 })
      expect(classifyTransportError(err)).toBeNull()
    })

    it('returns null for arbitrary unrelated errors', () => {
      // A pure Error with no recognized code/name and no cause chain
      // signals nothing transport-level — leave it alone.
      expect(classifyTransportError(new Error('something'))).toBeNull()
    })

    it('returns null for non-Error throws', () => {
      // Defensive: if someone throws a string or number, we should not
      // wrap it as a NetworkError.
      expect(classifyTransportError('a string')).toBeNull()
      expect(classifyTransportError(42)).toBeNull()
      expect(classifyTransportError(null)).toBeNull()
      expect(classifyTransportError(undefined)).toBeNull()
    })
  })

  describe('cause chain walking', () => {
    it('walks cause chains up to depth 5', () => {
      // Build a 5-deep chain ending in a recognized network code.
      let cur: any = namedErrorWithCode('Error', 'ECONNRESET')
      for (let i = 0; i < 4; i++) {
        cur = Object.assign(new Error(`level ${i}`), { cause: cur })
      }
      expect(classifyTransportError(cur)).toBeInstanceOf(NetworkError)
    })

    it('does not infinite-loop on cyclic cause chains', () => {
      const a: any = new Error('a')
      const b: any = new Error('b')
      a.cause = b
      b.cause = a
      // Should not crash; should return null since there's no recognized
      // code anywhere in the (capped) chain.
      expect(() => classifyTransportError(a)).not.toThrow()
      expect(classifyTransportError(a)).toBeNull()
    })
  })

  describe('preserves the original error', () => {
    it('exposes the original via originalError and cause', () => {
      const inner = namedErrorWithCode('ConnectTimeoutError', 'UND_ERR_CONNECT_TIMEOUT')
      const wrapped = fetchFailedWith(inner)
      const result = classifyTransportError(wrapped)
      expect(result).not.toBeNull()
      expect(result!.originalError).toBe(wrapped)
      expect((result! as any).cause).toBe(wrapped)
    })
  })
})
