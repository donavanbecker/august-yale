import type { config } from './types'

import { describe, expect, it, vi } from 'vitest'

import { TimeoutError } from './exceptions'
import August from './index'

describe('august', () => {
  const mockConfig: config = {
    countryCode: 'US',
    installId: 'test-install-id',
    augustId: 'test@example.com',
    password: 'test-password',
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
    const august = new August({ ...mockConfig, timeout: 50 })

    // Mock global fetch to simulate a slow response that respects AbortSignal
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(
      (_url, init) => new Promise<Response>((_resolve, reject) => {
        if (init?.signal) {
          init.signal.addEventListener('abort', () => {
            reject(new DOMException('The operation was aborted.', 'TimeoutError'))
          })
        }
      }),
    )

    try {
      await expect(
        august.fetch({ method: 'get', url: 'https://api-production.august.com/locks' }),
      ).rejects.toThrow(TimeoutError)
    } finally {
      fetchSpy.mockRestore()
    }
  })

  it('should parse JSON response body', async () => {
    const august = new August(mockConfig)
    const mockBody = { lockId: 'abc123', status: 'locked' }

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockBody), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )

    try {
      const result = await august.fetch({
        method: 'get',
        url: 'https://api-production.august.com/locks',
      })
      expect(result.body).toEqual(mockBody)
    } finally {
      fetchSpy.mockRestore()
    }
  })

  it('should return headers as a plain object', async () => {
    const august = new August(mockConfig)

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{}', {
        status: 200,
        headers: { 'x-august-access-token': 'test-token-123' },
      }),
    )

    try {
      const result = await august.fetch({
        method: 'post',
        url: 'https://api-production.august.com/session',
      })
      expect(result.headers['x-august-access-token']).toBe('test-token-123')
    } finally {
      fetchSpy.mockRestore()
    }
  })

  it('should throw with statusCode on HTTP errors', async () => {
    const august = new August(mockConfig)

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Bad Gateway', { status: 502, statusText: 'Bad Gateway' }),
    )

    try {
      await expect(
        august.fetch({ method: 'get', url: 'https://api-production.august.com/locks' }),
      ).rejects.toMatchObject({ statusCode: 502 })
    } finally {
      fetchSpy.mockRestore()
    }
  })

  it('should prepend base URL when path is relative', async () => {
    const august = new August(mockConfig)

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{}', { status: 200 }),
    )

    try {
      await august.fetch({ method: 'get', url: '/locks' })
      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api-production.august.com/locks',
        expect.any(Object),
      )
    } finally {
      fetchSpy.mockRestore()
    }
  })

  it('should use non-US base URL for non-US country codes', async () => {
    const august = new August({ ...mockConfig, countryCode: 'GB' })

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{}', { status: 200 }),
    )

    try {
      await august.fetch({ method: 'get', url: '/locks' })
      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.aaecosystem.com/locks',
        expect.any(Object),
      )
    } finally {
      fetchSpy.mockRestore()
    }
  })

  it('should handle empty response body', async () => {
    const august = new August(mockConfig)

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('', { status: 200 }),
    )

    try {
      const result = await august.fetch({
        method: 'put',
        url: 'https://api-production.august.com/remoteoperate/lock123/lock',
      })
      expect(result.body).toBeNull()
    } finally {
      fetchSpy.mockRestore()
    }
  })
})
