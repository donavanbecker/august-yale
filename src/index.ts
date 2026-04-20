import type { Brand } from './settings.js'
import type { config } from './types.js'

/* Copyright(C) 2024, homebridge-plugins (https://github.com/homebridge-plugins). All rights reserved.
 *
 * index.ts: august-yale API registration.
 */
import { Agent, fetch as undiciFetch } from 'undici'

import { TimeoutError } from './exceptions.js'
import alarms, { alarmDevices, setAlarmState } from './methods/alarms.js'
import lockAsync, { statusAsync, unlatchAsync, unlockAsync } from './methods/async-operations.js'
import authorize from './methods/authorize.js'
import capabilities from './methods/capabilities.js'
import details from './methods/details.js'
import doorbells, { doorbellDetails, wakeupDoorbell } from './methods/doorbells.js'
import houses, { houseActivities, houseDetails, houseTemperature } from './methods/houses.js'
import lockUnlock from './methods/lock-unlock.js'
import locks from './methods/locks.js'
import pins from './methods/pins.js'
import status from './methods/status.js'
import subscribe, { tearDownPubNub } from './methods/subscribe.js'
import unlatch from './methods/unlatch.js'
import user from './methods/users.js'
import validate from './methods/validate.js'
import addWebSocketSubscription, { deleteWebSocketSubscription, getWebSocketSubscriptions } from './methods/websocket.js'
import { BASE_URLS } from './settings.js'
import session from './util/session.js'
import setup from './util/setup.js'

// Export exceptions for external use
export { BridgeError, InvalidAuth, RateLimitError, TimeoutError, YaleApiError } from './exceptions.js'
export { Brand } from './settings.js'

interface FetchOptions {
  method: string
  url: string
  headers?: Record<string, string>
  data?: unknown
}

/** Response shape — backward-compatible with the former tiny-json-http result */
interface ApiResponse {
  body: unknown
  headers: Record<string, string>
}

class August {
  config: config
  token: any
  private dispatcher: Agent
  constructor(config: config) {
    this.config = setup(config)
    // Each August instance owns its own connection pool.
    // This prevents a corrupted global pool from permanently breaking
    // all requests — if this instance's connections go bad, destroy()
    // + new August() gives a completely fresh pool.
    this.dispatcher = new Agent({
      keepAliveTimeout: 30_000,
      keepAliveMaxTimeout: 60_000,
    })
  }

  async fetch({ method, url, headers, data }: FetchOptions): Promise<ApiResponse> {
    // Use brand-specific base URL if brand is specified
    let API_URL: string
    if (this.config.brand && BASE_URLS[this.config.brand as Brand]) {
      API_URL = BASE_URLS[this.config.brand as Brand]
    } else {
      // Fallback to country code based URL selection
      API_URL = this.config.countryCode === 'US'
        ? 'https://api-production.august.com'
        : 'https://api.aaecosystem.com'
    }

    // Ensure proper url
    if (!url.startsWith(API_URL)) {
      if (!url.startsWith('/')) {
        url = `/${url}`
      }
      url = API_URL + url
    }

    const timeoutMs = this.config.timeout ?? 30000

    const requestBody = (data !== null && data !== undefined)
      ? JSON.stringify(data)
      : undefined

    let response: Response
    try {
      response = await undiciFetch(url, {
        method: method.toUpperCase(),
        headers,
        body: requestBody,
        // AbortSignal.timeout() both rejects the promise AND aborts the
        // underlying TCP connection, removing it from the scoped pool.
        signal: AbortSignal.timeout(timeoutMs),
        dispatcher: this.dispatcher,
      }) as Response
    } catch (e: unknown) {
      // AbortSignal.timeout() throws a DOMException with name 'TimeoutError'
      if (e instanceof DOMException && e.name === 'TimeoutError') {
        throw new TimeoutError(`Request timed out after ${timeoutMs}ms`)
      }
      throw e
    }

    // Parse response body — handle empty responses gracefully
    let body: unknown = null
    const text = await response.text()
    if (text.length > 0) {
      try {
        body = JSON.parse(text)
      } catch {
        body = text
      }
    }

    // Convert Headers to a plain object for backward compatibility.
    // session.ts accesses headers['x-august-access-token'] via bracket notation.
    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    // Throw on HTTP errors (replicates tiny-json-http behavior).
    // Include statusCode on the error for downstream detection in
    // homebridge-august's isTimeoutError() and statusCode() methods.
    if (!response.ok) {
      let message = `${method.toUpperCase()} failed with: ${response.status}`
      if (body && typeof body === 'object' && 'message' in body) {
        message = (body as { message: string }).message
      } else if (typeof body === 'string' && body.length < 200) {
        message = body
      }
      const err = new Error(message) as Error & { statusCode: number, body: unknown }
      err.statusCode = response.status
      err.body = body
      throw err
    }

    return { body, headers: responseHeaders }
  }

