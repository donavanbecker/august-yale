/* Copyright(C) 2024, homebridge-plugins (https://github.com/homebridge-plugins). All rights reserved.
 *
 * houses.ts: August-Yale API house-related endpoints.
 */

/**
 * Get user's houses
 * @param keepSession - Whether to keep the session alive after this call
 * @returns Houses data
 */
async function houses(this: any, keepSession: boolean): Promise<any> {
  try {
    const response = await this.get('/users/houses/mine')
    return response?.body
  } catch (error) {
    console.error('Error fetching houses:', error)
    return undefined
  } finally {
    if (!keepSession) {
      this.end()
    }
  }
}

/**
 * Get house details by ID
 * @param keepSession - Whether to keep the session alive after this call
 * @param houseId - House ID to get details for
 * @returns House details
 */
async function houseDetails(this: any, keepSession: boolean, houseId: string): Promise<any> {
  try {
    const response = await this.get(`/houses/${houseId}`)
    return response?.body
  } catch (error) {
    console.error('Error fetching house details:', error)
    return undefined
  } finally {
    if (!keepSession) {
      this.end()
    }
  }
}

/**
 * Get house activities
 * @param keepSession - Whether to keep the session alive after this call
 * @param houseId - House ID to get activities for
 * @param limit - Maximum number of activities to return (default: 8)
 * @returns House activities
 */
async function houseActivities(this: any, keepSession: boolean, houseId: string, limit: number = 8): Promise<any> {
  try {
    const response = await this.get(`/houses/${houseId}/activities?limit=${limit}`)
    return response?.body?.events || response?.body
  } catch (error) {
    console.error('Error fetching house activities:', error)
    return undefined
  } finally {
    if (!keepSession) {
      this.end()
    }
  }
}

/**
 * Get house temperature
 * @param keepSession - Whether to keep the session alive after this call
 * @param houseId - House ID to get temperature for
 * @returns House temperature data
 */
async function houseTemperature(this: any, keepSession: boolean, houseId: string): Promise<any> {
  try {
    const response = await this.get(`/houses/${houseId}/temperature`)
    return response?.body
  } catch (error) {
    console.error('Error fetching house temperature:', error)
    return undefined
  } finally {
    if (!keepSession) {
      this.end()
    }
  }
}

export { houseActivities, houseDetails, houses, houseTemperature }
export default houses
