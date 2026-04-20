import type { config } from './types'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { TimeoutError } from './exceptions'

// Mock undici before importing August
const mockFetch = vi.fn()
vi.mock('undici', async (importOriginal) => {
  const actual = await importOriginal<typeof import('undici')>()
  return {
    ...actual,
    fetch: mockFetch,
  }
})

const { default: August } = await import('./index')

describe('august', () => {
  const mockConfig: config = {
    countryCode: 'US',
    installId: 'test-install-id',
    augustId: 'test@example.com',
    password: 'test-password',
  }

  beforeEach(() => {
    mockFetch.mockReset()
  })

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

    mockFetch.mockImplementation(
      (_url: string, init: any) => new Promise<Response>((_resolve, reject) => {
        if (init?.signal) {
          init.signal.addEventListener('abort', () => {
            reject(new DOMException('The operation was aborted.', 'TimeoutError'))
          })
        }
      }),
    )

    await expect(
      august.fetch({ method: 'get', url: 'https://api-production.august.com/locks' }),
    ).rejects.toThrow(TimeoutError)
  })

  it('should parse JSON response body', async () => {
    const august = new August(mockConfig)
    const mockBody = { lockId: 'abc123', status: 'locked' }

    mockFetch.mockResolvedValue(
      new Response(JSON.stringify(mockBody), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )

    const result = await august.fetch({
      method: 'get',
      url: 'https://api-production.august.com/locks',
    })
    expect(result.body).toEqual(mockBody)
  })

  it('should return headers as a plain object', async () => {
    const august = new August(mockConfig)

    mockFetch.mockResolvedValue(
      new Response('{}', {
        status: 200,
        headers: { 'x-august-access-token': 'test-token-123' },
      }),
    )

    const result = await august.fetch({
      method: 'post',
      url: 'https://api-production.august.com/session',
    })
    expect(result.headers['x-august-access-token']).toBe('test-token-123')
  })

  it('should throw with statusCode on HTTP errors', async () => {
    const august = new August(mockConfig)

    mockFetch.mockResolvedValue(
      new Response('Bad Gateway', { status: 502, statusText: 'Bad Gateway' }),
    )

    await expect(
      august.fetch({ method: 'get', url: 'https://api-production.august.com/locks' }),
    ).rejects.toMatchObject({ statusCode: 502 })
  })

  it('should prepend base URL when path is relative', async () => {
    const august = new August(mockConfig)

    mockFetch.mockResolvedValue(
      new Response('{}', { status: 200 }),
    )

    await august.fetch({ method: 'get', url: '/locks' })
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api-production.august.com/locks',
      expect.any(Object),
    )
  })

  it('should use non-US base URL for non-US country codes', async () => {
    const august = new August({ ...mockConfig, countryCode: 'GB' })

    mockFetch.mockResolvedValue(
      new Response('{}', { status: 200 }),
    )

    await august.fetch({ method: 'get', url: '/locks' })
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.aaecosystem.com/locks',
      expect.any(Object),
    )
  })

  it('should handle empty response body', async () => {
    const august = new August(mockConfig)

    mockFetch.mockResolvedValue(
      new Response('', { status: 200 }),
    )

    const result = await august.fetch({
      method: 'put',
      url: 'https://api-production.august.com/remoteoperate/lock123/lock',
    })
    expect(result.body).toBeNull()
  })

  it('should pass scoped dispatcher to fetch', async () => {
    const august = new August(mockConfig)

    mockFetch.mockResolvedValue(
      new Response('{}', { status: 200 }),
    )

    await august.fetch({ method: 'get', url: '/locks' })
    const callArgs = mockFetch.mock.calls[0][1]
    expect(callArgs.dispatcher).toBeDefined()
    expect(callArgs.dispatcher).not.toBe(undefined)
  })
})