  /* --------------------------------- Session -------------------------------- */
  async #start(method: any, url: any, data: any) {
    // Start or continue a session
    const headers: { [key: string]: any } = await session.call(this)

    if (!this.token) {
      throw new Error('Session not started')
    }

    if (!data) {
      headers['Content-Length'] = 0
    } // If no data, endpoint requires `Content-length: 0` or it won't hang up ¯\_(ツ)_/¯

    return this.fetch({ method, url, headers, data })
  }

  async get(endpoint: any) {
    return this.#start('get', endpoint, null)
  }

  async post(endpoint: any, data: any) {
    return this.#start('post', endpoint, data)
  }

  async put(endpoint: any, data: any) {
    return this.#start('put', endpoint, data)
  }

  async delete(endpoint: any) {
    return this.#start('delete', endpoint, null)
  }

  end() {
    // End the session (called automatically in every method below except where noted)
    this.token = null
  }

  /**
   * Fully tear down this August instance: clears the session token and
   * destroys any PubNub subscription. Call this when you're done with
   * the instance and want to release all resources (WebSocket connection,
   * listeners, timers).
   *
   * Unlike end(), which is called internally after most API calls and
   * only clears the HTTP auth token, destroy() also tears down the
   * PubNub connection used by subscribe(). After destroy(), any active
   * subscriptions on this instance are stopped.
   */
  destroy() {
    this.token = null
    this.dispatcher.close()
    tearDownPubNub(this)
  }

  /* ---------------------------------- Auth ---------------------------------- */
  async authorize() {
    return authorize.call(this)
  }

  async validate(code: string) {
    return validate.call(this, code)
  }

  /* ---------------------------------- Info ---------------------------------- */
  async locks() {
    return locks.call(this, false)
  }

  async _locks() {
    // Interal use only
    return locks.call(this, true) // true keeps the session alive
  }

  async details(lockId: string) {
    return details.call(this, false, lockId)
  }

  async _details(lockId: string) {
    // Interal use only
    return details.call(this, true, lockId) // true keeps the session alive
  }

  async status(lockId: string) {
    return status.call(this, lockId!, false)
  }

  async _status(lockId: string) {
    // Interal use only
    return status.call(this, lockId!, true) // true keeps the session alive
  }

  /* --------------------------------- Action --------------------------------- */
  async lock(lockId: string) {
    return lockUnlock.call(this, 'lock', lockId)
  }

  async unlock(lockId: string) {
    return lockUnlock.call(this, 'unlock', lockId)
  }

  async unlatch(lockId: string) {
    return unlatch.call(this, lockId)
  }

  /* --------------------------- Async operations ---------------------------- */
  async lockAsync(lockId: string, hyperBridge?: boolean) {
    return lockAsync.call(this, lockId, hyperBridge)
  }

  async unlockAsync(lockId: string, hyperBridge?: boolean) {
    return unlockAsync.call(this, lockId, hyperBridge)
  }

  async unlatchAsync(lockId: string, hyperBridge?: boolean) {
    return unlatchAsync.call(this, lockId, hyperBridge)
  }

  async statusAsync(lockId: string, hyperBridge?: boolean) {
    return statusAsync.call(this, lockId, hyperBridge)
  }

  /* --------------------------- WebSocket methods --------------------------- */
  async addWebSocketSubscription() {
    return addWebSocketSubscription.call(this, false)
  }

  async _addWebSocketSubscription() {
    return addWebSocketSubscription.call(this, true)
  }

  async getWebSocketSubscriptions(subscriberId?: string) {
    return getWebSocketSubscriptions.call(this, false, subscriberId)
  }

  async _getWebSocketSubscriptions(subscriberId?: string) {
    return getWebSocketSubscriptions.call(this, true, subscriberId)
  }

  async deleteWebSocketSubscription(subscriberId: string) {
    return deleteWebSocketSubscription.call(this, false, subscriberId)
  }

  async _deleteWebSocketSubscription(subscriberId: string) {
    return deleteWebSocketSubscription.call(this, true, subscriberId)
  }

  /* ----------------------------- House methods ----------------------------- */
  async houses() {
    return houses.call(this, false)
  }

  async _houses() {
    return houses.call(this, true)
  }

  async houseDetails(houseId: string) {
    return houseDetails.call(this, false, houseId)
  }

  async _houseDetails(houseId: string) {
    return houseDetails.call(this, true, houseId)
  }

  async houseActivities(houseId: string, limit?: number) {
    return houseActivities.call(this, false, houseId, limit)
  }

  async _houseActivities(houseId: string, limit?: number) {
    return houseActivities.call(this, true, houseId, limit)
  }

  async houseTemperature(houseId: string) {
    return houseTemperature.call(this, false, houseId)
  }

  async _houseTemperature(houseId: string) {
    return houseTemperature.call(this, true, houseId)
  }

  /* ----------------------------- User methods ------------------------------ */
  async user() {
    return user.call(this, false)
  }

  async _user() {
    return user.call(this, true)
  }

  /* --------------------------- Doorbell methods ---------------------------- */
  async doorbells() {
    return doorbells.call(this, false)
  }

  async _doorbells() {
    return doorbells.call(this, true)
  }

  async doorbellDetails(doorbellId: string) {
    return doorbellDetails.call(this, false, doorbellId)
  }

  async _doorbellDetails(doorbellId: string) {
    return doorbellDetails.call(this, true, doorbellId)
  }

  async wakeupDoorbell(doorbellId: string) {
    return wakeupDoorbell.call(this, false, doorbellId)
  }

  async _wakeupDoorbell(doorbellId: string) {
    return wakeupDoorbell.call(this, true, doorbellId)
  }

  /* ------------------------------ Alarm methods ---------------------------- */
  async alarms() {
    return alarms.call(this, false)
  }

  async _alarms() {
    return alarms.call(this, true)
  }

  async alarmDevices(alarmId: string) {
    return alarmDevices.call(this, false, alarmId)
  }

  async _alarmDevices(alarmId: string) {
    return alarmDevices.call(this, true, alarmId)
  }

  async setAlarmState(alarmId: string, armState: string, areaIds?: string[]) {
    return setAlarmState.call(this, false, alarmId, armState, areaIds)
  }

  async _setAlarmState(alarmId: string, armState: string, areaIds?: string[]) {
    return setAlarmState.call(this, true, alarmId, armState, areaIds)
  }

  /* ------------------------------ Other methods ---------------------------- */
  async pins(lockId: string) {
    return pins.call(this, false, lockId)
  }

  async _pins(lockId: string) {
    return pins.call(this, true, lockId)
  }

  async capabilities(serialNumber: string) {
    return capabilities.call(this, false, serialNumber)
  }

  async _capabilities(serialNumber: string) {
    return capabilities.call(this, true, serialNumber)
  }

  /* --------------------------------- Events --------------------------------- */
  async subscribe(lockId: any, callback: any) {
    return subscribe.call(this, lockId, callback, false)
  }

  async _subscribe(lockId: any, callback: any) {
    return subscribe.call(this, lockId, callback, true) // true keeps the session alive
  }

  addSimpleProps(obj: { state?: any, lockID?: any, status?: any, doorState?: any, info?: any }) {
    // Adds .state and .lockID to obj
    const { status, doorState, info } = obj
    obj.state = {}
    if (status) {
      obj.state.locked = status === 'kAugLockState_Locked' || status === 'locked'
      obj.state.unlocked = status === 'kAugLockState_Unlocked' || status === 'unlocked'
      obj.state.locking = status === 'kAugLockState_Locking' || status === 'locking'
      obj.state.unlocking = status === 'kAugLockState_Unlocking' || status === 'unlocking'
    }
    if (doorState) {
      obj.state.open
        = doorState === 'kAugDoorState_Open'
          || doorState === 'kAugLockDoorState_Open'
          || doorState === 'open'
      obj.state.closed
        = doorState === 'kAugDoorState_Closed'
          || doorState === 'kAugLockDoorState_Closed'
          || doorState === 'closed'
    }
    if (info?.lockID) {
      obj.lockID = info.lockID
    }
  }

  /* ----------------------------- Static methods ----------------------------- */
  static addSimpleProps(config: config, obj: { state?: any, lockID?: any, status?: any, doorState?: any, info?: any }) {
    return new August(config).addSimpleProps(obj)
  }

  static async authorize(config: config) {
    return new August(config).authorize()
  }

  static async validate(config: config, code: string) {
    return new August(config).validate(code)
  }

  static async locks(config: config) {
    return new August(config).locks()
  }

  static async details(config: config, lockId: string) {
    return new August(config).details(lockId)
  }

  static async status(config: config, lockId: string) {
    return new August(config).status(lockId)
  }

  static async lock(config: config, lockId: string) {
    return new August(config).lock(lockId)
  }

  static async unlock(config: config, lockId: string) {
    return new August(config).unlock(lockId)
  }

  static async unlatch(config: config, lockId: string) {
    return new August(config).unlatch(lockId)
  }

  static async subscribe(config: config, lockId: string, callback?: any) {
    return new August(config).subscribe(lockId, callback)
  }

  // Async operations
  static async lockAsync(config: config, lockId: string, hyperBridge?: boolean) {
    return new August(config).lockAsync(lockId, hyperBridge)
  }

  static async unlockAsync(config: config, lockId: string, hyperBridge?: boolean) {
    return new August(config).unlockAsync(lockId, hyperBridge)
  }

  static async unlatchAsync(config: config, lockId: string, hyperBridge?: boolean) {
    return new August(config).unlatchAsync(lockId, hyperBridge)
  }

  static async statusAsync(config: config, lockId: string, hyperBridge?: boolean) {
    return new August(config).statusAsync(lockId, hyperBridge)
  }

  // WebSocket methods
  static async addWebSocketSubscription(config: config) {
    return new August(config).addWebSocketSubscription()
  }

  static async getWebSocketSubscriptions(config: config, subscriberId?: string) {
    return new August(config).getWebSocketSubscriptions(subscriberId)
  }

  static async deleteWebSocketSubscription(config: config, subscriberId: string) {
    return new August(config).deleteWebSocketSubscription(subscriberId)
  }

  // House methods
  static async houses(config: config) {
    return new August(config).houses()
  }

  static async houseDetails(config: config, houseId: string) {
    return new August(config).houseDetails(houseId)
  }

  static async houseActivities(config: config, houseId: string, limit?: number) {
    return new August(config).houseActivities(houseId, limit)
  }

  static async houseTemperature(config: config, houseId: string) {
    return new August(config).houseTemperature(houseId)
  }

  // User methods
  static async user(config: config) {
    return new August(config).user()
  }

  // Doorbell methods
  static async doorbells(config: config) {
    return new August(config).doorbells()
  }

  static async doorbellDetails(config: config, doorbellId: string) {
    return new August(config).doorbellDetails(doorbellId)
  }

  static async wakeupDoorbell(config: config, doorbellId: string) {
    return new August(config).wakeupDoorbell(doorbellId)
  }

  // Alarm methods
  static async alarms(config: config) {
    return new August(config).alarms()
  }

  static async alarmDevices(config: config, alarmId: string) {
    return new August(config).alarmDevices(alarmId)
  }

  static async setAlarmState(config: config, alarmId: string, armState: string, areaIds?: string[]) {
    return new August(config).setAlarmState(alarmId, armState, areaIds)
  }

  // Other methods
  static async pins(config: config, lockId: string) {
    return new August(config).pins(lockId)
  }

  static async capabilities(config: config, serialNumber: string) {
    return new August(config).capabilities(serialNumber)
  }
}

export default August
