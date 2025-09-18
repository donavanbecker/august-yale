import type { config, TinyOptions, TinyResult } from './types.js'

/* Copyright(C) 2024, homebridge-plugins (https://github.com/homebridge-plugins). All rights reserved.
 *
 * index.ts: august-yale API registration.
 */
import tiny from 'tiny-json-http'

import authorize from './methods/authorize.js'
import details from './methods/details.js'
import lockUnlock from './methods/lock-unlock.js'
import locks from './methods/locks.js'
import status from './methods/status.js'
import subscribe from './methods/subscribe.js'
import validate from './methods/validate.js'
import unlatch from './methods/unlatch.js'
import houses, { houseDetails, houseActivities, houseTemperature } from './methods/houses.js'
import user from './methods/users.js'
import doorbells, { doorbellDetails, wakeupDoorbell } from './methods/doorbells.js'
import alarms, { alarmDevices, setAlarmState } from './methods/alarms.js'
import pins from './methods/pins.js'
import capabilities from './methods/capabilities.js'
import addWebSocketSubscription, { deleteWebSocketSubscription, getWebSocketSubscriptions } from './methods/websocket.js'
import lockAsync, { statusAsync, unlatchAsync, unlockAsync } from './methods/async-operations.js'
import session from './util/session.js'
import setup from './util/setup.js'
import { BASE_URLS, Brand } from './settings.js'

// Export exceptions for external use
export { BridgeError, InvalidAuth, RateLimitError, TimeoutError, YaleApiError } from './exceptions.js'
export { Brand } from './settings.js'

interface FetchOptions extends TinyOptions {
  method: keyof typeof tiny
}

class August {
  config: config
  token: any
  constructor(config: config) {
    this.config = setup(config)
  }

  async fetch({ method, ...params }: FetchOptions): Promise<TinyResult> {
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
    if (!params.url.startsWith(API_URL)) {
      if (!params.url.startsWith('/')) {
        params.url = `/${params.url}`
      }
      params.url = API_URL + params.url
    }

    // console.log('REQUEST', method, params)
    const res = await tiny[method](params)
    // console.log('RESPONSE', res)
    return res
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

  end() {
    // End the session (called automatically in every method below except where noted)
    this.token = null
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
