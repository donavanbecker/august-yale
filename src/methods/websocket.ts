/* Copyright(C) 2024, homebridge-plugins (https://github.com/homebridge-plugins). All rights reserved.
 *
 * websocket.ts: August-Yale API WebSocket subscription endpoints.
 */

/**
 * Add a WebSocket subscription for real-time updates
 * @param keepSession - Whether to keep the session alive after this call
 * @returns WebSocket subscription details
 */
async function addWebSocketSubscription(this: any, keepSession: boolean): Promise<any> {
  try {
    const data = {
      scopes: ['lock'],
    }
    const response = await this.post('/websocket/subscribers', data)
    return response?.body
  } catch (error) {
    console.error('Error adding WebSocket subscription:', error)
    return undefined
  } finally {
    if (!keepSession) {
      this.end()
    }
  }
}

/**
 * Get WebSocket subscriptions
 * @param keepSession - Whether to keep the session alive after this call
 * @param subscriberId - Subscriber ID to get details for (optional)
 * @returns WebSocket subscription details or list
 */
async function getWebSocketSubscriptions(this: any, keepSession: boolean, subscriberId?: string): Promise<any> {
  try {
    const endpoint = subscriberId
      ? `/websocket/subscribers/${subscriberId}`
      : '/websocket/subscribers'
    const response = await this.get(endpoint)
    return response?.body
  } catch (error) {
    console.error('Error getting WebSocket subscriptions:', error)
    return undefined
  } finally {
    if (!keepSession) {
      this.end()
    }
  }
}

/**
 * Delete a WebSocket subscription
 * @param keepSession - Whether to keep the session alive after this call
 * @param subscriberId - Subscriber ID to delete
 * @returns Success status
 */
async function deleteWebSocketSubscription(this: any, keepSession: boolean, subscriberId: string): Promise<any> {
  try {
    const response = await this.delete(`/websocket/subscribers/${subscriberId}`)
    return response?.body
  } catch (error) {
    console.error('Error deleting WebSocket subscription:', error)
    return undefined
  } finally {
    if (!keepSession) {
      this.end()
    }
  }
}

export { addWebSocketSubscription, deleteWebSocketSubscription, getWebSocketSubscriptions }
export default addWebSocketSubscription
