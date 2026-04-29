/* Copyright(C) 2026, homebridge-plugins (https://github.com/homebridge-plugins). All rights reserved.
 *
 * classify-error.ts: Map a transport-level exception (typically thrown
 * by undici's fetch) into one of august-yale's typed exception classes.
 *
 * The 24-class undici taxonomy (see node_modules/undici/lib/core/errors.js)
 * splits roughly into four categories:
 *
 *   1. Transport failures — connect timeout, socket reset, headers/body
 *      timeout, DNS failure, malformed response, etc. These are
 *      recoverable by retrying after a wait. They become NetworkError
 *      (or TimeoutError, a subclass, for the timeout-specific cases).
 *
 *   2. Lifecycle errors — ClientDestroyedError, ClientClosedError,
 *      RequestAbortedError. These reflect the consumer's own intent
 *      (calling destroy() on the Agent, aborting via AbortController).
 *      They become AbortedError. Consumers typically swallow them.
 *
 *   3. Programmer errors — InvalidArgumentError, NotSupportedError,
 *      RequestContentLengthMismatchError. These are bugs that retrying
 *      will not fix. They are NOT wrapped: the original error bubbles
 *      up unchanged so the bug is visible.
 *
 *   4. Server-answered errors — ResponseError (4xx/5xx with body),
 *      RequestRetryError. These have a statusCode and represent the
 *      server's reply, not a transport issue. They are NOT wrapped
 *      here — auth-specific handling lives in session.ts and the rest
 *      bubble up as the original error.
 *
 * Callers who walk err.cause continue to find the original error
 * unchanged. The wrapping is purely additive.
 */

import { AbortedError, NetworkError, TimeoutError } from '../exceptions.js'

/**
 * undici error codes that indicate a transport-level failure.
 * Source: node_modules/undici/lib/core/errors.js classes whose `.code`
 * starts with `UND_ERR_` and whose semantic is "request did not get a
 * clean answer from the server".
 */
const UNDICI_NETWORK_CODES: ReadonlySet<string> = new Set([
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_HEADERS_TIMEOUT',
  'UND_ERR_BODY_TIMEOUT',
  'UND_ERR_SOCKET',
  'UND_ERR_HEADERS_OVERFLOW',
  'UND_ERR_RES_EXCEEDED_MAX_SIZE',
  'UND_ERR_PRX_TLS',
  'UND_ERR_SOCKS5',
  'UND_ERR_RES_CONTENT_LENGTH_MISMATCH',
])

/**
 * undici error codes that specifically indicate a timeout.
 * Subset of UNDICI_NETWORK_CODES; these become TimeoutError instead of
 * the more general NetworkError.
 */
const UNDICI_TIMEOUT_CODES: ReadonlySet<string> = new Set([
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_HEADERS_TIMEOUT',
  'UND_ERR_BODY_TIMEOUT',
])

/**
 * undici error codes raised when an in-flight request races with an
 * intentional client teardown.
 */
const UNDICI_LIFECYCLE_CODES: ReadonlySet<string> = new Set([
  'UND_ERR_DESTROYED',
  'UND_ERR_CLOSED',
  'UND_ERR_ABORTED',
  'UND_ERR_ABORT',
])

/**
 * POSIX socket error codes that indicate a transport-level failure.
 * These appear on the underlying error when undici surfaces them via
 * err.cause.code, or directly on bare Node http errors.
 */
const POSIX_NETWORK_CODES: ReadonlySet<string> = new Set([
  'ECONNRESET',
  'ECONNREFUSED',
  'ECONNABORTED',
  'ENETUNREACH',
  'ENETDOWN',
  'ENETRESET',
  'EHOSTUNREACH',
  'EHOSTDOWN',
  'ENOTFOUND',
  'EAI_AGAIN',
  'ETIMEDOUT',
  'EPIPE',
  'ENOTCONN',
  'ESHUTDOWN',
])

/**
 * POSIX codes whose semantic is specifically "timeout".
 */
const POSIX_TIMEOUT_CODES: ReadonlySet<string> = new Set([
  'ETIMEDOUT',
])

/**
 * Walk the err.cause chain up to a small depth, returning every error
 * encountered. Capped to defend against pathological cycles.
 */
function flattenCauseChain(e: unknown): any[] {
  const chain: any[] = []
  let cur: any = e
  let depth = 0
  while (cur && depth < 5) {
    chain.push(cur)
    cur = cur.cause
    depth++
  }
  return chain
}

interface ErrorMatch {
  /** The error in the cause chain that matched a known shape. */
  match: any
  /** What kind of error it is. */
  kind: 'timeout' | 'network' | 'aborted'
}

/**
 * Inspect the cause chain and return the first error whose shape
 * indicates a transport-level outcome (timeout, generic network,
 * or aborted). Returns null if no match — caller should leave the
 * original error untouched.
 */
function findTransportError(e: unknown): ErrorMatch | null {
  for (const err of flattenCauseChain(e)) {
    const code: string | undefined = typeof err?.code === 'string' ? err.code : undefined
    const name: string | undefined = typeof err?.name === 'string' ? err.name : undefined

    // Lifecycle: aborted / destroyed / closed.
    if (code && UNDICI_LIFECYCLE_CODES.has(code)) {
      return { match: err, kind: 'aborted' }
    }
    if (name === 'AbortError') {
      return { match: err, kind: 'aborted' }
    }

    // Timeout-specific transport errors.
    if (code && UNDICI_TIMEOUT_CODES.has(code)) {
      return { match: err, kind: 'timeout' }
    }
    if (code && POSIX_TIMEOUT_CODES.has(code)) {
      return { match: err, kind: 'timeout' }
    }
    if (name === 'ConnectTimeoutError' || name === 'HeadersTimeoutError' || name === 'BodyTimeoutError') {
      return { match: err, kind: 'timeout' }
    }

    // Generic network transport errors.
    if (code && UNDICI_NETWORK_CODES.has(code)) {
      return { match: err, kind: 'network' }
    }
    if (code && POSIX_NETWORK_CODES.has(code)) {
      return { match: err, kind: 'network' }
    }
    // HTTPParserError uses HPE_* codes (libhttp-parser convention).
    if (code && code.startsWith('HPE_')) {
      return { match: err, kind: 'network' }
    }
    if (name === 'HTTPParserError' || name === 'SocketError') {
      return { match: err, kind: 'network' }
    }
  }
  return null
}

/**
 * Inspect a thrown value and, if it looks like a transport-level
 * failure, return an appropriate typed exception that consumers can
 * catch via instanceof. Returns null if the error is not transport-level
 * (programmer errors, server-answered errors with statusCode, etc.) —
 * callers should rethrow the original error in that case.
 *
 * The original error is preserved as `originalError` and `cause` on
 * any returned wrapper, so consumers walking err.cause keep working.
 */
export function classifyTransportError(e: unknown): NetworkError | AbortedError | null {
  const found = findTransportError(e)
  if (!found) {
    return null
  }
  const original = e instanceof Error ? e : new Error(String(e))
  const code: string | undefined = typeof found.match?.code === 'string' ? found.match.code : undefined
  const detail = found.match?.message ?? original.message ?? 'transport error'

  switch (found.kind) {
    case 'timeout':
      return new TimeoutError(detail, original, code)
    case 'network':
      return new NetworkError(detail, original, code)
    case 'aborted':
      return new AbortedError(detail, original, code)
  }
}
