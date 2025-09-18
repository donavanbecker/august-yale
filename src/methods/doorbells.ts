/* Copyright(C) 2024, homebridge-plugins (https://github.com/homebridge-plugins). All rights reserved.
 *
 * doorbells.ts: August-Yale API doorbell-related endpoints.
 */

import { BRAND_CAPABILITIES } from '../settings.js'

/**
 * Get user's doorbells
 * @param keepSession - Whether to keep the session alive after this call
 * @returns Doorbells data
 */
async function doorbells(this: any, keepSession: boolean): Promise<any> {
  try {
    // Check if brand supports doorbells
    const brandCapabilities = BRAND_CAPABILITIES[this.config.brand]
    if (!brandCapabilities?.supportsDoorbells) {
      return []
    }

    const response = await this.get('/users/doorbells/mine')
    return response?.body
  } catch (error) {
    console.error('Error fetching doorbells:', error)
    return undefined
  } finally {
    if (!keepSession) {
      this.end()
    }
  }
}

/**
 * Get doorbell details by ID
 * @param keepSession - Whether to keep the session alive after this call
 * @param doorbellId - Doorbell ID to get details for
 * @returns Doorbell details
 */
async function doorbellDetails(this: any, keepSession: boolean, doorbellId: string): Promise<any> {
  try {
    const response = await this.get(`/doorbells/${doorbellId}`)
    return response?.body
  } catch (error) {
    console.error('Error fetching doorbell details:', error)
    return undefined
  } finally {
    if (!keepSession) {
      this.end()
    }
  }
}

/**
 * Wake up a doorbell
 * @param keepSession - Whether to keep the session alive after this call
 * @param doorbellId - Doorbell ID to wake up
 * @returns Success status
 */
async function wakeupDoorbell(this: any, keepSession: boolean, doorbellId: string): Promise<any> {
  try {
    const response = await this.put(`/doorbells/${doorbellId}/wakeup`, null)
    return response?.body
  } catch (error) {
    console.error('Error waking up doorbell:', error)
    return undefined
  } finally {
    if (!keepSession) {
      this.end()
    }
  }
}

export { doorbellDetails, doorbells, wakeupDoorbell }
export default doorbells
