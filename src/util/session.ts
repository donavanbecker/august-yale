import type { Brand } from '../settings.js'

import { BRANDING, DEFAULT_BRAND } from '../settings.js'

/**
 * In-flight session requests, keyed on the August instance.
 */
const inflightSessionRequests = new WeakMap<object, Promise<any>>()

/**
 * Start or continue a session
 * If token not saved, fetch a new token
 * ! Tokens should only be saved when making consecutive requests (i.e. internally)
 *
 * @returns {object} headers
 */
export default async function session(this: any): Promise<object> {
  const { apiKey, installId, password, idType, augustId, brand } = this.config

  const headers = {
    'x-august-api-key': apiKey,
    'x-kease-api-key': apiKey,
    'Content-Type': 'application/json',
    'Accept-Version': '0.0.1',
    // The api rejects some calls (e.g. validate) with a 403 when the branding
    // header doesn't match the account's ecosystem — yale-hosted accounts must
    // announce themselves as 'yale' (mirrors yalexs' _api_headers)
    'x-august-branding': BRANDING[brand as Brand] ?? BRANDING[DEFAULT_BRAND],
    'User-Agent': 'August/Luna-22.17.0 (Android; SDK 31; gphone64_arm64)',
    'x-august-country': 'US',
    'x-august-access-token': this.token || '',
  }

  if (!this.token) {
    const identifier = `${idType}:${augustId}`
    const data = { installId, identifier, password }

    let inflight = inflightSessionRequests.get(this)
    if (!inflight) {
      inflight = this.fetch({ method: 'post', url: 'session', headers, data })
      inflightSessionRequests.set(this, inflight!)
    }

    let response: any
    try {
      response = await inflight
    } finally {
      // Clear the inflight entry whether the fetch resolved or rejected.
      // A rejected promise must NOT stay cached — that was the bug being
      // fixed here. Clearing in finally also handles cancellation, etc.
      // Guard against the case where a parallel caller has already
      // replaced the inflight entry: only delete if it's still ours.
      if (inflightSessionRequests.get(this) === inflight) {
        inflightSessionRequests.delete(this)
      }
    }

    this.token = response.headers['x-august-access-token']
    headers['x-august-access-token'] = this.token
  }

  return headers
}
