import { afterEach, describe, expect, it, vi } from 'vitest'

import session from './session'

/**
 * Build a fake August instance compatible with the `this:` parameter
 * of session(). Each call to fakeAugust() returns a fresh instance.
 */
function fakeAugust(opts: { token?: string | null, fetch: (args: any) => Promise<any> }) {
  return {
    token: opts.token ?? null,
    config: {
      apiKey: 'k',
      installId: 'i',
      password: 'p',
      idType: 'email',
      augustId: 'a@b.c',
    },
    fetch: opts.fetch,
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('session util', () => {
  describe('happy paths', () => {
    it('returns headers with cached token if already authenticated', async () => {
      const a = fakeAugust({ token: 'cached', fetch: vi.fn() })
      const headers = await session.call(a) as any
      expect(headers['x-august-access-token']).toBe('cached')
      // No fetch should happen when a token is already present.
      expect(a.fetch).not.toHaveBeenCalled()
    })

    it('fetches a session and caches the resulting token on the instance', async () => {
      const fetchFn = vi.fn().mockResolvedValue({
        headers: { 'x-august-access-token': 'NEW_TOKEN' },
      })
      const a = fakeAugust({ token: null, fetch: fetchFn })
      const headers = await session.call(a) as any
      expect(fetchFn).toHaveBeenCalledOnce()
      expect(a.token).toBe('NEW_TOKEN')
      expect(headers['x-august-access-token']).toBe('NEW_TOKEN')
    })

    it('coalesces concurrent calls within a single instance', async () => {
      // Two parallel calls on the SAME instance should share one fetch.
      let resolveFetch: (v: any) => void = () => {}
      const fetchFn = vi.fn().mockImplementation(() => new Promise((r) => {
        resolveFetch = r
      }))
      const a = fakeAugust({ token: null, fetch: fetchFn })

      const p1 = session.call(a)
      const p2 = session.call(a)

      expect(fetchFn).toHaveBeenCalledOnce()
      resolveFetch({ headers: { 'x-august-access-token': 'TOK' } })
      await Promise.all([p1, p2])
      expect(fetchFn).toHaveBeenCalledOnce()
    })
  })

  describe('cross-instance isolation (architecture)', () => {
    it('does NOT coalesce calls across distinct August instances', async () => {
      // Two unrelated August instances each fetching their own session
      // should make two independent calls. Coalescing across instances
      // was the previous design and it cross-contaminated rejections.
      const fetch1 = vi.fn().mockResolvedValue({
        headers: { 'x-august-access-token': 'TOK1' },
      })
      const fetch2 = vi.fn().mockResolvedValue({
        headers: { 'x-august-access-token': 'TOK2' },
      })
      const a = fakeAugust({ token: null, fetch: fetch1 })
      const b = fakeAugust({ token: null, fetch: fetch2 })

      await Promise.all([session.call(a), session.call(b)])
      expect(fetch1).toHaveBeenCalledOnce()
      expect(fetch2).toHaveBeenCalledOnce()
      expect(a.token).toBe('TOK1')
      expect(b.token).toBe('TOK2')
    })
  })

  describe('regression: rejected session must not poison future calls', () => {
    // This is the bug this commit fixes. The previous module-level
    // `request` variable was set to the in-flight promise BEFORE the
    // await, then cleared to null AFTER the await — but only on the
    // success path. If the fetch rejected, the rejected promise stayed
    // cached in the module variable forever, and every subsequent call
    // from any August instance would re-await it and re-throw the
    // cached error. Recovery required a process restart.

    it('a rejected session does not poison the next call on the same instance', async () => {
      const error = new Error('connect timeout')
      const fetchFn = vi.fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce({
          headers: { 'x-august-access-token': 'RECOVERY_TOKEN' },
        })

      const a = fakeAugust({ token: null, fetch: fetchFn })

      // First call fails as expected.
      await expect(session.call(a)).rejects.toBe(error)
      // Token must still be unset since the fetch failed.
      expect(a.token).toBeNull()

      // Second call must trigger a NEW fetch, not re-await the cached
      // rejected promise. This is the regression assertion.
      const headers2 = await session.call(a) as any
      expect(fetchFn).toHaveBeenCalledTimes(2)
      expect(a.token).toBe('RECOVERY_TOKEN')
      expect(headers2['x-august-access-token']).toBe('RECOVERY_TOKEN')
    })

    it('a rejected session on instance A does not poison instance B', async () => {
      // Even more important: a network blip during one instance's
      // session fetch must not break a different instance's ability to
      // authenticate. The previous module-level coalescer shared the
      // rejected promise across all instances in the process.
      const errorA = new Error('network down')
      const fetchA = vi.fn().mockRejectedValueOnce(errorA)
      const fetchB = vi.fn().mockResolvedValue({
        headers: { 'x-august-access-token': 'B_TOKEN' },
      })
      const a = fakeAugust({ token: null, fetch: fetchA })
      const b = fakeAugust({ token: null, fetch: fetchB })

      await expect(session.call(a)).rejects.toBe(errorA)

      // Instance B's session must succeed normally — the failure on A
      // must not be observable here.
      const headers = await session.call(b) as any
      expect(b.token).toBe('B_TOKEN')
      expect(headers['x-august-access-token']).toBe('B_TOKEN')
      // B made its own fetch call, completely independent of A.
      expect(fetchB).toHaveBeenCalledOnce()
    })

    it('repeated rejections retry each time, not just once', async () => {
      // Each call should attempt a new fetch. If the network stays
      // down for N retries, we want N fetch attempts, not 1 followed
      // by N replays of the cached rejection.
      const fetchFn = vi.fn().mockRejectedValue(new Error('still down'))
      const a = fakeAugust({ token: null, fetch: fetchFn })

      for (let i = 0; i < 4; i++) {
        await expect(session.call(a)).rejects.toThrow('still down')
      }
      expect(fetchFn).toHaveBeenCalledTimes(4)
    })

    it('after rejection followed by recovery, the recovered token is saved', async () => {
      // The full happy-path recovery scenario: bad network, fail,
      // network comes back, succeed, token is now usable.
      const fetchFn = vi.fn()
        .mockRejectedValueOnce(new Error('blip 1'))
        .mockRejectedValueOnce(new Error('blip 2'))
        .mockResolvedValueOnce({
          headers: { 'x-august-access-token': 'RECOVERED' },
        })
      const a = fakeAugust({ token: null, fetch: fetchFn })

      await expect(session.call(a)).rejects.toThrow('blip 1')
      await expect(session.call(a)).rejects.toThrow('blip 2')
      const headers = await session.call(a) as any
      expect(a.token).toBe('RECOVERED')
      expect(headers['x-august-access-token']).toBe('RECOVERED')
      // Subsequent calls reuse the cached token; no further fetches.
      const headers2 = await session.call(a) as any
      expect(fetchFn).toHaveBeenCalledTimes(3)
      expect(headers2['x-august-access-token']).toBe('RECOVERED')
    })
  })
})
