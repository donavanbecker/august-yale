/* Copyright(C) 2024, homebridge-plugins (https://github.com/homebridge-plugins). All rights reserved.
 *
 * async-operations.ts: August-Yale API async lock operations.
 */

/**
 * Queue a remote lock operation asynchronously
 * @param lockId - Lock ID to operate on
 * @param hyperBridge - Whether to use hyper bridge parameter for faster operations
 * @returns Operation ID for tracking
 */
async function lockAsync(this: any, lockId: string, hyperBridge: boolean = true): Promise<any> {
  try {
    const url = hyperBridge
      ? `/remoteoperate/${lockId}/lock?v=2.3.1&type=async&connection=persistent`
      : `/remoteoperate/${lockId}/lock?v=2.3.1&type=async`

    const response = await this.put(url, null)
    return response?.body
  } catch (error) {
    console.error('Error queuing async lock operation:', error)
    return undefined
  } finally {
    this.end()
  }
}

/**
 * Queue a remote unlock operation asynchronously
 * @param lockId - Lock ID to operate on
 * @param hyperBridge - Whether to use hyper bridge parameter for faster operations
 * @returns Operation ID for tracking
 */
async function unlockAsync(this: any, lockId: string, hyperBridge: boolean = true): Promise<any> {
  try {
    const url = hyperBridge
      ? `/remoteoperate/${lockId}/unlock?v=2.3.1&type=async&connection=persistent`
      : `/remoteoperate/${lockId}/unlock?v=2.3.1&type=async`

    const response = await this.put(url, null)
    return response?.body
  } catch (error) {
    console.error('Error queuing async unlock operation:', error)
    return undefined
  } finally {
    this.end()
  }
}

/**
 * Queue a remote unlatch operation asynchronously
 * @param lockId - Lock ID to operate on
 * @param hyperBridge - Whether to use hyper bridge parameter for faster operations
 * @returns Operation ID for tracking
 */
async function unlatchAsync(this: any, lockId: string, hyperBridge: boolean = true): Promise<any> {
  try {
    const url = hyperBridge
      ? `/remoteoperate/${lockId}/unlatch?v=2.3.1&type=async&connection=persistent`
      : `/remoteoperate/${lockId}/unlatch?v=2.3.1&type=async`

    const response = await this.put(url, null)
    return response?.body
  } catch (error) {
    console.error('Error queuing async unlatch operation:', error)
    return undefined
  } finally {
    this.end()
  }
}

/**
 * Queue a remote status check asynchronously
 * @param lockId - Lock ID to check status for
 * @param hyperBridge - Whether to use hyper bridge parameter for faster operations
 * @returns Operation ID for tracking
 */
async function statusAsync(this: any, lockId: string, hyperBridge: boolean = true): Promise<any> {
  try {
    const url = hyperBridge
      ? `/remoteoperate/${lockId}/status?v=2.3.1&type=async&intent=wakeup&connection=persistent`
      : `/remoteoperate/${lockId}/status?v=2.3.1&type=async&intent=wakeup`

    const response = await this.put(url, null)
    return response?.body
  } catch (error) {
    console.error('Error queuing async status operation:', error)
    return undefined
  } finally {
    this.end()
  }
}

export { lockAsync, statusAsync, unlatchAsync, unlockAsync }
export default lockAsync
