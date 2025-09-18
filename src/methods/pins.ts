/* Copyright(C) 2024, homebridge-plugins (https://github.com/homebridge-plugins). All rights reserved.
 *
 * pins.ts: August-Yale API pin-related endpoints.
 */

/**
 * Get lock pins
 * @param keepSession - Whether to keep the session alive after this call
 * @param lockId - Lock ID to get pins for
 * @returns Lock pins data
 */
async function pins(this: any, keepSession: boolean, lockId: string): Promise<any> {
  try {
    const response = await this.get(`/locks/${lockId}/pins`)
    // Return the loaded pins if available, otherwise return full response
    return response?.body?.loaded || response?.body
  } catch (error) {
    console.error('Error fetching lock pins:', error)
    return undefined
  } finally {
    if (!keepSession) {
      this.end()
    }
  }
}

export default pins
