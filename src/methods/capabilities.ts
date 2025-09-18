/* Copyright(C) 2024, homebridge-plugins (https://github.com/homebridge-plugins). All rights reserved.
 *
 * capabilities.ts: August-Yale API device capabilities endpoints.
 */

/**
 * Get device capabilities
 * @param keepSession - Whether to keep the session alive after this call
 * @param serialNumber - Device serial number
 * @returns Device capabilities
 */
async function capabilities(this: any, keepSession: boolean, serialNumber: string): Promise<any> {
  try {
    const response = await this.get(`/devices/capabilities?serialNumber=${serialNumber}&topLevelHost=true`)
    return response?.body
  } catch (error) {
    console.error('Error fetching device capabilities:', error)
    return undefined
  } finally {
    if (!keepSession) {
      this.end()
    }
  }
}

export default capabilities
