/* Copyright(C) 2024, homebridge-plugins (https://github.com/homebridge-plugins). All rights reserved.
 *
 * unlatch.ts: August-Yale API unlatch operation endpoint.
 */

/**
 * Unlatch a lock (for locks that support this feature)
 * @param lockId - Lock ID to unlatch
 * @returns Operation result
 */
async function unlatch(this: any, lockId: string): Promise<any> {
  try {
    const response = await this.put(`/remoteoperate/${lockId}/unlatch`, null)

    if (response?.body) {
      // Add simple state properties for consistency
      this.addSimpleProps(response.body)
    }

    return response?.body
  } catch (error) {
    console.error('Error unlatching lock:', error)
    return undefined
  } finally {
    this.end()
  }
}

export default unlatch
