/* Copyright(C) 2024, homebridge-plugins (https://github.com/homebridge-plugins). All rights reserved.
 *
 * alarms.ts: August-Yale API alarm-related endpoints.
 */

import { BRAND_CAPABILITIES } from '../settings.js'

/**
 * Get user's alarms
 * @param keepSession - Whether to keep the session alive after this call
 * @returns Alarms data
 */
async function alarms(this: any, keepSession: boolean): Promise<any> {
  try {
    // Check if brand supports alarms
    const brandCapabilities = BRAND_CAPABILITIES[this.config.brand]
    if (!brandCapabilities?.supportsAlarms) {
      return []
    }

    const response = await this.get('/users/alarms/mine')
    return response?.body
  } catch (error) {
    console.error('Error fetching alarms:', error)
    return undefined
  } finally {
    if (!keepSession) {
      this.end()
    }
  }
}

/**
 * Get alarm devices
 * @param keepSession - Whether to keep the session alive after this call
 * @param alarmId - Alarm ID to get devices for
 * @returns Alarm devices
 */
async function alarmDevices(this: any, keepSession: boolean, alarmId: string): Promise<any> {
  try {
    // Check if brand supports alarms
    const brandCapabilities = BRAND_CAPABILITIES[this.config.brand]
    if (!brandCapabilities?.supportsAlarms) {
      return []
    }

    const response = await this.get(`/alarms/${alarmId}/devices`)
    return response?.body
  } catch (error) {
    console.error('Error fetching alarm devices:', error)
    return undefined
  } finally {
    if (!keepSession) {
      this.end()
    }
  }
}

/**
 * Set alarm state (arm/disarm)
 * @param keepSession - Whether to keep the session alive after this call
 * @param alarmId - Alarm ID to control
 * @param armState - Arm state: 'arm_away', 'arm_stay', 'disarm'
 * @param areaIds - Area IDs to arm/disarm (optional)
 * @returns Alarm state response
 */
async function setAlarmState(this: any, keepSession: boolean, alarmId: string, armState: string, areaIds?: string[]): Promise<any> {
  try {
    // Check if brand supports alarms
    const brandCapabilities = BRAND_CAPABILITIES[this.config.brand]
    if (!brandCapabilities?.supportsAlarms) {
      return undefined
    }

    const data = areaIds ? { areaIDs: areaIds } : {}
    const response = await this.put(`/alarms/${alarmId}/state/${armState}`, data)
    return response?.body
  } catch (error) {
    console.error('Error setting alarm state:', error)
    return undefined
  } finally {
    if (!keepSession) {
      this.end()
    }
  }
}

export { alarmDevices, alarms, setAlarmState }
export default alarms
